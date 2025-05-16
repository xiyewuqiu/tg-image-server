/**
 * 用户图片管理相关功能
 * 升级版 - 增强用户体验和功能
 */

// 全局变量
let currentPage = 1;
let totalPages = 1;
let currentImages = [];
let currentTags = [];
let currentEditingImageId = null;
let allTags = new Set(); // 存储所有标签
let currentSortMethod = 'newest'; // 默认排序方式
let currentTagFilter = ''; // 当前标签过滤器
let selectedImages = new Set(); // 存储选中的图片ID
let isSelectionMode = false; // 是否处于选择模式

// 初始化仪表盘
function initDashboard() {
    // 加载用户图片
    loadUserImages();

    // 初始化搜索功能
    initSearch();

    // 初始化排序功能
    initSortFilter();

    // 初始化编辑模态框
    initEditModal();

    // 初始化图片查看器
    initImageViewer();

    // 初始化批量操作功能
    initBatchOperations();

    // 初始化复制链接功能
    new ClipboardJS('#copyEditLink').on('success', function(e) {
        const button = e.trigger;
        const originalHTML = button.innerHTML;

        button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
        `;

        setTimeout(() => {
            button.innerHTML = originalHTML;
        }, 2000);
    });
}

// 加载用户图片
async function loadUserImages(page = 1, query = '', tag = '') {
    try {
        const imageGrid = document.getElementById('imageGrid');
        const emptyState = document.getElementById('emptyState');
        const pagination = document.getElementById('pagination');

        // 显示加载状态
        imageGrid.innerHTML = '<div class="loading-text">加载中...</div>';

        // 构建API URL
        let url = `/api/user/images?page=${page}`;
        if (query) {
            url += `&search=${encodeURIComponent(query)}`;
        }
        if (tag) {
            url += `&tag=${encodeURIComponent(tag)}`;
        }

        // 发送请求
        const response = await fetch(url, {
            headers: getAuthHeader()
        });

        if (!response.ok) {
            throw new Error('获取图片失败');
        }

        const data = await response.json();
        let images = data.files || [];

        // 更新分页信息
        if (data.pagination) {
            currentPage = data.pagination.page;
            totalPages = data.pagination.totalPages;
        }

        // 应用排序
        images = sortImages(images, currentSortMethod);

        // 应用标签过滤
        if (currentTagFilter && !tag) {
            images = images.filter(img =>
                img.tags && img.tags.includes(currentTagFilter)
            );
        }

        // 保存当前图片列表
        currentImages = images;

        // 收集所有标签
        collectAllTags(images);

        // 更新统计信息
        updateStatistics(data);

        // 检查是否有图片
        if (currentImages.length === 0) {
            imageGrid.innerHTML = '';
            emptyState.style.display = 'block';
            pagination.style.display = 'none';
            return;
        }

        // 隐藏空状态
        emptyState.style.display = 'none';

        // 渲染图片
        renderImages(currentImages);

        // 渲染分页
        renderPagination();

        // 渲染标签过滤器
        renderTagFilters();
    } catch (error) {
        console.error('加载图片错误:', error);
        document.getElementById('imageGrid').innerHTML = `
            <div class="error-message">
                加载图片失败: ${error.message}
                <button onclick="loadUserImages()" class="retry-btn">重试</button>
            </div>
        `;
    }
}

// 收集所有标签
function collectAllTags(images) {
    allTags.clear();
    images.forEach(image => {
        if (image.tags && Array.isArray(image.tags)) {
            image.tags.forEach(tag => allTags.add(tag));
        }
    });
}

// 更新统计信息
function updateStatistics(data) {
    // 总图片数
    const totalImages = document.getElementById('totalImages');
    totalImages.textContent = data.pagination ? data.pagination.total : currentImages.length;

    // 总存储空间
    const totalSize = document.getElementById('totalSize');
    let sizeSum = 0;
    currentImages.forEach(img => {
        sizeSum += img.fileSize || 0;
    });
    totalSize.textContent = formatFileSize(sizeSum);

    // 最近上传数量（7天内）
    const recentUploads = document.getElementById('recentUploads');
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const recentCount = currentImages.filter(img => img.uploadTime > oneWeekAgo).length;
    recentUploads.textContent = recentCount;
}

// 排序图片
function sortImages(images, method) {
    const sortedImages = [...images];

    switch (method) {
        case 'newest':
            sortedImages.sort((a, b) => b.uploadTime - a.uploadTime);
            break;
        case 'oldest':
            sortedImages.sort((a, b) => a.uploadTime - b.uploadTime);
            break;
        case 'name':
            sortedImages.sort((a, b) => a.fileName.localeCompare(b.fileName));
            break;
        case 'size':
            sortedImages.sort((a, b) => b.fileSize - a.fileSize);
            break;
        default:
            // 默认按最新上传排序
            sortedImages.sort((a, b) => b.uploadTime - a.uploadTime);
    }

    return sortedImages;
}

// 渲染图片
function renderImages(images) {
    const imageGrid = document.getElementById('imageGrid');
    imageGrid.innerHTML = '';

    images.forEach(image => {
        const card = document.createElement('div');
        card.className = 'image-card';
        card.dataset.id = image.id;

        // 如果图片被选中，添加选中样式
        if (selectedImages.has(image.id)) {
            card.classList.add('selected');
        }

        // 格式化文件大小
        const fileSize = formatFileSize(image.fileSize);

        // 格式化上传时间
        const uploadDate = new Date(image.uploadTime).toLocaleDateString();
        const uploadTime = new Date(image.uploadTime).toLocaleTimeString();

        // 创建标签HTML
        const tagsHtml = image.tags && image.tags.length > 0
            ? `<div class="image-tags">
                ${image.tags.map(tag => `<span class="image-tag" data-tag="${tag}">${tag}</span>`).join('')}
               </div>`
            : '';

        card.innerHTML = `
            ${isSelectionMode ? `
            <div class="image-select">
                <input type="checkbox" class="image-checkbox" id="check-${image.id}" ${selectedImages.has(image.id) ? 'checked' : ''}>
                <label for="check-${image.id}" class="image-checkbox-label"></label>
            </div>
            ` : ''}
            <div class="image-preview" data-id="${image.id}" data-url="${image.url}">
                <img src="${image.url}" alt="${image.fileName}" loading="lazy">
                <div class="image-zoom-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        <line x1="11" y1="8" x2="11" y2="14"></line>
                        <line x1="8" y1="11" x2="14" y2="11"></line>
                    </svg>
                </div>
            </div>
            <div class="image-info">
                <div class="image-name" title="${image.fileName}">${image.fileName}</div>
                <div class="image-meta">
                    <span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
                            <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
                            <line x1="6" y1="6" x2="6.01" y2="6"></line>
                            <line x1="6" y1="18" x2="6.01" y2="18"></line>
                        </svg>
                        ${fileSize}
                    </span>
                    <span title="${uploadDate} ${uploadTime}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        ${uploadDate}
                    </span>
                </div>
                ${tagsHtml}
            </div>
            <div class="image-actions">
                <button class="image-btn copy-btn" data-clipboard-text="${window.location.origin}${image.url}" title="复制图片链接">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    复制
                </button>
                <button class="image-btn edit-btn" data-id="${image.id}" title="编辑图片信息">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    编辑
                </button>
                <button class="image-btn delete-btn" data-id="${image.id}" title="删除图片">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                    删除
                </button>
            </div>
        `;

        imageGrid.appendChild(card);
    });

    // 初始化复制按钮
    new ClipboardJS('.copy-btn').on('success', function(e) {
        const originalText = e.trigger.innerHTML;
        e.trigger.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            已复制!
        `;
        setTimeout(() => {
            e.trigger.innerHTML = originalText;
        }, 2000);
    });

    // 添加编辑按钮事件
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // 防止触发卡片选择
            const imageId = btn.dataset.id;
            openEditModal(imageId);
        });
    });

    // 添加删除按钮事件
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // 防止触发卡片选择
            const imageId = btn.dataset.id;
            confirmDeleteImage(imageId);
        });
    });

    // 添加图片预览点击事件
    document.querySelectorAll('.image-preview').forEach(preview => {
        preview.addEventListener('click', (e) => {
            if (isSelectionMode) {
                e.stopPropagation(); // 在选择模式下，点击预览不打开查看器
                return;
            }
            const imageId = preview.dataset.id;
            const imageUrl = preview.dataset.url;
            openImageViewer(imageId, imageUrl);
        });
    });

    // 添加标签点击事件
    document.querySelectorAll('.image-tag').forEach(tag => {
        tag.addEventListener('click', (e) => {
            e.stopPropagation(); // 防止触发父元素的点击事件
            const tagName = tag.dataset.tag;
            filterByTag(tagName);
        });
    });

    // 添加图片卡片选择事件
    if (isSelectionMode) {
        document.querySelectorAll('.image-card').forEach(card => {
            card.addEventListener('click', () => {
                const imageId = card.dataset.id;
                toggleImageSelection(imageId, card);
            });
        });

        document.querySelectorAll('.image-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                e.stopPropagation(); // 防止触发卡片点击事件
                const imageId = checkbox.id.replace('check-', '');
                const card = document.querySelector(`.image-card[data-id="${imageId}"]`);
                toggleImageSelection(imageId, card, checkbox.checked);
            });
        });
    }
}

// 切换图片选择状态
function toggleImageSelection(imageId, card, forceState) {
    const isSelected = forceState !== undefined ? forceState : !selectedImages.has(imageId);

    if (isSelected) {
        selectedImages.add(imageId);
        card.classList.add('selected');
        const checkbox = document.getElementById(`check-${imageId}`);
        if (checkbox) checkbox.checked = true;
    } else {
        selectedImages.delete(imageId);
        card.classList.remove('selected');
        const checkbox = document.getElementById(`check-${imageId}`);
        if (checkbox) checkbox.checked = false;
    }

    // 更新选中计数
    updateSelectedCount();

    // 如果没有选中的图片，退出选择模式
    if (selectedImages.size === 0 && isSelectionMode) {
        toggleSelectionMode();
    }
}

// 渲染分页
function renderPagination() {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    if (totalPages <= 1) {
        pagination.style.display = 'none';
        return;
    }

    pagination.style.display = 'flex';

    // 上一页按钮
    const prevBtn = document.createElement('button');
    prevBtn.className = `page-btn ${currentPage === 1 ? 'disabled' : ''}`;
    prevBtn.textContent = '上一页';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            loadUserImages(currentPage - 1);
        }
    });
    pagination.appendChild(prevBtn);

    // 页码按钮
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.addEventListener('click', () => {
            if (i !== currentPage) {
                loadUserImages(i);
            }
        });
        pagination.appendChild(pageBtn);
    }

    // 下一页按钮
    const nextBtn = document.createElement('button');
    nextBtn.className = `page-btn ${currentPage === totalPages ? 'disabled' : ''}`;
    nextBtn.textContent = '下一页';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            loadUserImages(currentPage + 1);
        }
    });
    pagination.appendChild(nextBtn);
}

// 初始化搜索功能
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');

    searchBtn.addEventListener('click', () => {
        const query = searchInput.value.trim();
        loadUserImages(1, query);
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            loadUserImages(1, query);
        }
    });

    // 添加输入实时搜索（延迟执行）
    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const query = searchInput.value.trim();
            if (query.length >= 2 || query.length === 0) {
                loadUserImages(1, query);
            }
        }, 500);
    });
}

// 初始化排序功能
function initSortFilter() {
    const sortSelect = document.getElementById('sortSelect');

    sortSelect.addEventListener('change', () => {
        currentSortMethod = sortSelect.value;

        // 重新排序当前图片并渲染
        const sortedImages = sortImages(currentImages, currentSortMethod);
        currentImages = sortedImages;
        renderImages(currentImages);
    });
}

// 渲染标签过滤器
function renderTagFilters() {
    const tagFilters = document.getElementById('tagFilters');

    // 如果没有标签，隐藏过滤器
    if (allTags.size === 0) {
        tagFilters.style.display = 'none';
        return;
    }

    tagFilters.style.display = 'flex';

    // 只显示前5个最常用的标签
    const tagArray = Array.from(allTags);
    const topTags = tagArray.slice(0, 5);

    // 创建标签过滤器HTML
    let filtersHtml = '<span class="filter-label">标签:</span>';

    // 添加"全部"选项
    filtersHtml += `<span class="image-tag ${currentTagFilter === '' ? 'active' : ''}" data-tag="">全部</span>`;

    // 添加标签选项
    topTags.forEach(tag => {
        filtersHtml += `<span class="image-tag ${currentTagFilter === tag ? 'active' : ''}" data-tag="${tag}">${tag}</span>`;
    });

    tagFilters.innerHTML = filtersHtml;

    // 添加标签点击事件
    tagFilters.querySelectorAll('.image-tag').forEach(tag => {
        tag.addEventListener('click', () => {
            const tagName = tag.dataset.tag;
            filterByTag(tagName);
        });
    });
}

// 按标签过滤
function filterByTag(tag) {
    currentTagFilter = tag;
    loadUserImages(1, '', tag);

    // 更新标签过滤器UI
    document.querySelectorAll('#tagFilters .image-tag').forEach(el => {
        if (el.dataset.tag === tag) {
            el.classList.add('active');
        } else {
            el.classList.remove('active');
        }
    });
}

// 初始化图片查看器
function initImageViewer() {
    const imageViewer = document.getElementById('imageViewer');
    const closeViewer = document.getElementById('closeViewer');
    const viewerImage = document.getElementById('viewerImage');

    // 关闭查看器
    closeViewer.addEventListener('click', () => {
        imageViewer.classList.remove('active');
        setTimeout(() => {
            imageViewer.style.display = 'none';
        }, 300);
    });

    // 点击背景关闭查看器
    imageViewer.addEventListener('click', (e) => {
        if (e.target === imageViewer) {
            closeViewer.click();
        }
    });

    // 键盘事件
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && imageViewer.classList.contains('active')) {
            closeViewer.click();
        }
    });
}

// 打开图片查看器
function openImageViewer(imageId, imageUrl) {
    const imageViewer = document.getElementById('imageViewer');
    const viewerImage = document.getElementById('viewerImage');
    const viewerInfo = document.getElementById('viewerInfo');

    // 查找图片信息
    const image = currentImages.find(img => img.id === imageId);
    if (!image) return;

    // 设置图片
    viewerImage.src = imageUrl;
    viewerImage.alt = image.fileName;

    // 设置信息
    viewerInfo.textContent = `${image.fileName} (${formatFileSize(image.fileSize)})`;

    // 显示查看器
    imageViewer.style.display = 'flex';
    setTimeout(() => {
        imageViewer.classList.add('active');
    }, 10);
}

// 初始化编辑模态框
function initEditModal() {
    const editModal = document.getElementById('editModal');
    const closeModal = document.getElementById('closeModal');
    const cancelEdit = document.getElementById('cancelEdit');
    const saveEdit = document.getElementById('saveEdit');
    const tagInput = document.getElementById('tagInput');
    const tagsInput = document.getElementById('tagsInput');
    const tagsSuggestions = document.getElementById('tagsSuggestions');

    // 关闭模态框
    function closeEditModal() {
        editModal.classList.remove('active');
        setTimeout(() => {
            editModal.style.display = 'none';
            currentEditingImageId = null;
            currentTags = [];

            // 清空标签输入
            const tagElements = tagsInput.querySelectorAll('.tag');
            tagElements.forEach(tag => tag.remove());

            // 清空其他字段
            document.getElementById('editFileName').value = '';
            document.getElementById('editImagePreview').src = '';
            document.getElementById('editUploadTime').textContent = '-';
            document.getElementById('editFileSize').textContent = '-';
            document.getElementById('editImageLink').value = '';

            // 隐藏标签建议
            tagsSuggestions.style.display = 'none';
        }, 300);
    }

    // 关闭按钮
    closeModal.addEventListener('click', closeEditModal);
    cancelEdit.addEventListener('click', closeEditModal);

    // 点击模态框外部关闭
    window.addEventListener('click', (e) => {
        if (e.target === editModal) {
            closeEditModal();
        }
    });

    // 标签输入处理
    tagInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();

            const tag = tagInput.value.trim();
            if (tag && !currentTags.includes(tag)) {
                addTag(tag);
                tagInput.value = '';
                tagsSuggestions.style.display = 'none';
            }
        }
    });

    // 标签输入时显示建议
    tagInput.addEventListener('input', () => {
        const inputValue = tagInput.value.trim().toLowerCase();

        if (inputValue.length < 1) {
            tagsSuggestions.style.display = 'none';
            return;
        }

        // 过滤标签建议
        const filteredTags = Array.from(allTags)
            .filter(tag => tag.toLowerCase().includes(inputValue) && !currentTags.includes(tag))
            .slice(0, 5); // 最多显示5个建议

        if (filteredTags.length > 0) {
            tagsSuggestions.innerHTML = '';
            filteredTags.forEach(tag => {
                const suggestion = document.createElement('div');
                suggestion.className = 'tag-suggestion';
                suggestion.textContent = tag;
                suggestion.addEventListener('click', () => {
                    addTag(tag);
                    tagInput.value = '';
                    tagsSuggestions.style.display = 'none';
                });
                tagsSuggestions.appendChild(suggestion);
            });
            tagsSuggestions.style.display = 'block';
        } else {
            tagsSuggestions.style.display = 'none';
        }
    });

    // 点击其他地方时隐藏标签建议
    document.addEventListener('click', (e) => {
        if (!tagsSuggestions.contains(e.target) && e.target !== tagInput) {
            tagsSuggestions.style.display = 'none';
        }
    });

    // 保存编辑
    saveEdit.addEventListener('click', async () => {
        if (!currentEditingImageId) return;

        const fileName = document.getElementById('editFileName').value.trim();

        if (!fileName) {
            alert('文件名不能为空');
            return;
        }

        try {
            const response = await fetch(`/api/user/images/${currentEditingImageId}`, {
                method: 'PUT',
                headers: {
                    ...getAuthHeader(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fileName,
                    tags: currentTags
                })
            });

            if (!response.ok) {
                throw new Error('更新图片信息失败');
            }

            // 关闭模态框
            closeEditModal();

            // 重新加载图片
            loadUserImages(currentPage);
        } catch (error) {
            console.error('更新图片信息错误:', error);
            alert(`更新失败: ${error.message}`);
        }
    });

    // 初始化复制链接功能
    new ClipboardJS('#copyEditLink').on('success', function(e) {
        const button = e.trigger;
        const originalHTML = button.innerHTML;

        button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
        `;

        setTimeout(() => {
            button.innerHTML = originalHTML;
        }, 2000);
    });
}

// 打开编辑模态框
function openEditModal(imageId) {
    const editModal = document.getElementById('editModal');
    const editFileName = document.getElementById('editFileName');
    const editImagePreview = document.getElementById('editImagePreview');
    const editUploadTime = document.getElementById('editUploadTime');
    const editFileSize = document.getElementById('editFileSize');
    const editImageLink = document.getElementById('editImageLink');
    const tagsInput = document.getElementById('tagsInput');
    const tagInput = document.getElementById('tagInput');

    // 查找图片
    const image = currentImages.find(img => img.id === imageId);
    if (!image) return;

    // 设置当前编辑的图片ID
    currentEditingImageId = imageId;

    // 设置图片预览
    editImagePreview.src = image.url;
    editImagePreview.alt = image.fileName;

    // 设置文件名
    editFileName.value = image.fileName;

    // 设置上传时间
    const uploadDate = new Date(image.uploadTime).toLocaleDateString();
    const uploadTime = new Date(image.uploadTime).toLocaleTimeString();
    editUploadTime.textContent = `${uploadDate} ${uploadTime}`;

    // 设置文件大小
    editFileSize.textContent = formatFileSize(image.fileSize);

    // 设置图片链接
    editImageLink.value = `${window.location.origin}${image.url}`;

    // 清空标签
    const tagElements = tagsInput.querySelectorAll('.tag');
    tagElements.forEach(tag => tag.remove());

    // 设置标签
    currentTags = image.tags || [];
    currentTags.forEach(tag => {
        addTagElement(tag);
    });

    // 显示模态框
    editModal.style.display = 'flex';
    setTimeout(() => {
        editModal.classList.add('active');
    }, 10);
}

// 添加标签
function addTag(tag) {
    if (!tag || currentTags.includes(tag)) return;

    currentTags.push(tag);
    addTagElement(tag);
}

// 添加标签元素
function addTagElement(tag) {
    const tagsInput = document.getElementById('tagsInput');
    const tagInput = document.getElementById('tagInput');

    const tagElement = document.createElement('div');
    tagElement.className = 'tag';
    tagElement.innerHTML = `
        ${tag}
        <span class="tag-remove" data-tag="${tag}">&times;</span>
    `;

    // 添加删除标签事件
    tagElement.querySelector('.tag-remove').addEventListener('click', () => {
        removeTag(tag);
        tagElement.remove();
    });

    tagsInput.insertBefore(tagElement, tagInput);
}

// 删除标签
function removeTag(tag) {
    const index = currentTags.indexOf(tag);
    if (index !== -1) {
        currentTags.splice(index, 1);
    }
}

// 确认删除图片
function confirmDeleteImage(imageId) {
    if (confirm('确定要删除这张图片吗？此操作不可撤销。')) {
        deleteImage(imageId);
    }
}

// 删除图片
async function deleteImage(imageId) {
    try {
        const response = await fetch(`/api/user/images/${imageId}`, {
            method: 'DELETE',
            headers: getAuthHeader()
        });

        if (!response.ok) {
            throw new Error('删除图片失败');
        }

        // 重新加载图片
        loadUserImages(currentPage);
    } catch (error) {
        console.error('删除图片错误:', error);
        alert(`删除失败: ${error.message}`);
    }
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 初始化批量操作功能
function initBatchOperations() {
    const batchToolbar = document.getElementById('batchToolbar');
    const batchCopy = document.getElementById('batchCopy');
    const batchAddTag = document.getElementById('batchAddTag');
    const batchDelete = document.getElementById('batchDelete');
    const batchCancel = document.getElementById('batchCancel');

    // 添加长按事件以进入选择模式
    let longPressTimer;
    document.querySelectorAll('.image-card').forEach(card => {
        card.addEventListener('mousedown', () => {
            if (isSelectionMode) return; // 已经在选择模式中

            longPressTimer = setTimeout(() => {
                toggleSelectionMode();
                const imageId = card.dataset.id;
                toggleImageSelection(imageId, card, true);
            }, 500); // 500ms长按
        });

        card.addEventListener('mouseup', () => {
            clearTimeout(longPressTimer);
        });

        card.addEventListener('mouseleave', () => {
            clearTimeout(longPressTimer);
        });
    });

    // 添加批量操作按钮事件
    batchCancel.addEventListener('click', () => {
        toggleSelectionMode(false);
    });

    // 批量复制链接
    batchCopy.addEventListener('click', () => {
        if (selectedImages.size === 0) return;

        const links = [];
        selectedImages.forEach(id => {
            const image = currentImages.find(img => img.id === id);
            if (image) {
                links.push(`${window.location.origin}${image.url}`);
            }
        });

        if (links.length > 0) {
            const textarea = document.createElement('textarea');
            textarea.value = links.join('\n');
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);

            alert(`已复制 ${links.length} 个链接到剪贴板`);
        }
    });

    // 批量添加标签
    batchAddTag.addEventListener('click', () => {
        if (selectedImages.size === 0) return;

        // 创建一个简单的输入对话框
        const tag = prompt('请输入要添加的标签:');
        if (!tag || tag.trim() === '') return;

        batchAddTagToImages(tag.trim());
    });

    // 批量删除
    batchDelete.addEventListener('click', () => {
        if (selectedImages.size === 0) return;

        if (confirm(`确定要删除选中的 ${selectedImages.size} 张图片吗？此操作不可撤销。`)) {
            batchDeleteImages();
        }
    });
}

// 切换选择模式
function toggleSelectionMode(forceState) {
    isSelectionMode = forceState !== undefined ? forceState : !isSelectionMode;
    const batchToolbar = document.getElementById('batchToolbar');

    if (isSelectionMode) {
        // 进入选择模式
        batchToolbar.classList.add('active');
        document.body.classList.add('selection-mode');

        // 清空已选择的图片
        selectedImages.clear();
        updateSelectedCount();

        // 重新渲染图片以显示复选框
        renderImages(currentImages);
    } else {
        // 退出选择模式
        batchToolbar.classList.remove('active');
        document.body.classList.remove('selection-mode');

        // 清空已选择的图片
        selectedImages.clear();

        // 重新渲染图片以隐藏复选框
        renderImages(currentImages);
    }
}

// 更新选中计数
function updateSelectedCount() {
    const selectedCount = document.getElementById('selectedCount');
    selectedCount.textContent = selectedImages.size;
}

// 批量添加标签到图片
async function batchAddTagToImages(tag) {
    if (selectedImages.size === 0 || !tag) return;

    let successCount = 0;
    let failCount = 0;

    // 显示加载状态
    alert(`正在处理 ${selectedImages.size} 张图片...`);

    // 逐个处理图片
    for (const imageId of selectedImages) {
        try {
            const image = currentImages.find(img => img.id === imageId);
            if (!image) continue;

            // 检查标签是否已存在
            const currentImageTags = image.tags || [];
            if (currentImageTags.includes(tag)) {
                successCount++;
                continue; // 标签已存在，跳过
            }

            // 添加新标签
            const newTags = [...currentImageTags, tag];

            const response = await fetch(`/api/user/images/${imageId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
                body: JSON.stringify({
                    fileName: image.fileName,
                    tags: newTags
                })
            });

            if (response.ok) {
                successCount++;
            } else {
                failCount++;
            }
        } catch (error) {
            console.error(`为图片 ${imageId} 添加标签失败:`, error);
            failCount++;
        }
    }

    // 显示结果
    if (failCount === 0) {
        alert(`成功为 ${successCount} 张图片添加标签`);
    } else {
        alert(`成功: ${successCount} 张, 失败: ${failCount} 张`);
    }

    // 重新加载图片列表
    loadUserImages(currentPage);

    // 退出选择模式
    toggleSelectionMode(false);
}

// 批量删除图片
async function batchDeleteImages() {
    if (selectedImages.size === 0) return;

    let successCount = 0;
    let failCount = 0;

    // 显示加载状态
    alert(`正在删除 ${selectedImages.size} 张图片...`);

    // 逐个删除图片
    for (const imageId of selectedImages) {
        try {
            const response = await fetch(`/api/user/images/${imageId}`, {
                method: 'DELETE',
                headers: getAuthHeader()
            });

            if (response.ok) {
                successCount++;
            } else {
                failCount++;
            }
        } catch (error) {
            console.error(`删除图片 ${imageId} 失败:`, error);
            failCount++;
        }
    }

    // 显示结果
    if (failCount === 0) {
        alert(`成功删除 ${successCount} 张图片`);
    } else {
        alert(`成功: ${successCount} 张, 失败: ${failCount} 张`);
    }

    // 重新加载图片列表
    loadUserImages(currentPage);

    // 退出选择模式
    toggleSelectionMode(false);
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
    // 检查是否在仪表盘页面
    if (window.location.pathname === '/dashboard.html') {
        // 初始化仪表盘
        initDashboard();
    }
});

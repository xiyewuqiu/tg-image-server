// 页面加载动画
window.addEventListener('load', () => {
    const pageLoader = document.getElementById('pageLoader');
    const progressBar = document.getElementById('loaderProgressBar');

    // 模拟加载进度
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);

            // 完成加载后延迟一小段时间再隐藏加载器
            setTimeout(() => {
                pageLoader.classList.add('loaded');

                // 页面内容淡入动画
                document.querySelectorAll('.fade-in-element').forEach((el, index) => {
                    setTimeout(() => {
                        el.classList.add('visible');
                    }, 100 * index);
                });
            }, 400);
        }
        progressBar.style.width = `${progress}%`;
    }, 100);
});

// 获取认证头
function getAuthHeader() {
    const token = localStorage.getItem('token');
    const isLoggedIn = !!token;
    console.log('认证状态:', isLoggedIn ? '已登录' : '未登录');
    if (isLoggedIn) {
        console.log('添加认证头');
        return { 'Authorization': `Bearer ${token}` };
    } else {
        console.log('无认证头');
        return {};
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // 初始化页面加载动画
    initPageLoader();

    // 初始化主题
    initTheme();

    // 初始化剪贴板功能
    initClipboard();

    // 初始化上传功能
    initUpload();

    // 初始化图片预览
    initImagePreview();

    // 初始化滚动动画
    initScrollAnimations();

    // 初始化平滑滚动
    initSmoothScroll();

    // 初始化粒子背景
    initParticles();

    // 初始化3D卡片效果
    init3DCards();

    // 初始化滚动进度条
    initScrollProgress();

    // 初始化返回顶部按钮
    initBackToTop();

    // 初始化移动端菜单
    initMobileMenu();
});

// 滚动动画初始化
function initScrollAnimations() {
    // 添加滚动动画类
    const animationElements = [
        { selector: '.feature-card:nth-child(1)', animation: 'from-left' },
        { selector: '.feature-card:nth-child(2)', animation: 'fade-in' },
        { selector: '.feature-card:nth-child(3)', animation: 'from-right' },
        { selector: '.hero-content', animation: 'scale-in' },
        { selector: '.upload-area', animation: 'from-bottom' }
    ];

    // 添加动画类
    animationElements.forEach(item => {
        document.querySelectorAll(item.selector).forEach(el => {
            el.classList.add('scroll-animation', item.animation);
        });
    });

    // 检查元素是否在视口中
    function checkInView() {
        const elements = document.querySelectorAll('.scroll-animation');
        const windowHeight = window.innerHeight;

        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect();
            // 当元素进入视口时添加可见类
            if (elementPosition.top < windowHeight * 0.9) {
                element.classList.add('visible');
            }
        });
    }

    // 初始检查
    setTimeout(checkInView, 100);

    // 滚动时检查
    window.addEventListener('scroll', checkInView);
}

// 平滑滚动初始化
function initSmoothScroll() {
    // 为所有内部锚点链接添加平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // 为所有内部页面链接添加平滑跳转
    document.querySelectorAll('a:not([href^="#"]):not([href^="http"])').forEach(link => {
        link.addEventListener('click', function(e) {
            // 排除外部链接和特殊链接
            const href = this.getAttribute('href');
            if (href && !href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
                e.preventDefault();
                smoothPageTransition(href);
            }
        });
    });
}

// 页面加载初始化
function initPageLoader() {
    // 为主要元素添加淡入动画类
    const fadeElements = [
        '.hero',
        '.upload-container',
        '.features',
        '.footer'
    ];

    fadeElements.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
            el.classList.add('fade-in-element');
        });
    });
}

// 主题切换功能
function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const darkIcon = document.getElementById('darkIcon');
    const lightIcon = document.getElementById('lightIcon');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

    // 检查本地存储中的主题设置
    const savedTheme = localStorage.getItem('theme');

    // 根据保存的主题或系统偏好设置初始主题
    if (savedTheme === 'dark' || (!savedTheme && prefersDarkScheme.matches)) {
        document.body.classList.add('dark-mode');
        darkIcon.style.display = 'none';
        lightIcon.style.display = 'block';
    } else {
        document.body.classList.remove('dark-mode');
        darkIcon.style.display = 'block';
        lightIcon.style.display = 'none';
    }

    // 主题切换事件
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');

        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark');
            darkIcon.style.display = 'none';
            lightIcon.style.display = 'block';
        } else {
            localStorage.setItem('theme', 'light');
            darkIcon.style.display = 'block';
            lightIcon.style.display = 'none';
        }
    });

    // 监听系统主题变化
    prefersDarkScheme.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            if (e.matches) {
                document.body.classList.add('dark-mode');
                darkIcon.style.display = 'none';
                lightIcon.style.display = 'block';
            } else {
                document.body.classList.remove('dark-mode');
                darkIcon.style.display = 'block';
                lightIcon.style.display = 'none';
            }
        }
    });
}

// 剪贴板功能
function initClipboard() {
    const clipboard = new ClipboardJS('.copy-btn');

    clipboard.on('success', (e) => {
        const originalText = e.trigger.textContent;
        e.trigger.textContent = '已复制！';
        e.trigger.classList.add('success');

        setTimeout(() => {
            e.trigger.textContent = originalText;
            e.trigger.classList.remove('success');
        }, 2000);

        e.clearSelection();
    });

    clipboard.on('error', (e) => {
        const originalText = e.trigger.textContent;
        e.trigger.textContent = '复制失败';
        e.trigger.classList.add('error');

        setTimeout(() => {
            e.trigger.textContent = originalText;
            e.trigger.classList.remove('error');
        }, 2000);
    });
}

// 上传功能
function initUpload() {
    // 获取元素
    const dropArea = document.getElementById('dropArea');
    const fileInput = document.getElementById('fileInput');
    const uploadStatus = document.getElementById('uploadStatus');
    const resultContainer = document.getElementById('resultContainer');
    const previewImage = document.getElementById('previewImage');
    const directLink = document.getElementById('directLink');
    const htmlCode = document.getElementById('htmlCode');
    const mdCode = document.getElementById('mdCode');
    const uploadAgainBtn = document.getElementById('uploadAgainBtn');

    // 点击上传区域触发文件选择
    dropArea.addEventListener('click', (e) => {
        // 防止点击到上传状态区域时触发文件选择
        if (e.target !== uploadStatus && !uploadStatus.contains(e.target)) {
            fileInput.click();
        }
    });

    // 监听拖拽事件
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // 拖拽效果
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => {
            dropArea.classList.add('drag-over');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => {
            dropArea.classList.remove('drag-over');
        }, false);
    });

    // 处理文件拖放
    dropArea.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files.length) {
            fileInput.files = files;
            handleFiles(files);
        }
    });

    // 监听文件选择
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length) {
            handleFiles(fileInput.files);
        }
    });

    // 处理多个文件上传
    function handleFiles(files) {
        // 检查所有文件是否都是图片
        for (let i = 0; i < files.length; i++) {
            if (!files[i].type.match('image.*')) {
                showError('请确保所有上传的文件都是图片！');
                return;
            }

            // 文件大小检查 (限制为10MB)
            if (files[i].size > 10 * 1024 * 1024) {
                showError('每个图片大小不能超过10MB！');
                return;
            }
        }

        // 显示上传中状态
        uploadStatus.innerHTML = `<span class="loading-text">正在上传${files.length}张图片</span>`;
        uploadStatus.className = 'upload-status loading';

        // 准备表单数据
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('file', files[i]);
        }

        // 获取认证头
        const headers = getAuthHeader();
        console.log('上传请求 - 认证头:', headers);

        // 发送请求
        fetch('/upload', {
            method: 'POST',
            headers: headers, // 添加认证头
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('上传失败，服务器响应错误');
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                throw new Error(data.error);
            }

            // 上传成功
            uploadStatus.textContent = `上传成功！共${data.length}张图片`;
            uploadStatus.className = 'upload-status success';

            // 显示结果
            showResults(data, files);
        })
        .catch(error => {
            showError(`上传失败: ${error.message}`);
        });
    }

    // 显示错误信息
    function showError(message) {
        uploadStatus.textContent = message;
        uploadStatus.className = 'upload-status error';

        // 震动效果
        dropArea.classList.add('shake');
        setTimeout(() => {
            dropArea.classList.remove('shake');
        }, 500);
    }

    // 显示多个上传结果
    function showResults(results, files) {
        // 获取或创建图片列表容器
        let imageListContainer = document.getElementById('imageListContainer');
        if (!imageListContainer) {
            // 创建图片列表容器
            imageListContainer = document.createElement('div');
            imageListContainer.id = 'imageListContainer';
            imageListContainer.className = 'image-list-container';
            resultContainer.insertBefore(imageListContainer, resultContainer.querySelector('.link-group'));
        } else {
            // 清空现有内容
            imageListContainer.innerHTML = '';
        }

        // 构建基本URL
        const baseUrl = window.location.origin;

        // 如果只有一个图片，仍然使用旧的预览方式
        if (results.length === 1) {
            const fileUrl = baseUrl + results[0].src;

            // 设置图片预览
            previewImage.src = fileUrl;
            previewImage.alt = files[0].name;

            // 设置各种代码
            directLink.value = fileUrl;
            htmlCode.value = `<img src="${fileUrl}" alt="${files[0].name}" />`;
            mdCode.value = `![${files[0].name}](${fileUrl})`;
        } else {
            // 批量上传的情况，创建图片列表
            for (let i = 0; i < results.length; i++) {
                const fileUrl = baseUrl + results[i].src;
                const fileName = files[i] ? files[i].name : `图片${i+1}`;

                // 创建缩略图项
                const imageItem = document.createElement('div');
                imageItem.className = 'image-item';

                // 创建图片元素
                const img = document.createElement('img');
                img.src = fileUrl;
                img.alt = fileName;
                img.addEventListener('click', () => {
                    // 点击单张图片时更新主预览和链接
                    previewImage.src = fileUrl;
                    previewImage.alt = fileName;
                    directLink.value = fileUrl;
                    htmlCode.value = `<img src="${fileUrl}" alt="${fileName}" />`;
                    mdCode.value = `![${fileName}](${fileUrl})`;
                });

                // 添加到容器
                imageItem.appendChild(img);
                imageListContainer.appendChild(imageItem);
            }

            // 默认选中第一张图片
            if (results.length > 0) {
                const firstFileUrl = baseUrl + results[0].src;
                const firstName = files[0] ? files[0].name : '图片1';

                // 设置默认预览
                previewImage.src = firstFileUrl;
                previewImage.alt = firstName;

                // 设置默认代码
                directLink.value = firstFileUrl;
                htmlCode.value = `<img src="${firstFileUrl}" alt="${firstName}" />`;
                mdCode.value = `![${firstName}](${firstFileUrl})`;
            }
        }

        // 隐藏上传区域，显示结果
        dropArea.style.display = 'none';
        resultContainer.style.display = 'block';
    }

    // 再次上传
    uploadAgainBtn.addEventListener('click', () => {
        // 清空文件输入
        fileInput.value = '';
        uploadStatus.textContent = '';
        uploadStatus.className = 'upload-status';

        // 隐藏结果，显示上传区域
        resultContainer.style.display = 'none';
        dropArea.style.display = 'block';
    });
}

// 图片预览功能
function initImagePreview() {
    const previewImage = document.getElementById('previewImage');

    if (previewImage) {
        previewImage.addEventListener('click', () => {
            // 创建全屏预览
            const fullscreenPreview = document.createElement('div');
            fullscreenPreview.className = 'fullscreen-preview';
            fullscreenPreview.innerHTML = `
                <div class="fullscreen-preview-content">
                    <img src="${previewImage.src}" alt="${previewImage.alt}">
                    <button class="close-preview">×</button>
                </div>
            `;

            document.body.appendChild(fullscreenPreview);
            document.body.style.overflow = 'hidden';

            // 获取预览图片元素
            const previewFullImg = fullscreenPreview.querySelector('img');

            // 添加双指缩放功能（移动端）
            let initialPinchDistance = 0;
            let currentScale = 1;

            // 处理双指触摸开始
            previewFullImg.addEventListener('touchstart', (e) => {
                if (e.touches.length === 2) {
                    e.preventDefault();
                    initialPinchDistance = getPinchDistance(e);
                }
            }, { passive: false });

            // 处理双指触摸移动
            previewFullImg.addEventListener('touchmove', (e) => {
                if (e.touches.length === 2) {
                    e.preventDefault();
                    const currentPinchDistance = getPinchDistance(e);

                    if (initialPinchDistance > 0) {
                        const newScale = currentScale * (currentPinchDistance / initialPinchDistance);
                        // 限制缩放范围
                        if (newScale >= 0.5 && newScale <= 3) {
                            currentScale = newScale;
                            previewFullImg.style.transform = `scale(${currentScale})`;
                        }
                    }

                    initialPinchDistance = currentPinchDistance;
                }
            }, { passive: false });

            // 计算双指之间的距离
            function getPinchDistance(e) {
                return Math.hypot(
                    e.touches[0].pageX - e.touches[1].pageX,
                    e.touches[0].pageY - e.touches[1].pageY
                );
            }

            // 双击缩放功能
            let lastTapTime = 0;
            previewFullImg.addEventListener('click', (e) => {
                e.stopPropagation();

                const currentTime = new Date().getTime();
                const tapLength = currentTime - lastTapTime;

                if (tapLength < 300 && tapLength > 0) {
                    // 双击切换缩放
                    if (currentScale === 1) {
                        currentScale = 2;
                    } else {
                        currentScale = 1;
                    }
                    previewFullImg.style.transform = `scale(${currentScale})`;
                    e.preventDefault();
                }

                lastTapTime = currentTime;
            });

            // 添加关闭功能
            fullscreenPreview.addEventListener('click', (e) => {
                if (e.target === fullscreenPreview || e.target.classList.contains('close-preview')) {
                    document.body.removeChild(fullscreenPreview);
                    document.body.style.overflow = '';
                }
            });

            // ESC键关闭
            document.addEventListener('keydown', function escClose(e) {
                if (e.key === 'Escape') {
                    document.body.removeChild(fullscreenPreview);
                    document.body.style.overflow = '';
                    document.removeEventListener('keydown', escClose);
                }
            });
        });
    }
}

// 粒子背景初始化
function initParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;

    const particleCount = 50; // 粒子数量
    const particleColors = ['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)'];

    // 创建粒子
    for (let i = 0; i < particleCount; i++) {
        createParticle(particlesContainer, particleColors);
    }

    // 创建单个粒子
    function createParticle(container, colors) {
        const particle = document.createElement('div');
        particle.className = 'particle';

        // 随机大小
        const size = Math.random() * 5 + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;

        // 随机位置
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        particle.style.left = `${posX}%`;
        particle.style.top = `${posY}%`;

        // 随机颜色
        const colorIndex = Math.floor(Math.random() * colors.length);
        particle.style.backgroundColor = colors[colorIndex];

        // 随机动画
        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * 5;

        // 添加动画
        particle.style.animation = `float ${duration}s ${delay}s infinite linear`;

        // 添加到容器
        container.appendChild(particle);

        // 创建动画关键帧
        const keyframes = `
            @keyframes float {
                0% {
                    transform: translate(0, 0) rotate(0deg);
                    opacity: ${Math.random() * 0.5 + 0.3};
                }
                25% {
                    transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) rotate(${Math.random() * 360}deg);
                    opacity: ${Math.random() * 0.5 + 0.3};
                }
                50% {
                    transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) rotate(${Math.random() * 360}deg);
                    opacity: ${Math.random() * 0.5 + 0.3};
                }
                75% {
                    transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) rotate(${Math.random() * 360}deg);
                    opacity: ${Math.random() * 0.5 + 0.3};
                }
                100% {
                    transform: translate(0, 0) rotate(0deg);
                    opacity: ${Math.random() * 0.5 + 0.3};
                }
            }
        `;

        // 添加样式
        const style = document.createElement('style');
        style.textContent = keyframes;
        document.head.appendChild(style);
    }
}

// 3D卡片效果初始化
function init3DCards() {
    const cards = document.querySelectorAll('.feature-card');

    cards.forEach(card => {
        // 鼠标移动效果
        card.addEventListener('mousemove', handleCardMove);
        // 鼠标离开效果
        card.addEventListener('mouseleave', handleCardLeave);
    });

    // 处理卡片移动
    function handleCardMove(e) {
        const card = this;
        const cardRect = card.getBoundingClientRect();
        const cardContent = card.querySelector('.card-content');

        // 计算鼠标在卡片上的相对位置 (从-1到1)
        const x = ((e.clientX - cardRect.left) / cardRect.width) * 2 - 1;
        const y = ((e.clientY - cardRect.top) / cardRect.height) * 2 - 1;

        // 根据鼠标位置计算旋转角度 (最大5度)
        const rotateY = x * 5;
        const rotateX = -y * 5;

        // 应用3D变换
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0)`;

        // 内容的反向移动，创造视差效果
        if (cardContent) {
            cardContent.style.transform = `translateZ(20px) translateX(${-x * 10}px) translateY(${-y * 10}px)`;
        }

        // 动态光影效果
        const glare = card.querySelector('.card-glare') || createGlare(card);
        const glareOpacity = Math.sqrt(x*x + y*y) * 0.1 + 0.05;
        const glarePosition = {
            x: (x + 1) / 2 * 100,
            y: (y + 1) / 2 * 100
        };

        glare.style.background = `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255,255,255,${glareOpacity}), transparent 50%)`;
    }

    // 处理卡片离开
    function handleCardLeave() {
        const card = this;
        const cardContent = card.querySelector('.card-content');

        // 重置卡片样式
        card.style.transform = '';

        if (cardContent) {
            cardContent.style.transform = '';
        }

        // 重置光影效果
        const glare = card.querySelector('.card-glare');
        if (glare) {
            glare.style.background = 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.03), transparent 50%)';
        }
    }

    // 创建光影效果元素
    function createGlare(card) {
        const glare = document.createElement('div');
        glare.className = 'card-glare';
        glare.style.position = 'absolute';
        glare.style.top = '0';
        glare.style.left = '0';
        glare.style.width = '100%';
        glare.style.height = '100%';
        glare.style.borderRadius = 'inherit';
        glare.style.pointerEvents = 'none';
        glare.style.zIndex = '1';

        card.appendChild(glare);
        return glare;
    }
}

// 滚动进度条初始化
function initScrollProgress() {
    const progressBar = document.getElementById('scrollProgress');
    if (!progressBar) return;

    // 更新进度条
    function updateProgress() {
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercentage = (scrollTop / scrollHeight) * 100;

        progressBar.style.width = `${scrollPercentage}%`;

        // 根据滚动位置调整进度条颜色
        const hue = 220 + (scrollPercentage * 0.4); // 从蓝色到紫色的渐变
        progressBar.style.background = `linear-gradient(to right, hsl(${hue}, 80%, 60%), hsl(${hue + 20}, 80%, 50%))`;
    }

    // 初始更新
    updateProgress();

    // 滚动时更新
    window.addEventListener('scroll', updateProgress);

    // 窗口大小改变时更新
    window.addEventListener('resize', updateProgress);
}

// 返回顶部按钮初始化
function initBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    if (!backToTopBtn) return;

    // 显示/隐藏按钮
    function toggleBackToTopButton() {
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;

        // 当滚动超过300px时显示按钮
        if (scrollTop > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    }

    // 点击返回顶部
    backToTopBtn.addEventListener('click', () => {
        // 平滑滚动到顶部
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // 初始检查
    toggleBackToTopButton();

    // 滚动时检查
    window.addEventListener('scroll', toggleBackToTopButton);
}

// 平滑页面跳转函数
function smoothPageTransition(url) {
    // 获取页面加载动画元素
    const pageLoader = document.getElementById('pageLoader');
    const progressBar = document.getElementById('loaderProgressBar');
    const pageTransition = document.getElementById('pageTransition');

    if (pageLoader && progressBar) {
        // 先显示页面过渡动画
        if (pageTransition) {
            pageTransition.classList.add('active');
        }

        // 重置进度条
        progressBar.style.width = '0%';

        // 显示加载动画
        pageLoader.classList.remove('loaded');

        // 模拟加载进度
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);

                // 完成加载后延迟一小段时间再跳转
                setTimeout(() => {
                    window.location.href = url;
                }, 100);
            }
            progressBar.style.width = `${progress}%`;
        }, 30);
    } else {
        // 如果找不到加载动画元素，直接跳转
        window.location.href = url;
    }
}

// 移动端菜单初始化
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenuCloseBtn = document.getElementById('mobileMenuCloseBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');

    if (!mobileMenuBtn || !mobileMenu) {
        console.error('移动端菜单元素未找到');
        return;
    }

    console.log('初始化移动端菜单');

    // 确保移动菜单按钮可见（在移动设备上）
    if (window.innerWidth <= 768) {
        mobileMenuBtn.style.display = 'flex';
    }

    // 打开菜单
    mobileMenuBtn.addEventListener('click', (e) => {
        console.log('点击菜单按钮');
        e.preventDefault();
        e.stopPropagation();

        // 确保菜单按钮在最上层
        mobileMenuBtn.style.zIndex = '1002';

        // 显示菜单
        mobileMenu.classList.add('active');
        mobileMenuOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // 防止背景滚动
    });

    // 关闭菜单的函数
    const closeMenu = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        mobileMenu.classList.remove('active');
        mobileMenuOverlay.classList.remove('active');
        document.body.style.overflow = ''; // 恢复滚动

        // 延迟一下再重置z-index，避免闪烁
        setTimeout(() => {
            mobileMenuBtn.style.zIndex = '1002';
        }, 300);
    };

    // 关闭按钮点击事件
    if (mobileMenuCloseBtn) {
        mobileMenuCloseBtn.addEventListener('click', (e) => {
            console.log('点击关闭按钮');
            closeMenu(e);
        });
    }

    // 遮罩点击关闭
    if (mobileMenuOverlay) {
        mobileMenuOverlay.addEventListener('click', (e) => {
            console.log('点击遮罩层');
            closeMenu(e);
        });
    }

    // 移动端菜单链接点击后关闭菜单
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            console.log('点击菜单链接:', link.textContent);

            // 如果是内部链接，关闭菜单
            if (!link.getAttribute('href').startsWith('http')) {
                // 延迟一下再跳转，确保菜单关闭动画完成
                e.preventDefault();
                closeMenu();

                setTimeout(() => {
                    window.location.href = link.getAttribute('href');
                }, 300);
            }
        });
    });

    // 监听窗口大小变化，在大屏幕上自动关闭移动菜单，在小屏幕上显示菜单按钮
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            if (mobileMenu.classList.contains('active')) {
                closeMenu();
            }
            mobileMenuBtn.style.display = 'none';
        } else {
            mobileMenuBtn.style.display = 'flex';
        }
    });

    // 添加触摸滑动关闭菜单功能
    let touchStartX = 0;

    mobileMenu.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    mobileMenu.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].screenX;
        const touchDiff = touchEndX - touchStartX;

        // 向右滑动超过50px时关闭菜单
        if (touchDiff > 50) {
            closeMenu();
        }
    }, { passive: true });

    // 初始检查
    if (window.innerWidth <= 768) {
        console.log('移动设备检测到，显示菜单按钮');
        mobileMenuBtn.style.display = 'flex';
    }
}
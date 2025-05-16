/**
 * 用户认证相关功能
 */

// 检查用户是否已登录
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    // 如果没有令牌或用户信息，则未登录
    if (!token || !user) {
        return false;
    }

    // 检查令牌是否过期
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const now = Math.floor(Date.now() / 1000);

        if (payload.exp && payload.exp < now) {
            // 令牌已过期，清除本地存储
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return false;
        }

        return true;
    } catch (error) {
        console.error('令牌解析错误:', error);
        return false;
    }
}

// 获取认证头
function getAuthHeader() {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// 初始化认证状态
function initAuth() {
    // 获取当前页面路径
    const path = window.location.pathname;

    // 检查是否已登录
    const isAuthenticated = checkAuth();

    // 获取用户下拉菜单和登录/注册链接
    const userDropdown = document.getElementById('userDropdown');
    const userDisplayName = document.getElementById('userDisplayName');
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    if (isAuthenticated) {
        // 用户已登录
        const user = JSON.parse(localStorage.getItem('user'));

        // 更新用户显示名称
        if (userDisplayName) {
            userDisplayName.textContent = user.username;
        }

        // 显示用户下拉菜单
        if (userDropdown) {
            userDropdown.style.display = 'block';
        }

        // 更新桌面端导航链接
        navLinks.forEach(link => {
            if (link.textContent === '登录') {
                link.textContent = '我的图片';
                link.href = '/dashboard.html';
            }
        });

        // 更新移动端导航链接
        mobileNavLinks.forEach(link => {
            if (link.textContent === '登录') {
                link.textContent = '我的图片';
                link.href = '/dashboard.html';
            }
        });

        // 添加移动端退出登录链接（如果不存在）
        const mobileNav = document.querySelector('.mobile-nav');
        if (mobileNav && !document.getElementById('mobileLogoutBtn')) {
            const logoutLink = document.createElement('a');
            logoutLink.href = '/';
            logoutLink.id = 'mobileLogoutBtn';
            logoutLink.className = 'mobile-nav-link';
            logoutLink.textContent = '退出登录';
            mobileNav.appendChild(logoutLink);
        }

        // 如果当前页面是登录或注册页面，重定向到首页
        if (path === '/login.html' || path === '/register.html') {
            smoothPageTransition('/');
        }

        // 如果当前页面是仪表盘，但令牌无效，重定向到登录页面
        if (path === '/dashboard.html') {
            validateToken().catch(() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                smoothPageTransition('/login.html');
            });
        }
    } else {
        // 用户未登录

        // 隐藏用户下拉菜单
        if (userDropdown) {
            userDropdown.style.display = 'none';
        }

        // 更新桌面端导航链接
        navLinks.forEach(link => {
            if (link.textContent === '我的图片') {
                link.textContent = '登录';
                link.href = '/login.html';
            }
        });

        // 更新移动端导航链接
        mobileNavLinks.forEach(link => {
            if (link.textContent === '我的图片') {
                link.textContent = '登录';
                link.href = '/login.html';
            }
        });

        // 移除移动端退出登录链接（如果存在）
        const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
        if (mobileLogoutBtn) {
            mobileLogoutBtn.parentNode.removeChild(mobileLogoutBtn);
        }

        // 如果当前页面是仪表盘，重定向到登录页面
        if (path === '/dashboard.html') {
            smoothPageTransition('/login.html');
        }
    }
}

// 验证令牌
async function validateToken() {
    const token = localStorage.getItem('token');

    if (!token) {
        throw new Error('未找到令牌');
    }

    const response = await fetch('/api/auth/me', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('令牌无效');
    }

    const data = await response.json();
    return data;
}

// 登录表单处理
function initLoginForm() {
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // 获取表单数据
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            // 验证输入
            if (!username || !password) {
                showError(loginError, '用户名和密码都是必填项');
                return;
            }

            try {
                // 发送登录请求
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || '登录失败');
                }

                // 保存令牌和用户信息
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                // 重定向到首页
                smoothPageTransition('/');
            } catch (error) {
                showError(loginError, error.message);
            }
        });
    }
}

// 注册表单处理
function initRegisterForm() {
    const registerForm = document.getElementById('registerForm');
    const registerError = document.getElementById('registerError');

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // 获取表单数据
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            // 验证输入
            if (!username || !email || !password || !confirmPassword) {
                showError(registerError, '所有字段都是必填项');
                return;
            }

            if (password !== confirmPassword) {
                showError(registerError, '两次输入的密码不一致');
                return;
            }

            try {
                // 发送注册请求
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, email, password })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || '注册失败');
                }

                // 保存令牌和用户信息
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                // 重定向到首页
                smoothPageTransition('/');
            } catch (error) {
                showError(registerError, error.message);
            }
        });
    }
}

// 退出登录
function initLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');

    // 退出登录函数
    const logout = (e) => {
        e.preventDefault();

        // 清除本地存储
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // 重定向到首页
        smoothPageTransition('/');
    };

    // 桌面端退出按钮
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    // 移动端退出按钮
    if (mobileLogoutBtn) {
        mobileLogoutBtn.addEventListener('click', logout);
    }
}

// 显示错误信息
function showError(element, message) {
    if (element) {
        element.textContent = message;
        element.style.display = 'block';

        // 5秒后自动隐藏
        setTimeout(() => {
            element.style.display = 'none';
        }, 5000);
    }
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
    // 初始化认证状态
    initAuth();

    // 初始化登录表单
    initLoginForm();

    // 初始化注册表单
    initRegisterForm();

    // 初始化退出登录
    initLogout();
});

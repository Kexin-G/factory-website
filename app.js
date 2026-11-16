let currentLang = localStorage.getItem('lang') || 'zh';
let siteData = {};

// 初始化
async function init() {
    updateLangUI();
    try {
        const res = await fetch(`data/${currentLang}.json`);
        siteData = await res.json();
        renderChrome();
        window.addEventListener('hashchange', renderRoute);
        renderRoute();
    } catch (err) {
        document.getElementById('app').innerHTML = '<h2>数据加载失败，请检查 data 文件夹</h2>';
    }
}

function changeLang(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    updateLangUI();
    init(); // 重新加载数据
}

function updateLangUI() {
    document.getElementById('btn-zh').style.background = currentLang === 'zh' ? 'var(--bg)' : 'none';
    document.getElementById('btn-en').style.background = currentLang === 'en' ? 'var(--bg)' : 'none';
}

function renderChrome() {
    document.title = siteData.site.title;
    document.getElementById('brand-name').textContent = siteData.site.name;
    document.getElementById('footer').textContent = siteData.site.footer;
    
    const navHtml = siteData.nav.map(item => 
        `<a href="#${item.path}" data-path="${item.path}">${item.label}</a>`
    ).join('');
    document.getElementById('mainnav').innerHTML = navHtml;
}

function renderRoute() {
    const hash = window.location.hash.slice(1) || '/';
    const app = document.getElementById('app');
    
    // 高亮导航
    document.querySelectorAll('.mainnav a').forEach(a => {
        a.classList.toggle('active', hash.startsWith(a.dataset.path) && a.dataset.path !== '/');
    });

    // 首页
    if (hash === '/') {
        app.innerHTML = `
            <div class="hero">
                <h1>${siteData.home.title}</h1>
                <p>${siteData.home.subtitle}</p>
                <a href="#${siteData.home.ctaLink}" class="btn">${siteData.home.ctaText}</a>
            </div>
            <div class="stats-bar">
                ${siteData.home.stats.map(s => `
                    <div class="stat-item">
                        <h3>${s.value}</h3>
                        <p>${s.label}</p>
                    </div>
                `).join('')}
            </div>
            <div class="grid">
                ${siteData.home.features.map(f => `
                    <div class="card">
                        <div class="card-body">
                            <div class="card-title">${f.title}</div>
                            <div class="card-intro">${f.desc}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        return;
    }

    // 查找页面数据
    const pageData = siteData.pages[hash];
    if (!pageData) {
        app.innerHTML = '<h1>404 - 页面不存在</h1>';
        return;
    }

    // 渲染具体页面 (处理特殊组件：表格、人物、表单)
    let contentHtml = '';
    
    if (pageData.type === 'compare') {
        contentHtml = `
            <h2>${pageData.tableTitle}</h2>
            <table class="compare-table">
                <thead><tr>${pageData.headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
                <tbody>
                    ${pageData.rows.map(row => `
                        <tr>
                            ${row.map((cell, i) => `<td class="${i===0?'highlight':''}">${cell}</td>`).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <div class="prose">${pageData.desc}</div>
        `;
    } else if (pageData.type === 'profile') {
        contentHtml = `
            <div class="prose">${pageData.desc}</div>
            <div class="profile">
                <div class="profile-avatar">👨‍🔬</div>
                <div class="profile-info">
                    <h3>${pageData.name}</h3>
                    <div class="role">${pageData.role}</div>
                    <div class="prose">${pageData.bio}</div>
                    <div class="patent-tags">
                        ${pageData.patents.map(p => `<span class="patent-tag">${p}</span>`).join('')}
                    </div>
                </div>
            </div>
        `;
    } else if (pageData.type === 'form') {
        contentHtml = `
            <div class="prose">${pageData.desc}</div>
            <form action="${pageData.formspreeUrl}" method="POST" style="max-width: 600px; margin-top:30px;">
                <div class="form-group">
                    <label>${currentLang === 'zh' ? '您的姓名' : 'Your Name'}</label>
                    <input type="text" name="name" required>
                </div>
                <div class="form-group">
                    <label>${currentLang === 'zh' ? '公司名称' : 'Company'}</label>
                    <input type="text" name="company">
                </div>
                <div class="form-group">
                    <label>${currentLang === 'zh' ? '联系方式 (邮箱/电话)' : 'Contact Info'}</label>
                    <input type="text" name="contact" required>
                </div>
                <div class="form-group">
                    <label>${currentLang === 'zh' ? '需求描述' : 'Message'}</label>
                    <textarea name="message" required></textarea>
                </div>
                <button type="submit" class="btn">${currentLang === 'zh' ? '发送咨询' : 'Send'}</button>
            </form>
        `;
    } else {
        contentHtml = `<div class="prose">${pageData.content || ''}</div>`;
    }

    app.innerHTML = `
        <div class="page-head">
            <h1>${pageData.title}</h1>
            ${pageData.subtitle ? `<p>${pageData.subtitle}</p>` : ''}
        </div>
        ${contentHtml}
    `;
}

init();

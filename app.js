let currentLang = localStorage.getItem('lang') || 'zh';
let siteData = {};

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
    init(); 
}

function updateLangUI() {
    document.getElementById('btn-zh').style.background = currentLang === 'zh' ? 'var(--primary-light)' : 'none';
    document.getElementById('btn-zh').style.borderColor = currentLang === 'zh' ? 'var(--primary)' : 'var(--line)';
    
    document.getElementById('btn-en').style.background = currentLang === 'en' ? 'var(--primary-light)' : 'none';
    document.getElementById('btn-en').style.borderColor = currentLang === 'en' ? 'var(--primary)' : 'var(--line)';
}

function renderChrome() {
    document.title = siteData.site.title;
    
    const logoImg = document.getElementById('site-logo');
    const fallbackIcon = document.getElementById('fallback-logo');
    if (siteData.site.logo && siteData.site.logo.trim() !== "") {
        logoImg.src = siteData.site.logo;
        logoImg.style.display = 'block';
        fallbackIcon.style.display = 'none';
    } else {
        logoImg.style.display = 'none';
        fallbackIcon.style.display = 'block';
    }

    document.getElementById('brand-name').textContent = siteData.site.name;
    document.getElementById('footer').textContent = siteData.site.footer;
    
    const navHtml = siteData.nav.map(item => 
        `<a href="#${item.path}" data-path="${item.path}">${item.label}</a>`
    ).join('');
    document.getElementById('mainnav').innerHTML = navHtml;
}

// Tab 切换函数
function switchTab(tabId) {
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active');
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
}

function renderRoute() {
    const hash = window.location.hash.slice(1) || '/';
    const app = document.getElementById('app');
    
    document.querySelectorAll('.mainnav a').forEach(a => {
        a.classList.toggle('active', hash.startsWith(a.dataset.path) && a.dataset.path !== '/');
    });

    if (hash === '/') {
        app.innerHTML = `
            <div class="hero">
                <div class="hero-content">
                    <h1>${siteData.home.title}</h1>
                    <p>${siteData.home.subtitle}</p>
                    <a href="#${siteData.home.ctaLink}" class="btn">${siteData.home.ctaText}</a>
                </div>
                <div class="hero-image-wrap">
                    <img src="${siteData.home.heroImage}" alt="Chip Cooling" class="hero-image">
                </div>
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

    const pageData = siteData.pages[hash];
    if (!pageData) {
        app.innerHTML = '<h1>404 - 页面不存在</h1>';
        return;
    }

    let contentHtml = '';
    
    // 1. 应用场景渲染
    if (pageData.type === 'applications') {
        contentHtml = pageData.list.map((item, index) => `
            <div class="app-section">
                <div class="app-img">
                    <img src="${item.image}" alt="${item.title}">
                </div>
                <div class="app-content">
                    <h2>${item.title}</h2>
                    <p>${item.desc}</p>
                    <div class="app-stats">
                        ${item.stats.map(s => `
                            <div class="app-stat-box">
                                <span>${s.label}</span>
                                <strong>${s.value}</strong>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `).join('');
    } 
    // 2. 团队背景渲染
    else if (pageData.type === 'team') {
        contentHtml = `
            <div class="prose">${pageData.desc}</div>
            
            <h2 style="margin-top:40px;">团队构成</h2>
            <div class="team-grid">
                ${pageData.composition.map(c => `
                    <div class="team-card">
                        <h3>${c.title}</h3>
                        <p>${c.desc}</p>
                    </div>
                `).join('')}
            </div>

            <h2 style="margin-top:50px;">首席专家技术背书</h2>
            <div class="profile">
                <div class="profile-avatar">👨‍🔬</div>
                <div class="profile-info">
                    <h3>${pageData.expert.name}</h3>
                    <div class="role">${pageData.expert.role}</div>
                    <div class="prose">${pageData.expert.bio}</div>
                    <div class="patent-tags">
                        ${pageData.expert.patents.map(p => `<span class="patent-tag">${p}</span>`).join('')}
                    </div>
                </div>
            </div>
        `;
    } 
    // 3. 商务合作渲染 (Tab)
    else if (pageData.type === 'business') {
        contentHtml = `
            <div class="tab-container">
                <div class="tab-nav">
                    <button class="tab-btn active" data-tab="tab-cases" onclick="switchTab('tab-cases')">合作案例</button>
                    <button class="tab-btn" data-tab="tab-sample" onclick="switchTab('tab-sample')">申请样品</button>
                    <button class="tab-btn" data-tab="tab-contact" onclick="switchTab('tab-contact')">联系方式</button>
                </div>
                
                <!-- Tab 1: 合作案例 -->
                <div id="tab-cases" class="tab-pane active">
                    <div class="case-grid">
                        ${pageData.cases.map(c => `
                            <div class="case-card">
                                <h3>${c.title}</h3>
                                <div class="client">客户类型：${c.client}</div>
                                <p>${c.desc}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Tab 2: 申请样品 -->
                <div id="tab-sample" class="tab-pane">
                    <div class="prose">${pageData.sampleDesc}</div>
                    <form action="${pageData.formspreeUrl}" method="POST" style="max-width: 600px; margin-top:20px;">
                        <div class="form-group">
                            <label>您的姓名</label>
                            <input type="text" name="name" required>
                        </div>
                        <div class="form-group">
                            <label>公司名称</label>
                            <input type="text" name="company" required>
                        </div>
                        <div class="form-group">
                            <label>联系方式 (邮箱/电话/微信)</label>
                            <input type="text" name="contact" required>
                        </div>
                        <div class="form-group">
                            <label>目标应用场景</label>
                            <select name="scene">
                                <option value="汽车">新能源汽车</option>
                                <option value="光伏">光伏与储能</option>
                                <option value="工业">工业驱动与风电</option>
                                <option value="其他">其他/轨交航空</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>预计月用量</label>
                            <input type="text" name="volume" placeholder="如：1000平方米/月">
                        </div>
                        <button type="submit" class="btn">提交申请</button>
                    </form>
                </div>

                <!-- Tab 3: 联系方式 -->
                <div id="tab-contact" class="tab-pane">
                    <div class="contact-info">
                        <div class="contact-item">
                            <div class="icon">📧</div>
                            <div class="detail">
                                <h4>商务合作邮箱</h4>
                                <p>${pageData.email}</p>
                            </div>
                        </div>
                        <div class="contact-item">
                            <div class="icon">📞</div>
                            <div class="detail">
                                <h4>联系电话</h4>
                                <p>${pageData.phone}</p>
                            </div>
                        </div>
                        <div class="contact-item">
                            <div class="icon">💬</div>
                            <div class="detail">
                                <h4>微信 / WhatsApp</h4>
                                <p>${pageData.wechat}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
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

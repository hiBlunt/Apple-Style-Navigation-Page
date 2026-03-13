document.addEventListener('DOMContentLoaded', () => {
    let config = null;
    let isEditMode = false;
    let authHash = '';

    const mainContent = document.getElementById('mainContent');
    const searchInput = document.getElementById('searchInput');
    const editBtn = document.getElementById('editBtn');
    
    // Modals
    const editModal = document.getElementById('editModal');
    const passwordModal = document.getElementById('passwordModal');
    const categoryModal = document.getElementById('categoryModal');
    const closeBtns = document.querySelectorAll('.close-modal, .close-modal-btn');
    
    // Forms
    const editForm = document.getElementById('editForm');
    const categoryForm = document.getElementById('categoryForm');
    const adminPasswordInput = document.getElementById('adminPassword');
    const confirmPasswordBtn = document.getElementById('confirmPassword');
    const cancelPasswordBtn = document.getElementById('cancelPassword');

    // Built-in heavy data to show off the high density layout
    const DEFAULT_CONFIG = {
        "settings": {
            "title": "Navigation",
            "passwordHash": "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
            "featuredTitle": "Discover"
        },
        "categories": [
            {
                "id": "cat-featured",
                "title": "Discover",
                "isFeatured": true,
                "links": [
                    { "id": "f-1", "title": "Apple", "description": "Innovative hardware, software, and services.", "url": "https://www.apple.com", "icon": "https://www.apple.com/favicon.ico" },
                    { "id": "f-2", "title": "GitHub", "description": "Where the world builds software.", "url": "https://github.com", "icon": "https://github.githubassets.com/favicons/favicon.svg" },
                    { "id": "f-3", "title": "YouTube", "description": "Enjoy the videos and music you love.", "url": "https://youtube.com", "icon": "https://www.youtube.com/favicon.ico" }
                ]
            },
            {
                "id": "cat-work",
                "title": "Productivity",
                "links": [
                    { "id": "w-1", "title": "Gmail", "url": "https://mail.google.com", "icon": "https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico" },
                    { "id": "w-2", "title": "Drive", "url": "https://drive.google.com", "icon": "https://ssl.gstatic.com/images/branding/product/2x/drive_2020q4_32dp.png" },
                    { "id": "w-3", "title": "Notion", "url": "https://notion.so", "icon": "https://www.notion.so/images/favicon.ico" },
                    { "id": "w-4", "title": "Slack", "url": "https://slack.com", "icon": "https://a.slack-edge.com/80588/marketing/img/meta/favicon-32.png" },
                    { "id": "w-5", "title": "Figma", "url": "https://figma.com", "icon": "https://static.figma.com/app/icon/1/favicon.ico" },
                    { "id": "w-6", "title": "Linear", "url": "https://linear.app", "icon": "https://linear.app/favicon.ico" },
                    { "id": "w-7", "title": "Trello", "url": "https://trello.com", "icon": "https://trello.com/favicon.ico" }
                ]
            },
            {
                "id": "cat-dev",
                "title": "Developer Tools",
                "links": [
                    { "id": "d-1", "title": "StackOverflow", "url": "https://stackoverflow.com", "icon": "https://cdn.sstatic.net/Sites/stackoverflow/Img/favicon.ico" },
                    { "id": "d-2", "title": "MDN Docs", "url": "https://developer.mozilla.org", "icon": "https://developer.mozilla.org/favicon-48x48.cbbd161b.png" },
                    { "id": "d-3", "title": "Vercel", "url": "https://vercel.com", "icon": "https://assets.vercel.com/image/upload/q_auto/front/favicon/vercel/180x180.png" },
                    { "id": "d-4", "title": "AWS", "url": "https://aws.amazon.com", "icon": "https://a0.awsstatic.com/libra-css/images/logos/aws_smile-header-desktop-en-white_59x35.png" },
                    { "id": "d-5", "title": "Docker", "url": "https://docker.com", "icon": "https://www.docker.com/wp-content/uploads/2022/03/Moby-logo.png" },
                    { "id": "d-6", "title": "NPM", "url": "https://npmjs.com", "icon": "https://static-production.npmjs.com/b0f1a8318363185cc2ea6a40ac23eeb2.png" },
                    { "id": "d-7", "title": "CodePen", "url": "https://codepen.io", "icon": "https://cpwebassets.codepen.io/assets/favicon/favicon-aec34940fbc1a6e787974dcd360f2c6b63348d4b1f4e06c77743096d55480f33.ico" },
                    { "id": "d-8", "title": "V2EX", "url": "https://www.v2ex.com", "icon": "https://www.v2ex.com/static/favicon.ico" },
                    { "id": "d-9", "title": "ChatGPT", "url": "https://chat.openai.com", "icon": "https://chat.openai.com/favicon.ico" }
                ]
            },
            {
                "id": "cat-social",
                "title": "Social & Entertainment",
                "links": [
                    { "id": "s-1", "title": "Twitter", "url": "https://twitter.com", "icon": "https://abs.twimg.com/favicons/twitter.2.ico" },
                    { "id": "s-2", "title": "Bilibili", "url": "https://bilibili.com", "icon": "https://www.bilibili.com/favicon.ico" },
                    { "id": "s-3", "title": "Reddit", "url": "https://reddit.com", "icon": "https://www.redditstatic.com/desktop2x/img/favicon/favicon-32x32.png" },
                    { "id": "s-4", "title": "Instagram", "url": "https://instagram.com", "icon": "https://www.instagram.com/static/images/ico/favicon.ico/36b30072740c.ico" },
                    { "id": "s-5", "title": "Weibo", "url": "https://weibo.com", "icon": "https://weibo.com/favicon.ico" },
                    { "id": "s-6", "title": "Netflix", "url": "https://netflix.com", "icon": "https://assets.nflxext.com/us/ffe/siteui/common/icons/nficon2016.ico" },
                    { "id": "s-7", "title": "Twitch", "url": "https://twitch.tv", "icon": "https://static.twitchcdn.net/assets/favicon-32-e29e246c157142c94346.png" }
                ]
            }
        ]
    };

    // Load initial data
    async function loadConfig() {
        try {
            // Try fetching the live config from the server to bypass cache
            const response = await fetch('config.json?v=' + Date.now());
            if (response.ok) {
                config = await response.json();
                render();
                return;
            }
        } catch (err) {
            console.warn('Could not load live config.json from server.', err);
        }

        // Fallback to local storage
        const localConfig = localStorage.getItem('navConfig_v2');
        if (localConfig) {
            try {
                config = JSON.parse(localConfig);
                render();
                return;
            } catch (e) {
                console.error('Local storage config corrupt, falling back');
            }
        }

        // Final fallback to defaults
        config = DEFAULT_CONFIG;
        render();
    }

    // Save data
    async function saveConfig() {
        // Optimistic UI update
        render(searchInput.value);
        
        // Save locally instantly
        localStorage.setItem('navConfig_v2', JSON.stringify(config));
        
        // Push to server
        try {
            const response = await fetch('/api/save-config', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': authHash
                },
                body: JSON.stringify(config)
            });
            if (!response.ok) {
                console.warn('Backend rejected save or is unavaliable, saved only to local storage.', response.status);
            }
        } catch (error) {
            console.warn('Server save failed. Is the Go server active?', error);
        }
    }

    function sha256Fallback(message) {
        const rightRotate = (value, amount) => (value >>> amount) | (value << (32 - amount));
        const mathPow = Math.pow;
        const maxWord = mathPow(2, 32);
        const words = [];
        const messageBytes = unescape(encodeURIComponent(message));
        const bitLength = messageBytes.length * 8;
        const hash = [];
        const k = [];
        let primeCounter = 0;

        const isComposite = {};
        for (let candidate = 2; primeCounter < 64; candidate++) {
            if (!isComposite[candidate]) {
                for (let i = 0; i < 313; i += candidate) {
                    isComposite[i] = candidate;
                }
                hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
                k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
            }
        }

        for (let i = 0; i < messageBytes.length; i++) {
            words[i >> 2] |= messageBytes.charCodeAt(i) << ((3 - i) % 4) * 8;
        }

        words[bitLength >> 5] |= 0x80 << (24 - bitLength % 32);
        words[((bitLength + 64 >> 9) << 4) + 15] = bitLength;

        for (let j = 0; j < words.length; j += 16) {
            const w = words.slice(j, j + 16);
            const oldHash = hash.slice(0);

            for (let i = 0; i < 64; i++) {
                const w15 = w[i - 15];
                const w2 = w[i - 2];
                const a = hash[0];
                const e = hash[4];
                const temp1 = hash[7]
                    + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25))
                    + ((e & hash[5]) ^ (~e & hash[6]))
                    + k[i]
                    + (w[i] = i < 16 ? w[i] : (
                        w[i - 16]
                        + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3))
                        + w[i - 7]
                        + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))
                    ) | 0);
                const temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22))
                    + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));

                hash.pop();
                hash.unshift((temp1 + temp2) | 0);
                hash[4] = (hash[4] + temp1) | 0;
            }

            for (let i = 0; i < 8; i++) {
                hash[i] = (hash[i] + oldHash[i]) | 0;
            }
        }

        let result = '';
        for (let i = 0; i < 8; i++) {
            for (let j = 3; j >= 0; j--) {
                const byte = (hash[i] >> (j * 8)) & 255;
                result += byte.toString(16).padStart(2, '0');
            }
        }

        return result;
    }

    async function sha256(message) {
        if (window.crypto && window.crypto.subtle && window.TextEncoder) {
            const msgBuffer = new TextEncoder().encode(message);
            const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        }

        return sha256Fallback(message);
    }

    // Generate fallback SVG icon
    function getFallbackIcon(letter) {
        const char = letter ? letter[0].toUpperCase() : '?';
        return `data:image/svg+xml;charset=utf-8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" rx="18" fill="#e5e5ea"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="-apple-system, sans-serif" font-weight="600" font-size="28" fill="#86868b">' + char + '</text></svg>')}`;
    }

    // Render page
    function render(filter = '') {
        if (!config) return;
        mainContent.innerHTML = '';
        
        config.categories.forEach(category => {
            const filteredLinks = category.links.filter(link => 
                link.title.toLowerCase().includes(filter.toLowerCase()) ||
                link.url.toLowerCase().includes(filter.toLowerCase())
            );

            if (filteredLinks.length === 0 && filter) return;

            const section = document.createElement('section');
            section.className = 'category-section' + (category.isFeatured ? ' featured-section' : '');
            
            const header = document.createElement('div');
            header.className = 'category-header';
            header.innerHTML = `<h2 class="category-title">${category.title}</h2>`;
            section.appendChild(header);

            const grid = document.createElement('div');
            grid.className = category.isFeatured ? 'featured-grid' : 'app-grid';

            if (filteredLinks.length === 0) {
                grid.innerHTML = '<div class="empty-state">No links found in this category.</div>';
            }

            filteredLinks.forEach((link, index) => {
                const card = document.createElement('a');
                card.href = isEditMode ? 'javascript:void(0)' : link.url;
                card.target = isEditMode ? '' : '_blank';
                card.className = category.isFeatured ? 'featured-card' : 'app-item';
                
                // Color variation for featured cards
                // (Removed alternating colors per user request, defaulting to CSS rules)

                const fallbackSvg = getFallbackIcon(link.title);

                if (category.isFeatured) {
                    card.innerHTML = `
                        <div class="icon-wrapper">
                            <img src="${link.icon || fallbackSvg}" alt="${link.title} icon" onerror="this.onerror=null;this.src='${fallbackSvg}';">
                        </div>
                        <div class="title-group">
                            <h3>${link.title}</h3>
                            ${link.description ? `<p>${link.description}</p>` : ''}
                        </div>
                    `;
                } else {
                    card.innerHTML = `
                        <div class="app-icon">
                            <img src="${link.icon || fallbackSvg}" alt="${link.title} icon" onerror="this.onerror=null;this.src='${fallbackSvg}';">
                        </div>
                        <span class="app-name">${link.title}</span>
                    `;
                }

                // Edit Overlay Badge (like iOS jiggle mode delete badge)
                if (isEditMode) {
                    const overlay = document.createElement('div');
                    overlay.className = 'edit-badge';
                    overlay.innerHTML = '✎';
                    overlay.onclick = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        openEditModal(category.id, link.id);
                    };
                    card.appendChild(overlay);
                }

                grid.appendChild(card);
            });

            // Add 'New App' button in edit mode
            if (isEditMode && !filter) {
                const addCard = document.createElement('a');
                addCard.href = 'javascript:void(0)';
                addCard.className = category.isFeatured ? 'featured-card add-card' : 'app-item add-card';
                
                if (category.isFeatured) {
                    addCard.innerHTML = `
                        <div class="icon-wrapper" style="display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.02);border:2px dashed rgba(0,0,0,0.1);">
                            <span style="font-size:24px;color:#86868b;">+</span>
                        </div>
                        <div class="title-group">
                            <h3 style="color:#86868b;">Add Site</h3>
                        </div>
                    `;
                } else {
                    addCard.innerHTML = `
                        <div class="app-icon" style="background:rgba(0,0,0,0.02);border:2px dashed rgba(0,0,0,0.1);box-shadow:none;">
                            <span style="font-size:28px;color:#86868b;">+</span>
                        </div>
                        <span class="app-name" style="color:#86868b;">Add</span>
                    `;
                }
                
                addCard.onclick = () => openEditModal(category.id, null);
                grid.appendChild(addCard);
            }

            section.appendChild(grid);
            mainContent.appendChild(section);
        });

        // Add 'New Category' button in edit mode
        if (isEditMode && !filter) {
            const addCatBtn = document.createElement('button');
            addCatBtn.className = 'btn btn-secondary';
            addCatBtn.style.cssText = 'display:block; width:100%; max-width:400px; margin: 0 auto; border: 2px dashed rgba(0,0,0,0.1); background: transparent; color: #86868b; padding: 16px;';
            addCatBtn.innerHTML = '+ Add Category';
            addCatBtn.onclick = () => {
                document.getElementById('catTitle').value = '';
                document.getElementById('catIsFeatured').checked = false;
                categoryModal.style.display = 'block';
            };
            mainContent.appendChild(addCatBtn);
        }
    }

    // Search
    searchInput.addEventListener('input', (e) => {
        render(e.target.value);
    });

    // Edit Mode Toggle
    editBtn.addEventListener('click', () => {
        if (isEditMode) {
            isEditMode = false;
            document.body.classList.remove('editing');
            editBtn.textContent = 'Edit Mode';
            render(searchInput.value);
        } else {
            passwordModal.style.display = 'block';
            adminPasswordInput.focus();
        }
    });

    confirmPasswordBtn.addEventListener('click', async () => {
        try {
            const password = adminPasswordInput.value;
            const hash = await sha256(password);

            // Blind Verification: Ask the server if this hash is correct
            const response = await fetch('/api/verify', {
                method: 'POST',
                headers: { 'Authorization': hash }
            });

            if (response.ok) {
                // Server says yes
                authHash = hash; // Store temp in memory for save operations
                isEditMode = true;
                document.body.classList.add('editing');
                editBtn.textContent = 'Done Editing';
                passwordModal.style.display = 'none';
                adminPasswordInput.value = '';
                render(searchInput.value);
            } else {
                // Server says no or denied
                alert('Incorrect passcode');
                adminPasswordInput.value = '';
                adminPasswordInput.focus();
            }
        } catch (error) {
            console.error('Auth check failed. Is the server running?', error);
            alert('Could not verify password with server.');
        }
    });

    cancelPasswordBtn.addEventListener('click', () => {
        passwordModal.style.display = 'none';
        adminPasswordInput.value = '';
    });

    adminPasswordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') confirmPasswordBtn.click();
    });

    // Modal logic
    function openEditModal(catId, linkId) {
        document.getElementById('categoryId').value = catId;
        
        if (linkId) {
            // Editing existing
            const cat = config.categories.find(c => c.id === catId);
            const link = cat.links.find(l => l.id === linkId);

            document.getElementById('linkTitle').value = link.title;
            document.getElementById('linkUrl').value = link.url;
            document.getElementById('linkIcon').value = link.icon || '';
            if(document.getElementById('linkDesc')) document.getElementById('linkDesc').value = link.description || '';
            document.getElementById('linkId').value = linkId;
            document.getElementById('saveLinkBtn').textContent = 'Save';
            document.getElementById('deleteBtn').style.display = 'block';
        } else {
            // Adding new
            document.getElementById('linkTitle').value = '';
            document.getElementById('linkUrl').value = '';
            document.getElementById('linkIcon').value = '';
            if(document.getElementById('linkDesc')) document.getElementById('linkDesc').value = '';
            document.getElementById('linkId').value = '';
            document.getElementById('saveLinkBtn').textContent = 'Add';
            document.getElementById('deleteBtn').style.display = 'none';
        }

        editModal.style.display = 'block';
    }

    closeBtns.forEach(btn => {
        btn.onclick = () => {
            editModal.style.display = 'none';
            passwordModal.style.display = 'none';
            categoryModal.style.display = 'none';
        }
    });

    window.onclick = (event) => {
        if (event.target == editModal) editModal.style.display = 'none';
        if (event.target == passwordModal) passwordModal.style.display = 'none';
        if (event.target == categoryModal) categoryModal.style.display = 'none';
    };

    editForm.onsubmit = (e) => {
        e.preventDefault();
        const catId = document.getElementById('categoryId').value;
        const linkId = document.getElementById('linkId').value;
        const cat = config.categories.find(c => c.id === catId);

        const newLinkData = {
            title: document.getElementById('linkTitle').value,
            url: document.getElementById('linkUrl').value,
            icon: document.getElementById('linkIcon').value
        };
        
        if (document.getElementById('linkDesc') && document.getElementById('linkDesc').value) {
            newLinkData.description = document.getElementById('linkDesc').value;
        }

        if (linkId) {
            // Update existing
            const link = cat.links.find(l => l.id === linkId);
            Object.assign(link, newLinkData);
        } else {
            // Add new
            newLinkData.id = 'link-' + Date.now() + Math.floor(Math.random() * 1000);
            cat.links.push(newLinkData);
        }

        saveConfig();
        editModal.style.display = 'none';
    };

    categoryForm.onsubmit = (e) => {
        e.preventDefault();
        const newCat = {
            id: 'cat-' + Date.now() + Math.floor(Math.random() * 1000),
            title: document.getElementById('catTitle').value,
            isFeatured: document.getElementById('catIsFeatured').checked,
            links: []
        };
        
        config.categories.push(newCat);
        saveConfig();
        categoryModal.style.display = 'none';
    };

    document.getElementById('deleteBtn').onclick = () => {
        if(confirm("Are you sure you want to delete this link?")) {
            const catId = document.getElementById('categoryId').value;
            const linkId = document.getElementById('linkId').value;
            
            const cat = config.categories.find(c => c.id === catId);
            cat.links = cat.links.filter(l => l.id !== linkId);

            saveConfig();
            editModal.style.display = 'none';
        }
    };

    // Init
    loadConfig();
});

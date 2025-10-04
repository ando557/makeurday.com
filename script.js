document.addEventListener('DOMContentLoaded', () => {
    // --- DATABASE ---
    const quotes = {
        free: {
            motivation: [{ quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" }, { quote: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" }, { quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" }],
            life: [{ quote: "The purpose of our lives is to be happy.", author: "Dalai Lama" }, { quote: "Life is what happens when you're busy making other plans.", author: "John Lennon" }, { quote: "You only live once, but if you do it right, once is enough.", author: "Mae West" }],
            success: [{ quote: "The road to success and the road to failure are almost exactly the same.", author: "Colin R. Davis" }, { quote: "Success is stumbling from failure to failure with no loss of enthusiasm.", author: "Winston Churchill" }]
        },
        premium: {
            wisdom: [{ quote: "The journey of a thousand miles begins with a single step.", author: "Lao Tzu" }, { quote: "Knowing yourself is the beginning of all wisdom.", author: "Aristotle" }],
            leadership: [{ quote: "A leader is one who knows the way, goes the way, and shows the way.", author: "John C. Maxwell" }, { quote: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" }],
            ai_wisdom: [{ quote: "The currency of the future is not data, but the wisdom to interpret it correctly.", author: "AI Oracle" }, { quote: "Logic is the framework, but creativity is the spark that illuminates the unknown.", author: "AI Oracle" }, { quote: "Empathy, a human trait, is the most complex algorithm an AI strives to understand.", author: "AI Oracle" }]
        }
    };
    
    // --- TRANSLATIONS (i18n) ---
    const translations = { ru: { title: "Сделай Свой День - Мотивационные Цитаты", subtitle: "Ваша дневная доза вдохновения", initialQuote: "Нажмите кнопку ниже, чтобы получить свою первую цитату!", initialAuthor: "— Автор", getQuoteBtn: "Получить Цитату", loginPrompt: '<a href="auth.html?mode=login" class="underline hover:text-white">Войдите</a>, чтобы получать больше цитат.', limitReached: "Вы достигли дневного лимита. Возвращайтесь через:", getMoreQuotes: "Получить больше цитат", footerTitle: "Хотите больше вдохновения?", footerSubtitle: "Откройте эксклюзивные категории, цитаты-картинки и многое другое с подпиской.", viewPlansBtn: "Посмотреть Планы" }, en: { title: "Make Your Day - Motivational Quotes", subtitle: "Your daily dose of inspiration", initialQuote: "Click the button below to get your first quote!", initialAuthor: "— Author", getQuoteBtn: "Get Your Quote", loginPrompt: '<a href="auth.html?mode=login" class="underline hover:text-white">Log in</a> to get more quotes.', limitReached: "You have reached your daily limit. Come back in:", getMoreQuotes: "Get more quotes", footerTitle: "Want more inspiration?", footerSubtitle: "Unlock exclusive categories, image quotes, and more with a subscription.", viewPlansBtn: "View Plans" }, es: { title: "Haz Tu Día - Citas Motivacionales", subtitle: "Tu dosis diaria de inspiración", initialQuote: "¡Haz clic en el botón de abajo para obtener tu primera cita!", initialAuthor: "— Autor", getQuoteBtn: "Obtén Tu Cita", loginPrompt: '<a href="auth.html?mode=login" class="underline hover:text-white">Inicia sesión</a> para obtener más citas.', limitReached: "Has alcanzado tu límite diario. ¡Vuelve en:", getMoreQuotes: "Obtener más citas", footerTitle: "¿Quieres más inspiración?", footerSubtitle: "Desbloquea categorías exclusivas, citas con imágenes y más con una suscripción.", viewPlansBtn: "Ver Planes" }, fr: { title: "Égayez Votre Journée - Citations de Motivation", subtitle: "Votre dose quotidienne d'inspiration", initialQuote: "Cliquez sur le bouton ci-dessous pour obtenir votre première citation !", initialAuthor: "— Auteur", getQuoteBtn: "Obtenez Votre Citation", loginPrompt: '<a href="auth.html?mode=login" class="underline hover:text-white">Connectez-vous</a> pour obtenir plus de citations.', limitReached: "Vous avez atteint votre limite quotidienne. Revenez dans :", getMoreQuotes: "Obtenir plus de citations", footerTitle: "Voulez-vous plus d'inspiration ?", footerSubtitle: "Débloquez des catégories exclusives, des citations illustrées et plus encore avec un abonnement.", viewPlansBtn: "Voir Les Forfaits" } };

    // --- APP STATE & DOM ELEMENTS ---
    var currentUser = null; 
    let currentQuote = {};
    let countdownInterval;
    const PLAN_LIMITS = { free: 3, premium: 20, vip: Infinity, guest: 3 };

    // --- USER & DATA MANAGEMENT ---
    function getUsersDB() { return JSON.parse(localStorage.getItem('makeYourDayUsers')) || {}; }
    function saveUsersDB(db) { localStorage.setItem('makeYourDayUsers', JSON.stringify(db)); }
    function getCurrentUser() {
        const username = localStorage.getItem('makeYourDayCurrentUser');
        if (!username) return null;
        const usersDB = getUsersDB();
        const user = usersDB[username];
        if (user) {
            user.favorites = user.favorites || [];
            user.theme = user.theme || 'default';
            user.limitReachedTimestamp = user.limitReachedTimestamp || null;
            user.lang = user.lang || 'ru';
        }
        return user ? { username, ...user } : null;
    }
    function saveUserSettings() {
        if (!currentUser) return;
        const usersDB = getUsersDB();
        usersDB[currentUser.username] = { password: currentUser.password, plan: currentUser.plan, lang: currentUser.lang, favorites: currentUser.favorites, theme: currentUser.theme, limitReachedTimestamp: currentUser.limitReachedTimestamp };
        saveUsersDB(usersDB);
    }

    // --- UI & THEME ---
    function renderHeader() {
        const header = document.getElementById('main-header');
        const template = document.getElementById('header-template');
        if (!header || !template) return;

        header.innerHTML = '';
        const headerContent = template.content.cloneNode(true);
        const authButtons = headerContent.querySelector('#auth-buttons');
        const userProfile = headerContent.querySelector('#user-profile');
        
        if (currentUser) {
            userProfile.classList.remove('hidden');
            userProfile.classList.add('flex');
            userProfile.querySelector('#profile-username').textContent = currentUser.username;
            const profilePlan = userProfile.querySelector('#profile-plan');
            profilePlan.textContent = `${currentUser.plan} Plan`;
            profilePlan.className = `text-xs uppercase font-bold bg-clip-text text-transparent main-gradient-text`;
            userProfile.querySelector('#logout-btn').addEventListener('click', () => {
                localStorage.removeItem('makeYourDayCurrentUser');
                window.location.href = 'index.html';
            });
            if (currentUser.plan === 'vip') {
                const themeSwitcher = headerContent.querySelector('#theme-switcher-container');
                if(themeSwitcher) {
                    themeSwitcher.classList.remove('hidden');
                    themeSwitcher.querySelector('#theme-switcher-btn').addEventListener('click', toggleTheme);
                }
            }
        } else {
            authButtons.classList.remove('hidden');
            authButtons.classList.add('flex');
        }
        header.appendChild(headerContent);
        attachLangSwitcherListeners(header);
        if (window.lucide) lucide.createIcons();
    }
    function applyTheme(theme) {
        document.body.className = 'bg-slate-900 text-white'; 
        if (theme === 'cyberpunk') document.body.classList.add('theme-cyberpunk');
    }
    function toggleTheme() {
        if (!currentUser || currentUser.plan !== 'vip') return;
        currentUser.theme = currentUser.theme === 'default' ? 'cyberpunk' : 'default';
        applyTheme(currentUser.theme);
        saveUserSettings();
    }
    function setLanguage(lang) {
        if (!translations[lang]) lang = 'ru';
        document.querySelectorAll('[data-key]').forEach(el => {
            const key = el.getAttribute('data-key');
            if (translations[lang][key]) el.innerHTML = translations[lang][key];
        });
        const currentLangText = document.getElementById('current-lang-text');
        if (currentLangText) currentLangText.textContent = lang.toUpperCase();
        document.documentElement.lang = lang;
        if (currentUser) {
            currentUser.lang = lang;
            saveUserSettings();
        }
    };
    function attachLangSwitcherListeners(container) {
        const langButton = container.querySelector('#lang-button');
        const langDropdown = container.querySelector('#lang-dropdown');
        if(!langButton || !langDropdown) return;

        langButton.addEventListener('click', (e) => {
            e.stopPropagation();
            langDropdown.classList.toggle('hidden');
        });
        container.querySelectorAll('.lang-option').forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                setLanguage(e.target.dataset.lang);
                langDropdown.classList.add('hidden');
            });
        });
        document.addEventListener('click', () => langDropdown.classList.add('hidden'));
    }

    // --- USAGE LIMIT & TIMER ---
    function getUsageKey() { return `quoteUsage_${currentUser ? currentUser.username : 'guest'}`; }
    function checkUsage() {
        const key = getUsageKey();
        const today = new Date().toISOString().split('T')[0];
        let usage = JSON.parse(localStorage.getItem(key)) || { date: today, count: 0 };
        if (usage.date !== today) {
            usage = { date: today, count: 0 };
            localStorage.setItem(key, JSON.stringify(usage));
        }
        return usage;
    }
    function updateUsage() {
        const key = getUsageKey();
        let usage = checkUsage();
        usage.count++;
        localStorage.setItem(key, JSON.stringify(usage));
    }
    function isLimitReached() {
        const plan = currentUser ? currentUser.plan : 'guest';
        const limit = PLAN_LIMITS[plan];
        if (currentUser && currentUser.limitReachedTimestamp) {
            if (Date.now() - currentUser.limitReachedTimestamp >= 86400000) { // 24 hours
                currentUser.limitReachedTimestamp = null;
                localStorage.removeItem(getUsageKey());
                saveUserSettings();
                return false;
            }
            return true;
        }
        const usage = checkUsage();
        const reached = usage.count >= limit;
        if (reached && currentUser && !currentUser.limitReachedTimestamp) {
            currentUser.limitReachedTimestamp = Date.now();
            saveUserSettings();
        }
        return reached;
    }
    function startCountdown() {
        if (countdownInterval) clearInterval(countdownInterval);
        if (!currentUser || !currentUser.limitReachedTimestamp) return;
        const endTime = currentUser.limitReachedTimestamp + 86400000;
        const countdownTimer = document.getElementById('countdown-timer');
        if (!countdownTimer) return;
        
        function updateTimer() {
            const msLeft = endTime - Date.now();
            if (msLeft <= 0) {
                countdownTimer.textContent = "00:00:00";
                clearInterval(countdownInterval);
                updateButtonState();
                return;
            }
            const h = Math.floor(msLeft / 3600000);
            const m = Math.floor((msLeft % 3600000) / 60000);
            const s = Math.floor((msLeft % 60000) / 1000);
            countdownTimer.textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        }
        updateTimer();
        countdownInterval = setInterval(updateTimer, 1000);
    }
    function updateButtonState() {
        const btn = document.getElementById('new-quote-btn');
        const limitMsg = document.getElementById('limit-message');
        const loginPrmpt = document.getElementById('login-prompt');
        if (!btn) return;
        const limitReached = isLimitReached();
        btn.disabled = limitReached;
        btn.classList.toggle('opacity-50', limitReached);
        btn.classList.toggle('cursor-not-allowed', limitReached);
        
        if (limitMsg) limitMsg.classList.add('hidden');
        if (loginPrmpt) loginPrmpt.classList.add('hidden');
        btn.classList.remove('hidden');

        if (limitReached) {
            if (currentUser) {
                if (limitMsg) limitMsg.classList.remove('hidden');
                startCountdown();
            } else {
                if (loginPrmpt) loginPrmpt.classList.remove('hidden');
                btn.classList.add('hidden');
            }
        } else {
            if (countdownInterval) clearInterval(countdownInterval);
        }
    }

    // --- QUOTE LOGIC ---
    function getNewQuote() {
        const plan = currentUser ? currentUser.plan : 'guest';
        let categories = { ...quotes.free };
        if (['premium', 'vip'].includes(plan)) categories = { ...categories, ...quotes.premium };
        if (plan !== 'vip') delete categories.ai_wisdom;
        
        const allQuotes = Object.values(categories).flat();
        let newQuote;
        do {
            newQuote = allQuotes[Math.floor(Math.random() * allQuotes.length)];
        } while (allQuotes.length > 1 && newQuote.quote === currentQuote.quote);
        return newQuote;
    }
    function displayNewQuote() {
        if (isLimitReached()) { updateButtonState(); return; }
        updateUsage();
        currentQuote = getNewQuote();
        
        const quoteText = document.getElementById('quote-text');
        const quoteAuthor = document.getElementById('quote-author');
        const quoteCardInner = document.getElementById('quote-card-inner');
        
        if(quoteCardInner) quoteCardInner.classList.add('is-flipping');
        setTimeout(() => {
            if(quoteText) quoteText.textContent = currentQuote.quote;
            if(quoteAuthor) quoteAuthor.textContent = `— ${currentQuote.author}`;
            if (currentUser) updateFavoriteButtonUI();
            updateQuoteCardBackground();
            if(quoteCardInner) quoteCardInner.classList.remove('is-flipping');
            updateButtonState();
        }, 300);
    }
    function updateQuoteCardBackground() {
        const card = document.getElementById('quote-card');
        if (!card) return;
        card.style.backgroundImage = '';
        const existingOverlay = card.querySelector('.image-quote-overlay');
        if (existingOverlay) existingOverlay.remove();
        
        if (currentUser && ['premium', 'vip'].includes(currentUser.plan)) {
            card.style.backgroundImage = `url(https://picsum.photos/1200/675?random=${Math.random()})`;
            const overlay = document.createElement('div');
            overlay.className = 'image-quote-overlay';
            card.prepend(overlay);
        }
    }
    function toggleFavorite() {
        if (!currentUser || !currentQuote.quote) return;
        const isFav = currentUser.favorites.some(f => f.quote === currentQuote.quote);
        if (isFav) {
            currentUser.favorites = currentUser.favorites.filter(f => f.quote !== currentQuote.quote);
        } else {
            currentUser.favorites.push(currentQuote);
        }
        saveUserSettings();
        updateFavoriteButtonUI();
    }
    function updateFavoriteButtonUI() {
        const favBtn = document.getElementById('favorite-quote-btn');
        if (!favBtn || !currentUser) return;
        const isFav = currentUser.favorites.some(f => f.quote === currentQuote.quote);
        favBtn.classList.toggle('is-favorite', isFav);
        const icon = favBtn.querySelector('i');
        if (icon) icon.setAttribute('fill', isFav ? 'currentColor' : 'none');
    }
    window.renderFavorites = function() {
        const container = document.getElementById('favorites-container');
        const noFavsMsg = document.getElementById('no-favorites-message');
        if (!container || !currentUser) return;
        container.innerHTML = '';
        if (!currentUser.favorites || currentUser.favorites.length === 0) {
            if (noFavsMsg) noFavsMsg.classList.remove('hidden');
            return;
        }
        if (noFavsMsg) noFavsMsg.classList.add('hidden');
        currentUser.favorites.forEach((fav, index) => {
            const card = document.createElement('div');
            card.className = 'favorite-card';
            card.innerHTML = `<blockquote>“${fav.quote}”</blockquote><footer>— ${fav.author}</footer><button class="remove-fav-btn" data-index="${index}" title="Удалить"><i data-lucide="trash-2" class="pointer-events-none"></i></button>`;
            container.appendChild(card);
        });
        container.querySelectorAll('.remove-fav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.dataset.index, 10);
                currentUser.favorites.splice(idx, 1);
                saveUserSettings();
                renderFavorites();
            });
        });
        if (window.lucide) lucide.createIcons();
    }

    // --- INITIALIZATION ---
    function init() {
        currentUser = getCurrentUser();
        window.currentUser = currentUser;
        
        applyTheme(currentUser?.theme || 'default');
        renderHeader();
        setLanguage(currentUser?.lang || (navigator.language || 'ru').split('-')[0]);

        const pagePath = window.location.pathname;

        if (pagePath.includes('index.html') || pagePath === '/') {
            const newQuoteBtn = document.getElementById('new-quote-btn');
            if (newQuoteBtn) newQuoteBtn.addEventListener('click', displayNewQuote);
            if (currentUser) {
                document.getElementById('quote-actions-container').classList.remove('hidden');
                const favBtn = document.getElementById('favorite-quote-btn');
                const dlBtn = document.getElementById('download-quote-btn');
                favBtn.classList.remove('hidden');
                favBtn.addEventListener('click', toggleFavorite);
                if (['premium', 'vip'].includes(currentUser.plan)) {
                    dlBtn.classList.remove('hidden');
                }
            }
            updateButtonState();
        }

        if (pagePath.includes('account.html')) {
            if (!currentUser) { window.location.href = 'auth.html?mode=login'; return; }
            document.getElementById('welcome-message').textContent = `Добро пожаловать, ${currentUser.username}!`;
            document.getElementById('user-nickname').textContent = currentUser.username;
            document.getElementById('user-plan').textContent = currentUser.plan;
            document.getElementById('quotes-viewed').textContent = checkUsage().count;
            renderFavorites();
        }

        if (pagePath.includes('favorites.html')) {
            if (!currentUser) { window.location.href = 'auth.html?mode=login'; return; }
            renderFavorites();
        }
    }
    init();
});
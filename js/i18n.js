/**
 * i18n Module - Multi-language Support
 * Supports: ko, en, ja, zh, es, pt, id, tr, de, fr, hi, ru
 */

class I18n {
    constructor() {
        this.translations = {};
        this.supportedLanguages = ['ko', 'en', 'ja', 'zh', 'es', 'pt', 'id', 'tr', 'de', 'fr', 'hi', 'ru'];
        this.currentLang = this.detectLanguage();
        this.initialized = false;
    }

    /**
     * Detect user's language preference
     * Priority: localStorage > browser > 'en'
     */
    detectLanguage() {
        // Check localStorage first
        const saved = localStorage.getItem('language');
        if (saved && this.supportedLanguages.includes(saved)) {
            return saved;
        }

        // Detect browser language
        const browserLang = navigator.language.substring(0, 2).toLowerCase();
        if (this.supportedLanguages.includes(browserLang)) {
            return browserLang;
        }

        // Default to English
        return 'en';
    }

    /**
     * Load translations for a specific language
     */
    async loadTranslations(lang) {
        if (this.translations[lang]) {
            return this.translations[lang];
        }

        try {
            const response = await fetch(`js/locales/${lang}.json`);
            if (!response.ok) {
                console.warn(`Failed to load ${lang}.json, falling back to English`);
                if (lang !== 'en') {
                    return this.loadTranslations('en');
                }
                throw new Error(`Failed to load English locale`);
            }
            this.translations[lang] = await response.json();
            return this.translations[lang];
        } catch (error) {
            console.error(`Error loading language ${lang}:`, error);
            return {};
        }
    }

    /**
     * Get translation by key (dot notation)
     * Example: t('game.title')
     */
    t(key, defaultValue = key) {
        const keys = key.split('.');
        let value = this.translations[this.currentLang];

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return defaultValue;
            }
        }

        return typeof value === 'string' ? value : defaultValue;
    }

    /**
     * Get language name
     */
    getLanguageName(lang) {
        const names = {
            'ko': '한국어',
            'en': 'English',
            'ja': '日本語',
            'zh': '中文',
            'es': 'Español',
            'pt': 'Português',
            'id': 'Bahasa Indonesia',
            'tr': 'Türkçe',
            'de': 'Deutsch',
            'fr': 'Français',
            'hi': 'हिन्दी',
            'ru': 'Русский'
        };
        return names[lang] || lang;
    }

    /**
     * Initialize i18n - load translations and set up UI
     */
    async init() {
        if (this.initialized) return;

        // Load current language translations
        await this.loadTranslations(this.currentLang);

        // If not English, also load English as fallback
        if (this.currentLang !== 'en') {
            await this.loadTranslations('en');
        }

        // Update UI
        this.updateUI();
        this.setupLanguageSelector();

        this.initialized = true;
    }

    /**
     * Set language and update UI
     */
    async setLanguage(lang) {
        if (!this.supportedLanguages.includes(lang)) {
            console.warn(`Unsupported language: ${lang}`);
            return;
        }

        this.currentLang = lang;
        localStorage.setItem('language', lang);

        // Load translations if not already loaded
        await this.loadTranslations(lang);

        // Update all elements with data-i18n attribute
        this.updateUI();

        // Dispatch event for app to listen to
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
    }

    /**
     * Update all UI elements with data-i18n attribute
     */
    updateUI() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const text = this.t(key);

            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = text;
            } else if (element.tagName === 'BUTTON' && element.getAttribute('aria-label')) {
                element.setAttribute('aria-label', text);
            } else {
                element.textContent = text;
            }
        });
    }

    /**
     * Setup language selector event listeners
     */
    setupLanguageSelector() {
        const langToggle = document.getElementById('lang-toggle');
        const langMenu = document.getElementById('lang-menu');
        const langOptions = document.querySelectorAll('.lang-option');

        if (!langToggle) return;

        // Toggle menu
        langToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            langMenu.classList.toggle('hidden');
        });

        // Close menu on outside click
        document.addEventListener('click', (e) => {
            if (!langToggle.contains(e.target) && !langMenu.contains(e.target)) {
                langMenu.classList.add('hidden');
            }
        });

        // Language selection
        langOptions.forEach(option => {
            option.addEventListener('click', async (e) => {
                e.stopPropagation();
                const lang = option.getAttribute('data-lang');
                await this.setLanguage(lang);
                langMenu.classList.add('hidden');
            });
        });
    }

    /**
     * Get current language
     */
    getCurrentLanguage() {
        return this.currentLang;
    }

    /**
     * Get all supported languages
     */
    getSupportedLanguages() {
        return this.supportedLanguages;
    }
}

// Create global instance
const i18n = new I18n();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => i18n.init());
} else {
    i18n.init();
}

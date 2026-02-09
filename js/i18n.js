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
        try {
            // Check localStorage first (with error handling for private mode)
            const saved = localStorage.getItem('language');
            if (saved && this.supportedLanguages.includes(saved)) {
                return saved;
            }
        } catch (e) {
            console.warn('localStorage not available for language detection:', e.message);
        }

        try {
            // Detect browser language
            const browserLang = navigator.language.substring(0, 2).toLowerCase();
            if (this.supportedLanguages.includes(browserLang)) {
                return browserLang;
            }
        } catch (e) {
            console.warn('Failed to detect browser language:', e.message);
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
                throw new Error(`HTTP ${response.status}: Failed to load ${lang}.json`);
            }
            const data = await response.json();
            if (!data || typeof data !== 'object') {
                throw new Error(`Invalid translation data for ${lang}`);
            }
            this.translations[lang] = data;
            return this.translations[lang];
        } catch (error) {
            console.error(`Error loading language ${lang}:`, error.message);
            // Fallback to English if not already trying English
            if (lang !== 'en') {
                try {
                    return await this.loadTranslations('en');
                } catch (fallbackError) {
                    console.error('Failed to load English fallback:', fallbackError.message);
                    return {};
                }
            }
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

        try {
            // Load current language translations
            await this.loadTranslations(this.currentLang);

            // If not English, also load English as fallback
            if (this.currentLang !== 'en') {
                try {
                    await this.loadTranslations('en');
                } catch (e) {
                    console.warn('Failed to load English fallback:', e.message);
                }
            }

            // Update UI
            this.updateUI();
            this.setupLanguageSelector();

            this.initialized = true;
        } catch (e) {
            console.error('Error initializing i18n:', e.message);
            // Fallback: try to use English
            if (this.currentLang !== 'en') {
                try {
                    this.currentLang = 'en';
                    await this.loadTranslations('en');
                    this.updateUI();
                    this.initialized = true;
                } catch (fallbackError) {
                    console.error('Failed to fallback to English:', fallbackError.message);
                }
            }
        }
    }

    /**
     * Set language and update UI
     */
    async setLanguage(lang) {
        if (!this.supportedLanguages.includes(lang)) {
            console.warn(`Unsupported language: ${lang}`);
            return;
        }

        try {
            this.currentLang = lang;

            // Try to save preference to localStorage
            try {
                localStorage.setItem('language', lang);
            } catch (storageError) {
                console.warn('Failed to save language preference to localStorage:', storageError.message);
                // Continue anyway - language is still set in memory
            }

            // Load translations if not already loaded
            await this.loadTranslations(lang);

            // Update all elements with data-i18n attribute
            this.updateUI();

            // Dispatch event for app to listen to
            window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
        } catch (e) {
            console.error('Error setting language:', e.message);
        }
    }

    /**
     * Update all UI elements with data-i18n attribute
     */
    updateUI() {
        try {
            document.querySelectorAll('[data-i18n]').forEach(element => {
                try {
                    const key = element.getAttribute('data-i18n');
                    if (!key) return;
                    const text = this.t(key);

                    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                        element.placeholder = text;
                    } else if (element.tagName === 'BUTTON' && element.getAttribute('aria-label')) {
                        element.setAttribute('aria-label', text);
                    } else {
                        element.textContent = text;
                    }
                } catch (e) {
                    console.warn('Error updating element:', e.message);
                }
            });
        } catch (e) {
            console.error('Error during updateUI:', e.message);
        }
    }

    /**
     * Setup language selector event listeners
     */
    setupLanguageSelector() {
        try {
            const langToggle = document.getElementById('lang-toggle');
            const langMenu = document.getElementById('lang-menu');
            const langOptions = document.querySelectorAll('.lang-option');

            if (!langToggle) {
                console.warn('Language selector elements not found in DOM');
                return;
            }

            // Toggle menu
            langToggle.addEventListener('click', (e) => {
                try {
                    e.stopPropagation();
                    if (langMenu) {
                        langMenu.classList.toggle('hidden');
                    }
                } catch (e) {
                    console.warn('Error toggling language menu:', e.message);
                }
            });

            // Close menu on outside click
            document.addEventListener('click', (e) => {
                try {
                    if (langToggle && langMenu && !langToggle.contains(e.target) && !langMenu.contains(e.target)) {
                        langMenu.classList.add('hidden');
                    }
                } catch (e) {
                    console.warn('Error closing language menu:', e.message);
                }
            });

            // Language selection
            langOptions.forEach(option => {
                try {
                    option.addEventListener('click', async (e) => {
                        try {
                            e.stopPropagation();
                            const lang = option.getAttribute('data-lang');
                            if (lang) {
                                await this.setLanguage(lang);
                                if (langMenu) {
                                    langMenu.classList.add('hidden');
                                }
                            }
                        } catch (e) {
                            console.warn('Error handling language option click:', e.message);
                        }
                    });
                } catch (e) {
                    console.warn('Error setting up language option:', e.message);
                }
            });
        } catch (e) {
            console.error('Error setting up language selector:', e.message);
        }
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

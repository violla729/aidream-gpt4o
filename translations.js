// 多语言翻译数据
const translations = {
    en: {
        // 页面标题
        'page-title': 'AI Dream Interpreter & Artist',
        'page-subtitle': 'Explore your dreams with AI and bring them to life in 6 unique art styles — totally free.',
        
        // 头部
        'dream-input-label': 'Describe your dream...',
        'dream-input-placeholder': 'For example: I dreamed I was walking through a field of purple flowers with a rainbow in the sky...',
        'analyze-btn': 'Analyze Dream',
        'loading-text': 'AI is analyzing your dream...',
        'analysis-title': 'Dream Analysis',
        'image-title': 'Dream Image',
        'image-placeholder': 'The image generated from your dream will appear here',
        'generate-image-btn': 'Generate Dream Image',
        'regenerate-btn': 'Regenerate',
        'generating-text': 'Generating...',
        'regenerating-text': 'Regenerating...',
        'footer-text': 'Exploring Inner Wisdom',
        
        // AI能力和免费使用
        'ai-powered': 'AI Powered',
        'free-to-use': 'Free to Use',
        'privacy-safe': 'Privacy Safe',
        
        // 通知消息
        'error-empty-dream': 'Please enter your dream description',
        'error-analysis-failed': 'Dream analysis failed, please try again later',
        'error-image-failed': 'Image generation failed, please try again later',
        'success-image-generated': 'Dream image generated successfully!',
        'error-analyze-first': 'Please analyze your dream first',
        
        // 图片生成消息
        'image-generating-message': 'Your dream image is being generated, estimated wait time 1-2 minutes.',
        'image-generation-failed-retry': 'Image generation failed, please try again',
        'image-generation-complete': 'AI image generation complete!',
        'image-generation-timeout': 'AI image generation timeout, please try again',
        'image-loading-text': 'AI is generating your dream image...',
        'image-loading-regenerating': 'AI is regenerating your dream image...',
        'image-loading-subtext': 'Please wait patiently for 1-2 minutes',
        'image-loading-progress': 'AI is generating your dream image... ({progress}%)',
        'image-loading-time-remaining': 'Estimated {minutes} minutes remaining',
        
        // 输入提示
        'input-hint-text': "We'll analyze your dream and generate a beautiful image for you!",
        
        // 画风选择器
        'style-selector-label': 'Choose Art Style:',
        'style-watercolor': 'Watercolor',
        'style-cartoon': 'Cartoon',
        'style-oil': 'Oil Painting',
        'style-webtoon': 'Webtoon',
        'style-chibi': 'Chibi',
        'style-lineart': 'Line Art',
        
        // 画廊
        'gallery-title': 'Dream Gallery',
        'gallery-subtitle': 'Another way to see what we dream',
        'gallery-placeholder': 'Be the first to share your dream image!',
        
        // 语言切换器
        'language-english': 'English',
        'language-spanish': 'Español',
        'language-chinese': '中文'
    },
    
    es: {
        // 页面标题
        'page-title': 'Intérprete y Artista de Sueños con IA',
        'page-subtitle': 'Interpretación y arte de tus sueños en 6 estilos únicos — gratis con IA.',
        
        // 头部
        'dream-input-label': 'Describe tu sueño...',
        'dream-input-placeholder': 'Por ejemplo: Soñé que caminaba por un campo de flores púrpuras con un arcoíris en el cielo...',
        'analyze-btn': 'Analizar Sueño',
        'loading-text': 'La IA está analizando tu sueño...',
        'analysis-title': 'Análisis del Sueño',
        'image-title': 'Imagen del Sueño',
        'image-placeholder': 'La imagen generada de tu sueño aparecerá aquí',
        'generate-image-btn': 'Generar Imagen del Sueño',
        'regenerate-btn': 'Regenerar',
        'generating-text': 'Generando...',
        'regenerating-text': 'Regenerando...',
        'footer-text': 'Explorando la Sabiduría Interior',
        
        // AI能力和免费使用
        'ai-powered': 'Con IA',
        'free-to-use': 'Gratis',
        'privacy-safe': 'Privacidad Segura',
        
        // 通知消息
        'error-empty-dream': 'Por favor ingresa la descripción de tu sueño',
        'error-analysis-failed': 'El análisis del sueño falló, por favor intenta de nuevo más tarde',
        'error-image-failed': 'La generación de imagen falló, por favor intenta de nuevo más tarde',
        'success-image-generated': '¡Imagen del sueño generada exitosamente!',
        'error-analyze-first': 'Por favor analiza tu sueño primero',
        
        // 图片生成消息
        'image-generating-message': 'Tu imagen de sueño se está generando, tiempo estimado de espera 1-2 minutos.',
        'image-generation-failed-retry': 'La generación de imagen falló, por favor intenta de nuevo',
        'image-generation-complete': '¡Generación de imagen AI completada!',
        'image-generation-timeout': 'Tiempo agotado para la generación de imagen AI, por favor intenta de nuevo',
        'image-loading-text': 'AI está generando tu imagen de sueño...',
        'image-loading-regenerating': 'AI está regenerando tu imagen de sueño...',
        'image-loading-subtext': 'Por favor espera pacientemente 1-2 minutos',
        'image-loading-progress': 'AI está generando tu imagen de sueño... ({progress}%)',
        'image-loading-time-remaining': 'Estimado {minutes} minutos restantes',
        
        // 输入提示
        'input-hint-text': 'Analizaremos tu sueño y generaremos una imagen hermosa para ti!',
        
        // 画风选择器
        'style-selector-label': 'Elige Estilo de Arte:',
        'style-watercolor': 'Acuarela',
        'style-cartoon': 'Caricatura',
        'style-oil': 'Óleo',
        'style-webtoon': 'Webtoon coreano',
        'style-chibi': 'Chibi',
        'style-lineart': 'Arte de línea',
        
        // 画廊
        'gallery-title': 'Galería de Sueños',
        'gallery-subtitle': 'Otra forma de ver lo que soñamos',
        'gallery-placeholder': '¡Se el primero en compartir tu imagen de sueño!',
        
        // 语言切换器
        'language-english': 'English',
        'language-spanish': 'Español',
        'language-chinese': '中文'
    },
    
    zh: {
        // 页面标题
        'page-title': 'AI 解梦艺术师',
        'page-subtitle': '1v1梦境解析服务，并支持用六种不同画风将梦境还原，限时免费。',
        
        // 头部
        'dream-input-label': '请描述您的梦境...',
        'dream-input-placeholder': '例如：我梦见自己在一片紫色的花海中漫步，天空中有彩虹...',
        'analyze-btn': '解析梦境',
        'loading-text': 'AI正在解析您的梦境...',
        'analysis-title': '梦境解析',
        'image-title': '梦境图像',
        'image-placeholder': '基于您的梦境生成的图像将在这里显示',
        'generate-image-btn': '生成梦境图像',
        'regenerate-btn': '重新生成',
        'generating-text': '生成中...',
        'regenerating-text': '重新生成中...',
        'footer-text': '探索内心的智慧',
        
        // AI能力和免费使用
        'ai-powered': 'AI驱动',
        'free-to-use': '免费使用',
        'privacy-safe': '隐私安全',
        
        // 通知消息
        'error-empty-dream': '请输入您的梦境描述',
        'error-analysis-failed': '梦境分析失败，请稍后重试',
        'error-image-failed': '图像生成失败，请稍后重试',
        'success-image-generated': '梦境图像生成成功！',
        'error-analyze-first': '请先解析梦境',
        
        // 图片生成消息
        'image-generating-message': '您的梦境图片正在生成中，预计需要等待1-2分钟。',
        'image-generation-failed-retry': '图像生成失败，请重试',
        'image-generation-complete': 'AI图像生成完成！',
        'image-generation-timeout': 'AI图像生成超时，请重试',
        'image-loading-text': 'AI正在为您生成梦境图像...',
        'image-loading-regenerating': 'AI正在为您重新生成梦境图像...',
        'image-loading-subtext': '请耐心等待1-2分钟',
        'image-loading-progress': 'AI正在为您生成梦境图像... ({progress}%)',
        'image-loading-time-remaining': '预计还需 {minutes} 分钟',
        
        // 输入提示
        'input-hint-text': '我们将分析您的梦境并为您生成一张美丽的图片！',
        
        // 画风选择器
        'style-selector-label': '选择画风:',
        'style-watercolor': '水彩画风',
        'style-cartoon': '卡通风格',
        'style-oil': '油画风格',
        'style-webtoon': '韩漫风格',
        'style-chibi': 'Q版萌系风',
        'style-lineart': '黑白线稿风',
        
        // 画廊
        'gallery-title': '梦境画廊',
        'gallery-subtitle': '看见梦境的另一种方式',
        'gallery-placeholder': '成为第一个分享您梦境图像的人！',
        
        // 语言切换器
        'language-english': 'English',
        'language-spanish': 'Español',
        'language-chinese': '中文'
    }
};

// 当前语言
let currentLanguage = 'en';

// 切换语言
function switchLanguage(lang) {
    currentLanguage = lang;
    
    // 更新页面标题
    document.title = getTranslation('page-title') + ' - AI Dream Interpreter';
    
    // 更新所有翻译文本
    updateTranslations();
    
    // 更新语言按钮状态
    updateLanguageButtons(lang);
    
    // 保存语言偏好到本地存储
    localStorage.setItem('preferredLanguage', lang);
}

// 更新翻译
function updateTranslations() {
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        const translation = getTranslation(key);
        if (translation) {
            // 只更新文本内容，不重新创建元素
            if (element.tagName === 'BUTTON') {
                // 对于按钮，只更新span元素的内容，保持原有结构和事件监听器
                const span = element.querySelector('span');
                if (span) {
                    span.textContent = translation;
                } else {
                    // 如果没有span，直接更新文本内容但保持其他元素
                    const textNodes = Array.from(element.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
                    if (textNodes.length > 0) {
                        textNodes[0].textContent = translation;
                    } else {
                        element.textContent = translation;
                    }
                }
            } else {
                element.textContent = translation;
            }
        }
    });
    
    // 更新占位符文本
    document.querySelectorAll('[data-translate-placeholder]').forEach(element => {
        const key = element.getAttribute('data-translate-placeholder');
        const translation = getTranslation(key);
        if (translation) {
            element.placeholder = translation;
        }
    });
}

// 更新语言按钮状态
function updateLanguageButtons(activeLang) {
    document.querySelectorAll('.language-option').forEach(option => {
        option.classList.remove('active');
        if (option.dataset.lang === activeLang) {
            option.classList.add('active');
        }
    });
}

// 获取翻译文本
function getTranslation(key) {
    return translations[currentLanguage]?.[key] || translations['en'][key] || key;
}

// 获取当前语言
function getCurrentLanguage() {
    return currentLanguage;
}

// 将函数暴露到全局作用域
window.getCurrentLanguage = getCurrentLanguage;

// 初始化语言
function initLanguage() {
    // 从本地存储获取语言偏好
    const savedLanguage = localStorage.getItem('preferredLanguage');
    
    if (savedLanguage && translations[savedLanguage]) {
        currentLanguage = savedLanguage;
    } else {
        // 根据浏览器语言自动选择
        const browserLang = navigator.language.split('-')[0];
        
        if (translations[browserLang]) {
            currentLanguage = browserLang;
        } else {
            currentLanguage = 'en'; // 默认使用英语
        }
    }
    
    // 应用语言设置
    switchLanguage(currentLanguage);
} 
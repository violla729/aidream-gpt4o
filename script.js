// 全局变量
let currentDream = '';
let analysisResultText = '';

// DOM元素变量声明
let dreamInput, analyzeBtn, resultsSection, loadingSpinner, analysisResult, analysisContent;
let imageGeneration, imageContainer, generateImageBtn, inputHint;
let languageDropdown, languageDropdownBtn, languageDropdownContent, currentLanguageSpan;
let dreamGallery, galleryGrid, galleryPlaceholder;

// 梦境分析处理
async function handleDreamAnalysis() {
    const dreamText = dreamInput.value.trim();
    
    if (!dreamText) {
        showNotification(getTranslation('error-empty-dream'), 'error');
        return;
    }
    
    currentDream = dreamText;
    
    // 添加点击效果
    analyzeBtn.style.transform = 'scale(0.95)';
    setTimeout(() => {
        analyzeBtn.style.transform = '';
    }, 150);
    
    // 显示结果区域和加载动画
    resultsSection.style.display = 'block';
    loadingSpinner.style.display = 'block';
    analysisResult.style.display = 'none';
    imageGeneration.style.display = 'none';
    
    try {
        // 调用AI解梦API
        const analysis = await analyzeDream(dreamText);
        analysisResultText = analysis;
        
        // 隐藏加载动画，显示结果
        loadingSpinner.style.display = 'none';
        analysisResult.style.display = 'block';
        imageGeneration.style.display = 'block';
        
        // 显示分析结果
        displayAnalysisResult(analysis);
        
        // 滚动到结果区域
        resultsSection.scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        loadingSpinner.style.display = 'none';
        showNotification(getTranslation('error-analysis-failed'), 'error');
    }
}

// AI解梦API调用
async function analyzeDream(dreamText) {
    try {
        // 获取当前语言设置
        let language = 'en'; // 默认英文
        
        if (typeof window.getCurrentLanguage !== 'undefined') {
            language = window.getCurrentLanguage();
        }
        
        const response = await fetch('/api/analyze-dream', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                dream: dreamText,
                language: language 
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'API调用失败');
        }
        
        const data = await response.json();
        return data.analysis;
        
    } catch (error) {
        throw error;
    }
}

// 显示分析结果
function displayAnalysisResult(analysis) {
    analysisContent.innerHTML = analysis.replace(/\n/g, '<br>');
}

// 图像生成处理
async function handleImageGeneration() {
    if (!currentDream) {
        showNotification(getTranslation('error-analyze-first'), 'error');
        return;
    }
    
    // 显示图像生成中的状态
    generateImageBtn.disabled = true;
    
    // 检查当前按钮状态，决定显示什么文案
    const currentButtonText = generateImageBtn.querySelector('span').textContent;
    if (currentButtonText === 'Regenerate' || currentButtonText === '重新生成') {
        generateImageBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span data-translate="regenerating-text">Regenerating...</span>';
    } else {
        generateImageBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span data-translate="generating-text">Generating...</span>';
    }
    
    try {
        // 调用图像生成API
        const result = await generateDreamImage(currentDream, analysisResultText);
        
        // 检查是否是4oimage任务
        if (result.taskId && (result.source === '4oimageapi.io-waiting' || result.source === '4oimageapi.io-preset-healing')) {
            
            // 显示加载状态，不显示任何图片
            displayLoadingState();
            showNotification(result.message || '您的梦境图片正在生成中，预计需要等待1-2分钟。', 'info');
            
            // 开始轮询4oimage结果
            await poll4oimageResult(result.taskId);
            
        } else if (result.imageUrl) {
            // 直接显示结果（其他来源的图片）
            displayGeneratedImage(result.imageUrl);
            
            // 显示相应的消息
            if (result.message) {
                showNotification(result.message, 'info');
            } else {
                showNotification(getTranslation('success-image-generated'), 'success');
            }
        } else {
            // 没有图片URL的情况
            showNotification('图像生成失败，请重试', 'error');
        }
        
    } catch (error) {
        showNotification(getTranslation('error-image-failed'), 'error');
    } finally {
        // 恢复按钮状态（不重置文案，保持Regenerate状态）
        generateImageBtn.disabled = false;
        

        
        // 更新翻译
        updateTranslations();
    }
}

// 图像生成API调用
async function generateDreamImage(dreamText, analysis) {
    try {
        // 获取当前语言设置
        let language = 'en'; 
        if (typeof window.getCurrentLanguage !== 'undefined') {
            language = window.getCurrentLanguage();
        }
        
        const response = await fetch('/api/generate-image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                dream: dreamText,
                analysis: analysis,
                language: language
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || '图像生成失败');
        }
        
        const data = await response.json();
        return data;
        
    } catch (error) {
        console.error('图像生成API错误:', error);
        throw error;
    }
}

// 显示加载状态
function displayLoadingState() {
    // 确保imageContainer已初始化
    if (!imageContainer) {
        imageContainer = document.getElementById('image-container');
    }
    
    if (imageContainer) {
        // 检查当前按钮状态，决定显示什么文案
        const generateImageBtn = document.getElementById('generate-image-btn');
        const currentButtonText = generateImageBtn ? generateImageBtn.querySelector('span').textContent : '';
        const isRegenerating = currentButtonText === 'Regenerate' || currentButtonText === '重新生成' || currentButtonText === 'Regenerar';
        
        const loadingText = isRegenerating ? 'AI正在为您重新生成梦境图像...' : 'AI正在为您生成梦境图像...';
        
        imageContainer.innerHTML = `
            <div class="image-loading-state">
                <div class="loading-spinner">
                    <div class="spinner"></div>
                </div>
                <p class="loading-text">${loadingText}</p>
                <p class="loading-subtext">请耐心等待1-2分钟</p>
            </div>
        `;
    } else {
        console.error('imageContainer元素未找到');
    }
}

// 显示生成的图像
function displayGeneratedImage(imageUrl) {
    // 确保imageContainer已初始化
    if (!imageContainer) {
        imageContainer = document.getElementById('image-container');
    }
    
    if (imageContainer) {
        imageContainer.innerHTML = `
            <div class="generated-image-container">
                <div class="image-wrapper">
                    <img src="${imageUrl}" alt="梦境图像" class="generated-image" onload="this.style.opacity='1'">
                    <div class="watermark">by Moon Zen AI</div>
                </div>
            </div>
        `;
        
        // 更新生成按钮文案为"Regenerate"
        updateGenerateButtonToRegenerate();
        
        // 不再自动添加到Dream Gallery，保护用户隐私
        // addToDreamGallery(currentDream, imageUrl);
    } else {
        console.error('imageContainer元素未找到');
    }
}

// 轮询4oimage结果
async function poll4oimageResult(taskId) {

    
    const maxAttempts = 40; // 最多轮询40次（2分钟）
    const interval = 3000; // 每3秒轮询一次
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
    
            
            // 查询任务结果
            const response = await fetch(`/api/4oimage-result/${taskId}`);
            const data = await response.json();
            
            if (data.success && data.result && data.result.imageUrl) {
                // console.log('✅ 获得4oimage生成的图片:', data.result.imageUrl);
                
                // 更新显示的图片
                displayGeneratedImage(data.result.imageUrl);
                showNotification('AI图像生成完成！', 'success');
                return;
                
            } else if (data.success && data.result && data.result.status === 'processing') {
                // console.log('图片仍在生成中...');
                // 更新加载状态文本
                updateLoadingText(attempt, maxAttempts);
                
            } else {
                // console.log('查询结果:', data);
            }
            
        } catch (error) {
            console.error('轮询查询失败:', error);
        }
        
        // 等待后继续轮询
        if (attempt < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, interval));
        }
    }
    
    // 轮询超时
    // console.log('轮询超时，显示错误信息');
    displayTimeoutState();
    showNotification('AI图像生成超时，请重试', 'error');
}

// 更新加载状态文本
function updateLoadingText(attempt, maxAttempts) {
    const loadingText = document.querySelector('.loading-text');
    const loadingSubtext = document.querySelector('.loading-subtext');
    
    if (loadingText && loadingSubtext) {
        const progress = Math.round((attempt / maxAttempts) * 100);
        loadingText.textContent = `AI正在为您生成梦境图像... (${progress}%)`;
        loadingSubtext.textContent = `预计还需 ${Math.max(1, Math.round((maxAttempts - attempt) * 3 / 60))} 分钟`;
    }
}

// 显示超时状态
function displayTimeoutState() {
    // 确保imageContainer已初始化
    if (!imageContainer) {
        imageContainer = document.getElementById('image-container');
    }
    
    if (imageContainer) {
        imageContainer.innerHTML = `
            <div class="image-timeout-state">
                <div class="timeout-icon">
                    <i class="fas fa-clock"></i>
                </div>
                <p class="timeout-text">AI图像生成超时</p>
                <p class="timeout-subtext">请重新点击生成按钮重试</p>
            </div>
        `;
    } else {
        console.error('imageContainer元素未找到');
    }
}





// 更新生成按钮为Regenerate状态
function updateGenerateButtonToRegenerate() {
    const generateImageBtn = document.getElementById('generate-image-btn');
    if (generateImageBtn) {
        generateImageBtn.innerHTML = '<i class="fas fa-redo"></i> <span data-translate="regenerate-btn">Regenerate</span>';
        generateImageBtn.onclick = handleImageGeneration; // 重新绑定点击事件
        updateTranslations(); // 更新翻译
    }
}

// 重置生成按钮为初始状态
function resetGenerateButton() {
    const generateImageBtn = document.getElementById('generate-image-btn');
    if (generateImageBtn) {
        generateImageBtn.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> <span data-translate="generate-image-btn">Generate Dream Image</span>';
        generateImageBtn.onclick = handleImageGeneration; // 重新绑定点击事件
        updateTranslations(); // 更新翻译
    }
}



// 添加到Dream Gallery
function addToDreamGallery(dreamText, imageUrl, customDate = null) {
    // 隐藏占位符
    galleryPlaceholder.style.display = 'none';
    
    // 创建画廊项目
    const galleryItem = document.createElement('div');
    galleryItem.className = 'gallery-item';
    
    const dreamTitle = dreamText.length > 50 ? dreamText.substring(0, 50) + '...' : dreamText;
    const currentDate = customDate || new Date().toLocaleDateString();
    
    // 保持图片原有尺寸和比例
    galleryItem.innerHTML = `
        <img src="${imageUrl}" alt="Dream Image" class="gallery-item-image" 
             onerror="this.src='https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop'">
        <div class="gallery-item-content">
            <div class="gallery-item-title">${dreamTitle}</div>
            <div class="gallery-item-dream">${dreamText}</div>
            <div class="gallery-item-date">${currentDate}</div>
        </div>
    `;
    
    // 添加到画廊开头
    galleryGrid.insertBefore(galleryItem, galleryGrid.firstChild);
}

// 瀑布流布局函数
function initMasonryLayout() {
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;
    
    // 重置grid样式以支持瀑布流
    grid.style.display = 'block';
    grid.style.columnCount = '4';
    grid.style.columnGap = '20px';
    grid.style.columnFill = 'balance';
    
    // 响应式调整
    function adjustColumns() {
        const width = window.innerWidth;
        if (width <= 480) {
            grid.style.columnCount = '1';
            grid.style.columnGap = '16px';
        } else if (width <= 768) {
            grid.style.columnCount = '2';
            grid.style.columnGap = '16px';
        } else if (width <= 1024) {
            grid.style.columnCount = '3';
            grid.style.columnGap = '18px';
        } else {
            grid.style.columnCount = '4';
            grid.style.columnGap = '20px';
        }
    }
    
    adjustColumns();
    window.addEventListener('resize', adjustColumns);
}

// 初始化Dream Gallery
function initDreamGallery() {
    // 使用public/images中的所有图片，按文件名排序
    const allImages = [
        "/images/arr22.png",
        "/images/art1.png",
        "/images/art2.webp",
        "/images/art3.png",
        "/images/art4.png",
        "/images/art5.png",
        "/images/art6.jpeg",
        "/images/art7.png",
        "/images/art8.png",
        "/images/art9.png",
        "/images/art10.png",
        "/images/art11.png",
        "/images/art12.png",
        "/images/art13.jpg",
        "/images/art14.png",
        "/images/art15.jpeg",
        "/images/art16.png",
        "/images/art17.png",
        "/images/art18.png",
        "/images/art19.png",
        "/images/art20.png",
        "/images/art21.png"
    ];
    
    // 多语言梦境描述模板
    const dreamTemplates = [
        // 英文梦境
        "I dreamed of an ethereal garden where time flows like water",
        "I dreamed of a mystical forest where light dances between the trees",
        "I dreamed of floating islands connected by bridges of light",
        "I dreamed of soaring through ethereal clouds in a dreamlike sky",
        "I dreamed of a peaceful meditation garden with flowing water",
        "I dreamed of a magical underwater kingdom with golden light",
        "I dreamed of an artist's sanctuary filled with crystals and creativity",
        "I dreamed of a celestial palace surrounded by golden clouds",
        "I dreamed of a mystical realm where music creates colors",
        "I dreamed of an enchanted forest where ancient trees whisper secrets",
        "I dreamed of a rainbow bridge leading to angelic beings",
        "I dreamed of a crystal cave filled with healing light",
        "I dreamed of a fantasy world with magical creatures",
        "I dreamed of a cosmic dance of stars and galaxies",
        "I dreamed of a sacred temple floating in the sky",
        "I dreamed of a golden sunset over mystical mountains",
        "I dreamed of a dreamy landscape where reality blends with fantasy",
        "I dreamed of a magical workshop where dreams come to life",
        "I dreamed of a serene lake reflecting the moon's glow",
        "I dreamed of a celestial garden where flowers bloom in starlight",
        "I dreamed of a mystical portal to another dimension",
        "I dreamed of a peaceful sanctuary where time stands still",
        
        // 中文梦境
        "梦见在神秘的极光下与星辰对话",
        "梦见在梦幻般的花园中与蝴蝶共舞",
        "梦见神秘魔法师在紫色光芒中施展魔法",
        "梦见在神秘的水晶洞穴中发现治愈之光",
        "梦见漂浮在宁静的紫色云海中",
        "梦见在满月下静心冥想，被自然包围",
        "梦见在彩虹桥上遇见天使般的存在",
        "梦见在星空下的神秘城堡中探索",
        "梦见在神秘的魔法森林中漫步",
        "梦见在金色的云海中自由翱翔",
        "梦见在月光下的水晶宫殿中冥想",
        "梦见在彩虹瀑布下沐浴圣光",
        "梦见在神秘的极地冰宫中探索",
        "梦见在星空下的魔法花园中漫步",
        "梦见在金色的沙漠中寻找绿洲",
        "梦见在神秘的古代遗迹中冥想",
        "梦见在彩虹桥上与天使对话",
        "梦见在星空下的魔法森林中探索",
        "梦见在金色的云海中寻找真理",
        "梦见在月光下的水晶洞穴中冥想",
        "梦见在神秘的魔法城堡中漫步",
        "梦见在彩虹瀑布下寻找智慧",
        
        // 西班牙语梦境
        "Soñé con un reino celestial donde la música crea colores",
        "Soñé trabajando en casa con mi bebé en un mundo etéreo",
        "Soñé con un jardín encantado lleno de flores luminosas",
        "Soñé con un palacio celestial rodeado de nubes doradas y luz divina",
        "Soñé con un bosque encantado donde las luces danzan entre los árboles antiguos",
        "Soñé con montañas majestuosas y pueblos coloridos en el Himalaya",
        "Soñé con un mundo de fantasía lleno de criaturas mágicas y paisajes encantados",
        "Soñé con un santuario místico donde el tiempo se detiene",
        "Soñé con un portal dimensional hacia reinos desconocidos",
        "Soñé con un jardín cósmico donde las estrellas florecen",
        "Soñé con un templo sagrado flotando en las nubes",
        "Soñé con una danza celestial de luces y colores",
        "Soñé con un bosque mágico donde los árboles cantan",
        "Soñé con un lago sereno reflejando la luz lunar",
        "Soñé con un castillo místico en las montañas doradas",
        "Soñé con un reino submarino lleno de tesoros",
        "Soñé con un jardín de cristal donde la paz reina",
        "Soñé con un puente arcoíris hacia la eternidad",
        "Soñé con una cueva de cristal llena de sabiduría",
        "Soñé con un palacio de hielo en el polo norte",
        "Soñé con un desierto dorado donde el tiempo se pierde",
        "Soñé con un santuario místico en las alturas"
    ];
    
    // 生成随机日期（最近30天内）
    function getRandomDate() {
        const now = new Date();
        const daysAgo = Math.floor(Math.random() * 30);
        const date = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
        return date.toISOString().split('T')[0];
    }
    
    // 创建gallery项目
    const sampleDreams = allImages.map((image, index) => {
        const dreamIndex = index % dreamTemplates.length;
        return {
            dream: dreamTemplates[dreamIndex],
            image: image,
            date: getRandomDate()
        };
    });
    
    if (sampleDreams.length > 0) {
        galleryPlaceholder.style.display = 'none';
        
        sampleDreams.forEach(dream => {
            addToDreamGallery(dream.dream, dream.image, dream.date);
        });
        
        // 初始化瀑布流布局
        setTimeout(() => initMasonryLayout(), 100);
    } else {
        galleryPlaceholder.style.display = 'block';
    }
}

// 通知系统
function showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // 添加样式
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#B399D4' : type === 'error' ? '#E2C4F7' : '#8A7CBF'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(93, 53, 135, 0.3);
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 0.9rem;
        font-family: 'Playfair Display', serif;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    // 添加到页面
    document.body.appendChild(notification);
    
    // 显示动画
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // 自动隐藏
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// 键盘快捷键
document.addEventListener('keydown', (e) => {
    // Ctrl+Enter 或 Cmd+Enter 提交梦境分析
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleDreamAnalysis();
    }
});

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', () => {
    // console.log('页面DOM加载完成，开始初始化...');
    
    // 获取DOM元素
    dreamInput = document.getElementById('dream-input');
    analyzeBtn = document.getElementById('analyze-btn');
    resultsSection = document.getElementById('results-section');
    loadingSpinner = document.getElementById('loading-spinner');
    analysisResult = document.getElementById('analysis-result');
    analysisContent = document.getElementById('analysis-content');
    imageGeneration = document.getElementById('image-generation');
    imageContainer = document.getElementById('image-container');
    generateImageBtn = document.getElementById('generate-image-btn');
    inputHint = document.getElementById('input-hint');
    
    // 主要DOM元素获取完成
    
    // 语言下拉菜单元素
    languageDropdown = document.querySelector('.language-dropdown');
    languageDropdownBtn = document.getElementById('language-dropdown-btn');
    languageDropdownContent = document.getElementById('language-dropdown-content');
    currentLanguageSpan = document.getElementById('current-language');
    
    // 语言切换元素获取完成
    
    // 画廊元素
    dreamGallery = document.getElementById('dream-gallery');
    galleryGrid = document.getElementById('gallery-grid');
    galleryPlaceholder = document.getElementById('gallery-placeholder');
    
    // 初始化语言
    initLanguage();
    
    // 初始化语言下拉菜单事件
    if (languageDropdownBtn) {
        // console.log('正在绑定语言切换按钮事件...');
        languageDropdownBtn.addEventListener('click', (e) => {
            // console.log('语言切换按钮被点击');
            toggleLanguageDropdown(e);
        });
        document.addEventListener('click', handleLanguageDropdownClick);
        
        const languageOptions = document.querySelectorAll('.language-option');
        // console.log('找到语言选项数量:', languageOptions.length);
        
        languageOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                // console.log('语言选项被点击:', option.dataset.lang);
                e.preventDefault();
                e.stopPropagation();
                selectLanguage(option.dataset.lang);
            });
        });
    } else {
        console.error('语言切换按钮未找到！');
    }
    
    // 初始化Dream Gallery
    initDreamGallery();
    
    // 绑定事件监听器 - 在语言初始化之后
    if (analyzeBtn) {
        // console.log('正在绑定分析按钮事件...');
        // 先移除可能存在的旧事件监听器
        analyzeBtn.removeEventListener('click', handleDreamAnalysis);
        
        // 添加新的事件监听器
        analyzeBtn.addEventListener('click', (e) => {
            // console.log('分析按钮被点击');
            handleDreamAnalysis();
        });
        
        // 确保按钮可以点击
        analyzeBtn.style.pointerEvents = 'auto';
        analyzeBtn.style.cursor = 'pointer';
        
        // 分析按钮事件绑定完成
    } else {
        console.error('找不到analyze按钮！');
    }
    
    if (generateImageBtn) {
        generateImageBtn.addEventListener('click', handleImageGeneration);
    } else {
        console.error('找不到generate按钮！');
    }
    
    // 输入框事件
    dreamInput.addEventListener('input', handleDreamInput);
    dreamInput.addEventListener('focus', showInputHint);
    dreamInput.addEventListener('blur', hideInputHint);
    
    // 添加按钮点击效果（排除analyze按钮和generate按钮，因为它们已经有自己的事件处理）
    const buttons = document.querySelectorAll('button:not(#analyze-btn):not(#generate-image-btn)');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
});

// 语言下拉菜单切换
function toggleLanguageDropdown(e) {
    e.stopPropagation();
    languageDropdown.classList.toggle('active');
}

// 处理语言下拉菜单点击
function handleLanguageDropdownClick(e) {
    if (!languageDropdown.contains(e.target)) {
        languageDropdown.classList.remove('active');
    }
}

// 处理语言选择
function selectLanguage(lang) {
    // console.log('正在切换语言到:', lang);
    
    // 调用translations.js中的switchLanguage函数来处理语言切换
    switchLanguage(lang);
    languageDropdown.classList.remove('active');
    
    // 验证语言是否正确切换
    setTimeout(() => {
        const currentLang = getCurrentLanguage();
        // console.log('语言切换后，当前语言:', currentLang);
    }, 100);
    
    // 更新当前语言显示
    const languageNames = {
        'en': 'English',
        'es': 'Español',
        'zh': '中文'
    };
    currentLanguageSpan.textContent = languageNames[lang];
    
    // 更新选项状态
    document.querySelectorAll('.language-option').forEach(option => {
        option.classList.remove('active');
        if (option.dataset.lang === lang) {
            option.classList.add('active');
        }
    });
}

// 处理梦境输入
function handleDreamInput() {
    const dreamText = dreamInput.value.trim();
    if (dreamText.length > 0) {
        showInputHint();
    } else {
        hideInputHint();
    }
}

// 显示输入提示
function showInputHint() {
    inputHint.classList.add('show');
}

// 隐藏输入提示
function hideInputHint() {
    setTimeout(() => {
        inputHint.classList.remove('show');
    }, 300);
} 
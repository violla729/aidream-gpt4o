const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 静态文件服务 - 适配Vercel环境
const path = require('path');
app.use(express.static(path.join(__dirname)));
app.use('/public', express.static(path.join(__dirname, 'public')));

// 根路径处理 - 确保index.html能被正确访问
app.get('/', (req, res) => {
    console.log('根路径请求，返回index.html');
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 确保其他静态文件也能被访问
app.get('/styles.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'styles.css'));
});

app.get('/script.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'script.js'));
});

app.get('/translations.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'translations.js'));
});

// 环境变量配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const FOURO_IMAGE_API_KEY = process.env.FOURO_IMAGE_API_KEY;

// 4oimageapi.io API配置
const FOURO_IMAGE_API_URL = 'https://4oimageapiio.erweima.ai';
const FOURO_IMAGE_API_ENDPOINT = '/api/v1/gpt4o-image/generate';

// 多语言提示模板
const dreamAnalysisPrompts = {
    en: {
        systemMessage: 'You are a professional dream analyst and psychological healer, skilled in using warm, understanding, and insightful language to interpret dreams and help people better understand their inner worlds.',
        promptTemplate: (dream) => `Please analyze the following dream in a professional and healing manner:

Dream description: ${dream}

Please analyze from the following perspectives:
1. Basic meaning and symbolic significance of the dream
2. Possible psychological states and emotions reflected
3. Messages the subconscious wants to convey
4. Insights and suggestions for real life
5. Healing interpretation and recommendations

Please respond with warm, understanding, and insightful language to help the user better understand their inner world. Please reply in English with detailed and healing content.`
    },
    zh: {
        systemMessage: '你是一位专业的梦境分析师和心理疗愈师，擅长用温暖、理解且富有洞察力的语言来解析梦境，帮助人们更好地理解自己的内心世界。',
        promptTemplate: (dream) => `请以专业且疗愈的方式解析以下梦境：

梦境描述：${dream}

请从以下角度进行分析：
1. 梦境的基本含义和象征意义
2. 可能反映的心理状态和情感
3. 潜意识想要传达的信息
4. 对现实生活的启示和建议
5. 疗愈性的解读和建议

请用温暖、理解且富有洞察力的语言来回应，帮助用户更好地理解自己的内心世界。请用中文回复，内容要详细且具有疗愈性。`
    },
    es: {
        systemMessage: 'Eres un analista profesional de sueños y sanador psicológico, hábil en usar un lenguaje cálido, comprensivo y perspicaz para interpretar sueños y ayudar a las personas a entender mejor sus mundos interiores. IMPORTANTE: Debes responder ÚNICAMENTE en español, sin excepción.',
        promptTemplate: (dream) => `Por favor analiza el siguiente sueño de manera profesional y sanadora:

Descripción del sueño: ${dream}

Por favor analiza desde las siguientes perspectivas:
1. Significado básico e importancia simbólica del sueño
2. Posibles estados psicológicos y emociones reflejadas
3. Mensajes que el subconsciente quiere transmitir
4. Perspectivas y sugerencias para la vida real
5. Interpretación sanadora y recomendaciones

Por favor responde con un lenguaje cálido, comprensivo y perspicaz para ayudar al usuario a entender mejor su mundo interior. 

IMPORTANTE: Tu respuesta debe ser COMPLETAMENTE en español. No uses ninguna palabra en inglés u otro idioma. Responde con contenido detallado y sanador, todo en español.`
    }
};

// DeepSeek梦境解析API
app.post('/api/analyze-dream', async (req, res) => {
    try {
        const { dream, language = 'en' } = req.body;
        
        // 生产环境日志记录
        console.log(`[${new Date().toISOString()}] 梦境分析请求 - 语言: ${language}, 梦境长度: ${dream ? dream.length : 0}`);
        
        if (!dream) {
            const errorMessages = {
                en: 'Dream description cannot be empty',
                zh: '梦境描述不能为空',
                es: 'La descripción del sueño no puede estar vacía'
            };
            return res.status(400).json({ error: errorMessages[language] || errorMessages.en });
        }
        
        // 详细的API密钥检查日志
        console.log(`[${new Date().toISOString()}] API密钥检查:`);
        console.log(`  - DEEPSEEK_API_KEY exists: ${!!DEEPSEEK_API_KEY}`);
        console.log(`  - DEEPSEEK_API_KEY length: ${DEEPSEEK_API_KEY ? DEEPSEEK_API_KEY.length : 0}`);
        console.log(`  - DEEPSEEK_API_KEY starts with sk-: ${DEEPSEEK_API_KEY ? DEEPSEEK_API_KEY.startsWith('sk-') : false}`);
        console.log(`  - Environment: ${process.env.NODE_ENV || 'development'}`);
        
        if (!DEEPSEEK_API_KEY) {
            console.error(`[${new Date().toISOString()}] 错误: DeepSeek API密钥未配置`);
            const errorMessages = {
                en: 'DeepSeek API key not configured',
                zh: 'DeepSeek API密钥未配置',
                es: 'Clave API de DeepSeek no configurada'
            };
            return res.status(500).json({ error: errorMessages[language] || errorMessages.en });
        }
        
        // 获取对应语言的提示模板
        const languagePrompts = dreamAnalysisPrompts[language] || dreamAnalysisPrompts.en;
        const prompt = languagePrompts.promptTemplate(dream);
        
        console.log(`[${new Date().toISOString()}] 准备调用DeepSeek API...`);

        // 创建axios实例，配置重试机制
        const axiosInstance = axios.create({
            timeout: 90000, // 90秒超时
            headers: {
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        // 添加请求拦截器，记录请求开始时间
        const startTime = Date.now();
        console.log(`[${new Date().toISOString()}] 开始API请求，超时时间: 90秒`);

        // 简单的重试机制
        let response;
        let lastError;
        
        for (let attempt = 1; attempt <= 2; attempt++) {
            try {
                console.log(`[${new Date().toISOString()}] 第${attempt}次尝试调用DeepSeek API...`);
                
                response = await axiosInstance.post('https://api.deepseek.com/v1/chat/completions', {
                    model: 'deepseek-chat',
                    messages: [
                        {
                            role: 'system',
                            content: languagePrompts.systemMessage
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: 600, // 进一步减少token数量
                    temperature: 0.7,
                    stream: false // 确保不使用流式响应
                });
                
                const endTime = Date.now();
                console.log(`[${new Date().toISOString()}] API请求完成，耗时: ${endTime - startTime}ms`);
                break; // 成功则跳出循环
                
            } catch (error) {
                lastError = error;
                console.error(`[${new Date().toISOString()}] 第${attempt}次尝试失败:`, error.message);
                
                if (attempt < 2) {
                    console.log(`[${new Date().toISOString()}] 等待2秒后重试...`);
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            }
        }
        
        if (!response) {
            throw lastError; // 如果所有尝试都失败，抛出最后一个错误
        }
        
        console.log(`[${new Date().toISOString()}] DeepSeek API调用成功`);
        
        const analysis = response.data.choices[0].message.content;
        
        res.json({ analysis });
        
    } catch (error) {
        console.error(`[${new Date().toISOString()}] 梦境分析API错误:`, error.message);
        
        // 详细的错误信息记录
        if (error.response) {
            console.error(`  - 响应状态: ${error.response.status}`);
            console.error(`  - 响应数据:`, error.response.data);
            console.error(`  - 响应头:`, error.response.headers);
        } else if (error.request) {
            console.error(`  - 请求错误: ${error.request}`);
        } else {
            console.error(`  - 其他错误: ${error.message}`);
        }
        
        const { language = 'en' } = req.body;
        
        // 多语言错误消息
        const errorMessages = {
            rateLimited: {
                en: 'Too many requests, please try again later',
                zh: '请求过于频繁，请稍后重试',
                es: 'Demasiadas solicitudes, inténtalo de nuevo más tarde'
            },
            invalidKey: {
                en: 'Invalid API key, please check configuration',
                zh: 'API密钥无效，请检查配置',
                es: 'Clave API inválida, verifica la configuración'
            },
            timeout: {
                en: 'Request timeout, please try again',
                zh: '请求超时，请重试',
                es: 'Tiempo de espera agotado, inténtalo de nuevo'
            },
            networkError: {
                en: 'Network error, please check your connection',
                zh: '网络错误，请检查连接',
                es: 'Error de red, verifica tu conexión'
            },
            generalError: {
                en: 'Dream analysis failed, please try again later',
                zh: '梦境分析失败，请稍后重试',
                es: 'Análisis de sueños falló, inténtalo de nuevo más tarde'
            }
        };
        
        // 处理不同类型的错误
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
            res.status(408).json({ error: errorMessages.timeout[language] || errorMessages.timeout.en });
        } else if (error.response && error.response.status === 429) {
            res.status(429).json({ error: errorMessages.rateLimited[language] || errorMessages.rateLimited.en });
        } else if (error.response && error.response.status === 401) {
            res.status(401).json({ error: errorMessages.invalidKey[language] || errorMessages.invalidKey.en });
        } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            res.status(503).json({ error: errorMessages.networkError[language] || errorMessages.networkError.en });
        } else {
            res.status(500).json({ error: errorMessages.generalError[language] || errorMessages.generalError.en });
        }
    }
});

// 多语言图像生成消息
const imageGenerationMessages = {
    en: {
        emptyDream: 'Dream description cannot be empty',
        fallbackMessage: 'Due to technical limitations, we provided a related healing image for you',
        presetMessage: 'We provided a healing-style image to help you better understand your dream',
        errorMessage: 'Image generation is temporarily unavailable, but dream analysis function is normal',
        continueMessage: 'You can continue to use the dream analysis function'
    },
    zh: {
        emptyDream: '梦境描述不能为空',
        fallbackMessage: '由于技术限制，为您提供了相关的疗愈图像',
        presetMessage: '为您提供了一张疗愈风格的图像，希望能帮助您更好地理解梦境',
        errorMessage: '图像生成暂时不可用，但梦境分析功能正常',
        continueMessage: '您可以继续使用梦境分析功能'
    },
    es: {
        emptyDream: 'La descripción del sueño no puede estar vacía',
        fallbackMessage: 'Debido a limitaciones técnicas, te proporcionamos una imagen sanadora relacionada',
        presetMessage: 'Te proporcionamos una imagen de estilo sanador para ayudarte a entender mejor tu sueño',
        errorMessage: 'La generación de imágenes no está disponible temporalmente, pero la función de análisis de sueños funciona normalmente',
        continueMessage: 'Puedes continuar usando la función de análisis de sueños'
    }
};

// 图像生成API - 使用多种方案
app.post('/api/generate-image', async (req, res) => {
    try {
        const { dream, analysis, language = 'en', artStyle = 'watercolor' } = req.body;
        
        const messages = imageGenerationMessages[language] || imageGenerationMessages.en;
        
        if (!dream) {
            return res.status(400).json({ error: messages.emptyDream });
        }
        
        // 方案1：使用4oimageapi.io GPT-4o图像生成（混合模式）
        try {
            if (!FOURO_IMAGE_API_KEY) {
                throw new Error('4oimageapi.io API key not configured');
            }

            // 生成适合GPT-4o的英文提示词
            const gpt4oPrompt = await generateDallePrompt(dream, language, artStyle);
            
    

            // 使用4oimageapi.io API生成图像任务
            // 检查是否有公网URL，没有则使用空回调（轮询模式）
            const baseUrl = process.env.PUBLIC_URL;
            const callbackUrl = baseUrl ? `${baseUrl}/api/4oimage-callback` : "";
            
    
            
            const response = await axios.post(`${FOURO_IMAGE_API_URL}${FOURO_IMAGE_API_ENDPOINT}`, {
                filesUrl: [], // 我们是文本到图像，不需要输入图像
                prompt: gpt4oPrompt,
                size: "1:1", // 方形图像
                num: 1, // 明确指定只生成1张图片
                callBackUrl: callbackUrl // 如果有公网URL则使用回调，否则为空
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${FOURO_IMAGE_API_KEY}`
                }
            });
            


            
            // 4oimageapi.io任务创建成功
            if (response.data && response.data.code === 200 && response.data.data && response.data.data.taskId) {
                const taskId = response.data.data.taskId;

                
                // 4oimage任务已提交，模拟回调机制

                
                // 多语言等待消息
                const waitingMessage = {
                    en: `Your AI image generation task has been submitted. Please wait 1-2 minutes for the AI to create your dream image.`,
                    zh: `您的AI图像生成任务已提交。请等待1-2分钟，AI正在为您创建梦境图像。`,
                    es: `Su tarea de generación de imágenes AI ha sido enviada. Por favor espere 1-2 minutos para que la IA cree su imagen de sueño.`
                };
                
                return res.json({ 
                    taskId: taskId,
                    source: '4oimageapi.io-waiting',
                    message: waitingMessage[language] || waitingMessage.en,
                    status: 'processing',
                    note: '4oimageapi.io task submitted, waiting for real AI generation'
                });
            } else {
                throw new Error('Invalid response format from 4oimageapi.io: ' + JSON.stringify(response.data));
            }
            
        } catch (fourOError) {

            if (fourOError.response) {

            }
            
            // 方案2：使用Unsplash API获取相关图像
            try {
                const searchTerm = getImageSearchTerm(dream);
                const unsplashResponse = await axios.get(`https://api.unsplash.com/search/photos`, {
                    params: {
                        query: searchTerm,
                        orientation: 'landscape',
                        per_page: 1
                    },
                    headers: {
                        'Authorization': 'Client-ID YOUR_UNSPLASH_ACCESS_KEY'
                    }
                });
                
                if (unsplashResponse.data.results.length > 0) {
                    const imageUrl = unsplashResponse.data.results[0].urls.regular;
                    return res.json({ 
                        imageUrl, 
                        source: 'unsplash',
                        message: messages.fallbackMessage
                    });
                }
            } catch (unsplashError) {
    
            }
            
            // 方案3：返回预设的疗愈图像
            const healingImages = [
                'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop'
            ];
            
            const randomImage = healingImages[Math.floor(Math.random() * healingImages.length)];
            
            res.json({ 
                imageUrl: randomImage, 
                source: 'preset',
                message: messages.presetMessage
            });
        }
        
    } catch (error) {
        console.error('图像生成API错误:', error);
        
        const { language = 'en' } = req.body;
        const messages = imageGenerationMessages[language] || imageGenerationMessages.en;
        
        res.status(500).json({ 
            error: messages.errorMessage,
            message: messages.continueMessage
        });
    }
});

// 轮询4oimageapi.io任务结果
async function pollTaskResult(taskId, apiKey, maxAttempts = 30, interval = 2000) {

    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            const endpoint =                 `/api/v1/gpt4o-image/record-info`   
            
                try {
        
                    
                    const response = await axios.get(`${FOURO_IMAGE_API_URL}${endpoint}`, {
                        params: {
                            taskId: taskId
                        },
                        headers: {
                            'Accept': 'application/json',
                            'Authorization': `Bearer ${apiKey}`
                        },
                        timeout: 10000
                    });
                    

                    
                    // 检查任务是否完成
                    if (response.data && response.data.code === 200) {
                        const data = response.data.data;
                        
                        // 检查4oimage API的新响应格式
                        if (data.status === 'SUCCESS' && data.response && data.response.resultUrls && data.response.resultUrls.length > 0) {
                            const imageUrl = data.response.resultUrls[0];


                            return imageUrl;
                        }
                        
                        // 检查任务状态
                        const status = data.status || data.state;
                        if (status === 'SUCCESS') {

                        } else if (status === 'FAILED' || status === 'ERROR') {


                            return null;
                        } else if (status === 'PROCESSING' || status === 'PENDING') {

                        } else {

                        }
                    }
                    
                    // 如果这个端点有效响应，跳出端点循环
                    break;
                    
                } catch (endpointError) {

                    // 继续尝试下一个端点
                    continue;
                }
            
            
            // 等待后重试
            if (attempt < maxAttempts) {
    
                await new Promise(resolve => setTimeout(resolve, interval));
            }
            
        } catch (error) {

            
            if (attempt < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, interval));
            }
        }
    }
    

    return null;
}

// 画风映射函数
function getArtStylePrompt(artStyle) {
    const styleMap = {
        'watercolor': 'Soft, flowing watercolor style with gentle transitions of color and organic brushstrokes that evoke a dreamy, ethereal mood',
        'cartoon': 'Whimsical cartoon style featuring cute and friendly characters, vibrant colors, bold outlines, and a lighthearted, childlike tone',
        'oil': 'Rich classical oil painting style with textured brushstrokes, deep colors, and a timeless, museum-like aesthetic',
        'webtoon': 'Clean and modern Korean webtoon style with crisp lines, vivid colors, and expressive characters, like a digital storybook',
        'chibi': 'Playful chibi style with oversized heads, tiny bodies, and adorable proportions, radiating cuteness and simplicity',
        'lineart': 'Minimalist clean line art with precise outlines, little to no shading, and elegant simplicity in black and white'
    };
    
    return styleMap[artStyle] || styleMap['watercolor'];
}

// 生成适合DALL-E的图像提示词
async function generateDallePrompt(dream, language, artStyle = 'watercolor') {
    // 将梦境描述转换为英文（DALL-E在英文提示词下效果最佳）
    let dreamInEnglish = dream;
    
    // 如果是其他语言，调用DeepSeek API进行翻译
    if (language === 'zh') {
        // 对于中文梦境，使用DeepSeek API翻译
        dreamInEnglish = await translateChineseDreamToEnglish(dream);
    } else if (language === 'es') {
        // 对于西班牙语梦境，使用DeepSeek API翻译
        dreamInEnglish = await translateSpanishDreamToEnglish(dream);
    }
    
    // 获取选择的画风描述
    const styleDescription = getArtStylePrompt(artStyle);
    
    // 构建高质量的DALL-E提示词
    const dallePrompt = `Create a high-quality healing dreamscape illustration based on the following dream: "${dreamInEnglish}".

🎯 Content Guidance:
- Faithfully include and gently reinterpret the key elements of the dream.
- Use visual metaphors to transform pain, fear, or confusion into beauty, serenity.

🎨 Artistic Style:
${styleDescription}

🚫 Avoid:
- Literal or graphic negative imagery (e.g. wounds, blood, fear)
- Any overly busy or chaotic composition
- Horror, surreal grotesque, or uncanny styles

🖼️ Output Format:
1:1 square, Center composition, high-resolution illustration, painterly and emotionally expressive. Aimed for dream journaling, therapy, or meditation use.`;
    
    return dallePrompt;
}

// 辅助函数：将中文梦境转换为英文（使用DeepSeek API）
async function translateChineseDreamToEnglish(dream) {
    try {
        console.log(`[${new Date().toISOString()}] 开始翻译中文梦境: ${dream.substring(0, 50)}...`);
        
        const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
            model: 'deepseek-chat',
            messages: [
                {
                    role: 'system',
                    content: 'You are a professional translator specializing in dream interpretation. Your task is to translate Chinese dream descriptions into natural, fluent English that preserves the emotional and symbolic meaning of the dream. Focus on creating vivid, descriptive English text that would be suitable for AI image generation.'
                },
                {
                    role: 'user',
                    content: `Please translate the following Chinese dream description into natural, fluent English. Make sure to preserve the emotional tone and symbolic meaning, and create vivid imagery suitable for AI image generation:

Chinese dream: "${dream}"

Please provide only the English translation, without any explanations or additional text.`
                }
            ],
            max_tokens: 300,
            temperature: 0.7
        }, {
            headers: {
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });
        
        const translation = response.data.choices[0].message.content.trim();
        console.log(`[${new Date().toISOString()}] 中文梦境翻译完成: ${translation.substring(0, 50)}...`);
        
        return translation;
        
    } catch (error) {
        console.error(`[${new Date().toISOString()}] 中文梦境翻译失败:`, error.message);
        
        // 如果翻译失败，回退到关键词匹配
        const dreamLower = dream.toLowerCase();
        let englishElements = [];
        
        if (dreamLower.includes('飞') || dreamLower.includes('飞翔')) {
            englishElements.push('flying through the sky');
        }
        if (dreamLower.includes('花') || dreamLower.includes('花园')) {
            englishElements.push('beautiful garden with colorful flowers');
        }
        if (dreamLower.includes('海') || dreamLower.includes('水')) {
            englishElements.push('peaceful ocean or flowing water');
        }
        if (dreamLower.includes('森林') || dreamLower.includes('树')) {
            englishElements.push('enchanted forest with tall trees');
        }
        if (dreamLower.includes('天空') || dreamLower.includes('云')) {
            englishElements.push('expansive sky with soft clouds');
        }
        if (dreamLower.includes('动物')) {
            englishElements.push('gentle animals');
        }
        if (dreamLower.includes('光') || dreamLower.includes('阳光')) {
            englishElements.push('warm golden light');
        }
        
        return englishElements.length > 0 ? englishElements.join(', ') : 'a peaceful and beautiful dreamscape';
    }
}

// 辅助函数：将西班牙语梦境转换为英文（使用DeepSeek API）
async function translateSpanishDreamToEnglish(dream) {
    try {
        console.log(`[${new Date().toISOString()}] 开始翻译西班牙语梦境: ${dream.substring(0, 50)}...`);
        
        const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
            model: 'deepseek-chat',
            messages: [
                {
                    role: 'system',
                    content: 'You are a professional translator specializing in dream interpretation. Your task is to translate Spanish dream descriptions into natural, fluent English that preserves the emotional and symbolic meaning of the dream. Focus on creating vivid, descriptive English text that would be suitable for AI image generation.'
                },
                {
                    role: 'user',
                    content: `Please translate the following Spanish dream description into natural, fluent English. Make sure to preserve the emotional tone and symbolic meaning, and create vivid imagery suitable for AI image generation:

Spanish dream: "${dream}"

Please provide only the English translation, without any explanations or additional text.`
                }
            ],
            max_tokens: 300,
            temperature: 0.7
        }, {
            headers: {
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });
        
        const translation = response.data.choices[0].message.content.trim();
        console.log(`[${new Date().toISOString()}] 西班牙语梦境翻译完成: ${translation.substring(0, 50)}...`);
        
        return translation;
        
    } catch (error) {
        console.error(`[${new Date().toISOString()}] 西班牙语梦境翻译失败:`, error.message);
        
        // 如果翻译失败，回退到关键词匹配
        const dreamLower = dream.toLowerCase();
        let englishElements = [];
        
        if (dreamLower.includes('volar') || dreamLower.includes('volando')) {
            englishElements.push('flying through the sky');
        }
        if (dreamLower.includes('jardín') || dreamLower.includes('flores')) {
            englishElements.push('beautiful garden with colorful flowers');
        }
        if (dreamLower.includes('océano') || dreamLower.includes('agua') || dreamLower.includes('mar')) {
            englishElements.push('peaceful ocean or flowing water');
        }
        if (dreamLower.includes('bosque') || dreamLower.includes('árboles')) {
            englishElements.push('enchanted forest with tall trees');
        }
        if (dreamLower.includes('cielo') || dreamLower.includes('nubes')) {
            englishElements.push('expansive sky with soft clouds');
        }
        if (dreamLower.includes('animales')) {
            englishElements.push('gentle animals');
        }
        if (dreamLower.includes('luz') || dreamLower.includes('sol')) {
            englishElements.push('warm golden light');
        }
        
        return englishElements.length > 0 ? englishElements.join(', ') : 'a peaceful and beautiful dreamscape';
    }
}

// 辅助函数：根据梦境内容生成图像搜索关键词（备用方案使用）
function getImageSearchTerm(dream) {
    const dreamLower = dream.toLowerCase();
    
    if (dreamLower.includes('童年') || dreamLower.includes('小时候')) {
        return 'childhood memories peaceful';
    } else if (dreamLower.includes('花') || dreamLower.includes('花园')) {
        return 'healing flowers peaceful garden';
    } else if (dreamLower.includes('海') || dreamLower.includes('水')) {
        return 'calm ocean healing water';
    } else if (dreamLower.includes('森林') || dreamLower.includes('树')) {
        return 'peaceful forest healing nature';
    } else if (dreamLower.includes('天空') || dreamLower.includes('云')) {
        return 'peaceful sky healing clouds';
    } else if (dreamLower.includes('紫色') || dreamLower.includes('粉色')) {
        return 'healing purple pink colors';
    } else {
        return 'healing meditation peaceful';
    }
}

// 4oimageapi.io回调端点
app.post('/api/4oimage-callback', async (req, res) => {
    try {
    
    
        
        // 存储回调结果（简单内存存储，生产环境应使用数据库）
        const callbackData = req.body;
        
        // 检查是否有taskId和图像URL
        if (callbackData && callbackData.taskId) {
    
            
            // 存储到全局变量（简单实现）
            if (!global.imageCallbacks) {
                global.imageCallbacks = new Map();
            }
            global.imageCallbacks.set(callbackData.taskId, callbackData);
            
    
        }
        
        // 返回200状态码表示回调接收成功
        res.status(200).json({ 
            success: true, 
            message: 'Callback received successfully' 
        });
        
    } catch (error) {
        console.error('回调处理失败:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Callback processing failed' 
        });
    }
});

// 测试端点：模拟4oimageapi.io回调（仅用于本地测试）
app.post('/api/test-callback/:taskId', async (req, res) => {
    try {
        const taskId = req.params.taskId;
        
        // 模拟4oimageapi.io的回调数据格式
        const mockCallbackData = {
            taskId: taskId,
            imageUrl: `https://picsum.photos/800/600?random=${Date.now()}`, // 使用随机图像模拟AI生成结果
            status: 'completed',
            timestamp: new Date().toISOString(),
            note: 'This is a simulated callback for local testing'
        };
        
        // 存储模拟的回调数据
        if (!global.imageCallbacks) {
            global.imageCallbacks = new Map();
        }
        global.imageCallbacks.set(taskId, mockCallbackData);
        
    
    
        
        res.json({
            success: true,
            message: 'Mock callback processed successfully',
            data: mockCallbackData
        });
        
    } catch (error) {
        console.error('模拟回调测试失败:', error);
        res.status(500).json({
            success: false,
            error: 'Mock callback test failed'
        });
    }
});

// 主动查询4oimageapi.io任务状态（轮询模式）
app.get('/api/poll-4oimage/:taskId', async (req, res) => {
    try {
        const taskId = req.params.taskId;
    
        
        // 根据4oimage API文档，使用正确的查询端点
        try {
    
            
            const queryResponse = await axios.get(`${FOURO_IMAGE_API_URL}/api/v1/gpt4o-image/record-info`, {
                params: {
                    taskId: taskId
                },
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${FOURO_IMAGE_API_KEY}`
                },
                timeout: 15000
            });
            
    
            
            // 检查响应格式
            if (queryResponse.data && queryResponse.data.code === 200) {
                const data = queryResponse.data.data;
                
                // 检查任务状态
                if (data.status === 'SUCCESS' && data.response && data.response.resultUrls && data.response.resultUrls.length > 0) {
                    // 获取第一个图像URL
                    const imageUrl = data.response.resultUrls[0];
    
    
    
                    
                    // 保存结果到内存
                    if (!global.imageCallbacks) {
                        global.imageCallbacks = new Map();
                    }
                    global.imageCallbacks.set(taskId, {
                        taskId: taskId,
                        imageUrl: imageUrl,
                        status: 'completed',
                        timestamp: new Date().toISOString(),
                        source: '4oimageapi.io-real',
                        allUrls: data.response.resultUrls // 保存所有URL
                    });
                    
                    return res.json({
                        success: true,
                        taskId: taskId,
                        imageUrl: imageUrl,
                        status: 'completed',
                        source: 'real-ai-generation',
                        progress: data.progress,
                        allUrls: data.response.resultUrls
                    });
                } else if (data.status === 'PROCESSING' || data.status === 'PENDING') {
    
                    return res.json({
                        success: false,
                        taskId: taskId,
                        status: 'processing',
                        message: 'AI is still generating your image',
                        progress: data.progress
                    });
                } else {
    
    
                    return res.json({
                        success: false,
                        taskId: taskId,
                        status: data.status || 'error',
                        message: data.errorMessage || 'Task status error'
                    });
                }
            } else {
    
                return res.json({
                    success: false,
                    taskId: taskId,
                    message: 'Invalid response format from 4oimage API'
                });
            }
            
        } catch (queryError) {
    
            
            // 如果是404错误，说明任务可能还在处理中
            if (queryError.response && queryError.response.status === 404) {
                return res.json({
                    success: false,
                    taskId: taskId,
                    status: 'processing',
                    message: 'Task still processing (404 - not found yet)'
                });
            }
            
            return res.json({
                success: false,
                taskId: taskId,
                message: 'Failed to query 4oimage API: ' + queryError.message
            });
        }
        
    } catch (error) {
        console.error('轮询查询失败:', error);
        res.status(500).json({
            success: false,
            error: 'Polling query failed'
        });
    }
});

// 查询4oimageapi.io任务结果端点（统一入口）
app.get('/api/4oimage-result/:taskId', async (req, res) => {
    try {
        const taskId = req.params.taskId;
    
        
        // 首先从内存中查找结果（回调或轮询缓存）
        if (global.imageCallbacks && global.imageCallbacks.has(taskId)) {
            const result = global.imageCallbacks.get(taskId);
    
            
            return res.json({
                success: true,
                taskId: taskId,
                result: result
            });
        }
        
        // 如果没有缓存结果，尝试主动查询（轮询模式）

        
        // 内部调用轮询端点
        try {
            const baseUrl = process.env.PUBLIC_URL || `http://localhost:${PORT}`;
            const pollResponse = await axios.get(`${baseUrl}/api/poll-4oimage/${taskId}`);
            
            if (pollResponse.data && pollResponse.data.success) {
                return res.json({
                    success: true,
                    taskId: taskId,
                    result: {
                        taskId: taskId,
                        imageUrl: pollResponse.data.imageUrl,
                        status: pollResponse.data.status,
                        source: 'active-polling'
                    }
                });
            }
        } catch (pollError) {

        }
        
        // 都失败了
        res.json({
            success: false,
            taskId: taskId,
            message: 'Task result not yet available'
        });
        
    } catch (error) {
        console.error('查询任务结果失败:', error);
        res.status(500).json({
            success: false,
            error: 'Query failed'
        });
    }
});





// 健康检查端点
app.get('/api/health', (req, res) => {
    const hasFourOAPI = FOURO_IMAGE_API_KEY && FOURO_IMAGE_API_KEY.length > 0;
    const hasDeepSeekAPI = DEEPSEEK_API_KEY && DEEPSEEK_API_KEY.length > 0;
    
    res.json({ 
        status: 'ok', 
        message: 'AI解梦服务运行正常',
        environment: process.env.NODE_ENV || 'development',
        features: {
            dreamAnalysis: hasDeepSeekAPI ? 'available (DeepSeek API)' : 'unavailable (DeepSeek API key required)',
            imageGeneration: hasFourOAPI ? 'available (4oimageapi.io GPT-4o)' : 'limited (4oimageapi.io API key required)'
        },
        apiKeys: {
            deepseek: hasDeepSeekAPI ? 'configured' : 'missing',
            fourOImage: hasFourOAPI ? 'configured' : 'missing'
        }
    });
});

// 调试端点（仅在生产环境用于排查问题）
app.get('/api/debug', (req, res) => {
    // 只在生产环境或明确请求时返回调试信息
    const isProduction = process.env.NODE_ENV === 'production';
    const debugToken = req.query.token;
    
    if (!isProduction && !debugToken) {
        return res.status(403).json({ error: 'Debug endpoint requires token in production' });
    }
    
    res.json({
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        port: process.env.PORT || 3000,
        publicUrl: process.env.PUBLIC_URL || 'not set',
        apiKeys: {
            deepseek: {
                exists: !!DEEPSEEK_API_KEY,
                length: DEEPSEEK_API_KEY ? DEEPSEEK_API_KEY.length : 0,
                startsWithSk: DEEPSEEK_API_KEY ? DEEPSEEK_API_KEY.startsWith('sk-') : false,
                preview: DEEPSEEK_API_KEY ? `${DEEPSEEK_API_KEY.substring(0, 10)}...` : 'not set'
            },
            fourOImage: {
                exists: !!FOURO_IMAGE_API_KEY,
                length: FOURO_IMAGE_API_KEY ? FOURO_IMAGE_API_KEY.length : 0,
                preview: FOURO_IMAGE_API_KEY ? `${FOURO_IMAGE_API_KEY.substring(0, 10)}...` : 'not set'
            }
        },
        nodeVersion: process.version,
        platform: process.platform,
        memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
        }
    });
});

// 测试DeepSeek API连接
app.get('/api/test-deepseek', async (req, res) => {
    try {
        if (!DEEPSEEK_API_KEY) {
            return res.status(500).json({ error: 'DeepSeek API key not configured' });
        }
        
        console.log('测试DeepSeek API连接...');
        
        const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
            model: 'deepseek-chat',
            messages: [
                {
                    role: 'user',
                    content: 'Hello, this is a test message.'
                }
            ],
            max_tokens: 50,
            temperature: 0.7
        }, {
            headers: {
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });
        
        res.json({ 
            success: true, 
            message: 'DeepSeek API connection successful',
            response: response.data.choices[0].message.content
        });
        
    } catch (error) {
        console.error('DeepSeek API测试失败:', error.message);
        
        if (error.response) {
            res.status(error.response.status).json({ 
                error: 'DeepSeek API test failed', 
                status: error.response.status,
                data: error.response.data 
            });
        } else if (error.request) {
            res.status(503).json({ 
                error: 'Network error - DeepSeek API unreachable',
                message: error.message 
            });
        } else {
            res.status(500).json({ 
                error: 'DeepSeek API test failed',
                message: error.message 
            });
        }
    }
});

// 启动服务器（仅在非Vercel环境下）
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`🚀 AI解梦服务器运行在端口 ${PORT}`);
        console.log(`🌐 访问 http://localhost:${PORT} 查看应用`);
        console.log(`🔧 使用 DeepSeek API (梦境分析) + 4oimageapi.io GPT-4o (图像生成)`);
        
        // 检查API密钥配置
        if (!DEEPSEEK_API_KEY || DEEPSEEK_API_KEY.length === 0) {
            console.error('❌ DeepSeek API密钥未配置，梦境分析功能将不可用');
        } else {
            console.log('✅ DeepSeek API密钥已配置，梦境分析功能已启用');
        }
        
        if (!FOURO_IMAGE_API_KEY || FOURO_IMAGE_API_KEY.length === 0) {
            console.warn('⚠️  4oimageapi.io API密钥未配置，图像生成功能将受限');
        } else {
            console.log('✅ 4oimageapi.io API密钥已配置，图像生成功能已启用');
            console.log('💡 使用更经济实惠的4oimageapi.io服务提供GPT-4o图像生成能力');
        }
        
        // 环境信息
        console.log(`📝 当前环境: ${process.env.NODE_ENV || 'development'}`);
        if (process.env.PUBLIC_URL) {
            console.log(`🌍 公网URL: ${process.env.PUBLIC_URL}`);
            console.log('📝 当前使用回调模式：任务提交至4oimageapi.io + 回调接收结果 + 预设疗愈图像');
        } else {
            console.log('📝 当前使用轮询模式：任务提交至4oimageapi.io + 主动查询结果 + 预设疗愈图像');
        }
        
        console.log('🎯 服务器启动完成，所有功能已就绪！');
    });
} else {
    console.log('🚀 Vercel环境检测到，使用无服务器函数模式');
    console.log('✅ API密钥检查完成，所有功能已就绪！');
}

module.exports = app; 
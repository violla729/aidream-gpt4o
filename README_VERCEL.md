# AI解梦系统 - Vercel部署

## 快速部署

### 方法1：使用部署脚本
```bash
./deploy-vercel.sh
```

### 方法2：手动部署
```bash
# 1. 安装Vercel CLI
npm install -g vercel

# 2. 登录Vercel
vercel login

# 3. 部署
vercel --prod
```

## 环境变量配置

在Vercel仪表板中设置以下环境变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `DEEPSEEK_API_KEY` | `sk-your-key-here` | DeepSeek API密钥 |
| `FOURO_IMAGE_API_KEY` | `your-key-here` | 4oimageapi.io API密钥 |
| `NODE_ENV` | `production` | 环境标识 |

## 部署后测试

1. **健康检查**：`https://your-app.vercel.app/api/health`
2. **调试信息**：`https://your-app.vercel.app/api/debug`
3. **功能测试**：访问主页测试梦境分析和图像生成

## 常见问题

### 500错误
- 检查环境变量是否正确设置
- 查看Vercel函数日志
- 确保API密钥有效

### 函数超时
- 默认30秒超时，可在`vercel.json`中调整
- 图像生成可能需要更长时间

### 环境变量未生效
- 设置环境变量后需要重新部署
- 使用`vercel --prod`重新部署

## 查看日志

```bash
vercel logs
```

## 重新部署

```bash
vercel --prod
```

## 优势

✅ 自动HTTPS  
✅ 全球CDN  
✅ 自动部署  
✅ 免费计划  
✅ 简单配置  
✅ 良好性能 
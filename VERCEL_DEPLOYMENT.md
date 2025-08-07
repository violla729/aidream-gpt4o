# Vercel部署指南

## 部署步骤

### 1. 安装Vercel CLI
```bash
npm install -g vercel
```

### 2. 登录Vercel
```bash
vercel login
```

### 3. 部署项目
```bash
vercel
```

### 4. 设置环境变量
在Vercel仪表板中设置以下环境变量：

#### 必需的环境变量：
```
DEEPSEEK_API_KEY=sk-your-deepseek-api-key-here
FOURO_IMAGE_API_KEY=your-4oimageapi-key-here
NODE_ENV=production
```

#### 可选的环境变量：
```
PUBLIC_URL=https://your-app-name.vercel.app
```

### 5. 重新部署
设置环境变量后，重新部署：
```bash
vercel --prod
```

## 环境变量配置

### 在Vercel仪表板中设置：
1. 进入项目仪表板
2. 点击 "Settings" 标签
3. 选择 "Environment Variables"
4. 添加以下变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `DEEPSEEK_API_KEY` | `sk-your-key-here` | DeepSeek API密钥 |
| `FOURO_IMAGE_API_KEY` | `your-key-here` | 4oimageapi.io API密钥 |
| `NODE_ENV` | `production` | 环境标识 |
| `PUBLIC_URL` | `https://your-app.vercel.app` | 公网URL（可选） |

## 部署后检查

### 1. 健康检查
访问：`https://your-app.vercel.app/api/health`

预期响应：
```json
{
  "status": "ok",
  "message": "AI解梦服务运行正常",
  "environment": "production",
  "features": {
    "dreamAnalysis": "available (DeepSeek API)",
    "imageGeneration": "available (4oimageapi.io GPT-4o)"
  },
  "apiKeys": {
    "deepseek": "configured",
    "fourOImage": "configured"
  }
}
```

### 2. 调试信息
访问：`https://your-app.vercel.app/api/debug`

### 3. 功能测试
```bash
# 梦境分析测试
curl -X POST https://your-app.vercel.app/api/analyze-dream \
  -H "Content-Type: application/json" \
  -d '{"dream":"I dreamed about flying","language":"en"}'

# 图像生成测试
curl -X POST https://your-app.vercel.app/api/generate-image \
  -H "Content-Type: application/json" \
  -d '{"dream":"I dreamed about flying","language":"en"}'
```

## Vercel的优势

### 1. 自动HTTPS
- Vercel自动为所有部署提供HTTPS证书

### 2. 全球CDN
- 自动分发到全球边缘节点，提升访问速度

### 3. 自动部署
- 连接GitHub后，每次推送代码都会自动部署

### 4. 环境变量管理
- 在仪表板中轻松管理环境变量
- 支持不同环境（开发、预览、生产）

### 5. 函数超时设置
- 已配置30秒超时，适合API调用

## 常见问题

### 1. 函数超时
如果遇到超时问题，可以在`vercel.json`中调整：
```json
{
  "functions": {
    "server.js": {
      "maxDuration": 60
    }
  }
}
```

### 2. 环境变量未生效
- 确保在正确的环境中设置变量
- 重新部署项目

### 3. API调用失败
- 检查环境变量是否正确设置
- 查看Vercel函数日志

## 查看日志

### 在Vercel仪表板中：
1. 进入项目
2. 点击 "Functions" 标签
3. 查看 `server.js` 函数的日志

### 使用CLI：
```bash
vercel logs
```

## 快速部署命令

```bash
# 首次部署
vercel

# 生产环境部署
vercel --prod

# 查看部署状态
vercel ls

# 查看日志
vercel logs

# 删除部署
vercel remove
```

## 连接GitHub自动部署

1. 在Vercel仪表板中连接GitHub仓库
2. 设置自动部署分支（通常是`main`或`master`）
3. 每次推送代码都会自动触发部署

## 自定义域名

1. 在Vercel仪表板中添加自定义域名
2. 更新DNS记录
3. 等待SSL证书自动生成

## 性能优化

### 1. 启用缓存
在`vercel.json`中添加：
```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    }
  ]
}
```

### 2. 静态资源优化
- 图片和CSS文件会自动优化
- 支持WebP格式自动转换

## 监控和分析

### 1. 性能监控
- Vercel提供内置的性能监控
- 查看函数执行时间和内存使用

### 2. 错误追踪
- 自动记录函数错误
- 提供详细的错误堆栈信息

## 成本控制

### 1. 免费计划限制
- 每月100GB带宽
- 1000个函数调用/天
- 适合个人项目和小型应用

### 2. 升级计划
- Pro计划：$20/月
- 企业计划：联系销售

## 安全建议

### 1. 环境变量安全
- 不要在代码中硬编码API密钥
- 使用Vercel的环境变量功能

### 2. API密钥轮换
- 定期更新API密钥
- 监控API使用情况

### 3. 访问控制
- 考虑添加API访问限制
- 监控异常访问模式 
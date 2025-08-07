# Railway部署检查清单

## 部署前检查

### 1. 环境变量配置
确保在Railway项目设置中配置了以下环境变量：

```bash
# 必需的环境变量
DEEPSEEK_API_KEY=sk-your-deepseek-api-key-here
FOURO_IMAGE_API_KEY=your-4oimageapi-key-here
NODE_ENV=production

# 可选的环境变量
PORT=3000
PUBLIC_URL=https://your-railway-app-name.up.railway.app
```

### 2. 验证API密钥
- [ ] DeepSeek API密钥以 `sk-` 开头
- [ ] 4oimageapi.io API密钥格式正确
- [ ] 两个API密钥都已激活且有效

## 部署后检查

### 1. 健康检查
访问以下端点检查服务状态：
```
https://your-app-name.up.railway.app/api/health
```

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
访问调试端点查看详细配置：
```
https://your-app-name.up.railway.app/api/debug
```

### 3. 功能测试
1. **梦境分析测试**：
   ```bash
   curl -X POST https://your-app-name.up.railway.app/api/analyze-dream \
     -H "Content-Type: application/json" \
     -d '{"dream":"I dreamed about flying","language":"en"}'
   ```

2. **图像生成测试**：
   ```bash
   curl -X POST https://your-app-name.up.railway.app/api/generate-image \
     -H "Content-Type: application/json" \
     -d '{"dream":"I dreamed about flying","language":"en"}'
   ```

## 常见问题排查

### 500错误 - 梦境分析失败

#### 可能原因：
1. **API密钥未配置**
   - 检查Railway环境变量设置
   - 验证密钥格式是否正确

2. **API密钥无效**
   - 检查DeepSeek账户余额
   - 验证API密钥权限

3. **网络连接问题**
   - 检查Railway服务状态
   - 验证外部API访问权限

#### 排查步骤：
1. 查看Railway日志：
   ```bash
   railway logs
   ```

2. 检查环境变量：
   ```bash
   railway variables
   ```

3. 重启服务：
   ```bash
   railway up
   ```

### 环境变量问题

#### 在Railway中设置环境变量：
1. 进入Railway项目仪表板
2. 点击 "Variables" 标签
3. 添加以下变量：
   ```
   DEEPSEEK_API_KEY=sk-your-key-here
   FOURO_IMAGE_API_KEY=your-key-here
   NODE_ENV=production
   ```

#### 验证环境变量：
```bash
# 在Railway CLI中
railway run "echo $DEEPSEEK_API_KEY"
railway run "echo $FOURO_IMAGE_API_KEY"
```

### 网络和防火墙问题

#### 检查外部API访问：
```bash
# 测试DeepSeek API连接
railway run "curl -X POST https://api.deepseek.com/v1/chat/completions \
  -H 'Authorization: Bearer $DEEPSEEK_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{\"model\":\"deepseek-chat\",\"messages\":[{\"role\":\"user\",\"content\":\"Hello\"}],\"max_tokens\":10}'"
```

## 日志分析

### 关键日志信息：
- `✅ DeepSeek API密钥已配置` - API密钥正常
- `❌ DeepSeek API密钥未配置` - 需要配置API密钥
- `梦境分析API错误` - 查看具体错误信息
- `DeepSeek API调用成功` - API调用正常

### 错误代码含义：
- `401` - API密钥无效
- `429` - 请求频率限制
- `500` - 服务器内部错误
- `503` - 服务不可用

## 联系支持

如果问题仍然存在：
1. 收集完整的错误日志
2. 提供健康检查和调试端点的响应
3. 确认环境变量配置正确
4. 检查API密钥状态和余额

## 快速修复命令

```bash
# 重新部署
railway up

# 查看日志
railway logs

# 重启服务
railway service restart

# 检查环境变量
railway variables
``` 
# 4oimageapi.io 集成部署指南

## 概述

本应用已成功集成 [4oimageapi.io](https://docs.4oimageapi.io/zh-CN/4o-image-api/generate-4-o-image) 的 GPT-4o 图像生成服务，使用回调机制接收生成结果。

## 当前状态

✅ **API集成完成** - 使用API密钥：`6249f04a6eb9a5adbfd3904e8ac98442`
✅ **回调端点实现** - `/api/4oimage-callback`
✅ **结果查询端点** - `/api/4oimage-result/:taskId`
✅ **多语言支持** - 中文、英文、西班牙语
✅ **混合模式** - 即时疗愈图像 + 异步AI生成

## 本地开发环境

在本地环境中，4oimageapi.io 无法访问 `localhost` 回调URL，因此：

- ✅ 任务提交正常工作
- ⚠️ 回调接收无法工作（预期行为）
- ✅ 使用预设疗愈图像作为临时方案
- ✅ 回调基础设施已就绪

### 本地测试回调功能

使用 ngrok 创建公共隧道：

```bash
# 安装 ngrok
npm install -g ngrok

# 创建隧道到本地3000端口
ngrok http 3000

# 设置环境变量
export PUBLIC_URL=https://your-ngrok-id.ngrok.io

# 重启服务器
node server.js
```

## 生产环境部署

### 1. 环境变量配置

在生产服务器上设置以下环境变量：

```bash
# DeepSeek API
DEEPSEEK_API_KEY=sk-627d5aa2cb844597803c4c08d48cb828

# 4oimageapi.io API
FOURO_IMAGE_API_KEY=6249f04a6eb9a5adbfd3904e8ac98442

# 公网URL（必须设置）
PUBLIC_URL=https://yourdomain.com

# 服务器端口
PORT=3000
```

### 2. 回调URL要求

4oimageapi.io 需要能够访问：
- `https://yourdomain.com/api/4oimage-callback`

确保：
- ✅ 域名可公网访问
- ✅ HTTPS 配置正确
- ✅ 防火墙允许HTTP/HTTPS流量
- ✅ 服务器正常运行

### 3. 测试部署

部署后测试：

```bash
# 1. 提交图像生成任务
curl -X POST https://yourdomain.com/api/generate-image \
  -H "Content-Type: application/json" \
  -d '{"dream": "测试梦境", "language": "zh"}'

# 返回示例：
# {
#   "taskId": "abc123...",
#   "message": "任务已提交...",
#   "imageUrl": "预设疗愈图像URL"
# }

# 2. 等待几分钟后查询AI生成结果
curl https://yourdomain.com/api/4oimage-result/abc123...

# 成功时返回：
# {
#   "success": true,
#   "taskId": "abc123...",
#   "result": {
#     "taskId": "abc123...",
#     "imageUrl": "https://4oimageapi.io/generated/image.jpg",
#     "status": "completed"
#   }
# }
```

## API端点说明

### 图像生成 API
```
POST /api/generate-image
Content-Type: application/json

{
  "dream": "梦境内容",
  "language": "zh" // "en", "zh", "es"
}
```

### 查询AI生成结果
```
GET /api/4oimage-result/:taskId
```

### 回调端点（由4oimageapi.io调用）
```
POST /api/4oimage-callback
Content-Type: application/json

// 4oimageapi.io会发送回调数据到此端点
```

## 监控和日志

生产环境中关注以下日志：

```bash
# 任务提交成功
✅ 4oimageapi.io任务创建成功，任务ID: abc123...

# 回调接收成功
=== 4oimageapi.io 回调通知 ===
收到回调数据: { "taskId": "abc123...", "imageUrl": "..." }
✅ 回调数据已保存

# 回调接收失败
❌ 回调处理失败: [错误信息]
```

## 故障排除

### 常见问题

1. **回调未收到**
   - 检查 `PUBLIC_URL` 是否正确设置
   - 确认域名可从外网访问
   - 检查防火墙和负载均衡器配置

2. **任务提交失败**
   - 验证 `FOURO_IMAGE_API_KEY` 是否正确
   - 检查4oimageapi.io服务状态
   - 查看网络连接

3. **查询结果为空**
   - 等待更长时间（AI生成可能需要几分钟）
   - 检查回调是否正常接收
   - 查看服务器日志

## 成本优化

- 4oimageapi.io 比直接使用 OpenAI DALL-E 更经济实惠
- 生成的图片保存14天后自动删除
- 预设疩愈图像提供即时用户体验

## 支持

如有问题，请检查：
1. [4oimageapi.io 官方文档](https://docs.4oimageapi.io/zh-CN/4o-image-api/generate-4-o-image)
2. 服务器日志文件
3. 网络连接状态

---

**当前版本**：完整回调机制版本  
**最后更新**：2025-01-09  
**状态**：生产就绪 ✅
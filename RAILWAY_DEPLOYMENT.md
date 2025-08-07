# Railway 部署指南

## 🚀 快速部署到Railway

### 1. 准备工作

确保您有以下API密钥：
- **DeepSeek API Key**: `sk-627d5aa2cb844597803c4c08d48cb828`
- **4oimageapi.io API Key**: `6249f04a6eb9a5adbfd3904e8ac98442`

### 2. 部署步骤

#### 方式一：GitHub连接部署（推荐）

1. 将代码推送到GitHub仓库
2. 访问 [Railway](https://railway.app/)
3. 点击 "New Project"
4. 选择 "Deploy from GitHub repo"
5. 选择您的仓库

#### 方式二：CLI部署

```bash
# 安装Railway CLI
npm install -g @railway/cli

# 登录
railway login

# 初始化项目
railway init

# 部署
railway up
```

### 3. 环境变量配置

在Railway项目设置中添加以下环境变量：

```
DEEPSEEK_API_KEY=sk-627d5aa2cb844597803c4c08d48cb828
FOURO_IMAGE_API_KEY=6249f04a6eb9a5adbfd3904e8ac98442
PORT=3000
PUBLIC_URL=https://your-railway-domain.railway.app
```

**注意**: `PUBLIC_URL` 需要替换为Railway分配给您的实际域名。

### 4. 自动配置

Railway会自动：
- 检测Node.js项目
- 安装依赖 (`npm install`)
- 使用 `npm start` 启动应用
- 分配公共URL

### 5. 验证部署

1. 部署完成后，访问Railway提供的URL
2. 测试梦境分析功能
3. 测试图像生成功能
4. 检查回调功能是否正常工作

### 6. 域名配置（可选）

如果您有自定义域名：
1. 在Railway项目设置中添加自定义域名
2. 更新 `PUBLIC_URL` 环境变量
3. 重新部署

### 7. 监控和日志

- Railway提供实时日志查看
- 可以监控应用性能和错误
- 支持自动重启和健康检查

### 8. 注意事项

1. **回调URL**: Railway的公共URL支持4oimageapi.io回调
2. **环境变量**: 确保所有必需的环境变量都已设置
3. **端口配置**: Railway会自动设置PORT环境变量
4. **静态文件**: public目录会自动被正确服务

### 9. 故障排除

#### 应用无法启动
- 检查环境变量是否正确设置
- 查看Railway日志中的错误信息
- 确认package.json中的start脚本正确

#### 图像生成不工作
- 验证4oimageapi.io API密钥
- 检查PUBLIC_URL是否设置为Railway域名
- 查看回调端点日志

#### 梦境分析失败
- 验证DeepSeek API密钥
- 检查API配额是否用完

### 10. 成本估算

Railway提供：
- 免费额度：每月500小时运行时间
- 按使用付费：超出后按小时计费
- 静态资源免费托管

## 📱 功能特性

部署后的应用包含：

✅ **多语言支持** - 中文、英文、西班牙语
✅ **AI梦境分析** - 使用DeepSeek API
✅ **AI图像生成** - 使用4oimageapi.io GPT-4o
✅ **6种艺术风格** - 水彩、卡通、油画、韩漫、Q版、线稿
✅ **响应式设计** - 完美适配移动端
✅ **瀑布流画廊** - 三维交错效果
✅ **实时回调** - 异步图像生成

## 🔧 技术栈

- **前端**: HTML5 + CSS3 + Vanilla JavaScript
- **后端**: Node.js + Express
- **AI服务**: DeepSeek API + 4oimageapi.io
- **部署平台**: Railway
- **特色功能**: 回调机制、多语言、响应式设计

---

**部署完成后，您的AI解梦助手就可以为全世界的用户提供服务了！** 🌟
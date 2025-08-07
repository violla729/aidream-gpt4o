#!/bin/bash

echo "🚀 开始Vercel部署..."

# 检查是否安装了Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI未安装，正在安装..."
    npm install -g vercel
fi

# 检查是否已登录
if ! vercel whoami &> /dev/null; then
    echo "🔐 请先登录Vercel..."
    vercel login
fi

echo "📦 开始部署..."
vercel --prod

echo "✅ 部署完成！"
echo ""
echo "📋 部署后检查清单："
echo "1. 在Vercel仪表板中设置环境变量："
echo "   - DEEPSEEK_API_KEY=sk-your-key-here"
echo "   - FOURO_IMAGE_API_KEY=your-key-here"
echo "   - NODE_ENV=production"
echo ""
echo "2. 测试健康检查端点："
echo "   https://your-app.vercel.app/api/health"
echo ""
echo "3. 测试调试端点："
echo "   https://your-app.vercel.app/api/debug"
echo ""
echo "4. 重新部署以应用环境变量："
echo "   vercel --prod" 
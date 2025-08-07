#!/bin/bash

echo "🚀 4oimageapi.io 完整测试脚本"
echo "==============================="

# 检查ngrok是否安装
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok未安装，请先安装:"
    echo "   brew install ngrok/ngrok/ngrok"
    echo "   或访问 https://ngrok.com/download"
    exit 1
fi

echo "✅ ngrok已安装"

# 检查服务器是否运行
if ! curl -s http://localhost:3000/api/health > /dev/null; then
    echo "❌ 本地服务器未运行，请先运行:"
    echo "   node server.js"
    exit 1
fi

echo "✅ 本地服务器正在运行"

echo ""
echo "📋 测试步骤："
echo "1. 在新终端窗口运行: ngrok http 3000"
echo "2. 复制ngrok提供的HTTPS URL (如: https://abc123.ngrok.io)"
echo "3. 运行: export PUBLIC_URL=https://your-ngrok-url.ngrok.io"
echo "4. 重启服务器: node server.js"
echo "5. 测试图像生成并等待回调"
echo ""
echo "🔍 查看回调结果："
echo "   curl https://your-ngrok-url.ngrok.io/api/4oimage-result/TASK_ID"
echo ""
echo "💡 成功后，你将看到真正的GPT-4o生成图像！"
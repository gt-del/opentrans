#!/bin/bash
# OpenTrans Gatekeeper Fix Script for macOS
# 支持从任意位置运行，自动查找应用路径

echo “----------------------------------------------------”
echo “OpenTrans macOS 权限修复工具 v2.0”
echo “----------------------------------------------------”
echo “”

# 查找应用的可能位置
APP_PATHS=(
    “/Applications/OpenTrans.app”
    “$HOME/Applications/OpenTrans.app”
    “$(dirname “$0”)/../../../OpenTrans.app”
)

APP_PATH=””
for path in “${APP_PATHS[@]}”; do
    if [ -d “$path” ]; then
        APP_PATH=”$path”
        break
    fi
done

if [ -z “$APP_PATH” ]; then
    echo “❌ 未找到 OpenTrans.app”
    echo “”
    echo “请确保已将 OpenTrans.app 拖入以下位置之一：”
    echo “  • /Applications/”
    echo “  • ~/Applications/”
    echo “”
    echo “或者直接在终端中运行：”
    echo “  sudo xattr -r -d com.apple.quarantine /path/to/OpenTrans.app”
    echo “”
    echo “----------------------------------------------------”
    echo “按任意键退出...”
    read -n 1
    exit 1
fi

echo “找到应用：$APP_PATH”
echo “”
echo “正在解除 Gatekeeper 隔离...”
echo “此操作需要管理员权限，请输入开机密码（输入时不显示）：”
echo “”

# 执行修复
sudo xattr -r -d com.apple.quarantine “$APP_PATH”

if [ $? -eq 0 ]; then
    echo “”
    echo “✅ 成功！Gatekeeper 隔离已解除。”
    echo “”
    echo “现在可以正常打开 OpenTrans 了！”
    echo “”

    # 可选：自动打开应用
    read -p “是否立即打开 OpenTrans？(y/n) “ -n 1 -r
    echo “”
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open “$APP_PATH”
    fi
else
    echo “”
    echo “❌ 执行失败”
    echo “”
    echo “可能原因：”
    echo “  • 密码输入错误”
    echo “  • 没有管理员权限”
    echo “”
    echo “请重试或手动在终端执行：”
    echo “  sudo xattr -r -d com.apple.quarantine \”$APP_PATH\””
fi

echo “”
echo “----------------------------------------------------”
echo “按任意键退出...”
read -n 1
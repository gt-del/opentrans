#!/bin/bash
# OpenTrans 安装测试脚本
# 用于验证权限修复和文件操作是否正常

echo "==================================================="
echo "OpenTrans 安装测试工具"
echo "==================================================="
echo ""

# 测试 1: 检查应用是否存在
echo "📋 测试 1: 检查应用安装..."
if [ -d "/Applications/OpenTrans.app" ]; then
    echo "✅ 应用已安装"
else
    echo "❌ 应用未安装（预期结果，打包后才会安装）"
fi
echo ""

# 测试 2: 检查 Gatekeeper 标记
echo "📋 测试 2: 检查 Gatekeeper 隔离标记..."
if [ -d "/Applications/OpenTrans.app" ]; then
    quarantine_attr=$(xattr -l "/Applications/OpenTrans.app" 2>/dev/null | grep "com.apple.quarantine")
    if [ -n "$quarantine_attr" ]; then
        echo "⚠️  检测到隔离标记（需要运行修复脚本）"
    else
        echo "✅ 没有隔离标记"
    fi
else
    echo "⏭️  跳过（应用未安装）"
fi
echo ""

# 测试 3: 检查文件权限（测试目录）
echo "📋 测试 3: 检查文件操作权限..."
TEST_DIR="$HOME/Documents/opentrans-test"
mkdir -p "$TEST_DIR" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ 可以创建测试目录: $TEST_DIR"

    # 测试文件复制
    echo "test" > "$TEST_DIR/test.txt"
    cp "$TEST_DIR/test.txt" "$TEST_DIR/test-copy.txt" 2>/dev/null

    if [ $? -eq 0 ]; then
        echo "✅ 文件复制功能正常"
    else
        echo "❌ 文件复制失败（可能存在权限问题）"
    fi

    # 清理
    rm -rf "$TEST_DIR"
else
    echo "❌ 无法创建测试目录（权限不足）"
fi
echo ""

# 测试 4: 检查修复脚本
echo "📋 测试 4: 检查修复脚本..."
SCRIPT_PATH="$(dirname "$0")/fix-macos.command"
if [ -f "$SCRIPT_PATH" ]; then
    echo "✅ 修复脚本存在: $SCRIPT_PATH"

    # 检查执行权限
    if [ -x "$SCRIPT_PATH" ]; then
        echo "✅ 脚本有执行权限"
    else
        echo "⚠️  脚本没有执行权限（添加执行权限）"
        chmod +x "$SCRIPT_PATH"
    fi
else
    echo "❌ 修复脚本不存在"
fi
echo ""

# 测试 5: 检查 Node.js 和 npm
echo "📋 测试 5: 检查开发环境..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo "✅ Node.js: $NODE_VERSION"
else
    echo "⚠️  Node.js 未安装（仅开发需要）"
fi

if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo "✅ npm: $NPM_VERSION"
else
    echo "⚠️  npm 未安装（仅开发需要）"
fi
echo ""

echo "==================================================="
echo "测试完成！"
echo "==================================================="
echo ""
echo "💡 提示："
echo "  • 如果遇到 Gatekeeper 问题，运行 fix-macos.command"
echo "  • 如果遇到权限问题，选择个人文件夹作为项目位置"
echo "  • 完整文档请查看 INSTALL_MACOS.md"
echo ""

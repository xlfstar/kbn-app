const { exec } = require('child_process')
const { promisify } = require('util')
const execAsync = promisify(exec)
const fs = require('fs')
const path = require('path')

async function killProcesses() {
  console.log('🔪 正在关闭相关进程...')

  const commands = [
    // Windows
    'taskkill /F /IM kbn-wms.exe 2>nul',
    'taskkill /F /IM electron.exe 2>nul',
    'taskkill /F /IM node.exe 2>nul',

    // macOS/Linux (如果也在用)
    'pkill -f kbn-wms 2>/dev/null',
    'pkill -f electron 2>/dev/null',
    'pkill -f node 2>/dev/null'
  ]

  for (const cmd of commands) {
    try {
      await execAsync(cmd)
    } catch (error) {
      // 忽略进程不存在的错误
    }
  }

  // 检查并解锁文件
  const distDir = path.join(__dirname, '../dist')
  if (fs.existsSync(distDir)) {
    console.log('🗑️  清理 dist 目录...')

    // 尝试删除锁定的文件
    try {
      // 先删除可能被锁定的文件
      const lockedFiles = [
        path.join(distDir, 'win-unpacked/resources/app.asar'),
        path.join(distDir, 'win-unpacked/resources/app.asar.unpacked/**/*'),
        path.join(distDir, 'win-unpacked/*.exe'),
        path.join(distDir, 'win-unpacked/*.dll')
      ]

      lockedFiles.forEach((file) => {
        try {
          if (fs.existsSync(file)) {
            fs.unlinkSync(file)
            console.log(`已删除: ${file}`)
          }
        } catch (e) {
          console.log(`无法删除 ${file}: ${e.message}`)
        }
      })
    } catch (error) {
      console.log('清理时出错:', error.message)
    }
  }

  console.log('✅ 清理完成！')
  console.log('等待 2 秒确保进程完全退出...')
  await new Promise((resolve) => setTimeout(resolve, 2000))
}

killProcesses().catch(console.error)

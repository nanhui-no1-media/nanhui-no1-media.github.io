// 5 分钟 = 300,000 毫秒
const SYNC_INTERVAL = 5 * 60 * 1000; 

// 记录服务器时间与本地时间的差值（毫秒）
let timeOffset = 0;

/**
 * 从服务器获取标准时间并更新差值
 */
async function syncTime() {
    try {
        // 请求时间 API（如果是自建后端，换成你的接口地址）
        const response = await fetch('https://worldtimeapi.org/api/ip');
        const data = await response.json();
        
        // 服务器标准时间戳
        const serverTime = new Date(data.datetime).getTime();
        
        // 计算简单的固定差值：服务器时间 - 当前本地时间
        timeOffset = serverTime - Date.now();
        console.log('时间同步成功，当前时间差为：', timeOffset, 'ms');
    } catch (error) {
        console.warn('时间同步失败，继续使用当前时间差或本地时间', error);
    }
}

/**
 * 刷新页面显示的时间
 */
function updateDisplay() {
    // 当前校准后的准确时间 = 本地时间 + 差值
    const correctedNow = new Date(Date.now() + timeOffset);
    
    const hours = String(correctedNow.getHours()).padStart(2, '0');
    const minutes = String(correctedNow.getMinutes()).padStart(2, '0');
    const seconds = String(correctedNow.getSeconds()).padStart(2, '0');

    const timeElement = document.getElementById('current-time');
    if (timeElement) {
        timeElement.textContent = `${hours}:${minutes}:${seconds}`;
    }
}

// 初始化执行
function init() {
    // 1. 立即同步一次时间
    syncTime();
    
    // 2. 每 5 分钟同步一次
    setInterval(syncTime, SYNC_INTERVAL);

    // 3. 每秒更新界面显示
    updateDisplay();
    setInterval(updateDisplay, 1000);
}

document.addEventListener('DOMContentLoaded', init);

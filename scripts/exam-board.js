/**
 * 使用纯毫秒时间戳授时，完美避开时区解析问题
 */
async function syncTime() {
    try {
        // 使用阿里/淘宝极速时间戳接口，加上 timestamp 确保每次都刷新，不走浏览器缓存
        const response = await fetch(`https://api.m.taobao.com/rest/api3.do?api=mtop.common.gettimestamp&_=${Date.now()}`);
        const data = await response.json();

        // 淘宝接口直接返回 13 位毫秒数字，如 "1723000000000"
        if (data && data.data && data.data.t) {
            const serverTimestamp = parseInt(data.data.t, 10);
            
            // 核心公式：绝对服务器时间 - 绝对本地时间
            timeOffset = serverTimestamp - Date.now();

            console.log('------------------------------------');
            console.log('[NTP 毫秒授时同步成功]');
            console.log('服务器当前时间:', new Date(serverTimestamp).toLocaleString());
            console.log('本地系统当前时间:', new Date().toLocaleString());
            console.log(`真实时钟偏差 (timeOffset): ${timeOffset} ms`);
            console.log('------------------------------------');
            return;
        }
        throw new Error('数据结构解析失败');
    } catch (error) {
        console.warn('[主接口获取失败，尝试苏宁时间戳备用接口]:', error);

        try {
            // 备用接口：苏宁授时 API（同样加上防缓存参数）
            const res = await fetch(`https://quan.suning.com/getSysTime.do?_=${Date.now()}`);
            const suningData = await res.json();
            
            // 苏宁返回格式为 "20260807140000"，手动拼接标准 ISO 格式并指定 +08:00 强制为北京时区
            const tStr = suningData.sysTime1; // 类似 "20260807140000"
            const formatted = `${tStr.slice(0,4)}-${tStr.slice(4,6)}-${tStr.slice(6,8)}T${tStr.slice(8,10)}:${tStr.slice(10,12)}:${tStr.slice(12,14)}+08:00`;
            
            const serverTimestamp = new Date(formatted).getTime();
            timeOffset = serverTimestamp - Date.now();
            
            console.log('[备用授时成功] 偏差为:', timeOffset, 'ms');
        } catch (e) {
            console.warn('[所有授时接口均失败，维持本地系统时间模式]', e);
        }
    }
}

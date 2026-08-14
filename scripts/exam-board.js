const SYNC_INTERVAL = 5 * 60 * 1000;
let timeOffset = 0;

// 存储考试安排列表，优先从 LocalStorage 读取
let scheduleList = JSON.parse(localStorage.getItem('examSchedule')) || [
    { subject: "语文", startTime: "09:00", endTime: "11:30" },
    { subject: "数学", startTime: "15:00", endTime: "17:00" }
];

async function syncTime() {
    try {
        const response = await fetch(`https://api.m.taobao.com/rest/api3.do?api=mtop.common.gettimestamp&${Date.now()}`);
        const data = await response.json();
        if (data && data.data && data.data.t) {
            const serverTimestamp = parseInt(data.data.t, 10);
            timeOffset = serverTimestamp - Date.now();
            return;
        }
        throw new Error('数据结构解析失败');
    } catch (error) {
        console.warn('[主接口获取失败，尝试苏宁时间戳备用接口]:', error);
        try {
            const res = await fetch(`https://quan.suning.com/getSysTime.do?_=${Date.now()}`);
            const suningData = await res.json();
            const tStr = suningData.sysTime1;
            const formatted = `${tStr.slice(0,4)}-${tStr.slice(4,6)}-${tStr.slice(6,8)}T${tStr.slice(8,10)}:${tStr.slice(10,12)}:${tStr.slice(12,14)}+08:00`;
            const serverTimestamp = new Date(formatted).getTime();
            timeOffset = serverTimestamp - Date.now();
        } catch (e) {
            console.warn('[所有授时接口均失败，维持本地系统时间模式]', e);
        }
    }
}

// 刷新页面显示逻辑
// 刷新页面显示逻辑
function updateDisplay() {
    const correctedNow = new Date(Date.now() + timeOffset);
    
    // 更新时间显示
    const hours = String(correctedNow.getHours()).padStart(2, '0');
    const minutes = String(correctedNow.getMinutes()).padStart(2, '0');
    const seconds = String(correctedNow.getSeconds()).padStart(2, '0');
    
    const timeElement = document.getElementById('current-time');
    if (timeElement) {
        timeElement.textContent = `${hours}:${minutes}:${seconds}`;
    }

    // 匹配当前时间是否在某场考试范围内
    const currentHM = `${hours}:${minutes}`;
    let activeExam = null;

    for (const exam of scheduleList) {
        if (currentHM >= exam.startTime && currentHM < exam.endTime) {
            activeExam = exam;
            break;
        }
    }

    // DOM 元素引用
    const subjectEl = document.getElementById('current-subject');
    const startContainer = document.getElementById('start-time-container');
    const endContainer = document.getElementById('end-time-container');
    const startEl = document.getElementById('start-time');
    const endEl = document.getElementById('end-time');

    // 保持容器始终可见
    if (startContainer) startContainer.style.visibility = 'visible';
    if (endContainer) endContainer.style.visibility = 'visible';

    // 根据是否有考试更新具体文字内容
    if (activeExam) {
        if (subjectEl) subjectEl.textContent = activeExam.subject;
        if (startEl) startEl.textContent = activeExam.startTime;
        if (endEl) endEl.textContent = activeExam.endTime;
    } else {
        // 无考试状态：显示“无”，开始/结束时间显示“00:00”
        if (subjectEl) subjectEl.textContent = '无';
        if (startEl) startEl.textContent = '--:--';
        if (endEl) endEl.textContent = '--:--';
    }
}


// ----------------- 设置弹窗与表格控制逻辑 -----------------
function initSettingsModal() {
    const modal = document.getElementById('settings-modal');
    const btn = document.getElementById('settings-btn');
    const closeBtn = document.getElementById('close-modal');
    const addBtn = document.getElementById('add-row-btn');
    const saveBtn = document.getElementById('save-settings-btn');
    const tbody = document.getElementById('schedule-body');

    // 打开弹窗并渲染当前数据
    btn.onclick = () => {
        renderTable();
        modal.style.display = 'flex';
    };

    // 关闭弹窗
    closeBtn.onclick = () => modal.style.display = 'none';
    window.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };

    // 渲染表格行
    function renderTable() {
        tbody.innerHTML = '';
        scheduleList.forEach((item, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><input type="text" class="inp-subject" value="${item.subject}"></td>
                <td><input type="time" class="inp-start" value="${item.startTime}"></td>
                <td><input type="time" class="inp-end" value="${item.endTime}"></td>
                <td><button class="btn-delete" onclick="deleteRow(${index})">删除</button></td>
            `;
            tbody.appendChild(tr);
        });
    }

    // 新增一行
    addBtn.onclick = () => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><input type="text" class="inp-subject" value="新科目"></td>
            <td><input type="time" class="inp-start" value="09:00"></td>
            <td><input type="time" class="inp-end" value="11:30"></td>
            <td><button class="btn-delete" onclick="this.closest('tr').remove()">删除</button></td>
        `;
        tbody.appendChild(tr);
    };

    // 删除行回调
    window.deleteRow = (index) => {
        scheduleList.splice(index, 1);
        renderTable();
    };

    // 保存设置
    saveBtn.onclick = () => {
        const rows = tbody.querySelectorAll('tr');
        const newList = [];
        rows.forEach(row => {
            const subject = row.querySelector('.inp-subject').value;
            const startTime = row.querySelector('.inp-start').value;
            const endTime = row.querySelector('.inp-end').value;
            if (subject && startTime && endTime) {
                newList.push({ subject, startTime, endTime });
            }
        });
        scheduleList = newList;
        localStorage.setItem('examSchedule', JSON.stringify(scheduleList));
        modal.style.display = 'none';
        updateDisplay(); // 立即重新判断显示
    };
}

// 初始化执行
function init() {
    syncTime();
    setInterval(syncTime, SYNC_INTERVAL);
    
    updateDisplay();
    setInterval(updateDisplay, 1000);

    initSettingsModal();
}

document.addEventListener('DOMContentLoaded', init);

// 初始化
$(document).ready(function() {
    // 隱藏 loading 動畫
    setTimeout(function() {
        $('#loadingOverlay').fadeOut(300, function() {
            $(this).remove();
        });
    }, 500);
    
    initTable();
    updateStats();
});

// 模擬數據
let tableData = [
    { id: 'A243-1', bed: '0414073', name: '王○○', gender: '女', age: 52, admission: '114/12/15', discharge: '114/12/15', department: '骨科', diagnosis: '膝關節炎', status: '待銜', score: 0, note: '' },
    { id: 'A207-2', bed: '0407623', name: '李○○', gender: '男', age: 68, admission: '114/12/16', discharge: '114/12/17', department: '內科', diagnosis: '糖尿病併發症', status: '已銜', score: 0, note: '' },
    { id: 'A207-3', bed: '0530966', name: '林○○', gender: '女', age: 62, admission: '114/12/17', discharge: '114/12/18', department: '心臟科', diagnosis: '心臟衰竭', status: '待銜', score: 0, note: '需持續追蹤' },
    { id: 'A268-3', bed: '0406418', name: '張○○', gender: '男', age: 45, admission: '114/12/18', discharge: '114/12/19', department: '神經科', diagnosis: '中風', status: '已銜', score: 0, note: '' },
    { id: 'A267-4', bed: '0413678', name: '陳○○', gender: '女', age: 70, admission: '114/12/19', discharge: '114/12/20', department: '內科', diagnosis: '肺炎', status: '待銜', score: 0, note: '' },
    { id: 'A211', bed: '0156720', name: '吳○○', gender: '男', age: 48, admission: '114/12/20', discharge: '114/12/21', department: '外科', diagnosis: '闌尾炎', status: '已銜', score: 0, note: '' },
    { id: 'A312-3', bed: '0056993', name: '周○○', gender: '女', age: 50, admission: '114/12/21', discharge: '114/12/22', department: '婦科', diagnosis: '子宮肌瘤', status: '待銜', score: 0, note: '' },
    { id: 'A312-4', bed: '0408554', name: '柯○○', gender: '男', age: 58, admission: '114/12/22', discharge: '114/12/23', department: '耳鼻喉科', diagnosis: '鼻竇炎', status: '已銜', score: 0, note: '' },
    { id: 'A302-3', bed: '0211591', name: '謝○○', gender: '女', age: 55, admission: '114/12/23', discharge: '114/12/24', department: '眼科', diagnosis: '青光眼', status: '待銜', score: 0, note: '' },
    { id: 'A312-5', bed: '0451972', name: '黃○○', gender: '男', age: 74, admission: '114/12/24', discharge: '114/12/25', department: '復健科', diagnosis: '肌肉萎縮', status: '待銜', score: 0, note: '已轉介物理治療' }
];

let currentPage = 1;
let pageSize = 10;
let isEditMode = false;
let filteredData = tableData;

// 初始化表格
function initTable() {
    renderTable();
    bindEvents();
}

// 更新統計數據
function updateStats() {
    const total = tableData.length;
    const pending = tableData.filter(item => item.status === '待銜').length;
    const completed = tableData.filter(item => item.status === '已銜').length;
    
    $('#totalPatients').text(total);
    $('#pendingPatients').text(pending);
    $('#completedPatients').text(completed);
}

// 渲染表格
function renderTable() {
    const tbody = $('#tableBody');
    tbody.empty();

    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const displayData = filteredData.slice(start, end);

    displayData.forEach((row, index) => {
        const scoreDisplay = row.score > 0 
            ? `<span class="score-badge" data-id="${row.id}">${row.score}</span>` 
            : `<span class="score-badge not-assessed" data-id="${row.id}">未評</span>`;
        
        const tr = `
            <tr data-id="${row.id}" class="patient-row">
                <td class="col-checkbox"><input type="checkbox" class="row-checkbox"></td>
                <td class="col-id editable" data-field="id">${escapeHtml(row.id)}</td>
                <td class="col-bed editable" data-field="bed">${escapeHtml(row.bed)}</td>
                <td class="col-name editable" data-field="name">${escapeHtml(row.name)}</td>
                <td class="col-gender editable" data-field="gender">${escapeHtml(row.gender)}</td>
                <td class="col-age editable" data-field="age">${escapeHtml(row.age.toString())}</td>
                <td class="col-admission editable" data-field="admission">${escapeHtml(row.admission)}</td>
                <td class="col-discharge editable" data-field="discharge">${escapeHtml(row.discharge)}</td>
                <td class="col-department editable" data-field="department">${escapeHtml(row.department)}</td>
                <td class="col-diagnosis editable" data-field="diagnosis">${escapeHtml(row.diagnosis)}</td>
                <td class="col-status editable" data-field="status">
                    <span class="status-badge status-${row.status}">${escapeHtml(row.status)}</span>
                </td>
                <td class="col-score">${scoreDisplay}</td>
                <td class="col-note editable" data-field="note">${escapeHtml(row.note)}</td>
                <td class="col-action">
                    <button class="btn-edit" title="編輯">✏️</button>
                    <button class="btn-delete" title="刪除">🗑️</button>
                </td>
            </tr>
        `;
        tbody.append(tr);
    });

    updatePagination();
    bindRowEvents();
}

// 綁定事件
function bindEvents() {
    // 全選複選框
    $('#checkAll').on('change', function() {
        $('.row-checkbox').prop('checked', $(this).prop('checked'));
    });

    // 按鈕事件
    $('#btnAdd').on('click', addNewRow);
    $('#btnDelete').on('click', deleteSelectedRows);
    $('#btnSave').on('click', saveData);
    $('#btnExport').on('click', exportData);
    $('#btnRefresh').on('click', refreshTable);

    // 搜尋功能
    $('#searchInput').on('input', function() {
        const searchText = $(this).val().toLowerCase();
        filterTable(searchText);
    });

    // 篩選功能
    $('#filterStatus').on('change', function() {
        filterByStatus($(this).val());
    });

    // 鍵盤快捷鍵
    $(document).on('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            saveData();
        }
    });
}

// 綁定行事件
function bindRowEvents() {
    // 點擊整行打開評估表單（除了複選框和按鈕）
    $('.patient-row').on('click', function(e) {
        const $target = $(e.target);
        
        // 如果點擊的是複選框、按鈕或可編輯欄位，則不打開評估表單
        if ($target.is('input[type="checkbox"]') || 
            $target.is('button') || 
            $target.closest('.col-action').length > 0 ||
            ($target.closest('.editable').length > 0 && isEditMode)) {
            return;
        }

        const id = $(this).data('id');
        openAssessmentForm(id);
    });

    // 點擊評分標籤打開評估表單
    $('.score-badge').on('click', function(e) {
        e.stopPropagation();
        const id = $(this).data('id');
        openAssessmentForm(id);
    });

    // 可編輯單元格點擊事件
    $('.editable').on('click', function(e) {
        if (!isEditMode) return;
        if ($(this).find('input').length > 0) return;
        
        e.stopPropagation(); // 阻止觸發行點擊

        const $cell = $(this);
        const field = $cell.data('field');
        const value = $cell.text();
        const $row = $cell.closest('tr');
        const id = $row.data('id');

        $cell.html(`<input type="text" value="${escapeHtml(value)}">`);
        $cell.find('input').focus().select();

        $cell.find('input').on('blur', function() {
            const newValue = $(this).val();
            $cell.text(newValue);
            updateRowData(id, field, newValue);
        }).on('keypress', function(e) {
            if (e.which === 13) {
                $(this).blur();
            }
        });
    });

    // 編輯和刪除按鈕
    $('.btn-edit').on('click', function(e) {
        e.stopPropagation();
        const $row = $(this).closest('tr');
        const id = $row.data('id');
        openAssessmentForm(id);
    });

    $('.btn-delete').on('click', function(e) {
        e.stopPropagation();
        const $row = $(this).closest('tr');
        const id = $row.data('id');
        if (confirm(`確定刪除 ${id} 嗎？`)) {
            tableData = tableData.filter(item => item.id !== id);
            updateStats();
            filterTable($('#searchInput').val());
        }
    });
}

// 打開評估表單
function openAssessmentForm(patientId) {
    const patient = tableData.find(item => item.id === patientId);
    if (!patient) return;

    const url = `assessment.html?id=${encodeURIComponent(patient.id)}&bed=${encodeURIComponent(patient.bed)}&name=${encodeURIComponent(patient.name)}&admission=${encodeURIComponent(patient.admission)}&score=${patient.score}`;
    
    // 打開新視窗
    window.open(url, '_blank', 'width=1000,height=800,scrollbars=yes,resizable=yes');
}

// 從評估表單更新分數
function updatePatientScore(patientId, score) {
    const patient = tableData.find(item => item.id === patientId);
    if (patient) {
        patient.score = score;
        renderTable();
    }
}

// 新增行
function addNewRow() {
    const newId = 'A' + Math.floor(Math.random() * 1000);
    const newRow = {
        id: newId,
        bed: '',
        name: '新患者',
        gender: '',
        age: '',
        admission: '',
        discharge: '',
        department: '',
        diagnosis: '',
        status: '待銜',
        score: 0,
        note: ''
    };
    
    tableData.unshift(newRow);
    updateStats();
    isEditMode = true;
    $('#editNotif').show();
    renderTable();
}

// 刪除選中的行
function deleteSelectedRows() {
    const selectedIds = [];
    $('.row-checkbox:checked').each(function() {
        const id = $(this).closest('tr').data('id');
        selectedIds.push(id);
    });

    if (selectedIds.length === 0) {
        alert('請先選擇要刪除的記錄');
        return;
    }

    if (confirm(`確定刪除 ${selectedIds.length} 筆記錄嗎？`)) {
        tableData = tableData.filter(item => !selectedIds.includes(item.id));
        updateStats();
        filterTable($('#searchInput').val());
        $('#checkAll').prop('checked', false);
    }
}

// 保存數據
function saveData() {
    alert('✅ 數據已保存！\n\n模擬保存操作:\n' + 
          `- 總記錄數: ${tableData.length}\n` +
          `- 編輯模式: ${isEditMode ? '開啟' : '關閉'}\n\n` +
          '在實際應用中，此處應調用後端 API 保存數據。');
    isEditMode = false;
    $('#editNotif').hide();
}

// 匯出數據
function exportData() {
    let csv = '\uFEFF病歷號,床號,姓名,性別,年齡,住院日期,出院日期,科別,診斷,轉銜狀況,備註\n';
    
    tableData.forEach(row => {
        csv += `${row.id},${row.bed},${row.name},${row.gender},${row.age},${row.admission},${row.discharge},${row.department},${row.diagnosis},${row.status},${row.note}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', '出院轉銜數據_' + new Date().toISOString().split('T')[0] + '.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert('✅ 數據已匯出！');
}

// 重新整理
function refreshTable() {
    location.reload();
}

// 搜尋表格
function filterTable(searchText) {
    if (!searchText) {
        filteredData = tableData;
    } else {
        filteredData = tableData.filter(row => {
            return Object.values(row).some(val => 
                String(val).toLowerCase().includes(searchText)
            );
        });
    }
    currentPage = 1;
    renderTable();
}

// 按狀況篩選
function filterByStatus(status) {
    if (!status) {
        filterTable($('#searchInput').val());
    } else {
        const searchText = $('#searchInput').val();
        filteredData = tableData.filter(row => {
            const matchStatus = row.status === status;
            const matchSearch = !searchText || Object.values(row).some(val => 
                String(val).toLowerCase().includes(searchText.toLowerCase())
            );
            return matchStatus && matchSearch;
        });
    }
    currentPage = 1;
    renderTable();
}

// 更新行數據
function updateRowData(id, field, value) {
    const row = tableData.find(item => item.id === id);
    if (row) {
        row[field] = value;
        isEditMode = true;
        $('#editNotif').show();
    }
}

// 更新分頁資訊
function updatePagination() {
    const totalPages = Math.ceil(filteredData.length / pageSize);
    $('#pageInfo').text(`第 ${currentPage} 頁 / 共 ${totalPages} 頁`);
    
    $('#prevPage').prop('disabled', currentPage === 1);
    $('#nextPage').prop('disabled', currentPage === totalPages);

    $('#prevPage').off('click').on('click', function() {
        if (currentPage > 1) {
            currentPage--;
            renderTable();
            $('html, body').animate({ scrollTop: 0 }, 300);
        }
    });

    $('#nextPage').off('click').on('click', function() {
        if (currentPage < totalPages) {
            currentPage++;
            renderTable();
            $('html, body').animate({ scrollTop: 0 }, 300);
        }
    });
}

// 轉義 HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 從 localStorage 載入已保存的評分
function loadScoresFromStorage() {
    tableData.forEach(patient => {
        const savedData = localStorage.getItem(`assessment_${patient.id}`);
        if (savedData) {
            const assessment = JSON.parse(savedData);
            patient.score = assessment.totalScore || 0;
        }
    });
}

// 頁面加載完成後初始化
$(document).ready(function() {
    loadScoresFromStorage();
    initTable();
});
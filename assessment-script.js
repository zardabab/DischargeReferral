// 初始化頁面
$(document).ready(function() {
    // 隱藏 loading 動畫
    setTimeout(function() {
        $('#loadingOverlay').fadeOut(300, function() {
            $(this).remove();
        });
    }, 500);
    
    initAssessment();
});

let totalScore = 0;
let patientData = {};

// 從 URL 參數獲取患者資料
function getPatientDataFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return {
        id: urlParams.get('id') || '-',
        bed: urlParams.get('bed') || '-',
        name: urlParams.get('name') || '-',
        admission: urlParams.get('admission') || '-',
        score: urlParams.get('score') || '0'
    };
}

// 初始化頁面
function initAssessment() {
    patientData = getPatientDataFromURL();
    
    // 填入基本資料
    $('#patientId').text(patientData.id);
    $('#bedNumber').text(patientData.bed);
    $('#patientName').text(patientData.name);
    $('#admissionDate').text(patientData.admission);
    $('#assessmentDate').text(getCurrentDate());

    // 綁定事件
    bindEvents();
    
    // 如果有已儲存的分數，載入選擇狀態
    loadSavedAssessment();
}

// 獲取當前日期
function getCurrentDate() {
    const now = new Date();
    const year = now.getFullYear() - 1911; // 民國年
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
}

// 綁定事件
function bindEvents() {
    // 計算分數
    $('input[type="checkbox"], input[type="radio"]').on('change', calculateScore);
    
    // 關閉按鈕
    $('#btnClose, #btnCancel').on('click', function() {
        if (confirm('確定要關閉嗎？未儲存的資料將會遺失。')) {
            window.close();
            // 如果無法關閉視窗，則返回上一頁
            setTimeout(() => {
                window.history.back();
            }, 100);
        }
    });
    
    // 儲存評分
    $('#btnSaveAssessment').on('click', saveAssessment);
}

// 計算總分
function calculateScore() {
    totalScore = 0;
    
    // 累加所有被勾選的項目分數
    $('input[type="checkbox"]:checked, input[type="radio"]:checked').each(function() {
        const score = parseInt($(this).data('score')) || 0;
        totalScore += score;
    });
    
    // 更新顯示
    $('#totalScore').text(totalScore);
}

// 儲存評估結果
function saveAssessment() {
    // 收集所有選擇的項目
    const selectedItems = [];
    
    $('input[type="checkbox"]:checked, input[type="radio"]:checked').each(function() {
        const name = $(this).attr('name');
        const value = $(this).val();
        const text = $(this).next('span').text();
        selectedItems.push({ name, value, text });
    });

    // 建立評估結果物件
    const assessmentResult = {
        patientId: patientData.id,
        bedNumber: patientData.bed,
        patientName: patientData.name,
        assessmentDate: $('#assessmentDate').text(),
        doctor: $('#doctor').val(),
        totalScore: totalScore,
        selectedItems: selectedItems,
        timestamp: new Date().toISOString()
    };

    // 儲存到 localStorage
    localStorage.setItem(`assessment_${patientData.id}`, JSON.stringify(assessmentResult));

    // 提示儲存成功
    alert(`✅ 評分已儲存！\n\n患者：${patientData.name}\n總分：${totalScore} 分\n\n將返回主頁面...`);

    // 透過 window.opener 更新主視窗的分數
    if (window.opener && !window.opener.closed) {
        window.opener.updatePatientScore(patientData.id, totalScore);
    }

    // 關閉視窗或返回上一頁
    setTimeout(() => {
        window.close();
        setTimeout(() => {
            window.history.back();
        }, 100);
    }, 500);
}

// 載入已儲存的評估結果
function loadSavedAssessment() {
    const savedData = localStorage.getItem(`assessment_${patientData.id}`);
    
    if (!savedData) return;

    const assessment = JSON.parse(savedData);
    
    // 恢復醫師名稱
    if (assessment.doctor) {
        $('#doctor').val(assessment.doctor);
    }

    // 恢復選擇的項目
    if (assessment.selectedItems) {
        assessment.selectedItems.forEach(item => {
            const selector = `input[name="${item.name}"][value="${item.value}"]`;
            $(selector).prop('checked', true);
        });
    }

    // 重新計算分數
    calculateScore();
}

// 頁面載入完成後初始化
$(document).ready(function() {
    initAssessment();
});
/**
 * main.js
 * - Receive event from'index.html'.
 * - Get class 'Variable' from 'ui.js'.
 * - Actual calculation from 'mccabe-thiele.js'.
 * - Draw graph by Chart.js at canvas(html)
 */

import { Variable } from './ui.js';
import { calculateMcCabeThiele } from './mccabe-thiele.js';
let mccabeChart = null;

const calcForm = document.getElementById('calc-form');
const chartCanvas = document.getElementById('mccabeThieleChart');
const resultsTextElement = document.getElementById('results-text');
const ctx = chartCanvas.getContext('2d');

/**
 * Run calculation and update states
 */
function runCalculation() {
    try {
        const variables = new Variable();
        const { plotData, results, floatStageNum } = calculateMcCabeThiele(variables);
        renderResults(results, floatStageNum); // print output as text
        renderPlot(plotData); // print output as plot

    } catch (error) {
        console.error("McCabe-Thiele 계산 중 오류 발생:", error);
        alert(`계산에 실패했습니다: ${error.message}\n콘솔(F12)에서 자세한 내용을 확인하세요.`);
        resultsTextElement.textContent = `계산 오류:\n${error.message}`;
    }
}

/**
 * print output at HTML <pre> tag
 * @param {object} results
 */
function renderResults(results, floatStageNum) {
    const outputText = `
    -- 계산 결과 (Results) --
    최소 환류비 (R_min)   : ${results.R_min.toFixed(3)}
    실제 환류비 (R)       : ${results.R.toFixed(3)} (R_min의 ${document.getElementById('r_factor').value}배)
    
    총 이론 단 수 (Stages): ${results.stages}(${floatStageNum.toFixed(1)}) 단
    최적 공급 단 (Feed @) : ${results.feed_stage} 번째 단 (from top)
    
    실제 하부 조성 (xb_actual): ${results.xb_actual.toFixed(5)}
    (목표 하부 조성: ${document.getElementById('xb').value})
    `;
    resultsTextElement.textContent = outputText;
}

/**
 * [!] 수정된 함수 [!]
 * 계산된 플롯 데이터를 받아 Chart.js로 캔버스에 그래프를 그립니다.
 * (v2.0 - 분리된 유사 평형 곡선 렌더링)
 * @param {object} plotData - mccabe-thiele.js가 반환한 plotData 객체
 */
function renderPlot(plotData) {
    
    // 1. Chart.js가 요구하는 'datasets' 형식으로 데이터를 변환합니다.
    const datasets = [
        // (1) 이상 평형 곡선 (VLE 데이터)
        {
            label: 'Ideal Equilibrium (VLE)',
            data: plotData.ideal_eq_curve, // [{x, y}, ...]
            borderColor: 'blue',
            borderWidth: 2,
            pointRadius: 0,
            showLine: true,
            type: 'line',
        },
        
        
        // [!] 'murphree_eq_curve'
        {   label: 'Effective Eq. (Rectifying)',
            data: plotData.effective_curve,
            borderColor: '#00c000', // 녹색
            borderDash: [5, 5], // 점선
            borderWidth: 2,
            pointRadius: 0,
            showLine: true,
            type: 'line',
        },

        // (3) y=x (45도선)
        {
            label: 'y = x',
            data: plotData.line_45,
            borderColor: 'grey',
            borderWidth: 1,
            pointRadius: 0,
            showLine: true,
            type: 'line',
        },
        // (4) q-line
        {
            label: 'q-Line',
            data: plotData.q_line,
            borderColor: 'orange', // (q-line 색상, 겹칠 수 있으니 orange 유지)
            borderWidth: 2,
            pointRadius: 0,
            showLine: true,
            type: 'line',
        },
        // (5) 정류부 조작선 (ESOL)
        {
            label: 'ESOL',
            data: plotData.esol_line,
            borderColor: '#6a5acd', // 보라색
            borderWidth: 2,
            pointRadius: 0,
            showLine: true,
            type: 'line',
        },
        // (6) 탈거부 조작선 (SSOL)
        {
            label: 'SSOL',
            data: plotData.ssol_line,
            borderColor: '#6a5acd', // 보라색
            borderWidth: 2,
            pointRadius: 0,
            showLine: true,
            type: 'line',
        },
        // (7) 계단 (Steps) - 각 선분을 별도의 데이터셋으로 추가
        ...plotData.steps.map(segment => ({
            type: 'line',
            data: segment, // [{x,y}, {x,y}]
            borderColor: '#FF6384', // 빨간색 (계단)
            borderWidth: 1.5,
            pointRadius: 0,
            fill: false,
            showLine: true,
            showInLegend: false, 
        }))
    ];

    // 2. 기존에 차트가 있다면, 업데이트를 위해 파괴(destroy)합니다.
    if (mccabeChart) {
        mccabeChart.destroy();
    }

    // 3. 새 차트를 생성합니다.
    mccabeChart = new Chart(ctx, {
        type: 'scatter', 
        data: { datasets: datasets },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: 'McCabe-Thiele Plot (Methanol-Water @ 1 atm)',
                    font: { size: 18 }
                },
                legend: {
                    position: 'bottom',
                    labels: {
                        // [!] 우리가 이전에 수정한 'TypeError' 방지 코드 포함
                        filter: (legendItem) => {
                            if (!legendItem.text) {
                                return false; // 'label'이 없는 항목 (예: steps) 숨기기
                            }
                            return true; // 'label'이 있는 항목만 표시
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const d = context.raw;
                            return `${context.dataset.label}: (x: ${d.x.toFixed(3)}, y: ${d.y.toFixed(3)})`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: { display: true, text: 'Liquid Mole Fraction (x)' },
                    min: 0.0,
                    max: 1.0,
                },
                y: {
                    type: 'linear',
                    title: { display: true, text: 'Vapor Mole Fraction (y)' },
                    min: 0.0,
                    max: 1.0,
                }
            },
            aspectRatio: 1,
            animation: false,
            parsing: false, 
        }
    });
}

calcForm.addEventListener('submit', (event) => {
    event.preventDefault(); 
    runCalculation();
});

document.addEventListener('DOMContentLoaded', () => {
    console.log("페이지 로드 완료. 기본값으로 첫 계산을 실행합니다.");
    runCalculation();
});
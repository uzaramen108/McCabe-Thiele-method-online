/**
 * mccabe-thiele.js
 * Main logic for McCabe-Thiele
 * Use equilibrium line from 'eq_line.js'
 * Murphree efficiency is calculated between actual equilibrium line and operating line
 * (y_effective = y_op + nm * (y_ideal - y_op))
 * Seperated operating line into rectifying section and stripping section.
 */

import { getIdealEquilibriumY } from "./eq_line.js";
import { Variable } from "./ui.js";

/**
 * VLE 곡선과 y=x 선(45도선)의 교차점 (공비점)을 모두 찾아 반환합니다.
 * @returns {number[]} - 공비점 x-조성 배열. 공비점이 없으면 빈 배열을 반환합니다.
 */
function findAzeotropeX() {
    const f = (x) => getIdealEquilibriumY(x) - x;
    const azeotropes = [];
    
    // [설정] 스캔할 간격의 수 (정밀도와 성능의 타협점, 1000개로 설정)
    const NUM_SEGMENTS = 1000; 
    const step = 1.0 / NUM_SEGMENTS;
    const tolerance = 1e-6; // 부동 소수점 오차 허용 범위

    let x1 = 0.0;
    let y1 = f(x1); // f(0) = 0.0 (항상 0임)

    for (let i = 1; i <= NUM_SEGMENTS; i++) {
        let x2 = Math.min(1.0, i * step); // 1.0을 넘지 않도록 보장
        let y2 = f(x2);

        // 1. [경계값 검사] (x=0 또는 x=1)에서는 공비점이 없다고 가정하고 넘어감
        if (Math.abs(x1) < tolerance || Math.abs(x2 - 1.0) < tolerance) {
             x1 = x2;
             y1 = y2;
             continue;
        }

        // 2. [부호 변화 검사] y1과 y2의 부호가 다른지 확인 (45도선 통과)
        if (y1 * y2 < 0) {
            // 부호가 바뀌었으므로, 이 구간 [x1, x2] 안에 공비점이 존재
            
            // [이분법 재활용] 이 구간에서 정밀한 교차점을 찾음 (30회)
            let low = x1;
            let high = x2;
            for (let j = 0; j < 30; j++) {
                let mid_x = (low + high) / 2;
                if (f(mid_x) === 0 || high - low < tolerance) {
                    low = mid_x; // mid_x로 수렴
                    break;
                }
                if (f(mid_x) * f(low) < 0) {
                    high = mid_x;
                } else {
                    low = mid_x;
                }
            }
            const x_azeo = (low + high) / 2;

            // 중복 방지 및 배열에 추가
            if (azeotropes.length === 0 || Math.abs(azeotropes[azeotropes.length - 1] - x_azeo) > tolerance) {
                 azeotropes.push(x_azeo);
            }
        }
        
        // 3. 다음 루프를 위해 값 갱신
        x1 = x2;
        y1 = y2;
    }

    return azeotropes; // 공비점 배열 반환
}

/**
 * Return x' when q = 0 (수평선)
 * (q-line 플로팅 및 R_min 계산에 사용됨)
 */
function ideal_eq2(y_target) {
  let low = 0.0;
  let high = 1.0;
  let mid_xa;
  for (let i = 0; i < 30; i++) {
    mid_xa = (low + high) / 2;
    const y_guess = getIdealEquilibriumY(mid_xa);
    if (y_guess < y_target) {
      low = mid_xa;
    } else {
      high = mid_xa;
    }
  }
  return (low + high) / 2;
}

/**
 * q-line actual equilibrium line의 교차점을 찾기 (q-line 플로팅 및 R_min 계산용).
 */
function find_q_ideal_eq_intersect(q, zf) {
  if (Math.abs(q - 1.0) < 1e-6) {
    // q = 1 (수직선)
    const x_intersect = zf;
    const y_intersect = getIdealEquilibriumY(zf);
    return { x: x_intersect, y: y_intersect };
  }
  if (Math.abs(q) < 1e-6) {
    // q = 0 (수평선)
    const x_intersect = ideal_eq2(zf);
    const y_intersect = zf;
    return { x: x_intersect, y: y_intersect };
  }

  const q_slope = q / (q - 1);
  const q_intercept = -zf / (q - 1);
  const q_line = (x) => q_slope * x + q_intercept;
  const f = (x) => getIdealEquilibriumY(x) - q_line(x);

  let low = 0.0,
    high = 1.0,
    mid_x;
  for (let i = 0; i < 30; i++) {
    mid_x = (low + high) / 2;
    if (f(mid_x) < 0) {
      low = mid_x;
    } else {
      high = mid_x;
    }
  }
  const x_intersect = (low + high) / 2;
  const y_intersect = getIdealEquilibriumY(x_intersect);

  return { x: x_intersect, y: y_intersect };
}

/**
 * @param {array} dataArray
 * @param {number} y_target
 * @returns {number}
 */
function find_x_from_data(dataArray, y_target) {
  // Is target end of data?
  if (y_target <= dataArray[0].y) return dataArray[0].x;
  if (y_target >= dataArray[dataArray.length - 1].y)
    return dataArray[dataArray.length - 1].x;

  let low = 0;
  let high = dataArray.length - 1;
  let p1 = dataArray[low];
  let p2 = dataArray[high];

  while (high - low > 1) {
    let mid = Math.floor((low + high) / 2);
    if (dataArray[mid].y < y_target) {
      low = mid;
    } else {
      high = mid;
    }
  }
  p1 = dataArray[low];
  p2 = dataArray[high];

  // 데이터 사이를 선형으로 메꿈
  const slope_inv = (p2.x - p1.x) / (p2.y - p1.y);
  const x_out = p1.x + (y_target - p1.y) * slope_inv;

  return x_out;
}

/**
 * McCabe-Thiele 계산을 수행하는 메인 함수
 * @param {Variable} variables - ui.js에서 생성된 Variable class
 * @returns {object}
 */
export function calculateMcCabeThiele(variables) {
  const { xd, xb, zf, q, r_factor, nm, sc } = variables;
  const plotData = {
    ideal_eq_curve: [],
    line_45: [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
    ],
    q_line: [],
    esol_line: [],
    ssol_line: [],
    steps: [],
    effective_curve: [],
  };
  const results = { R_min: 0, R: 0, stages: 0, feed_stage: 0, xb_actual: 0 };
  const { x: q_ideal_eq_x, y: q_ideal_eq_y } = find_q_ideal_eq_intersect(q, zf);
  const x_azeo_array = findAzeotropeX(); // 공비점 배열을 받음
  let isAzeoError = false;
  const azeoPointsInBoundary = [];

  if (x_azeo_array.length > 0) {
      // 1. 분리 영역(xb ~ xd)을 정의
      const x_min = Math.min(xd, xb);
      const x_max = Math.max(xd, xb);

      // 2. 공비점이 분리 영역 내부에 있는지 확인
      x_azeo_array.forEach(x_azeo => {
          if (x_azeo > x_min && x_azeo < x_max) {
              isAzeoError = true;
              azeoPointsInBoundary.push(x_azeo);
          }
      });
      /** 
      const highest_x_azeo = x_azeo_array[x_azeo_array.length - 1];
      if (xd > highest_x_azeo) {
          isAzeoError = true;
          if (!azeoPointsInBoundary.includes(highest_x_azeo)) {
              azeoPointsInBoundary.push(highest_x_azeo);
          }
      }
      */
  }
  
  // [신규] 공비물 오류 발생 시 즉시 반환 (계산 중단)
  if (isAzeoError) {
      // 오류가 발생했음을 알리는 플래그와 공비점 배열 반환
      return { 
          plotData: { /* empty */ }, 
          results: { /* empty */ }, 
          floatStageNum: 0,
          isAzeoError: true,
          x_azeo_list: azeoPointsInBoundary.map(x => x.toFixed(3)).join(", ")
      };
  }

  const r_min_slope = (xd - q_ideal_eq_y) / (xd - q_ideal_eq_x);
  results.R_min = r_min_slope / (1 - r_min_slope); // 최소 환류비

  results.R = results.R_min * r_factor; // 실제 환류비

  let R_internal = results.R;

  const CP_LIQUID = 81.6; // 메탄올 액체 열용량 (J/mol·K)
  const LATENT_HEAT = 35270; // 메탄올 기화 잠열 (J/mol)
  const DELTA_T = sc; // 과냉각

  // 과냉각 보정 계수 (F > 1)
  // 차가운 환류가 증기를 추가 응축시켜 내부 유량을 증가시킴
  const F_factor = 1 + (CP_LIQUID * DELTA_T) / LATENT_HEAT; // 엔탈피 수지식을 토대로 구함

  // 조작선 그리기용 '내부 환류비' 갱신
  R_internal = results.R * F_factor;

  const esol_slope = R_internal / (R_internal + 1); // 정류부 operating line 기울기
  const esol_intercept = xd / (R_internal + 1); // 정류부 operating line 절편

  let q_esol_intersect_x, q_esol_intersect_y;
  if (Math.abs(q - 1.0) < 1e-6) {
    q_esol_intersect_x = zf;
    q_esol_intersect_y = esol_slope * q_esol_intersect_x + esol_intercept;
  } else {
    const q_slope = q / (q - 1);
    const q_intercept = -zf / (q - 1);
    q_esol_intersect_x =
      (esol_intercept - q_intercept) / (q_slope - esol_slope);
    q_esol_intersect_y = esol_slope * q_esol_intersect_x + esol_intercept;
  }

  const ssol_slope = (q_esol_intersect_y - xb) / (q_esol_intersect_x - xb); // 탈거부 operating line 기울기
  const ssol_intercept = xb - ssol_slope * xb; // 탈거부 operating line 절편

  plotData.q_line = [
    { x: zf, y: zf },
    { x: q_ideal_eq_x, y: q_ideal_eq_y },
  ];
  plotData.esol_line = [
    { x: xd, y: xd },
    { x: q_esol_intersect_x, y: q_esol_intersect_y },
  ];
  plotData.ssol_line = [
    { x: xb, y: xb },
    { x: q_esol_intersect_x, y: q_esol_intersect_y },
  ];

  const y_op_rect = (x) => esol_slope * x + esol_intercept;
  const y_op_strip = (x) => ssol_slope * x + ssol_intercept;

  for (let i = 0; i <= 100; i++) {
    const x = i / 100.0;
    const y_ideal = getIdealEquilibriumY(x); // Ideal equilibrium(blue)

    plotData.ideal_eq_curve.push({ x: x, y: y_ideal });

    const y_op_r = y_op_rect(x);
    const y_eff_r = y_op_r + nm * (y_ideal - y_op_r);
    if (x > q_esol_intersect_x) {
      plotData.effective_curve.push({ x: x, y: y_eff_r }); // 만약 qline을 안지났다면 rectifying operating line 기준으로, 아니면 stripping으로
    }

    const y_op_s = y_op_strip(x);
    const y_eff_s = y_op_s + nm * (y_ideal - y_op_s);
    if (x <= q_esol_intersect_x) {
      plotData.effective_curve.push({ x: x, y: y_eff_s });
    }
  }

  // stepping, 단수 계산.

  let current_x = xd;
  let current_y = xd;
  let stage_count = 0;
  let floatStageNum = 0;
  const MAX_STAGES = 200;

  while (current_x > xb && stage_count < MAX_STAGES) {
    stage_count++;

    let next_x; // 이번 스텝의 '다음 x'
    const step_start_y = current_y; // 수평선 그리기를 위한 y값 저장

    // 수평 이동
    next_x = find_x_from_data(plotData.effective_curve, current_y);

    // 수직 이동
    let next_y;
    if (next_x > q_esol_intersect_x) {
      next_y = y_op_rect(next_x);
    } else {
      next_y = y_op_strip(next_x);

      if (results.feed_stage === 0) {
        results.feed_stage = stage_count;
      }
    }

    plotData.steps.push([
      { x: current_x, y: step_start_y },
      { x: next_x, y: step_start_y },
    ]); // 수평선
    plotData.steps.push([
      { x: next_x, y: step_start_y },
      { x: next_x, y: next_y },
    ]); // 수직선

    if (next_x < xb) {
      floatStageNum = stage_count + (current_x - xb) / (current_x - next_x);
      break;
    }

    current_x = next_x;
    current_y = next_y;
  }

  if (results.feed_stage === 0) results.feed_stage = 1;
  results.stages = stage_count;
  results.xb_actual = current_x;

  return { plotData, results, floatStageNum, isAzeoError, x_azeo_array};
}

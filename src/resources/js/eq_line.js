/**
 * @typedef {{x: number, y: number}} VLEPoint
 */

// VLE 데이터는 모듈 내부 변수에 저장되며, 외부에서 주입 가능
/** @type {VLEPoint[]} */
let VLE_DATA = [];

// [TODO] Methanol-Water 기본 데이터 (초기값으로 사용)
export const METHANOL_VLE_DATA = [
  { x: 0.0, y: 0.0 },
  { x: 0.012, y: 0.068 },
  { x: 0.02, y: 0.121 },
  { x: 0.026, y: 0.159 },
  { x: 0.033, y: 0.188 },
  { x: 0.036, y: 0.215 },
  { x: 0.053, y: 0.275 },
  { x: 0.076, y: 0.366 },
  { x: 0.1, y: 0.438 },
  { x: 0.12, y: 0.485 },
  { x: 0.14, y: 0.522 },
  { x: 0.15, y: 0.541 },
  { x: 0.2, y: 0.605 },
  { x: 0.3, y: 0.686 },
  { x: 0.4, y: 0.739 },
  { x: 0.5, y: 0.779 },
  { x: 0.6, y: 0.825 },
  { x: 0.7, y: 0.87 },
  { x: 0.8, y: 0.915 },
  { x: 0.9, y: 0.958 },
  { x: 0.95, y: 0.979 },
  { x: 1.0, y: 1.0 },
];

// 모듈 로드 시 기본 데이터로 초기화
initializeVLEData(METHANOL_VLE_DATA);


/**
 * 외부에서 VLE 데이터를 주입하여 모듈을 초기화합니다.
 * @param {VLEPoint[]} newVLEData - 정렬된 VLE 포인트 배열
 */
export function initializeVLEData(newVLEData) {
    if (!Array.isArray(newVLEData) || newVLEData.length < 2) {
        console.error("VLE Data initialization failed: Data must be an array with at least 2 points.");
        VLE_DATA = METHANOL_VLE_DATA; // 오류 시 기본값 유지
        return;
    }
    // [핵심] 외부 데이터를 내부 변수에 저장
    VLE_DATA = newVLEData;
    console.log(`VLE Data initialized with ${VLE_DATA.length} points.`);
}


/**
 * 액상 조성(x_in)에 대한 이상 평형 기상 조성(y)을 계산합니다.
 * 선형 보간(Linear Interpolation)을 사용합니다.
 * @param {number} x_in - 액상 몰분율
 * @returns {number} - 기상 몰분율 (y)
 */
export function getIdealEquilibriumY(x_in) {
  if (x_in <= 0) return 0;
  if (x_in >= 1) return 1;

  // [핵심] 내부 변수 VLE_DATA 사용
  let p1 = VLE_DATA[0];
  let p2 = VLE_DATA[1];

  for (let i = 1; i < VLE_DATA.length; i++) {
    if (VLE_DATA[i].x >= x_in) {
      p1 = VLE_DATA[i - 1];
      p2 = VLE_DATA[i];
      break;
    }
  }

  const slope = (p2.y - p1.y) / (p2.x - p1.x);
  const y_out = p1.y + (x_in - p1.x) * slope;

  return y_out;
}
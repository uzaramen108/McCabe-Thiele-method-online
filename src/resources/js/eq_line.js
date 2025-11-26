// (메탄올-물 @ 1 atm)
const METHANOL_VLE_DATA = [
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

/**
 * @param {number} x_in - 액상 몰분율
 * @returns {number} - 기상 몰분율 (y), 빈 곳으로 선형 플롯
 */
export function getIdealEquilibriumY(x_in) {
  if (x_in <= 0) return 0;
  if (x_in >= 1) return 1;
  let p1 = METHANOL_VLE_DATA[0];
  let p2 = METHANOL_VLE_DATA[1];

  for (let i = 1; i < METHANOL_VLE_DATA.length; i++) {
    if (METHANOL_VLE_DATA[i].x >= x_in) {
      p1 = METHANOL_VLE_DATA[i - 1];
      p2 = METHANOL_VLE_DATA[i];
      break;
    }
  }

  const slope = (p2.y - p1.y) / (p2.x - p1.x);
  const y_out = p1.y + (x_in - p1.x) * slope;

  return y_out;
}

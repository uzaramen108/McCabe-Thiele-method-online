/**
 * ui.js
 * Read input from index.html
 * Show output from mccabe-thiele.js to index.html
 */

export class Variable {
  xd;
  xb;
  zf;
  q;
  r_factor;
  nm;
  sc;

  constructor() {
    // Used parseFloat() for shifting string(.value) to number
    this.xd = parseFloat(document.getElementById("xd").value);
    this.xb = parseFloat(document.getElementById("xb").value);
    this.zf = parseFloat(document.getElementById("zf").value);
    this.q = parseFloat(document.getElementById("q").value);
    this.r_factor = parseFloat(document.getElementById("r_factor").value);
    this.nm = parseFloat(document.getElementById("nm").value);
    this.sc = parseFloat(document.getElementById("sub_cooling").value);
    this.validate();
  }

  /**
   * @returns {boolean} - 모든 값이 유효하면 true, 아니면 false
   */
  validate() {
    const allValues = [
      this.xd,
      this.xb,
      this.zf,
      this.q,
      this.r_factor,
      this.nm,
      this.sc,
    ];
    if (allValues.some((val) => isNaN(val))) {
      console.error("입력값 오류: 일부 값이 숫자가 아닙니다 (NaN).", this);
      alert("유효하지 않은 입력값이 있습니다. 숫자만 입력해주세요.");
      return false;
    }
    if (this.xd <= this.zf || this.zf <= this.xb) {
      console.warn(
        `입력값 경고: 조성 순서가 올바르지 않습니다 (xd > zf > xb 여야 함). xd=${this.xd}, zf=${this.zf}, xb=${this.xb}`,
      );
    }
    return true;
  }
}

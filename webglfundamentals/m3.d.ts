declare module m3 {
    type Matrix3 = Array<number>;

    function translation(tx: number, ty: number): Matrix3;
    function rotation(angleInRadians: number): Matrix3;
    function scaling(sx: number, sy: number): Matrix3;
    function identity(): Matrix3;
    function multiply(a: Matrix3, b: Matrix3): Matrix3;
    function projection(width: number, height: number): Matrix3;
    function translate(m: Matrix3, tx: number, ty: number): Matrix3;
    function rotate(m: Matrix3, angleInRadians: number): Matrix3;
    function scale(m: Matrix3, sx: number, sy: number): Matrix3;
    function degToRad(d:number):number;
    function radToDeg(r:number):number;
}

declare module m4 {
    type Vector3 = Array<number>;
    type Vector4 = Array<number>;
    type Matrix4 = Array<number>;

    function xRotation(angleInRadians: number, dst?: Matrix4): Matrix4;
    function translate(
        m: Matrix4,
        tx: number,
        ty: number,
        tz: number,
        dst?: Matrix4
    ): Matrix4;
    function transformPoint(m: Matrix4, v: Vector3, dst?: Vector4): Vector4;
    function xRotate(
        m: Matrix4,
        angleInradians: number,
        dst?: Matrix4
    ): Matrix4;
    function yRotate(
        m: Matrix4,
        angleInradians: number,
        dst?: Matrix4
    ): Matrix4;
    function zRotate(
        m: Matrix4,
        angleInradians: number,
        dst?: Matrix4
    ): Matrix4;
    function scale(
        m: Matrix4,
        sx: number,
        sy: number,
        sz: number,
        dst?: Matrix4
    ): Matrix4;
    function multiply(a: Matrix4, b: Matrix4, dst?: Matrix4): Matrix4;
    function perspective(
        fieldOfViewInRadians: number,
        aspect: number,
        near: number,
        far: number,
        dst?: Matrix4
    ): Matrix4;
    function yRotation(angleInRadians: number): Matrix4;
    function inverse(m: Matrix4, dst?: Matrix4): Matrix4;
    function lookAt(
        cameraPosition: Vector3,
        target: Vector3,
        up: Vector3,
        dst?: Matrix4
    ): Matrix4;
    function transpose(m: Matrix4, dst?: Matrix4): Matrix4;
    function normalize(v: Vector3, dst?: Vector3): Vector3;
    function identity(dst?: Matrix4): Matrix4;
}

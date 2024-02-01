declare module webglUtils {
    function createUniformSetters(
        gl: WebGLRenderingContext,
        program: WebGLProgram
    ): { [key: string]: Function };
    function createAttributeSetters(
        gl: WebGLRenderingContext,
        program: WebGLProgram
    ): { [key: string]: Function };
    function resizeCanvasToDisplaySize(
        canvas: HTMLCanvasElement,
        multiplier?: number
    ): boolean;
    function setAttributes(setters: any, attribs: any): void;
    function setUniforms(setters: any, ...values: any[]): void;
}

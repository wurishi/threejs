declare module textureUtils {
    interface iOptions {
        width?: number;
        height?: number;
        color1?: string;
        color2?: string;
    }
    function makeStripeTexture(
        gl: WebGLRenderingContext,
        options: iOptions
    ): WebGLTexture;
    function makeCheckerTexture(
        gl: WebGLRenderingContext,
        options: iOptions
    ): WebGLTexture;
    function makeCircleTexture(
        gl: WebGLRenderingContext,
        options: iOptions
    ): WebGLTexture;
}

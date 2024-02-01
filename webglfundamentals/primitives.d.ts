declare module primitives {
    interface PlaneVertices {
        position: any;
        normal: any;
        texcoord: any;
        indices?: any;
        numElements?: number;
    }
    function createSphereBuffers(
        gl: WebGLRenderingContext,
        ...args: any[]
    ): PlaneVertices;
}

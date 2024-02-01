enum ShaderType {
    VERTEX_SHADER = WebGLRenderingContext.VERTEX_SHADER,
    FRAGMENT_SHADER = WebGLRenderingContext.FRAGMENT_SHADER,
}

/**
 * 创建并编译一个着色器
 * @param gl WebGL上下文
 * @param shaderSource GLSL 格式的着色器代码
 * @param shaderType 着色器类型(VERTEX_SHADER / FRAGMENT_SHADER)
 * @return 着色器
 */
export function compileShader(
    gl: WebGLRenderingContext,
    shaderSource: string,
    shaderType: ShaderType
): WebGLShader {
    // 创建着色器程序
    const shader = gl.createShader(shaderType);

    // 设置着色器的源码
    gl.shaderSource(shader, shaderSource);

    // 编译着色器
    gl.compileShader(shader);

    // 检测编译是否成功
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
        // 编译过程出错, 获取错误信息
        throw new Error('着色器未编译成功: ' + gl.getShaderInfoLog(shader));
    }

    return shader;
}

/**
 * 将2个着色器链接并创建一个着色器程序
 * @param gl WebGL 上下文
 * @param vertexShader 顶点着色器
 * @param fragmentShader 片断着色器
 * @return 着色器程序
 */
export function createProgram(
    gl: WebGLRenderingContext,
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader
): WebGLProgram {
    // 创建一个程序
    const program = gl.createProgram();

    // 附上着色器
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    // 链接到程序
    gl.linkProgram(program);

    // 检查链接是否成功
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!success) {
        // 链接过程出现问题
        throw new Error('链接失败: ' + gl.getProgramInfoLog(program));
    }

    return program;
}

/**
 * 用 script 标签的内容创建着色器
 * @param gl WebGL 上下文
 * @param scriptId script标签的id
 * @param opt_shaderType 着色器类型 (如果没有指定, 则使用script标签的type属性)
 */
export function createShaderFromScript(
    gl: WebGLRenderingContext,
    scriptId: string,
    opt_shaderType?: ShaderType
): WebGLShader {
    // 通过 id 找到 script 标签
    const shaderScript = document.getElementById(scriptId) as HTMLScriptElement;
    if (!shaderScript) {
        throw new Error('未找到 script 标签: ' + scriptId);
    }

    // 提取标签内容
    const shaderSource = shaderScript.text;

    // 如果没有指定着色器类型, 就使用标签的 'type' 属性
    if (!opt_shaderType) {
        if (shaderScript.type == 'x-shader/x-vertex') {
            opt_shaderType = WebGLRenderingContext.VERTEX_SHADER;
        } else if (shaderScript.type == 'x-shader/x-fragment') {
            opt_shaderType = WebGLRenderingContext.FRAGMENT_SHADER;
        } else {
            throw new Error('shader 类型没有正确指定');
        }
    }

    return compileShader(gl, shaderSource, opt_shaderType);
}

/**
 * 通过两个 script 标签创建着色器程序
 * @param gl WebGL 上下文
 * @param vertexShaderId 顶点着色器的标签 id
 * @param fragmentShaderId 片断着色器的标签 id
 * @returns 着色器程序
 */
export function createProgramFromScripts(
    gl: WebGLRenderingContext,
    vertexShaderId: string,
    fragmentShaderId: string
) {
    const vertexShader = createShaderFromScript(
        gl,
        vertexShaderId,
        WebGLRenderingContext.VERTEX_SHADER
    );
    const fragmentShader = createShaderFromScript(
        gl,
        fragmentShaderId,
        WebGLRenderingContext.FRAGMENT_SHADER
    );
    return createProgram(gl, vertexShader, fragmentShader);
}

export function createProgram2(
    gl: WebGLRenderingContext,
    vertex: string,
    fragment: string
) {
    const vertexShader = compileShader(
        gl,
        vertex,
        WebGLRenderingContext.VERTEX_SHADER
    );
    const fragmentShader = compileShader(
        gl,
        fragment,
        WebGLRenderingContext.FRAGMENT_SHADER
    );
    return createProgram(gl, vertexShader, fragmentShader);
}

/**
 *
 * @param canvas
 * @param pixelRatio
 */
export function resizeCanvasToDisplaySize(
    canvas: HTMLCanvasElement,
    pixelRatio: boolean = true
): boolean {
    // 1个CSS像素对应多少个实际像素
    const realToCSSPixels = pixelRatio ? window.devicePixelRatio : 1;

    // 获取浏览器中画布的显示尺寸
    const displayWidth = Math.floor(canvas.clientWidth * realToCSSPixels);
    const displayHeight = Math.floor(canvas.clientHeight * realToCSSPixels);

    // 检测尺寸是否相同
    if (canvas.width != displayWidth || canvas.height != displayHeight) {
        // 设置为相同尺寸
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        return true;
    }
    return false;
}

export function createCanvas(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.id = 'c';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    document.body.appendChild(canvas);
    return canvas;
}

export function setRectangle(
    gl: WebGLRenderingContext,
    target: number,
    x: number,
    y: number,
    width: number,
    height: number
) {
    const x1 = x,
        x2 = x + width;
    const y1 = y,
        y2 = y + height;
    gl.bufferData(
        target,
        new Float32Array([x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2]),
        gl.STATIC_DRAW
    );
}

export function setTexcoord(gl: WebGLRenderingContext, target: number) {
    gl.bufferData(
        target,
        new Float32Array([
            0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0,
        ]),
        gl.STATIC_DRAW
    );
}

export function createAndSetupTexture(gl: WebGLRenderingContext) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    return texture;
}

export function getAttribLocation(
    gl: WebGLRenderingContext,
    program: WebGLProgram,
    name: string
) {
    const loc = gl.getAttribLocation(program, name);
    let buffer: WebGLBuffer = null;
    let size: number;
    let type: number;
    let normalize = false;
    return {
        setFloat32(arr: Float32Array, _s = 2, _n = false) {
            if (!buffer) {
                size = _s;
                type = gl.FLOAT;
                normalize = _n;
                buffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STATIC_DRAW);
            }
        },
        setUInt8(arr: Uint8Array, _s: number, _n = false) {
            if (!buffer) {
                size = _s;
                type = gl.UNSIGNED_BYTE;
                normalize = _n;
                buffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STATIC_DRAW);
            }
        },
        bindBuffer() {
            if (buffer) {
                gl.enableVertexAttribArray(loc);
                gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                gl.vertexAttribPointer(loc, size, type, normalize, 0, 0);
            }
        },
    };
}

export function getUniformLocation(
    gl: WebGLRenderingContext,
    program: WebGLProgram,
    name: string
) {
    const loc = gl.getUniformLocation(program, name);
    return {
        uniform2f(x: number, y: number) {
            gl.uniform2f(loc, x, y);
        },
        uniform3fv(v: Float32List) {
            gl.uniform3fv(loc, v);
        },
        uniform4fv(v: Float32List) {
            gl.uniform4fv(loc, v);
        },
        uniform2fv(v: Float32List) {
            gl.uniform2fv(loc, v);
        },
        uniform1f(x: number) {
            gl.uniform1f(loc, x);
        },
        uniformMatrix3fv(matrix: number[], transpose = false) {
            gl.uniformMatrix3fv(loc, transpose, matrix);
        },
        uniformMatrix4fv(matrix: number[], transpose = false) {
            gl.uniformMatrix4fv(loc, transpose, matrix);
        },
    };
}

export function getBindPointForSamplerType(
    gl: WebGLRenderingContext,
    type: number
) {
    if (type === gl.SAMPLER_2D) return gl.TEXTURE_2D;
    if (type === gl.SAMPLER_CUBE) return gl.TEXTURE_CUBE_MAP;
    return undefined;
}

export function createUniformSetters(
    gl: WebGLRenderingContext,
    program: WebGLProgram
) {
    let textureUnit = 0;

    function createUniformSetter(
        program: WebGLProgram,
        uniformInfo: WebGLActiveInfo
    ): (v: any) => void {
        const location = gl.getUniformLocation(program, uniformInfo.name);
        const type = uniformInfo.type;

        const isArray =
            uniformInfo.size > 1 && uniformInfo.name.substr(-3) === '[0]';

        if (type === gl.FLOAT && isArray) {
            return (v: Float32Array) => gl.uniform1fv(location, v);
        }
        if (type === gl.INT && isArray) {
            return (v) => gl.uniform1iv(location, v);
        }
        switch (type) {
            case gl.FLOAT:
                return (v: number) => gl.uniform1f(location, v);
            case gl.FLOAT_VEC2:
                return (v: Float32Array) => gl.uniform2fv(location, v);
            case gl.FLOAT_VEC3:
                return (v: Float32Array) => gl.uniform3fv(location, v);
            case gl.FLOAT_VEC4:
                return (v: Float32Array) => gl.uniform4fv(location, v);
            case gl.INT:
                return (v) => gl.uniform1i(location, v);
            case gl.INT_VEC2:
                return (v) => gl.uniform2iv(location, v);
            case gl.INT_VEC3:
                return (v) => gl.uniform3iv(location, v);
            case gl.INT_VEC4:
                return (v) => gl.uniform4iv(location, v);
            case gl.BOOL:
                return (v) => gl.uniform1i(location, v);
            case gl.BOOL_VEC2:
                return (v) => gl.uniform2iv(location, v);
            case gl.BOOL_VEC3:
                return (v) => gl.uniform3iv(location, v);
            case gl.BOOL_VEC4:
                return (v) => gl.uniform4iv(location, v);
            case gl.FLOAT_MAT2:
                return (v) => gl.uniformMatrix2fv(location, false, v);
            case gl.FLOAT_MAT3:
                return (v) => gl.uniformMatrix3fv(location, false, v);
            case gl.FLOAT_MAT4:
                return (v) => gl.uniformMatrix4fv(location, false, v);
        }
        if ((type === gl.SAMPLER_2D || type === gl.SAMPLER_CUBE) && isArray) {
            const units = [];
            for (let i = 0; i < uniformInfo.size; i++) {
                units.push(textureUnit++);
            }
            return (
                (bindPoint: number, units: number[]) =>
                (textures: WebGLTexture[]) => {
                    gl.uniform1iv(location, units);
                    textures.forEach((texture, index) => {
                        gl.activeTexture(gl.TEXTURE0 + units[index]);
                        gl.bindTexture(bindPoint, texture);
                    });
                }
            )(getBindPointForSamplerType(gl, type), units);
        }
        if (type === gl.SAMPLER_2D || type === gl.SAMPLER_CUBE) {
            return (
                (bindPoint: number, unit: number) =>
                (texture: WebGLTexture) => {
                    gl.uniform1i(location, unit);
                    gl.activeTexture(gl.TEXTURE0 + unit);
                    gl.bindTexture(bindPoint, texture);
                }
            )(getBindPointForSamplerType(gl, type), textureUnit++);
        }
        throw new Error('未知类型: 0x' + type.toString(16));
    }

    const uniformSetters: { [key: string]: (v: any) => void } = {};
    const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

    for (let i = 0; i < numUniforms; i++) {
        const uniformInfo = gl.getActiveUniform(program, i);
        if (!uniformInfo) break;

        let name = uniformInfo.name;
        if (name.substr(-3) === '[0]') {
            name = name.substr(0, name.length - 3);
        }
        const setter = createUniformSetter(program, uniformInfo);
        uniformSetters[name] = setter;
    }

    return uniformSetters;
}

interface iAttrib {
    value?: Float32Array; //
    buffer?: WebGLBuffer;
    numComponents?: number;
    size?: number;
    type?: number;
    normalize?: boolean;
    stride?: number;
    offset?: number;
}

export function createAttributeSetters(
    gl: WebGLRenderingContext,
    program: WebGLProgram
) {
    const attribSetters: { [key: string]: (b: iAttrib) => void } = {};

    function createAttribSetter(index: number) {
        return (b: iAttrib) => {
            if (b.value) {
                gl.disableVertexAttribArray(index);
                switch (b.value.length) {
                    case 4:
                        gl.vertexAttrib4fv(index, b.value);
                        break;
                    case 3:
                        gl.vertexAttrib3fv(index, b.value);
                        break;
                    case 2:
                        gl.vertexAttrib2fv(index, b.value);
                        break;
                    case 1:
                        gl.vertexAttrib1fv(index, b.value);
                        break;
                    default:
                        throw new Error('长度必须在1-4之间');
                }
            } else {
                gl.bindBuffer(gl.ARRAY_BUFFER, b.buffer);
                gl.enableVertexAttribArray(index);
                gl.vertexAttribPointer(
                    index,
                    b.numComponents || b.size,
                    b.type || gl.FLOAT,
                    b.normalize || false,
                    b.stride || 0,
                    b.offset || 0
                );
            }
        };
    }

    const numAttribs = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
    for (let i = 0; i < numAttribs; i++) {
        const attribInfo = gl.getActiveAttrib(program, i);
        if (!attribInfo) break;
        const index = gl.getAttribLocation(program, attribInfo.name);
        attribSetters[attribInfo.name] = createAttribSetter(index);
    }

    return attribSetters;
}

export function createBuffersFromArrays(
    gl: WebGLRenderingContext,
    arrays: any
) {
    const buffers: any = {};
    Object.keys(arrays).forEach((key) => {
        const type =
            key === 'indices' ? gl.ELEMENT_ARRAY_BUFFER : gl.ARRAY_BUFFER;
        const array = makeTypedArray(arrays[key], key);
        buffers[key] = createBufferFromTypedArray(gl, array, type);
    });

    if (arrays.indices) {
        buffers.numElements = arrays.indices.length;
    } else if (arrays.position) {
        buffers.numElements = arrays.position.length / 3;
    }
    return buffers;
}

function createBufferFromTypedArray(
    gl: WebGLRenderingContext,
    array: any,
    type: number,
    drawType?: number
) {
    type = type || gl.ARRAY_BUFFER;
    const buffer = gl.createBuffer();
    gl.bindBuffer(type, buffer);
    gl.bufferData(type, array, drawType || gl.STATIC_DRAW);
    return buffer;
}

function isArrayBuffer(a: any) {
    return a.buffer && a.buffer instanceof ArrayBuffer;
}

function guessNumComponentsFromName(name: string, length: number) {
    let numComponents: number;
    if (name.indexOf('coord') >= 0) {
        numComponents = 2;
    } else if (name.indexOf('color') >= 0) {
        numComponents = 4;
    } else {
        numComponents = 3; // position, normals, indices...
    }

    if (length % numComponents > 0) {
        throw 'can not guess numComponents. You should specify it.';
    }

    return numComponents;
}

function makeTypedArray(array: any, name: string) {
    if (isArrayBuffer(array)) {
        return array;
    }
    if (array.data && isArrayBuffer(array.data)) {
        return array.data;
    }

    if (Array.isArray(array)) {
        array = {
            data: array,
        };
    }

    if (!array.numComponents) {
        array.numComponents = guessNumComponentsFromName(name, array.length);
    }

    let type = array.type;
    if (!type) {
        if (name === 'indices') {
            type = Uint16Array;
        }
    }
    const typedArray = createAugmentedTypedArray(
        array.numComponents,
        (array.data.length / array.numComponents) | 0,
        type
    );
    typedArray.push(array.data);
    return typedArray;
}

export function createAugmentedTypedArray(
    numComponents: number,
    numElements: number,
    opt_type?: any
) {
    const Type = opt_type || Float32Array;
    return augmentTypedArray(
        new Type(numComponents * numElements),
        numComponents
    );
}

function augmentTypedArray(typedArray: any, numComponents: number) {
    let cursor = 0;
    typedArray.push = (...rest: any[]) => {
        for (let i = 0, len = rest.length; i < len; i++) {
            const value = rest[i];
            if (
                value instanceof Array ||
                (value.buffer && value.buffer instanceof ArrayBuffer)
            ) {
                for (let j = 0; j < value.length; j++) {
                    typedArray[cursor++] = value[j];
                }
            } else {
                typedArray[cursor++] = value;
            }
        }
    };
    typedArray.reset = (opt_index?: number) => {
        cursor = opt_index || 0;
    };
    typedArray.numComponents = numComponents;
    Object.defineProperty(typedArray, 'numElements', {
        get: function () {
            return (this.length / this.numComponents) | 0;
        },
    });
    return typedArray;
}

export function setAttributes(setters: any, attribs: any) {
    setters = setters.attribSetters || setters;
    Object.keys(attribs).forEach((name) => {
        const setter = setters[name];
        if (setter) {
            setter(attribs[name]);
        }
    });
}

export function setUniforms(setters: any, ...values: any[]) {
    setters = setters.uniformSetters || setters;
    for (const uniforms of values) {
        Object.keys(uniforms).forEach((name) => {
            const setter = setters[name];
            if (setter) {
                setter(uniforms[name]);
            }
        });
    }
}

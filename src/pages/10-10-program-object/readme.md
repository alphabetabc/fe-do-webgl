# 切换program

-   创建着色器对象
    -   `solidProgramObject`
    -   `textureProgramObject`
-   创建缓冲区对象
-   创建矩阵变量
    -   `viewProjMatrix`
    -   `modelMatrix`
    -   `mvpMatrix`
    -   `normalMatrix`
-   加载纹理
-   绘制
    -   `solidCube`
    -   `textureCube`

# `program` 和 `shader` 的关系

WebGL（Web Graphics Library）是一种用于在网页上渲染3D图形的API。在WebGL中，`program`（程序）和`shader`（着色器）是两个核心概念，它们之间的关系如下：

1. **着色器（Shader）**：

    - 着色器是一段在GPU上执行的代码，用于处理顶点和像素的渲染。
    - 着色器分为两种类型：顶点着色器（Vertex Shader）和片元着色器（Fragment Shader）。
    - 顶点着色器处理每个顶点的数据，如位置、法线、纹理坐标等。
    - 片元着色器处理每个像素的颜色值。

2. **程序（Program）**：

    - 程序是由一个顶点着色器和一个片元着色器组成的，它们共同定义了渲染管线的着色过程。
    - 程序是着色器的容器，它将着色器链接在一起，形成一个完整的渲染过程。
    - 程序可以包含着色器中的变量（如uniforms和attributes）和缓冲区（如vertex buffers）。

3. **关系**：

    - **链接（Linking）**：首先，你需要编译着色器，然后将编译后的着色器链接到一个程序中。链接过程会检查着色器之间的兼容性，如变量名称和类型的一致性。
    - **使用（Using）**：链接成功后，你可以使用`gl.useProgram(program)`来激活这个程序，之后的所有渲染操作都会使用这个程序中的着色器进行处理。
    - **传递数据（Passing Data）**：在渲染过程中，你需要将顶点数据、uniforms等传递给着色器。这些数据通过属性（attributes）和uniform变量在着色器和JavaScript之间传递。

4. **工作流程**：

    - **编写着色器代码**：编写GLSL（OpenGL Shading Language）代码，定义顶点着色器和片元着色器的行为。
    - **编译着色器**：使用WebGL API编译着色器代码。
    - **创建程序**：创建一个新的WebGL程序对象。
    - **附加着色器**：将编译好的着色器附加到程序对象上。
    - **链接程序**：链接程序，确保着色器之间的接口匹配。
    - **使用程序**：通过`gl.useProgram`激活程序，进行渲染操作。

5. **示例代码**：

    ```javascript
    // 创建着色器
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    // 创建程序并链接着色器
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    // 使用程序
    gl.useProgram(program);
    ```

总结来说，着色器是GPU上执行的代码，用于处理顶点和像素的渲染，而程序是着色器的容器，将顶点着色器和片元着色器链接在一起，形成一个完整的渲染过程。在WebGL中，通过编译、链接和使用程序来实现3D图形的渲染。

# 分别绘制模型 - next

## next

```ts
class Object3D {
    constructor({ vertices, position, indices }) {}

    init(app) {
        // 创建buffer
        this.buffer = app.ctx.createArrayBufferObject(this.vertices);
        this.useBuffer = this.buffer.createUseBufferExecutor(app.shader.positionAttributeLocation);
    }

    render() {
        const ctx = this.app.ctx;
        this.useBuffer();
        ctx.boxModelMatrix.setTranslation(this.position);
    }
}

class App {
    constructor(container, options) {
        if (!options.manual) {
            this.startRender();
        }
    }

    add(object3D) {
        object3D.init(this);
        this.scene.add(object3d);
    }

    drawSegment() {
        app.ctx.boxMvpMatrix.set(ctx.viewProjMatrix);
        app.ctx.boxMvpMatrix.multiply(ctx.boxModelMatrix);
        ctx.uniformMvpMatrix4fv();

        ctx.boxNormalMatrix.setInverseOf(ctx.boxMvpMatrix);
        ctx.boxNormalMatrix.transpose();
        ctx.uniformNormalMatrix4fv();

        ctx.drawElements(ctx.gl.TRIANGLES, this.indices.length, ctx.gl.UNSIGNED_BYTE, 0);
    }

    render() {
        const ctx = this.app.ctx;

        ctx.clear();
        this.scene.traverse((object3D) => {
            object3D.render();
            this.drawSegment();
        });

        requestAnimationFrame(this.render.bind(this));
    }

    startRender() {
        requestAnimationFrame(this.render.bind(this));
    }
}
```

```ts
const app = new GLHelper.App(container, {});

const base = new GLHelper.Object3D({
    vertices: baseVertices,
    position: { x: 0, y: 12, z: 0 },
});

app.add(base);

const arm = new GLHelper.Object3D({
    vertices: armVertices,
    position: { x: 0, y: 12, z: 0 },
});
app.add(arm);
```

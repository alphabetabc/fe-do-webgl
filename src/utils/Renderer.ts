import * as GLHelperLib from "./gl";
import * as Hooks from "./hooks";

type TSetupHooks<TState extends Record<string, any>> = {
    //
    setState: (state: TState) => void;
    onFrameLoop: (listener: (ctx: GLHelperLib.WebGLRendererContext, state: TState) => void) => () => void;
};

/**
 * 渲染器
 * @param lifeCycle.setup 初始化，用来初始化，以及调用状态会触发更新
 * @param lifeCycle.render 渲染，用来渲染
 */
export const renderer = <TState extends Record<string, any> = Record<string, any>>(lifeCycle: {
    setup: (hooks: TSetupHooks<TState>) => GLHelperLib.WebGLRendererContext;
    render?: (ctx: GLHelperLib.WebGLRendererContext, state: TState) => void;
}) => {
    const renderState = {
        runFlag: false,
        currentRendererContext: null as GLHelperLib.WebGLRendererContext,
        preContextrestored: null,
        updater: new Set<Parameters<TSetupHooks<TState>["onFrameLoop"]>[0]>(),
        internalState: {} as TState,
        removeList: [],
    };

    const renderHooks: TSetupHooks<TState> = {
        setState: (state: Record<string, any>) => {
            if (typeof state === "object" && state !== null) {
                Object.assign(renderState.internalState, state);
                renderState.runFlag = true;
            } else {
                console.error("Invalid state provided to setState");
            }
        },
        onFrameLoop: (listener) => {
            renderState.updater.add(listener);
            return () => {
                renderState.updater.delete(listener);
            };
        },
    };

    const run = () => {
        let ctx = null;

        try {
            ctx = lifeCycle.setup(renderHooks);
        } catch (error) {
            throw error;
        }

        renderState.currentRendererContext = ctx;

        const contextrestoredListener = () => {
            console.log("contextrestored");
            run();
        };

        if (renderState.removeList.length > 0) {
            renderState.removeList.forEach((remove) => remove());
            renderState.removeList = [];
        }

        renderState.removeList.push(() => {
            ctx.canvas.removeEventListener("contextrestored", contextrestoredListener);
        });

        ctx.canvas.addEventListener("contextrestored", contextrestoredListener);

        renderState.removeList.push(
            Hooks.Render.addEventListener(() => {
                try {
                    lifeCycle.render(ctx, renderState.internalState);
                } catch (error) {
                    console.error("Error in render function:", error);
                }
            }),
        );

        renderState.removeList.push(
            Hooks.Update.addEventListener(() => {
                if (ctx.contextLost) {
                    Hooks.Update.stop();
                    return;
                }

                if (renderState.runFlag) {
                    renderState.runFlag = false;
                    Hooks.Render.emit();
                }
            }),
        );

        renderState.removeList.push(
            Hooks.Update.addEventListener(() => {
                for (const listener of renderState.updater) {
                    listener(ctx, renderState.internalState);
                }
            }),
        );
    };

    run();
};

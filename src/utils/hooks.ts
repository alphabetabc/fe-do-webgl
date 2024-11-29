import * as d3 from "d3";

const EventTypes = {
    Render: "render",
    Update: "update",
};
const eventsKeys = [...Object.values(EventTypes)] as const;
const d3Dispatcher = d3.dispatch(...eventsKeys);

const __dispatcher = {
    on: (eventName: (typeof eventsKeys)[number], callback: (...args: any[]) => void) => {
        d3Dispatcher.on(eventName, callback);
        return () => {
            d3Dispatcher.on(eventName, null);
        };
    },
    emit: (eventName: (typeof eventsKeys)[number], ...args: any[]) => {
        d3Dispatcher.call(eventName, null, ...args);
    },
};

type BaseEvent = {
    addEventListener: (callback: (...args: any[]) => void) => () => void;
    emit: (...args: any[]) => void;
    [key: string]: any;
};

const createHook = <T extends object = BaseEvent>(creator: () => Partial<T>) => {
    return {
        ...creator(),
    } as ReturnType<typeof creator>;
};

/**
 * 触发渲染函数
 */
const Render = createHook(() => ({
    addEventListener: (callback) => {
        return __dispatcher.on(EventTypes.Render, callback);
    },
    emit: (...args) => {
        __dispatcher.emit(EventTypes.Render, ...args);
    },
}));

/**
 * 触发更新函数
 */
const Update = createHook(() => {
    const UpdateCache = new Set<any>();

    const state = {
        type: "running" as "running" | "paused" | "stopped",
    };

    const isStop = () => state.type === "stopped";

    const timer = d3.timer(() => {});
    timer.stop();

    __dispatcher.on(EventTypes.Update, () => {
        if (UpdateCache.size === 0 || state.type !== "running") {
            timer.stop();
            return;
        }

        if (state.type === "running" && UpdateCache.size > 0) {
            timer.restart(() => {
                if (UpdateCache.size === 0) {
                    timer.stop();
                    return;
                }
                UpdateCache.forEach((callback) => {
                    callback();
                });
            });
        }
    });

    return {
        addEventListener: (callback) => {
            if (state.type !== "stopped") {
                UpdateCache.add(callback);
            }

            if (state.type !== "running") {
                state.type = "running";
            }

            if (state.type === "running") {
                __dispatcher.emit(EventTypes.Update);
            }

            return () => {
                UpdateCache.delete(callback);
            };
        },
        stop: () => {
            if (state.type === "stopped") return;

            UpdateCache.clear();
            state.type = "stopped";
            __dispatcher.emit(EventTypes.Update);
        },
        pause: () => {
            if (state.type === "paused" || isStop()) return;

            state.type = "paused";
            __dispatcher.emit(EventTypes.Update);
        },
        resume: () => {
            if (state.type === "running" || isStop()) return;

            state.type = "running";
            __dispatcher.emit(EventTypes.Update);
        },
    };
});

const DefineHook = <T extends Array<string> = string[]>(hooks: T) => {
    const dispatch = d3.dispatch(...hooks);

    return {
        create: <THookData extends any = any>(hookName: T[number]) => {
            return {
                addEventListener: (callback: (state: { data: THookData }) => void) => {
                    return dispatch.on(hookName, callback);
                },

                emit: (data: THookData) => {
                    dispatch.call(hookName, null, { data });
                },
            };
        },
    };
};

export {
    //
    Render,
    Update,
    DefineHook,
};

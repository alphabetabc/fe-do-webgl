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
    let running = false;

    const timer = d3.timer(() => {});
    timer.stop();

    __dispatcher.on(EventTypes.Update, () => {
        if (UpdateCache.size === 0) {
            timer.stop();
            return;
        }

        if (!running && UpdateCache.size > 0) {
            timer.restart(() => {
                UpdateCache.forEach((callback) => {
                    callback();
                });
            });
        }
    });

    return {
        addEventListener: (callback) => {
            UpdateCache.add(callback);
            if (!running) {
                __dispatcher.emit(EventTypes.Update);
                running = true;
            }
            return () => {
                UpdateCache.delete(callback);
            };
        },
        stop: () => {
            timer.stop();
            running = false;
        },
        pause: () => {
            running = false;
        },
        resume: () => {
            running = true;
        },
    };
});

export {
    //
    Render,
    Update,
};

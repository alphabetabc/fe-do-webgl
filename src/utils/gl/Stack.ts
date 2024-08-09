const stackApiContext = new WeakMap<any, Record<string, Stack>>();

class Stack<T = any> {
    static get<TS>(context: any, name: string, saveCallback?: ConstructorParameters<typeof Stack<TS>>[0]) {
        let stackApi = stackApiContext.get(context);
        if (!stackApi) {
            stackApi = {};
            stackApiContext.set(context, stackApi);
        }

        let stack = stackApi[name];
        if (!stack) {
            stack = stackApi[name] = new Stack(saveCallback);
        }

        return stack as Stack<TS>;
    }

    constructor(saveCallback?: (stackItem: any) => T) {
        this.#saveCallback = saveCallback ?? ((item: T) => item);
    }

    #saveCallback: (stackItem: T) => T;
    #stack = [];

    /**
     * 获取当前栈的长度。
     * @returns 栈的长度。
     */
    get length() {
        return this.#stack.length;
    }
    /**
     * 将一个元素压入栈中。
     * @param stackItem - 要压入栈的元素。
     * @returns 压栈操作是否成功。
     */
    save = (stackItem: T) => {
        try {
            this.#stack.push(this.#saveCallback(stackItem));
            return true;
        } catch (error) {
            return false;
        }
    };

    /**
     * 从栈顶弹出一个元素。
     * @returns 栈顶元素。
     */
    restore = () => {
        return this.#stack.pop() as T;
    };
}

export {
    //
    Stack,
};

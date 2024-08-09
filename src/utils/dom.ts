const selector = (selector: string, root: HTMLElement = document.body) => root.querySelector(selector);

const setStyle = <T extends Element = HTMLLIElement>(el: T, styles: Partial<Record<keyof CSSStyleDeclaration, any>>) => {
    if (!("style" in el)) return;

    for (const [key, value] of Object.entries(styles)) {
        (el as any).style.setProperty(key, value);
    }
};

const getContainer = () => selector("#container") as HTMLElement;

const getElementSize = (el: HTMLElement) => ({ width: el.clientWidth, height: el.clientHeight });

export {
    //
    selector,
    setStyle,
    getContainer,
    getElementSize,
};

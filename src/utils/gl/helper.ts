const imageCache = new Map<string, Promise<HTMLImageElement>>();

const loadImage = async (url: string) => {
    if (imageCache.has(url)) {
        return imageCache.get(url)!;
    }
    const image = new Image();
    image.src = url;
    return new Promise<HTMLImageElement>((resolve, reject) => {
        image.onload = () => {
            resolve(image);
            imageCache.set(url, Promise.resolve(image));
        };
        image.onerror = () => {
            reject(new Error("Failed to load image"));
            imageCache.delete(url);
        };
    });
};

export {
    //
    loadImage,
};

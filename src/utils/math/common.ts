const angle = {
    value: 180 / Math.PI,
    rad: Math.PI / 180,
    tau: Math.PI * 2,
    half: Math.PI / 2,
    quarter: Math.PI / 4,
    degree: 180 / Math.PI,
};

const toRadian = (degrees: number) => degrees * angle.rad;

const toDegree = (radians: number) => radians * angle.value;

const inRange = (value: number, min: number, max: number) => {
    return value >= min && value <= max;
};

const inRect = (point: { x: number; y: number }, rect: { left: number; top: number; right: number; bottom: number }) => {
    return inRange(point.x, rect.left, rect.right) && inRange(point.y, rect.top, rect.bottom);
};

const clamp = (value: number, min: number, max: number) => {
    return Math.max(min, Math.min(max, value));
};

export {
    //
    angle,
    toRadian,
    toDegree,
    inRange,
    inRect,
    clamp,
};

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

export {
    //
    angle,
    toRadian,
    toDegree,
};

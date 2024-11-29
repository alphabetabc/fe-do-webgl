export const data = {
    // Create a triangle
    //       v2
    //      / |
    //     /  |
    //    /   |
    //  v0----v1
    triangle: {
        // Vertex coordinates
        vertices: new Float32Array(
            [
                [-2.0, 3.5, 0.0],
                [2.0, 3.5, 0.0],
                [0.0, 3.5, 1.8],
            ].flat(),
        ),
        colors: new Float32Array(
            [
                [1.0, 0.5, 0.0],
                [1.0, 0.5, 0.0],
                [1.0, 0.0, 0.0],
            ].flat(),
        ),
        indices: new Uint8Array([0, 1, 2]),
    },

    plane: {
        vertices: new Float32Array(
            [
                // v0-v1-v2-v3
                [3.0, -1.7, 2.5],
                [-3.0, -1.7, 2.5],
                [-3.0, -1.7, -2.5],
                [3.0, -1.7, 2.5],
            ].flat(),
        ),
        colors: new Float32Array(
            [
                [1.0, 1.0, 1.0],
                [1.0, 1.0, 1.0],
                [1.0, 1.0, 1.0],
                [1.0, 1.0, 1.0],
            ].flat(),
        ),
        indices: new Uint8Array(
            [
                [0, 1, 2],
                [0, 2, 3],
            ].flat(),
        ),
    },
};

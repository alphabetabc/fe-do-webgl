class OBJObject {
    name: any;
    faces: any[];
    numIndices: number;
    constructor(name: any) {
        this.name = name;
        this.faces = [];
        this.numIndices = 0;
    }
    addFace(face) {
        this.faces.push(face);
        this.numIndices += face.numIndices;
    }
}

class Face {
    numIndices: number;
    indices: number[];
    materialName: any;
    vIndices: any[];
    nIndices: any[];

    normal: Normal;

    constructor(materialName: any) {
        this.materialName = materialName;
        if (materialName == null) this.materialName = "";
        this.vIndices = [];
        this.nIndices = [];
    }
}

class DrawingInfo {
    vertices: any;
    normals: any;
    colors: any;
    indices: any;
    constructor(vertices: any, normals: any, colors: any, indices: any) {
        this.vertices = vertices;
        this.normals = normals;
        this.colors = colors;
        this.indices = indices;
    }
}

class Vertex {
    x: number;
    y: number;
    z: number;
    constructor(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

class Normal {
    x: number;
    y: number;
    z: number;

    constructor(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

class Color {
    r: number;
    g: number;
    b: number;
    a: number;

    constructor(r: number, g: number, b: number, a: number) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
}

class Material {
    name: any;
    color: Color;
    constructor(name: any, r: number, g: number, b: number, a: number) {
        this.name = name;
        this.color = new Color(r, g, b, a);
    }
}

class MTLDoc {
    complete: boolean;
    materials: any[];
    constructor() {
        this.complete = false; // MTL is configured correctly
        this.materials = new Array(0);
    }
    parseNewmtl(sp) {
        return sp.getWord(); // Get name
    }
    parseRGB(sp, name) {
        let r = sp.getFloat();
        let g = sp.getFloat();
        let b = sp.getFloat();
        return new Material(name, r, g, b, 1);
    }
}

export {
    //
    OBJObject,
    Face,
    DrawingInfo,
    Vertex,
    Normal,
    Color,
    MTLDoc,
};

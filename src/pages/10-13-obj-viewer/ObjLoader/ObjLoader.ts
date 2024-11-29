import { GLHelper } from "@utils";
import { Color, DrawingInfo, Face, MTLDoc, Normal, OBJObject, Vertex } from "./ObjectsInterface";
import { StringParser } from "./StringParser";

const loadFileAsText = (url: string | URL) => fetch(url).then((res) => res.text());

class ObjModelLoader {
    filename: string;
    mtls = []; // 材质 MTL 列表
    objects = []; // 对象 Object 列表
    vertices = []; // 顶点 Vertex 列表
    normals = []; // 法线 Normal 列表
    mtllibPath: string;

    constructor(url: string, config: { scale: number; reverse: boolean }) {
        this.load(url, config);
    }

    async load(url: string, config: { scale: any; reverse: any }) {
        const urlObj = new URL(url, window.location.origin);
        const objFileText = await loadFileAsText(urlObj);

        this.filename = urlObj.toString();

        this.parse(objFileText, config.scale, config.reverse);
    }

    // 解析 Obj 文本
    parse = (fileString: string, scale: number, reverse: any) => {
        const lines = fileString.split("\n"); // 拆分为逐行数据
        lines.push(null); // 添加末尾行标识

        let index = 0; // 初始化当前行索引
        let currentObject = null;
        let currentMaterialName = "";

        // 逐行解析
        let line: any; // 接收当前行文本
        const stringParser = new StringParser(); // 创建 字符串解析器

        while ((line = lines[index++]) !== null) {
            stringParser.init(line); // 初始化stringParser
            const command = stringParser.getWord(); // 获取指令名称（某行的第一个单词）
            if (command === null) {
                // 检查是否为Null
                continue;
            }
            switch (command) {
                case "#": {
                    continue; // 跳过注释
                }

                // 读取材质
                case "mtllib": {
                    const path = this.parseMtllibPath(stringParser, this.filename);
                    this.mtllibPath = path;
                    const mlt = new MTLDoc();
                    this.mtls.push(mlt);
                    loadFileAsText(path).then((text) => {
                        readMTLFile(text, mlt);
                    });
                    continue;
                }

                case "o":
                case "g": {
                    // 读取对象名称
                    const object = this.parseObjectName(stringParser);
                    this.objects.push(object);
                    currentObject = object;
                    continue; // 解析下一行
                }
                case "v": {
                    // 读取顶点
                    const vertex = this.parseVertex(stringParser, scale);
                    this.vertices.push(vertex);
                    continue;
                }
                case "vn": {
                    // 读取法线
                    const normal = this.parseNormal(stringParser);
                    this.normals.push(normal);
                    continue;
                }
                case "usemtl": {
                    // 读取材质名
                    currentMaterialName = this.parseUsemtl(stringParser);
                    continue;
                }
                case "f": {
                    // 读取表面
                    const face = this.parseFace(stringParser, currentMaterialName, this.vertices, reverse);
                    currentObject.addFace(face);
                    continue;
                }
            }
        }

        return true;
    };

    parseObjectName = (sp: StringParser) => {
        const name = sp.getWord();
        return new OBJObject(name);
    };

    parseVertex = (sp: StringParser, scale = 1) => {
        const x = sp.getFloat() * scale;
        const y = sp.getFloat() * scale;
        const z = sp.getFloat() * scale;
        return new Vertex(x, y, z);
    };

    parseNormal = (sp: StringParser) => {
        const x = sp.getFloat();
        const y = sp.getFloat();
        const z = sp.getFloat();
        return new Normal(x, y, z);
    };

    parseUsemtl = (sp: StringParser) => {
        return sp.getWord();
    };

    parseFace = (sp: StringParser, materialName: string, vertices: any[], reverse: any) => {
        const face = new Face(materialName);
        let loopFlag = true;
        while (loopFlag) {
            const word = sp.getWord();

            if (word === null) {
                break;
            }
            const subWords = word.split("/");
            if (subWords.length >= 1) {
                const vi = parseInt(subWords[0], 10) - 1;

                face.vIndices.push(vi);
            }

            if (subWords.length >= 3) {
                const ni = parseInt(subWords[2]) - 1;
                face.nIndices.push(ni);
            } else {
                face.nIndices.push(-1);
            }
        }

        // normal
        const v0 = [
            //
            vertices[face.vIndices[0]].x,
            vertices[face.vIndices[0]].y,
            vertices[face.vIndices[0]].z,
        ];

        const v1 = [
            //
            vertices[face.vIndices[1]].x,
            vertices[face.vIndices[1]].y,
            vertices[face.vIndices[1]].z,
        ];

        const v2 = [
            //
            vertices[face.vIndices[2]].x,
            vertices[face.vIndices[2]].y,
            vertices[face.vIndices[2]].z,
        ];

        let normal = calcNormal(v0, v1, v2);

        if (normal === null) {
            const v3 = [
                //
                vertices[face.vIndices[3]].x,
                vertices[face.vIndices[3]].y,
                vertices[face.vIndices[3]].z,
            ];
            normal = calcNormal(v1, v2, v3);
        }

        if (normal === null) {
            normal = new Float32Array([0, 1, 0]);
        }

        if (reverse) {
            normal[0] = -normal[0];
            normal[1] = -normal[1];
            normal[2] = -normal[2];
        }

        face.normal = new Normal(normal[0], normal[1], normal[2]);

        if (face.vIndices.length > 3) {
            const n = face.vIndices.length - 2;
            const newVIndices = [];
            const newNIndices = [];

            for (let i = 0; i < n; i++) {
                newVIndices[i * 3 + 0] = face.vIndices[0];
                newVIndices[i * 3 + 1] = face.vIndices[i + 1];
                newVIndices[i * 3 + 2] = face.vIndices[i + 2];
                newNIndices[i * 3 + 0] = face.nIndices[0];
                newNIndices[i * 3 + 1] = face.nIndices[i + 1];
                newNIndices[i * 3 + 2] = face.nIndices[i + 2];
            }

            face.vIndices = newVIndices;
            face.nIndices = newNIndices;
        }

        face.numIndices = face.vIndices.length;

        return face;
    };
    parseMtllibPath = (sp: StringParser, filename: string) => {
        let i = filename.lastIndexOf("/");
        let dirPath = "";
        if (i > 0) {
            dirPath = filename.substring(0, i + 1);
        }
        return `${dirPath}${sp.getWord()?.replace("\r", "")}`;
    };

    isMTLComplete = () => {
        if (this.mtls.length === 0) {
            return true;
        }

        for (let i = 0; i < this.mtls.length; i++) {
            if (!this.mtls[i].complete) {
                return false;
            }
        }

        return true;
    };

    findColor = (name: string) => {
        for (let i = 0; i < this.mtls.length; i++) {
            for (let j = 0; j < this.mtls[i].materials.length; j++) {
                if (this.mtls[i].materials[j].name === name) {
                    return this.mtls[i].materials[j].color;
                }
            }
        }

        return new Color(0.8, 0.8, 0.8, 1);
    };

    getDrawingInfo = () => {
        let numIndices = 0;
        for (let i = 0; i < this.objects.length; i++) {
            numIndices += this.objects[i].numIndices;
        }

        let numVertices = numIndices;
        let vertices = new Float32Array(numVertices * 3);
        let normals = new Float32Array(numVertices * 3);
        let colors = new Float32Array(numVertices * 4);
        let indices = new Uint16Array(numIndices);

        // 设置顶点、法线、颜色
        let indicesIndex = 0;

        for (let i = 0; i < this.objects.length; i++) {
            let object = this.objects[i];
            for (let j = 0; j < object.faces.length; j++) {
                let face = object.faces[j];
                let color = this.findColor(face.materialName);
                let faceNormal = face.normal;

                for (let k = 0; k < face.vIndices.length; k++) {
                    // 设置索引
                    indices[indicesIndex] = indicesIndex;
                    //
                    const vIndex = face.vIndices[k];
                    const vertex = this.vertices[vIndex];

                    // 复制顶点
                    vertices[indicesIndex * 3 + 0] = vertex.x;
                    vertices[indicesIndex * 3 + 1] = vertex.y;
                    vertices[indicesIndex * 3 + 2] = vertex.z;

                    // 复制颜色
                    colors[indicesIndex * 4 + 0] = color.r;
                    colors[indicesIndex * 4 + 1] = color.g;
                    colors[indicesIndex * 4 + 2] = color.b;
                    colors[indicesIndex * 4 + 3] = color.a;

                    // 复制法线
                    const nIndex = face.nIndices[k];
                    if (nIndex >= 0) {
                        const normal = this.normals[nIndex];
                        normals[indicesIndex * 3 + 0] = normal.x;
                        normals[indicesIndex * 3 + 1] = normal.y;
                        normals[indicesIndex * 3 + 2] = normal.z;
                    } else {
                        normals[indicesIndex * 3 + 0] = faceNormal.x;
                        normals[indicesIndex * 3 + 1] = faceNormal.y;
                        normals[indicesIndex * 3 + 2] = faceNormal.z;
                    }

                    indicesIndex++;
                }
            }
        }

        return new DrawingInfo(vertices, normals, colors, indices);
    };
}

function readMTLFile(fileString: string, mlt: MTLDoc) {
    const lines = fileString.split("\n");
    lines.push(null);

    let line: string;
    let index = 0;
    let name = "";
    let sp = new StringParser();

    while ((line = lines[index++]) !== null) {
        sp.init(line);
        const command = sp.getWord();
        if (command === null) {
            continue;
        }

        switch (command) {
            case "#":
                continue;
            case "newmtl":
                name = mlt.parseNewmtl(sp);
                continue;
            case "Kd":
                if (name === "") continue;
                let material = mlt.parseRGB(sp, name);
                mlt.materials.push(material);
                name = "";
        }
    }

    mlt.complete = true;
}

function calcNormal(p0: any[], p1: any[], p2: any[]) {
    // v0: a vector from p1 to p0, v1; a vector from p1 to p2
    const v0 = new Float32Array(3);
    const v1 = new Float32Array(3);
    for (let i = 0; i < 3; i++) {
        v0[i] = p0[i] - p1[i];
        v1[i] = p2[i] - p1[i];
    }

    // The cross product of v0 and v1
    const c = new Float32Array(3);
    c[0] = v0[1] * v1[2] - v0[2] * v1[1];
    c[1] = v0[2] * v1[0] - v0[0] * v1[2];
    c[2] = v0[0] * v1[1] - v0[1] * v1[0];

    // Normalize the result
    const v = GLHelper.Math.Vector3.create([c[0], c[1], c[2]]);
    v.normalize();
    return v.elements;
}

export {
    //
    ObjModelLoader,
};

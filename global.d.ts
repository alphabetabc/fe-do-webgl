/// <reference types="vite/client" />

declare module "*.vert?raw" {
    const raw: string;
    export default raw;
}
declare module "*.frag?raw" {
    const raw: string;
    export default raw;
}

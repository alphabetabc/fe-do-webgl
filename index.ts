import "./index.less";
// @ts-ignore
import { Renderer, createLoaderWithRouteMapping } from "@dev-packages/module-loader";

const routeMapping = import.meta.glob("./src/pages/**/*.{t,j}s");
const renderer = new Renderer();
renderer.loader = createLoaderWithRouteMapping(routeMapping, {
    defaultRoutePath: "./src/pages/index.ts",
    root: "src/pages",
});
const pathname = renderer.history.location.pathname;
console.log("[current path]", pathname);
renderer.loadModule(pathname);

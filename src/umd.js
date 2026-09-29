// UMD/CDN entry — mirrors root flash.js behavior:
// exposes the F function itself as `Flash` and `F` globals (with .version etc.).
// Importing ./index.js attaches http/storage/ui/... helpers onto F first.
import { F } from "./index.js";

globalThis.Flash = F;
globalThis.F = F;

export default F;

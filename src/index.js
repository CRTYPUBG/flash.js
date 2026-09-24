export { Collection } from "./core/collection.js";
export { F, VERSION } from "./core/F.js";
export { default } from "./core/F.js";

export { http } from "./http/index.js";
export { storage } from "./storage/index.js";
export { toast, modal, alert, confirm, loading } from "./ui/index.js";
export { copy } from "./utilities/copy.js";
export { download } from "./utilities/download.js";
export { theme } from "./utilities/theme.js";
export { observe, visible, resize } from "./observers/index.js";
export { animate, fadeIn, fadeOut } from "./animation/index.js";

// Attach to F for UMD parity (side-effect free, tree-shakable named exports above are primary)
import F from "./core/F.js";
import { http } from "./http/index.js";
import { storage } from "./storage/index.js";
import { toast } from "./ui/toast.js";
import { modal, alertBox as alert, confirmBox as confirm } from "./ui/modal.js";
import { loading } from "./ui/loading.js";
import { copy } from "./utilities/copy.js";
import { download } from "./utilities/download.js";
import { theme } from "./utilities/theme.js";

F.http = http;
F.storage = storage;
F.toast = toast;
F.modal = modal;
F.alert = alert;
F.confirm = confirm;
F.loading = loading;
F.copy = copy;
F.download = download;
F.theme = theme;

export const Flash = F;

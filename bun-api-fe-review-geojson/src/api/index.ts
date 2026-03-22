import { Hono } from "hono";
import layers from "./layers.js";
import features from "./features.js";
import exports_ from "./exports.js";

const api = new Hono();

api.route("/layers", layers);
api.route("/features", features);
api.route("/exports", exports_);

export default api;

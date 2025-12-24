import { Hono } from 'hono';
import layers from './layers.js';
import features from './features.js';

const api = new Hono();

api.route('/layers', layers);
api.route('/features', features);

export default api;

import { gs } from "@servicenow/glide";
import { WIRE_PAGE_PATH, WIRE_EXPERIENCE_PATH, WIRE_TAG } from "./constants.js";
// @ts-ignore Can't get this to accept the patch
import * as sn_ws_err from "@servicenow/glide/sn_ws_err";

/**
 *
 * @param {string} str
 */
export function validateSegment(str) {
	return str && str.indexOf(".") == -1;
}

/**
 *
 * @param {string} str
 */
export function parseTypes(str) {
	const info = { includeStatic: false, includeSession: false };
	for (const ty of str.split(",")) {
		if (ty === "sessionConfig") {
			info.includeSession = true;
		}
		if (ty === "staticConfig") {
			info.includeStatic = true;
		}
	}
	return info;
}

/**
 *
 * @param {string} str
 * @returns {string[]}
 */
export function parseList(str) {
	const arr = [];

	for (let s of str.split(",")) {
		s = s.trim();
		if (!s) continue;
		arr.push(s);
	}

	return arr;
}

/**
 *
 * @param {import('@servicenow/glide').RESTAPIResponse} response
 * @param {string} msg
 */
export function error(response, msg) {
	const e = new sn_ws_err.ServiceError();
	e.setMessage(msg);
	response.setError(e);
	response.setStatus(400);
}

export function mk_error(msg) {
	const e = new sn_ws_err.ServiceError();
	e.setMessage(msg);
}

/**
 *
 * @param {import('@servicenow/glide').RESTAPIResponse} response
 * @param {object} body
 * @param {number} code
 */
export function success(response, body, code = 200) {
	response.setContentType("application/json");
	response.setBody(body);
	response.setStatus(code);
}

/**
 *
 * @param {string} type
 * @param {string} pagePath
 * @param {string} experiencePath
 * @param {string} tag
 * @returns {Record<String, Object>}
 */
export function baseResponse(type, pagePath, experiencePath, tag) {
	return {
		type: type,
		[WIRE_PAGE_PATH]: pagePath,
		[WIRE_EXPERIENCE_PATH]: experiencePath,
		[WIRE_TAG]: tag,
	};
}

/**
 *
 * @param {string} raw
 * @param {boolean} defaultValue
 * @returns {boolean}
 */
export function parseBoolean(raw, defaultValue = false) {
	if (!raw) return defaultValue;
	return raw == "1" || raw.toLowerCase() == "true";
}

/**
 *
 * @param {string} str
 * @returns {number}
 */
export function parseOrder(str) {
	if (!str) return 100;
	return Number(str);
}

/**
 *
 * @returns {string}
 */
export function currentUserId() {
	try {
		return gs.getUser().getID();
	} catch (_) {
		return "unknown";
	}
}

/**
 *
 * @template T
 * @param {Record<string, T>} obj
 * @returns {[string, T][]}
 */
export function object_entries(obj) {
	if (!obj || typeof obj !== "object") return [];
	/** @type {[string, T][]} */
	const entries = [];
	for (const key of Object.keys(obj)) {
		entries.push([key, obj[key]]);
	}
	return entries;
}

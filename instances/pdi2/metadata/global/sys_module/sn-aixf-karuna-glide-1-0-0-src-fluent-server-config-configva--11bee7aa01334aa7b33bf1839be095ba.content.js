import { gs, ServiceError } from "@servicenow/glide";
import {
	CONFIG_VALUE_MAX_BYTES_DEFAULT,
	CONFIG_VALUE_MAX_BYTES_PROPERTY,
} from "./constants.js";

const FORBIDDEN_SUBSTRINGS = ["function(", "$ref"];

export default class ConfigValueValidator {
	constructor() {}

	/**
	 *
	 * @param {string} tag
	 * @param {string} name
	 * @param {string} value
	 */
	validate(tag, name, value) {
		if (!value) return;

		const maxBytes = this.readMaxBytes();
		const actual = value.length;
		if (actual > maxBytes) {
			const e = new ServiceError();
			e.setMessage(
				`value for ${this.qualified(tag, name)} exceeds max bytes (${actual} > ${maxBytes})`,
			);
			throw e;
		}

		for (const forbidden of FORBIDDEN_SUBSTRINGS) {
			if (value.includes(forbidden)) {
				const e = new ServiceError();
				e.setMessage(
					`value for ${this.qualified(tag, name)} contains forbidden substring '${forbidden}`,
				);
				throw e;
			}
		}

		try {
			JSON.parse(value);
		} catch (_) {
			const e = new ServiceError();
			e.setMessage(`Value is not valid JSON`);
			throw e;
		}
	}

	readMaxBytes() {
		try {
			const v = Number(
				gs.getProperty(
					CONFIG_VALUE_MAX_BYTES_PROPERTY,
					CONFIG_VALUE_MAX_BYTES_DEFAULT,
				),
			);
			return v > 0 ? v : CONFIG_VALUE_MAX_BYTES_DEFAULT;
		} catch (e) {
			return CONFIG_VALUE_MAX_BYTES_DEFAULT;
		}
	}

	qualified(tag, name) {
		return `${tag}.${name}`;
	}
}

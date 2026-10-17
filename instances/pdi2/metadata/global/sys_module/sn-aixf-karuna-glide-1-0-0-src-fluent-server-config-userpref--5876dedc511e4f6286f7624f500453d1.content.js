const USER_PREF_PREFIX = "aix.config.";
/** @typedef {object} ParsedName
 *  @property {string} tag
 *  @property {string} name
 */

/**
 *
 * @param {string} experiencePath
 * @param {string} pagePath
 * @returns {string}
 */
function buildPrefix(experiencePath, pagePath) {
	return USER_PREF_PREFIX + experiencePath + "." + pagePath + ".";
}

/**
 *
 * @param {string} pagePath
 * @param {string} experiencePath
 * @param {string} tag
 * @param {string} key
 * @returns {string}
 */
function buildName(pagePath, experiencePath, tag, key) {
	return (
		USER_PREF_PREFIX +
		experiencePath +
		"." +
		pagePath +
		"." +
		tag +
		"." +
		key
	);
}

/**
 *
 * @param {string} fullName
 * @param {string} pagePath
 * @param {string} experiencePath
 * @returns {ParsedName|null}
 */
function parse(fullName, pagePath, experiencePath) {
	if (fullName == null) return null;
	const prefix = buildPrefix(experiencePath, pagePath);
	if (!fullName.startsWith(prefix)) return null;
	const afterPrefix = fullName.substring(prefix.length);
	const dot = afterPrefix.indexOf(".");
	if (dot < 0) return null;
	return {
		tag: afterPrefix.substring(0, dot),
		name: afterPrefix.substring(dot + 1),
	};
}

export const UserPrefNameCodec = {
	MAX_NAME_LENGTH: 255,
	buildPrefix,
	buildName,
	parse,
};

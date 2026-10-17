class UDCUtil {
	static type = 'UDCUtil';
	static TIME_IN_MILLISECONDS = 30 * 86400000;

	static APP_TABLE_LABEL_MAP = {
		sys_scope: gs.getMessage('Application'),
		sys_app: gs.getMessage('Custom Application'),
		sys_store_app: gs.getMessage('Store Application'),
	};

	static assign(target) {
		for (let i = 1; i < arguments.length; i++) {
			const source = arguments[i];
			for (const key in source) {
				if (Object.prototype.hasOwnProperty.call(source, key)) target[key] = source[key];
			}
		}
		return target;
	}

	/**
	 * Check for new asset
	 * @param {String} params
	 * @returns {boolean}
	 */
	static isNewAsset(id = '') {
		return !!id && id.toString() === '-1';
	}

	/**
	 * Normalize the query params
	 * @param {Object} params
	 * @param {boolean} includeAll Include all the param values when it is true. When false, include only first value.
	 * @returns {Object} trimmed param values
	 */
	static normalizeQueryParams(params, includeAll = false) {
		const nrm = {};
		Object.keys(params).forEach(item => {
			if (includeAll) nrm[item] = params[item].map(v => v.trim());
			else nrm[item] = params[item][0].trim();
		});
		return nrm;
	}

	/**
	 * Evaluate the glide script and returns the result
	 * @param {GlideRecord} grObj
	 * @param {string} scriptField
	 * @param {Object} variables
	 * @returns {Any} return value can be anything that returns by the script
	 */
	static evaluateScript(grObj, scriptField, variables) {
		const evaluator = new GlideScopedEvaluator();
		return evaluator.evaluateScript(grObj, scriptField, variables);
	}

	/**
	 * Returns URL with prefixed with "/" and append query parameters
	 * @param {String} uri
	 * @param {Object} queryParameters
	 * @returns {String}
	 */
	static createCanonicalizedUri(uri, queryParameters) {
		if (gs.nil(uri)) return '';

		let canonicalizedUri = uri;

		if (!canonicalizedUri.startsWith('/')) canonicalizedUri = `/${canonicalizedUri}`;

		if (gs.nil(queryParameters)) queryParameters = {};

		// Handle fragment if present (e.g. #section)
		let fragment = '';
		if (canonicalizedUri.indexOf('#') !== -1) {
			const parts = canonicalizedUri.split('#');
			canonicalizedUri = parts[0];
			fragment = parts[1];
		}

		let basePath = canonicalizedUri;
		let existingQuery = '';

		// Split query string if present
		if (canonicalizedUri.indexOf('?') !== -1) {
			const parts = canonicalizedUri.split('?');
			basePath = parts[0];
			existingQuery = parts[1];
		}

		// Parse existing query string into key-value pairs
		const mergedParams = {};
		if (existingQuery) {
			const existingPairs = existingQuery.split('&');
			for (let i = 0; i < existingPairs.length; i++) {
				const [key, value] = existingPairs[i].split('=');
				if (key) mergedParams[key] = decodeURIComponent(value || '');
			}
		}

		// Merge or overwrite with new queryParameters
		for (const key in queryParameters) {
			if (queryParameters.hasOwnProperty(key)) mergedParams[key] = queryParameters[key];
		}

		const finalQueryString = this.buildQueryParameterString(mergedParams);

		let finalUri = basePath;
		if (finalQueryString) finalUri += `?${finalQueryString}`;

		if (fragment) finalUri += `#${fragment}`;

		return finalUri;
	}

	/**
	 * Build query parameters string from object
	 * @param {Object} queryParameters
	 * @returns {String}
	 */
	static buildQueryParameterString(queryParameters) {
		return Object.keys(queryParameters)
			.filter(queryParamKey => {
				const value = queryParameters[queryParamKey];
				return value !== undefined && value !== null;
			})
			.map(queryParamKey => {
				var queryParamValue = queryParameters[queryParamKey];
				var queryParamValueStr = String(queryParamValue);
				// Don't encode param value if it's in substitution format
				var encodedParamValue = queryParamValueStr.startsWith('${')
					? queryParamValueStr
					: encodeURIComponent(queryParamValueStr);

				return `${encodeURIComponent(queryParamKey)}=${encodedParamValue}`;
			})
			.join('&');
	}

	/**
	 * Generate the image URL with the extension
	 * @param {GlideRecord} grObj
	 * @param {String} fieldName
	 * @returns {String} image value with .iix extension
	 */
	static getImageUrl(grObj, fieldName) {
		const imageDisplayValue = grObj.getDisplayValue(fieldName);

		// Return the image URL only if the display value exists (i.e., the image is not deleted)
		return !gs.nil(imageDisplayValue) ? imageDisplayValue : null;
	}

	/**
	 * Checks if the provided GlideRecord object represents a valid record.
	 * @param {GlideRecord} grObj - The GlideRecord object to validate.
	 * @returns {boolean} True if the record is valid, false otherwise.
	 */
	static isValidGlideRecord(grObj) {
		return global.UDCGlobal.isValidGlideRecord(grObj);
	}

	/**
	 * Returns whether passed record id is a valid record or not
	 * @param {String} table
	 * @param {String} sysId
	 */
	static isValidRecord(table, sysId) {
		const gr = global.UDCGlobal.getGlideRecordForTable(table);
		return gr.get(sysId);
	}

	/**
	 * Returns whether passed table is valid or not
	 * @param {String} table
	 */
	static isValidTable(table) {
		var gr = global.UDCGlobal.getGlideRecordForTable(table);
		return gr.isValid();
	}

	static isAppRecord(tableName) {
		return UDCConstants.APP_TABLES[tableName] === true;
	}
	/**
	 * Groups an array of objects by a specified key.
	 *
	 * @param {Array} list - The array of objects to be grouped.
	 * @param {string} key - The key to group the objects by.
	 * @returns {Object} - An object with keys as the unique values of the specified key and values as arrays of objects with that key.
	 */
	static groupBy(list, key) {
		return list.reduce((acc, obj) => {
			var propValue = obj[key];
			if (!acc[propValue]) acc[propValue] = [];
			acc[propValue].push(obj);
			return acc;
		}, {});
	}

	/**
	 * Removes the recent searches that are older than 30 days from the preference value
	 * @param {String} preferenceKey
	 * @param {String} preferenceValue
	 * @returns {Array} recent searches
	 */
	static removeOldRecentSearches(preferenceKey, preferenceValue) {
		if (typeof preferenceValue === 'string' && preferenceValue.trim()) {
			try {
				const now = Date.now();
				const parsedValue = JSON.parse(preferenceValue);

				// Filter and limit to 5 recent items not older than 30 days
				preferenceValue = parsedValue
					.slice(0, 5)
					.filter(item => now - item?.created < UDCUtil.TIME_IN_MILLISECONDS);
			} catch (e) {
				gs.error(`Failed to parse preference value for key "${preferenceKey}":`, e);
				preferenceValue = [];
			}
		}

		return preferenceValue;
	}

	/**
	 * Parses a URL into its core components: base URL (scheme + host), path, query string, and fragment.
	 *
	 * Handles:
	 * - Full URLs (e.g., "https://example.com/path?query#frag")
	 * - Protocol-relative URLs (e.g., "//example.com/path")
	 * - Absolute and relative paths (e.g., "/path", "relative/path")
	 *
	 * @param {string} uri - The input URL or path string to parse.
	 * @returns {Object} An object containing the parsed components:
	 * @returns {string} return.baseUrl - The scheme + host portion of the URL (e.g., "https://example.com"), or empty if not present.
	 * @returns {string} return.basePath - The path portion of the URL (e.g., "/foo/bar").
	 * @returns {string} return.queryString - The query string (e.g., "a=1&b=2"), without the '?'.
	 * @returns {string} return.fragment - The fragment identifier (e.g., "section1"), without the '#'.
	 *
	 * @example
	 * parseURLParts("http://site.com/path?x=1#top")
	 * // {
	 * //   baseUrl: "http://site.com",
	 * //   basePath: "/path",
	 * //   queryString: "x=1",
	 * //   fragment: "top"
	 * // }
	 */
	static parseURLParts(uri) {
		if (gs.nil(uri)) {
			return {
				baseUrl: '',
				basePath: '',
				queryString: '',
				fragment: '',
			};
		}

		let trimmedUri = uri.trim();
		let fragment = '';
		let queryString = '';

		// Extract fragment
		const hashIndex = trimmedUri.indexOf('#');
		if (hashIndex !== -1) {
			fragment = trimmedUri.substring(hashIndex + 1);
			trimmedUri = trimmedUri.substring(0, hashIndex);
		}

		// Extract query string
		const queryIndex = trimmedUri.indexOf('?');
		if (queryIndex !== -1) {
			queryString = trimmedUri.substring(queryIndex + 1);
			trimmedUri = trimmedUri.substring(0, queryIndex);
		}

		// Extract baseUrl and basePath
		let baseUrl = '';
		let basePath = '';

		const match = trimmedUri.match(/^((https?:)?\/\/[^\/]+)(\/.*)?$/i);
		if (match) {
			baseUrl = match[1];
			basePath = match[3] || '';
		} else if (trimmedUri.startsWith('/')) {
			baseUrl = '';
			basePath = trimmedUri;
		} else {
			baseUrl = '';
			basePath = trimmedUri ? `/${trimmedUri}` : '';
		}

		return {
			baseUrl,
			basePath,
			queryString,
			fragment,
		};
	}

	/**
	 * Extracts query parameters from a URL and returns them as an object.
	 * @param {String} url - The URL to extract query parameters from.
	 * @returns {Object} An object containing the query parameters as key-value pairs.
	 */
	static getQueryParamsFromUrl(url) {
		if (gs.nil(url)) return {};

		const urlParts = UDCUtil.parseURLParts(url);
		const urlSearchParams = urlParts.queryString.split('&') || [];
		const queryParams = {};

		for (const searchParam of urlSearchParams) {
			const [key, value] = searchParam.split('=');
			if (!key) continue; // Skip if key is not present
			queryParams[key] = value ? decodeURIComponent(value) : value;
		}

		return queryParams;
	}

	/**
	 * Determines if the Application File Navigator (AFN) should be rendered
	 * based on the provided studioShellConfig.
	 *
	 * @param {Object} studioShellConfig - The studio shell configuration object.
	 * @returns {boolean} Returns true if AFN is enabled and no macroponentId is set; otherwise, false.
	 */
	static shouldRenderAFN(studioShellConfig) {
		const fileNavigatorConfig = studioShellConfig?.fileNavigatorConfig || {};
		return Boolean(fileNavigatorConfig.enabled && !fileNavigatorConfig.macroponentId);
	}

	/**
	 * Determines if the Build Agent should be rendered
	 * based on the provided studioShellConfig.
	 *
	 * @param {Object} studioShellConfig - The studio shell configuration object.
	 * @returns {boolean} Returns true if Build Agent is enabled; otherwise, false.
	 */
	static shouldRenderBuildAgent(studioShellConfig) {
		const buildAgentConfig = studioShellConfig?.buildAgentConfig || {};
		return Boolean(buildAgentConfig.enableBuildAgent);
	}
}

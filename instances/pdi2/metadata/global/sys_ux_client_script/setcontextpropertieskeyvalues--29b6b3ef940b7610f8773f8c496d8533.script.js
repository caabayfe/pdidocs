/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({ api, imports }) {

	const record = api.data.fetch_error_record?.result;

	if (!record?.context?.value) {
		api.setState('properties_row', []);
		return;
	}

	let contextObj;

	try {
		contextObj = JSON.parse(record.context.value);
	} catch (e) {
		api.setState('properties_row', []);
		return;
	}

	const flatFields = [];

	// Import shared utilities from global.EFClientUtils
	const { escapeHtml } = imports["global.EFClientUtils"]();

	// Format key nicely
	const formatLabel = (key) =>
		key
			.replace(/_/g, ' ')
			.replace(/\b\w/g, c => c.toUpperCase());

	// Recursive parser
	function parseObject(obj, parentKey = '') {
		Object.keys(obj).forEach(key => {
			const value = obj[key];
			const formattedKey = formatLabel(key);
			const fullLabel = parentKey
				? `${parentKey} - ${formattedKey}`
				: formattedKey;

			if (
				typeof value === 'string' ||
				typeof value === 'number' ||
				typeof value === 'boolean'
			) {
				flatFields.push({
					label: fullLabel,
					value: {
						type: "html",
						value: '<span style="font-weight: 700;">' + escapeHtml(value) + '</span>'
					}
				});
			}
			else if (Array.isArray(value)) {
				value.forEach((item, index) => {
					if (typeof item === 'object' && item !== null) {
						parseObject(item, `${fullLabel} ${index + 1}`);
					} else {
						flatFields.push({
							label: `${fullLabel} ${index + 1}`,
							value: {
								type: "html",
								value: '<span style="font-weight: 700;">' + escapeHtml(item) + '</span>'
							}
						});
					}
				});
			}
			else if (typeof value === 'object' && value !== null) {
				parseObject(value, fullLabel);
			}
		});
	}

	parseObject(contextObj);

	// Group two properties per row
	const grouped = [];

	for (let i = 0; i < flatFields.length; i += 2) {
		grouped.push([
			[flatFields[i]],
			flatFields[i + 1] ? [flatFields[i + 1]] : []
		]);
	}

	api.setState('properties_row', grouped);
}

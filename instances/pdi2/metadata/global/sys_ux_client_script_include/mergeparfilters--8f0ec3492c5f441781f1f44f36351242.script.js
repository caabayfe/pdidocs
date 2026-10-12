
function include({imports}) {
	/**
 * IMPORTANT: IF YOU ARE MAKING ANY CHANGES TO THE FUNCTIONS HERE,
 * BE AWARE THAT THIS CODE IS USED IN BOTH PLACES:
 * REPOSITORY:
 *  https://code.devsnc.com/dev/now-unified-filters/
 * AS SCRIPT INCLUDE HERE:
 *  /components/filter-connected/src/main/plugins/com.sn_component_filter/update/sys_ux_client_script_include_8f0ec3492c5f441781f1f44f36351242.xml
 * AS JS CODE:
 *  /components/filter-connected/src/filter-connected/helpers/mergePARFilters.js
 *
 * THIS SCRIPT IS SUPPOSED TO AUTOMATICALLY SYNC DURING BUILD WITH THE TOOL: copy-merge-par-filters-to-xml-in-target.js
 */


/**
 * Check if a certain filter payload is valid
 * @param {FilterConfigurationItem} filterItem
 * @return {boolean}
 *//* export */ function isFilterConfigurationInvalid(filterItem) {
	const domainFilter = filterItem.type === 'domain';
	const dateFilter = filterItem.type === 'date';
	const queryFilter = filterItem.type === 'query';
	const valueFilter = !domainFilter && !dateFilter && !queryFilter;

	return (domainFilter && !filterItem.sys_id) ||
		(dateFilter && !filterItem.start && !filterItem.end) ||
		(queryFilter && !filterItem.encoded_query) ||
		(valueFilter && !filterItem.values?.length);
}

/**
 * @param {FilterConfigurationItem} mergedFilter
 * @param {FilterConfigurationItem} currentFilter
 * @returns {boolean}
 */
function hasSameApplyToArray(mergedFilter, currentFilter) {
	if (!Array.isArray(mergedFilter.apply_to) || !Array.isArray(currentFilter.apply_to)) {
		return false;
	}

	if (mergedFilter.apply_to.length !== currentFilter.apply_to.length) {
		return false;
	}

	for (let i = 0; i < mergedFilter.apply_to.length; i++) {
		if (JSON.stringify(mergedFilter.apply_to[i]) !== JSON.stringify(currentFilter.apply_to[i])) {
			return false;
		}
	}

	return true;
}

/**
 * Script used by filter components as an event handler in UIB.
 *
 * @param {FilterConfigurationItem[] | null | undefined} oldFilters Filters stored on UIB page typically in `parFilters` state variable.
 * @param {FilterConfigurationItem[] | null | undefined} newFilters Payload dispatched by a filter.
 * @returns {FilterConfigurationItem[]} New merged filters state.
 *//* export */ function mergePARFilters(oldFilters, newFilters) {
	const mergedFilters = Array.isArray(oldFilters) ? [...oldFilters] : [];

	// DEF0235870: We sometimes get 'undefined' as newFilters and it breaks stuff
	if (!Array.isArray(newFilters)) {
		return mergedFilters;
	}

	for (const filterItem of newFilters) {
		if (filterItem) {
			const domainFilter = filterItem.type === 'domain';
			let index = 0;

			if (domainFilter) {
				index = mergedFilters.findIndex((x) => x.type === 'domain');
			} else if (filterItem.filterId) {
				index = mergedFilters.findIndex((x) => x.filterId === filterItem.filterId);
			} else if (Array.isArray(filterItem.apply_to)) {
				// Fallback case when filterId is not defined, search for filter with identical apply_to
				index = mergedFilters.findIndex((x) => hasSameApplyToArray(x, filterItem));
			}

			if (index >= 0) {
				if (isFilterConfigurationInvalid(filterItem)) {
					mergedFilters.splice(index, 1);
				} else {
					mergedFilters[index] = filterItem;
				}
			} else {
				!isFilterConfigurationInvalid(filterItem) && mergedFilters.push(filterItem);
			}
		}
	}

	mergedFilters
		.forEach((x, i) => {
			x.order = i;
		});

	return mergedFilters;
}

/**
 * @param {string | ApplyToItemV2 | DataAgnosticFilterConfig | undefined} applyTo
 * @param {number | undefined} schemaVersion
 * @returns {{table: string, fields: string[]} | undefined}
 */
function getTableAndFields(applyTo, schemaVersion) {
	if (!applyTo) {
		return undefined;
	}

	if (typeof applyTo === 'string') {
		const [table, ...fields] = applyTo.split('.');
		return { table, fields };
	}

	if (typeof applyTo === 'object' && schemaVersion === 1 && 'payload' in applyTo) {
		const { table, field } = applyTo.payload;
		const fields = [field];
		return { table, fields };
	}

	if (applyTo.type !== 'table') {
		return undefined;
	}

	if ('key' in applyTo) {
		return getTableAndFields(applyTo.key, schemaVersion);
	}

	return undefined;
}

/**
 * @param {OperatorConfig|undefined} operator
 * @param {string} field
 * @param {string} value
 * @returns {string | undefined}
 */
const getEncodedQueryForV1 = (operator, field, value) => {
	if (!operator) {
		return undefined;
	}
	const { type, hierarchy_id } = operator;

	if (type === 'hierarchy') {
		return `${field}IN_HIERARCHY${hierarchy_id}@${value}@0@true`;
	}
	return undefined;
};

/**
 * Helper function to generate encoded queries
 * @param {FilterConfigurationItem[] | undefined | null} parFilters
 * @return {Object<string, string>} key-value collection where key is the tableName and value is encodedQuery
 */
function getEncodedQueries(parFilters) {
	/** @type {Object<string, string>} */
	const result = {};

	if (!Array.isArray(parFilters)) {
		return result;
	}

	for (const filter of parFilters) {
		if (Array.isArray(filter.apply_to)) {
			const schemaVersion = filter.schemaVersion;
			for (const applyTo of filter.apply_to) {
				const tableAndFields = getTableAndFields(applyTo, schemaVersion);
				if (!tableAndFields) {
					continue;
				}

				const { table, fields } = tableAndFields;
				const field = fields.join('.');
				const existingQuery = result[table];
				let newQuery = '';

				switch (filter.type) {
				case 'choice':
				case 'reference':
				case 'boolean':
				default:
					/**
						 * And also need to handle EMPTY case
						 * state=IN1,2^ORstateISEMPTY
						 */
					if (Array.isArray(filter.values) && filter.values.length > 0) {
						const nonEmptyValues = filter.values.filter((x) => Boolean(x));
						const hasEmpty = filter.values.length > nonEmptyValues.length;
						const parts = [];
						if (nonEmptyValues.length === 1) {
							let encodedQuery = null;

							if (schemaVersion === 1 && //
									typeof applyTo === 'object' && //
									'payload' in applyTo) {

								/** @type {OperatorConfig | undefined} */
								const operator = applyTo.payload.operator;
								encodedQuery = getEncodedQueryForV1(operator, field, nonEmptyValues[0]);
							}
							if (encodedQuery === null) {
								encodedQuery = `${field}=${nonEmptyValues[0]}`;
							}
							parts.push(encodedQuery);
						}
						if (nonEmptyValues.length > 1) {
							parts.push(`${field}IN${nonEmptyValues.join(',')}`);
						}
						if (hasEmpty) {
							parts.push(`${field}ISEMPTY`);
						}
						newQuery = parts.join('^OR');
					}
					break;
				case 'date':
					/**
						 * sys_created_onBETWEENjavascript:gs.dateGenerate('2022-01-11','00:00:00')@javascript:gs.dateGenerate('2022-01-12','23:59:59')
						 */
					if (filter.start && filter.end) {
						let startDate = filter.start;
						let startTime = '00:00:00';
						// Check if we have full date with time in it
						if (startDate.length > 10 && startDate.indexOf('T') > 0) {
							const [date, time] = startDate.split('T');
							startDate = date;
							startTime = time;
						}
						let endDate = filter.end;
						let endTime = '23:59:59';
						// Check if we have full date with time in it
						if (endDate.length > 10 && endDate.indexOf('T') > 0) {
							const [date, time] = endDate.split('T');
							endDate = date;
							endTime = time;
						}
						newQuery = `${field}BETWEENjavascript:gs.dateGenerate('${startDate}','${startTime}')@javascript:gs.dateGenerate('${endDate}','${endTime}')`;
					}
					break;
				case 'query':
					if (filter.encoded_query) {
						newQuery = filter.encoded_query;
					}
					break;
				}

				if (newQuery) {
					result[table] = existingQuery ? `${existingQuery}^${newQuery}` : newQuery;
				}
			}
		}
	}

	/* {
		incident: 'assigned_toIN5137153cc611227c000bbd1bd8cd2005^stateIN1,2',
		problem: 'categoryINdatabase,software',
	} */
	return result;
}

/**
 * Merges existing filters with another set of Filters.
 * Also generates encoded queries per table.
 *
 * @param {FilterConfigurationItem[] | null | undefined} oldFilters Filters stored on UIB page typically in `parFilters` state variable.
 * @param {FilterConfigurationItem[] | null | undefined} newFilters Payload dispatched by a filter.
 * @returns New merged filters data object.
 *//* export */ function mergePARFiltersV2(oldFilters, newFilters) {
	const parFilters = mergePARFilters(oldFilters, newFilters);
	const encodedQueries = getEncodedQueries(parFilters);
	return {
		parFilters,
		encodedQueries,
	};
}


	/**
	 * IMPORTANT: WE SHIP THIS SCRIPT IN TWO VERSIONS. VERSIONING IS DONE IN THE NEXT 2 LINES.
	 */
	mergePARFilters.v2 = mergePARFiltersV2;
	return mergePARFilters;
}

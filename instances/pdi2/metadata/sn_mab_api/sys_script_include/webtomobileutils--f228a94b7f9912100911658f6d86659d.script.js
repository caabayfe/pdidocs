/**
 * Utility class for transforming and managing data between web and mobile components.
 *
 * Note: This utility class cannot be instantiated.
 *
 * @class
 * @hideconstructor
 */
class WebToMobileUtils {
    constructor() {
        throw new Error('This utility class cannot be instantiated.');
    }

    // Cache for data fetched from the DB
    static #dbCache = {
        customTableMap: {},
        columnsByTable: {},
        recordsByQuery: {}
    };

    static viewConfigCreationModes = {
        DEFAULT: 'default',
        MANUAL: 'manual',
        GEN_AI: 'gen_ai',
    }

    /**
     * Enum for supported mobile component types.
     * @enum {string}
     */
    static SupportedMobileComponentTypes = {
        RECORD_SCREEN: 'RECORD_SCREEN',
        // INPUT_FORM_SCREEN: 'INPUT_FORM_SCREEN',
        // LIST_SCREEN: 'LIST_SCREEN',
    };

    static DEFAULT_EMPTY_VIEW_CONFIG = 'b6c51992b723101096aa25efce11a960';

    /**
     * Calculates the order string based on the given index and a predefined multiplier.
     *
     * @param {number} index - The index to calculate the order for.
     * @returns {string} The calculated order as a string.
     */
    static getOrderString(index) {
        const RECORD_ORDER_MULTIPLIER = 10;
        return ((index + 1) * RECORD_ORDER_MULTIPLIER).toString();
    }

    /**
     * Creates a new record with validated fields.
     *
     * @param {string} table - The name of the table.
     * @param {Object} data - The data for the new record.
     * @returns {Object} The new record object.
     */
    static createRecord (table, data) {
        const fields = WebToMobileUtils._getColumnsByTable(table);
        const validatedFields = WebToMobileUtils._validateFields(fields, data);
        return {
            tableName: table,
            sysId: WebToMobileUtils._generateNewRecordId(),
            fields: {
                ...validatedFields
            }
        }
    }


    /**
     * Retrieves a map from a specified table, caching the result to avoid repeated database queries.
     *
     * @param {string} tableName - The name of the table to query.
     * @param {string} keyField - The field to use as the key in the result map.
     * @param {string} valueField - The field to use as the value in the result map.
     * @returns {Object} An object where each key is the value from the keyField and each value is from the valueField.
     *
     * @example
     * // Retrieve a map of UI rule triggers from the 'sys_sg_ui_rule_trigger' table
     * const mobileUiRuleTriggerMap = WebToMobileUtils.getMapFromTable(
     *     'sys_sg_ui_rule_trigger',
     *     'name',
     *     'sys_id'
     * );
     *
     * * gs.info(mobileUiRuleTriggerMap);
     *  * // Output: {
     *  * //   "onChange": "1b680bd85b431010da168d8fa881c7a5",
     *  * //   "onLoad": "fd680bd85b431010da168d8fa881c7c8"
     *  * // }
     *
     */
    static getMapFromTable(tableName, keyField, valueField) {
        if (this.#dbCache.customTableMap[tableName]) {
            return this.#dbCache.customTableMap[tableName];
        }

        const result = {};
        const gr = new GlideRecord(tableName);
        gr.query();

        while (gr.next()) {
            const key = gr.getValue(keyField);
            const value = gr.getValue(valueField);
            result[key] = value;
        }

        this.#dbCache.customTableMap[tableName] = result;
        return result;
    }


    /**
     * Deep merges multiple objects into one.
     *
     * @param {...Object} objects - A variable number of objects to merge.
     * @returns {Object} The merged object.
     */
    static deepMergeObjects(...objects) {
        const merged = {};

        objects.forEach(obj => {
            for (let key in obj) {
                if (obj.hasOwnProperty(key)) {
                    if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
                        merged[key] = WebToMobileUtils.deepMergeObjects(merged[key], obj[key]);
                    } else if (Array.isArray(obj[key])) {
                        if (!merged[key]) {
                            merged[key] = obj[key];
                        } else {
                            merged[key] = merged[key].concat(obj[key]);
                        }
                    } else {
                        merged[key] = obj[key];
                    }
                }
            }
        });

        return merged;
    }


    /**
     * Retrieves and caches field values from a specified table with support for multiple query conditions.
     *
     * @param {string} tableName - The name of the table.
     * @param {string[]} fieldNames - An array of field names to retrieve.
     * @param {Object} query - An object representing the query conditions, with keys as fields to query by and values as query values.
     * @returns {Object[]} An array of objects containing the field values for each matching record.
     *
     * @example
     * // Retrieve multiple fields of incidents with specific conditions
     * const tableName = 'incident';
     * const fieldNames = ['short_description', 'priority'];
     * const query = { active: 'true' };
     *
     * const records = WebToMobileUtils.getRecords(tableName, fieldNames, query);
     * gs.info(records); // Output: [{ short_description: '...', priority: '...' }, ...]
     */
    static getRecords(tableName, fieldNames, query = {}) {
        const cacheKey = `${tableName}:${JSON.stringify(fieldNames)}:${JSON.stringify(query)}`;

        if (this.#dbCache.recordsByQuery[cacheKey]) {
            return this.#dbCache.recordsByQuery[cacheKey];
        }

        const gr = new GlideRecordSecure(tableName);
        for (const [queryField, queryValue] of Object.entries(query)) {
            gr.addQuery(queryField, queryValue);
        }
        gr.query();

        const results = [];
        while (gr.next()) {
            const record = {};
            for (const fieldName of fieldNames) {
                record[fieldName] = gr.getValue(fieldName);
            }
            results.push(record);
        }

        this.#dbCache.recordsByQuery[cacheKey] = results;
        return results;
    }

    /**
     * Merges multiple query strings, ensuring that components from earlier queries
     * take precedence over those from later queries.
     *
     * @param {...string} queries - A variable number of query strings to merge.
     * @returns {string} The merged query string with components from earlier queries
     *                   taking precedence.
     *
     * @example
     * // Example usage:
     * const query1 = "active=true";
     * const query2 = "priority=4^ORDERBYnumber";
     * const query3 = "caller_id=1234^ORDERBYpriority";
     * console.log(mergeQueries(query1, query2, query3));
     * // Output: "active=true^ORDERBYnumber^caller_id=1234^ORDERBYpriority"
     */
    static mergeQueries(...queries) {
        if (queries.length === 0) return '';

        const mergedQueryMap = new Map();

        queries.forEach(query => {
            if (query) {
                const queryComponents = query.split('^');
                queryComponents.forEach(component => {
                    const [key] = component.split('=');
                    if (!mergedQueryMap.has(key)) {
                        mergedQueryMap.set(key, component);
                    }
                });
            }
        });

        // Convert the map back to an array of components and join them with '^'
        const mergedQueryComponents = Array.from(mergedQueryMap.values());
        return mergedQueryComponents.join('^');
    }

    /**
     * Validates the fields of the data against the allowed fields for the table.
     *
     * @private
     * @param {Array<string>} [fieldList=[]] - The list of valid fields for the table.
     * @param {Object} [data={}] - The data to validate.
     * @returns {Object} The validated fields.
     */
    static _validateFields(fieldList = [], data = {}) {
        return Object.keys(data)
            .filter(key => fieldList.includes(key))
            .reduce((obj, key) => {
                let value = data[key]
                // #DEBUG_ONLY: keep this conditional for debugging purposes only.
                // if (key === 'name' && data.variable === undefined && data.name !== 'TargetTable' && !data.skipNameTimestamp) {
                //     value += ' ' + WebToMobileUtils._getCurrentTime();
                // }
                obj[key] = value;
                return obj;
            }, {});
    }


    /**
     * Retrieves the columns for a given table, including inherited columns from parent tables.
     *
     * @private
     * @param {string} table - The name of the table.
     * @returns {Array<string>} The list of columns for the table.
     */
    static _getColumnsByTable(table) {
        const columns = this.#dbCache['columnsByTable'][table] || [];
        if (columns.length > 0) {
            return columns;
        }

        const getColumns = (table) => {
            const dictGR = new GlideRecord('sys_dictionary');
            dictGR.addQuery('name', table);
            dictGR.addQuery('active', true);
            dictGR.query();

            while (dictGR.next()) {
                const columnName = dictGR.element.toString();
                // Exclude system columns and avoid duplicates
                if (!columnName.startsWith('sys_') && columns.indexOf(columnName) === -1) {
                    columns.push(columnName);
                }
            }
        }

        getColumns(table);

        const tableGR = new GlideRecord('sys_db_object');
        if (tableGR.get('name', table) && tableGR.super_class) {
            const parentTable = tableGR.super_class.name.toString();
            getColumns(parentTable); // Get columns from the parent table as well
        }

        this.#dbCache['columnsByTable'][table] = columns;

        return columns;
    }


    /**
     * Generates a new unique record ID.
     *
     * @private
     * @returns {string} A new unique record ID.
     */
    static _generateNewRecordId() {
        const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        const guid = () => [2, 1, 1, 1, 3].map(n => Array.from({ length: n }, s4).join('')).join('');
        return `new_${guid()}`;
    }

    /**
     * Gives an array of valid view config modes.
     *
     * @private
     * @returns {Array<string>} An array of valid view config modes.
     */
    static _getViewConfigModes() {
        return Object.values(WebToMobileUtils.viewConfigCreationModes);
    }

    /**
     * Gets a string of valid view config modes.
     *
     * @returns {string} A string of valid view config modes.
     */
    static getValidViewConfigModesString() {
        return WebToMobileUtils._getViewConfigModes().map(mode => `'${mode}'`).join(', ');
    }

    /**
     * #DEBUG_ONLY: Keeping this method for debugging purposes only.
     * Gets the current date and time as a formatted string.
     * @private
     * @returns {string} The current date and time in "MMM DD HH:MMAM/PM" format.
     */
    // static _getCurrentTime() {
    //     const now = new Date();
    //
    //     // Get the date part
    //     const options = { month: 'short', day: 'numeric' };
    //     const dateString = now.toLocaleDateString('en-US', options);
    //
    //     // Get the time part
    //     let hours = now.getHours();
    //     let minutes = now.getMinutes();
    //     const ampm = hours >= 12 ? 'PM' : 'AM';
    //     hours = hours % 12;
    //     hours = hours ? hours : 12; // the hour '0' should be '12'
    //     minutes = minutes < 10 ? '0' + minutes : minutes;
    //     const timeString = hours + ':' + minutes + ampm;
    //
    //     // Combine date and time
    //     const dateTimeString = dateString + ' ' + timeString;
    //
    //     return dateTimeString;
    // }
}

module.exports = WebToMobileUtils;

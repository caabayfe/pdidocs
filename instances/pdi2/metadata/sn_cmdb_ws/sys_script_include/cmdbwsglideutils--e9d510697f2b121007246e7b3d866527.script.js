class CMDBWsGlideUtils {
    static SYS_DICTIONARY = {
        TABLE: 'sys_dictionary',
        NAME: 'name',
        ELEMENT: 'element',
        INTERNAL_TYPE: 'internal_type',
        TYPE: 'internal_type',
        LABEL: 'column_label',
        MANDATORY: 'mandatory',
        MAX_LENGTH: 'max_length',
        DEFAULT_VALUE: 'default_value',
        DYNAMIC_DEFAULT_VALUE: 'dynamic_default_value',
        DISPLAY: 'display',
        CHOICE: 'choice',
        REFERENCE: 'reference',
        REFERENCE_QUALIFIER: 'reference_qual',
        USE_REFERENCE_QUALIFIER: 'use_reference_qualifier',
        REFERENCE_KEY: 'reference_key',
        COLUMN_TYPE: {
            REFERENCE: 'reference'
        },
        READ_ONLY: 'read_only'
    };

    static ERROR_CODES = {
        MISSING_REQUIRED_PARAM: 'MISSING_REQUIRED_PARAM',
        INVALID_RECORD: 'INVALID_RECORD'
    };

    static ACTIONS = {
        GET_FIELD_METADATA: 'GET_FIELD_METADATA'
    }

    static ERROR_SOURCE = "sn_cmdb_ws";

	static DEFAULT_BATCH_SIZE = 100;

    // Table & Field metadata API
    /**
     * Fetches metadata for fields in a table and returns an object with field name as key and field metadata as value
     * @param {String} table Table name
     * @param {String} [sysId] Optional sys_id
     * @param {Array} fields Array of field names
     * @returns {Object} Field metadata object
     */
    static getFieldMetadata(table, sysId, fields) {
        if (global.JSUtil.nil(table) || global.JSUtil.nil(fields)) {
            const missingParams = [];
            if (global.JSUtil.nil(table)) missingParams.push("table");
            if (global.JSUtil.nil(fields)) missingParams.push("fields");
            const missingParam = missingParams.join(",");
            throw new CMDBWsError({
                code: CMDBWsGlideUtils.ERROR_CODES.MISSING_REQUIRED_PARAM,
                action: CMDBWsGlideUtils.ACTIONS.GET_FIELD_METADATA,
                source: CMDBWsGlideUtils.ERROR_SOURCE,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Required parameter ({0}) missing when fetching field metadata", {
                    0: missingParam
                }),
                details: "Table and Fields are required when fetching field metadata",
                logError: true
            });
        }
        const wsUtil = new CMDBWorkspaceUtil();
        const SYS_DICTIONARY = CMDBWsGlideUtils.SYS_DICTIONARY;
        const result = {};

        const tableGr = new GlideRecord(table);
        tableGr.get(sysId);
        const _tableFieldsMap = {};

        for (let i = 0; i < fields.length; i++) {
            const _field = fields[i];
            const element = tableGr.getElement(_field);
            if (element == null) {
                continue;
            }
            const canRead = element.canRead();
            const canWrite = element.canWrite();
            const elementDescriptor = element.getED();
            const name = element.getName();
            const _table = element.getTableName();

            const mandatory = elementDescriptor.isMandatory();
            const internalType = elementDescriptor.getInternalType();
            const referenceTable = internalType === this.SYS_DICTIONARY.COLUMN_TYPE.REFERENCE ? element.getReferenceTable() : null;
            const referringRecordId = gs.nil(sysId) ? null : sysId;
            result[_field] = {
                name,
                mandatory,
                internalType,
                canRead,
                readonly: !canWrite,
                referringTable: table,
                referringRecordId,
            };

            // create a map of fields for various table to lookup sys_dictionary appropriately.
            if (!_tableFieldsMap[_table]) {
                _tableFieldsMap[_table] = [];
            }

            _tableFieldsMap[_table].push({
                path: _field,
                name: name
            });
        }

        for (const table in _tableFieldsMap) {
            const elements = _tableFieldsMap[table];
            const _nameToPath = elements.reduce((acc, field) => {
                acc[field.name] = field.path;
                return acc;
            }, {});
            const dictionaryGr = new GlideRecord(SYS_DICTIONARY.TABLE);
            dictionaryGr.addQuery(SYS_DICTIONARY.NAME, table);
            dictionaryGr.addQuery(SYS_DICTIONARY.ELEMENT, wsUtil.OPERATORS.IN, elements.map(f => f.name));
            dictionaryGr.query();
            while (dictionaryGr.next()) {
                const name = dictionaryGr.getValue(SYS_DICTIONARY.ELEMENT);
                result[_nameToPath[name]] = {
                    ...CMDBWsGlideUtils.getSysDictionaryMetadata(table, dictionaryGr),
                    ...result[_nameToPath[name]]
                }
            }
        }

        return result;
    }

    /**
     * Gets metadata object for various field types from sys_dictionary table
     * @param {String} table Table name
     * @param {GlideRecord} dictionaryGr GlideRecord object
     * @returns {Object} Field metadata object
     */
    static getSysDictionaryMetadata(table, dictionaryGr) {
        const SYS_DICTIONARY = CMDBWsGlideUtils.SYS_DICTIONARY;

        let _elmResult = {};
        const name = dictionaryGr.getValue(SYS_DICTIONARY.ELEMENT);
        const type = dictionaryGr.getValue(SYS_DICTIONARY.TYPE);
        const label = dictionaryGr.getDisplayValue(SYS_DICTIONARY.LABEL);
        const maxLength = dictionaryGr.getValue(SYS_DICTIONARY.MAX_LENGTH);
        const mandatory = dictionaryGr.getValue(SYS_DICTIONARY.MANDATORY) == "1";
        const defaultValue = dictionaryGr.getValue(SYS_DICTIONARY.DEFAULT_VALUE);
        const dynamicDefaultValue = dictionaryGr.getValue(SYS_DICTIONARY.DYNAMIC_DEFAULT_VALUE); // if dynamic default value, don't show on the UI
        _elmResult = {
            name,
            type,
            label,
            mandatory,
            maxLength,
            defaultValue: dynamicDefaultValue ? '' : defaultValue
        };
        const choiceValue = dictionaryGr.getValue(SYS_DICTIONARY.CHOICE);
        const isChoice = choiceValue != 0 && global.JSUtil.notNil(choiceValue);
        const isReference = type == SYS_DICTIONARY.COLUMN_TYPE.REFERENCE;
        if (isChoice) {
            const choiceList = GlideChoiceList.getChoiceList(table, name);
            const choices = [];
            for (let i = 0; i < choiceList.getSize(); i++) {
                if (global.JSUtil.notNil(defaultValue) && choiceList.getChoice(i).getValue() == defaultValue) {
                    _elmResult.defaultValueLabel = choiceList.getChoice(i).getLabel();
                }
                choices.push({
                    value: choiceList.getChoice(i).getValue(),
                    displayValue: choiceList.getChoice(i).getLabel()
                });
            }
            _elmResult.type = SYS_DICTIONARY.CHOICE; //overwrite the type to 'choice'
            _elmResult.choices = choices;
        } else if (isReference) {
            _elmResult.reference = dictionaryGr.getValue(SYS_DICTIONARY.REFERENCE);
            _elmResult.referenceQualifier = dictionaryGr.getValue(SYS_DICTIONARY.REFERENCE_QUALIFIER);
            _elmResult.referenceKey = dictionaryGr.getValue(SYS_DICTIONARY.REFERENCE_KEY);
            _elmResult.useReferenceQualifier = dictionaryGr.getValue(SYS_DICTIONARY.USE_REFERENCE_QUALIFIER);
        }
        return _elmResult;
    }

    // GlideRecord API
    /**
     * Fetches table hierarchy for a given table
     * @param {String} table Table name
     * @returns {Array} Array of table names in the hierarchy
     */
    static getTableHierarchy(table) {
        const tables = new GlideTableHierarchy(table).getTables();
        const result = [];
        tables.forEach(table => {
            result.push(table);
        });
        return result;
    }

    /**
     * Get the GlideRecord object by sys_id
     * @param {*} table 
     * @param {*} sysId 
	 * @param {*} secure whether to use GlideRecordSecure
     * @returns glide record object
     */
    static getGrBySysId(table, sysId, secure) {
        let gr;
		gr = secure ? new GlideRecordSecure(table) : new GlideRecord(table);
        if (gr.isValid() && gr.get(sysId)) {
            return gr;
        }
        return null;
    }

    /**
     * Get the GlideRecord object by map of field value
     * @param {*} table
     * @param {*} fieldValues
     * @returns glide record object
     */
    static getGrByFieldValues(table, fieldValues) {
        const gr = new GlideRecord(table);
        for (let field in fieldValues) {
            gr.addQuery(field, fieldValues[field]);
        }
        gr.query();
        if (gr.hasNext()) {
            return gr;
        }
        return null;
    }

    /**
     * Given a table, sys_id and fields, returns a map of field values
     * @param {*} table table name
     * @param {*} sysId sys_id of the record
     * @param {*} fields fields to fetch
     * @param {*} secure whether to use GlideRecordSecure
     * @returns map of field values
     */
    static getFieldValues(table, sysId, fields, secure) {
        const result = {};
        const proxyExecutor = new CMDBWSProxyScriptExecutor(sn_cmdb, 'CMDBWSScriptUtil');
        let gr;
		if (!secure) {
			gr = new GlideRecord(table);
		} else {
			gr = new GlideRecordSecure(table);
		}
        if (gr.get(sysId)) {
            fields.forEach(field => {
                const element = gr.getElement(field);
                if (element != null) {
                    result[field] = {
                        value: element.getValue(),
                        displayValue: element.getDisplayValue()
                    }
                }
            });
        }

		// Fetch highlighted values
		var highlightedRes = {};
		var tableList = [table, ...this.getTableHierarchy(table)];
		for (let tableName of tableList) {
		    var highlightedValues = [];
		    var _highlight = proxyExecutor.executeStaticFunction('getHighlightedValueStyles', [tableName, fields.join(','), null, gr], '[]');
		    if (_highlight && _highlight.length)
		        highlightedValues = JSON.parse(_highlight);
		    highlightedValues.forEach(item => {
		        if (!highlightedRes.hasOwnProperty(item.field))
		        	highlightedRes[item.field] = item;
		   	});
		}

		// Merge highlighted values with result
		for (let key in highlightedRes) {
		    if (result.hasOwnProperty(key)) {
		        let item = highlightedRes[key]
		        result[key] = {
		            ...result[key],
		            colorName: item.colorName,
		            variantName: item.variantName,
		            showIcon: item.showIcon,
		            iconName: item.iconName
		        };
		    }
		}
        return result;
    }

    /**
     * Checks if a record exists in the table
     * @param {*} table table name
     * @param {*} sysId sys_id of the record
     * @returns boolean
     */
    static isValidRecord(table, sysId) {
        const gr = new GlideRecord(table);
        if (gr.isValid()) {
            return gr.get(sysId);
        }
        return false;
    }

	/**
     * Checks if a record exists in the table. Throws error if record does not exist
     * @param {*} table table name
     * @param {*} sysId sys_id of the record
     * @returns boolean
     */
	static assertValidRecord(table, sysId, action) {
		const record = CMDBWsGlideUtils.isValidRecord(table, sysId);
		if (!record) {
				throw new CMDBWsError({
				code: this.ERROR_CODES.INVALID_RECORD,
				action: action,
				source: this.ERROR_SOURCE,
				message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Invalid record"),
				details: "Record doesn't exist for the given table and sysId - " + table + " : " + sysId,
				logError: true
			});
		}
		return record;
	}

	/**
	 * Checks if object has mandatory fields
	 * @param {object} args - object to check if keys exist
	 * @param {array} requiredFields - array containing field names
	 * @param {string} action - calling function name for error handling
	 */
	static checkRequiredFields(args, requiredFields, action) {
		const missingFields = [];
		requiredFields.forEach(field => {
			if (global.JSUtil.nil(args[field]))
				missingFields.push(field);
		});
		if (missingFields.length) {
			const missingFieldNames = missingFields.join(',');
			throw new CMDBWsError({
				code: this.ERROR_CODES.MISSING_REQUIRED_PARAM,
				action: action,
				source: CMDBWsGlideUtils.ERROR_SOURCE,
				message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Required fields ({0}) are missing", {
					0: missingFieldNames
				}),
				details: missingFieldNames + " are required fields.",
				logError: true
			});
		}
	}

    /**
     * Query the given table with the provided queries and return the result
     * @param {*} table Table name
     * @param {*} queries Array of queries
     * @param {*} resultKeyCol Column to be used as key for the result
     * @param {*} resultCols Array of columns to be included in the result
     * @return {*} result Object with the result
     */
    static queryTable(table, queries = [], resultKeyCol, resultCols = []) {
        const result = {};
        const gr = new GlideRecord(table);
		if (!gr.isValid()) {
			return result;
		}
        queries.forEach(query => {
            gr.addQuery(...query);
        });
        
        gr.query();

        while(gr.next()) {
            const _key = resultKeyCol ? gr.getValue(resultKeyCol) : gr.getUniqueValue();
            if (resultCols && resultCols.length > 0) {
                result[_key] = {};
                resultCols.forEach(col => {
					const element = gr.getElement(col);
                    const _val = element ? element.getValue() : '';
                    if (_val) {
                        result[_key][col] = _val;
                    }
                });
            } else {
                result[_key] = true;
            }
        }
        return result;
    }

	/**
     * Run queryTable in batches, specifically by batching values for an 'IN' clause.
     *
     * @param {string} tableName - The name of the table to query.
     * @param {Array} [baseQueryConditions] - An array of base query conditions (e.g., [['field', 'operator', 'value']]).
     *                                       These are applied to every batch. Can be null or empty.
     * @param {string} inClauseField - The field to use for the 'IN' clause (e.g., 'sys_id').
     * @param {Array} inClauseValues - The array of values to be batched for the 'IN' clause.
     * @param {*} resultKeyCol Column to be used as key for the result
     * @param {*} resultCols Array of columns to be included in the result
     * @param {number} [batchSize=100] - The number of values to include in each batch for the 'IN' clause.
     * @returns {Object} An object containing all the aggregated results from the batched queries.
     */
    static queryTableWithBatchedInClause(tableName, baseQueryConditions, inClauseField, inClauseValues, resultKeyCol, resultCols, batchSize) {
        batchSize = parseInt(batchSize, 10) || CMDBWsGlideUtils.DEFAULT_BATCH_SIZE;
        let allResults = {};

        if (!inClauseValues || !Array.isArray(inClauseValues) || inClauseValues.length === 0 || !inClauseField || typeof inClauseField !== 'string' || inClauseField.trim() === '') {
            return {};
        }
        
        for (let i = 0; i < inClauseValues.length; i += batchSize) {
            const currentBatchValues = inClauseValues.slice(i, i + batchSize);
            
            const queryConditionsForBatch = baseQueryConditions && Array.isArray(baseQueryConditions) ? [...baseQueryConditions] : [];
            queryConditionsForBatch.push([inClauseField, 'IN', currentBatchValues]);

            const batchResults = CMDBWsGlideUtils.queryTable(
                tableName,
                queryConditionsForBatch,
                resultKeyCol,
                resultCols || [] 
            );
            
            allResults = new CMDBWorkspaceUtil().mergeObjects(allResults || {}, batchResults || {});
        }
        
        return allResults;
    }
}

const BuilderToolkitAPIBase = Class.create();
BuilderToolkitAPIBase.prototype = Object.extendsObject(global.BuilderToolkitAPIGlobal, {
    FIELD_TYPES: {
        sys_id: 'string',
        sys_scope: 'reference',
        sys_domain: 'string',
        sys_policy: 'string',
        sys_updated_on: 'glide_date_time',
        sys_updated_by: 'string',
        sys_package: 'reference'
    },
    TRANSLATED_JSON_FIELDS: ['props', 'config_layout'],

    /**
     * @param table {string} the table we are working on
     * @param fields {string} the list of fields we care about on that table
     * @param noDomain {boolean} true if we are querying without domains (dom sep situations only)
     * @param includeDisplayValue {boolean} true if we are storing value/display value pairs for fields
     * @param fieldTypes {object} an object where the key is the fieldName and the value is the internal field type
     */
    initialize: function(table, fields, noDomain, includeDisplayValue, fieldTypes = {}) {
        this.table = table;
        this.fields = fields || [];
        this.noDomain = noDomain || false;
        this.fieldTypes = {
            ...this.FIELD_TYPES,
            ...fieldTypes
        };
        this.includeDisplayValue = includeDisplayValue || false;
        this.arrayUtil = new global.ArrayUtil();
    },

    // -------------------
    // CREATE
    // -------------------

    /**
     * @param glideRecord {GlideRecord | null} the record we want to copy
     * @param sysId {string} the ID of the record we want to copy
     * @param overrideFieldValues {object} an object with camelCase record keys and values {name, value}
     * @param scope {string} sys_id of the scope to use
     * @param domain {string} sys_id of the domain to use
     */
    copyRecord: function(glideRecord, sysId, overrideFieldValues = {}, scope = null, domain = null) {
        const originalRecordGR = glideRecord ? glideRecord : this.getRecordById(sysId, true);
        if (originalRecordGR) {
            const newRecordGR = new GlideRecord(this.table);
            newRecordGR.initialize();
            for (const field in originalRecordGR) {
                if (!this._isSystemGeneratedField(field)) {
                    newRecordGR[field] = originalRecordGR[field];
                }
            }
            this.setFieldValues(newRecordGR, overrideFieldValues);
            if (overrideFieldValues && (overrideFieldValues.sys_id || overrideFieldValues.sysId)) {
                newRecordGR.setNewGuidValue(overrideFieldValues.sys_id ?? overrideFieldValues.sysId);
            }
            if (scope) {
                newRecordGR.setValue('sys_scope', scope);
            }
            if (domain && newRecordGR.isValidField('sys_domain')) {
                newRecordGR.setValue('sys_domain', domain);
            }
            if (overrideFieldValues && (overrideFieldValues?.sysOverrides || overrideFieldValues?.sys_overrides)) {
                const overrideSysId = overrideFieldValues?.sysOverrides ? overrideFieldValues?.sysOverrides : overrideFieldValues?.sys_overrides;
                newRecordGR.setValue('sys_overrides', overrideSysId);
            }
            return newRecordGR.insert();
        }
        return false;
    },

    /**
     * @param glideRecords {GlideRecord | null} a glide record object with one or many records in a query
     * @param query {string} the query string to search by
     * @param overrideFieldValues {object} an object with camelCase record keys and values {name, value}
     * @param scope {string} sys_id of the scope to use
     * @param domain {string} sys_id of the domain to use
     */
    copyRecords: function(glideRecords, query, overrideFieldValues = {}, scope = null, domain = null) {
        const records = glideRecords ? glideRecords : this.getRecordsByQuery(query, '', true);
        if (!records || !records.hasNext()) {
            return [];
        }
        const results = [];
        while (records.next()) {
            results.push(this.copyRecord(records, null, overrideFieldValues, scope, domain));
        }
        return results;
    },

    /**
     * @param fields {object} an object with record keys in camel case and values
     */
    createRecord: function(fields, encodedQuery) {
        const recordGR = new GlideRecordSecure(this.table);
        if (recordGR.canCreate()) {
            recordGR.initialize();
            if (encodedQuery) {
                recordGR.applyEncodedQuery(encodedQuery);
            }
            this.setFieldValues(recordGR, fields);
            if (fields && (fields.sys_id || fields.sysId)) {
                recordGR.setNewGuidValue(fields.sys_id ?? fields.sysId);
            }
            return recordGR.insert();
        }
        return {
            error: true,
            reason: BuilderToolkitConstants.ERRORS.WRITE_ACCESS_ERROR_MESSAGE
        };
    },

    /**
     * @param records {object[]} a array of field objects
     */
    createRecords: function(records = []) {
        return this._iterateRecords(records, this.createRecord.bind(this));
    },

    // -------------------
    // READ
    // -------------------

    /**
     * @param query {string} the query to check with
     */
    checkIfRecordsExist: function(query) {
        const recordCheckGA = new GlideAggregate(this.table);
        recordCheckGA.addAggregate("COUNT");
        recordCheckGA.addQuery(query);
        recordCheckGA.query();
        if (recordCheckGA.next()) {
            return parseInt(recordCheckGA.getAggregate("COUNT")) !== 0;
        }
        return false;
    },

    /**
     * @param recordGR {GlideRecord} the record we want to get values for
     */
    getValuesFromGlideRecord: function(recordGR) {
        return recordGR.getElements().reduce(this.getFieldValues.bind(this), {});
    },

    /**
     * @param acc {object} the accumulator object
     * @param field {GlideElement} the field element we are currently working on
     */
    getFieldValues: function(acc, field) {
        const gdt = new GlideDateTime();
        const gd = new GlideDate();
        const fieldName = field.getName();
        const fieldsIsEmpty = this.fields.length === 0;
        const isAllowedField = (this.fields ?? []).indexOf(fieldName) !== -1;
        const isSysGeneratedField = this._isSystemGeneratedField(fieldName);
        const isAllowedSysField = BuilderToolkitConstants.ALLOWED_SYS_FIELDS.includes(fieldName);
        let fieldObject = null;

        if (!field.nil()) {
            if ((fieldsIsEmpty && !isSysGeneratedField) || isAllowedField || isAllowedSysField) {
                if (!this.fieldTypes[fieldName]) {
                    this.fieldTypes[fieldName] = field.getED().getInternalType();
                }
                const fieldType = this.fieldTypes[fieldName];
                let fieldValue = field.toString();
                let fieldDisplayValue = field.getDisplayValue();
                switch (fieldType) {
                    case 'integer':
                        fieldValue = parseInt(fieldValue);
                        break;
                    case 'boolean':
                        fieldValue = fieldValue === 'true';
                        break;
                    case 'translated_field':
                    case 'translated_text':
                        fieldValue = fieldDisplayValue;
                        break;
                    case 'json_translations':
                    case 'string':
                    case 'json':
                        if (!this._checkIfValueIsJSON(fieldValue)) {
                            break;
                        }
                        try {
                            const tempValue = this.parseJSON(field, {
                                field: fieldName,
                                sysId: acc.sysId
                            });
                            if (tempValue !== null) {
                                fieldValue = fieldDisplayValue = this.TRANSLATED_JSON_FIELDS.includes(fieldName) ?
                                    this._translateJSONField(tempValue) : tempValue;
                            } else {
                                fieldValue = fieldDisplayValue = null;
                            }
                        } catch (err) {
                            // Failed to parse a JSON field probably due to bad data which apparently is rampant. setting to straight value
                            fieldValue = fieldDisplayValue = field;
                        }
                        break;
                    case 'glide_date_time':
                        gd.setDisplayValue(fieldDisplayValue);
                        gdt.setDisplayValue(fieldDisplayValue);
                        fieldDisplayValue = {
                            internal: fieldDisplayValue,
                            date: gd.getDisplayValueLang('medium'),
                            time: gdt.getTime().getDisplayValue()
                        };
                        break;
                }
                if (fieldName === 'sys_scope') {
                    const scopeRecord = field.getRefRecord();
                    fieldObject = {
                        value: fieldValue,
                        displayValue: fieldDisplayValue,
                        scopeName: scopeRecord.scope,
                        vendor: scopeRecord.vendor || BuilderToolkitConstants.SERVICENOW
                    };
                } else {
                    fieldObject = this.includeDisplayValue || (isAllowedSysField && fieldName !== 'sys_id') ? {
                        value: fieldValue,
                        displayValue: fieldDisplayValue
                    } : fieldValue;
                }
                acc[this._toCamelCase(fieldName)] = fieldObject;
            }
        }
        return acc;
    },

    /**
     * @param sysId {string} the ID of the record we want to get
     * @param shouldReturnGR {boolean} true if we are returning the GlideRecord vs. an object with values
     */
    getRecordById: function(sysId, shouldReturnGR) {
        try {
            const recordGR = this.get(this.table, 'sys_id=' + sysId, false, this.noDomain);
            if (recordGR.next()) {
                return shouldReturnGR ? recordGR : this.getValuesFromGlideRecord(recordGR);
            }
        } catch (err) {
            gs.error(err);
        }
        return null;
    },

    /**
     * @param encodedQuery {string} the query to use, can be null for no query
     * @param orderBy {string} the the field name to order the list by
     * @param shouldReturnGR {boolean} true if we are returning the GlideRecord vs. an array of objects with values
     */
    getRecordsByQuery: function(encodedQuery, orderBy, shouldReturnGR) {
        const records = [];
        const recordGR = this.get(this.table, encodedQuery || '', orderBy, this.noDomain);
        if (shouldReturnGR) {
            return recordGR.hasNext() ? recordGR : false;
        }
        while (recordGR.next()) {
            records.push(this.getValuesFromGlideRecord(recordGR));
        }
        return records;
    },

    // -------------------
    // UPDATE
    // -------------------

    /**
     * @param recordGR {GlideRecord} the record we are setting values for
     * @param fields {object} a object with keys in camel case and values
     */
    setFieldValues: function(recordGR, fields = {}) {
        Object.entries(fields).forEach(([key, value]) => {
            const fieldName = this._toSnakeCase(key);
            if (recordGR.isValidField(fieldName)) {
                const element = recordGR.getElement(fieldName);
                if (!this.fieldTypes[fieldName]) {
                    this.fieldTypes[fieldName] = element.getED().getInternalType();
                }
                if (value && (fieldName === 'sys_scope' || fieldName === 'sys_domain')) {
                    if (typeof value === 'string') {
                        recordGR.setValue(fieldName, value);
                    } else if (typeof value === 'object' && value?.value) {
                        recordGR.setValue(fieldName, value.value);
                    }
                } else if (!this._isSystemGeneratedField(fieldName)) {
                    if (this.fieldTypes[fieldName] === 'json' || this.fieldTypes[fieldName] === 'json_translations' ||
                        this._checkIfValueIsJSON(`${value}`)) {
                        // If this is a not a null value and is a JSON type, then stringify it
                        value = value !== null ? this.stringifyJSON(value) : null;
                    }
                    if (Array.isArray(value) && this.fieldTypes[fieldName] === 'string') {
                        value = value.join(',');
                    }
                    // To make sure that the instance actually clears the value, we have to set it to an empty string
                    // Anything else like true null or undefined will be ignored
                    const fieldValue = value === null ? '' : value;
                    recordGR.setValue(fieldName, fieldValue);
                }
            }
        });
    },

    /**
     * @param fields {object} a object with keys in camel case and values
     */
    updateRecord: function({
        sysId,
        ...fields
    }) {
        const recordGR = this.getRecordById(sysId, true);
        if (recordGR && recordGR.canWrite()) {
            this.setFieldValues(recordGR, fields);
            //recordGR.setWorkflow(false);
            return recordGR.update();
        }
        return {
            error: true,
            reason: !recordGR ? BuilderToolkitConstants.ERRORS.NO_RECORD_FOUND : BuilderToolkitConstants.ERRORS.WRITE_ACCESS_ERROR_MESSAGE
        };
    },

    /**
     * @param records {object[]} a array of field objects
     */
    updateRecords: function(records = []) {
        return this._iterateRecords(records, this.updateRecord.bind(this));
    },

    // -------------------
    // DELETE
    // -------------------

    /**
     * @param fields {object} a object with record keys in camel case and values
     */
    deleteRecord: function({
        sysId
    }) {
        const recordGR = this.getRecordById(sysId, true);
        if (recordGR && recordGR.canDelete()) {
            return recordGR.deleteRecord();
        }
        return {
            error: true,
            reason: !recordGR ? BuilderToolkitConstants.ERRORS.NO_RECORD_FOUND : BuilderToolkitConstants.ERRORS.DELETE_ACCESS_ERROR_MESSAGE
        };
    },

    /**
     * @param encodedQuery {string} a encodedQuery
     */
    deleteRecordsByEncodedQuery: function(encodedQuery) {
        const recordGR = this.getRecordsByQuery(encodedQuery, null, true);
        if (recordGR)
            while (recordGR.next()) {
                if (recordGR.canDelete()) {
                    recordGR.deleteRecord();
                }
            }
        return {
            error: true,
            reason: !recordGR ? BuilderToolkitConstants.ERRORS.NO_RECORD_FOUND : BuilderToolkitConstants.ERRORS.DELETE_ACCESS_ERROR_MESSAGE
        };
    },

    /**
     * @param records {object[]} a array of camelCased record objects
     */
    deleteRecords: function(records = []) {
        return this._iterateRecords(records, this.deleteRecord.bind(this));
    },

    /**
     * @param deleteFunctions {array} an array of functions to execute
     */
    executeDeleteFunctions: function(deleteFunctions) {
        deleteFunctions.forEach(({
            handler,
            records
        }) => {
            handler.deleteRecords(records);
        });
    },

    // -------------------
    // SEARCH
    // -------------------

    /**
     * @param table {string} the table to search
     * @param searchValue {string} the value to find for the search
     * @param options {object} options for customizing the search
     */
    searchTableForResults: function(table, searchValue, options) {
        // Validate the provided table
        const referenceGlideRecord = new GlideRecord(table);

        if (!referenceGlideRecord.isValid()) {
            throw new Error('Invalid GlideRecord table provided');
        }

        // Set the field and validate
        const field = options.field || referenceGlideRecord.getDisplayName();

        if (field && !referenceGlideRecord.isValidField(field)) {
            throw new Error('Invalid field provided');
        }

        // Set the limit, validate, and ensure we don't return the world
        const limit = options.limit || 20;

        if (isNaN(limit)) {
            throw new Error('Invalid limit provided, limit must be a number');
        }

        if (limit > 100) {
            throw new Error('Limit must be less than 100');
        }

        if (options.referenceFilter) {
            referenceGlideRecord.addQuery(options.referenceFilter);
        }

        // Query GlideRecord
        referenceGlideRecord.addQuery(field, 'CONTAINS', searchValue);
        referenceGlideRecord.setLimit(limit);
        referenceGlideRecord.query();

        let records = [];

        while (referenceGlideRecord.next()) {
            records.push({
                id: referenceGlideRecord.getUniqueValue(),
                label: referenceGlideRecord.getValue(field)
            });
        }

        return records;
    },

    // -------------------
    // HELPERS
    // -------------------

    /**
     * Gets when the instance last upgraded
     */
    getLastUpgradeDate: function() {
        const lastUpgradeGR = new GlideRecord('sys_upgrade_history');
        lastUpgradeGR.orderByDesc('upgrade_started');
        lastUpgradeGR.setLimit(1);
        lastUpgradeGR.query();
        const lastUpgradeDT = lastUpgradeGR.next() ? new GlideDateTime(lastUpgradeGR.getValue('upgrade_started')) : null;
        return lastUpgradeDT ? lastUpgradeDT.getNumericValue() : null;
    },

    processRecordsByDatabaseOperation: function(records = []) {
        const groupedByDatabaseOperation = (records || []).reduce((acc, record) => {
            switch (record.databaseOperation) {
                case 'insert':
                    acc.createRecords.push(record);
                    break;
                case 'update':
                    acc.updateRecords.push(record);
                    break;
                case 'delete':
                    acc.deleteRecords.push(record);
                    break;
            }
            return acc;
        }, {
            createRecords: [],
            updateRecords: [],
            deleteRecords: []
        });

        let results = [];
        if (groupedByDatabaseOperation.createRecords.length > 0) {
            results = results.concat(this.createRecords(groupedByDatabaseOperation.createRecords));
        }
        if (groupedByDatabaseOperation.updateRecords.length > 0) {
            results = results.concat(this.updateRecords(groupedByDatabaseOperation.updateRecords));
        }
        if (groupedByDatabaseOperation.deleteRecords.length > 0) {
            results = results.concat(this.deleteRecords(groupedByDatabaseOperation.deleteRecords));
        }
        return results;
    },

    /**
     * @param jsonString {string} stringified JSON
     */
    parseJSON: function(jsonString, source) {
        if (jsonString === null) {
            return null;
        }
        try {
            return JSON.parse(jsonString.trim());
        } catch (err) {
            gs.error(`
			Failed parsing JSON: ${jsonString} with error: ${err.message}
			Table: ${this.table}
			${source && source.sysId ? `Link: /${this.table}.do?sys_id=${source.sysId}` : ''}
			${source ? Object.entries(source).map(function([key,value]){return `${key}: ${value}`}).join('\n') : ''}
			${err.stack}
			`);
            return null;
        }
    },

    /**
     * @param json {JSON} JSON to be stringified
     * @param spacing {number} the numver of spacing to use when stringifying
     */
    stringifyJSON: function(json, spacing) {
        spacing = spacing || 4;
        try {
            return JSON.stringify(json, null, spacing);
        } catch (err) {
            gs.error(`
			Failed stringifying JSON: ${json} with error: ${err.message}
			${err.stack}
			`);
            return null;
        }
    },

    getEncodedQuery: function(fieldValueObject) {
        return Object.entries(fieldValueObject).reduce(function(acc, [field, value]) {
            acc.push(`${field}=${value}`);
            return acc;
        }, []).join('^');
    },

    getUpgradeStateSysIds: function(table, sysId, routes) {
        const sysUpgradeNames = [`${table}_${sysId}.xml`];

        routes?.forEach((route) => {
            sysUpgradeNames.push(`sys_ux_app_route_${route.sysId.value}.xml`);
            route?.screens?.forEach((screen) =>
                sysUpgradeNames.push(`sys_ux_screen_${screen.sysId.value}.xml`)
            );
        });

        const upgradeStateHandler = new global.BuilderToolkitAPIGlobal();
        const encodedQuery = `nameIN${sysUpgradeNames.join(',')}`;
        const upgradeStateGr = upgradeStateHandler.get('sys_upgrade_state', encodedQuery, 'name', this.noDomain);
        const upgradeStateSysIds = [];

        if (upgradeStateGr) {
            while (upgradeStateGr.next()) {
                const recordName = upgradeStateGr.getValue("name");
                // Extract the sysId from the sysUpdateName.
                // Ex: sys_ux_page_registry_7f7d4da15b31011011ca51d11581c72e.xml
                upgradeStateSysIds.push(recordName.match(/[0-9a-f]{32}/)[0]);
            }
        }

        return upgradeStateSysIds;
    },

    /**
     * @param value {string} the value we want to check if it is stringified JSON or a real string
     */
    _checkIfValueIsJSON: function(value = '') {
        const trimmedValue = typeof value === 'string' ? value.trim() : (value + '').trim();
        if ((trimmedValue.startsWith('[') || trimmedValue.startsWith('{')) &&
            !trimmedValue.toLowerCase().startsWith('[deprecated]')) {
            try {
                JSON.parse(trimmedValue);
                return true;
            } catch (err) {
                return false;
            }
        }
        return false;
    },

    /**
     * @param jsonObject {Object} a json object from a json field that needs translation (e.g. Macroponent properties)
     * @param propsToTranslate {string[]} an array of object props that need translation
     */
    _getTranslatedTextForJSON: function(jsonObject = {}, propsToTranslate) {
        return Object.keys(jsonObject).reduce(function(acc, key) {
            if (propsToTranslate.indexOf(key) !== -1) {
                if (typeof jsonObject[key] === 'string') {
                    acc[key] = gs.getMessage(jsonObject[key]);
                    return acc;
                } else if (jsonObject[key]) {
                    const uxValue = jsonObject[key];
                    if (uxValue.type === 'TRANSLATION_LITERAL') {
                        uxValue.value.message = gs.getMessage(uxValue.value.message);
                    } else {
                        uxValue.value = gs.getMessage(uxValue.value);
                    }
                    acc[key] = uxValue;
                    return acc;
                }
            }
            acc[key] = jsonObject[key];
            return acc;
        }, {});
    },

    /**
     * @param fieldName {string} checks if the field is a system generated field
     */
    _isSystemGeneratedField: function(fieldName) {
        return fieldName.startsWith('sys_');
    },

    /**
     * @param records {object[]} a array of camelCased record objects
     */
    _iterateRecords: function(records = [], mapFunction) {
        return !records || records.length === 0 ? true : records.map(mapFunction);
    },

    /**
     * @param message {string} the message we want to log
     * @param prefix {string} the prefix for the log message to find it easier
     */
    _logMessage: function(message, prefix) {
        prefix = prefix || this.type;
        gs.info('{0}\n\n{1}', prefix, message);
    },

    /**
     * @param messageObj {JSON} the JSON object or array we want to log
     * @param prefix {string} the prefix for the log message to find it easier
     */
    _logJSON: function(messageObj, prefix) {
        this._logMessage(JSON.stringify(messageObj, null, 4), prefix);
    },

    /**
     * @param fieldName {string} a field name in Snake case
     */
    _toCamelCase: (fieldName) => {
        return fieldName.toLowerCase().replace(/([-_][a-z])/g, namePart => namePart.toUpperCase().replace('-', '').replace('_', ''));
    },

    /**
     * @param fieldName {string} a field name in Camel case
     */
    _toSnakeCase: (fieldName) => {
        return fieldName.replace(/[A-Z]/g, namePart => '_' + namePart.toLowerCase());
    },

    /**
     * @param jsonObject {Object | Array} a parsed JSON object or array from a field value
     */
    _translateJSONField: function(jsonObject) {
        if (Array.isArray(jsonObject)) {
            for (const index in jsonObject) {
                if (jsonObject[index]?.fieldType == "collection" &&
                    jsonObject[index]?.typeMetadata?.collection?.properties) {
                    const collectionProps = jsonObject[index]["typeMetadata"]["collection"]["properties"];
                    jsonObject[index]["typeMetadata"]["collection"]["properties"] = this._translateCollectionProperties(collectionProps);
                } else {
                    jsonObject[index] = typeof jsonObject[index] === 'string' ? jsonObject[index] :
                        this._translateObjectProperties(jsonObject[index]);
                }
            }
        } else if (typeof jsonObject === 'object') {
            jsonObject = this._translateObjectProperties(jsonObject);
        }
        return jsonObject;
    },

    /**
     * @param objectToTranslate {Object | Array} a parsed JSON object or array from a field value
     */
    _translateObjectProperties: function(objectToTranslate) {
        const that = this;
        const translatedObject = that._getTranslatedTextForJSON(objectToTranslate, ['label', 'description', 'title']);
        if (translatedObject.typeMetadata && translatedObject.typeMetadata.choices && translatedObject.typeMetadata.choices.length > 0) {
            translatedObject.typeMetadata.choices = translatedObject.typeMetadata.choices.reduce(function(acc, choice) {
                acc.push(that._getTranslatedTextForJSON(choice, ['label']));
                return acc;
            }, []);
        }
        // For nested config layouts that have sections inside of sections we need to recursively check
        else if (translatedObject.children && translatedObject.children.length > 0) {
			// Some children are just strings of props which we just return, but if it's a section we need to recursively check
            translatedObject.children = translatedObject.children.map((child) => typeof child === 'object' ? this._translateObjectProperties(child, ['title']) : child);
        }
        return translatedObject;
    },

    /**
     * @param objectToTranslate {Array} a Collection properties array.
     */
    _translateCollectionProperties: function(objectToTranslate) {
        const that = this;
        const translatedProps = objectToTranslate.reduce((acc, property) => {
            acc.push(this._translateObjectProperties(property));
            return acc;
        }, []);
        return translatedProps;
    },
    type: 'BuilderToolkitAPIBase'
});

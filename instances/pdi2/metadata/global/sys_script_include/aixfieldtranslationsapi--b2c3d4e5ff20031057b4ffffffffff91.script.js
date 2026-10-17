var AIXFieldTranslationsAPI = Class.create();
AIXFieldTranslationsAPI.prototype = {

    initialize: function() {},

    /**
     * Return translated display values for translated_text fields across the
     * requested tables and records. The session language, set by the caller via
     * Accept-Language header, determines the locale returned by getDisplayValue().
     *
     * @param {Object} tables  Map of tableName -> [sysId, ...]
     * @returns {Object} { tableName: { sysId: { fieldName: value }, ... }, ... }
     *          Only fields with a non-empty display value are included.
     */
    getDisplayValues: function(tables) {
        var tableNames = Object.keys(tables);

        // Discover which fields are of type translated_text for each table.
        var fieldMap = this._discoverTranslatableFields(tableNames);

        var result = {};
        for (var i = 0; i < tableNames.length; i++) {
            var tableName = tableNames[i];
            var sysIds = tables[tableName];
            var fields = fieldMap[tableName] || [];

            if (!sysIds || sysIds.length === 0 || fields.length === 0) {
                result[tableName] = {};
                continue;
            }

            result[tableName] = this._lookupForTable(tableName, sysIds, fields);
        }

        return result;
    },

    /**
     * Return translatable field names for each requested table by inspecting
     * in-memory field metadata via GlideRecord.getElements(). Picks up both
     * translated_text and translated_field types. No database query — uses the
     * cached table descriptor loaded by ServiceNow at startup.
     *
     * Returns { tableName: [fieldName, ...] }.
     */
    _discoverTranslatableFields: function(tableNames) {
        var map = {};
        var TRANSLATABLE = {'translated_text': true, 'translated_field': true};

        for (var i = 0; i < tableNames.length; i++) {
            var tableName = tableNames[i];
            var fields = [];
            try {
                var gr = new GlideRecord(tableName);
                var elements = gr.getElements();
                for (var j = 0; j < elements.size(); j++) {
                    var el = elements.get(j);
                    var type = String(el.getED().getInternalType());
                    if (TRANSLATABLE[type]) {
                        fields.push(el.getName());
                    }
                }
            } catch(e) {
                // Unknown or inaccessible table — no fields discovered; lookup returns {}
            }
            map[tableName] = fields;
        }

        return map;
    },

    /**
     * Query the source table and use getDisplayValue() on each translated_text
     * field. The session language set by the caller's Accept-Language header
     * determines the locale returned.
     *
     * Returns { sysId: { fieldName: value } }; fields with empty display values
     * are omitted from the result.
     */
    _lookupForTable: function(tableName, sysIds, fields) {
        var result = {};
        for (var i = 0; i < sysIds.length; i++) {
            result[sysIds[i]] = {};
        }

        var gr = new GlideRecord(tableName);
        var idQc = gr.addQuery('sys_id', sysIds[0]);
        for (var j = 1; j < sysIds.length; j++) {
            idQc.addOrCondition('sys_id', sysIds[j]);
        }
        gr.setWorkflow(false);
        gr.query();
        while (gr.next()) {
            var sysId = gr.getValue('sys_id');
            if (result[sysId] !== undefined) {
                for (var k = 0; k < fields.length; k++) {
                    var displayVal = gr.getDisplayValue(fields[k]);
                    if (displayVal !== null && displayVal !== undefined && displayVal !== '') {
                        result[sysId][fields[k]] = displayVal;
                    }
                }
            }
        }

        return result;
    },

    type: 'AIXFieldTranslationsAPI'
};

const ClientScript = Class.create();
ClientScript.prototype = Object.extendsObject(BuilderToolkitAPIBase, {
    TABLE: 'sys_ux_client_script',
    FIELDS: ['script_api_version', 'required_translations', 'type', 'script', 'target', 'macroponent', 'name', 'includes'],
    FIELD_TYPES: {
        script_api_version: 'string',
        required_translations: 'json',
        type: 'string',
        script: 'string',
        target: 'reference',
        macroponent: 'reference',
        name: 'string',
        includes: 'glide_list'
    },

    /**
     * @param fields {string[]}
     */
    initialize: function(fields) {
        BuilderToolkitAPIBase.prototype.initialize.call(this, this.TABLE, fields || this.FIELDS, undefined, undefined, this.FIELD_TYPES);
    },

    /**
     * @param records {object[]} array of records with camelCased keys
     */
    updateRecords: function(records) {
        return records.length === 0 ? true : records.map(function(record) {
            return this.updateRecord(record);
        }.bind(this));
    },

    /**
     * @param fields {object} a object with keys in camel case and values
     */
    updateRecord: function({
        sysId,
        ...fields
    }) {
        let recordGR = this.getRecordById(sysId, true);
        if (!recordGR) {
            return this.createRecord({
                sysId,
                ...fields
            });
        } else if (recordGR && recordGR.canWrite()) {
            this.setFieldValues(recordGR, fields);
            return recordGR.update();
        }
        return {
            error: true,
            reason: !recordGR ? BuilderToolkitConstants.ERRORS.NO_RECORD_FOUND : BuilderToolkitConstants.ERRORS.WRITE_ACCESS_ERROR_MESSAGE
        };
    },

    type: 'ClientScript'
});

var UIBHook = Class.create();
UIBHook.prototype = Object.extendsObject(BuilderToolkitAPIBase, {
    TABLE: 'sys_uib_hook',
    FIELDS: ['context_table_name', 'context_table_document_id', 'order', 'hook_type', 'hook_payload'],

    /**
     * @param fields {string[]}
     */
    initialize: function(fields) {
        BuilderToolkitAPIBase.prototype.initialize.call(this, this.TABLE, fields || this.FIELDS);
    },

    _getRecordsByQuery: function(encodedQuery, orderBy, shouldReturnGR) {
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

    getRecordsByQuery: function(encodedQuery, orderBy, shouldReturnGR) {
        const recordsRaw = this._getRecordsByQuery(encodedQuery, orderBy, shouldReturnGR);
        const recordsWithTranslations = [];

        for (const record of recordsRaw) {
            const modifiedRecord = {
                ...record
            };
            switch (record.hookType.toString()) {
                case 'NOW_ALERT#DUPLICATE_BANNER': {
                    modifiedRecord.hookPayload.message = sn_i18n.Message.getMessage("sys_uib_hook_string", record.hookPayload.message);
                    for (let i = 0; i < record.hookPayload.actions.length; i++) {
                        modifiedRecord.hookPayload.actions[i].buttonText = sn_i18n.Message.getMessage("sys_uib_hook_string", record.hookPayload.actions[i].buttonText);
                    }
                    recordsWithTranslations.push(modifiedRecord);
                    break;
                }
                case 'NOW_MODAL#DUPLICATE_POPUP': {
                    modifiedRecord.hookPayload.message = sn_i18n.Message.getMessage("sys_uib_hook_string", record.hookPayload.message);
                    modifiedRecord.hookPayload.buttonText = sn_i18n.Message.getMessage("sys_uib_hook_string", record.hookPayload.buttonText);
                    recordsWithTranslations.push(modifiedRecord);
                    break;
                }
            }
        }

        return recordsWithTranslations;
    },

    type: 'UIBHook'
});

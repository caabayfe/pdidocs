var dao_AllocationDataDaoUtils = Class.create();
dao_AllocationDataDaoUtils.prototype = {
    initialize: function(table, keyField, entryIdField) {
        this._table = table;
        this._keyField = keyField;
        this._entryIdField = entryIdField;
    },

    /**
     * Persists an entry of allocation data with its associated roles and qualifying data to the database
     *
     * @param {object} entry The entry object containing allocation data to persist
     * @returns {string} The sysId of the entry inserted
     */
    insertAllocatedEntry: function(entry) {
        const gr = new GlideRecord(this._table);
        gr.setWorkflow(false);

        gr.setValue(this._entryIdField, entry[this._keyField]);
        gr.setValue('qualifying_data', JSON.stringify(entry.qualifying_data));
        gr.setValue('assigned_roles', entry.assigned_roles);
        gr.setValue('subscribeable_roles', entry.subscribeable_roles);
        gr.setValue('subscribed_roles', entry.subscribed_roles);
        gr.setValue('unsubscribed_roles', entry.unsubscribed_roles);
        gr.setValue('is_fully_allocated', !entry.is_unallocated);
        return gr.insert();
    },

    type: 'dao_AllocationDataDaoUtils'
};

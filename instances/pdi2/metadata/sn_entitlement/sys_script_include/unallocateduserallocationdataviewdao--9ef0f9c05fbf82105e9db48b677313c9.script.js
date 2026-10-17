var UnallocatedUserAllocationDataViewDao = Class.create();
UnallocatedUserAllocationDataViewDao.prototype = {
    initialize: function() {
        this._table = "sn_entitlement_unallocated_user_allocation_data_view";
    },

    /**
     * returns a stream of a GlideQuery for the selected columns
     * @param {array} columns an array of columns to select and return in the query
     * @returns {Stream} a stream of the query to the configured table providing the passed columns
     */
    getStreamForSelectedColumns: function(columns) {
        return new global.GlideQuery(this._table).select(columns);
    },

    type: 'UnallocatedUserAllocationDataViewDao'
};

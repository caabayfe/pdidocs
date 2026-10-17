var SOWNotifyCommTaskVisibilitySNC = Class.create();
SOWNotifyCommTaskVisibilitySNC.prototype = {
    initialize: function() {},
    TABLES: {
        COMM_TASK: 'comm_task'
    },

    canShowCallsTab: function(recordSysId, table) {
        var gr = new GlideRecordSecure(table);
        if (gr.get(recordSysId) && gr.canRead())
            return true;
        return false;
    },

    canShowSendSMS: function(recordSysId, table) {
        var gr = new GlideRecordSecure(table);
        if (gr.get(recordSysId) && gr.canWrite())
            return true;
        return false;
    },

    handles: function(table) {
        return this._isCommTaskExtension(table);
    },

    _isCommTaskExtension: function(table) {
        var tableHierarchy = new GlideTableHierarchy(table).getTables() || [];
        return tableHierarchy.includes(this.TABLES.COMM_TASK);
    },

    type: 'SOWNotifyCommTaskVisibilitySNC'
};

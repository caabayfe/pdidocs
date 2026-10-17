var SOWNotifyRequestVisibilitySNC = Class.create();
SOWNotifyRequestVisibilitySNC.prototype = {
    initialize: function() {},

    HANDLED_TABLES: ["sc_req_item", "sc_request", "sc_task"],

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
        return (this.HANDLED_TABLES.indexOf(table) != -1);
    },

    type: 'SOWNotifyRequestVisibilitySNC'
};

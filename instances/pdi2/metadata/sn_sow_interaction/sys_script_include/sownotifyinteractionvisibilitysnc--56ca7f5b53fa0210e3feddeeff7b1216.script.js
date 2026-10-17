var SOWNotifyInteractionVisibilitySNC = Class.create();
SOWNotifyInteractionVisibilitySNC.prototype = {
    initialize: function() {},

    HANDLED_TABLES: ["interaction"],

    canShowSendSMS: function(recordSysId, table) {
        var gr = new GlideRecordSecure(table);
        if (gr.get(recordSysId) && gr.getValue("type") != "walkup" && gr.canWrite())
            return true;
        return false;
    },

    handles: function(table) {
        return (this.HANDLED_TABLES.indexOf(table) != -1);
    },

    type: 'SOWNotifyInteractionVisibilitySNC'
};

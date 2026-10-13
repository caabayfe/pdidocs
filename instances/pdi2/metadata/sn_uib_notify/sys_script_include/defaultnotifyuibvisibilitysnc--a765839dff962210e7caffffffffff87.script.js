var DefaultNotifyUIBVisibilitySNC = Class.create();
DefaultNotifyUIBVisibilitySNC.prototype = {
    initialize: function() {},

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
        /*
        	DefaultNotifyUIBVisibilitySNC is the default implementation of sn_uib_collab.ContextualPanelVisibility Glide Extension Point
        	Incase there is no extension point implementation for 'table', this default implementation needs to kick-in, hence returning true.
        */
        return true;
    },

    type: 'DefaultNotifyUIBVisibilitySNC'
};

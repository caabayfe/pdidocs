var NotifyUIBVisibility = Class.create();
NotifyUIBVisibility.prototype = {

    canShowCallsTab: function(recordSysId, table) {
        return false;
    },

    canShowSendSMS: function(recordSysId, table) {
        return false;
    },

    handles: function(table) {
        /*
        	this method is to check if the extension point implementation handles 'table',
        	if true is returned i.e., the table is supported by the implementation and then canLaunchChat can be called
        */
        return false;
    },

    type: 'NotifyUIBVisibility'
};

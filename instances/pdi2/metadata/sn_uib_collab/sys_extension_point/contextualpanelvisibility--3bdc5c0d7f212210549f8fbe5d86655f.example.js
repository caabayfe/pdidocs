var ContextualPanelVisibility = Class.create();
ContextualPanelVisibility.prototype = {

    canLaunchChat: function(recordSysId, table) {
        return [];
    },

    handles: function(table) {
        /*
        	this method is to check if the extension point implementation handles 'table',
        	if true is returned i.e., the table is supported by the implementation and then canLaunchChat can be called
        */
        return false;
    },

    type: 'ContextualPanelVisibility'
};

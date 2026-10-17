var UIRuleTriggerQualifier = Class.create();
UIRuleTriggerQualifier.prototype = {
    getQualifier: function() {
		if(current.parent_table == "sys_sg_view_config")
			return "name=onLoad";
		
		return "";
    },

    type: 'UIRuleTriggerQualifier'
};

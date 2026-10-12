var RibbonSettingChoiceScript = Class.create();
RibbonSettingChoiceScript.prototype = {
    initialize: function() {
    },

	process: function() {
	    return ["sys_user", "customer_contact", "csm_consumer"];
	},
	
    type: 'RibbonSettingChoiceScript'
};

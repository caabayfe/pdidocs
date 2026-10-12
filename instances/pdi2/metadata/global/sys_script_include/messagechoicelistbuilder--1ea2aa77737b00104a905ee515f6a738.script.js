var MessageChoiceListBuilder = Class.create();
MessageChoiceListBuilder.prototype = {
    initialize: function() {
    },

	getStatusChoiceList: function() { 
		return GlideChoiceList.getChoiceList('sys_cs_message', 'status');
	},
	
    type: 'MessageChoiceListBuilder'
};

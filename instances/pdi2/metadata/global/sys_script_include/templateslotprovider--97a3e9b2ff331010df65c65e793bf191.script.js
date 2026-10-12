var TemplateSlotProvider = Class.create();
TemplateSlotProvider.prototype = {
    initialize: function() {
    },
    getFilteredSlotsByTemplateId: function() {
		var templateId = current.view_config.template;
		//return if the templateId value is empty (this causes all template slots to be returned)
		if(!templateId)
			return;

		return 'view_template=' + templateId;
    },
    type: 'TemplateSlotProvider'
};

var SystemRunLevel = Class.create();
SystemRunLevel.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	make_id_value: function(scope0, desc0) {
		var scope = String(this.getParameter('sysparm_scope') || scope0);
		var desc = String(this.getParameter('sysparm_desc') || desc0);

		var regex = /[^0-9a-zA-Z]/g;
		var sanitized_desc = desc.replace(regex, '_').toLowerCase();
		return scope + '.' + sanitized_desc;
	},
	
    type: 'SystemRunLevel'
});

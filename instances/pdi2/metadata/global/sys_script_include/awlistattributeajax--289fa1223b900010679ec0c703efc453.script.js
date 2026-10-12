var AWListAttributeAjax = Class.create();
AWListAttributeAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	
    modifyAttributes: function() {

		var attributesJSON = this.getParameter('sysparm_changedAttributes');
		var changedAttributes = JSON.parse(attributesJSON);
		var values = Object.keys(changedAttributes);
		
		for (var i = 0; i < values.length; i++) {
			var grSubmitAttributes = new GlideRecord('sys_aw_list');
			
			var sysids = changedAttributes[values[i]];
			
			if (!sysids.length)
				continue;
			
			var value = values[i];
		
			if (value === 'delete')
				value = 'NULL';
			if (grSubmitAttributes.canWrite()) {
				grSubmitAttributes.addQuery('sys_id', 'IN', sysids);
				grSubmitAttributes.setValue('list_attributes', value);
				grSubmitAttributes.updateMultiple();
			} else {
				Log.securityWarn("Unauthorized attempt to update list-attributes for sys_aw_list");
			}
			
		}
	},

    type: 'AWListAttributeAjax'
});

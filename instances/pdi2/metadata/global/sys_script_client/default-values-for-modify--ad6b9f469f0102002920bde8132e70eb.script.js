function onChange(control, oldValue, newValue, isLoading) {
	if (isLoading || newValue === '' || g_form.getValue('proposal_type') != 2) {
		return;
	}

	function tagToObj(tag, detectValue) {
		var ans = {};
		var attrs = tag.attributes;
		if (attrs.length == 1 && tag.getAttribute('value')) {
			ans = tag.getAttribute('value');
		} else {
			for (var i = 0; i < attrs.length; i++) {
				var attr = attrs.item(i);
				ans[attr.name] = attr.value;
			}
		}
		return ans;
	}

	function toJson(resp) {
		var ans = {};
		var tags = resp.responseXML.documentElement.childNodes;
		for (var i = 0; i < tags.length; i++) {
			var tag = tags.item(i);
			var tagName = tag.nodeName;
			if (tag.getAttribute('idx')) { //Then this is array
				if (!ans[tagName])
					ans[tagName] = [];
				ans[tagName].push(tagToObj(tag, false));
			} else {
				ans[tagName] = tagToObj(tag, true);
			}
		}
		return ans;
	}

	//Populate Template Values From 'Template to modify'
	ga = new GlideAjax('StdChangeUtils');
	ga.addParam('sysparm_name', 'getTemplNCategoryForModify');
	ga.addParam('sysparm_tableName', 'std_change_record_producer');
	ga.addParam('sysparm_sysid', newValue);
	ga.addParam('add_mandatory_fields', true);
	ga.getXML(function(resp) {
		var parsedResp = toJson(resp);
		if (parsedResp && parsedResp.template && parsedResp.template.trim() !== '') {
			g_form.setValue('template_value', parsedResp.template);
		}
		g_form.setValue('catalog', parsedResp.catalog);
		g_form.setValue('category', parsedResp.category);
		g_form.setValue('template_name', parsedResp.templateName);

		if (parsedResp.hasAttachments === 'true')
			g_form.addInfoMessage('Attachments will be copied over once the proposal has been saved');
	});
}

function onLoad() {
	// mapping of step config ids to their input variables which are related list slushbuckets
	var relatedListSlushbucketInputVars = {
	    '8b84e5e837b1030064a52f3c8e41f170' : ['visible', 'not_visible']
	};

	var stepConfig = g_form.getValue('step_config');
	var inputVarSlushbuckets = relatedListSlushbucketInputVars[stepConfig];

	// check if this is a related list step with slushbucket input vars
	if (typeof inputVarSlushbuckets == 'undefined')
		return;

	var table = gel('sys_atf_step.inputs.var__m_atf_input_variable_' + stepConfig + '.table');
	if (table) {
		// We need to set the onchange in an onLoad client script b/c input var field names are longer than 80 characters
	    var ocf = table.onchange;
	    table.onchange = function() {
	        if (ocf)
	            ocf();

            recalculateRelatedLists();
	    }
	}

	function recalculateRelatedLists() {
		var ga = new GlideAjax('ATFRelatedListUtil');
		ga.addParam('sysparm_name', 'getRelatedLists');
		ga.addParam('sysparm_table', table.value);
		ga.getXMLAnswer(function(answer) {
			if (!answer)
				return;

			var newRelatedLists = JSON.parse(answer);
			for (var i = 0; i < inputVarSlushbuckets.length; i += 1)
				populateSlushbucket(inputVarSlushbuckets[i], newRelatedLists);
		});
	}

	function populateSlushbucket(inputVarFieldName, relatedLists) {
		var fieldId = 'sys_atf_step.inputs.var__m_atf_input_variable_' + stepConfig + '.' + inputVarFieldName;
		g_form.clearOptions(fieldId + '_left');
		g_form.clearOptions(fieldId + '_right');
		var leftBucket = fieldId + '_left';
		for (var l in relatedLists)
			g_form.addOption(leftBucket, relatedLists[l].value, relatedLists[l].label);
	}
}

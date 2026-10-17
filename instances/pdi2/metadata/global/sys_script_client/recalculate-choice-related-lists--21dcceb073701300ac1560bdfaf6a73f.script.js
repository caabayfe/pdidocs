function onLoad() {
	// mapping of step config ids to their input variables which are related list choices
	var relatedListChoiceInputVars = {
		'a69843f2531332007e7829cac2dc34d7' : ['related_list'],
		'7bdce31387400300709861fb97cb0b5a' : ['related_list'],
		'c5f44934532332007e7829cac2dc342e' : ['related_list'],
		'0200ac2fe72003005c85cd19d2f6a942' : ['related_list'],
		'012105620fe2330091d0f00c97767ec4' : ['related_list']
	};

	var stepConfig = g_form.getValue('step_config');
	var inputVarChoices = relatedListChoiceInputVars[stepConfig];

	var isRelatedList = true;

	// check if this is a related list step with choice input vars
	if (typeof inputVarChoices == 'undefined')
		return;

	var relatedListElemDiv = gel('element.sys_atf_step.inputs.var__m_atf_input_variable_' + stepConfig + '.related_list');
	var listTypeElemName = 'sys_atf_step.inputs.var__m_atf_input_variable_' + stepConfig + '.list_type';
	var listTypeElem = gel(listTypeElemName);
	if (listTypeElem) {
		// Set isRelatedList initially and outside of the onChange function for cases where there aren't form changes
		isRelatedList = (listTypeElem.value !== 'list');

		g_event_handlers.push(new GlideEventHandler(
			'onChange_' + listTypeElemName,
			function(control, oldVal, newVal, loading, template) {
				isRelatedList = (newVal !== 'list');

				// Adjustment of visibility of variables during 'onLoad' and 'onChange'

				// Don't show the related list when we don't have a related list
				if (isRelatedList)
					relatedListElemDiv.style.display = '';
				else
					relatedListElemDiv.style.display = 'none';

				if (loading) return;  // skip the part that should be called only for onChange - Ignore the event which GlideEventHandler generates during the initial loading of the form
				// Pure 'onChange'
				setRelatedListTable();
			},
			listTypeElemName
		));
	}

	// get rid of the -- None -- option
	for (var i = 0; i < inputVarChoices.length; i += 1)
		g_form.removeOption('sys_atf_step.inputs.var__m_atf_input_variable_' + stepConfig + '.' + inputVarChoices[i], '');

	var tableElem = gel('sys_atf_step.inputs.var__m_atf_input_variable_' + stepConfig + '.table');
	if (tableElem) {
		// We need to set the onchange in an onLoad client script b/c input var field names are longer than 80 characters
		var tableElemOnchange = tableElem.onchange;
		tableElem.onchange = function() {
			if (tableElemOnchange && typeof tableElemOnchange === 'function')
				tableElemOnchange();

			recalculateRelatedLists();
		};
	}

	var relatedListElem = gel('sys_atf_step.inputs.var__m_atf_input_variable_' + stepConfig + '.related_list');
	if (relatedListElem) {
		var relatedListElemOnchange = relatedListElem.onchange;
		relatedListElem.onchange = function() {
			if (relatedListElemOnchange && typeof relatedListElemOnchange === 'function')
				relatedListElemOnchange();

			setRelatedListTable();
		};
	}

	// hide the related list table input variable
	var relatedListTableDiv = gel('element.sys_atf_step.inputs.var__m_atf_input_variable_' + stepConfig + '.related_list_table');
	if (relatedListTableDiv)
		relatedListTableDiv.setAttribute('style', 'display:none');

	// if this is a new record and 'table' has been pre-populated, trigger the
	// dependent value calculation
	var tableDiv = gel('sys_atf_step.inputs.var__m_atf_input_variable_' + stepConfig + '.table');
	if (g_form.isNewRecord() && tableDiv && tableDiv.value)
		setRelatedListTable();

	function recalculateRelatedLists() {
		var ga = new GlideAjax('ATFRelatedListUtil');
		ga.addParam('sysparm_name', 'getRelatedLists');
		ga.addParam('sysparm_table', tableElem.value);
		ga.getXMLAnswer(function(answer) {
			if (!answer)
				return;

			var newRelatedLists = JSON.parse(answer);
			for (var i = 0; i < inputVarChoices.length; i += 1)
				populateChoices(inputVarChoices[i], newRelatedLists);

			setRelatedListTable();
		});
	}

	function populateChoices(inputVarFieldName, relatedLists) {
		var fieldId = 'sys_atf_step.inputs.var__m_atf_input_variable_' + stepConfig + '.' + inputVarFieldName;
		g_form.clearOptions(fieldId);
		for (var l in relatedLists)
			g_form.addOption(fieldId, relatedLists[l].value, relatedLists[l].label);
	}

	function setRelatedListTable() {
		var relatedListTableId = 'sys_atf_step.inputs.var__m_atf_input_variable_' + stepConfig + '.related_list_table';

		// Since the documentId record depends on the relatedListTable,
		// this must be set even if related list is not
		if (!isRelatedList) {
			g_form.setValue(relatedListTableId, tableElem.value);
			return;
		}

		var relatedListValue = relatedListElem.value;
		if (!relatedListValue)
			return;

		if (relatedListValue.indexOf("REL:") === 0) {
			var ga = new GlideAjax('ATFRelatedListUtil');
			ga.addParam('sysparm_name', 'getRelationshipTableName');
			ga.addParam('sysparm_relationship_id', relatedListValue.slice(4));
			ga.getXMLAnswer(function(answer) {
				g_form.setValue(relatedListTableId, answer);
			});
		} else
			g_form.setValue(relatedListTableId, relatedListValue.split('.')[0]);
	}
}

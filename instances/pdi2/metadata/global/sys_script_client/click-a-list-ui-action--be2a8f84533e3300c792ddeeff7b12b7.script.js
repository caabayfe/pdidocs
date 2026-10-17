function onLoad() {

	var stepConfigId = g_form.getValue('step_config');
	if (stepConfigId != 'c5f44934532332007e7829cac2dc342e') // Click a List UI Action
		return;

	var msgMap = new GwtMessage().getMessages(['-- None --', 'Single record', 'All records visible on the first page',
		'List banner button', 'List bottom button', 'List context menu', 'List choice', 'List link']);

	var inputVarPrfx = 'sys_atf_step.inputs.var__m_atf_input_variable_' + stepConfigId;
	var relatedListTableInputVar = inputVarPrfx + '.related_list_table';
	var listActionInputVar = inputVarPrfx + '.list_action';
	var actionTypeInputVar = inputVarPrfx + '.action_type';
	var applyToInputVar = inputVarPrfx + '.apply_to';
	var recordIdInputVar = inputVarPrfx + '.record_id';
	var assertTypeInputVar = inputVarPrfx + '.assert_type';

	var allApplyToChoices = ['', 'single_record', 'all_records'];
	var applyToMap = {
		'list_banner_button': allApplyToChoices,
		'list_bottom_button': allApplyToChoices,
		'list_context_menu': ['single_record'], // context menu UI actions only apply to one record
		'list_choice': ['single_record', 'all_records'], // list choice UI actions apply to one or more records
		'list_link': allApplyToChoices
	};
	var applyToMsgMap = {
		'': '-- None --',
		'single_record': 'Single record',
		'all_records': 'All records visible on the first page',
	};

	function relatedListTableOnchange(control, oldVal, newVal, loading, template) {
		if (loading)
			return;

		// clear out the previously selected UI action/Record ID when the related list changes
		g_form.setValue(listActionInputVar, '');
		g_form.setValue(recordIdInputVar, '');
	}

	function listActionOnchange(control, oldVal, newVal, loading, template) {
		var noUIAction = false;
		if (!newVal)
			noUIAction = true;

		var gr = new GlideRecord('sys_ui_action');
		if (!gr.get(newVal))
			noUIAction = true;

		// populate the action type based on the chosen list UI action
		var curr = g_form.getValue(actionTypeInputVar);
		g_form.clearOptions(actionTypeInputVar);
		if (noUIAction || gr.list_banner_button === "true")
			g_form.addOption(actionTypeInputVar, 'list_banner_button', msgMap['List banner button']);
		if (noUIAction || gr.list_button === "true")
			g_form.addOption(actionTypeInputVar, 'list_bottom_button', msgMap['List bottom button']);
		if (noUIAction || gr.list_context_menu === "true")
			g_form.addOption(actionTypeInputVar, 'list_context_menu', msgMap['List context menu']);
		if (noUIAction || gr.list_choice === "true")
			g_form.addOption(actionTypeInputVar, 'list_choice', msgMap['List choice']);
		if (noUIAction || gr.list_link === "true")
			g_form.addOption(actionTypeInputVar, 'list_link', msgMap['List link']);

		// set the action type to readonly if theres only one option
		var numOptions = g_form.getControl(actionTypeInputVar).options.length;
		g_form.setReadonly('action_type', numOptions === 1);

		// server side UI actions always reload the page (unless the 'No records selected' message appears)
		var assertTypeToSet = (gr && gr.client === "false") ? 'page_reloaded_or_redirected' : '';
		g_form.setValue(assertTypeInputVar, assertTypeToSet);
	}

	function actionTypeOnchange(control, oldVal, newVal, loading, template) {
		var applyToOptions = applyToMap[newVal];
		if (!applyToOptions)
			return;

		var curr = g_form.getValue(applyToInputVar);
		g_form.clearOptions(applyToInputVar);
		for (var i = 0; i < applyToOptions.length; i += 1) {
			var opt = applyToOptions[i];
			g_form.addOption(applyToInputVar, opt, msgMap[applyToMsgMap[opt]]);
		}

		// if there's only one valid option, make the field read only
		g_form.setReadOnly('apply_to', applyToOptions.length === 1);
	}

	function applyToOnchange(control, oldVal, newVal, loading, template) {
		var recordIdContainerDiv = gel("element." + recordIdInputVar);
		if (!recordIdContainerDiv)
			return;

		// only show the record picker if the UI action is going to be applied to a single record
		var isSingleRecord = newVal == 'single_record';
		if (isSingleRecord) {
			recordIdContainerDiv.style.display = '';
			g_form.setMandatory('record_id', true);
		} else {
			recordIdContainerDiv.style.display = 'none';
			g_form.setMandatory('record_id', false);
			// clear out the record_id if the UI action isn't applying to a single record
			g_form.setValue(recordIdInputVar, '');
		}
	}

	function assertTypeOnchange(control, oldVal, newVal, loading, template) {
		// only show the timeout if assert type is set to page_reloaded_or_redirected
		var showTimeout = newVal == 'page_reloaded_or_redirected';
		g_form.setVisible('timeout', showTimeout);
	}

	// register the onchange handlers after the page loads
	addAfterPageLoadedEvent(function() {
		g_event_handlers.push(new GlideEventHandler('onChange_' + relatedListTableInputVar, relatedListTableOnchange, relatedListTableInputVar));
		g_event_handlers.push(new GlideEventHandler('onChange_' + listActionInputVar, listActionOnchange, listActionInputVar));
		g_event_handlers.push(new GlideEventHandler('onChange_' + actionTypeInputVar, actionTypeOnchange, actionTypeInputVar));
		g_event_handlers.push(new GlideEventHandler('onChange_' + applyToInputVar, applyToOnchange, applyToInputVar));
		g_event_handlers.push(new GlideEventHandler('onChange_' + assertTypeInputVar, assertTypeOnchange, assertTypeInputVar));

		if (g_form.isNewRecord())
			g_form.setValue("timeout", "0 00:00:05");
		else {
			var savedUIAction = g_form.getValue(listActionInputVar);
			var savedActionType = g_form.getValue(actionTypeInputVar);
			var savedApplyTo = g_form.getValue(applyToInputVar);
			var savedRecordId = g_form.getValue(recordIdInputVar);
			var savedAssertType = g_form.getValue(assertTypeInputVar);

			g_form.setValue(listActionInputVar, savedUIAction);
			// if the saved action type value is still a valid option, set the value
			if (g_form.getOption(actionTypeInputVar, savedActionType))
				g_form.setValue(actionTypeInputVar, savedActionType);

			// if the saved apply to value is still a valid option, set the value
			if (g_form.getOption(applyToInputVar, savedApplyTo))
				g_form.setValue(applyToInputVar, savedApplyTo);

			// set record ID if there was one saved and 'single_record' is still the selected option
			if (savedRecordId && g_form.getValue(applyToInputVar) === 'single_record')
				g_form.setValue(recordIdInputVar, savedRecordId);
			else
				g_form.setValue(recordIdInputVar, '');

			g_form.setValue(assertTypeInputVar, savedAssertType);
		}
	});

}

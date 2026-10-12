(function() {
	var tableName = options.tableName;
	var sysId = options.sysId;

	var record = sn_std_tkt_api.TicketConfig.getTicketRecord(tableName, sysId);

	if (!record || !record.isValidRecord()) {
		return;
	}

	var actions = sn_std_tkt_api.TicketConfig.getActions(record);

	function createSection(actionInputs, _view) {
		return {
			"layout": "normal",
			"_bootstrap_cells": 12,
			"_count": 1,
			"visible": true,
			"columns": [
				{
					"fields": _view
				}
			],
			"name": "",
			"caption": "",
			"id": "",
			"type": "container"
		};
	}

	function createView(actionInput) {
		return {
			'name': actionInput.name,
			'type': 'field'
		};
	}

	function createField(actionInput) {
		return {
			'name': actionInput.name,
			'label': actionInput.label,
			'type': actionInput.type,
			'mandatory': actionInput.mandatory,
			'visible': true,
			'readonly': false,
			'ed': {
				'name': actionInput.name
			},
			'choice': actionInput.choice,
			'choices': actionInput.choices,
			'value': actionInput.value || ''
		};
	}

	var actionButton = {};
	//TODO: Move the formModel creation to the client script eventually
	for (var i in actions) {
		var action = actions[i];

		if (action.sys_id !== options.actionId) {
			continue;
		}

		actionButton.label = action.name.display_value || action.name.value;
		actionButton.id = action.sys_id;
		actionButton.userInputs = action.has_user_inputs;
		if (actionButton.userInputs) {
			var actionInputs = action.action_inputs;
			var formModel = {};
			formModel.sys_id = actionButton.id;
			formModel._fields = {};
			formModel._view = [];
			formModel._sections = [];
			formModel.client_script = {};
			formModel.policy = [];

			for (var actionInputIdx in actionInputs) {
				var actionInput = actionInputs[actionInputIdx];
				formModel._fields[actionInput.name] = createField(actionInput);
				formModel._view.push(createView(actionInput));
			}

			formModel._sections.push(createSection(actionInputs, formModel._view));
			actionButton.formModel = formModel;
		}

		break;
	}

	data.action_button = actionButton;
})();

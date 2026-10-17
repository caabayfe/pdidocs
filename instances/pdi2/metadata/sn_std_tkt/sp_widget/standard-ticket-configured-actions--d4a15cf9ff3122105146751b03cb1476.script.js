(function() {
	//Subsequent calls should have the primary ticket and not the UR
	var tableName;
	var sysId;
	if (input) {
		tableName = input.tableName;
		sysId = input.recordId;
	} else {
		tableName = $sp.getParameter('table');
		sysId = $sp.getParameter('sys_id');
	}

	if (input && input.server_action === 'trigger_action') {
		data.actionModal = $sp.getWidget('widget-modal', {
			embeddedWidgetId: 'std-ticket-actions-modal',
			embeddedWidgetOptions: {
				tableName: tableName,
				sysId: sysId,
				actionId: input.actionId
			},
			backdrop: 'static',
			keyboard: false,
			size: 'md'
		});

		return;
	}

	if (input && input.server_action === 'execute_action') {
		var actionId = input.actionId;
		if (GlideStringUtil.isEligibleSysID(actionId)) {
			var formData = input.formData || {};

			var taskRecord = sn_std_tkt_api.TicketConfig.getTicketRecord(tableName, sysId);
			var output = sn_std_tkt_api.TicketConfig.executeAction(taskRecord, actionId, formData);

			var response = {};
			if (output.result && output.message) {
				response.liveMessage = output.message.liveMessage;
				var message = output.message;
				if (message.type === 'info') {
					gs.addInfoMessage(message.value);
				} else if (message.type === 'error') {
					gs.addErrorMessage(message.value);
				}
			}
			response.result = output.result;
			return response;
		}

		return {
			'error': true
		};
	}

	var record = getActualRecord(tableName, sysId);

	if (!record || !record.isValidRecord())
		return;

	var actions = sn_std_tkt_api.TicketConfig.getActions(record);
	var actionButtons = [];
	for (var i in actions) {
		var action = actions[i];
		var actionButton = {};
		actionButton.label = action.name.display_value || action.name.value;
		actionButton.id = action.sys_id;
		actionButton.userInputs = action.has_user_inputs;
		actionButtons.push(actionButton);
	}
	data.resolvedTableName = record.getRecordClassName();
	data.resolvedRecordId = record.getUniqueValue();
	data.action_buttons = actionButtons;

	function getActualRecord(tableName, sysId) {
		if (tableName === 'universal_request') {
			var universalRequestRecord = sn_std_tkt_api.TicketConfig.getTicketRecord(tableName, sysId);
			if (!universalRequestRecord || !universalRequestRecord.isValidRecord())
				return null;

			var actualRecordId = universalRequestRecord.getValue('primary_task');
			return sn_std_tkt_api.TicketConfig.getTicketRecord('task', actualRecordId);

		} else {
			return sn_std_tkt_api.TicketConfig.getTicketRecord(tableName, sysId);
		}
	}
})();

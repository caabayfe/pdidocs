function transform(input) {
	var advanced = input.advanced || {};

	var declarativeModel = {};
	if (
		input.activityState &&
		advanced.activityType &&
		input.laneContext &&
		input.laneContext.state
	) {
		declarativeModel = {
			state: advanced.inUIBuilder ? input.activityState : input.activityState.value,
			type: advanced.activityType.value,
			sysId: input.associatedRecord,
			table: input.associatedTable,
			parentTable: input.parentTable,
			parentSysId: input.parentRecord,
			contextId: advanced.contextId,
			stage_name: input.laneContext.name,
			stage_title: input.laneContext.title,
			stage_status: input.laneContext.state.value,
			stage_order: input.laneContext.order,
			playbook_status:
				input.playbookContext && input.playbookContext.state,
			playbook_context_id:
				input.playbookContext && input.playbookContext.contextId,
			model_id: "ca57d12e730333004a905ee515f6a7b2",
		};

		advanced.authorizedActions.forEach(function(action) {
			if (typeof action === "string")
				declarativeModel["can_" + action] = true;
		});

		for (var key in input.experienceProperties) {
			var value = input.experienceProperties[key].value;
			// special handling for list type activity type
			if (
				advanced.activityType.value ===
					"fdbeceb95b61001070e4492c11f91a28" &&
				key === "table"
			)
				key = "list_table";

			declarativeModel[key] = value;
		}
	}

	return declarativeModel;
}

function transform(input) {
	function getActivityState(activityState, inUIBuilder){
		if(!inUIBuilder)
			return activityState;

		var label = new GlideChoiceList.getChoiceList('sys_playbook_experience_state_to_status', 'activity_card_value').getChoice(activityState).getLabel();

		return {
			displayValue: label,
			value: activityState
		};
	}

	function getExpand(expand, activityState, inUIBuilder) {
		if(!inUIBuilder)
			return expand;

		if(activityState.value != 'IN_PROGRESS')
			return false;

		return true;
	}

	input.experienceProperties = input.experienceProperties || {};
	input.advanced = input.advanced || {};
	
	var inUIBuilder = input.advanced.inUIBuilder;
	var associatedSysId = input.associatedRecord;
	var associatedTable = input.associatedTable;
	var activityLabel = input.activityLabel;
	var activityState = getActivityState(input.activityState, inUIBuilder);
	var assignedTo = input.assignedTo;
	var prioritized = input.prioritized;
	var fillContainer = input.fillContainer;
	var configProperties = input.configProperties;

	var pending_title = input.experienceProperties.pending_title || {};
	var pending_description =
		input.experienceProperties.pending_description || {};
	var title = input.experienceProperties.title || {};
	var footer = input.experienceProperties.footer;
	var is_automated = input.experienceProperties.is_automated || {};
	var show_sla = input.experienceProperties.show_sla || {};
	var tagline = input.experienceProperties.tagline || {};
	var icon = input.experienceProperties.icon || {};

	var declarativeActions = input.advanced.declarativeActions;
	var declarativeModel = input.advanced.declarativeModel;
	var contextId = input.advanced.contextId;
	var filterData = input.advanced.filterData;
	var loading = input.advanced.loading;
	var userSession = input.advanced.userSession;
	
	var expandOnMountOrChange = getExpand(input.advanced.expandOnMountOrChange, activityState, inUIBuilder);

	var heading = null;
	if (activityLabel) {
		heading = { label: activityLabel };
	}
	if (title.value) {
		heading = { label: title.value };
	}

	var taglineValue = {};
	if (tagline.value || icon.value) {
		taglineValue = {
			label: tagline.value || "",
			icon: icon.value || "",
		};
	}

	var pendingTitle = null;
	if (pending_title.value) {
		pendingTitle = pending_title.value;
	} else if (title.value) {
		pendingTitle = title.value;
	} else if (activityLabel) {
		pendingTitle = activityLabel;
	}

	var formApi = input.advanced.formApi;

	return {
		associatedTable: associatedTable || null,
		associatedSysId: associatedSysId || null,
		heading: heading,
		tagline: taglineValue,
		pendingDescription: pending_description.value || null,
		declarativeActions: declarativeActions,
		declarativeModel: declarativeModel,
		activityState: activityState,
		pendingTitle: pendingTitle,
		loading: loading,
		contextId: contextId,
		configProperties: configProperties,
		cardFooter: footer,
		filterData: filterData,
		assignedTo: assignedTo,
		showSla: show_sla.value === "1",
		isAutomated: is_automated.value === "1",
		prioritized: prioritized,
		expandOnMountOrChange: expandOnMountOrChange,
		userSession: userSession,
		fillContainer: fillContainer,
		formFieldItems: inUIBuilder ? ["UIB Placeholder"] : input.formFieldItems,
		formFieldsRequired: inUIBuilder ? true : input.formFieldsRequired,
		dispatchDeclarativeAction: formApi && formApi.dispatchDeclarativeAction,
		modalDeclarativeAction: formApi && formApi.modalDeclarativeAction
	};
}

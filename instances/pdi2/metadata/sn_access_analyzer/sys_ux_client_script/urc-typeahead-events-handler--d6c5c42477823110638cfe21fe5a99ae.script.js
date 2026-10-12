/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
	const eventName = event.name;
	const COMPONENT_DR_MAP = {
		"urcBaseUser": "base_user_typeahead_resources",
		"urcModelUser": "model_user_typeahead_resources"
	};

	switch (eventName) {
		case "NOW_TYPEAHEAD#VALUE_SET":
			handleValueSetEvent();
			break;
		case "NOW_TYPEAHEAD#SELECTED_ITEM_SET":
			handleSelectedItemSetEvent();
			break;
	}


	function handleValueSetEvent() {
		const typedValue = event.payload.value;
		const componentId = event.elementId;
		const typeaheadDR = COMPONENT_DR_MAP[componentId];
		
		const compareUsersTabClone = { ...api.state.compareUsersTab };
		compareUsersTabClone[componentId].typedValue = typedValue;
		api.setState("compareUsersTab", compareUsersTabClone);

		const typeaheadDRBindParamsClone = { ...api.state.typeaheadDRBindParams };
		typeaheadDRBindParamsClone[typeaheadDR].value = typedValue;
		api.setState("typeaheadDRBindParams", typeaheadDRBindParamsClone);
		api.data[typeaheadDR].refresh();
	}

	function handleSelectedItemSetEvent() {
		const typedValue = event.payload.value;
		const componentId = event.elementId;
		const compareUsersTabClone = { ...api.state.compareUsersTab };
		compareUsersTabClone[componentId].selectedId = typedValue;
		api.setState("compareUsersTab", compareUsersTabClone);
	}

}

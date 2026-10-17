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
		"uacBaseUser": "base_user_typeahead_resources",
		"uacModelUser": "model_user_typeahead_resources",
		"uacTable": "uac_table_typeahead_resources",
		"uacRecord": "uac_record_typeahead_resources",
		"uacField": "uac_field_typeahead_resources"
	};

	switch (eventName) {
		case "NOW_TYPEAHEAD#VALUE_SET":
			handleValueSetEvent();
			break;
		case "NOW_TYPEAHEAD#SELECTED_ITEM_SET":
			handleSelectedItemSetEvent();
			break;
		case "NOW_TYPEAHEAD#LIST_VISIBLE":
			handleListVisibleEvent();
			break;
	}


	function handleValueSetEvent() {
		const typedValue = event.payload.value;
		const componentId = event.elementId;
		const typeaheadDR = COMPONENT_DR_MAP[componentId];

		const compareAccessTabClone = { ...api.state.compareAccessTab };
		compareAccessTabClone[componentId].typedValue = typedValue;
		api.setState("compareAccessTab", compareAccessTabClone);
		
		const typeaheadDRBindParamsClone = { ...api.state.typeaheadDRBindParams };
		if (typeaheadDR === "uac_record_typeahead_resources") {
			typeaheadDRBindParamsClone[typeaheadDR].encodedQuery = getRecordEncodedQuery(typedValue);
		} else {
			typeaheadDRBindParamsClone[typeaheadDR].value = typedValue;
		}
		api.setState("typeaheadDRBindParams", typeaheadDRBindParamsClone);
		api.data[typeaheadDR].refresh();
	}

	function handleSelectedItemSetEvent() {
		const componentId = event.elementId;
		const selectedItemId = event.payload.value;

		const compareAccessTabClone = { ...api.state.compareAccessTab };
		compareAccessTabClone[componentId].selectedId = selectedItemId;
		api.setState("compareAccessTab", compareAccessTabClone);

		const typeaheadDR = COMPONENT_DR_MAP[componentId];
		if (typeaheadDR === "uac_table_typeahead_resources") {
			resetStatesOnTableSet(compareAccessTabClone, selectedItemId);
		}
	}

	function handleListVisibleEvent() {
		const componentId = event.elementId;
		const typeaheadDR = COMPONENT_DR_MAP[componentId];
		if (typeaheadDR !== "uac_record_typeahead_resources") {
			return;
		}
		if (api.state.typeaheadDRBindParams[typeaheadDR].encodedQuery !== null) {
			return;
		}
		
		const typeaheadDRBindParamsClone = { ...api.state.typeaheadDRBindParams };
		typeaheadDRBindParamsClone[typeaheadDR].encodedQuery = getRecordEncodedQuery();
		api.setState("typeaheadDRBindParams", typeaheadDRBindParamsClone);
		api.data[typeaheadDR].refresh();
	}

	function resetStatesOnTableSet(compareAccessTabClone, selectedTable) {
		compareAccessTabClone.uacRecord.selectedId = null;
		compareAccessTabClone.uacRecord.typedValue = null;
		compareAccessTabClone.uacField.selectedId = null;
		compareAccessTabClone.uacField.typedValue = null;
		api.setState("compareAccessTab", compareAccessTabClone);

		const typeaheadDRBindParamsClone = { ...api.state.typeaheadDRBindParams };
		typeaheadDRBindParamsClone.uac_record_typeahead_resources.table = selectedTable;
		typeaheadDRBindParamsClone.uac_record_typeahead_resources.encodedQuery = null;
		typeaheadDRBindParamsClone.uac_table_metadata_resources.table = selectedTable;
		typeaheadDRBindParamsClone.uac_field_typeahead_resources.table = selectedTable;
		typeaheadDRBindParamsClone.uac_field_typeahead_resources.value = null;
		api.setState("typeaheadDRBindParams", typeaheadDRBindParamsClone);

		api.data.uac_table_metadata_resources.refresh();
		api.data.uac_field_typeahead_resources.refresh();
	}

	function getRecordEncodedQuery(typedValue = "") {
		const tableDisplayField = api.data.uac_table_metadata_resources.result._table_metadata.displayValue;
		return `${tableDisplayField}STARTSWITH${typedValue}`;
	}
}

/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
	const currentTabIndex = api.state.currentTabIndex;
	const recordId = event.payload.sys_id;
	const recordDisplayValue = event.payload.row.displayValue.value;

	if (currentTabIndex === 0) {
		api.setState("selectedRecord", recordId);
		api.setState("selectedRecordDisplayVal", recordDisplayValue);
	}
	
	if (currentTabIndex === 2) {
		const compareAccessTabClone = { ...api.state.compareAccessTab };
		compareAccessTabClone.uacRecord.selectedId = recordId;
		compareAccessTabClone.uacRecord.typedValue = recordDisplayValue;
		api.setState("compareAccessTab", compareAccessTabClone);
	}
	
	api.emit('MODAL_SELECTED', {
			modalId: "[component-id$='select_record_modal']",
			showModal: false
		});
}

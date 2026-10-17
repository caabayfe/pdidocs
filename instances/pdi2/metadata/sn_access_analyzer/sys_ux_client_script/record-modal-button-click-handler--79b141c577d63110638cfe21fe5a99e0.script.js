/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
	const currentTabIndex = api.state.currentTabIndex;

	switch (currentTabIndex) {
		case 0:
			handleEAModalButtonClick();
			break;
		case 2:
			handleUACModalButtonClick();
			break;
	}

	function handleEAModalButtonClick() {
		if (api.state.selectedTable === null) {
			return;
		}
		const recordModalClone = { ...api.state.recordModal };
		recordModalClone.tableLabel = api.state.selectedTableDisplayVal;
		recordModalClone.tableName = api.state.selectedTable;
		api.setState("recordModal", recordModalClone);

		openRecordModal();
	}

	function handleUACModalButtonClick() {
		if (api.state.compareAccessTab.uacTable.selectedId === null) {
			return;
		}
		const recordModalClone = { ...api.state.recordModal };
		recordModalClone.tableLabel = api.state.compareAccessTab.uacTable.typedValue;
		recordModalClone.tableName = api.state.compareAccessTab.uacTable.selectedId;
		api.setState("recordModal", recordModalClone);

		openRecordModal();
	}

	function openRecordModal() {
		api.emit('MODAL_SELECTED', {
			modalId: "[component-id$='select_record_modal']",
			showModal: true,
			displayOptions: {
				size: "lg"
			},
			bare: true,
			viewportElementId: null,
			viewportRoute: null,
			viewportFields: null
		});
	}
}

/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const selectedItem = event.payload[event.payload.length - 1];
    if (!selectedItem) {
        return;
    }
    const selectedFieldName = selectedItem[selectedItem.length - 1].id;
    api.setState('listSelectorSelectedItems', [selectedItem]); // Only one item can be selected

    let activityForm = { ...api.state.activityForm
    };
    const breakdownValue = [];
    const labels = [];
    for (const item of selectedItem) {
        breakdownValue.push(item.id);
        labels.push(item.label);
    }
    if (breakdownValue.length > 0) {
        api.setState('selectedActivityValues',[]);
        activityForm.fields.relation.selectedValue = null;
        activityForm.fields.dotWalkInput.value = breakdownValue.join('.');
        activityForm.fields.activityValues.selectedValues = [];
        activityForm.fields.activityValues.selectedValuesLabels = [];
        activityForm.fields.name.value = labels.join(' ');
    } else {
        activityForm.fields.dotWalkInput.value = '';
    }
    const dotwalklevel = breakdownValue.length;
    let selectedFieldTable = '';

    if (dotwalklevel == 1) {
        selectedFieldTable = api.state.selectedEntity.table.value;
    } else if (api.state.selectedADTables.length >= dotwalklevel) {
        selectedFieldTable = api.state.selectedADTables[dotwalklevel - 1];
        if (selectedFieldTable == 'root') {
            selectedFieldTable = api.state.selectedEntity.table.value;
        }
    } else {
        selectedFieldTable = api.state.listSelectorCurrentTable;
    }
    //Set reference table for dot walk field which is needed in field details success handler
    api.state.activityForm.fields.dotWalkInput.table = selectedFieldTable;
    api.setState('activityForm', activityForm);
    api.data.get_activity_field_details.execute({
        tableName: selectedFieldTable,
        field: breakdownValue[breakdownValue.length - 1],
    });


}

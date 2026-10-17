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
    let breakdownForm = { ...api.state.breakdownForm
    };
    breakdownForm.fields.hasFilter.value = false;
    breakdownForm.fields.filter.value = '';
    breakdownForm.fields.filter.partial = false;
    breakdownForm.fields.displayName.value = '';
    const breakdownValue = [];
    for (const item of selectedItem) {
        breakdownValue.push(item.id);
    }
    breakdownForm.fields.field.value = breakdownValue.join('.');
    api.setState('breakdownForm', breakdownForm);
    api.data.get_selected_breakdown_field_details.execute({
        tableName: api.state.listSelectorCurrentTable,
        field: selectedFieldName,
    });
    const classificationFields = api.state.classificationFields.map((item) => {
            return {
                ...item,
                selected: false
            };
    });
    api.setState('classificationFields', classificationFields);
}

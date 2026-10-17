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
    const fields = api.state.classificationFields;
    const selectedPill = event.context.item.value.id;
    const selectedPillLabel = event.context.item.value.label.split(" → ");

    let classificationFields = fields.map((item) => {
        if (event.context.item.value.id == item.id) {
            return {
                ...item,
                selected: event.payload.value
            };
        }
        return {
            ...item,
            selected: false
        };
    });

    let multipleBreakdownsSelector = { ...api.state.multipleBreakdownsSelector
    };
    const listSelectorSelectedItems = [];
    multipleBreakdownsSelector.fields = [];
    if (event.payload.value) {
        multipleBreakdownsSelector.fields.push(event.context.item.value.field);
        const dotwalkedFields = [];
        multipleBreakdownsSelector.fields.push(selectedPill);
        let i = 0;
        for (const item of selectedPill.split('.')) {
            dotwalkedFields.push({
                id: item,
                label: selectedPillLabel[i]
            });
            i++;
        }
        listSelectorSelectedItems.push(dotwalkedFields);
    } else {
        const filteredFields = multipleBreakdownsSelector.fields.filter(field => field != selectedPill);
        multipleBreakdownsSelector.fields = filteredFields;
    }
    api.setState('listSelectorSelectedItems', listSelectorSelectedItems);
    api.setState('multipleBreakdownsSelector', multipleBreakdownsSelector);
    api.setState('classificationFields', classificationFields);
    const selectedItem = selectedPill;
    const selectedFieldName = selectedPill;
    let breakdownForm = { ...api.state.breakdownForm
    };
    breakdownForm.fields.hasFilter.value = false;
    breakdownForm.fields.filter.value = '';
    breakdownForm.fields.filter.partial = false;
    breakdownForm.fields.displayName.value = '';

    breakdownForm.fields.field.value = selectedFieldName;
    api.setState('breakdownForm', breakdownForm);
    api.data.get_selected_breakdown_field_details.execute({
        tableName: api.state.listSelectorCurrentTable,
        field: selectedFieldName,
    });
}

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
        return item;
    });

    let multipleBreakdownsSelector = { ...api.state.multipleBreakdownsSelector
    };
    const listSelectorSelectedItems = [...api.state.listSelectorSelectedItems];
    if (event.payload.value) {
        if(selectedPill){
            multipleBreakdownsSelector.fields.push(selectedPill);
        }
        const dotwalkedFields = [];
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
}

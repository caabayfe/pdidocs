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
    const listSelectorCurrentTable = api.state.listSelectorCurrentTable;
    const { selectedEntity, SOURCE_TYPES } = api.state;
    const selectedEntityName = selectedEntity.table.value;
    let fields = event.payload.data.output.data.snPo.GlidePromin.prominAllowedColumnList.fields;
    fields = fields.sort((a, b) => {
        return a.label.localeCompare(b.label);
    });
    const { GLIDE_DATE_TIME, REFERENCE, STRING, INTEGER } = api.state.INTERNAL_TYPES;
    const { ACTIVITY_FORM, BREAKDOWNS_LIST, BREAKDOWN_FORM } = api.state.VIEWS;
    const currentView = { ...api.state.currentView };
    if (currentView.view === ACTIVITY_FORM) {
        const { DEFAULT, DATE_TIME } = api.state.ACTIVITY_TYPES;
        const activityForm = { ...api.state.activityForm };
        if (activityForm.fields.type.selectedValue === DEFAULT) {
            if (selectedEntity.source_type.value === SOURCE_TYPES.ARCHIVED_DATA || selectedEntity.source_type.value === SOURCE_TYPES.EXTERNAL_DATA) {
                fields = fields.filter(f => f.internalType !== GLIDE_DATE_TIME && f.internalType !== INTEGER);
            } else {
                fields = fields.filter(f => f.internalType !== GLIDE_DATE_TIME && f.internalType !== STRING && f.internalType !== INTEGER);
            }
        } else if (activityForm.fields.type.selectedValue === DATE_TIME) {
            fields = fields.filter(f => f.internalType === GLIDE_DATE_TIME || f.internalType === REFERENCE);
        }
    }

    if (listSelectorCurrentTable === selectedEntityName) {
        const listSelectorItems = {...api.state.listSelectorItems};
        listSelectorItems['root'] = {};
        for (const field of fields) {
            listSelectorItems['root'][field.name] = {
                id: field.name,
                label: field.label,
                internalType: field.internalType,
            };
            if (field.referenceTable) {
                listSelectorItems['root'][field.name].reference = field.referenceTable;
            }
        }
        api.setState('listSelectorItems', listSelectorItems);
    } else {
        const listSelectorItems = {...api.state.listSelectorItems};
        listSelectorItems[listSelectorCurrentTable] = {};
        for (const field of fields) {
            listSelectorItems[listSelectorCurrentTable][field.name] = {
                id: field.name,
                label: field.label,
                internalType: field.internalType,
            };
            if (field.referenceTable) {
                listSelectorItems[listSelectorCurrentTable][field.name].reference = field.referenceTable;
            }
        }
        api.setState('listSelectorItems', listSelectorItems);
    }
}

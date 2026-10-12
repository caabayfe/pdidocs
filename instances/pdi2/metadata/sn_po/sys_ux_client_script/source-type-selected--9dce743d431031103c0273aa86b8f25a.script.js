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
    const {
        TABLE,
        EXTERNAL_DATA,
        REPORT_SOURCE,
        ARCHIVED_DATA,
    } = api.state.SOURCE_TYPES;
    const entityForm = { ...api.state.entityForm
    };
    entityForm.fields.entity.listItems = [];
    entityForm.fields.entity.selectedValue = null;
    entityForm.fields.entity.inputValue = null;
    entityForm.fields.entity.tableName = '';
    entityForm.fields.sourceField.selectedValue = null;
    entityForm.fields.sourceField.disabled = true;
    entityForm.fields.targetField.selectedValue = null;
    entityForm.fields.targetField.disabled = true;
    entityForm.fields.sourceType.selectedValue = event.payload.item.id;
    entityForm.fields.sourceType.invalid = false;
    api.setState('entitiesSourceTable', null);

    switch (event.payload.item.id) {
        case REPORT_SOURCE:
            api.setState('entitiesSourceTable', 'sys_report_source');
            api.data.get_table_details.execute({
                tablename: 'sys_report_source',
            });
            break;
        case EXTERNAL_DATA:
            api.setState('entitiesSourceTable', 'sn_po_extdata_dataset');
            api.data.get_table_details.execute({
                tablename: 'sn_po_extdata_dataset',
            });
            break;
        case TABLE:
            if (api.state.allowedTablesMap.TABLE.length === 0) {
                api.data.get_table_list.execute({
                    sourceType: TABLE,
                    searchTerm: '',
                });
            } else {
                const entityForm = {...api.state.entityForm};
                entityForm.fields.entity.listItems = api.state.allowedTablesMap.TABLE;
                api.setState('entityForm', entityForm);
            }
            api.setState('selectedSourceType', TABLE);
            break;
        case ARCHIVED_DATA:
            if (api.state.allowedTablesMap.ARCHIVED_DATA.length === 0) {
                api.data.get_table_list.execute({
                    sourceType: ARCHIVED_DATA,
                    searchTerm: '',
                });
            } else {
                const entityForm = {...api.state.entityForm};
                entityForm.fields.entity.listItems = api.state.allowedTablesMap.ARCHIVED_DATA;
                api.setState('entityForm', entityForm);
            }
            api.setState('selectedSourceType', ARCHIVED_DATA);
            break;
    }
}

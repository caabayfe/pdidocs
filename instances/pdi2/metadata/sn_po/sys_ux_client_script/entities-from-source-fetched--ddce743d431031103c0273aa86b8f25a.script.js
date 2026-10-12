/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (api.state.entitiesSourceTable === 'sn_po_extdata_dataset') {
        let sourceFieldData = event.payload.data.output.result;
        sourceFieldData = sourceFieldData.map((data) => ({
            'id': data.sys_id,
            'tableName': data.case_table,
            'label': data.name
        }));
        const entityForm = {...api.state.entityForm};
        entityForm.fields.entity.listItems = sourceFieldData;
        api.setState('entityForm', entityForm);
    } else if (api.state.entitiesSourceTable === 'sys_report_source') {
        let sourceFieldData = event.payload.data.output.result;
        sourceFieldData = sourceFieldData.map((data) => ({
            'id': data.sys_id,
            'tableName': data.table,
            'label': data.display,
        }));
        const entityForm = {...api.state.entityForm};
        entityForm.fields.entity.listItems = sourceFieldData;
        api.setState('entityForm', entityForm);
    }
}

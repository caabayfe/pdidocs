/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const entityPayload = JSON.stringify({
        include_approvals: api.state.entityForm.fields.includeApprovals.value,
    });

    api.data.edit_entity.execute({
        'sys_id': api.state.selectedEntity._row_data.uniqueValue,
        'entityPayload': entityPayload,
    });
}

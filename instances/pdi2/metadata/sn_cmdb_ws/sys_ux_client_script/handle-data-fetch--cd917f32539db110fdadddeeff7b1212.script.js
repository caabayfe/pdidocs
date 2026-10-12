/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {
        active,
        retirement_definition,
        table
    } = api.data.look_up_record.result;
    const {
        sysId
    } = api.context.props;

    if (active && retirement_definition && table) {
        api.setState('cbTableName', table.value);
        api.setState('encodedQuery', retirement_definition.value);
        api.setState('defActive', active.value);
    } else if (sysId != -1) {
        api.setState('recordNotFound', true);
    }
}

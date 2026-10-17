/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {
        cbTableName,
        defActive,
        encodedQuery,
        validQuery
    } = api.state;
    const {
        sysId
    } = api.context.props;

    let payload = {
        tableName: cbTableName,
        queryCondition: validQuery,
        activeFlag: defActive
    };

    if (sysId == -1) {
        api.data.create_definition.execute({
            payload
        });
    } else {
        payload = {
            definitionId: sysId,
            ...payload
        };
        api.data.update_definition.execute({
            payload
        });
    }
    api.setState('disableSave', true);
}

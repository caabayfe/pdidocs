/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {
        results
    } = api.data.look_up_existing;

    if (results && results.length) {
        const {
            uniqueValue: sysId
        } = results[0]._row_data;

        if (sysId !== api.context.props.sysId)
            api.setState('existingDefForTable', sysId);
        else 
            api.setState('existingDefForTable', '');
    } else {
        api.setState('existingDefForTable', '');
    }
}

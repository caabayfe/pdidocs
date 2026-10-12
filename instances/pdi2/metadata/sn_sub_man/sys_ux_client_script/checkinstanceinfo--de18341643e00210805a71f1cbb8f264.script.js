/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const results = api.data.check_instance_info.results[0];
    let instanceInfo;
    if(results && results.instance_used_for) {
        instanceInfo = results.instance_used_for.value;
        if(instanceInfo === 'Production') {
            api.setState('isProd', true);
        } else if(instanceInfo === 'Subproduction'){
            api.setState('isSubProd', true);
        }
    }
}

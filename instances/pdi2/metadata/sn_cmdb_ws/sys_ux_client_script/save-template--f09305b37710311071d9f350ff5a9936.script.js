/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

    if(!api.state.networkActivity) {
        // prevent double clicking save button
        let template = JSON.parse(JSON.stringify(api.state.template));

        // must remove any null or blank keys from template json for update to work.
        Object.keys(template).forEach((i) => (template[i] == null || template[i] == "") && delete template[i]);
        
        if (api.state.isNew) {
            api.data.deduplication_template_create.execute({
                'templateJson': template,
            });
        } else {
            api.data.deduplication_template_update.execute({
                'templateSysId': api.state.templateSysId,
                'templateJson': template
            });
        }
    }

}

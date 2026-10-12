/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    let basic = api.state.plugins.filter(plugin => plugin.isQSChecked);
    let recommended = api.state.plugins.filter(plugin => plugin.isQSChecked || plugin.isBEChecked);
    basic = basic.map(plugin => plugin.sys_id);
    recommended = recommended.map(plugin => plugin.sys_id);
    let body = {
        basic,
        recommended
    };
    helpers.snHttp(`api/sn_ads_setup/build/setup/${api.context.props.setupId}/plugins/${api.context.props.categoryId}`, {
                method: 'POST',
                batch: false,
                body: body
            })
            .then(({
                response
            }) => {
                api.setState('pluginSetupType', body);
                helpers.modal.close('plugin_type_selection');
            })
            .catch(({
                error
            }) => {
                //TODO: Open notification
                console.log(error);
            });

}

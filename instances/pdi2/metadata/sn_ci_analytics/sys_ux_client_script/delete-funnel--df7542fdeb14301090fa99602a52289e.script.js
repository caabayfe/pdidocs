/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    const {funnelId} = api.context.props;
    const payload = { 
        remove: {
            funnelId
        }
    };

    api.data.funnel_api.execute({payload});
}

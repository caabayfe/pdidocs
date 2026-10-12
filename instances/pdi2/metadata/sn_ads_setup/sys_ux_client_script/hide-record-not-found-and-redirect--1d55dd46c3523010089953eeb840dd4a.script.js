/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const setupItems = api.data.get_setup_info.items;
 
    if (api.context.props.id !== '-1' && setupItems) {
        if (setupItems.length === 0 || api.data.get_setup_info.result.type.value !== 'global_setup') {
            api.setState('hideRecordNotFound', false);
            return;
        }
        if (setupItems.length !== 0 && api.data.get_setup_info.result.type.value === 'global_setup') {
            if (['product-list', 'product-desc'].includes(api.context.props.configure) && !api.state.pageInput.hasSurvey) {
                // Redirect user to setup-type screen if the setup doesn't have survey questions
                helpers.navigate.setRouteParams({
                    params: {
                        configure: 'setup-type'
                    }
                });
            }
            return;
        }
    }
    return;
}

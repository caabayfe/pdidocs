/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

    function showNotification(msg) {
        console.log(msg);
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'delete-fail',
                status: 'critical',
                icon: 'exclamation-triangle-outline',
                content: msg,
                action: {
                    type: 'dismiss'
                }
            }]
        });
    }


    const status = api.state.status || api.context.props.data.status;
    const installed = status === 'installed';
    if (installed) {
        // Open link flow
        console.log('external URL', api.context.props.data);
        api.emit('NAV_ITEM_SELECTED', {
            external: {
                url: api.context.props.data.plugin_home_url
            }
        });
    
    } else {
        // Install plugin flow
        const plugins = api.context.props.data.plugins.map(p => {
            return {
                ...p,
                install_demo_data: false
            };
        });
        api.setState('plugins', plugins);
        helpers.modal.open("[component-id$='plugin_properties_modal']");
        api.setState('hideModal', false);
    }
}

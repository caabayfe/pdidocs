/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    try {
        const resource = await helpers.snHttp('/api/sn_admin_center/adminx/check_updates', {
            method: 'GET',
            batch: false
        });

        const {
            result
        } = resource.response;

        async function showNotification({
            isUpdateAvailable,
            name,
            baseUrl
        }) {
             if (!isUpdateAvailable)
                return;
            
            const translatedCheckUpdateMsg = await helpers.translate('Update available for {0}.', name);
            const translatedAppMgrLinkText = await helpers.translate('Go to App Manager');
            api.emit('ADD_UPDATE_APP_NOTIFICATION', {
                items: [{
                    'type': 'info',
                    'content' : translatedCheckUpdateMsg,
                    'action': {
                        'type': 'dismiss',
                    },
                    'textLinkProps': {
                        'label': translatedAppMgrLinkText,
                        'href': `/now/app-manager/home/tab/updates/sort/recently_released/search/${encodeURIComponent(name)}`
                    }
                }]
            });

        }

        if (result.sn_admin_center)
            showNotification(result.sn_admin_center);

        if (result.sn_itsm_bus_obj)
            showNotification(result.sn_itsm_bus_obj);

    } catch ({
        error
    }) {
        console.error(error);
    }
}

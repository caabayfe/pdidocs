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
        const resource = await helpers.snHttp('/api/sn_instance_clone/clone/util', {
            method: 'POST',
            body: {
                operation: 'CHECK_APP_UPDATE_SCENARIO'
            },
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
            api.emit('APP_UPDATE_ALERT', {
                items: [{
                    'type': 'info',
                    'icon': 'circle-info-outline',
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
        console.log(result);
        showNotification(result.sn_instance_clone);

    } catch ({
        error
    }) {
        console.error(error);
    }
}

/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event
}) {
    const {
        urlParams
    } = event.payload;
    // Extract flat params and detect isNewTab
    const params = {};
    let isNewTab = false;
    for (const [key, paramInfo] of Object.entries(urlParams)) {
        if (key === 'sysId') {
            if (paramInfo.isNewTab === true) {
                api.emit('NAV_ITEM_SELECTED', {
                    route: 'dashboards',
                    title: paramInfo.dashboardName || paramInfo.value,
                    params: {
                        sysId: paramInfo.value
                    },
                    navigationOptions: {
                        navigateExternal: true,
                        target: '_blank',
                    },
                });
            } else {
                api.emit('CONTENT_UPDATED', {
                    route: 'dashboards',
                    title: paramInfo.dashboardName || paramInfo.value,
                    params: {
                        sysId: paramInfo.value
                    },
                });
            }
            return;
        }
        api.emit('CONTENT_UPDATED', {
            route: 'dashboards',
            params: {
                [key]: paramInfo.value
            }
        });
    }

}

/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const isPAE = api.context.app.appId === '08c73d60537101100834ddeeff7b1287';
    const payload = isPAE ? {
        route: 'scheduled-export',
        icon: 'calendar-days-clock-outline',
        title: 'Scheduled Export',
        fields: {
            sysId:'new' + Date.now(),
        },
        params: {
            vizId: event.payload.sysId,
        }
    } : {
        external: {
            url: `/now/platform-analytics-workspace/scheduled-export/new${Date.now()}/params/viz_id/${event.payload.sysId}`
        }
    };
        
    api.emit('NAV_ITEM_SELECTED', payload);
}

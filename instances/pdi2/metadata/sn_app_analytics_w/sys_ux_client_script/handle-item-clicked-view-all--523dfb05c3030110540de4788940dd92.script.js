/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    helpers.timing.setTimeout(function() {
        const polarisProperty = this.ux_globals.sysprops['glide.ui.polaris.experience'];
        const polarisUserPref = this.ux_globals.userPrefs['glide.ui.polaris.use'];
        const isPolarisDisabled = !(
           polarisProperty.toString().toLowerCase() === 'true' &&
          polarisUserPref === 'true'
        ) ;

        const {getPayload} = imports['sn_app_analytics_w.ParWidgetsDrilldowns']();
        // Needed by script include
        const getEventOrigin = (type) => {
            switch (type) {
                case 'NOW_RECORD_LIST_CONNECTED#ROW_CLICKED':
                    return 'NOW_RECORD_LIST_CONNECTED#ROW_CLICKED';

                case 'SN_PAR_CALENDAR_CONNECTED#EVENT_CLICKED':
                    return 'SN_PAR_CALENDAR_CONNECTED#EVENT_CLICKED';

                case 'NOW_RECORD_LIST_CONNECTED#VIEW_ALL_CLICKED':
                    return 'NOW_RECORD_LIST_CONNECTED#VIEW_ALL_CLICKED';

                case 'NOW_VIS_WRAPPER#CLICKED': 
                    return 'NOW_VIS_WRAPPER#CLICKED';

                default:
                    return 'ITEM_SELECTED';
            }
        };

        // Script include requried format
        const getUnifiedPayload = (type, payload) => {
            switch (type) {
                case 'NOW_RECORD_LIST_CONNECTED#ROW_CLICKED':
                    return {
                        ...payload,
                        title: payload.listTitle,
                    };

                case 'SN_SCORECARD_LIST#ITEM_SELECTED':
                    return {params: payload};

                default:
                    return payload;
            }
        };

        const payload = getPayload({
            payload: {
                ...getUnifiedPayload(event.payload.type, event.payload.payload),
                eventOrigin: getEventOrigin(event.payload.type),
                drilldownToCoreUI: event.payload.drilldownToCoreUI,
            }
        }, isPolarisDisabled, this);

        api.emit('NAV_ITEM_SELECTED', payload);
    });
}

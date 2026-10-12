/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({ api, event, helpers, imports }) {
    helpers.timing.setTimeout(function () {
        const appId = this.ux_globals.experienceConfigs[
            Object.values(this.ux_globals.experienceConfigs)
                ?.map(obj => obj.urlPath)
                .filter(url => this.location.pathname.slice(1).startsWith(url))
                .sort()
                .pop()
        ]?.experienceId;
        if (appId == "08c73d60537101100834ddeeff7b1287") {
            api.emit('NAV_ITEM_SELECTED', {
                route: 'dashboard-library',
                title: 'Dashboard Library',
                params: {
                    filter: event.payload.filter
                }, reload: true,
            });
        } else {
            api.emit("NAV_ITEM_SELECTED", {
                route: 'analytics-center',
                title: 'Dashboard Library',
                params: {
                    tab: '1',
                    filter: event.payload.filter,
                }, reload: true,
            });
        }
    });
}

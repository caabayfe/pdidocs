/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

    const {
        targetRecord,
        isNewRecord,
        mode,
        wizardId,
        templateId
    } = event.payload || {};

const NOW_ASSIST_ROUTE = {
        route: "now-assist",
        fields: {
            wizardId: wizardId,
        },
        params: {
            isNewRecord: isNewRecord,
            mode: mode,
            templateId: templateId,
            catalogItemId: targetRecord,
        },
        redirect: null,
        passiveNavigation: null,
        title: null,
        multiInstField: null,
        targetRoute: null,
        external: null,
        navigationOptions: null,
        reload: true
    };
		api.emit("NAV_ITEM_SELECTED", NOW_ASSIST_ROUTE);

}

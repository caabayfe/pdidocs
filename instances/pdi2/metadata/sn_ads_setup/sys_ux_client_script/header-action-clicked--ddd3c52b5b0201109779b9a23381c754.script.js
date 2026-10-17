/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (event.name ==='SN_HELP_SETUP_HEADER#ACTION_CLICKED') {
        helpers.navigate.to("setup", {
                "id": api.context.props.setupId
            }, {
                "customId": new Date().getTime()
            });
        return;
    }

    if(event.payload.canCloseTab) {
        helpers.navigate.to("home", {}, {"customId": new Date().getTime()});
    }
}

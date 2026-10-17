/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    if(!event)
        return;

    if(event.name === 'SN_HELP_SETUP_FOOTER#SECONDARY_CLICKED') {
         helpers.navigate.to("setup-detail", {
                "setupId": api.context.props.id,
                "processId": api.context.props.processId
            });
        return;
    }

    if (event.name ==='SN_HELP_SETUP_HEADER#ACTION_CLICKED') {
        helpers.navigate.to("setup", {
            "id": api.context.props.id
        });
    }
}

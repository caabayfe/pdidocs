/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (api.context.props.channelType == "teams") {
        api.emit('NAV_ITEM_SELECTED', {
                external: {
                    url: 'https://teams.microsoft.com'
                }
        });
    }

    if (api.context.props.channelType == "workplace") {
        api.emit('NAV_ITEM_SELECTED', {
                external: {
                    url: 'https://workplace.facebook.com/work/admin/apps'
                }
        });
    }
}

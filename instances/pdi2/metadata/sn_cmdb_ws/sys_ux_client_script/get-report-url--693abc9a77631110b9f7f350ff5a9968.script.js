/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {

    if(api.context.session.user.roles.indexOf('report_admin') !== -1) {
        // Work around. Can't add a link event to the datasource in UIB.
        let URL = api.data.multisource_get_report_url.output.result.redirect_url;
        helpers.navigate.to(undefined, undefined, {}, false, false, null, {url: URL});
    } else {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [
                {
                    id: 'alert9',
                    status: 'critical',
                    icon: 'info-circle-outline',
                    content: await helpers.translate('Current user does not have permission, please add "report_admin" role to current user for creating reports'),
                    action: { type: 'dismiss' }
                }
            ]
        });      
    }
}

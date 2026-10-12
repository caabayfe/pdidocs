/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    //this is invoked on dismissing the notification for groups allocated from the Allocate Groups page
    
    api.setState('allocatedGroupNotificationHide', true);
    api.setState('allocatedGroupFailNotificationHide', true);
    api.setState('allocatedGroupCountFailNotificationHide', true);
    const category = 'regularuser';
    const sysId = api.context.props.sysId;

    /*
    Since the url has additional parameters which will trigger the display of this notification, 
    refreshing the page here to remove the additional paramater values from the url 
    */
    helpers.navigate.to('subscription-details', {
        sysId,
        category
    });
}

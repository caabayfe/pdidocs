/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
//need to use timestamp to create a unique property value on every navigation
    const currentTimestamp = Date.now();
    const params = {
        'ts': currentTimestamp
    };
    const sysId = api.context.props.sysId;

    //navigate to allocate groups page. Adding the timestamp will make the page to refresh
    //and this will update the list selector component and filter values
    helpers.navigate.to('allocate-groups', {
        sysId
    }, params);
}

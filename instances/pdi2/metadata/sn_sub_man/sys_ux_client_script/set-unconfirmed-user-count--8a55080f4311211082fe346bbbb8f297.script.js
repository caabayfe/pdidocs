/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const query = api.data.unconfirmed_user_count.output.data.GlideAggregate_Query;
    if (!query)
        return;

    //If count exists and is greater than 0, change the unconfirmed user count
    const count = query[0].sum;
    if(count) {
        api.setState('unconfirmed_user_count', count);
    }
}

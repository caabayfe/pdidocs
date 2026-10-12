/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const userCount = api.data.sub_detail_record.results[0].unconfirmed_user_realtime_count.displayValue;
    const groupCount = api.data.sub_detail_record.results[0].unconfirmed_group_realtime_count.displayValue;

    if(userCount != undefined && groupCount != undefined) {
        api.setState('unconfirmedUserCount', userCount);
        api.setState('unconfirmedGroupCount', groupCount);

        const hideInsight = userCount == 0;
        api.setState('hideUnconfirmedInsight', hideInsight);
    }
}

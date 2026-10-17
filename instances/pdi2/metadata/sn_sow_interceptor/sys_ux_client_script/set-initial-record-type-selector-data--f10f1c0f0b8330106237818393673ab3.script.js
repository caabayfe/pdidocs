/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    let recordTypeArray = [];

    const recordTypeResults = api.data.get_interceptor_cards.output.result;
    
    recordTypeResults.forEach(function(result, index) {
        var recordTypeObj = {};

        recordTypeObj.title = result.title;
        recordTypeObj.description = result.description;
        recordTypeObj.target_table = result.target_table;
        recordTypeObj.values = result.values;
        recordTypeObj.sys_id = result.sys_id;
        recordTypeObj.selected = index === 0 ? true : false;

        recordTypeArray.push(recordTypeObj);
        if (index === 0)
            api.setState('selectedRecordType', recordTypeObj);
    });

    api.setState("recordTypes", recordTypeArray);
}

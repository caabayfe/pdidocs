/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    // Grab the rule type
    const resource_type = api?.data?.get_the_record_for_the_evaluate_access_run?.result?.resource_type?.value;
    // Grab the uniqueValue, which is the sys_id of the evaluate access run, maps to results table in 1xmany fashion
    const sys_id = api?.data?.get_the_record_for_the_evaluate_access_run?.result?._row_data?.uniqueValue;
    
    // Util function to grab the params for any given consumer
    const {getUrlParamsForTheConsumer} = imports["sn_access_analyzer.AccessanalyzerUIUtil"]();

    let route = "results";
    // Get the params for the consmer accordinly
    let params = getUrlParamsForTheConsumer(resource_type)
    let fields = {
        requestId: sys_id
    };
    
    helpers.navigate.to(route, fields, params, null, null, null, null);
}

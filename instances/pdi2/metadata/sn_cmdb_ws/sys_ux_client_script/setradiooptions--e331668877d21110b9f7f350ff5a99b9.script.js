/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    
    let resultsTypeOptions = [{"id":"ci_records","label":await helpers.translate("Show unique CMDB 360 records"),"checked":true},{"id":"multisource_records","label":await helpers.translate("Show CI records by discovery source")}];
    api.setState('resultsTypeOptions',resultsTypeOptions);

    let limitResultsToOptions =   [{"id":"none","label":await helpers.translate("All")},{"id":"appl_service","label":await helpers.translate("Application Services")},{"id":"tech_service","label":await helpers.translate("Technical Services")},{"id":"cmdb_group","label":await helpers.translate("CMDB Groups")}];
    api.setState('limitResultsToOptions',limitResultsToOptions);

    let attributesToCompareOptions = [{"id":"or","label":await helpers.translate("Any attribute doesn't match"),"checked":true},{"id":"and","label":await helpers.translate("Every attribute doesn't match")}];
    api.setState('attributesToCompareOptions',attributesToCompareOptions);

}

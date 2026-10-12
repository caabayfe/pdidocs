/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    var dataMismatchTitle = await helpers.translate("Data mismatch records");
    var cmdbMultisourceData = await helpers.translate("CMDB 360 data");
    var cisWithSingleSource = await helpers.translate("CIs with a single discovery source");
    var discoSourcesNotReporting = await helpers.translate("CIs not reported by discovery sources");
    var cisByNumOfSources = await helpers.translate("CIs by number of discovery sources");

    var drilldownTitles = {
        dataMismatchTitle : dataMismatchTitle,
        cmdbMultisourceData : cmdbMultisourceData,
        cisWithSingleSource : cisWithSingleSource,
        discoSourcesNotReporting :discoSourcesNotReporting,
        cisByNumOfSources : cisByNumOfSources
    };
    api.setState("drilldownTitles",drilldownTitles);
}

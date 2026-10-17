/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var records = api.context.props.callerRecords;
    var dexStatus = api.data.get_dex_asset_status.output.availabilityArray;

    if (dexStatus.length !== 0 && dexStatus.length === records.length) {
        for (var i = 0; i < records.length; i++) {
            records[i]["dexAsset"] = dexStatus[i];
        }
        api.setState("dexRecords", records);
    }
}

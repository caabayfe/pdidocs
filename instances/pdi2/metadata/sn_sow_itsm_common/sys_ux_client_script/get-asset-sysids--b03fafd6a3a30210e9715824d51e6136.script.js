/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({ api, event, helpers, imports }) {
    var callerRecords = api.context.props.callerRecords;

    api.setState("assetSysIds", callerRecords.reduce((acc, obj) => {
        if (obj.computer_sysid) {
            acc.push(obj.computer_sysid);
        }
        return acc;
    }, []));
}

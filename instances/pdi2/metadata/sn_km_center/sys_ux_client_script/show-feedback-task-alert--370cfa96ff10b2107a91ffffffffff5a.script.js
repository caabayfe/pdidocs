/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {

    const header = await helpers.translate("Feedback task has been created");
    let table = event.payload.data.output.table;
    let sysId = event.payload.data.output.sysId;
    const link = {
        "label": event.payload.data.output.displayName,
        "href": `now/knowledge-center/record/${table}/${sysId}`,
        "opensWindow": false
    };

    let alertPayload = { header, link };
    api.setState('alertContents', [alertPayload]);
}

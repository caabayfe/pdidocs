/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    helpers.modal.close("modal_gen_ai");
    var sysIdStr;
    if (api.data.fetch_gaps_incident_sysids?.results?.length > 0) {
        var sysIds = api.data.fetch_gaps_incident_sysids.results;
        sysIdStr = (sysIds.map((sysId) => sysId.task.displayValue)).join(", ");
    } else if (api.state.genAiSourceRecordId) {
        // for the agent flow case
        // if creating article from incident without gen ai, then there should be only 1 source
        sysIdStr = api.data.record.form.fields.source?.displayValue;
    }

    if (sysIdStr) {
        var message = await helpers.translate("<b>Selected tasks:</b> {0}", sysIdStr);
        var content = `<span>${message}</span>`;
        api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
            items: [{
                id: "gaps_tasks",
                status: "info",
                icon: "circle-info-outline",
                content: {
                    type: "html",
                    value: content
                },
                action: {
                    type: "dismiss"
                }
            }]
        });
    }
}

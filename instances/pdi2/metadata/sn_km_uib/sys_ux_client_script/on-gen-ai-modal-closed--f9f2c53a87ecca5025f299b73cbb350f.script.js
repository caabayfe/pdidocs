/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    if (api.state.isGenAiGenerating) {
        api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
            items: [{
                id: "na_drafting",
                status: "moderate",
                icon: "sn-sparkmoji-logo-outline",
                content: "AI is still working on drafting this article...",
            }]
        });
    } else if (!api.state.isGenAiGenerated && !api.data.tasks_search_1.output?.success) {
        var sysIdStr;
        if (api.data.fetch_gaps_incident_sysids?.results?.length > 0) {
            // gaps case - selected from gaps drilldown 
            var sysIds = api.data.fetch_gaps_incident_sysids.results;
            sysIdStr = (sysIds.map((sysId) => sysId.task.displayValue)).join(", ");
        }
        else if (api.state.genAiSourceRecordId) {
            // agent flow case - selected an incident 
            sysIdStr = api.data.record.form.fields.source.displayValue;
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
}

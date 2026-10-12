/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    if (api.state.genAiSourceRecordId && !api.state.isGenAiGenerating) {
        var sysIdStr = api.data.record.form.fields.source?.displayValue;
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

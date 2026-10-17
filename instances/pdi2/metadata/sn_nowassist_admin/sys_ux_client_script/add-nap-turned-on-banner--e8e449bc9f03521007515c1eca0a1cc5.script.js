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
    api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
        items: [{
            id: "nap_on",
            status: "positive",
            icon: "circle-check-outline",
            content: {
                "type": "html",
                "value": await helpers.translate("<div><strong>Now Assist panel is on.</strong> You can now select it from the Conversational experiences to show the skill in the Now Assist panel.</div>"),
            },
            action: {
                type: 'dismiss'
            }
        }]
    });
}

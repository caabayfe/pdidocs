/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
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
    }
}

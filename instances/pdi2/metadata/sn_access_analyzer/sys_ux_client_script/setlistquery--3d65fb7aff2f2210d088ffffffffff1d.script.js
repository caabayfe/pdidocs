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
    
    const statusMap = {
        Resolved: "status=resolved",
        Muted: "status=muted",
        Open: "status=open"
    };

    const selected = api.state.selectedTab || "Open"; // default fallback
    api.setState("listQuery", statusMap[selected] || "status=open");
    var muteReasonSelected = api.state.selectedMuteReason;
    api.setState("muteReasonTemp", muteReasonSelected);
}

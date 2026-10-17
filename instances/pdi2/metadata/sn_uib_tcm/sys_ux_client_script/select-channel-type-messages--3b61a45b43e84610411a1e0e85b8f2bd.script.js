/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var commTaskType = api.state.commTaskType;
    var selectedType = api.state.selectedType;
    var numOfCollabChannels = api.state.numOfCollabChannels ;
    if (!commTaskType || !selectedType) return [];
    var msg = "";
    if (commTaskType == "communication" && selectedType != commTaskType) msg = helpers.translateSync("This Communication task already has Communication channel(s) added, so you can't add Collaboration channel to it. If you want to add Collaboration channel, go back to the Communication task and remove all Communication channels first.");
    else if (commTaskType == "collaboration" && selectedType != commTaskType) msg = helpers.translateSync("This Communication task already has a Collaboration channel added, so you can't add Communication channel to it. If you want to add Communication channel, go back to the Communication task and remove the Collaboration channel first.");
    else if (commTaskType == "collaboration" && selectedType == commTaskType && numOfCollabChannels != 1) msg = helpers.translateSync("Any Communication task can have only one Collaboration channel added to it. If you want to add a new Collaboration channel, go back to the Communication task and remove the existing Collaboration channel first.");
    if (msg) return [{
        status: "critical",
        content: msg,
        icon: "circle-exclamation-outline"
    }];
    return [];
}

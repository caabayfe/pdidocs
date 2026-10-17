/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var options;
        options = [{
            "id": "all",
            "label": helpers.translateSync("All")
        }, {
            "id": "created-by-me",
            "label": helpers.translateSync("Created by me")
        }, {
            "id": "created-by-others",
            "label": helpers.translateSync("Created by others")
        }, {
            "id": "sidebar-discussions",
            "label": helpers.translateSync("Sidebar discussions")
        }, {
            "id": "teams-chats",
            "label": helpers.translateSync("Teams chats")
        }];
      
    return options;
}

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
    let models = JSON.parse(JSON.stringify(api.state.models));
    let filter = JSON.parse(JSON.stringify(api.state.searchInfo.selectedFilter));
    let pinnedArray = models.pinned.split(",");
    //Update base models
    models.chgModels.forEach(function(model, index) {
        if (model.sysId === event.context.item.value.sysId) {
            let pinnedIndex = pinnedArray.indexOf(model.sysId);
            if (model.isPinned) {
                if (filter === 'pinned') {
                    models.chgModels.splice(index, 1);
                    --models.totalCards;
                } else {
                    model.isPinned = false;
                    model.pinIcon = [{
                        "icon": "thumbtack-outline",
                        "label": models.pinLabels.pin
                    }];
                }
                if (pinnedIndex > -1) {
                    pinnedArray.splice(pinnedIndex, 1);
                }
            } else {
                model.isPinned = true;
                model.pinIcon = [{
                    "icon": "thumbtack-fill",
                    "label": models.pinLabels.unpin
                }];
                pinnedArray.push(model.sysId);
            }
        }
    });
    models.pinned = pinnedArray.join();
    api.setState("models", models);
    api.emit("UPDATE_USER_PINNED_PREFERENCES", {});
}

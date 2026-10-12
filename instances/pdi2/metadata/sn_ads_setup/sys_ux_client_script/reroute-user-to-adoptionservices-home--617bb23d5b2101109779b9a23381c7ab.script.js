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
    if (event.elementId == "view_player") {
        api.emit("NAV_ITEM_SELECTED", {
            external: {
                url: '/now/adoptionservices/',
                target: "_blank"
            }
        });
        return;
    }
    
    api.emit("NOW_UXF_PAGE#SET_LOADING_STATE", {
        loading: true,
        nonBlocking: false
    });

    api.emit("NAV_ITEM_SELECTED", {
        external: {
            url: '/now/build/adoptionservices/',
            target: "_self"
        }
    });
    api.setState('hideCongratulationsPage', true);
}

/**
 * @param {api} params.api
 * @param {any} params.event
 */
function handler({
    api,
    event
}) {
    if (event.payload.wrappedAction == 'CREATE_NEW_RECORD') {
        api.emit("NAV_ITEM_SELECTED", {
            external: {
                url: "now/build/adoptionservices/introduction/-1",
                target: "_self"
            }
        });
    }
}

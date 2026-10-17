/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function evaluateEvent({
    api,
    event
}) {
	const externalURL = "/now/nav/ui/classic/params/target/v_plugin.do%3Fsys_id%3D" + event.payload.id;
    api.emit("NAV_ITEM_SELECTED", {
        "external": {
            "url": externalURL,
            "target": "_blank"
        }
    });
}

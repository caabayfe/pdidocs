function handler({
    api,
    event,
    imports,
    helpers
}) {
    var redirectPayload = {
        "redirect": true,
        "route": "record",
        "title": "Create Knowledge",
        "multiInstField": "sysId",
        "fields": {
            "table": api.state.template,
            "sysId": "-1"
        },
        "params": {
            "query": api.state.query
        }
    };
    if (api.context.props.sysId)
        redirectPayload.targetRoute = 'current';

    helpers.timing.setTimeout(() => {
        helpers.modal.close();
        api.emit("NAV_ITEM_SELECTED", redirectPayload);
    }, 500);
}

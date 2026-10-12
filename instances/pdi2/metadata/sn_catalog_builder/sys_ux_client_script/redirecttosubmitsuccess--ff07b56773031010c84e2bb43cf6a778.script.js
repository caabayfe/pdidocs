function handler({
    api,
    helpers
}) {
    api.emit("NAV_ITEM_SELECTED", {
        route: "success",
        title: "Submitted",
        fields: {
            mode: api.context.props.mode,
            wizardId: api.context.props.sysId
        }
    });
}

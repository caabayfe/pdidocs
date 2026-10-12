function evaluate({
    api,
    helpers
}) {
    const {
        button2Info
    } = api.context.props.payload.listItemPayload;
    if (!button2Info)
        return true;

    if (Object.keys(button2Info).length <= 0 || !button2Info.label)
        return true;

    return false;
}

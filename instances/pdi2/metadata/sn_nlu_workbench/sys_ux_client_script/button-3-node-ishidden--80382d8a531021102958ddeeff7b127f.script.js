function evaluate({
    api,
    helpers
}) {

    const {
        button1Info
    } = api.context.props.payload.listItemPayload;
    if (!button1Info)
        return true;

    if (Object.keys(button1Info).length <= 0 || !button1Info.label)
        return true;

    return false;
}

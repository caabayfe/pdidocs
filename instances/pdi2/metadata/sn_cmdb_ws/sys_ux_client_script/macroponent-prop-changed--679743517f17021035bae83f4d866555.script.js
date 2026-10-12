function script({
    api,
    event
}) {
    const {
        name
    } = event.payload;
    const {
        isVisible,
        refreshRequested,
        subSelectedTabIndex
    } = api.context.props;
    if (name === "refreshRequested" && isVisible) {
        api.setState('ts', refreshRequested);
        if (subSelectedTabIndex == 0) {
            api.setState('policiesVisRefresh', refreshRequested);
        }
    }
}

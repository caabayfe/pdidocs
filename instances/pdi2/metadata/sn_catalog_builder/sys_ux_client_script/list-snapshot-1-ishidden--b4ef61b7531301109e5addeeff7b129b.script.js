function evaluateProperty({
    api
}) {
    const filterMode = api.state.itemFilterMode || '';
    return !filterMode;
}

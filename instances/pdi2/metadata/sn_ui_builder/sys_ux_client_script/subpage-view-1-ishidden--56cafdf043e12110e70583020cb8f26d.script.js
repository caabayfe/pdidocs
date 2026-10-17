function evaluate({
    api
}) {
    return !api.context.props.parentElementId && !api.context.props.parentScreenId;
}

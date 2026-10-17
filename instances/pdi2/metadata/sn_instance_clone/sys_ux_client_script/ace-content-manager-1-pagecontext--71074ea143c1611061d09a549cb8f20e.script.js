function evaluateProperty({
    api,
    helpers
}) {
    const {
        app,
        props,
        session
    } = api.context;
    return {
        app,
        props: props.target,
        session
    };
}

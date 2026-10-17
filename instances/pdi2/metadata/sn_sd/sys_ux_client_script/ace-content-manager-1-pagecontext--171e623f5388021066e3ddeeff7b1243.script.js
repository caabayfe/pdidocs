/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
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
        props: {...props},
        session
    };
}

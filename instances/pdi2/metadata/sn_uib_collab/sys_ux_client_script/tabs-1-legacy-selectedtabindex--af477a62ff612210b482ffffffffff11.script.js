/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const routes = api.state.routes;
    const routeToRender = api.context.props.subtabRoute;
    let subtabIndex = 0;
    if (!routes || !routeToRender)
        return subtabIndex;

    routes.forEach(function(routeObj, index) {
        if (routeObj.route === routeToRender) {
            subtabIndex = index;
            return;
        }
    });
    return subtabIndex;
}

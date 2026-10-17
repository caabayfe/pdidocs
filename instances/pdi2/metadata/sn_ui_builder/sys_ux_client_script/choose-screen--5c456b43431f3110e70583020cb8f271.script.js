/**
  * @param {params} params
  * @param {api} params.api
  * @param {any} params.event
  * @param {any} params.imports
  * @param {ApiHelpers} params.helpers
  */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    if (!api.context.props.experience) {
        return;
    }
    const routes = api.context.props.experience.routes;
    const route = routes.find(route => route.sysId === api.context.props.routeId);
    if (!route) {
        return;
    }
    const screen = route.screenCollection.screens.find(s => s.sysId === api.context.props.screenId);
    api.setState('screen', screen);
}

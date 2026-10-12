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
    const WIZARD_ROUTE = {
        route: "wizard",
        fields: {
            sysId: api.state.wizardId
        },
        params: {
            mode: "normal",
            recordId: "",
            templateId: api.state.selectedTemplateId
        },
        redirect: null,
        passiveNavigation: null,
        title: null,
        multiInstField: null,
        targetRoute: null,
        external: null,
        navigationOptions: null
    };

    const CHOOSE_HOW_TO_BUILD_ROUTE = {
        route: "choose-how-to-build",
        fields: {
            sysId: api.state.wizardId
        },
        params: {
            isNewRecord: true,
            mode: "normal",
            templateId: api.state.selectedTemplateId,
        },
        redirect: null,
        passiveNavigation: null,
        title: null,
        multiInstField: null,
        targetRoute: null,
        external: null,
        navigationOptions: null,
        reload: true
    };

    function navigateTo(routeConfig) {
        helpers.navigate.to(routeConfig.route, routeConfig.fields, routeConfig.params, routeConfig.redirect, routeConfig.passiveNavigation, routeConfig.targetRoute, routeConfig.external, routeConfig.title);
    }
    const decisionRouteExists = (api.data.t2c_helper.output?.routes || []).find(routeObj => routeObj.route === CHOOSE_HOW_TO_BUILD_ROUTE.route);
    if (decisionRouteExists && api.data.t2c_helper.output?.isSkillActive) {
        navigateTo(CHOOSE_HOW_TO_BUILD_ROUTE);
        return;
    }
    navigateTo(WIZARD_ROUTE);
}

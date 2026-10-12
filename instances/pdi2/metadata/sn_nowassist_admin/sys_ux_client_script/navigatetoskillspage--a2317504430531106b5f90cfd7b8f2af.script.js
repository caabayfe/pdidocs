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
    if (api.state.skillConfigData.skill_family === "a5efaf1c93764210aa5730f16489186d") {
        api.emit('NAV_ITEM_SELECTED', {
            route: "other-skills",
            params: null,
            redirect: null,
            passiveNavigation: null,
            title: null,
            multiInstField: null,
            targetRoute: null,
            external: null,
        });
    } else {
        api.emit('NAV_ITEM_SELECTED', {
            route: 'skill-list',
            fields: {
                productId: api.state.skillConfigData.skill_family_parent
            },
            params: {
                productId: api.state.skillConfigData.skill_family_parent
            },
            redirect: null,
            passiveNavigation: null,
            title: null,
            multiInstField: null,
            targetRoute: null,
            external: null,
        });
    }
}

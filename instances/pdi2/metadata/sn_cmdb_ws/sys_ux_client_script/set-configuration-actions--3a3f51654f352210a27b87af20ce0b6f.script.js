/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const configurationActions = {
        "id": "configure_actions",
        "overflow": true,
        "type": "Menu",
        "color": "unstyled",
        "children": []
    };
    const {
        roles
    } = api.context.session.user;
    const isAdminOrMaint = roles.includes('admin') || roles.includes('maint');
    const canConfigureForm = isAdminOrMaint || roles.includes('personalize_form');
    const canConfigureRelatedList = isAdminOrMaint || roles.includes('personalize_list');
    if (canConfigureForm) {
        configurationActions.children.push({
            "id": "configure_attributes",
            "label": "Configure attributes",
            "icon": "open-link-right-outline"
        });
    }
    if (canConfigureRelatedList) {
        configurationActions.children.push({
            "id": "configure_resources",
            "label": "Configure resources",
            "icon": "open-link-right-outline"
        });
    }
    if (configurationActions.children.length > 0) {
        api.setState('configurationActions', [configurationActions]);
    } else {
        api.setState('configurationActions', []);
    }
}

/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const items = [{
        icon: "chart-dependency-outline",
        id: "experience",
        label: "Experience"
    }, {
        icon: "documents-outline",
        id: "page_collection",
        label: "Page collection"
    }, {
        icon: "database-outline",
        id: "controller",
        label: "Controller"
    }];
    if (api.context.session.user.roles.includes("maint")) {
        items.push({
            icon: "component-outline",
            id: "component",
            label: "Component"
        });
    }
    return items;
}

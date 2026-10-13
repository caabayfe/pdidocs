/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    if (api.data.isAutoResolutionEnabled.output) {
        var navItems = api.state.navItems;
        var iarRoute = "issue-auto-resolution";
        api.setState("navItems", [...navItems, autoResolutionNav]);
        if (api.context.props.route === iarRoute) {
            api.setState("selectedNavItems", [[iarRoute]]);
        }
    }
}

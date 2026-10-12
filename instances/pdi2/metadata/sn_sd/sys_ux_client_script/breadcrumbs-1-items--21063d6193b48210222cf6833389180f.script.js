/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let breadcrumb = [];
    if (api.state.route == "user-roles") {
        breadcrumb.push({
            "label": helpers.translateSync("Benchmarks"),
            "route": "home"
        });
        breadcrumb.push({
            "label": helpers.translateSync('User roles'),
            "href": "#"
        });
    } else if (api.state.route == "kpi-setup") {

        breadcrumb.push({
            "label": helpers.translateSync("Benchmarks"),
            "href": "now/success-dashboard-admin-console/benchmarks",
            "route": "home"
        });
        breadcrumb.push({
            "label": api.state.selectedKPICategory,
            "href": "#"
        });

    }
    return breadcrumb;
}

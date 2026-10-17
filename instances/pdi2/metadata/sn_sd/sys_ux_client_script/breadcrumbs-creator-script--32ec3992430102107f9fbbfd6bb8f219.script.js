/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    const OPR = await helpers.translate("Operational Success");

    let tmpBreadcrumbsJSON = {};
    let currentRoute = api.context.props.route;

    switch (currentRoute) {
        case ("user-roles"):
            {
                tmpBreadcrumbsJSON = [{
                    "label": OPR,
                    "route": "home"
                }, {
                    "href": "#",
                    "label": await helpers.translate("User roles")
                }];
                break;
            }
        case ("tabs-and-dashboards"):
            {
                tmpBreadcrumbsJSON = [{
                    "label": OPR,
                    "route": "home"
                }, {
                    "href": "#",
                    "label": await helpers.translate("Tabs and dashboards")
                }];
                break;
            }
        case ("dashboard-visualizations"):
            {
                tmpBreadcrumbsJSON = [{
                    "label": OPR,
                    "route": "home"
                }, {
                    "href": "#",
                    "label": await helpers.translate("{0} tab", api.context.props.dashboardName)
                }];
                break;
            }
    }

    api.setState("breadcrumbsJSON", tmpBreadcrumbsJSON);
}

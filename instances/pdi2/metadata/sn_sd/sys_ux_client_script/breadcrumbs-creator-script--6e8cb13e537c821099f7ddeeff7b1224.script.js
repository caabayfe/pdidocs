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
    const SD = await helpers.translate("Success Dashboard");

    let tmpBreadcrumbsJSON = {};
    let currentRoute = api.context.props.route;

    switch (currentRoute) {
        case ("user-roles"):
            {
                tmpBreadcrumbsJSON = [{
                    "label": SD,
                    "route": "home"
                }, {
                    "href": "#",
                    "label": await helpers.translate("User roles")
                }];
                break;
            }
        case ("deflection-configuration-kb"):
            {
                tmpBreadcrumbsJSON = [{
                    "label": SD,
                    "route": "home"
                }, {
                    "href": "#",
                    "label": await helpers.translate("Knowledge deflection")
                }];
                break;
            }
        case ("deflection-configuration-va"):
        case ("va-form"):
            {
                tmpBreadcrumbsJSON = [{
                    "label": SD,
                    "route": "home"
                }, {
                    "href": "#",
                    "label": await helpers.translate("Virtual Agent deflection")
                }];
                break;
            }
        case ("fulfilment-automation-level"):
            {
                tmpBreadcrumbsJSON = [{
                    "label": SD,
                    "route": "home"
                }, {
                    "href": "#",
                    "label": await helpers.translate("Fulfillment Automation Level")
                }];
                break;
            }
        case ("pa-jobs-list"):
            {
                tmpBreadcrumbsJSON = [{
                    "label": SD,
                    "route": "home"
                }, {
                    "href": "#",
                    "label": await helpers.translate("Performance Analytics (PA) jobs")
                }];
                break;
            }
        case ("process-mining-projects"):
            {
                tmpBreadcrumbsJSON = [{
                    "label": SD,
                    "route": "home"
                }, {
                    "href": "#",
                    "label": await helpers.translate("Process Mining Projects")
                }];
                break;
            }
        case ("sys-property-config"):
            {
                tmpBreadcrumbsJSON = [{
                    "label": SD,
                    "route": "home"
                }, {
                    "href": "#",
                    "label": await helpers.translate("System properties")
                }];
                break;
            }
        case ("kpi-details"):
            {
                tmpBreadcrumbsJSON = [{
                    "label": SD,
                    "route": "home"
                }, {
                    "href": "#",
                    "label": await helpers.translate("Key performance indicators (KPIs)")
                }];
                break;
            }
    }

    api.setState("breadcrumbsJSON", tmpBreadcrumbsJSON);
}

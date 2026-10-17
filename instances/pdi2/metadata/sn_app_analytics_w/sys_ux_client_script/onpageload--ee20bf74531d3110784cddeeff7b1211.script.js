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
    if (api.context.app.appId == "08c73d60537101100834ddeeff7b1287") {
        helpers.timing.setTimeout(function() {
            const ux_globals = this.ux_globals;
            function routeExists(page) {
                if (ux_globals) {
                    const experienceURL = ux_globals.siteName;
                    const currentExperienceConfig = ux_globals.experienceConfigs[experienceURL];
                    const appRouteConfiguration = currentExperienceConfig ? currentExperienceConfig.appRouteConfiguration : null;
                    if (appRouteConfiguration && appRouteConfiguration.routes && typeof appRouteConfiguration.routes === 'object') {
                        const routes = Object.keys(appRouteConfiguration.routes) || [];
                        if (routes.includes(page)) {
                            return true;
                        }
                    }
                };
                return false;
            }

            var page = api.context.props.tab;
            if (page == "1" && routeExists("dashboard-library")) {
                api.emit("NAV_ITEM_SELECTED", {
                    route: "dashboard-library",
                    params: {
                        filter: api.context.props.filter,
                    }
                });
            } else if (page == "2" && routeExists("data-visualization-library")) {
                api.emit("NAV_ITEM_SELECTED", {
                    route: "data-visualization-library",
                    params: {
                        filter: api.context.props.filter,
                    }
                });
            } else if (page == "3" && routeExists("kpi-library")) {
                api.emit("NAV_ITEM_SELECTED", {
                    route: "kpi-library",
                    params: {
                        filter: api.context.props.filter,
                    }
                });
            } else {
                api.emit("NAV_ITEM_SELECTED", {
                    route: "analytics-center-home"
                });
            }
        });
        return;
    }

    api.setState('selectedTabIndex', api.context.props.tab);
    const tab = api.context.props.tab || 0;
    switch (tab ) {
        case 1:
        case '1': api.setState('dashboardFilter', api.context.props.filter);
            break;
        case 2:
        case '2': api.setState('predefinedFilterType', api.context.props.filter);
            break;
        case 3:
        case '3': api.setState('kpiFilter', api.context.props.filter);
            break;
    }

    api.setState('kpiCategoryList', [, {
        "id": "bookmarked",
        "label": await helpers.translate("Bookmarked")
    }, {
        "id": "created_by_me",
        "label": await helpers.translate("created_by_me_lowercase")
    }, {
        "id": "all",
        "label": await helpers.translate("All")
    }]);
}

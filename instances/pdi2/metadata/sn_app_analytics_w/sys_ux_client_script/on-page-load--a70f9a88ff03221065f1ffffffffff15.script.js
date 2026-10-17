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
    const showMenu = await helpers.translate("Show Menu");
    const hideMenu = await helpers.translate("Hide Menu");
    const ariaShowMenu = {
        "aria-label": showMenu
    };
    const ariaHideMenu = {
        "aria-label": hideMenu
    };
    api.setState("showMenu", showMenu);
    api.setState("hideMenu", hideMenu);
    api.setState("ariaShowMenu", ariaShowMenu);
    api.setState("ariaHideMenu", ariaHideMenu);

    const OVERVIEW = "overview";
    const library = api.context.props.library || OVERVIEW;

    const selectedItem = library === OVERVIEW ? [OVERVIEW] : ["library", library];

    api.setState("selectedItem", selectedItem);

    const pages = {
        overview: {
            icon: "home-outline",
            id: "overview",
            label: await helpers.translate("Overview"),
            pageTitle: await helpers.translate("Overview"),
        },
        dashboards: {
            icon: "grid-four-outline",
            id: "dashboards",
            label: await helpers.translate("Dashboards"),
            pageTitle: await helpers.translate("Dashboard Library"),
        },
        "data-visualizations": {
            icon: "chart-bar-vertical-outline",
            id: "data-visualizations",
            label: await helpers.translate("Data visualizations"),
            pageTitle: await helpers.translate("Data visualization Library"),
        },
        indicators: {
            icon: "kpi-outline",
            id: "indicators",
            label: await helpers.translate("Indicators"),
            pageTitle: await helpers.translate("Indicator Library"),
        },
        filters: {
            icon: "filter-outline",
            id: "filters",
            label: await helpers.translate("Filters"),
            pageTitle: await helpers.translate("Filter Library"),
        },
        "scheduled-exports": {
            icon: "calendar-outline",
            id: "scheduled-exports",
            label: await helpers.translate("Scheduled exports"),
            pageTitle: await helpers.translate("Scheduled Export Library"),
        }
    };

    if (!api.context.props.library) {
        api.emit("NAV_ITEM_SELECTED", {
            route: "pages",
            title: pages.overview.pageTitle,
            params: {
                library
            }
        });
    }

    const selectedPage = pages[library];
    if (selectedPage) {
        helpers.screen.updateStatus({
            title: selectedPage.pageTitle
        });
    }

    const contentTreeItems = [
        pages.overview,
        {
            "children": [
                pages.dashboards,
                pages['data-visualizations'],
                pages.indicators
            ],
            "id": "library",
            "isActionable": false,
            "label": await helpers.translate("Libraries")
        }
    ];
    const userRoles = api.context &&
        api.context.session &&
        api.context.session.user &&
        api.context.session.user.roles || [];
    const ROLES = {
        COMMON_ADMIN: [
            "maint",
            "admin",
        ],
        FILTER_ADMIN: "analytics_filter_admin",
        SCHEDULED_EXPORT: ["par_scheduler", "par_scheduler_admin"],
        UXA: [
            "chat_analytics_viewer",
            "mobile_analytics_viewer",
            "portal_analytics_viewer",
            "now_experience_analytics_viewer",
            "core_ui_analytics_viewer"
        ]
    };
    // Check if user has any common admin roles
    const hasAdminRole = userRoles.some((role) =>
        ROLES.COMMON_ADMIN.includes(role)
    );
    // Check for specific role permissions
    const hasUXARole = userRoles.some((role) =>
        ROLES.UXA.includes(role)
    );
    const hasFilterRole = userRoles.includes(ROLES.FILTER_ADMIN);
    const hasScheduledExportRole = userRoles.some((role) =>
        ROLES.SCHEDULED_EXPORT.includes(role)
    );
    
    const hasFilterPagePermissions = hasAdminRole || hasFilterRole;
    const hasScheduledExportPagePermissions = hasAdminRole || hasScheduledExportRole;
    const hasUXAPagePermissions = hasAdminRole || hasUXARole;

    const accessDeniedPages = [];
    if (hasFilterPagePermissions) {
        contentTreeItems[1].children.push(pages["filters"]);
    } else {
        accessDeniedPages.push("filters");
    }
    if (hasScheduledExportPagePermissions) {
        contentTreeItems[1].children.push(pages["scheduled-exports"]);
    } else {
        accessDeniedPages.push("scheduled-exports");
    }
    if (hasUXAPagePermissions) {
        contentTreeItems.push({
            "children": [{
                "actions": [{
                    "icon": "open-link-right-fill",
                    "label": await helpers.translate("Open link")
                }],
                "externalUrl": "now/uxa",
                "icon": "appsee-outline",
                "id": "external",
                "isExternal": "1",
                "label": await helpers.translate("Usage insights")
            }],
            "id": "additional",
            "label": await helpers.translate("Additional Links")
        });
    }

    api.setState("contentTreeItems", contentTreeItems);

    let params = {
        filter: api.context.props.filter,
        listEncodedQuery: api?.context?.props?.listEncodedQuery
    };
    let route = library + "-page";

    if (accessDeniedPages.includes(library)) {
        helpers.screen.updateStatus({
            title: await helpers.translate("Access denied")
        });
        params = {};
        route = "access-denied";
    }
    api.emit('MACROPONENT_VIEWPORT_LOAD_REQUESTED', {
        viewportElementId: 'viewport_1',
        route,
        fields: null,
        params
    });
}

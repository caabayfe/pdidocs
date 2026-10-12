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
    var {
        id: library,
        pageTitle,
        isExternal,
        externalUrl
    } = event.payload.item;

    if (isExternal) {
        api.emit("NAV_ITEM_SELECTED", {
            context: {
                path: "now/nav/ui",
            },
            route: "classic",
            navigationOptions: {
                navigateExternal: true,
                windowOptions: {
                    target: "_blank",
                },
            },
            params: {
                target: externalUrl
            }
        });
        return;
    }

    const ignoredRoutes = ["additional", "library", "external"];
    if (ignoredRoutes.includes(library)) {
        return;
    }

    api.emit("NAV_ITEM_SELECTED", {
        route: "pages",
        title: pageTitle,
        params: {
            library,
            filter: undefined,
            listEncodedQuery: undefined
        }
    });
}

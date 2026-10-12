/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const translations = {
        "quickLinks": await helpers.translate("Quick links"),
        "addQuickLink": await helpers.translate("Add a quick link"),
        "emptyStateHeading": {"label": await helpers.translate("No quick links yet")},
        "emptyStateActions": [{"label": await helpers.translate("Add a link"),"variant":"tertiary"}]
    };

    api.setState("quickLinkHeader", translations.quickLinks);
    api.setState("translations", translations);
}

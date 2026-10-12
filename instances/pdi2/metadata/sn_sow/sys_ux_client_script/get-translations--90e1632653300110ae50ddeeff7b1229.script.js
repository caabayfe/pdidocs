/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const translations = {
        "emptyStateHeading": {"label":await helpers.translate("Nothing coming up")},
        "todayEmptyStateContent": await helpers.translate("This is where you will find your activities that are due or overdue today."),
        "tomorrowEmptyStateContent": await helpers.translate("This is where you will find your activities that are due tomorrow.")
    };
    api.setState("translations", translations);
}

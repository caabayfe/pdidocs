/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const aoTranslations = {};
    const ignore = await helpers.translate("Ignore");
    const ignoreAll = await helpers.translate("Ignore All");

    aoTranslations.ignore = ignore;
    aoTranslations.ignoreAll = ignoreAll;
    api.setState("aoTranslations", aoTranslations);
}

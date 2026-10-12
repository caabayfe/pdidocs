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
    const recurrenceCoreUtils = await imports['sn_app_ux_commons.RecurrenceCoreUtils']({
        api,
        event,
        helpers,
        imports
    });
    helpers.timing.setTimeout(async () => {
        await recurrenceCoreUtils.propertyChangeHandler();
    }, 1);
}

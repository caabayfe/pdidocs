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
    const skipDateIndex = api.state.skipDates.findIndex(skipDate => skipDate.key === event.context.item.value.key);

    if (event.payload.fieldValue === undefined || event.payload.fieldValue === api.state.skipDates[skipDateIndex].startDate)
        return;

    const {handleRecurenceSkipDatesChange} = imports["sn_app_ux_commons.EventRecurrenceHandlers"]({api, helpers});
    await handleRecurenceSkipDatesChange(event, skipDateIndex);
}

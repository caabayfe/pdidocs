/**
 * @param {params} params
 * @param {api} params.api
 * @param {event} params.event
 * @param {imports} params.imports
 * @param {helpers} params.helpers
 */
function recordDataFetchCompleted({
    api,
    helpers,
    event,
    imports
}) {
    // Do not fetch SHN for new records.
    if (api.data?.glide_form_1?.nowRecordFormBlob?.isNewRecord)
        return; 

    if (!api.state.specialHandlingNotesDisplayed) {
        helpers.timing.setTimeout(() => {
            api.data.get_special_handling_notes?.refresh?.(); //Explicit invoke the DB of SHN
        }, 3000);
    } else if (api.state.SHNModalOpened) {
        api.data.get_special_handling_notes?.refresh?.(); // Invoking the DB on close of the SHN Modal
        api.setState("SHNModalOpened", false);
    }
}

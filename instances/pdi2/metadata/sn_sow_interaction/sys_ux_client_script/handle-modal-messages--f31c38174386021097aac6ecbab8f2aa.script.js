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
    let numSelectedRec = api.state.selectedRecords;
    if (event.name === "MACROPONENT_READY") {
        const {number = {}} = api.data.controller.form.fields;
        const {displayValue = ""} = number;
        let interaction = displayValue;
        let listText = await helpers.translate('Choose a document table type, then select the records you want to associate with {0}.', interaction);
        api.setState('listText', listText);
    } else {
        numSelectedRec = event.payload.selectedRecords;
    }

    let selectedItemsMsg = await helpers.translate('{0} items selected', numSelectedRec.length);
    api.setState('selectedItemsMsg', selectedItemsMsg);
}

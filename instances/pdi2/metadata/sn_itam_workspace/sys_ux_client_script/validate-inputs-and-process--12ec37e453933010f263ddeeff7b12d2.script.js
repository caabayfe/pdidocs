/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({api, event, helpers, imports}) {
    var stockroom = api.state.currentStockroom;
    var error_message;
    if (!stockroom) {
        error_message = await helpers.translate("Please select a stockroom");
    }
    if (error_message) {
        api.setState("errorMessage", error_message);
    } else {
        api.data.cancel_from_consumable.execute({
            currentStockroom: api.state.currentStockroom,
            actualStockroom: api.data.look_up_consumable_record.result.stockroom.value,
            substatus: api.state.substate,
            sysId: api.context.props.sysId
        });
    }
}

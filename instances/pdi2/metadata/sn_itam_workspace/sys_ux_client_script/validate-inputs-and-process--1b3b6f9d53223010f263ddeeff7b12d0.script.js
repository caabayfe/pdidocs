/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({api, event, helpers, imports}) {
    var total_quantity = api.data.look_up_consumable_record.result.quantity.value;
    var quantity = api.state.quantity;
    var stockroom = api.state.stockroom;
    var error_message;
    var regex = /^\d+$/;
    if (!stockroom) {
        error_message = await helpers.translate("Please select a stockroom");
    } else if (!regex.test(quantity) || isNaN(quantity)) {
        error_message = await helpers.translate("Please enter a non-zero number for quantity");
    } else if (quantity > total_quantity) {
        error_message = await helpers.translate("Please enter a number less than or equal to the number in stock");
    } else if (quantity < 1) {
        error_message = await helpers.translate("Please enter a non-zero number for the quantity");
    }
    if (error_message) {
        api.setState("errorMessage", error_message);
    } else {
        api.data.retire_consumable.execute({
            quantity: api.state.quantity,
            stockroom: api.state.stockroom,
            substate: api.state.substate,
            sysId: api.context.props.sysId
        });
    }
}

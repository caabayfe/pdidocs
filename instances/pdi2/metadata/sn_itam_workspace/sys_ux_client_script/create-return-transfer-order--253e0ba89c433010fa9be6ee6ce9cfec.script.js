/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    var quantity = api.state.quantity;
    var reason = api.state.reason;
    var dataBrokerResponse = api.data.look_up_record.result;
    var received = dataBrokerResponse.quantity_received.value; //) ? 0 : dataBrokerResponse.quantity_received.value;
    var returned = dataBrokerResponse.quantity_returned.value; //) ? 0 : dataBrokerResponse.quantity_returned.value;
    received = parseInt(received, 10);
    returned = parseInt(returned, 10);
    var remainingQuanity = received - returned;
    if (!quantity || isNaN(quantity)) {
        helpers.translate("Please enter a non-zero number for quantity").then(
            (value) => {
                api.setState("errorMessage",value);
            }
        );
    } else if(!reason || reason === ''){
        helpers.translate("Please specify reason").then(
            (value) => {
                api.setState("errorMessage",value);
            }
        );
        
    }else {
        quantity = parseInt(quantity, 10);
        if (quantity < 1) {
            helpers.translate("Please enter a non-zero number for quantity").then(
                (value) => {
                    api.setState("errorMessage",value);
                }
            );
        } else if (quantity > remainingQuanity) {
            helpers.translate("Quantity cannot be greater than "+remainingQuanity).then(
                (value) => {
                    api.setState("errorMessage",value);;
                }
            );
        } else {
            api.data.return_transfer_order.execute({
                "sysId": api.context.props.sysId,
                "quantity": api.state.quantity,
                "defective": api.state.defective,
                "reason": api.state.reason
            });
        }
    }
}

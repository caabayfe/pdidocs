/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    var quantity = api.state.quantity;
    var maxQuantity = api.state.maxQuantity;

    var regex = /^\d+$/;
    if (!regex.test(quantity) || !quantity || isNaN(quantity)) {
        helpers.translate("Please enter a non-zero number for quantity").then(
            (value) => {
                api.setState("errorMessage",value);
            }
        );
    } else {
        maxQuantity = parseInt(maxQuantity, 10);
	    quantity = parseInt(quantity, 10);

        if (quantity < 1) {
            helpers.translate("Please enter a non-zero number for quantity").then(
                (value) => {
                    api.setState("errorMessage",value);
                }
            );
        } else if (quantity > maxQuantity) {
            helpers.translate("Please enter a quantity less than or equal to quantity in stock").then(
                (value) => {
                    api.setState("errorMessage",value);;
                }
            );
        } else {
            api.data.consumable_split_data_broker_1.execute({
                "sysId": api.context.props.sysId,
                "status": api.state.status,
                "quantity": api.state.quantity,
                "substatus": api.state.substate,
                "assetFunction": api.state.assetFunction
            });
        }
    }
}

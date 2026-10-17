/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    var selectedQuantity = api.state.quantity;
    var availableQuantity = parseInt(api.data.look_up_consumable_record.result.quantity.value);

    var regex = /^\d+$/;
    if (!regex.test(selectedQuantity) || !selectedQuantity || isNaN(selectedQuantity)) {
        helpers.translate("Please enter a non-zero number for quantity").then(
            (value) => {
                api.setState("errorMessage", value);
            }
        );     
    } else {
	    selectedQuantity = parseInt(selectedQuantity, 10);

        if (selectedQuantity < 1) {
            helpers.translate("Please enter a non-zero number for quantity").then(
                (value) => {
                    api.setState("errorMessage", value);
                }
            );
        } else if (selectedQuantity > availableQuantity) {
            helpers.translate("Please enter a quantity less than or equal to quantity in stock").then(
                (value) => {
                    api.setState("errorMessage", value);
                }
            );
        } else {
            api.data.mark_for_disposal.execute({
                "sysId": api.context.props.sysId,
                "quantity": selectedQuantity,
                "consQty": availableQuantity,
            });
        }
    }
}

/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    var selectedQuantity = api.state.quantity;
    var user = api.state.user;
    var asset = api.state.asset;
    var stockroom = api.state.stockroom;
    var sysId = api.context.props.sysId;

    var availableQuantity = parseInt(api.data.look_up_consumable_record.result.quantity.value, 10);

    // Verify quantity
    var quantityCheckPassed = true;
    var regex = /^\d+$/;
    if (!regex.test(selectedQuantity) || !selectedQuantity || isNaN(selectedQuantity)) {
        helpers.translate("Please enter a non-zero number for quantity").then(
            (value) => {
                api.setState("errorMessage", value);
            }
        );
        quantityCheckPassed = false;
    } else {
        selectedQuantity = parseInt(selectedQuantity, 10);

        if (selectedQuantity < 1) {
            helpers.translate("Please enter a non-zero number for quantity").then(
                (value) => {
                    api.setState("errorMessage", value);
                }
            );
            quantityCheckPassed = false;
        } else if (selectedQuantity > availableQuantity) {
            helpers.translate("Please enter a quantity less than or equal to quantity in stock").then(
                (value) => {
                    api.setState("errorMessage", value);
                }
            );
            quantityCheckPassed = false;
        }
    }

    if (!quantityCheckPassed) { return; }

    // Verify if asset/user has been provided
    var assetUserCheckPassed = true;
    if (!asset && !user) {
        helpers.translate("Please select an asset/user to attach the consumed items to").then(
            (value) => {
                api.setState("errorMessage", value);
            }
        );
        assetUserCheckPassed = false;
    }

    if (!assetUserCheckPassed) { return; }

    api.data.consume.execute({
        "quantity": selectedQuantity,
        "user": user,
        "asset": asset,
        "stockroom": stockroom,
        "sysId": sysId
    });
}

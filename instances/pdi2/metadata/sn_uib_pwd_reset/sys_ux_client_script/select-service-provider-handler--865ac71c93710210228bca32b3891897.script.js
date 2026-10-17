/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    if (!event.payload || !event.payload.providerSelected) return;

    const selectServiceProviderState = { ...api.state.selectServiceProviderState
    };

    const previousSelectedItem = selectServiceProviderState.selectedItem;
    // Enable SMS Code Button in case no service provider was selected.
    if (!previousSelectedItem || previousSelectedItem.id === '') {
        const sendSMSCodeButtonState = { ...api.state.sendSMSCodeButtonState
        };
        sendSMSCodeButtonState.disable = false;
        api.setState("sendSMSCodeButtonState", sendSMSCodeButtonState);
    }

    selectServiceProviderState.selectedItem = event.payload.providerSelected;
    api.setState("selectServiceProviderState", selectServiceProviderState);
}

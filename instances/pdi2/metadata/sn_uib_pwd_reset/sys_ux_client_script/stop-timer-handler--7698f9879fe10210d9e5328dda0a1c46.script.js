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
    const responseObj = { ...api.state.emailDeliveryResponseObject
    };
    responseObj.startTimer = false;
    api.setState("emailDeliveryResponseObject", responseObj);

    const sendEmailCodeButtonState = { ...api.state.sendEmailCodeButtonState
    };

    sendEmailCodeButtonState.isDisabled = false;
    api.setState("sendEmailCodeButtonState", sendEmailCodeButtonState);

}

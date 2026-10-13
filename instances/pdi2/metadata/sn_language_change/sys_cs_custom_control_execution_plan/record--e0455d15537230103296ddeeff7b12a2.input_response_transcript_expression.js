function(controlData, responseValue) {
    /* Build a message for the custom input control that will be recorded in the transcript

        return 'The CustomControl myCustomInputControl just responded with response: '
            + JSON.stringify(responseValue)
            + ', and with controlData: '
            + JSON.stringify(controlData);
    */

    return 'The Language Switch Custom Control was responded to with the response: ' 
    + responseValue.yesOrNo;
}

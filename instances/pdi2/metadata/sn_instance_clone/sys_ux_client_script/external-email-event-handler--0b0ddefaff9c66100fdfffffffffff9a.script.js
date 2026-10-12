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
    const eventHandler = imports["sn_instance_clone.CloneRequestPageEventHandler"](api, helpers);

    var regexEmailValidator = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    api.setState("showInvalidEmailMessage", false);
    var _externalEmails = event.payload.fieldValue || event.payload.value;
    api.setState("externalEmails", _externalEmails);
    var _invalidEmails = [];
    if (_externalEmails) {
        _externalEmails = _externalEmails.split(',');
        for (var i in _externalEmails) {
            if (!regexEmailValidator.test(_externalEmails[i])) {
                api.setState("disableContinuebutton", true);
                _invalidEmails.push(_externalEmails[i]);
            }
        }
    }
    if (_invalidEmails.length > 0) {
        if (_invalidEmails.length == 1) {
            helpers.translate('{0} is not a valid email address', _invalidEmails[0]).then((translatedText) => {
                api.setState("showInvalidEmailMessage", true);
                api.setState("invalidEmailMessage", translatedText);
            });
        } else {
            helpers.translate('{0} are not valid email addresses', _invalidEmails.join(',')).then((translatedText) => {
                api.setState("showInvalidEmailMessage", true);
                api.setState("invalidEmailMessage", translatedText);
            });
        }
    } else {
        var _emailSummary = eventHandler.joinInternalExternalEmails(api.state.internalEmails, event.payload.value);
        api.setState("emailUponCompletionSummaryValue", _emailSummary);
        eventHandler.validateCloneRequest({'externalEmails':event.payload.value});
    }
}

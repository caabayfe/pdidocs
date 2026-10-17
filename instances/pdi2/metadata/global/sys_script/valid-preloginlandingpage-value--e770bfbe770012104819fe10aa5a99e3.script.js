(function executeRule(current, previous) {
    const validators = {
        'preLoginLandingPage': global.PreLoginLandingPageValidator
    };

    let propertyName = String(current.name);
    if (!validators.hasOwnProperty(propertyName))
        return;

    if (!validators[propertyName]) {
        _abort(current, 'Missing required validation for property ' + propertyName);
        return;
    }

    let validator = new validators[propertyName](current.getValue("value"));
    if (!validator) {
        _abort(current, 'Missing required validation for property ' + propertyName);
        return;
    }

    let response = validator.validate();
    if (!(response.isValid)) {
        _abort(current, response.message);
        return;
    }

    gs.addInfoMessage(gs.getMessage(response.message));

    function _abort(current, message) {
        current.setAbortAction(true);
        gs.addErrorMessage(gs.getMessage(message));
    }
})(current, previous);

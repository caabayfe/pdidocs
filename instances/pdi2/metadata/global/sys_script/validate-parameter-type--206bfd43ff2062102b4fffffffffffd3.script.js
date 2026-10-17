(function executeRule(current) {
    var parameterType = current.getValue('parameter_type');
    var hasScreen = current.getValue('screen');
    var hasButton = current.getValue('button');

    if (hasScreen && parameterType !== 'screen') {
        gs.addErrorMessage(gs.getMessage('Parameter Type must be set to "Screen" when a screen is configured.'));
        current.setAbortAction(true);
        return;
    }

    if (hasButton && parameterType !== 'button') {
        gs.addErrorMessage(gs.getMessage('Parameter Type must be set to "Button" when a button is configured.'));
        current.setAbortAction(true);
        return;
    }
})(current);

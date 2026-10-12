(function executeRule(current, previous /*null when async*/ ) {

    var validator = new MobileSliderInputValidator(current.sys_id);
    if (validator.isSliderInput())
        validator.isValidSliderWithErrorMessages();

})(current, previous);

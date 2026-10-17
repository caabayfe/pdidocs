(function executeRule(current, previous /*null when async*/ ) {
    var regexString = gs.getProperty("glide.notification.preference.mobile_number_validation");
    if (regexString == undefined || regexString === null || regexString.trim() === "") {
        return true;
    }
    var regex = new RegExp(regexString);
    if (!regex.test(current.getValue("phone_number"))) {
        current.setAbortAction(true);
        current.addErrorMessage("Error in mobile number validation");
    }

})(current, previous);

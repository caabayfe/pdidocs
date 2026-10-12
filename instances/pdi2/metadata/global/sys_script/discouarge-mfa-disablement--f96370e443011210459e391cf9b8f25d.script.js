(function executeRule(current, previous /*null when async*/ ) {
    var mfaDisableReasonProperty = "glide.authenticate.multifactor.disable.reason";
    var mfaDisableReason = GlideProperties.get(mfaDisableReasonProperty);
    if (current.value.changesTo('true') && mfaDisableReason) {
        //Clear the pre-filled reason before turning on MFA
        clearPropertyValue(mfaDisableReasonProperty);
    }
    //Disabling MFA requires a reason. So aborting the operation and showing an error message
    if (current.value.changesTo('false') && !mfaDisableReason) {
        // reading the error message from sys_ui_message
        gs.addErrorMessage(gs.getMessage("MFA disable message"));
        current.setAbortAction(true);
        return;
    }
})(current, previous);

function clearPropertyValue(propertyName) {
    var gr = new GlideRecord("sys_properties");
    gr.addQuery("name", propertyName);
    gr.query();
    if (gr.next()) {
        // To stop running BRs on the sys_properties
        gr.setWorkflow(false);
        gr.setValue("value", "");
        gr.update();
    }
}

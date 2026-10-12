(function executeRule(current, previous /*null when async*/ ) {

    var grWrapUpState = new GlideRecord("sys_choice");
    grWrapUpState.addQuery("name", "interaction");
    grWrapUpState.addQuery("value", "wrap_up");
    grWrapUpState.query();

    if (grWrapUpState.hasNext()) {
        //Only enable the Wrap Up state for Interactions if an active configuration record exists
        var grConfigurations = new GlideRecord("interaction_wrap_up_configuration");
        grConfigurations.addQuery("active", "true");
        grConfigurations.query();

        if (grConfigurations.hasNext()) {
            grWrapUpState.inactive = false;
        } else {
            grWrapUpState.inactive = true;
        }
        grWrapUpState.updateMultiple();
    }

})(current, previous);

function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    // auto-fill instance url
    if (newValue == "url") {
        var msAjax = new GlideAjax('MIDServerAjax');
        msAjax.addParam('sysparm_name', 'getInstanceURL');
        msAjax.getXMLAnswer(
            function(answer) {
                g_form.setValue("value", answer);
            });
    } else {
        g_form.clearValue("value");
    }

}

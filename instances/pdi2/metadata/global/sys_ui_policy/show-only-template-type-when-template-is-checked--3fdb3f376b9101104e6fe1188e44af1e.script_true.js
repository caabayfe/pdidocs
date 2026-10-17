function onCondition() {
    g_form.setValue("source_type", "TABLE");
    if (jQuery(".annotation-wrapper").eq(1).text() == getMessage("Send notification of final extraction status to:")) {
        jQuery(".annotation-wrapper").eq(1).hide();
    }
}

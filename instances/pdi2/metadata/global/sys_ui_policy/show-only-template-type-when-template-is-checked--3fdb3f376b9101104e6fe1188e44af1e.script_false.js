function onCondition() {
    g_form.setValue('template_type', '');
    if (jQuery(".annotation-wrapper").eq(1).text() == getMessage("Send notification of final extraction status to:")) {
        jQuery(".annotation-wrapper").eq(1).show();
    }
}

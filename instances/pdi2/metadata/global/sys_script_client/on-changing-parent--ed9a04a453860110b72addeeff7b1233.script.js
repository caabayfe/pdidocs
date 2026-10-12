function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '' || newValue == oldValue) {
        return;
    }

    var ga = new GlideRecord("sys_nowmq_subject");
    ga.addQuery("parent", g_form.getUniqueValue());
    ga.query();
    if (ga.next())
        g_form.showFieldMsg("parent", getMessage("Changing the parent will result in changes to the child subjects"), "warning");

}

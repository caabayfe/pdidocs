function updateAdvancedFieldLabels() {
    gs.info("Field labels update for `sys_sg_parameter_screen` has started");
    var sysDictGr = new GlideRecord('sys_dictionary');
    sysDictGr.addQuery("name", "sys_sg_parameter_screen");
    sysDictGr.addQuery("element", "advanced");
    sysDictGr.addQuery("column_label", "Advanced");
    sysDictGr.query();
    while (sysDictGr.next()) {
        sysDictGr.setValue("column_label", "Use Pages and Sections");
        sysDictGr.update();
    }
    gs.info("Field labels update for `sys_sg_parameter_screen` has ended");
}
updateAdvancedFieldLabels();

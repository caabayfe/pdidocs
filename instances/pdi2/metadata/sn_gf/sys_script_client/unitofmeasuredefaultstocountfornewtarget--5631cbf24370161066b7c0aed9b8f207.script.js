function onLoad() {

    if (g_form.isNewRecord() &&
        g_form.getValue("measure") == "" &&
        g_scratchpad.countUnitOfMeasureId != "") {
        g_form.setValue("measure", g_scratchpad.countUnitOfMeasureId);
    }

}

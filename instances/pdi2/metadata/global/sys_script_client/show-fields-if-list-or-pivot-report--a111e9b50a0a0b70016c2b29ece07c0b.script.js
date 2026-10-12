function onChange(control, oldValue, newValue, isLoading) {
    // if the form is read only just return
    var editableFields = g_form.getEditableFields();
    if (editableFields.indexOf("report_title") < 0) {
        return;
    }

    if (typeof g_savedOutputTypeChoices == "undefined")
        saveOutputTypeChoices();

    if (newValue != "")
        g_form.getReference("report", getReportCallback);
}

function getReportCallback(report) {
    var outputType = g_form.getValue("output_type");
    resetOutputTypeChoices();

    // Allow auto-resize for MultiPivot report only
    if (report.type != "pivot_v2") {
        g_form.removeOption("output_type", "PDF-autoresize");
    }

    if (report.type == "list" || report.type == "pivot" || report.type == "pivot_v2") {
        g_form.removeOption("output_type", "PNG");
        g_form.removeOption("output_type", "embedded_PNG");
    }

    if (report.type == "list") {
        g_form.setDisplay("include_detail", true);
        if (outputType != "PNG" && outputType != "embedded_PNG")
            g_form.setValue("output_type", outputType);
    } else {
        g_form.setDisplay("include_detail", false);
        g_form.removeOption("output_type", "Excel");
        g_form.removeOption("output_type", "XLSX");
        g_form.removeOption("output_type", "CSV");
        if (outputType != "Excel" && outputType != 'XLSX' && outputType != "CSV")
            g_form.setValue("output_type", outputType);
    }
}

function resetOutputTypeChoices() {
    g_form.clearOptions("output_type");
    for (var i = 0; i < g_savedOutputTypeChoices.length; i++)
        g_form.addOption("output_type", g_savedOutputTypeChoices[i].text, g_savedOutputTypeChoices[i].value, i + 1);
}

function saveOutputTypeChoices() {
    var opt = g_form.getControl("output_type").options;
    g_savedOutputTypeChoices = new Array();
    for (var i = 0; i < opt.length; i++)
        g_savedOutputTypeChoices[i] = new Option(opt[i].value, opt[i].text);
}

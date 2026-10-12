var action = 'unload_pdf';
var pdfAccessibility = false;

function onOrientationChange(dropdown) {
    switch (dropdown.value) {
        case 'portrait':
            action = 'unload_pdf';
            break;
        case 'landscape':
            action = 'unload_pdflandscape';
            break;
        case 'detailed_portrait':
            action = 'unload_pdf+';
            break;
        case 'detailed_landscape':
            action = 'unload_pdf+landscape';
    }
}

function onAccessibilityChange(checkbox) {
    if (checkbox.checked == true)
        pdfAccessibility = true;
    else
        pdfAccessibility = false;
}

function onClickOk(tableName, sys_id, view, domain, isList, sysparm_rows, locale_txt_match) {
    var dialog;
    var sysparm_query = document.querySelector('#query_param').value;
    GlideModal.prototype.get('export_to_pdf').destroy();
    if (sysparm_rows === "") sysparm_rows = 0;
    if (!isList) {
        dialog = new GwtPollDialog(tableName, "", "", view, action, "", "", "", pdfAccessibility, sys_id, domain, locale_txt_match);
        dialog.execute();
    } else {
        var num_rows = parseInt(sysparm_rows);
        if (num_rows < g_export_warn_threshold) {

            dialog = new GwtPollDialog(tableName, sysparm_query, sysparm_rows, view, action, "", "", "", pdfAccessibility, "", "", locale_txt_match);
            dialog.execute();
            return;
        }
        dialog = new GwtExportScheduleDialog(tableName, sysparm_query, sysparm_rows, view, action, "", "", "", pdfAccessibility, locale_txt_match);
        dialog.execute();
    }



}

// For keyboard accessibility
gel('export_to_pdf').addEventListener("keydown", function(event) {
    if (event.key == "Tab" && event.shiftKey && document.activeElement === gel("export_to_pdf_closemodal"))
        gel("tab-helper").focus();
});
gel('export_to_pdf').addEventListener("keyup", function(event) {
    if (event.key == "Tab" && event.target === gel("tab-helper"))
        gel("export_to_pdf_closemodal").focus();
});

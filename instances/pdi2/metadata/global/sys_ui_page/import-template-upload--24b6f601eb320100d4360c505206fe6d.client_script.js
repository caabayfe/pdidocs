addLoadEvent(formOnLoad);

//method only for >=ie9 browsers.
function placeInfoMessagesBelowHeader() {
    if ($$("#output_messages").length == 2) {
        $$("#output_messages")[1].replace($$("#output_messages")[0]);
    }
}

function downloadTemplate(excel_type) {
    var excelType = "xlsx";
    if(gel('excel_type')) {
        excelType = gel('excel_type').value;
    }
    var tableName = gel('sysparm_target').value;
    var sysparm_rows = gel('sysparm_rows').value;
    var numRows = parseInt(sysparm_rows);
    var sysparm_query = gel('sysparm_query').value;
    var sysparm_view = gel('sysparm_view').value;
    var action = "import_insert_template";
    var templateType = getTemplateType();
    var allFields = gel('all_fields').checked;
    var fields = null;

    if (allFields)
        fields = "ALL_FIELDS";

    if (templateType == 'update') {
        action = "import_update_template";
        if (numRows >= g_export_warn_threshold) {
            var exportSchduleDialog = new GwtExportScheduleDialog(tableName, sysparm_query, sysparm_rows, sysparm_view, action, fields, excelType);
            exportSchduleDialog.execute();

            return false;
        }
    }

    var pollDialog = new GwtPollDialog(tableName, sysparm_query, sysparm_rows, sysparm_view, action, fields, excelType);
    pollDialog.execute();
    return false;
}

function upload() {
    var gwt = new GwtMessage();
    var fileName = gel('attachFile').value;
    var dot = fileName.lastIndexOf('.') + 1;
    var suffix = fileName.substring(dot);
    suffix = suffix.toLowerCase();
    if (suffix == 'xls' || suffix == 'xlsx') {
        GlideUI.get().clearOutputMessages();
        var uploadDlg = new GwtUploadExcelDlg(gwt.getMessage("Upload Progress"), "40em", "10em");
        uploadDlg.show();
    } else if (fileName.empty()) {
        alert(gwt.getMessage("Please select an Excel file to upload."));
    } else {
        alert(gwt.getMessage("{0} isn't a recognized Excel file format. Only .xls or .xlsx files can be uploaded.", fileName));
    }
    return false;
}

function formOnLoad() {
    //method only for >=ie9 browsers.
    if (gel('output_messages'))
        placeInfoMessagesBelowHeader();

    var importAllowed = gel('import_allowed').value;
    if (importAllowed == 'none') {
        var form = document.forms[0];
        for (var i = 0; i < form.elements.length; i++)
            form.elements[i].disabled = true;
    }
}

function toggleSteps() {
    var needTemplate = gel('need_template').checked;
    if (needTemplate) {
        gel('step1').style.display = "";
        gel('step1_ins_idx').innerHTML = "1";
        gel('step2_ins_idx').innerHTML = "2";
    } else {
        gel('step1').style.display = "none";
        gel('step2_ins_idx').innerHTML = "1";
    }
}

function getTemplateType() {
    var templateType = 'insert';
    var sysparm_template_type = gel('sysparm_template_type');
    if(sysparm_template_type)
        templateType = sysparm_template_type.value;
    return templateType;
}

function setTemplateType(value) {
    gel('sysparm_template_type').value = value;
}

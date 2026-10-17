function setupReference() {
    var tn = gel('table_name').value;
    var x = gel('sys_display.document_key');
    x.onfocus();
    x.ac.referenceSelect('', '');
    x.ac.setTargetTable(tn);
    gel('document_keyTABLE').value = tn;
    x.ac.cacheClear();
}

function validateAndSubmit() {
    var table_name = gel('table_name').value;
    var doc = gel('document_key').value;
	var ref = gel('parent_ref').value;
    var gdw = GlideDialogWindow.get();
    var f = gdw.getPreference('onPromptComplete');

    if (typeof (f) == 'function') {
        try {
            f.call(gdw, table_name, doc, ref);
        } catch (e) {
            // naught to do here...
        }
    }
    gdw.destroy();
    return false;
}

if (gel('initial_table_name').value == '')
    addLoadEvent(setupReference);

gel('table_name').focus();

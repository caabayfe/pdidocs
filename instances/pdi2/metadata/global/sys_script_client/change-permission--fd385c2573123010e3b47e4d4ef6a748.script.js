function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
    g_form.clearMessages();
    //Type appropriate comment here, and begin script below
    if (g_form.isNewRecord()) {
        var ga = new GlideAjax('DocumentObjectSecurityAjax');
        ga.addParam('sysparm_name', 'getDocumentAccess');
        ga.addParam('sysparm_accesses_needed', 'write,delete');
        ga.addParam('sysparm_documentId', String(newValue));
        g_form.setReadOnly('permission', true);
        g_form.clearValue('perrmission');
        ga.getXML(parseData);
    }
}

function parseData(data) {
    var answer = data.responseXML.documentElement.getAttribute("answer");
    //g_form.addInfoMessage(answer); //JSON String
    var access = JSON.parse(answer);
    var canWrite = access.canWrite;
    var canDelete = access.canDelete;
    if (canWrite && canDelete) {
        g_form.removeOption('permission', 'reader');
        g_form.removeOption('permission', 'writer');
        g_form.removeOption('permission', 'owner');

        g_form.addOption('permission', 'reader', 'Reader', 1);
        g_form.addOption('permission', 'writer', 'Writer', 2);
        g_form.addOption('permission', 'owner', 'Owner', 3);
    } else if (canWrite) {
        g_form.removeOption('permission', 'reader');
        g_form.removeOption('permission', 'writer');
        g_form.removeOption('permission', 'owner');

        g_form.addOption('permission', 'reader', 'Reader', 1);
        g_form.addOption('permission', 'writer', 'Writer', 2);
    } else {
        g_form.removeOption('permission', 'reader');
        g_form.removeOption('permission', 'writer');
        g_form.removeOption('permission', 'owner');
        g_form.addErrorMessage('No Permission to add access on this document');
    }
    g_form.setReadOnly('permission', false);
}

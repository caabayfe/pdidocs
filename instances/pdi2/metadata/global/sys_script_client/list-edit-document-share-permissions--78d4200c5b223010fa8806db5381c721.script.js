function onCellEdit(sysIDs, table, oldValues, newValue, callback) {
    if (newValue == "") {
        return;
    }
    var saveAndClose = true;
    //Type appropriate comment here, and begin script below
    var id;
    for (id = 0; id < sysIDs.length; id++) {
        var sys_id = sysIDs[id];
        var ga = new GlideAjax('DocumentObjectSecurityAjax');
        ga.addParam('sysparm_name', 'getDocumentAccess');
        ga.addParam('sysparm_accesses_needed', 'write,delete');
        ga.addParam('sysparm_documentId', String(g_form.getUniqueValue()));

        ga.getXML(parseData);
    }

    function parseData(data) {
        var answer = data.responseXML.documentElement.getAttribute("answer");
        // g_form.addInfoMessage(answer); //JSON String
        var access = JSON.parse(answer);
        var canWrite = access.canWrite;
        var canDelete = access.canDelete;
        if (canWrite && !canDelete) {
            if (newValue == 'owner') {
                g_form.addErrorMessage("Do not have permission to change as Owner");
                saveAndClose = false;
            }
        }
        callback(saveAndClose);
    }
}

function startMigration() {
    var table = gel('table').value;
    var owner = gel('owner').value;
    var statusElem = document.getElementById('status');

    if (!table && !owner) {
        statusElem.innerHTML = getMessage('Please select valid values for both table and document owner');
        statusElem.className = 'status-error';
        return;
    }

    if (!table) {
        statusElem.innerHTML = getMessage('Please select a valid table');
        statusElem.className = 'status-error';
        return;
    }

    if (!owner) {
        statusElem.innerHTML = getMessage('Please select a valid user to be document owner');
        statusElem.className = 'status-error';
        return;
    }

    var ga = new GlideAjax('AttachmentMigrationUtil');
    ga.addParam('sysparm_name', 'startMigration');
    ga.addParam('sysparm_table', table);
    ga.addParam('sysparm_owner', owner);
    ga.getXMLAnswer(function(response) {
        response = JSON.parse(response);
        statusElem.innerHTML = response.message;
        if (response.status === 'success')
            statusElem.className = 'status-success';
        else if (response.status === 'error')
            statusElem.className = 'status-error';
    });
}

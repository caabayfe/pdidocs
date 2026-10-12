(function executeRule(current, previous /*null when async*/ ) {

    if (current.table_name == 'ds_folder') {
        gs.addErrorMessage(gs.getMessage('Creating or updating records referencing ds_folder is not allowed.'));
        current.setAbortAction(true);
        return;
    }

    if (current.document && current.document.changes()) {

        var docGR = new GlideRecord('ds_document');
        if (docGR.get(current.document) &&
            docGR.getValue('state') === 'expired') {

            gs.addErrorMessage(
                gs.getMessage('Expired documents cannot be referenced.')
            );
            current.setAbortAction(true);
            return;
        }
    }

})(current, previous);

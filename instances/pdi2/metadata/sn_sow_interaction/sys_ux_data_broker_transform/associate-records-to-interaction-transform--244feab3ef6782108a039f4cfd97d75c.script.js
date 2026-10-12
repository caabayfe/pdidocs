function transform(input) {
    if (!input.interactionSysId || (!input.recordSysIds && !input.query))
        return;

    let interactionSysId = input.interactionSysId;
    let associatedRecordDisplayValue = '';
    let associatedRecords = 0;

    let taskGr = new GlideRecordSecure('task');
    if (!input.recordSysIds)
        taskGr.addEncodedQuery(GlideStringUtil.escapeQueryTermSeparator(input.query), false);
    else
        taskGr.addQuery('sys_id', 'IN', GlideStringUtil.escapeQueryTermSeparator(input.recordSysIds));
    taskGr.query();
    let selectedRecords = taskGr.getRowCount();

    while (taskGr.next()) {
        let documentTable = taskGr.getValue('sys_class_name');

        let irrGr = new GlideRecordSecure('interaction_related_record');
        irrGr.addQuery('interaction', interactionSysId);
        irrGr.addQuery('document_table', documentTable);
        irrGr.addQuery('task', taskGr.getUniqueValue());
        irrGr.query();

        if (irrGr.canCreate() && !irrGr.hasNext()) {
            irrGr.interaction = interactionSysId;
            irrGr.document_table = documentTable;
            irrGr.task = taskGr.getUniqueValue();
            irrGr.insert();
            associatedRecordDisplayValue = taskGr.getDisplayValue();
            associatedRecords++;
        }
    }

    return {
        'selectedRecords': selectedRecords,
        'associatedRecordDisplayValue': associatedRecordDisplayValue,
        'associatedRecords': associatedRecords,
    };
}

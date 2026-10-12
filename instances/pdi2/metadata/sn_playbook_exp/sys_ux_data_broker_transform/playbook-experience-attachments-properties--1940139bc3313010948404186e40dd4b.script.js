function transform(input) {
    var parentTable = input.parentTable;
    var parentSysId = input.parentSysId;
    var associatedTable = input.associatedTable;
    var associatedSysId = input.associatedSysId;
    var attachment_source = input.experienceProperties.attachment_source || {};
    var attachments_read_only = input.experienceProperties.attachments_read_only || {};
	var refreshRequested = (input.advanced || {}).associatedRecordModCount || 0;


    var table = '';
    var sysId = '';

    if (attachment_source.value == 'associated_record') {
        table = associatedTable;
        sysId = associatedSysId;
    } else if (attachment_source.value == 'parent_record') {
        table = parentTable;
        sysId = parentSysId;
    }

    if (!attachment_source || !table || !sysId) return { table: null, sysId: null, readOnly: true};

    var readOnly = (attachments_read_only || {}).value === '1';

    return {
        table: table,
        sysId: sysId,
        readOnly: readOnly,
		refreshRequested: refreshRequested
		
    };
}

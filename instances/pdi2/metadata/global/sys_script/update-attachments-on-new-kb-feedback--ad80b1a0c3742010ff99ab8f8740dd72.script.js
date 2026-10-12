(function executeRule(current, previous /*null when async*/ ) {

    var attachmentSysIds = extractAttachmentIds(current.comments);

    if (attachmentSysIds.length > 0) {
        updateAttachment('kb_feedback', current.sys_id, attachmentSysIds);
        updateAttachmentTags(attachmentSysIds);
    }

    function extractAttachmentIds(commentText) {
        var sysIds = [];
        var attachmentRegex = /src="\/?sys_attachment\.do\?sys_id(&#61;|=)([a-z0-9]{32})/gm;

        match = attachmentRegex.exec(commentText);
        while (match != null) {
            sysIds.push(match[2]);
            match = attachmentRegex.exec(commentText);
        }
        return sysIds;
    }

    function updateAttachment(table, commentSysId, imgArray) {
        var sysAttach = new GlideRecord('sys_attachment');
        sysAttach.addQuery('table_name', 'kb_feedback_tmce');
        sysAttach.addQuery('table_sys_id', '-1');
        sysAttach.addQuery('sys_id', 'IN', imgArray.join());
        sysAttach.query();
        sysAttach.setValue('table_name', table);
        sysAttach.setValue('table_sys_id', commentSysId);
        sysAttach.updateMultiple();
    }

    function updateAttachmentTags(attachments) {
        var labelGR = new GlideRecord('label'),
            labelEntry = new GlideRecord('label_entry'),
            labelId;

        labelGR.addQuery('name', 'knowledge_attachment');
        labelGR.query();
        if (!labelGR.next()) {
            return;
        }

        labelId = labelGR.sys_id + '';
        var sys_attach = new GlideRecord('sys_attachment');
        sys_attach.addQuery('sys_id', 'IN', attachments.join());
        sys_attach.query();
        while (sys_attach.next()) {
            labelEntry.initialize();
            labelEntry.title = sys_attach.file_name + '';
            labelEntry.table = 'sys_attachment';
            labelEntry.table_key = sys_attach.sys_id + '';
            labelEntry.label = labelId;
            labelEntry.target = "sys_attachment.do?sys_id=" + sys_attach.sys_id + "&sysparm_view=";
            labelEntry.setWorkflow(false);
            labelEntry.insert();
        }
    }

})(current, previous);

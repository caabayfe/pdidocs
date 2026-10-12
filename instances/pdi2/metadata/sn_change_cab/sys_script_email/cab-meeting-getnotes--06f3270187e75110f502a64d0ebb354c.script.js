(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {
    var meetingNotes = current.getValue('meeting_notes');
    var result = meetingNotes.replace(/<img src="..\/sys_attachment.do\?sys_id&#61;[a-zA-Z0-9]{32}" \/>/g, function (imgTag) {
        var attachGr = new GlideRecord('sys_attachment');
        var start = imgTag.indexOf('../sys_attachment.do?sys_id&#61;') + '../sys_attachment.do?sys_id&#61;'.length;
        var attachId = imgTag.substring(start, start + 32);
        if (!attachId)
            return imgTag;
        attachGr.addQuery('sys_id', attachId);
        //for security reason make sure attachment is attached to the CAB meeting
        attachGr.addQuery('table_name', 'cab_meeting');
        attachGr.addQuery('table_sys_id', current.getUniqueValue());
        attachGr.query();
        if (attachGr.next()) {
            var attachment = new GlideSysAttachment();
            var contentType = attachGr.getValue('content_type');
            var attachmentContent = attachment.getContentBase64(attachGr);
            return '<img src=\"data:' + contentType + ';base64,' + attachmentContent + '\">';
        }
        return imgTag;
    });
    template.print(result);
})(current, template, email, email_action, event);

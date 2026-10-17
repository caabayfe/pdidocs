var ResendEmail = Class.create();
ResendEmail.prototype = {
    initialize: function() {},
    resend: function(sysId, email) {
        var emailGr = new GlideRecord('sys_email');
        if (emailGr.get(sysId)) {
            this.cloneAndQueue(emailGr, email);
        }
    },
    cloneAndQueue: function(emailGr, email) {
        var sys_id = String(emailGr.sys_id);
        emailGr.sys_id = -1;
        emailGr.copied = "NULL";
        emailGr.blind_copied = "NULL";
        emailGr.type = "NULL";
        emailGr.state = "NULL";
        emailGr.error_string = "NULL";
        emailGr.direct = "NULL";
        emailGr.message_id = "NULL";
        emailGr.recipients = email;
        emailGr.type = 'send-ready';
        var new_sys_id = emailGr.insert();
        this.copyAttachments(sys_id, new_sys_id);
    },
    copyAttachments: function(sys_id, new_sys_id) {
        //GlideSysAttachment.copy("sys_email", sys_id, "sys_email", new_sys_id);
		var attachmentGr = new GlideRecord('sys_email_attachment');
		attachmentGr.addQuery('email', sys_id);
		attachmentGr.query();
		while(attachmentGr.next()){
			attachmentGr.sys_id = -1;
			attachmentGr.email = new_sys_id;
            attachmentGr.insert();
		}
    },
    type: 'ResendEmail'
};

var validateSysUserCertificateAttachment = Class.create();
validateSysUserCertificateAttachment.prototype = {
    initialize: function(current) {
        var attachments = new GlideRecord('sys_attachment');
        attachments.addQuery('table_name', current.getTableName());
        attachments.addQuery('table_sys_id', current.sys_id);
        attachments.query();

        this.count = attachments.getRowCount();

        if (attachments.next()) {
            this.fileName = attachments.file_name;
        }

        this.attachments = attachments;
    },

    type: 'validateSysUserCertificateAttachment',

    deleteAttachments: function(current) {
        try {
            do {
                this.attachments.deleteRecord();
            } while (this.attachments.next())

        } catch (e) {
            gs.warn("Error while deleting attachments " + e);
        }
    },

    hasAttachment: function() {
        return !gs.nil(this.count) && this.count != 0;
    },

    hasMoreThanOneAttachment: function() {
        return !gs.nil(this.count) && this.count > 1;
    },

    validateExtensionForPem: function(current) {
        if (!gs.nil(this.fileName) && this.fileName.substr((this.fileName.lastIndexOf('.') + 1)).toLowerCase() !== "pem") {
            return false;
        }

        return true;
    }
};

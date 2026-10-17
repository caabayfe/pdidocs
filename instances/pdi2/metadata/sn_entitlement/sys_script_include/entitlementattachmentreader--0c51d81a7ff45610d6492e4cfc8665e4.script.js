var EntitlementAttachmentReader = Class.create();
EntitlementAttachmentReader.prototype = {
    initialize: function() {},

    /**
     * Retrieves the content of an attachment based on its sys_id.
     * 
     * This method loads the entire payload (content) of the attachment.
     * If you only need the entitlement payload file name and the record sys_id, 
     * consider using `retrieveAttachmentInfoForFiles` method
     *
     * @param {string} sysAttachmentRecordSysID - The sys_id of the attachment record.
     * @returns {Object} An object containing the file name, attachment record sys_id, 
     *                  and payload (content) of the attachment, or null values if not found.
     */ 
    getAttachmentContent: function(sysAttachmentRecordSysID) {
        let attachmentObj = {};
        const attachmentGr = new GlideRecord('sys_attachment');
        attachmentGr.addQuery('sys_id', sysAttachmentRecordSysID);
        attachmentGr.query();
        if (attachmentGr.next()) {
            const attachment = new GlideSysAttachment();
            const payload = attachment.getContent(attachmentGr);
            const file_name = attachmentGr.getValue('file_name');
            const recordSysID = attachmentGr.getUniqueValue();
            attachmentObj = {
                'file_name': global.LicensingScriptUtil.notNil(file_name) ? file_name : null,
                'attachment_record_sysID': global.LicensingScriptUtil.notNil(recordSysID) ? recordSysID : null,
                'payload': global.LicensingScriptUtil.notNil(payload) ? payload : null
            };
        }

        return attachmentObj;
    },

    /**
     * Retrieves the attachments information for entitlement data table sys_id 
     * and a list of valid entitlement payload file names.
     *
     * @param {string} entitlementDataTableSysID - The sys_id of the table associated with the attachments.
     * @param {Array<string>} entitlementPayloadFileNames - An array of file names to match attachments.
     * @returns {Object} An object mapping file names to their corresponding attachment record sys_ids.
     */
    retrieveAttachmentInfoForFiles: function(entitlementDataTableSysID, entitlementPayloadFileNames) {
        let attachmentInfo = {};
        const attachmentGR = new GlideRecord('sys_attachment');
        attachmentGR.addQuery('table_sys_id', entitlementDataTableSysID);
        attachmentGR.addQuery('file_name', 'IN', entitlementPayloadFileNames);
        attachmentGR.query();
        while (attachmentGR.next()) {
            const fileName = attachmentGR.getValue('file_name');
            const recordSysID = attachmentGR.getUniqueValue();
            attachmentInfo[fileName] = recordSysID;
        }

        return attachmentInfo;
    },

    type: 'EntitlementAttachmentReader'
};

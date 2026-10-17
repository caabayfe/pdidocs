function transform(input) {
    function deleteEntryFromAttachmentCleaner(attachmentSysId) {
        // Find the sys_id from sys_attachment_cleaner_entry table
        var gr = new GlideRecord('sys_attachment_cleaner_entry');
        gr.addQuery('attachment', attachmentSysId);
        gr.query();
        if (gr.next()) {
            // Delete the entry using Global scope
            new global.ACEAppBuilderGlobalScopedUtil().deleteRecord('sys_attachment_cleaner_entry', gr.getUniqueValue());
        }
    }
    try {
        //input.icon = sys_attachment sys_id
        if (!input || !input.sys_id || !input.icon) return [];
        var updateUtil = new global.ACEAppBuilderGlobalScopedUtil();
        var prop = {};
        if (input.revert_to_default) {
            prop.icon = '';
            prop.display_default_icon = true;
        } else {
            prop.icon = input.icon;
            prop.display_default_icon = false;
        }
        var update = updateUtil.updateRecord('va_branding_contact_menu', input.sys_id, prop);
        if(update) deleteEntryFromAttachmentCleaner(input.icon);
        return update;
    } catch (e) {
        return false;
    }
}

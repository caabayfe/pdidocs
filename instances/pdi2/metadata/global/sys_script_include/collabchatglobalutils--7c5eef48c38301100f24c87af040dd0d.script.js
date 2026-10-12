var CollabChatGlobalUtils = Class.create();
CollabChatGlobalUtils.prototype = {
    initialize: function() {},

    generateSequence: function(tableName) {
        return GlideCounter.next(tableName);
    },

    getCollabChatCreatorLanguage: function(collabChatSysId) {
        var creatorLang = 'en';
        var gr = new GlideRecord('sys_cs_collab_member');
        gr.addQuery('collab_chat', collabChatSysId);
        gr.addQuery('member_type', 'creator');
        gr.query();

        if (gr.next()) {
            var creatorId = gr.member.user_document;
            try {
                var originalUser = gs.getSession().impersonate(creatorId);
                creatorLang = gs.getUser().getLanguage();
            } finally {
                gs.getSession().impersonate(originalUser);
            }
        }

        return creatorLang;
    },
    executeScheduledJob: function(glideRecord) {
        SncTriggerSynchronizer.executeNow(glideRecord);
    },
    isCollabChatEnabledInUserDomain: function(userID) {
        return sn_collab.CollabChatScriptObject.isCollabChatEnabledInUserDomain(userID);
    },
    isCollabChatEnabledInDomain: function() {
        return sn_collab.CollabChatScriptObject.isCollabChatEnabledInDomain();
    },

    getCollabChatSettingRecordsNoDomain: function() {
        var settingsGR = new GlideRecord("sys_cs_collab_settings");
        settingsGR.queryNoDomain();

        return settingsGR;
    },

    /* offset - byte number to start reading at
    limit - Maximum bytes to be used to create the temporary attachment record */
    createAttachmentFromBinaryData: function(attachmentGr, offset, limit) {
        var gsa = new GlideSysAttachmentInputStream(attachmentGr.sys_id.toString());
        var baos = new Packages.java.io.ByteArrayOutputStream();
        gsa.writeTo(baos, offset, limit);
        baos.close();
        var binaryData = baos.toByteArray();
        var fileName = 'sb_upla_temp_' + attachmentGr.file_name;
        return new GlideSysAttachment().write(attachmentGr, fileName, 'application/octet-stream', binaryData);
    },

    sanitizeHTML: function(content) {
        return SNC.GlideHTMLSanitizer.sanitize(content);
    },

    hasAdditionalCreateAccess: function(documentTable, documentId) {
        // for back compatability. If the new script include does not exist, return true.
        if (!sn_oe_sfs.SidebarAccessCheckUtils)
            return true;
        return new sn_oe_sfs.SidebarAccessCheckUtils().canWrite(documentTable, documentId);
    },

	impersonateUser: function(userId) {
		var impUser = new GlideImpersonate();
		impUser.impersonate(userId);		
	},

    // This method runs additional access and domain check. Declarative action scripted condition has a limited length.
    // Combining those checks together to avoid hitting the lenght limitation.
    hasAccessToCreateSidebar: function(documentTable, documentId) {
        return this.isCollabChatEnabledInDomain() && this.hasAdditionalCreateAccess(documentTable, documentId);
    },

    /**
     * returns list of child tables, including the parent table
     */
    getChildTables: function(tableName) {
        var list = [];
        if (!gs.tableExists(tableName))
            return list;
        var util = new TableUtils(tableName);
        var tables = util.getAllExtensions().toArray();
        //preparing the list explicitly as the return type of `getAllExtensions` is not compatible with js list
        tables.forEach(function(tableName) {
            list.push(''+tableName);
        });
        return list;
    },

    /**
    * Returns root table in hierarchy, excluding the sys_metadata table
    */
    getAbsoluteBase: function(tableName) {
        if (!gs.tableExists(tableName))
            return "";
        var util = new TableUtils(tableName);
        return util.getAbsoluteBase();
    },

    isTableInstanceOf: function(derived, base) {
		return GlideDBObjectManager.get().isInstanceOf(derived, base);
    },
	
    type: 'CollabChatGlobalUtils'
};

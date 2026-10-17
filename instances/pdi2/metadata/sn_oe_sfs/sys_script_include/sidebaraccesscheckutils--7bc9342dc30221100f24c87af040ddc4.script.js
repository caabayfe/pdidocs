var SidebarAccessCheckUtils = Class.create();
SidebarAccessCheckUtils.prototype = {
    initialize: function() {
    },

	canWrite: function(documentTable, documentId) {
		var enabled = gs.getProperty('sn_oe_sfs.u_com.glide.cs.collab_additional_access_check_enabled');
		if (enabled != 'true')
			return true;

		try {
			var eps = new GlideScriptedExtensionPoint().getExtensions('sn_oe_sfs.SidebarAdditionalAccessCheck');
			for (var i = 0; i < eps.length; i++) {
				if (!eps[i].canWrite(documentTable, documentId)) {
					return false;
				}
			}
		} catch (ex) {
			gs.error('Error running sn_oe_sfs.SidebarAdditionalAccessCheck extension points.');
		}
		return true;
	},

	canRead: function(collabChatSysId, documentTable, documentId) {
		var enabled = gs.getProperty('sn_oe_sfs.u_com.glide.cs.collab_additional_access_check_enabled');
		if (enabled != 'true')
			return true;

		// if the current user is a member, always grant the user access.
		if (new sn_oe_sfs.CollabChatUtils().isCollabChatMember(collabChatSysId, gs.getUserID())) {
			return true;
		}

		if (!documentTable || !documentId) {
			var gr = new GlideRecord('sys_cs_collab_record');
			gr.addQuery('collab_chat', collabChatSysId);
			gr.query();
			if (!gr.next())
				return true;

			documentTable = gr.getValue('table');
			documentId = gr.getValue('document');
		}

		try {
			var eps = new GlideScriptedExtensionPoint().getExtensions('sn_oe_sfs.SidebarAdditionalAccessCheck');
			for (var i = 0; i < eps.length; i++) {
				if (!eps[i].canRead(collabChatSysId, documentTable, documentId)) {
					return false;
				}
			}
		} catch (ex) {
			gs.error('Error running sn_oe_sfs.SidebarAdditionalAccessCheck extension points.');
		}
		return true;
	},

	/*
	API to check whether the sidebar is enabled or not
	*/
	isSidebarEnabled: function(tableName, sysId) {
		return sn_collab.CollabChatScriptObject.isCollabChatEnabledForRecord(tableName, sysId)
		&& gs.getProperty('com.glide.cs.collab.enabled')=='true';
	},

	_isEligibleSidebarRecord: function(tableName, sysId, condition){
		var gr = new GlideRecord(tableName);
		gr.addQuery('sys_id', sysId);
		gr.addEncodedQuery(condition);
		gr.query();
		return gr.hasNext();
	},

	/*
	API to check whether the sidebar is enabled for the record or not
	*/
	isSidebarEnabledRecord: function(recordRef) {
		var tableName = recordRef?.getTableName();
		var sysId = recordRef?.sys_id;
		return this.isSidebarEnabled(tableName, sysId);
	},
    /**
     * This method runs consolidated check for showing sidebar discuss button. Declarative action scripted condition has a limited length.
     * Combining those checks together to avoid hitting the length limitation.
     */
    hasAccessToCreateSidebar: function(documentTable, documentId) {
        return sn_collab.CollabChatScriptObject.isCollabChatEnabledInDomain() &&
            this.isSidebarEnabled(documentTable, documentId) &&
            this.canWrite(documentTable, documentId);
    },
    type: 'SidebarAccessCheckUtils'
};

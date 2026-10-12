var MultiProviderDocumentsUtil = Class.create();
MultiProviderDocumentsUtil.prototype = {
    initialize: function() {},

    deleteDocument: function(sysId, deleteAttachments) {
        return this.deleteDocumentAndVersions(sysId, deleteAttachments);
    },
    deleteDocumentAndVersions: function(sysId, deleteAttachments) {
        var v = new GlideRecord("mp_document");
        var result;
        try {
            if (v.get(sysId) && v.canDelete()) {
                // delete versions first and then the document
                result = this.deleteDocumentVersions(sysId, deleteAttachments);
                var a = v.attachment;
                if (a && deleteAttachments) {
                    var attachments = [];
                    attachments.push(a.toString());
                    this._deleteMultiple('sys_attachment', attachments);
                }
                v.deleteRecord();
            }
            return result;
        } catch (err) {
            gs.error('unable to delete document' + err.toString());
            return false;
        }
    },
    getLatestVersion: function(documentSysId) {
        var gr = new GlideRecord("mp_document");
        try {
            if (gr.get(documentSysId)) {
                var v = new GlideRecord("mp_document_version");
                v.addQuery("document", documentSysId);
                v.orderByDesc('version_last_modified');
                v.setLimit(1);
                v.query();
                if (v.next())
                    return v;
            }
        } catch (err) {
            gs.error('Unable to find the latest version for the document provided : ' + err.toString());
        }
    },
    deleteDocumentVersion: function(documentVersionSysId, deleteAttachments) {
        var gr = new GlideRecord("mp_document_version");
        try {
            if (gr.get(documentVersionSysId) && gr.canDelete()) {
                var a = gr.attachment;
                if (a && deleteAttachments) {
                    var attachments = [];
                    attachments.push(a.toString());
                    this._deleteMultiple('sys_attachment', attachments);
                }
                gr.deleteRecord();
            }
            return true;
        } catch (err) {
            gs.error('unable to delete document version' + err.toString());
            return false;
        }
    },

    deleteDocumentVersions: function(documentSysId, deleteAttachments) {
        var gr = new GlideRecord("mp_document_version");
        gr.addQuery("document", documentSysId);
        gr.query();
        try {
            if (gr.canDelete()) {
                var attachments = [];
                var versions = [];
                while (gr.next()) {
                    var a = gr.attachment;
                    var s = gr.sys_id;
                    versions.push(s.toString());
                    if (!gs.nil(a)) {
                        attachments.push(a.toString());
                    }
                }
                if (deleteAttachments) this._deleteMultiple('sys_attachment', attachments);
                this._deleteMultiple('mp_document_version', versions);
            }
            return true;
        } catch (err) {
            gs.error('unable to delete document versions' + err.toString());
            return false;
        }
    },
    lookupRecord: function(targetTable, targetTableSysId) {
        var gr = new GlideRecord(targetTable);
        gr.get(targetTableSysId);
        return gr;
    },
    targetRecordExists: function(targetTable, targetTableSysId) {
        try {
            var gr = new GlideRecord(targetTable);
            if (gr.get(targetTableSysId)) {
                return true;
            }
            return false;
        } catch (err) {
            return false;
        }
    },
    updateDeltaToken: function(deltaToken) {
        var gr = new GlideRecord('sys_properties');
        try {
            gr.addActiveQuery();
            gr.addQuery('name', 'com.glide.multiprovider.azure.user.deltatoken');
            gr.query();
            if (gr.next()) {
                gr.value = deltaToken;
                gr.update();
                return true;
            } else {
                return false;
            }
        } catch (err) {
            return false;
        }
    },
    deleteCollaborator: function(collaboratorId) {
        var gr = new GlideRecord('mp_collaborators');
        try {
            gr.addQuery("collaborator_id", collaboratorId);
            gr.query();
            if (gr.next()) {
                gr.deleteRecord();
                return true;
            } else {
                return false;
            }
        } catch (err) {
            return false;
        }
    },
    getRecord: function(tab, tab_sys_id) {
        var gr = new GlideRecord(tab);
        gr.addQuery("sys_id", tab_sys_id);
        gr.query();
        gr.next();
        gs.info("record returned from getRecord:" + gr.sys_id);
        return gr;
    },
    _deleteMultiple: function(tableName, ids_array) {
        if (ids_array && ids_array.length > 0) {
            var glideRecordByArray = new GlideRecord(tableName);
            glideRecordByArray.addQuery('sys_id', 'IN', ids_array);
            glideRecordByArray.deleteMultiple();
        }
    },
    createProviderPermission: function(description, permission, provider_detail) {
        var gr = new GlideRecord('mp_provider_permission');
        try {
            gr.initialize();
            gr.description = description;
            gr.permission = permission;
            gr.provider_detail = provider_detail;
            gr.insert();
            return true;
        } catch (err) {
            return false;
        }
    },
    createDocumentAction: function(description, document_action_name, provider_permission, subflow, provider_detail) {
        var gr = new GlideRecord('mp_document_action');
        try {
            gr.initialize();
            gr.description = description;
            gr.document_action_name = document_action_name;
            gr.provider_permission = provider_permission;
            gr.subflow = subflow;
            gr.provider_detail = provider_detail;
            gr.insert();
            return true;
        } catch (err) {
            return false;
        }
    },
    getDocumentName: function(documentSysId) {
        var gr = new GlideRecord("mp_document");
        try {
            if (gr.get(documentSysId)) {
                var name = gr.getValue('document_name');
                return name;
            }
        } catch (err) {
            gs.error('Invalid Document SysID!');
        }
    },
    type: 'MultiProviderDocumentsUtil'
};

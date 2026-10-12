var DocumentObjectSecurity = Class.create();
DocumentObjectSecurity.prototype = {
    initialize: function() {},
    canReadDocument: function(document) {
        if (document.sys_id.nil() || document.isNewRecord())
            return true;
        // moved to adminAccess method
        //if (gs.hasRole('platform_document_management_admin'))
        //    return true;
        // give access to owner        
        if (this._isOwner(document))
            return true;
        if (this._isReviewer(document) || this._isApprover(document))
            return true;
        var documentId = document.sys_id;
        var accesses = [];
        if (document.admins_access)
            accesses.push('DmAdmin');
        if (document.inherited_access)
            accesses.push('Inherited');
        if (document.share_access)
            accesses.push('Restricted');
        for (var i = 0; i < accesses.length; i++) {
            gs.info(accesses[i].trim());
            var accessType = accesses[i].trim();
            var success = this.runAccess(document, accessType, 'read');
            if (success) return true;
        }
        return false;
    },
    canReadDocumentId: function(documentId) {
        if (!documentId || documentId.isNil() || documentId == '-1') {
            return true;
        }
        var document = new GlideRecord('ds_document');
        document.get(documentId);
        return document.canRead();
    },
    canWriteDocumentId: function(documentId) {
        //TODO: check if to return true/false
        if (!documentId || documentId.isNil() || documentId == '-1') {
            return true;
        }
        var document = new GlideRecord('ds_document');
        document.get(documentId);
        return document.canWrite();
    },
    canCreateDocumentId: function(documentId) {
        //TODO: check if to return true/false
        if (!documentId || documentId.isNil() || documentId == '-1') {
            return true;
        }
        var document = new GlideRecord('ds_document');
        document.get(documentId);
        return document.canCreate();
    },
    canDeleteDocumentId: function(documentId) {
        //TODO: check if to return true/false
        if (!documentId || documentId.isNil() || documentId == '-1') {
            return false;
        }
        var document = new GlideRecord('ds_document');
        document.get(documentId);
        return document.canDelete();
    },
    canReadDocumentVersion: function(version) {
        var document = version.document;
        var gr = new GlideRecord('ds_document');
        gr.get(document);
        if (gr.canRead()) {
            return true;
        }
        return false;
    },
    canCreateDocumentVersion: function(version) {
        var document = version.document;
        var gr = new GlideRecord('ds_document');
        gr.get(document);
        if (gr.canCreate()) {
            return true;
        }
        return false;
    },
    canReadDocumentVersionId: function(versionId) {
        if (!versionId || versionId.isNil() || versionId == '-1') {
            return true;
        }
        var version = new GlideRecord('ds_document_version');
        version.get(versionId);
        return this.canReadDocumentVersion(version);
    },
    canCreateDocumentVersionId: function(versionId) {
        if (!versionId || versionId.isNil() || versionId == '-1') {
            return true;
        }
        var version = new GlideRecord('ds_document_version');
        version.get(versionId);
        return this.canCreateDocumentVersion(version);
    },
    canWriteDocumentVersionId: function(versionId) {
        if (!versionId || versionId.isNil() || versionId == '-1') {
            return true;
        }
        var version = new GlideRecord('ds_document_version');
        version.get(versionId);
        return this.canWriteDocumentVersion(version);
    },
    canWriteDocumentVersion: function(version) {
        var document = version.document;
        var gr = new GlideRecord('ds_document');
        gr.get(document);
        if (gr.canWrite()) {
            return true;
        }
        return false;
    },
    canDeleteDocumentVersion: function(version) {
        var document = version.document;
        var gr = new GlideRecord('ds_document');
        gr.get(document);
        if (gr.canDelete()) {
            return true;
        }
        return false;
    },
    canReadDocumentReviewerApprover: function(user) {
        var document = user.document;
        var gr = new GlideRecord('ds_document');
        gr.get(document);
        if (gr.canRead()) {
            return true;
        }
        return false;
    },
    canCreateDocumentReviewerApprover: function(user) {
        var document = user.document;
        var gr = new GlideRecord('ds_document');
        gr.get(document);
        if (gr.canCreate()) {
            return true;
        }
        return false;
    },
    canReadDocumentReviewerId: function(reviewerId) {
        if (!reviewerId || reviewerId.isNil() || reviewerId == '-1') {
            return true;
        }
        var reviewer = new GlideRecord('ds_document_reviewer');
        reviewer.get(reviewerId);
        return this.canReadDocumentReviewerApprover(reviewer);
    },
    canCreateDocumentReviewerId: function(reviewerId) {
        if (!reviewerId || reviewerId.isNil() || reviewerId == '-1') {
            return true;
        }
        var reviewer = new GlideRecord('ds_document_reviewer');
        reviewer.get(reviewerId);
        return this.canCreateDocumentReviewerApprover(reviewer);
    },
    canWriteDocumentReviewerId: function(reviewerId) {
        if (!reviewerId || reviewerId.isNil() || reviewerId == '-1') {
            return true;
        }
        var reviewer = new GlideRecord('ds_document_reviewer');
        reviewer.get(reviewerId);
        return this.canWriteDocumentReviewerApprover(reviewer);
    },
    canReadDocumentApproverId: function(approverId) {
        if (!approverId || approverId.isNil() || approverId == '-1') {
            return true;
        }
        var approver = new GlideRecord('ds_document_approver');
        approver.get(approverId);
        return this.canReadDocumentReviewerApprover(approver);
    },
    canCreateDocumentApproverId: function(approverId) {
        if (!approverId || approverId.isNil() || approverId == '-1') {
            return true;
        }
        var approver = new GlideRecord('ds_document_approver');
        approver.get(approverId);
        return this.canCreateDocumentReviewerApprover(approver);
    },
    canWriteDocumentApproverId: function(approverId) {
        if (!approverId || approverId.isNil() || approverId == '-1') {
            return true;
        }
        var approver = new GlideRecord('ds_document_approver');
        approver.get(approverId);
        return this.canWriteDocumentReviewerApprover(approver);
    },
    canWriteDocumentReviewerApprover: function(reviewer) {
        var document = reviewer.document;
        var gr = new GlideRecord('ds_document');
        gr.get(document);
        if (gr.canWrite()) {
            return true;
        }
        return false;
    },
    canDeleteDocumentReviewerApprover: function(reviewer) {
        var document = reviewer.document;
        var gr = new GlideRecord('ds_document');
        gr.get(document);
        if (gr.canDelete()) {
            return true;
        }
        return false;
    },
    canWriteDocument: function(document) {
        // TODO: check this
        if (document.sys_id.nil() || document.isNewRecord())
            return true;
        // moved to adminAccess method
        //if (gs.hasRole('platform_document_management_admin'))
        //    return true;
        var documentId = document.sys_id;
        // give access if owner                
        if (this._isOwner(document))
            return true;
        // otherwise follow access
        var accesses = [];
        if (document.admins_access)
            accesses.push('DmAdmin');
        if (document.inherited_access)
            accesses.push('Inherited');
        if (document.share_access)
            accesses.push('Restricted');
        for (var i = 0; i < accesses.length; i++) {
            gs.info(accesses[i].trim());
            var accessType = accesses[i].trim();
            var success = this.runAccess(document, accessType, 'write');
            if (success) return true;
        }
        return false;
    },
    canCreateDocument: function(document) {
        // TODO: check this entire function
        if (document.sys_id.nil() || document.isNewRecord())
            return true;
        if (gs.hasRole('platform_document_management_admin') || gs.hasRole('platform_document_management_writer'))
            return true;
        //var documentId = document.sys_id;
        //var accesses = [];
        // TODO: for create no need consider access level?
        //if (document.admins_access)
        //   accesses.push('DmAdmin');
        //if (document.inherited_access)
        //    accesses.push('Inherited');
        //if (document.share_access)
        //    accesses.push('Restricted');
        //for (i = 0; i < accesses.length; i++) {
        //    gs.info(("evaluating " + accesses[i]));
        //    gs.info(accesses[i].trim());
        //    var accessType = accesses[i].trim();
        //    var success = this.runAccess(document, accessType, 'create');
        //    if (success) return true;
        //}
        return false;
    },
    canDeleteDocument: function(document) {
        // TODO: check this entire function       
        // moved to adminAccess method
        //if (gs.hasRole('platform_document_management_admin'))
        //    return true;
        // give access if owner		        
        if (this._isOwner(document))
            return true;

        var documentId = document.sys_id;
        var accesses = [];
        if (document.admins_access)
            accesses.push('DmAdmin');
        if (document.inherited_access)
            accesses.push('Inherited');
        if (document.share_access)
            accesses.push('Restricted');
        for (var i = 0; i < accesses.length; i++) {
            gs.info(accesses[i].trim());
            var accessType = accesses[i].trim();
            var success = this.runAccess(document, accessType, 'delete');
            if (success) return true;
        }
        return false;
    },
    //Folder Permissions
    canReadFolder: function(folder) {
        if (this._isOwner(folder))
            return true;
        return this.runFolderInheritedAccess(folder, 'read');
    },
    canReadFolderRecursive: function(folder) {
        if (this.canReadFolder(folder))
            return true;
        if (!folder.parent_folder.nil()) {
            var parentFolder = new GlideRecord('ds_folder');
            if (parentFolder.get(folder.parent_folder)) {
                if (this.canReadFolderRecursive(parentFolder))
                    return true;
            }
        }
        return false;
    },
    canWriteFolder: function(folder) {
        if (this._isOwner(folder))
            return true;
        return this.runFolderInheritedAccess(folder, 'write');
    },
    canWriteFolderRecursive: function(folder) {
        if (this.canWriteFolder(folder))
            return true;
        if (!folder.parent_folder.nil()) {
            var parentFolder = new GlideRecord('ds_folder');
            if (parentFolder.get(folder.parent_folder)) {
                if (this.canWriteFolderRecursive(parentFolder))
                    return true;
            }
        }
        return false;
    },
    canCreateFolder: function(folder) {
        if (folder.parent_folder.nil())
            return true;
        return false;
    },
    canCreateFolderRecursive: function(folder) {
        if (this.canCreateFolder(folder))
            return true;
        if (!folder.parent_folder.nil()) {
            var parentFolder = new GlideRecord('ds_folder');
            if (!parentFolder.get(folder.parent_folder)) {
                gs.warn("Invalid parent_folder: " + folder.parent_folder);
                return true;
            }
            if (this.canWriteFolderRecursive(parentFolder))
                return true;
        }
        return false;
    },
    canDeleteFolder: function(folder) {
        // Check direct ownership of the folder
        if (this._isOwner(folder))
            return true;
        return this.runFolderInheritedAccess(folder, 'delete');
    },
    canDeleteFolderRecursive: function(folder) {
        if (this.canDeleteFolder(folder))
            return true;
        if (!folder.parent_folder.nil()) {
            var parentFolder = new GlideRecord('ds_folder');
            if (parentFolder.get(folder.parent_folder)) {
                if (this.canDeleteFolderRecursive(parentFolder))
                    return true;
            }
        }
        return false;
    },
    canReadFolderId: function(folderId) {
        // Null folder ID represents a root-level folder
        if (!folderId || folderId.isNil() || folderId == '-1') {
            return true;
        }
        var folder = new GlideRecord('ds_folder');
        if (folder.get(folderId))
            return folder.canRead();
        return false;
    },
    canWriteFolderId: function(folderId) {
        // Null folder ID represents a root-level folder
        if (!folderId || folderId.isNil() || folderId == '-1') {
            return true;
        }
        var folder = new GlideRecord('ds_folder');
        if (folder.get(folderId))
            return folder.canWrite();
        return false;
    },
    canCreateFolderId: function(folderId) {
        // Null folder ID represents a root-level folder
        if (!folderId || folderId.isNil() || folderId == '-1') {
            return true;
        }
        var folder = new GlideRecord('ds_folder');
        if (folder.get(folderId))
            return folder.canCreate();
        return false;
    },
    canDeleteFolderId: function(folderId) {
        // Null folder ID represents a root-level folder
        if (!folderId || folderId.isNil() || folderId == '-1') {
            return false;
        }
        var folder = new GlideRecord('ds_folder');
        if (folder.get(folderId))
            return folder.canDelete();
        return false;
    },
    canWritePermission: function(permission) {
        if (permission.sys_id.nil() || permission.isNewRecord())
            return true;
        var document = permission.document;
        var gr = new GlideRecord('ds_document');
        gr.get(document);

        // admins can access
        var ownerAccess = gr.canDelete();
        if (ownerAccess) {
            return true;
        }
        // created by current user and should have writer access
        var createdByThisUser = this._isCreatedByCurrentUser(permission);
        var writerAccess = gr.canWrite();
        return createdByThisUser && writerAccess;
    },
    canDeletePermission: function(permission) {
        //same as write permission
        return this.canWritePermission(permission);
    },
    runAccess: function(document, accessType, operation) {
        var access = false;
        switch (accessType) {
            case 'DmAdmin':
                gs.info("Running DmAdmin access");
                access = this.runAdminAccess(document, operation);
                break;
            case 'Restricted':
                gs.info("Running Restricted access");
                access = this.runRestrictedAccess(document, operation);
                break;
            case 'Inherited':
                gs.debug("Running Inherited access");
                access = this.runInheritedAccess(document, operation);
                break;
            default:
                gs.debug("default access");
                access = this.runInheritedAccess(document, operation);
        }
        return access;
    },
    runAdminAccess: function(document, operation) {
        gs.info("Running admin access");
        var access = false;
        switch (operation) {
            case 'read':
                //if (gs.hasRole('platform_document_management_reader')) {
                //   access = true;
                //}
                if (gs.hasRole('platform_document_management_admin')) {
                    access = true;
                }
                break;
            case 'create':
                //if (gs.hasRole('platform_document_management_writer')) {
                //    access = true;
                //}
                if (gs.hasRole('platform_document_management_admin')) {
                    access = true;
                }
                break;
            case 'write':
                //if (gs.hasRole('platform_document_management_writer')) {
                //    access = true;
                //}
                if (gs.hasRole('platform_document_management_admin')) {
                    access = true;
                }
                break;
            case 'delete':
                //if (gs.hasRole('platform_document_management_delete')) {
                //    access = true;
                //}
                if (gs.hasRole('platform_document_management_admin')) {
                    access = true;
                }
                break;
            default:
                if (gs.hasRole('platform_document_management_admin')) {
                    access = true;
                }
        }
        return access;
    },
    runInheritedAccess: function(document, operation) {
        gs.info("Running inherited access");

        return this._runInheritedAccessInternal(
            'ds_document_references',
            'document',
            document.sys_id,
            operation,
            function(targetGR) {
                // Special logic for delete: role check + canRead()
                if (!gs.hasRole('platform_document_management_delete')) {
                    return false;
                }
                return targetGR.canRead();
            }
        );
    },
    _runInheritedAccessInternal: function(referenceTable, refField, refId, operation, deleteLogicCallback) {
        var gr = new GlideRecord(referenceTable);
        gr.addQuery(refField, refId);
        gr.query();

        while (gr.next()) {
            var tableName = gr.getValue('table_name');
            var targetSysId = gr.getValue('target_record');

            var targetGR = new GlideRecord(tableName);
            if (!targetGR.get(targetSysId))
                continue;

            var access = false;
            switch (operation) {
                case 'read':
                    access = targetGR.canRead();
                    break;
                case 'write':
                    access = targetGR.canWrite();
                    break;
                case 'create':
                    access = targetGR.canCreate();
                    break;
                case 'delete':
                    access = deleteLogicCallback ? deleteLogicCallback(targetGR) : targetGR.canDelete();
                    break;
                default:
                    access = false;
            }

            if (access)
                return true;
        }

        return false;
    },
    runRestrictedAccess: function(document, operation) {
        var permission = 'owner'; // default permission needed for create and delete

        if (operation == 'read') {
            permission = permission + ',writer' + ',reader';
        }

        if (operation == 'write') {
            permission = permission + ',writer';
        }
        // to handle shared with writer/reader + dm delete role
        if (operation == 'delete' && gs.hasRole('platform_document_management_delete')) {
            permission = permission + ',writer' + ',reader';
        }

        // check user
        var u = gs.getUser().getID();
        var documentId = document.sys_id;
        var userRecords = this.getDocumentsByPermission(documentId, permission, 'ds_document_user_can_access_mtom');
        while (userRecords.next()) {
            gs.info("User record found");
            var user = userRecords.user;
            gs.info('restricted user user' + user);
            if (user == u) {
                gs.info('restricted user == u');
                return true;
            }
        }
        // check group
        var groupRecords = this.getDocumentsByPermission(documentId, permission, 'ds_document_ug_can_access_mtom');
        while (groupRecords.next()) {
            var group = groupRecords.user_group;
            if (gs.getUser().isMemberOf(group)) {
                return true;
            }
        }
        // check role        
        var roleRecords = this.getDocumentsByPermission(documentId, permission, 'ds_document_ur_can_access_mtom');
        while (roleRecords.next()) {
            var role = roleRecords.user_role.name;
            if (gs.hasRole(role)) {
                return true;
            }
        }
        // check user criteria
        var ucRecords = this.getDocumentsByPermission(documentId, permission, 'ds_document_uc_can_access_mtom');
        while (ucRecords.next()) {
            var uc = ucRecords.user_criteria;
            gs.info('uc ' + uc);
            if (sn_uc.UserCriteriaLoader.userMatches(u, [uc])) {
                return true;
            }
        }
        return false;
    },
    runFolderInheritedAccess: function(folder, operation) {
        gs.info("Running folder inherited access");

        return this._runInheritedAccessInternal(
            'ds_folder_references',
            'folder',
            folder.sys_id,
            operation,
            null // Use default canDelete() logic
        );
    },
    getDocumentsByPermission: function(documentId, permission, table) {
        var gr = new GlideRecord(table);
        gr.addQuery('document', documentId);
        var ps = permission.split(',');
        var qc = gr.addQuery('permission', ps[0]);
        for (var i = 1; i < ps.length; i++) {
            qc.addOrCondition('permission', ps[i]);
        }
        gr.orderBy('permission');
        gr.query();
        return gr;
    },
    grantReadAccessToDocument: function(documentGR, userGR) {
        var gr = documentGR;
        var currUser = userGR;

    },
    _isCreatedByCurrentUser: function(record) {
        var u = gs.getUserName();
        var a = (record.sys_created_by == u);
        return a;
    },
    _isOwner: function(current) {
        var u = gs.getUser().getID();
        var a = (current.owner == u);
        return a;
    },
    _isReviewer: function(current) {
        var documentReviewer = new GlideRecord("ds_document_reviewer");
        documentReviewer.addQuery("document", current.getUniqueValue());
        documentReviewer.addQuery("reviewer", gs.getUserID());
        documentReviewer.query();

        return documentReviewer.hasNext();
    },

    _isApprover: function(current) {
        var documentApprovers = new GlideRecord("ds_document_approver");
        documentApprovers.addQuery("document", current.getUniqueValue());
        documentApprovers.addQuery("approver", gs.getUserID());
        documentApprovers.query();

        return documentApprovers.hasNext();
    },

    hasOwnerPermissionViaMTOM: function(document) {
        return this._hasPermissionViaMTOM(document, 'owner');
    },

    _hasPermissionViaMTOM: function(document, permission) {
        var userId = gs.getUserID();
        var documentId = document.sys_id;

        // User
        var userGR = this.getDocumentsByPermission(
            documentId, permission, 'ds_document_user_can_access_mtom'
        );
        while (userGR.next()) {
            if (userGR.user == userId) return true;
        }

        // Group
        var groupGR = this.getDocumentsByPermission(
            documentId, permission, 'ds_document_ug_can_access_mtom'
        );
        while (groupGR.next()) {
            if (gs.getUser().isMemberOf(groupGR.user_group)) return true;
        }

        // Role
        var roleGR = this.getDocumentsByPermission(
            documentId, permission, 'ds_document_ur_can_access_mtom'
        );
        while (roleGR.next()) {
            if (gs.hasRole(roleGR.user_role.name)) return true;
        }

        // User Criteria
        var ucGR = this.getDocumentsByPermission(
            documentId, permission, 'ds_document_uc_can_access_mtom'
        );
        while (ucGR.next()) {
            if (sn_uc.UserCriteriaLoader.userMatches(userId, [ucGR.user_criteria])) {
                return true;
            }
        }

        return false;
    },


    type: 'DocumentObjectSecurity'
};

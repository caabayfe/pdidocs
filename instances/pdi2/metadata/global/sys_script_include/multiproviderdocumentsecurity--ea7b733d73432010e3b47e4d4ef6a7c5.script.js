var MultiProviderDocumentSecurity = Class.create();
MultiProviderDocumentSecurity.prototype = {
    initialize: function() {},
    canReadDocument: function(document) {
        if (document.sys_id.nil())
            return true;

        if (gs.hasRole('mp_document_admin'))
            return true;
        return this._isCreatedByCurrentUser(document);
    },
    canWriteDocument: function(document) {
        if (document.sys_id.nil() || document.isNewRecord())
            return true;

        if (gs.hasRole('mp_document_admin'))
            return true;
        return this._isCreatedByCurrentUser(document);
    },
    canDeleteDocument: function(document) {
        if (gs.hasRole('mp_document_admin'))
            return true;
        return this._isCreatedByCurrentUser(document);
    },
    // versions access
    canReadVersion: function(version) {
        if (version.sys_id.nil())
            return true;

        if (gs.hasRole('mp_document_admin'))
            return true;
        return this._isCreatedByCurrentUser(version);
    },
    canWriteVersion: function(version) {
        if (version.sys_id.nil() || version.isNewRecord())
            return true;

        if (gs.hasRole('mp_document_admin'))
            return true;
        return this._isCreatedByCurrentUser(version);
    },
    canDeleteVersion: function(version) {
        if (gs.hasRole('mp_document_admin'))
            return true;
        return this._isCreatedByCurrentUser(version);
    },
    // activities
    canReadActivity: function(activity) {
        if (activity.sys_id.nil())
            return true;

        if (gs.hasRole('mp_document_admin'))
            return true;
        return this._isCreatedByCurrentUser(activity);
    },
    canWriteActivity: function(activity) {
        if (activity.sys_id.nil() || activity.isNewRecord())
            return true;

        if (gs.hasRole('mp_document_admin'))
            return true;
        return this._isCreatedByCurrentUser(activity);
    },
    canDeleteActivity: function(activity) {
        if (gs.hasRole('mp_document_admin'))
            return true;
        return this._isCreatedByCurrentUser(activity);
    },
    //collaborators
    canReadCollaborator: function(collaborator) {
        if (collaborator.sys_id.nil() || collaborator.isNewRecord())
            return true;

        if (gs.hasRole('mp_document_admin'))
            return true;
        return this._isCreatedByCurrentUser(collaborator);
    },
    canWriteCollaborator: function(collaborator) {
        if (collaborator.sys_id.nil() || collaborator.isNewRecord())
            return true;

        if (gs.hasRole('mp_document_admin'))
            return true;
        return this._isCreatedByCurrentUser(collaborator);
    },
    canDeleteCollaborator: function(collaborator) {
        if (gs.hasRole('mp_document_admin'))
            return true;
        return this._isCreatedByCurrentUser(collaborator);
    },
	//#DEF0269608: temporary hack, until team finalize expectations on security
    _isCreatedByCurrentUser: function(current) {
        //var u = gs.getUserName();
        //var a = (current.sys_created_by == u);
        //return a;
		return true;
    },
    type: 'MultiProviderDocumentSecurity'
};

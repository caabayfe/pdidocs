var AIAgentUserMetadataLinkCreator = Class.create();
AIAgentUserMetadataLinkCreator.prototype = {
    initialize: function() {
        this.USER_TABLE = 'sys_user';
        this.IDENTITY_TYPE_COL = 'identity_type';
        this.AI_AGENT_TYPE = 'ai_agent';
        this.USER_HAS_ROLE_TABLE = 'sys_user_has_role';
        this.USER_COL = 'user';
        this.ACTION = "INSERT_OR_UPDATE";
        this.LINK_OUTPUT_DIRECTORY = 'update';
        this.META_DATA_LINK_TABLE = 'sys_metadata_link';
        this.DOCUMENT_KEY_COL = 'documentkey';
        this.SYS_SCOPE_COL = 'sys_scope';
        this.DIRECTORY_COL = 'directory';
        this.TABLENAME_COL = 'tablename';
        this.SYS_ID_COL = 'sys_id';
        this.INHERITED_COL = 'inherited';
    },

    addToMetaDataLink: function(gr, runAsUserColumnNameInGr) {
        var userId = gr.getValue(runAsUserColumnNameInGr);
        var userGr = new GlideRecord(this.USER_TABLE);
        userGr.get(userId);

        if (!this._isIdentityTypeAIAgent(userGr)) {
            return;
        }
        var payloadStr = this._getUserAndUserRolesXml(userGr);
        if (this._metadataLinkExists(userGr)) {
            this._overwriteMetadataLink(userGr, payloadStr);
            return;
        }
        var linkedGR = this._addMetadataLink(userGr, payloadStr);
        if (linkedGR == null) {
            gs.error("AIAgentUserMetadataLinkCreator : unable to create link");
            return;
        }
        gs.info("AIAgentUserMetadataLinkCreator : metadatalink added " + linkedGR.getValue(this.SYS_ID_COL));
    },

    updateMetadataLinkWithRoles: function(userHasRoleGr) {
        var userId = userHasRoleGr.getValue(this.USER_COL);
        var userGr = new GlideRecord(this.USER_TABLE);
        userGr.get(userId);

        if (!this._isIdentityTypeAIAgent(userGr)) {
            return;
        }

        //check if metadatalink exist with user and scope
        if (!this._metadataLinkExists(userGr)) {
            return;
        }

        var payloadStr = this._getUserAndUserRolesXml(userGr);
        this._overwriteMetadataLink(userGr, payloadStr);
    },

    _getUserAndUserRolesXml: function(userGr) {
        var payloadStr = gs.unloadRecordToXML(userGr, true);
        var document = GlideXMLUtil.parse(payloadStr);

        //load the roles and update the payload
        var userRoleGr = new GlideRecord(this.USER_HAS_ROLE_TABLE);
        userRoleGr.addQuery(this.USER_COL, userGr.getValue(this.SYS_ID_COL));

        if (this._isUsingInhCount()) {
            //fetching only direct roles
            userRoleGr.addQuery(this.INHERITED_COL, false);
        }
        userRoleGr.query();

        while (userRoleGr.next()) {
            var unloader = new GlideUnloader();
            unloader.unloadGlideRecord(document, userRoleGr, this.ACTION);
        }

        payloadStr = GlideXMLUtil.toString(document);
        return payloadStr;
    },

    _isUsingInhCount: function() {
        return gs.getProperty('glide.role_management.use.inh_count', false) === 'true' &&
        GlidePluginManager.isActive('com.glide.role_management.inh_count');
    },

    _isIdentityTypeAIAgent: function(userGr) {
        if (!userGr.isValidField(this.IDENTITY_TYPE_COL)) {
            return false;
        }
        var identity_type = userGr.getValue(this.IDENTITY_TYPE_COL);
        return this.AI_AGENT_TYPE == identity_type;
    },

    _metadataLinkExists: function(linkedRecord) {
        var output = new GlideRecord(this.META_DATA_LINK_TABLE);
        output.addQuery(this.DOCUMENT_KEY_COL, linkedRecord.getValue(this.SYS_ID_COL));
        output.addQuery(this.SYS_SCOPE_COL, gs.getCurrentApplicationId());
        output.addQuery(this.TABLENAME_COL, linkedRecord.getTableName());
        output.addQuery(this.DIRECTORY_COL, this.LINK_OUTPUT_DIRECTORY);
        output.setLimit(1);
        output.query();
        return output.hasNext();
    },

    _overwriteMetadataLink: function(linkedRecord, payloadStr) {
        var output = new GlideRecord(this.META_DATA_LINK_TABLE);
        output.addQuery(this.DOCUMENT_KEY_COL, linkedRecord.getValue(this.SYS_ID_COL));
        output.addQuery(this.SYS_SCOPE_COL, gs.getCurrentApplicationId());
        output.addQuery(this.TABLENAME_COL, linkedRecord.getTableName());
        output.addQuery(this.DIRECTORY_COL, this.LINK_OUTPUT_DIRECTORY);
        output.query();

        if (output.next()) {
            output.payload = payloadStr;
            output.sys_name = linkedRecord.getDisplayValue();
            return output.update();
        }

        return false;
    },

    _addMetadataLink: function(linkedRecord, payloadStr) {
        var output = new GlideRecord(this.META_DATA_LINK_TABLE);
        output.query();
        output.initialize();
        output.payload = payloadStr;
        output.documentkey = linkedRecord.getValue(this.SYS_ID_COL);
        output.tablename = linkedRecord.getTableName();
        output.sys_name = linkedRecord.getDisplayValue();
        output.directory = this.LINK_OUTPUT_DIRECTORY;
        var sysID = output.insert();

        // get the GlideRecord
        if (output.get(sysID))
            return output;
        return null;
    },


    type: 'AIAgentUserMetadataLinkCreator'
};

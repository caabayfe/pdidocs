var DocumentActivityStreamManager = Class.create();
DocumentActivityStreamManager.prototype = {
    GLOBAL_ACTIVITY_STREAM_FIELD_NAME: 'glide.documents.attach.fields',
	JOURNAL_FIELD_TYPE: 'journal',
	DOCUMENTS_TABLE: 'ds_document',
	DOCUMENT_REFERENCES_TABLE: 'ds_document_references',
	DOCUMENT_FIELD: 'document',
	DOCUMENT_VERSION_TABLE: 'ds_document_version',
	
    initialize: function() {},

    getGlobalFieldNames: function() {
        var gr = new GlideRecord('sys_properties');
        gr.get('name', this.GLOBAL_ACTIVITY_STREAM_FIELD_NAME);
        return gr.getValue('value');
    },

    getFieldForCurrentTable: function(tableName) {
        var tcGR = new GlideRecord('cxs_table_config');
        tcGR.addQuery("table", tableName);
        tcGR.query();

        if (tcGR.next()) {
            var searchActionGR = new GlideRecord("cxs_ui_action_config");
            searchActionGR.addQuery("search_ui_config", tcGR.sys_id);
            searchActionGR.addQuery("search_resource", "com.snc.contextual_search.search_resource.DocumentSearchResource");
            searchActionGR.addQuery("use_custom_field_for_attach", "true");
            searchActionGR.query();

            if (searchActionGR.next()) {
                return searchActionGR.attach_note_field;
            }
        }
        return null;

    },

    // Check for specific table field if it does not exist - then check if the current table has global variable, if yes send existing column names - else send null.
    getAttachFieldsForTable: function(tableName) {
        var fields = [];
        var fieldValues = this.getFieldForCurrentTable(tableName);
        if (fieldValues == null) {
            fieldValues = this.getGlobalFieldNames();

            if (fieldValues == null)
                return null;
        }
        fields = fieldValues.split(",");
        var index = 0;
        var resultFields = [];

		var td = GlideTableDescriptor.get(tableName);
        // check if each of field is valid in the table
        for (var i = 0; i < fields.length; i++) {
			var ed = td.getElementDescriptor(fields[i], true);
			if (ed != null && ed.getInternalType().startsWith(this.JOURNAL_FIELD_TYPE)) {
					resultFields.push(fields[i]);
			}
        }
        return resultFields;
    },
	
	pushMessageToActivity : function(message, tableName, tableSysId) {
		var fields = this.getAttachFieldsForTable(tableName);
		
		var gr = new GlideRecordSecure(tableName);
		if (gr.get(tableSysId)) {
			for(var i =0 ; i < fields.length ; i++) {
				gr[fields[i]] = message;
			}
			gr.update();
		}
	},

    // This is called when a document is attached to a target record
    pushAttachDocumentToRecordActivity: function(tableName, sysId, documentSysId) {
		var docGR = new GlideRecordSecure(this.DOCUMENTS_TABLE);
		if (docGR.get(documentSysId)) {
			var docName = docGR.name;
			var version = docGR.default_version.version;
			var link = '<a href="ds_document.do?sys_id=' + documentSysId + '">'+ docName +'</a>';
			var text = 'Document linked';
			var message = '[code]' + text + ' - ' + link + ' (v' + version + ')' + '[/code]';
			this.pushMessageToActivity(message, tableName, sysId);
		}
    },

    // This is called when a document is detached from a target record
    pushDetachDocumentFromRecordActivity: function(tableName, sysId, documentSysId) {
		var docGR = new GlideRecordSecure(this.DOCUMENTS_TABLE);
		if (docGR.get(documentSysId)) {
			var docName = docGR.name;

			var text = 'Document delinked';
			var message = '[code]' + text + ' - ' + docName + '[/code]';
			this.pushMessageToActivity(message, tableName, sysId);
		}
    },
	
	// This function is called when a new version is created 
	pushVersionCreatedActivity : function(documentVersionSysId) {
		var documentVersionGR = new GlideRecordSecure(this.DOCUMENT_VERSION_TABLE);
		if (!documentVersionGR.get(documentVersionSysId))
			return;

		var referencesGR = new GlideRecordSecure(this.DOCUMENT_REFERENCES_TABLE);
		referencesGR.addQuery(this.DOCUMENT_FIELD,documentVersionGR.document);
		referencesGR.query();
		var documentName = documentVersionGR.document.name;
		
		while (referencesGR.next()) {
			var link = '<a href="ds_document_version.do?sys_id=' + documentVersionSysId + '">'+ documentName +'</a>';
			var text = "New document version added";
			var message = '[code]' + text + ' - ' + link + '(v' + documentVersionGR.version + ') [/code]';
			this.pushMessageToActivity(message, referencesGR.table_name, referencesGR.target_record)
		}
	},

    type: 'DocumentActivityStreamManager'
};

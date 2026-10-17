gs.include("PrototypeServer");
    
var IndexCreator = Class.create();

IndexCreator.prototype = {
    initialize: function(tableName, fieldNames, unique, email, index_name) {
        this.tableName = tableName;
        this.fieldNames = fieldNames;
        if (index_name)
            this.indexName = index_name;
        else
            this.indexName = "index";

        this.access_method = "btree";
        this.unique = !!unique;
        this.email = email;
    },

    setAccessMethod: function(access_method) {
        this.access_method = access_method == null ? null : String(access_method).toLowerCase();
    },

    execute: function(savedUpdateSetId) {
        if (!gs.hasRole('admin') && gs.isInteractive())
            return;

        if (!this._isValidTableName())
            return;

        if (!this._areValidFields())
            return;

        if (!this._isIndexNameValid())
            return;

        if (!this._isValidUnique())
            return;

        if (!this._isValidAccessMethod())
            return;

        var start = new GlideDateTime();
        var al = GlideStringUtil.split(this.fieldNames);
        var id = new GlideIndexDescriptor(this.tableName, this.indexName, al);
        this.actualName = id.getIndexName();
        if (this.access_method)
            id.setAccessMethod(this.access_method);

        if (this.unique)
            id.setUnique(true);

        var answer = false;
        var exists = id.hasIndex();
        if (exists)
            id.close();
        else {
            answer = id.create();
            id.close();
            var end = new GlideDateTime();
            if (!answer)
                this.errorCode = id.getErrorCode();
            else {
                this._createIndexRecord(savedUpdateSetId);
                var tu = new SNC.TableRotationSynchronizer(this.tableName);
                if (tu.isValid())
                    tu.synchronize();
            }
        }
        this._sendNotification(exists, answer, start, end);
        return (answer || exists);
    },

    schedule: function() {
        if (!gs.hasRole('admin')) {
            gs.addInfoMessage(gs.getMessage("Index creation aborted: insufficient role (admin required)"));
            return;
        }

        if (!this._isValidTableName()) {
            gs.addInfoMessage(gs.getMessage("Index creation aborted: invalid table name"));
            return;
        }

        if (!this._areValidFields()) {
            gs.addInfoMessage(gs.getMessage("Index creation aborted: invalid field(s) specified"));
            return;
        }

        if (!this._isIndexNameValid()) {
            gs.addInfoMessage(gs.getMessage("Index creation aborted: invalid index name"));
            return;
        }

        if (!this._isValidEmail()) {
            gs.addInfoMessage(gs.getMessage("Index creation aborted: invalid email address"));
            return;
        }

        if (!this._isValidUnique()) {
            gs.addInfoMessage(gs.getMessage("Index creation aborted: invalid unique value"));
            return;
        }

        if (!this._isValidAccessMethod()) {
            gs.addInfoMessage(gs.getMessage("Index creation aborted: invalid access method"));
            return;
        }

        var script = "gs.include('IndexCreator');";
        script += "var c = new IndexCreator('" + this.tableName + "', '" + this.fieldNames + "', " + this.unique + ", '" + this.email + "', '" + this.indexName + "');";
        script += "c.setAccessMethod('" + this.access_method + "');";
        script += "c.execute('" + GlideUpdateSet.get() + "');";
        GlideRunScriptJob.scheduleScript(script);
    },

    /**
     * Inserts a sys_index record after an index was successfully created.
     * Attempts to use the update set that was current when index creation was
     * scheduled, but uses the current update set if the saved one is not valid.
     */
    _createIndexRecord: function(savedUpdateSetId) {
        //try to change the current update set to whatever it was when the index creation was scheduled
        var updateSetChanged = false;
        var updateSet = new GlideUpdateSet();
        var currUpdateSetId = GlideUpdateSet.get();
        if (typeof savedUpdateSetId !== "undefined" && currUpdateSetId != savedUpdateSetId) {
            var updateSetGR = new GlideRecord('sys_update_set');
            updateSetGR.addQuery('state', 'in progress');
            updateSetGR.addQuery('sys_id', savedUpdateSetId);
            updateSetGR.query();
            if (updateSetGR.next()) {
                updateSet.set(savedUpdateSetId);
                updateSetChanged = true;
                gs.log("Changing current update set for sys_index creation from " + currUpdateSetId + " to " + savedUpdateSetId);
            } else
                gs.log("Not changing current update set for sys_index creation. Saved update set " + savedUpdateSetId + " is not in progress or does not exist");
        } else
            gs.log("Not changing current update set for sys_index creation. Saved update set is the same as the current update set (or undefined)");

        this._createIndexRecord0();

        if (updateSetChanged) {
            updateSet.set(currUpdateSetId);
            gs.log("After sys_index creation, changing current update set back to " + currUpdateSetId + " from " + savedUpdateSetId);
        }
    },

    _createIndexRecord0: function() {
        gs.log("Attempting to insert sys_index record for table '" + this.tableName + "', fields '" + this.fieldNames + "' with access method = '" + this.access_method + "' and unique = " + this.unique);
        if (this._hasIndexRecord()) {
            gs.log("Index record already exists, skipping insert");
            return;
        }

        var dbgr = new GlideRecord('sys_db_object');
        dbgr.addQuery('name', this.tableName);
        dbgr.query();
        if (!dbgr.next()) {
            gs.log("Could not find sys_db_object record for table " + this.tableName + ", skipping insert");
            return;
        }

        var gr = new GlideRecord('sys_index');
        var gList = this._createGlideListOfColumns();
        if (gList == null)
            return;

        gr.setValue('index_col_name', gList);
        gr.setValue('col_name_string', this.fieldNames);
        gr.setValue('logical_table_name', this.tableName);
        gr.setValue('table', dbgr.getValue('sys_id'));
        gr.setValue('access_method', this.access_method);
        gr.setValue('unique_index', this.unique);
        gr.insert();
    },

    _hasIndexRecord: function() {
        var gr = new GlideRecord('sys_index');
        gr.addQuery('logical_table_name', this.tableName);
        gr.addQuery('col_name_string', this.fieldNames);
        gr.query();
        return gr.next();
    },

    _createGlideListOfColumns: function() {
        //returns a glidelist of column sys_ids for this index
        var al = this.fieldNames.split(",");
        var gList = "";
        var gtd = GlideTableDescriptor.get(this.tableName);
        if (!gtd.isValid()) {
            gs.warn("Cannot create index record, table '" + this.tableName + "' is not valid");
            return null;
        }

        for (var i = 0; i < al.length; i += 1) {
            var ed = gtd.getElementDescriptor(al[i]);
            if (ed != null) {
                gList += ed.getUniqueID() + ",";
            } else {
                gs.warn("Cannot create index record, column '" + al[i] + "' does not exist");
                return null;
            }
        }

        return gList;
    },

    _sendNotification: function(exists, success, start, end) {
        if (!this.email)
            return;

        if (!this._isValidEmail())
            return;

        var subject = "Index Creation Results : ";
        if (exists)
            subject += "SKIPPED (see body for details)";
        else if (success)
            subject += "SUCCESS";
        else
            subject += "FAILURE (see body for details)";

        var body = "Index creation began at " + start.getDisplayValue() + "\n";
        if (exists) {
            body += "Index creation skipped:\n";
            body += "Requested index for table (" + this.tableName + ") on columns (" + this.fieldNames + ") already exists.";
        } else if (success) {
            body += "Index creation completed successfully at " + end.getDisplayValue() + "\n";
            body += "Generated Index Name : " + this.actualName;
        } else {
            body += "Index creation FAILED at " + end.getDisplayValue() + " with error code:\n";
            body += this.errorCode;
        }

        var mail = new GlideEmailOutbound();
        mail.setSubject(subject);
        mail.addRecipient(this.email);
        mail.setBody(body);
        mail.save();
    },

    _isValidTableName: function() {
        if (!this.tableName) {
            gs.warn("Table name is empty or null");
            return false;
        }

        var gtd = GlideTableDescriptor.get(this.tableName);
        if (!gtd.isValid()) {
            gs.warn("Table '" + this.tableName + "' is not valid");
            return false;
        }
        return true;
    },

    _areValidFields: function() {
        if (!this.fieldNames) {
            gs.warn("Fields are empty or null");
            return false;
        }

        var gtd = GlideTableDescriptor.get(this.tableName);
        var al = GlideStringUtil.split(this.fieldNames);
        for (var i = 0; i < al.length; i++) {
            var ed = gtd.getElementDescriptor(al[i]);
            if (!ed) {
                gs.warn("Field '" + al[i] + "' is not a valid field on '" + this.tableName + "'");
                return false;
            }
        }
        return true;
    },

    _isIndexNameValid: function() {
        if (!this.indexName)
            return true; // index name can be null or empty

        // Only alphanumeric characters or underscores, can't start with digits
        var regex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

        return regex.test(this.indexName);
    },

    _isValidEmail: function() {
        if (!this.email)
            return true; // email can be null or empty

        email = this.email.toString().trim();

        // Must match valid email structure
        var emailRegex = /^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        return emailRegex.test(email);
    },

    _isValidUnique: function() {
        return (this.unique === true || this.unique === false);
    },

    _isValidAccessMethod: function() {
        return this.access_method === "btree" 
			|| this.access_method === "hash" 
			|| this.access_method === "gin" 
			|| this.access_method === "columnstore";
    }
};

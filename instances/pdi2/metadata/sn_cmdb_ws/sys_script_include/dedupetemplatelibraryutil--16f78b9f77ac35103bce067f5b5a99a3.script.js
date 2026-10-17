var DedupeTemplateLibraryUtil = Class.create();
DedupeTemplateLibraryUtil.prototype = {
    RECONCILE_TEMPLATE_LIBRARY_TABLE: "sn_cmdb_ws_reconcile_duplicate_template_library",
    NAME: 'name',
    TEMPLATE_LIBRARY_DESCRIPTION: 'description',
    RECONCILE_TEMPLATE_TABLE: "reconcile_duplicate_template",
    RECONCILE_TEMPLATE_RUN: "reconcile_duplicate_template_run",
    RECONCILE_TEMPLATE_RUN_TEMPLATE_COLUMN: "template",
    STATE: "state",
    RECONCILE_TEMPLATE_LIB_COLUMN: "library",
    SYS_ID: 'sys_id',
    CMDB_DEDUP_ADMIN: 'cmdb_dedup_admin',

    DEDUPLICATION_TEMPLATE_ERROR_SOURCE: 'sn_cmdb_ws_deduplication_template',

    ACTIONS: {
        ADD_TEMPLATE_TO_LIBRARY: 'ADD_TEMPLATE_TO_LIBRARY'
    },

    ERROR_CODES: {
        DEDUPLICATION_TEMPLATE_USER_MISSING_ROLE: 'DEDUPLICATION_TEMPLATE_USER_MISSING_ROLE'
    },

    initialize: function () {
    },

    /**
     * Create a library with name and description. Enforces the library name to be unique
     *
     * @param {*} name name of the library, it should be non nil value
     * @param {*} description
     * @returns Below result object indicating the sys_id and error messages
     *      result = {
                sys_id: '',
                error: '',
                display_error: ''
            };
     */
    createLibrary: function (name, description) {
        var result = {
            sys_id: '',
            error: '',
            display_error: ''
        };
        name = this._trim(name);
        if (gs.nil(name)) {
            result.display_error = gs.getMessage('Library name cannot be nil');
            result.error = "Input library name is nil or empty";
            return result;
        }
        if (this._libraryExists(name)) {
            result.display_error = gs.getMessage('Library name already exists, please use a different name');
            result.error = "Input library with name " + name + " already exists, use a different name to create or leverage an existing library";
            return result;
        }
        var gr = new GlideRecordSecure(this.RECONCILE_TEMPLATE_LIBRARY_TABLE);
        gr.setValue(this.NAME, name);
        gr.setValue(this.TEMPLATE_LIBRARY_DESCRIPTION, description);
        var sysId = gr.insert();
        result.sys_id = sysId;
        if (gs.nil(sysId)) {
            result.display_error = gs.getMessage("Failed to create library during insert operation");
            result.error = "Failed to create library " + gr.getLastErrorMessage();
        }
        return result;
    },

    /**
     * Update the input library specified using sysId with input name and description
     * @param {*} sysId
     * @param {*} name
     * @param {*} description
     * @returns Below result object indicating the sys_id and error messages
     *      result = {
                sys_id: '',
                error: '',
                display_error: ''
            };
     */
    updateLibrary: function (sysId, name, description) {
        name = this._trim(name);
        sysId = this._trim(sysId);
        var result = {
            sys_id: '',
            error: '',
            display_error: ''
        };
        if (gs.nil(name)) {
            result.error = "Input library passed to method is nil or empty";
            result.display_error = gs.getMessage('Library name cannot be nil');
            return result;
        }
        var gr = new GlideRecordSecure(this.RECONCILE_TEMPLATE_LIBRARY_TABLE);
        if (!gr.get(sysId)) {
            result.error = "Failed to find library with input sysid " + sysId;
            result.display_error = gs.getMessage("Library to be updated doesn't exist");
            return result;
        }
        if (this._libraryExists(name, sysId)) {
            result.display_error = gs.getMessage('Library name already exists, please use a different name for update');
            result.error = "Input library with name " + name + "already exists, use a different name to update ";
            return result;
        }
        gr.setValue(this.NAME, name);
        gr.setValue(this.TEMPLATE_LIBRARY_DESCRIPTION, description);

        var updateSysId = gr.update();
        result.sys_id = updateSysId;
        if (gs.nil(updateSysId)) {
            result.error = "Failed to update the library for sysid " + sysId + " " + gr.getLastErrorMessage();
            result.display_error = gs.getMessage("Failed to update the library, please try again");
        }
        return result;
    },

    /**
     * Get libraries containing the search term, Ignores search term, if search term is empty or nil and returns all libraries based on limit parameter
     * @param {*} searchTerm keyword to search for libraries in the system
     * @param {*} limit
     * @returns An array of libraries, each library is represented with name, description and sys_id
     *      libraries = [{
                name = '',
                description = '',
                sys_id = ''
            }]
     */
    getLibraries: function (searchTerm, limit) {
        var libraries = [];
        searchTerm = this._trim(searchTerm);
        limit = this._trim(limit);

        var gr = new GlideRecordSecure(this.RECONCILE_TEMPLATE_LIBRARY_TABLE);
        if (searchTerm && global.JSUtil.notNil(searchTerm)) {
            gr.addQuery(this.NAME, "CONTAINS", searchTerm);
        }
        if (limit && global.JSUtil.notNil(limit)) {
            gr.setLimit(limit);
        }
        gr.query();
        while (gr.next()) {
            var library = {};
            library.name = gr.getValue(this.NAME);
            library.description = gr.getValue(this.TEMPLATE_LIBRARY_DESCRIPTION);
            library.sys_id = gr.getValue(this.SYS_ID);
            libraries.push(library);
        }
        return libraries;
    },

    /**
     * Gets the templates (non-retired) associated to the input library
     * If it is a published and if there is a template run assosciated for the template in Draft,Ready,Running
     * template state will be "Running".
     * If the template is in Draft state, state of the tmplate will be returned as "Not Published"
     *
     * @param {} librarySysId sysid of the library
     * @param {*} limit limits the number of templates to return
     * @returns
     */
    getTemplatesByLibrary: function (librarySysId, limit) {
        var templates = [];
        librarySysId = this._trim(librarySysId);
        limit = this._trim(limit);

        if (gs.nil(librarySysId)) {
            gs.debug("Invalid library sysid");
            return templates;
        }
        var gr = new GlideRecordSecure(this.RECONCILE_TEMPLATE_TABLE);
        gr.addQuery(this.RECONCILE_TEMPLATE_LIB_COLUMN, librarySysId);
        gr.addQuery(this.STATE, "!=", "retired");
        var runningTemplates = this._getRunningTemplates();
        if (limit && !gs.nil(limit)) {
            gr.setLimit(limit);
        }
        gr.query();
        while (gr.next()) {
            var template = {
                "state": "",
                "sys_id": "",
                "name": ""
            };
            template.sys_id = gr.getValue(this.SYS_ID);
            template.name = gr.getValue(this.NAME);
            if (runningTemplates[template.sys_id]) {
                template.state = gs.getMessage("Running");
            } else {
                var state = gr.getValue(this.STATE);
                if (state === "draft") {
                    template.state = gs.getMessage("Not Published");
                }
            }

            templates.push(template);
        }
        return templates;
    },

    /**
     * Associate a template to library, validate template and library exists in the system
     * Returns result in the below format, when sys_id is non empty, it indicates successful association otherwise error
     * var result = {
            sys_id: "",
            error: "",
            display_error: ""
        };
     */
    addTemplateToLibrary: function (templateSysId, librarySysId) {
        if (!this._hasPermission()) {
            throw new CMDBWsError({
                code: this.ERROR_CODES.DEDUPLICATION_TEMPLATE_USER_MISSING_ROLE,
                action: this.ACTIONS.ADD_TEMPLATE_TO_LIBRARY,
                source: this.DEDUPLICATION_TEMPLATE_ERROR_SOURCE,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "The user must have cmdb_dedup_admin role to add template to library"),
                details: "Required role: cmdb_dedup_admin to add template to library"
            });
        }

        var result = {
            sys_id: "",
            error: "",
            display_error: ""
        };

        if (!gs.getUser().hasRole(this.CMDB_DEDUP_ADMIN)) {
            gs.info("Failed to associate template to library since user doesn't have permission");
            result.error = "Failed to associate template to library since user doesn't have permission";
            result.display_error = gs.getMessage("Failed to associate template to library since user doesn't have permission");
            return result;
        }
        // validate if template and library are existing
        //Template table cannot be gliderecordsecure as we are adding ACLs with maint for editing
        var grTemplate = new GlideRecord(this.RECONCILE_TEMPLATE_TABLE);
        var grLibrary = new GlideRecordSecure(this.RECONCILE_TEMPLATE_LIBRARY_TABLE);

        if (grTemplate.get(templateSysId) && grLibrary.get(librarySysId)) {
            grTemplate.setValue('library', librarySysId);
            result.sys_id = templateSysId;
            if (!grTemplate.update()) {
                gs.info("Failed to associate template to library, more details from GlideQuery in log");
                result.error = "Failed to associate template to library";
                result.display_error = gs.getMessage("Failed to associate template to library, please try again");
            }
        } else {
            result.display_error = gs.getMessage("Input Template or library is invalid");
            result.error = "Input template sysid " + templateSysId + " or library sysid " + librarySysId + " is invalid";
        }
        return result;
    },

    /**
     * Delete a library when there are no associated templates attached to it.
     * @param {*} librarySysId
     * @returns true if successfully deleted in the below format, otherwise false and gives appropriate error messages
     *  var result = {
            "success" : trie,
            "error" : "",
            "display_error" : ""
        };
     */
    deleteLibrary: function (librarySysId) {
        var result = {
            "success": false,
            "error": "",
            "display_error": ""
        };
        librarySysId = this._trim(librarySysId);

        if (gs.nil(librarySysId)) {
            gs.debug("Invalid library sysid");
            result.error = "Cannot delete library with sysid: " + librarySysId;
            result.display_error = gs.getMessage("Library sysid is nil");
            return result;
        }
        var gr = new GlideRecordSecure(this.RECONCILE_TEMPLATE_TABLE);
        gr.addQuery(this.RECONCILE_TEMPLATE_LIB_COLUMN, librarySysId);
        gr.setLimit(1);
        gr.query();
        if (gr.next()) {
            result.success = false;
            result.display_error = gs.getMessage("Library cannot be deleted as it has associated templates");
            result.error = "Library with sysid: " + librarySysId + " has atleast one associated template";
        } else {
            // Delete library
            var libraryGr = new GlideRecordSecure(this.RECONCILE_TEMPLATE_LIBRARY_TABLE);
            libraryGr.get(librarySysId);
            var deleted = libraryGr.deleteRecord();
            result.success = deleted;
            if (!deleted) {
                result.error = "Failed to delete library with sysid: " + librarySysId + " error = "; libraryGr.getLastErrorMessage();
                result.display_error = gs.getMessage("Failed to delete library, please try again ");
            }
        }
        return result;
    },

    _getRunningTemplates: function () {
        var runningTemplates = {};
        var gr = new GlideRecordSecure(this.RECONCILE_TEMPLATE_RUN);
        gr.addQuery(this.STATE, "IN", "draft,ready,running,cancel_requested");
        gr.query();
        while (gr.next()) {
            var templateSysId = gr.getValue(this.RECONCILE_TEMPLATE_RUN_TEMPLATE_COLUMN);
            runningTemplates[templateSysId] = templateSysId;
        }
        return runningTemplates;
    },

    _libraryExists: function (name, sysId) {
        var gr = new GlideRecordSecure(this.RECONCILE_TEMPLATE_LIBRARY_TABLE);
        gr.addQuery(this.NAME, name);
        if (sysId) {
            gr.addQuery(this.SYS_ID, "!=", sysId);
        }
        gr.setLimit(1);
        gr.query();
        return gr.hasNext();
    },

    _trim: function (pValue) {
        if (pValue) {
            return pValue.trim();
        }
        return pValue;

    },

    _hasPermission: function() {
        return gs.getUser().hasRole(this.CMDB_DEDUP_ADMIN);
    },

    type: 'DedupeTemplateLibraryUtil'
};

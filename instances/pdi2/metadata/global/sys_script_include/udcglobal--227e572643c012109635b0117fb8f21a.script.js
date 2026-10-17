class UDCGlobal {
    static type = "UDCGlobal";

    static #isValidScope(scope) {
        const validScopes = ["sn_udc"];
        return validScopes.includes(scope);
    }

    static #validateCallerScope(scopeName) {
        if (!UDCGlobal.#isValidScope(scopeName)) {
            throw new Error("This must be called from sn_udc scope");
        }
    }

    static getCurrentUpdateSet(scopeSysId) {
        UDCGlobal.#validateCallerScope(gs.getCallerScopeName());

        let currentScopeId = gs.getCurrentApplicationId();

        // Set file scope as session scope
        gs.setCurrentApplicationId(scopeSysId);

        // Get current update set of a file scope by calling hosted plugin's script include
        const currentUpdateSet = JSON.parse(new SNC.ConcoursePickerGenerator().getCurrentUpdateSet());

        // Set the previous session scope back
        gs.setCurrentApplicationId(currentScopeId);

        return currentUpdateSet;
    }

    static getCurrentScopeAndUpdateSet() {
        UDCGlobal.#validateCallerScope(gs.getCallerScopeName());

        const concoursePickerGen = new SNC.ConcoursePickerGenerator();

        return {
            updateSet: JSON.parse(concoursePickerGen.getCurrentUpdateSet()),
            scope: JSON.parse(concoursePickerGen.getCurrentApplication())
        }
    }

    static getGlideRecordForTable(table, appSysId, includeChildRecords = true) {
        UDCGlobal.#validateCallerScope(gs.getCallerScopeName());

        var tableGr = new GlideRecord(table);
        if (appSysId) tableGr.addQuery('sys_scope', appSysId);
        if (!includeChildRecords) tableGr.addQuery('sys_class_name', table); // Skip child class files
        return tableGr;
    }

    static getGlideRecordSecureForTable(table, appSysId) {
        UDCGlobal.#validateCallerScope(gs.getCallerScopeName());

        var tableGr = new GlideRecordSecure(table);
        if (appSysId) tableGr.addQuery('sys_scope', appSysId);
        return tableGr;
    }

    /**
     * Checks if the current user has permission to write to a record.
     *
     * @param {GlideRecord} gr - The GlideRecord object
     * @returns {boolean} - Returns true if user has write permission for the record, else false.
     * @throws {Error} - Throws an error if the method is not called from the 'sn_udc' scope.
     */
    static hasCanWritePermission(gr) {
        UDCGlobal.#validateCallerScope(gs.getCallerScopeName());
        return gr.canWrite();
    }

    /**
     * Checks if the current user has permission to create a record.
     *
     * @param {GlideRecord} gr - The GlideRecord object
     * @returns {boolean} - Returns true if the user has permission to create record, else false.
     * @throws {Error} - Throws an error if the method is not called from the 'sn_udc' scope.
     */
    static hasCanCreatePermission(gr) {
        UDCGlobal.#validateCallerScope(gs.getCallerScopeName());
        return gr.canCreate();
    }

    /**
     * Fetches user name by id using Glide session
     */
    static getUserNameById(userId) {
        UDCGlobal.#validateCallerScope(gs.getCallerScopeName());
        return gs.getUserNameByUserID(userId);
    }

    /**
     * Validates if an object is a valid GlideRecord
     * @param {Object} grObj - The object to check
     * @returns {Boolean} - True if the object is a valid GlideRecord
     */
    static isValidGlideRecord(grObj) {
        UDCGlobal.#validateCallerScope(gs.getCallerScopeName());

        if (gs.nil(grObj)) {
            return false;
        }

        return typeof grObj.isValidRecord === 'function' && grObj.isValidRecord();
    }

    /**
     * Reads the active sys_now_assist_deployment_channel row and returns its `experience` (e.g.
     * 'ai_native_chat' for NextWave), or '' if none matches. Lives in global for the cross-scope read.
     *
     * @param {String} documentTable - the channel's document_table
     * @param {String} documentId - the channel's document_id
     * @returns {String} the channel's `experience`, or '' if no active channel matches
     * @throws {Error} if not called from the 'sn_udc' scope.
     */
    static getNowAssistDeploymentExperience(documentTable, documentId) {
        UDCGlobal.#validateCallerScope(gs.getCallerScopeName());

        if (gs.nil(documentTable) || gs.nil(documentId)) {
            return "";
        }

        const channelGr = new GlideRecord("sys_now_assist_deployment_channel");
        channelGr.addQuery("document_table", documentTable);
        channelGr.addQuery("document_id", documentId);
        channelGr.addQuery("active", true);
        channelGr.setLimit(1);
        channelGr.query();

        return channelGr.next() ? (channelGr.getValue("experience") || "") : "";
    }

}

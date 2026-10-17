const GliderCustomizationUtil = Class.create();

const allowedScopes = gs.getProperty('glide.ide.runtime.allowed_scopes', 'sn_glider').split(',').map(s => s.trim());

GliderCustomizationUtil.prototype = {
    /**
     * Returns GlideRecord<sys_scope>
     */
    getAppRecord( /*string*/ scopeId) {
        if (!this._isAllowed(gs.getCallerScopeName())) {
            return;
        }

        const gr = new GlideRecordSecure('sys_scope');
        const exists = gr.get(scopeId);

        return exists ? gr : undefined;
    },
    getRecord( /*string*/ sysId, /*boolean*/ skipAllowedCheck) {
		// skip allowed would be false only if called explicitly
		// this was to guard rail this api and set the value as true when called internally
        if (!skipAllowedCheck && !this._isAllowed(gs.getCallerScopeName())) {
            return;
        }

        const gr = new GlideRecordSecure('sys_metadata');
        const exists = gr.get(sysId);

        return exists ? gr : undefined;
    },
    getRecords( /*string[]*/ sysIds) {
        if (!this._isAllowed(gs.getCallerScopeName())) {
            return [];
        }

        // As we've already done the allowed check, we can skip it here
        const skipAllowedCheck = true;
        return sysIds.map(sysId => this.getRecord(sysId, skipAllowedCheck)).filter(gr => !!gr);
    },
    /**
     * Reurns string | undefined
     */
    isInvalidPayload( /*string[]*/ data) {
        if (!data || !Array.isArray(data)) {
            return `Request body is empty, string[] expected`;
        }

        if (data.length === 0) {
            return `Please provide at least one metadata sys_id to customize`;
        }

        const containsNotStrings = data.some(d => typeof d !== 'string');

        if (containsNotStrings) {
            return `Request body must be an array of strings corresponding to sys_ids of metadata records`;
        }
    },
    /**
     * Checks if the caller scope is allowed to customize metadata
     * Returns boolean
     */
    _isAllowed( /*string*/ callerScopeName) {
        return allowedScopes.includes(callerScopeName);
    },
    type: 'GliderCustomizationUtil'
};

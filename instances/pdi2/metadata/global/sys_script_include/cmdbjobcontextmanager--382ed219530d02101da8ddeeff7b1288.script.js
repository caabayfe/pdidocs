var CMDBJobContextManager = Class.create();
CMDBJobContextManager.prototype = {
    initialize: function() {},
    JOB_CONTEXT: {
        TABLE: "cmdb_job_context",
        KEY: "key",
        VALUE: "value",
        JSON: "json"
    },

    /**
     * Create a new entry in cmdb_job_context table
     * @param {*} key 
     * @param {*} value 
     */
    createJobContextEntry: function(key, value, jsonValue) {
        var grJobCtx = new GlideRecord(this.JOB_CONTEXT.TABLE);
        grJobCtx.initialize();
        grJobCtx.setValue(this.JOB_CONTEXT.KEY, key);
        grJobCtx.setValue(this.JOB_CONTEXT.VALUE, value);
        grJobCtx.setValue(this.JOB_CONTEXT.JSON, jsonValue);
        grJobCtx.insert();
    },

    /**
     * Get the job context entry for the given key
     * @param {*} key 
     * @returns 
     */
    getJobContext: function(key) {
        var grJobCtx = new GlideRecord(this.JOB_CONTEXT.TABLE);
        grJobCtx.addQuery(this.JOB_CONTEXT.KEY, key);
        grJobCtx.query();
        if (grJobCtx.getRowCount() > 1)
            throw new Error(gs.getMessage("More than one cmdb_job_context records exists for key: {0}", [key]));

        if (grJobCtx.next())
            return grJobCtx;

        return null;

    },
    /**
     * Get the value from the job context entry for the given key
     * @param {*} key 
     * @returns 
     */
    getJobContextValue: function(key) {
        var grJobCtx = this.getJobContext(key);
        if (grJobCtx != null) {
            var value = grJobCtx.getValue(this.JOB_CONTEXT.VALUE);
            return value;
        }
        return null;
    },
    /**
     * Get the json object from the job context entry for the given key
     * @param {*} key 
     * @returns 
     */
    getJobContextJSONValue: function(key) {
        var grJobCtx = this.getJobContext(key);
        if (grJobCtx != null) {
            var value = grJobCtx.getValue(this.JOB_CONTEXT.JSON);
            var valueObj = JSON.parse(value);
            return valueObj;
        }
        return null;
    },
    /**
     * Save the value into the job context entry for the given key
     * @param {*} key 
     * @param {*} value 
     */
    saveJobContext: function(key, value, jsonValue) {
        var grJobCtx = this.getJobContext(key);
        if (grJobCtx == null) {
            this.createJobContextEntry(key, value, jsonValue);
        } else {
            grJobCtx.setValue(this.JOB_CONTEXT.VALUE, value);
            grJobCtx.setValue(this.JOB_CONTEXT.JSON, jsonValue);
            grJobCtx.update();
        }
    },
    /**
     * Delete the job context entry for the given key
     * @param {*} key 
     */
    deleteJobContext: function(key) {
        var grJobCtx = this.getJobContext(key);
        if (grJobCtx != null) {
            grJobCtx.deleteRecord();
        }
    },
    type: 'CMDBJobContextManager'
};

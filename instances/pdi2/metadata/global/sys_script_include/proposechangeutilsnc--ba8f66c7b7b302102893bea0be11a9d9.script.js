var ProposeChangeUtilSNC = Class.create();
ProposeChangeUtilSNC.prototype = {
    initialize: function() {
        this._CMDBUtil = new SNC.CMDBUtil();
        this._gru = new global.GlideRecordUtil();
        this.xmlHelper = new global.XMLHelper();
    },

    /**
     * Get GlideRecord from a ScopedGlideRecord to be used in SNC.CMDBUtil
     */
    getGrFromScopedGr: function(scopedGr) {
        var gr = new GlideRecord(scopedGr.sys_class_name);
        if (gr.get(scopedGr.getUniqueValue())) {
            var fieldValues = {};
            this._gru.populateFromGR(fieldValues, scopedGr);
            this._gru.mergeToGR(fieldValues, gr);
            return gr;
        }

        return null;
    },

    applyProposedChange: function(scopedChgGr) {
        var changeGr = this.getGrFromScopedGr(scopedChgGr);
        if (changeGr)
            this._CMDBUtil.baselineProposedChangesApplyChanges(changeGr);
    },

    verifyProposedChanges: function(scopedChgGr) {
        var changeGr = this.getGrFromScopedGr(scopedChgGr);
        if (changeGr)
            this._CMDBUtil.baselineProposedChangesVerifyChanges(changeGr);
    },

    genDiffProposedChanges: function(scopedCIGr, taskCiId) {
        var cIGr = this.getGrFromScopedGr(scopedCIGr);
        if (cIGr)
            this._CMDBUtil.baselineProposedChangesGenDIFF(cIGr, taskCiId);
    },

    proposedChangesExist: function(task) {
        var taskCiGr = new GlideRecord('task_ci');
        taskCiGr.addQuery('task', task.getUniqueValue());
        taskCiGr.addNotNullQuery('xml');
        taskCiGr.addQuery('applied', 'false');
        taskCiGr.setLimit(1);
        taskCiGr.query();
        return taskCiGr.hasNext();
    },

    type: 'ProposeChangeUtilSNC'
};

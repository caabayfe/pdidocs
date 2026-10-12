var DSActionBtnConditionCheck = Class.create();
DSActionBtnConditionCheck.prototype = {
    initialize: function() {},

    shouldDisplayButton: function(gr, uiActionName) {
        // conditions check
        var isRaptorStandard = SNC.EnableMLB.isRaptorStandard();
        var isMLBPropertyEnabled = GlideProperties.getBoolean('com.snc.pa.dm.enable.mlb', false);
        var canWrite = gr.canWrite();
        var isRequiredIndicatorType = (gr.type == 1) || (gr.type == 2);
        var isScopeMatch = gs.getCurrentApplicationId() == gr.sys_scope;
        var notNewRecord = !gr.isNewRecord();

        // This script is called from both UI Actions - Enable Data Snapshots and Disable Data Snapshots
        // show or hide the UI Action buttons based on is_mlb_enabled
        var dataSnapshotState = uiActionName == "enable_data_snapshots" ?
            (gr.getValue('is_mlb_enabled') == false) || (gr.getValue('is_mlb_enabled') == null) :
            (gr.getValue('is_mlb_enabled') == true);

        return isMLBPropertyEnabled && canWrite && isRequiredIndicatorType && isScopeMatch && notNewRecord && dataSnapshotState && !isRaptorStandard;
    },

    type: 'DSActionBtnConditionCheck'
};

var MobileNextExpUpgradeUtil = Class.create();
MobileNextExpUpgradeUtil.prototype = {
    initialize: function() {},

    switchConnection: function(table, field, recordId, existingValue, replacementValue) {
        var gr = new GlideRecord(table);
        if (gr.get(recordId)) {
            if (gr.getValue(field) == existingValue) {
                gr.setValue(field, replacementValue);
                gr.update();
            }
        }
    },

    switchLegacyView: function(table, masterItem, newCard, switchToMobileView) {
        var gr = new GlideRecord(table);
        if (gr.get(masterItem)) {
            if (gr.getValue('view_config') == newCard) {
                gr.setValue('use_view_config', switchToMobileView);
                gr.update();
            }
        }
    },
    type: 'MobileNextExpUpgradeUtil'
};

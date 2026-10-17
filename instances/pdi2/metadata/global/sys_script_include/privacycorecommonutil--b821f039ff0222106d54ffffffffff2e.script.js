var PrivacyCoreCommonUtil = Class.create();
PrivacyCoreCommonUtil.prototype = {
    initialize: function() {},

    allowTestingDataPattern: function(gr) {
        if (!gr || gr.getTableName() !== 'dp_data_pattern') {
            return false;
        }
        if (!gr.isValidField('type')) {
            return true;
        }
        if (gr.getValue('type') === 'local') {
            return true;
        }
        return gr.getValue('type') === 'model';
    },

    type: 'PrivacyCoreCommonUtil'
};

var GetSupportTableChoiceUtil = Class.create();
GetSupportTableChoiceUtil.prototype = {
    initialize: function() {},

    /**
     * Returns a list of tables for which get support widget content can be added
     * returns {Array}
     */
    process: function() {
        var tables = ["sn_ex_sp_quick_link", "sn_ex_sp_static_content"];
        return tables;
    },


    type: 'GetSupportTableChoiceUtil'
};

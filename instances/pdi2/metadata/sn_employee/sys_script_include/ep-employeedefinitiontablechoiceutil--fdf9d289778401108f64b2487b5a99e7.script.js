var ep_employeeDefinitionTableChoiceUtil = Class.create();
ep_employeeDefinitionTableChoiceUtil.prototype = {
    initialize: function() {},

    /**
     * Returns a list of tables from which the employee definition can be created
     * returns {Array}
     */
    process: function() {
        var tables = ["sys_user"];
        if (GlidePluginManager.isActive("com.sn_hr_core"))
            tables.push("sn_hr_core_profile");
        return tables;
    },


    type: 'ep_employeeDefinitionTableChoiceUtil'
};

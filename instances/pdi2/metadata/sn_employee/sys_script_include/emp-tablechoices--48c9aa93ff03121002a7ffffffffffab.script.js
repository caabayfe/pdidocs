var emp_tableChoices = Class.create();
emp_tableChoices.prototype = {
    initialize: function() {},
    process: function() {
        var tables = ['sn_employee_profile'];
        if (GlidePluginManager.isActive("com.sn_hr_core"))
            tables.push('sn_hr_core_profile');
        return tables;
    },
    type: 'emp_tableChoices'
};

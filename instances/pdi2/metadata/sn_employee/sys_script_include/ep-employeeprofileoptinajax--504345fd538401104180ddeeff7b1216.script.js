var ep_employeeProfileOptInAjax = Class.create();
ep_employeeProfileOptInAjax.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {

    /**
     * This API is for opting employee profile 
     * functionality
     */
    optIn: function() {
        return new ep_UtilsSNC().optIn();
    },
    /**
     * This API is for opting out employee profile 
     * functionality
     */
    optOut: function() {
        return new ep_UtilsSNC().optOut();
    },
    /**
     * This API is to fetch the employee profile details
     */
    fetchOptInDetails: function() {
        var result = {};
        var empProfileUtil = new ep_UtilsSNC();
        result.empProfileOpted = empProfileUtil.isEmployeeProfileEnabled();
        result.empDefPresent = (empProfileUtil.getCurrentDefinition()) ? true : false;
        result.isNewOrgChartExist = empProfileUtil.isNewOrgChartPresent();
        return JSON.stringify(result);
    },

    type: 'ep_employeeProfileOptInAjax'
});

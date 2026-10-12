var EP_EmployeeJobPositionUtil = Class.create();
EP_EmployeeJobPositionUtil.prototype = Object.extendsObject(EP_EmployeeJobPositionUtilSNC, {
    initialize: function() {
        EP_EmployeeJobPositionUtilSNC.prototype.initialize.apply(this, arguments);
    },

    type: 'EP_EmployeeJobPositionUtil'
});

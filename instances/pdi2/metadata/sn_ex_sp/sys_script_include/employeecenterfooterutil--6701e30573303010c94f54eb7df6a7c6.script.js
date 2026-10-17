var EmployeeCenterFooterUtil = Class.create();
EmployeeCenterFooterUtil.prototype = Object.extendsObject(EmployeeCenterFooterUtilSNC, {

	initialize: function () {
        EmployeeCenterFooterUtilSNC.prototype.initialize.apply(this, arguments);
    },
	
    type: 'EmployeeCenterFooterUtil'
});

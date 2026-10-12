var EmployeeTaxonomyUtil = Class.create();
EmployeeTaxonomyUtil.prototype = Object.extendsObject(EmployeeTaxonomyUtilSNC, {
    initialize: function() {
        EmployeeTaxonomyUtilSNC.prototype.initialize.apply(this, arguments);
    },

    type: 'EmployeeTaxonomyUtil'
});

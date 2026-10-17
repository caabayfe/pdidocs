var PerformanceIndicatorUtil = Class.create();
PerformanceIndicatorUtil.prototype = Object.extendsObject(PerformanceIndicatorUtilSNC, {
    initialize: function() {
        PerformanceIndicatorUtilSNC.prototype.initialize.apply(this, arguments);
    },

    type: 'PerformanceIndicatorUtil'
});

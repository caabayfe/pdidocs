var PortalPerformanceUtil = Class.create();
PortalPerformanceUtil.prototype = Object.extendsObject(PortalPerformanceUtilSNC, {
    initialize: function () {
        PortalPerformanceUtilSNC.prototype.initialize.apply(this, arguments);
    },
    type: 'PortalPerformanceUtil'
});

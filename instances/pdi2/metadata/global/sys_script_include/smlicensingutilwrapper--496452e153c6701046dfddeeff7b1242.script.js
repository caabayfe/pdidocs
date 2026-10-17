var SMLicensingUtilWrapper = Class.create();
SMLicensingUtilWrapper.prototype = {
    initialize: function() {
        this.svcLicensingUtil = new SNC.LicensingUtil();
    },

    getServersForLicensing: function() {
      return this.svcLicensingUtil.getServersForLicensing()
    },
    addServiceAssociationCondition: function(target, currentConditions, types, ref) {
       this.svcLicensingUtil.addServiceAssociationCondition(target, currentConditions, types, ref);

    },
    isNewLicenseModel: function() {
         return this.svcLicensingUtil.isNewLicenseModel();

    },
    disableCalculateNumberOfServersJob: function() {
        this.svcLicensingUtil.disableCalculateNumberOfServersJob();
    },
    type: 'SMLicensingUtilWrapper'
};

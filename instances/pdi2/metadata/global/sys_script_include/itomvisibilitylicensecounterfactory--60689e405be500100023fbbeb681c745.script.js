var ITOMVisibilityLicenseCounterFactory = Class.create();
ITOMVisibilityLicenseCounterFactory.prototype = {
    initialize: function() {
    },

	getCounter: function() {
		var smPluginActive = pm.isActive('com.snc.service-mapping');
		var svcLicensingUtil = SNC.LicensingUtil;
		var licenseUtil = new sn_itom_license.ITOMLicensingUtils();
        var isOTOMPresent = (licenseUtil.isVisibilityPresent('otm') || licenseUtil.isDiscoveryPresent('otm'));
		if (smPluginActive && svcLicensingUtil && this._countLicensableServices()) {
			try {
				return isOTOMPresent ?  new ITOMVisibilityLicenseCounterWithServicesV2() : new ITOMVisibilityLicenseCounterWithServices();
			} catch (e) {
				gs.warn('Failed to initialize ITOMVisibilityLicenseCounterWithServices Script Include: ' + e);
			}
		}

        return isOTOMPresent ? new ITOMVisibilityLicenseCounterV2() : new ITOMVisibilityLicenseCounter();
       
    },

	_countLicensableServices: function() {
		var licensableServiceTypes = gs.getProperty('itom.visibility.licensable_service_types', '');
		var ga = new GlideAggregate('cmdb_ci_service_discovered');
		var services = 0;
		if (ga.isValid()) {
			ga.addAggregate('COUNT');
			ga.addQuery('type', 'IN', licensableServiceTypes);
			ga.query();
			ga.next();
			services = parseInt(ga.getAggregate('COUNT'));
		}

		return services;
	},

    type: 'ITOMVisibilityLicenseCounterFactory'
};

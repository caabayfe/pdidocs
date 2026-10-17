var EvtMgmtLicenseCount = Class.create();
	EvtMgmtLicenseCount.prototype = {
		initialize: function() {
		},
		
		getNodesCount: function() {
			gs.log("ITOM Health Licensing Usage Count");
			var EMCount = this.getEMCount();
			var OICount = 0;
			var isOIInstalled = new GlidePluginManager().isRegistered('com.snc.sa.metric');
			if (isOIInstalled){     // check if OI installed
				new ITOMHealthLicenseCounter().deletePreviousCIs();
				OICount = MetricLicensingUtil.getCount();
			}
			
			var licenseUtils = new sn_itom_license.ITOMLicensingUtils(); 
			licenseUtils.updateProductCount("Event Management", EMCount);
			licenseUtils.updateProductCount("Operational Intelligence", OICount);
		},
		getEMCount: function(){
			var gr = new GlideAggregate('em_unique_nodes');
			gr.addQuery('is_licensable', true);
			gr.addAggregate('COUNT');
			gr.query();
			var EMCount = 0;
			if (gr.next()) 
				EMCount = gr.getAggregate('COUNT');
			return EMCount;
	}
	};

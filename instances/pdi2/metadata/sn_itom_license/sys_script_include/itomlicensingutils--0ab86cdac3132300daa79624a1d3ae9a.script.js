var ITOMLicensingUtils = Class.create();
ITOMLicensingUtils.prototype = {
	initialize: function() {
		this.api = new LegacyLicenseSubscriptionEntitlement();
		this.skuSysId = this._getSKUIDs();
	},

	_getSKUIDs : function() {
		var res = {};
		var gr = new GlideRecord('itom_lu_sku_type');
		gr.query();
		while(gr.next()) {
			res[gr.getValue('sku')] = gr.getUniqueValue(); 
		}
		return res;
	}, 
	
	getValueStreams: function() {

		var result = [];
		var gr = new GlideRecord('itom_lu_bundle_mappings');
		gr.query();
		while(gr.next()) {
			var vs = gr.getDisplayValue('value_stream');
			vs = vs.split(",");
			vs.forEach(function(obj){
				obj = obj.trim();
				if(result.indexOf(obj) == -1)
					result.push(obj);
			});
		}
		return result;
	},

	getOptimizationVSLabel: function(){
		return "Optimization";	
	},

	getVisibilityVSLabel: function(){
		return "Visibility";
	},

	getHealthVSLabel: function(){
		return "Health";
	},

	// Returns map of categories to number of devices per subscription unit.
	// Example output: {"Servers": "1", "Containers": "3", "PaaS": "3", "Unresolved monitored objects": "1"}
	getCategory2Ratio: function() {
		var licenseInfoJson = this._getItomLicenseInfo();
		var suRatio = {};
		if (!licenseInfoJson.length)
			return {};
		
		licenseInfoJson.forEach(function(obj) {
			var catRatio = obj.su_ratio;
			Object.keys(catRatio).forEach(function(key){
				if(!suRatio.hasOwnProperty(key)) {
					suRatio[key] = catRatio[key];
				}
			});
		})
		
		return suRatio;
	},
	
	getCategories: function() {
		var category2Ratio = this.getCategory2Ratio();
		return Object.keys(category2Ratio);
	},
	
	isLegacyLicenseModel: function() {
		if (this.isNewLicenseModel())
			return false;

		return !(!this._getItomLegacyLicenseInfo().length);
	},

	isNewLicenseModel: function() {
 		return !(!this._getItomLicenseInfo().length);
	},

	_getItomLicenseInfo: function() {
		var licenseInfo = this.api.getUnifiedItomLicenseInfo();
		if (!licenseInfo)
			return [];
		
		return JSON.parse(licenseInfo);
	},

	_getItomLegacyLicenseInfo: function() {
		var licenseInfo = this.api.getItomLegacyLicenseInfo();
		if (!licenseInfo)
			return [];

		return JSON.parse(licenseInfo);
	},
	
	// Returns template for teams to use in their CI counting jobs.
	// The template is a JSON object that maps each category to 0.
	// Categories are aligned with the data in itom_lu_metadata table.
	// Example output: {"Servers": 0, "Containers": 0, "PaaS": 0, "Unresolved monitored objects": 0}

	getCountsJsonTemplate: function(valueStream,skuType) {

		// It will return the first record irrespective of Value Stream if valueStream and skuType is not defined

		if(!valueStream && !skuType)
			var categories = new sn_itom_license.ITOMLicensingMetaData().getCategoryNames();
		else if(!skuType)
			var categories = new sn_itom_license.ITOMLicensingMetaData().getCategoryNamesBasedonValueStream(valueStream.toLowerCase(),'itom');
		else 
			var categories = new sn_itom_license.ITOMLicensingMetaData().getCategoryNamesBasedonValueStream(valueStream.toLowerCase(),skuType);
		
		var category2Count = {};
		for (var i = 0 ; i < categories.length ; i++) {
			var category = categories[i];
			category2Count[category] = 0;
		}
				
		return category2Count;
	},


	// Returns purchased count for the given skuId.
	getPurchasedCount: function(skuId) {
		var licenseInfo = this._getItomLicenseInfo();
		if (!licenseInfo.length)
			return 0;
		
		for (var i = 0 ; i < licenseInfo.length ; i++) {
			var singleLicenseInfo = licenseInfo[i];
			var license = singleLicenseInfo.app_bundle + '';
			if (skuId == license)
				return parseInt(singleLicenseInfo.purchased_count);
		}
		
		return 0;
	},

	// add discovery source 
	addDiscoverySource: function(source) {
		var productCountGr = new GlideRecord('itom_lu_discovery_sources');
		productCountGr.addQuery('source', source);
		productCountGr.query();

		if (productCountGr.next())
			return productCountGr.getUniqueValue();

		productCountGr.initialize();
		productCountGr.setValue('source', source);

		var sourceSysId = productCountGr.insert();
		this.addDiscoverySourceMapping(sourceSysId);
        	return sourceSysId;
	},
	addDiscoverySourceMapping: function(sourceId) {
        	gr = new GlideRecord('itom_lu_discovery_source_mapping');
        	gr.addQuery('category', '!=', 'enduser_devices');
        	gr.query();
        	while (gr.next()) {
            		var sources = gr.getDisplayValue('sources');
            		var sourcesId = gr.getValue('sources');
            		if (sourcesId.indexOf(sourceId) == -1) {
                		sourcesId += "," + sourceId;
                		gr.setValue('sources', sourcesId);
                		if (gr.update()) {
                    			gs.info('Discovery Source Updated in ' + gr.getValue('category'));
                		}
            		}
        	}
    	},
	// Updates the given product's count (for use in legacy ITOM bundle licensing)
	updateProductCount: function(product, count) {
		var productCountGr = new GlideRecord('itom_lu_product_count');
		productCountGr.addQuery('product', product);
		productCountGr.query();

		var update = true;
		// product should always exist OOTB but just in case ...
		if (!productCountGr.next()) {
			update = false;
			productCountGr = new GlideRecord('itom_lu_product_count');
			productCountGr.setValue('product', product);
		}

		productCountGr.setValue('count', count);

		return (update ? productCountGr.update() : productCountGr.insert());
	},

	ignoreITOMDiscovery: function(skuType){
		if(!skuType)
			skuType = 'itom';
		var ignoreITOMDiscovery = false;
		var instanceSkuList = this._getItomLicenseInfo();
		var bundles = new sn_itom_license.ITOMLicensingMetaData().getBundleIDfromSkuAndBundleType(skuType,"1")
		var VISIBILITY = (skuType == 'itom') ? 'visibility' : 'otm_visibility';

		for (var i = 0; i < instanceSkuList.length; i++) {
			var sku = instanceSkuList[i];
			// ITOM or OTOM Discovery SKU should not be used with visibility a-la-carte or any bundles. Ignore it if this is the case.
			if (sku && (sku.app_bundle == VISIBILITY || new global.ArrayUtil().contains(bundles, sku.app_bundle))){
				ignoreITOMDiscovery = true;
			}
		}

		return ignoreITOMDiscovery;
	},
	
	isOptV2SKUPresent: function(){
		var instanceSkuList = this._getItomLicenseInfo();
		for (var i = 0; i < instanceSkuList.length; i++) {
			var sku = instanceSkuList[i];
			if (sku && (sku.app_bundle == 'optimizationv2' || sku.app_bundle == 'itom_enterprisev2')){
				return true;
			}
		}
		
		return false;
	},

	getDomains: function(){
		var domains = ['global'];
		var domainGR = new GlideRecord('domain');
		if (domainGR.isValid()){
			domainGR.query();
			while (domainGR.next())
				domains.push(domainGR.getValue('sys_id'));
		}

		return domains;
	},

	_isValustreamSKUPresent : function(valueStream,skuType) {

		if(!skuType)
			skuType = 'itom';

		var bundleMapping = new sn_itom_license.ITOMLicensingMetaData().getBundleMapping();
		var instanceSkuList = this._getItomLicenseInfo();

		for(var i = 0; i < instanceSkuList.length ; i++) {
			var sku = instanceSkuList[i];
			if(new global.ArrayUtil().contains(bundleMapping[valueStream], sku.app_bundle)) {
				if("type" in sku && sku.type == skuType)
					return true;
				else if (sku.app_bundle.indexOf(skuType) != -1)
					return true;
				else if(skuType == 'itom')
					return true;
			}
		}
		return false;
	},
	
	isDiscoveryPresent : function(skuType) {
		return this._isValustreamSKUPresent('discovery',skuType);
	},

	isVisibilityPresent : function(skuType) {
		return this._isValustreamSKUPresent('visibility',skuType);
	},

	isHealthPresent : function(skuType) {
		return this._isValustreamSKUPresent('health',skuType);
	},

	isOptimizationPresent : function(skuType) {
		return this._isValustreamSKUPresent('optimization',skuType);
	},

	getMaxResultsFor: function(valueStream,skuType){
		return parseInt(this._getLicensableCIsTableInfo(valueStream, 'max_results', skuType)); 
	},
	
    getAdditionalFiltersFor: function(valueStream, skuType) {
		return this._getLicensableCIsTableInfo(valueStream, 'additional_filters', skuType);
	},

	_getLicensableCIsTableInfo: function(valueStream, column, skuType){
        if(!skuType)
			skuType = 'itom';
		var itomLicCIsGR = new GlideRecord('itom_lu_licensable_cis_trigger');
        itomLicCIsGR.addQuery('value_stream', valueStream.toLowerCase());
		itomLicCIsGR.addQuery('sku', this.skuSysId[skuType]);
        itomLicCIsGR.setLimit(1);
        itomLicCIsGR.query();
        if (itomLicCIsGR.next())
            return itomLicCIsGR.getValue(column);
	},

	getExclusionTableName: function(valueStream, skuType) {
		if(valueStream == "Discovery")
			return skuType + "_visibility_exclusions"; // visibility and discovery both leverage same exclusion table i.e. itom_visibility_exclusions
         
        return skuType + "_" + valueStream.toLowerCase() + "_exclusions";
    },

    isThisTableSharedByItomAndOtom : function(tableName) {
	// 0c5beb6b53c7601046dfddeeff7b120a sys_id of itom in itom_lu_sku_type table
	// b1c40f94c7003010b92c660703c26078 sys_id of otom in itom_lu_sku_type table
	      
        var gr = new GlideRecord('itom_lu_category_metadata');
        gr.addQuery('table', tableName);
	gr.addEncodedQuery('sku_typeLIKE0c5beb6b53c7601046dfddeeff7b120a^sku_typeLIKEb1c40f94c7003010b92c660703c26078');
        gr.setLimit(1);
        gr.query();
        return gr.next();
    },

	setStatusforListing : function(valueStream,status,skuType) {
		var gr = new GlideRecord('itom_lu_licensable_cis_trigger');
		if(skuType)
			gr.addQuery('sku', this.skuSysId[skuType]);
		gr.addQuery('value_stream', valueStream);
		gr.query();
		if(gr.next())
			gr.setValue('status',status);
		gr.update();
	},

	setCompletedStatusforListing : function(valueStream, skuType) {
		if (this.isJobCanceled(valueStream, skuType)) {
			this.setStatusforListing(valueStream,'canceled',skuType);
			this.setJobCanceledFalse(valueStream, skuType);
		}
		else 
			this.setStatusforListing(valueStream,'completed',skuType);
	},

	isListingJobRunning : function(sysIDs) {
			var gr = new GlideRecord('itom_lu_licensable_cis_trigger');
			gr.addQuery('status', 'running');
			if(sysIDs)
				gr.addQuery('sys_id','IN',sysIDs);
			gr.setLimit(1);
			gr.query();
			return gr.next();
	},

    isJobCanceled : function(valueStream, skuType) {
		var gr = new GlideRecord('itom_lu_licensable_cis_trigger');
		if(skuType)
			gr.addQuery('sku', this.skuSysId[skuType]);	
		gr.addQuery('value_stream', valueStream);
		gr.addQuery('is_cancel', 'true');
		gr.setLimit(1);
		gr.query();
		return gr.next();
	},

	setJobCanceledFalse : function(valueStream, skuType) {
		var gr = new GlideRecord('itom_lu_licensable_cis_trigger');
		if(skuType)
			gr.addQuery('sku', this.skuSysId[skuType]);
		gr.addQuery('value_stream', valueStream);
		gr.query();
		if(gr.next()) {
			gr.setValue('is_cancel','false');
			gr.update();
		}
	},

	/*
	This is an utility function to check if the listing job got canceled by customer.
	*/
	isHealthJobCanceled : function(skuType) {
		return this.isJobCanceled('health', skuType);
	},

	isVisibilityJobCanceled : function(skuType) {
		return this.isJobCanceled('visibility', skuType);
	},

	isOptimizationJobCanceled : function(skuType) {
		return this.isJobCanceled('optimization', skuType);
	},
	
	isDiscoveryJobCanceled : function(skuType) {
		return this.isJobCanceled('discovery', skuType);
	},

	isOTOMPresent : function() {
		return this.isSKUPresent('otm');
	},

	isSKUPresent : function(sku) {
		var instanceSkuList = this._getItomLicenseInfo();
			for(var i = 0; i < instanceSkuList.length ; i++)
				if (instanceSkuList[i].app_bundle.indexOf(sku) != -1)
					return true;

		return false;
	},

	getSKUSysID : function(sku) {
		var gr = new GlideRecord('itom_lu_sku_type');
        gr.addQuery('sku',sku);
		gr.query();
		if(gr.next())
			return gr.getUniqueValue();
		gs.debug('Invalid SKU Type');
		return "";
	},
	cleanUpCIListingReport: function(valueStream, sku) {
		if(!sku)
			sku = 'itom';
		var gr = new GlideRecord('itom_lu_licensable_cis');
		gr.addQuery('value_stream', valueStream);
		gr.addQuery('sku',this.skuSysId[sku]);
		gr.query();
		gr.deleteMultiple();

    },

	type: 'ITOMLicensingUtils'
};

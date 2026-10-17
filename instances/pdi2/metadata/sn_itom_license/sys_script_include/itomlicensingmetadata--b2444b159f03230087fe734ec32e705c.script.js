var ITOMLicensingMetaData = Class.create();
ITOMLicensingMetaData.prototype = {
	
	METADATA_TABLE : 'itom_lu_metadata',
	CATEGORY_METADATA_TABLE : 'itom_lu_category_metadata',
	BUNDLE_MAPPING_TABLE : 'itom_lu_bundle_mappings',
	isInitiate : false,
	metadataTableNameVSCategory : {},
	categoryMetadataTable : {},

    initialize: function() {
		this.util = new ITOMLicensingUtils();
		this.bundleMapping = this.getBundleMapping();
	},

	getBundleMapping : function() {

		var result = {};
		var gr = new GlideRecord(this.BUNDLE_MAPPING_TABLE);
		gr.query();
		while(gr.next()) {
			var vs = gr.getValue('value_stream');
			vs = vs.split(",");
			vs.forEach(function(obj){
				if(result[obj]) {
					result[obj].push(gr.getValue('bundle_id'));
				}
				else {
					result[obj] = [gr.getValue('bundle_id')];
				}
			});
		}
		return result;
	},

	getServersTables: function() {
		return this.getTables("Servers");
	},

	getPaasTables: function() {
		return this.getTables("PaaS");
	},

	getContainersTables: function() {
		return this.getTables("Containers");
	},

	getTables: function(category) {
		var tablesList = [];
		var gr = new GlideRecord(this.METADATA_TABLE);
		gr.addQuery('category', category);
		gr.query();
		while (gr.next()) {
			tablesList.push(gr.getValue('table'));
		}

		return tablesList;
	},
	getTablesForSku: function(category, skuTypeSysId) {
		var tablesList = [];
		var gr = new GlideRecord(this.CATEGORY_METADATA_TABLE);
		gr.addQuery('category', category);
		gr.addQuery('sku_type', skuTypeSysId);
		gr.query();
		while (gr.next()) {
			tablesList.push(gr.getValue('table'));
		}
		return tablesList;
	},

	initMetadataLists: function(cis) {
		if(this.isInitiate)
			return;

		this.isInitiate = true;
		var gr = new GlideRecord(this.METADATA_TABLE);
		gr.query();
		while (gr.next()) {
			this.metadataTableNameVSCategory[gr.getValue('table')] = gr.getValue('category');
		}
	},

	initCategoryMetadataTable : function() {		
		if(this.isInitiateCategoryMetadata)
			return;

		this.isInitiateCategoryMetadata = true;	
		var res = {};
		var gr = new GlideRecord(this.CATEGORY_METADATA_TABLE);
		gr.query();
		while (gr.next()) {
			var skus = gr.getValue('sku_type').split(',');
			var category = gr.getValue('category');
			var table = gr.getValue('table');
			skus.forEach(function(sku){
				if(res[sku]) 
					res[sku][table] = category;
				else {
					var skuObj = {};
					skuObj[table] = category;
					res[sku] = skuObj;
				}
			});
		}
		this.categoryMetadataTable = res;
		return;
	},


	getCategory: function(table) {
		var map = this.getCategories([table]);
		var category = map[table];
		if(!category)
			category = '';

		return category;
	},
	
	getCategories: function(tables, sku) {
		if(sku) {
			var skuId = this.util.skuSysId[sku];
			this.initCategoryMetadataTable();
		} else 
			this.initMetadataLists();

		var ans = {};
		if (!tables || tables == [])
			return ans;

		for (var index = 0; index < tables.length ; index++) {
			var table = tables[index];
			var gth = new GlideTableHierarchy(table);
			var allParants = gth.getTables();
			for (var p = 0; p < allParants.length; p++) {
				var curentParent = allParants[p];
				var category = (sku) ? this.categoryMetadataTable[skuId][curentParent] : this.metadataTableNameVSCategory[curentParent];
				if (category) {
					ans[table] = category;
					break;
				}
			}
		}
		return ans;
	},

	getCategoryNames: function() {
		var licenseInfoList = new LegacyLicenseSubscriptionEntitlement().getUnifiedItomLicenseInfo();
		if (!licenseInfoList) {
			gs.error('Could not retreive license information from GlideEntitlement API');
			return [];
		}

		licenseInfoList = JSON.parse(licenseInfoList);

		var i;
		var categories = [];
		for (i = 0; i < licenseInfoList.length; i++) {
			var ratioInfo = licenseInfoList[i].ciTypeToSURatioMap || licenseInfoList[i].su_ratio;
			if (ratioInfo) {
				categories = this.getCategoriesOfSku(ratioInfo);
				break;
			}
		}

		if (!categories.length) {
			gs.error('No categories were defined from the license information from GlideEntitlement API');
			return [];
		}

		categories.push(this.getCategoryNameForUnknown());
		return categories;
	},

	getCategoryNamesBasedonValueStream : function(valueStream, skuType) {
		var licenseInfoList = new LegacyLicenseSubscriptionEntitlement().getUnifiedItomLicenseInfo();

		if (!licenseInfoList) {
			gs.error('Could not retreive license information from GlideEntitlement API');
			return [];
		}

		licenseInfoList = JSON.parse(licenseInfoList);

		var skuList = this.bundleMapping[valueStream];
		var bundleListforSKU = this.getBundleIdFromSkuType(skuType);

		if (!skuList) {
			gs.error('Could not retreive a list of Bundles for a given valuestream');
			return [];
		}

		var categories = [];
		for (var i = 0; i < licenseInfoList.length; i++) {
			var sku = licenseInfoList[i];
			var ratioInfo = sku.ciTypeToSURatioMap || sku.su_ratio;
			if (new global.ArrayUtil().contains(skuList,sku.app_bundle) && new global.ArrayUtil().contains(bundleListforSKU,sku.app_bundle) &&ratioInfo) {
				if(sku.app_bundle.indexOf(skuType) != -1) {
					categories = this.getCategoriesOfSku(ratioInfo);
					break;
				}
				else if(skuType == 'itom') {
					categories = this.getCategoriesOfSku(ratioInfo);
					break;
				}
			}
		}
		categories.push(this.getCategoryNameForUnknown());
		return categories;
	},

	getCategoriesOfSku : function(ratioInfo) {
		var categories = (Object.keys(ratioInfo)).filter(function(category) { return category != 'Unknown'; });
		return categories;
	},

	getCategoryNameForUnknown: function() {
		return "Unresolved monitored objects";
	},

	getBundleStreams : function(bundleType) {
		var bundleStream = {};
		var gr = new GlideRecord(this.BUNDLE_MAPPING_TABLE);
		gr.addQuery('bundle_type',bundleType)
		gr.query();
		while(gr.next()) {
			bundleStream[gr.getValue('bundle_id')] = gr.getValue('value_stream').split(',');
		}
		return bundleStream;
	},

	getBundleIdFromSkuType : function(sku) {
		var skuId = this.util.skuSysId[sku];
		var res = [];
		var gr = new GlideRecord(this.BUNDLE_MAPPING_TABLE);
		gr.addQuery('sku',skuId)
		gr.query();
		while(gr.next()) {
			res.push(gr.getValue('bundle_id'));
		}
		return res;
	},

	getBundleIDfromSkuAndBundleType : function(sku,bundleType) {
		var skuId = this.util.skuSysId[sku];
		var res = [];
		var gr = new GlideRecord(this.BUNDLE_MAPPING_TABLE);
		gr.addQuery('sku',skuId)
		gr.addQuery('bundle_type',bundleType);
		gr.query();
		while(gr.next()) {
			res.push(gr.getValue('bundle_id'));
		}
		return res;
	},

    type: 'ITOMLicensingMetaData'
};

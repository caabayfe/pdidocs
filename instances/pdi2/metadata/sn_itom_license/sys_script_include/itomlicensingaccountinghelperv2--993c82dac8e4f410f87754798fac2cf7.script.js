var ITOMLicensingAccountingHelperV2 = Class.create();

ITOMLicensingAccountingHelperV2.prototype = {
	initialize: function () {
		this.streamCounts = {};
		this.streamCountsPerDomain = [];
		this.domainWiseAccountedRecs = [];

		this.VALUE_STREAM = 'value_stream';
		this.DOMAIN = 'sys_domain';
		this.SKU_TYPE = 'sku';
		this.USAGE_ACCOUNT_TABLE = 'itom_lu_usage_account';
		this.CI_COUNTS_TABLE = 'itom_lu_ci_counts';
		this.utils = new ITOMLicensingUtils();
		this.metadataUtil = new ITOMLicensingMetaData();
		this.arrayUtil = new global.ArrayUtil();
		
		this.bundle2Streams = this.metadataUtil.getBundleStreams('1');
		
		this.aLaCarte2StreamsMapping = this.metadataUtil.getBundleStreams('0');

		this.aLaCarteSKUs = {};

		this.instanceSkuList = JSON.parse(new LegacyLicenseSubscriptionEntitlement().getUnifiedItomLicenseInfo());

	},

	_cleanup: function(skuType) {
		var skuNames = this.metadataUtil.getBundleIdFromSkuType(skuType);
		var cleanupGr = new GlideRecord(this.USAGE_ACCOUNT_TABLE);
		cleanupGr.addQuery('sku_name','IN',skuNames.join(","));
		cleanupGr.deleteMultiple();
	},

	_createAccountRecord: function (bundleId, skuUsage, domain) {
		var skuAccounting = new GlideRecord(this.USAGE_ACCOUNT_TABLE);
		skuAccounting.addQuery('sku_name', bundleId);
		skuAccounting.addQuery(this.DOMAIN, domain);
		skuAccounting.query();

		gs.info("creating accounting record for bundleId=" + bundleId + ", bundleUsageCount=" + skuUsage + " in domain " + domain);

		if (skuAccounting.next()) {
			skuAccounting.setValue('accounted_usage', skuUsage);
			skuAccounting.setValue(this.DOMAIN, domain);
			skuAccounting.update();
		} else {
			skuAccounting.setValue('sku_name', bundleId);
			skuAccounting.setValue('accounted_usage', skuUsage);
			skuAccounting.setValue(this.DOMAIN, domain);
			skuAccounting.insert();
		}

	},

	_getHighWaterMark: function(bundleId) {
		var highWaterMark = {};
		highWaterMark.total = 0; // High watermark among all value streams
		highWaterMark.nonALaCarte = 0; // High watermark among streams without purchased a la carte
		var streams = this.bundle2Streams[bundleId];
		for (var i = 0; i < streams.length; i++) {
			var stream = streams[i];
			var streamCount = this.streamCounts[stream];
			if (!streamCount)
				continue;

			if (streamCount > highWaterMark.total) {
				highWaterMark.bundleStream = stream;
				highWaterMark.total = streamCount;
			}

			if (!this._findValidSku(stream)) {
				if (streamCount > highWaterMark.nonALaCarte) {
					highWaterMark.nonALacarteStream = stream;
					highWaterMark.nonALaCarte = streamCount;
				}
			}
		}

		return highWaterMark;
	},

	_findValidSku: function(streamName) {
		
		var keys = Object.keys(this.aLaCarte2StreamsMapping)
			
		for(var i = 0 ; i < keys.length ; i++) {
			var obj = keys[i];
			if(this.aLaCarte2StreamsMapping[obj].length > 0 && this.aLaCarte2StreamsMapping[obj][0] == streamName && this.aLaCarteSKUs[obj])
				return this.aLaCarteSKUs[obj].app_bundle;
		}	
		
		return "";
	},

	accountUsage: function (isDomainSeparated,skuType) {
	
		// remove all existing accounting records
		this._cleanup(skuType);
		this.skuId = this.utils.getSKUSysID(skuType);
		
		var streamAggregate = new GlideAggregate(this.CI_COUNTS_TABLE);
		streamAggregate.addQuery('is_aggregated', 'true');
		streamAggregate.addQuery(this.SKU_TYPE, this.skuId);
		streamAggregate.addAggregate('SUM', 'su_count');
		streamAggregate.groupBy(this.VALUE_STREAM);
		streamAggregate.groupBy(this.DOMAIN);
		streamAggregate.query();

		while (streamAggregate.next()) {
			var streamCountPerVS = {};
			var totalUsage = parseInt(streamAggregate.getAggregate('SUM', 'su_count'));
			streamCountPerVS.stream = streamAggregate.getValue(this.VALUE_STREAM).toLowerCase();
			streamCountPerVS.domain = streamAggregate.getValue(this.DOMAIN).toLowerCase();
			streamCountPerVS.usage = totalUsage;
			gs.info(JSON.stringify(streamCountPerVS));
			this.streamCountsPerDomain.push(streamCountPerVS);

			if (this.streamCounts[streamCountPerVS.stream]) {
				this.streamCounts[streamCountPerVS.stream] += totalUsage;
			} else {
				this.streamCounts[streamCountPerVS.stream] = totalUsage;
			}
		}

		gs.debug("initialized streamCounts=" + global.JSON.stringify(this.streamCounts));
		gs.debug("starting accounting with license list=" + global.JSON.stringify(this.instanceSkuList));

		/*
         * we should NEVER encounter a scenario where there are multiple bundles in the SKU list
         * a customer can have ONE bundle with as many a la carte SKU's as they desire
         * if multiple bundles are found, we'll consider only the first bundle
         */
		var bundleSKU;

		// Filter instance SKU List based on SKU Type
		var skuNames = this.metadataUtil.getBundleIdFromSkuType(skuType);
		this.instanceSkuList = this.instanceSkuList.filter(function(obj) {
                    return skuNames.indexOf(obj.app_bundle) != -1;
		});
		
		// Visibility and Discovery SKUs should not be together. If they're, then ignore Discovery SKU
		// Removing Discovery if Visibility is Present.
		if(this.utils.ignoreITOMDiscovery(skuType)) {
			this.instanceSkuList = this.instanceSkuList.filter(function(obj) {
                    return obj.app_bundle.indexOf('discovery') == -1;
			});
		}
		
		for (var i = 0; i < this.instanceSkuList.length; i++) {
			var sku = this.instanceSkuList[i];
			var skuId = sku.app_bundle ? sku.app_bundle : "";

			// bundle id's are one of the following -> itom_standard, itom_pro, itom_enterprise
			if (this.bundle2Streams[skuId]) { // we found the first bundle SKU.. we account the usage against this bundle first
				if (bundleSKU) {
					// we found another bundle in the SKU's assigned to this instance.. skip it, log a warning
					gs.warn('Skipping additional ITOM bundle SKU assigned to the instance : ' + skuId);
				} else {
					bundleSKU = sku;
				}

				continue;
			}
			else if(this.aLaCarte2StreamsMapping[skuId]) {
				this.aLaCarteSKUs[skuId] = sku;
			}

			gs.warn('Skipping invalid ITOM license assigned to the instance : ' + skuId);
		}

		if (bundleSKU) {
			var bundleId = bundleSKU.app_bundle;
			var highWaterMark = this._getHighWaterMark(bundleId);
			gs.info('High Water Mark' + JSON.stringify(highWaterMark));
			// only bundle SKU assigned to this instance.. fill the bundle up and exit
			if (Object.keys(this.aLaCarteSKUs).length == 0) {
				// use the high watermark as the bundle count and return
				this._createAccountRecord(bundleId, highWaterMark.total, 'global'); // create the bundle usage record
				gs.debug('done accounting against bundle.. within bundle usage limits..');
				this._doDomainWiseAccounting(highWaterMark.bundleStream, bundleId, isDomainSeparated, skuType); //
				return;
			}

			// more than 1 SKU assigned.. start with checking the usage against the bundle
			var purchased_count = bundleSKU.purchased_count;
			var streams = this.bundle2Streams[bundleId];

			var bundleUsageCount = (highWaterMark.total <= purchased_count) ? highWaterMark.total :
			Math.max(highWaterMark.nonALaCarte, purchased_count);

			var bundleUsageStream;
			if (highWaterMark.total <= purchased_count) {
				bundleUsageStream = highWaterMark.bundleStream;
			} else if (highWaterMark.nonALaCarte <= purchased_count) {
				bundleUsageStream = highWaterMark.bundleStream;
			} else {
				bundleUsageStream = highWaterMark.nonALacarteStream;
			}

			for (i = 0; i < streams.length; i++) {
				var stream = streams[i];
				var streamCount = this.streamCounts[stream];
				if (!streamCount)
					continue;

				// adjust stream usage if there are valid SKU's available
				if (streamCount > bundleUsageCount) {
					if (this._findValidSku(stream) != '') {
						this.streamCounts[stream] -= bundleUsageCount;
					}
				} else {
					this.streamCounts[stream] = 0; // reduce the usage to 0 since we are within limits here
				}
			}

			// create the bundle usage record
			this._createAccountRecord(bundleId, bundleUsageCount, 'global');
			gs.debug('done accounting against bundle.. accounting against a la carte sku next...');

		}

		gs.debug("pending allocation=" + global.JSON.stringify(this.streamCounts));

		// account for the remaining usage from the value streams against the available SKU's
		for (var j = 0; j < Object.keys(this.aLaCarteSKUs).length; j++) {
			var skuId = Object.keys(this.aLaCarteSKUs)[j];
			if (this.aLaCarte2StreamsMapping[skuId].length > 0 && this.streamCounts[this.aLaCarte2StreamsMapping[skuId][0]] > 0) {
				this._createAccountRecord(skuId, this.streamCounts[this.aLaCarte2StreamsMapping[skuId][0]], 'global');
			}
		}

		this._doDomainWiseAccounting(bundleUsageStream, bundleId, isDomainSeparated, skuType); //
	},

	_doDomainWiseAccounting: function (bundleUsageStream, bundleId, isDomainSeparated, skuType) {
		if (!isDomainSeparated)
			return;

		gs.debug("ITOMLicensingAccountingHelperV2: Starting domain wise accounting ...");
		var mspHelper = new sn_itom_license.ITOMLicensingMSPHelperV2(this.streamCountsPerDomain, bundleUsageStream, this._getNonHighwatermarkStreamsInBundle(bundleUsageStream, bundleId));
		var domainWiseAccountingRecs = mspHelper.accountUsageForDomains(skuType); //
		if (domainWiseAccountingRecs && domainWiseAccountingRecs.length > 0){
			this._createDomainWiseAccountRecord(domainWiseAccountingRecs, skuType); //
		} else {
			// No domain wise data. Either every domain is reporting zero usage or
			// there is no license applied. Check for SKUs in instance to see if any license
			// is applied and if so, report zero usage for that SKU for all domains
			this._populateZeroUsageRecs(this._getSkusToPopulateFromInstance());
		}

		gs.debug("ITOMLicensingAccountingHelperV2: Domain wise accounting completed.");
	},

	_getSkusToPopulateFromInstance : function(){
		var skusToPopulate = [];
		for (var i = 0; i < this.instanceSkuList.length; i++){
			var sku = this.instanceSkuList[i];
			if (sku && this._isValidSKU(sku.app_bundle)){
				skusToPopulate.push(sku.app_bundle);
			}
		}

		return skusToPopulate;
	},

	_isValidSKU: function(sku){
		return (this._isBundleSKU(sku) || this._isAlacarteSKU(sku));
	},

	_isBundleSKU: function(sku){
		return this.bundle2Streams[sku];
	},

	_isAlacarteSKU: function(sku){
		return this.aLaCarte2StreamsMapping[sku];
	},

	_getNonHighwatermarkStreamsInBundle : function(bundleUsageStream, bundleId){
		var nonHighwatermarkStreams = [];
		var streamsInTheBundle = this.bundle2Streams[bundleId];
		if (streamsInTheBundle){
			for (var i = 0; i < streamsInTheBundle.length; i++){
				var eachStream = streamsInTheBundle[i];
				if (eachStream != bundleUsageStream){
					nonHighwatermarkStreams.push(eachStream);
				}
			}
		}

		return nonHighwatermarkStreams;
	},

	_createDomainWiseAccountRecord: function (domainWiseAccountingRecs, skuType) {
		var skusToPopulate = [];
		for (var i = 0; i < domainWiseAccountingRecs.length; i++) {
			var record = domainWiseAccountingRecs[i];
			if (record.usage > 0){
				this._createAccountRecord(record.sku, record.usage, record.domain);
				this.domainWiseAccountedRecs.push({'domain': record.domain, 'sku': record.sku});
				if (!skusToPopulate || !this.arrayUtil.contains(skusToPopulate, record.sku))
					skusToPopulate.push(record.sku);
			}
		}

		this._populateZeroUsageRecs(skusToPopulate);

		var domainWithNonZeroUsage = this._getDomainsWithNonZeroUsage();
		if (this._shouldCleanGlobalRecords(domainWithNonZeroUsage))
			this._cleanGlobalRecords(skuType);
	},

	_shouldCleanGlobalRecords: function(domainWithNonZeroUsage){
		// Clean global records if you have at least one domain other than global which has non-zero usage
		return (domainWithNonZeroUsage && (domainWithNonZeroUsage.length > 1 || (domainWithNonZeroUsage.length == 1 && domainWithNonZeroUsage[0] != 'global')));
	},

	_getDomainsWithNonZeroUsage: function(){
		var domainWithNonZeroUsage = [];
		if (this.domainWiseAccountedRecs){
			for (var i = 0 ; i < this.domainWiseAccountedRecs.length; i++){
				var accountedRec = this.domainWiseAccountedRecs[i];
				if (accountedRec.usage > 0)
					domainWithNonZeroUsage.push(accountedRec.domain);
			}
		}

		return domainWithNonZeroUsage;
	},

	_populateZeroUsageRecs: function(skusToPopulate){
		var allDomains = this.utils.getDomains();
		for (var i = 0; i < skusToPopulate.length; i++) {
			var sku = skusToPopulate[i];
			for (var j = 0; j < allDomains.length; j++){
				var domain = allDomains[j];
				if (!this._isAlreadyAccounted(domain, sku)){
					this._createAccountRecord(sku, 0, domain);
				}
			}
		}
	},

	_isAlreadyAccounted: function(domain, sku){
		if (this.domainWiseAccountedRecs){
			for (var i = 0 ; i < this.domainWiseAccountedRecs.length; i++){
				var accountedRec = this.domainWiseAccountedRecs[i];
				if (accountedRec.sku == sku && accountedRec.domain == domain)
					return true;
			}
		}

		return false;
	},

	_cleanGlobalRecords: function (skuType) {
		var skuNames = this.metadataUtil.getBundleIdFromSkuType(skuType);
		var usageCleanerGR = new GlideRecord('itom_lu_usage_account');
		usageCleanerGR.addQuery(this.DOMAIN, 'global');
		usageCleanerGR.addQuery('sku_name','IN',skuNames.join(","));
		usageCleanerGR.query();
		usageCleanerGR.deleteMultiple();
	},
	

	type: 'ITOMLicensingAccountingHelperV2'
};

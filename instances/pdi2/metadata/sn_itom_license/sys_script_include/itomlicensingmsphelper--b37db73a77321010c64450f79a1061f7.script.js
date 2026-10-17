var ITOMLicensingMSPHelper = Class.create();
ITOMLicensingMSPHelper.prototype = {
	initialize: function (streamCountsPerDomain, bundleUsageStream, otherStreamsInBundle) {
		this.streamCountsPerDomain = streamCountsPerDomain;
		this.bundleUsageStream = bundleUsageStream;
		this.otherStreamsInBundle = otherStreamsInBundle;
		this.utils = new sn_itom_license.ITOMLicensingUtils();
		this.otherStreamDeductions = {};
		this.arrayUtil = new global.ArrayUtil();
	},

	accountUsageForDomains: function () {
		var BUNLDE_ACCOUNT_CONDN = "sku_nameSTARTSWITHitom_";
		var skus = this.utils.getValueStreams();
		this.arrayUtil.concat(skus, ["optimizationv2"]);
		var ALACARTE_ACCOUNT_CONDN = "sku_nameIN" + skus.join(",").toLowerCase();

		var bundleRecords = this._getRecordsToRedistribute(BUNLDE_ACCOUNT_CONDN);
		var alacarteRecords = this._getRecordsToRedistribute(ALACARTE_ACCOUNT_CONDN);

		if (bundleRecords.length > 0){
			return this._invokeRedistribution(bundleRecords, alacarteRecords);
		} else {
			return this._reportStreamWiseUsageForDomains(alacarteRecords);
		}
	},

	_getRecordsToRedistribute: function (encodedQuery) {
		var records = [];
		var usageGR = new GlideRecord('itom_lu_usage_account');
		usageGR.addEncodedQuery(encodedQuery);
		usageGR.query();

		while (usageGR.next()) {
			var record = {
				'sku': usageGR.getValue('sku_name'),
				'usage': usageGR.getValue('accounted_usage'),
				'sys_id': usageGR.getValue('sys_id')
			};

			records.push(record);
		}

		return records;
	},

	_invokeRedistribution: function(bundleRecords, alacarteRecords){
		var domainWiseAccountingRecs = [];
		this.arrayUtil.concat(domainWiseAccountingRecs, this._redistributeUsage(bundleRecords, true));
		this.arrayUtil.concat(domainWiseAccountingRecs, this._redistributeUsage(alacarteRecords, false));
		// check if anything is pending
		if (this._checkPendingUsage()){
			this.arrayUtil.concat(domainWiseAccountingRecs, this._reportStreamWiseUsageForDomains(alacarteRecords));
		}

		return domainWiseAccountingRecs;
	},

	_checkPendingUsage: function(){
		var domainWiseUsage = this._getDomainWiseUsageToAccount();
		for (var j = 0; j < domainWiseUsage.length; j++) {
			var domainRecord = domainWiseUsage[j];
			if (domainRecord.usage > 0){
				return true;
			}
		}

		return false;
	},

	_reportStreamWiseUsageForDomains: function(usageRecords){
		var domainWiseAccountedRecords = [];
		for (var i = 0; i < usageRecords.length; i++) {
			var accountedRecord = usageRecords[i];
			gs.info("Accounted record "+JSON.stringify(accountedRecord));
			var domainWiseUsage = this._getDomainWiseUsageToAccount(accountedRecord.sku);
			for (var j = 0; j < domainWiseUsage.length; j++) {
				var domainRecord = domainWiseUsage[j];
				domainWiseAccountedRecords.push({
					'usage': domainRecord.usage,
					'domain': domainRecord.domain,
					'sku': accountedRecord.sku
				});
			}
		}

		return domainWiseAccountedRecords;
	},

	_redistributeUsage: function (usageRecords, isBundle) {
		var domainWiseAccountedRecords = [];
		for (var i = 0; i < usageRecords.length; i++) {
			var accountedRecord = usageRecords[i];

			var domainWiseUsage = (isBundle) ? this._getDomainWiseUsageToAccount(): this._getDomainWiseUsageToAccount(accountedRecord.sku);

			for (var j = 0; j < domainWiseUsage.length; j++) {
				var domainRecord = domainWiseUsage[j];
				if (this.otherStreamDeductions[domainRecord.domain] && this.arrayUtil.contains(this.otherStreamsInBundle, domainRecord.stream)){
					domainRecord.usage -= this.otherStreamDeductions[domainRecord.domain];
				}

				domainWiseAccountedRecords.push({
					'usage': Math.min(domainRecord.usage, accountedRecord.usage),
					'domain': domainRecord.domain,
					'sku': accountedRecord.sku
				});

				var remainingUsage = domainRecord.usage - accountedRecord.usage;

				if (remainingUsage < 0) {
					// within limit
					accountedRecord.usage = Math.abs(remainingUsage);

					if (isBundle){
						this._addOtherStreamDeductionForDomain(domainRecord.domain, domainRecord.usage);
					}

					domainRecord.usage = 0;
				} else {
					// over the limit
					domainRecord.usage -= accountedRecord.usage;

					if (isBundle){
						this._addOtherStreamDeductionForDomain(domainRecord.domain, accountedRecord.usage);
					}

					accountedRecord.usage = 0;
				}
			}
		}

		return domainWiseAccountedRecords;
	},

	_addOtherStreamDeductionForDomain: function(domain, deduction){
		// In a bundle, when high water mark is calculated and accounted, we have to deduct the usage of 
		// high water mark stream in all other streams too. For ex, let's say that visibility is high water mark and has a usage
		// of 100 SUs and health has 80 SUs. Let's say we have itom_pro bundle which has visibility and health and its capacity is 100 SUs. 
		// When we deduct 100 SUs from bundle for visibility, then health is also accounted for as it is part of the bundle.
		this.otherStreamDeductions[domain] = deduction;
	},

	_getDomainWiseUsageToAccount: function (stream) {
		var domainWiseUsage = [];
		for (var i = 0; i < this.streamCountsPerDomain.length; i++) {
			var streamCountObj = this.streamCountsPerDomain[i];
			if (streamCountObj && this._checkStream(stream, streamCountObj) && streamCountObj.usage > 0) {
				domainWiseUsage.push(streamCountObj);
			}
		}

		return domainWiseUsage;
	},

	_checkStream: function(stream, streamCountObj){
		return (streamCountObj.stream == stream || streamCountObj.stream == this.bundleUsageStream);
	},

	type: 'ITOMLicensingMSPHelper'
};

var ITOMLegacyLicensingAccountingHelper = Class.create();

ITOMLegacyLicensingAccountingHelper.prototype = {
    initialize: function() {
        this.productCounts = {}; // hold counts per individual products
        this.aLaCarteSKUs = {};
        this.instanceSkuList = JSON.parse(new LegacyLicenseSubscriptionEntitlement().getItomLegacyLicenseInfo());

        // Products
        this.DISCOVERY = "Discovery";
        this.EVENT_MGMT = "Event Management";
        this.SERVICE_MAPPING = "Service Mapping";
        this.OP_INT = "Operational Intelligence";
        this.CLOUD_MGMT = "Cloud Management";

        // Bundles
        this.ITOM_STD = "ITOM Standard";
        this.ITOM_PRO = "ITOM Professional";
        this.ITOM_ENT = "ITOM Enterprise";
        this.SW_MAPPING = "ServiceWatch Mapping";
        this.SW_INSIGHT = "ServiceWatch Insight";
        this.SW_SUITE = "ServiceWatch Suite";
        this.SW_SUITE_V2 = "ServiceWatch Suite v2";
        this.SERVICE_OPS_SUITE = "Service Operations Suite";
        this.IT_OPS_MGMT_SUITE = "IT Operations Management Suite";

        // Tables
        this.PRODUCT_COUNT_TABLE = 'itom_lu_product_count';
        this.USAGE_ACCOUNT_TABLE = 'itom_lu_usage_account';

        // Mapping between bundle and the products contained within
        this.bundle2Products = {};
        this.bundle2Products[this.ITOM_STD] = [this.DISCOVERY, this.EVENT_MGMT];
        this.bundle2Products[this.ITOM_PRO] = [this.DISCOVERY, this.EVENT_MGMT, this.OP_INT];
        this.bundle2Products[this.ITOM_ENT] = [this.CLOUD_MGMT, this.DISCOVERY, this.EVENT_MGMT, this.SERVICE_MAPPING, this.OP_INT];
        this.bundle2Products[this.SW_MAPPING] = [this.DISCOVERY, this.SERVICE_MAPPING];
        this.bundle2Products[this.SW_INSIGHT] = [this.DISCOVERY, this.EVENT_MGMT, this.SERVICE_MAPPING];
        this.bundle2Products[this.SW_SUITE] = [this.CLOUD_MGMT, this.DISCOVERY, this.EVENT_MGMT, this.SERVICE_MAPPING];
        this.bundle2Products[this.SW_SUITE_V2] = [this.CLOUD_MGMT, this.DISCOVERY, this.EVENT_MGMT, this.SERVICE_MAPPING];
        this.bundle2Products[this.SERVICE_OPS_SUITE] = [this.EVENT_MGMT, this.CLOUD_MGMT, this.SERVICE_MAPPING, this.DISCOVERY];
        this.bundle2Products[this.IT_OPS_MGMT_SUITE] = [this.EVENT_MGMT, this.CLOUD_MGMT, this.SERVICE_MAPPING, this.DISCOVERY];

        // Mapping between license_id and SKU name/bundle
        this.licenseId2Sku = {
            "0f8743e36ff0ba40d1c9c3154b3ee4dd": { name: this.IT_OPS_MGMT_SUITE, bundle: true },
            "4b8787a36ff0ba40d1c9c3154b3ee493": { name: this.IT_OPS_MGMT_SUITE, bundle: true },
            "cf8743e36ff0ba40d1c9c3154b3ee4db": { name: this.IT_OPS_MGMT_SUITE, bundle: true },
            "28363246db2a9b04848c581adc9619e4": { name: this.ITOM_STD, bundle: true },
            "44e651cadbdfe3c012c0f5771d96192d": { name: this.ITOM_STD, bundle: true },
            "3d79bdebdb3b3604d49ff5eeaf961982": { name: this.ITOM_PRO, bundle: true },
            "4b8743e36ff0ba40d1c9c3154b3ee4dc": { name: this.SERVICE_OPS_SUITE, bundle: true },
            "4b8787a36ff0ba40d1c9c3154b3ee48f": { name: this.SERVICE_OPS_SUITE, bundle: true },
            "895cf65adba20380d49ff5eeaf96194a": { name: this.SW_SUITE, bundle: true },
            "9d583580db3d2240653cf4331f9619b4": { name: this.SW_SUITE, bundle: true },
            "41b455806f0fae000ba092ae5d3ee455": { name: this.SW_SUITE_V2, bundle: true },
            "bb283940db3d2240653cf4331f96190f": { name: this.SW_INSIGHT, bundle: true },
            "da79bdebdb3b3604d49ff5eeaf9619b6": { name: this.ITOM_ENT, bundle: true },
            "e33140addbd07b00a3bdff661d9619cd": { name: this.OP_INT, bundle: false },
            "18562e8adba2d380f6dff1141d9619be": { name: this.SERVICE_MAPPING, bundle: false },
            "421613c9dba2134089f2f3231d961940": { name: this.CLOUD_MGMT, bundle: false },
            "5a63966e6f5eb5006de0a4f44b3ee4e9": { name: this.DISCOVERY, bundle: false },
            "81dfba0edbec3a00a71c7a9e0f961959": { name: this.EVENT_MGMT, bundle: false }
        };

        // remove all existing accounting records
        this._cleanup();
    },

    accountUsage: function() {
        var productCountsGr = new GlideRecord(this.PRODUCT_COUNT_TABLE);
        productCountsGr.query();

        while (productCountsGr.next())
            this.productCounts[productCountsGr.getValue('product')] = parseInt(productCountsGr.getValue('count'), 10);

        gs.debug("initialized productCounts=" + global.JSON.stringify(this.productCounts));
        gs.debug("starting accounting with license list=" + global.JSON.stringify(this.instanceSkuList));

        var bundleInfo = this._processLicenses();
        if (bundleInfo)
            this._processBundle(bundleInfo);

        this._processALaCarteSKUs();
    },

    _cleanup: function() {
        var cleanupGr = new GlideRecord(this.USAGE_ACCOUNT_TABLE);
        cleanupGr.deleteMultiple();
    },

    _createAccountRecord: function(skuName, skuUsage) {
        var skuAccounting = new GlideRecord(this.USAGE_ACCOUNT_TABLE);
        skuAccounting.addQuery('sku_name', skuName);
        skuAccounting.query();

        gs.debug("creating accounting record for sku_name=" + skuName + ", skuUsage=" + skuUsage);

        if (skuAccounting.next()) {
            skuAccounting.setValue('accounted_usage', skuUsage);
            skuAccounting.update();
        } else {
            skuAccounting.setValue('sku_name', skuName);
            skuAccounting.setValue('accounted_usage', skuUsage);
            skuAccounting.insert();
        }
    },

    _getHighWaterMark: function(bundleName) {
        var highWaterMark = {};
        highWaterMark.total = 0; // High watermark among all products
        highWaterMark.nonALaCarte = 0; // High watermark among products without purchased a la carte
        var products = this.bundle2Products[bundleName];
        for (var i = 0; i < products.length; i++) {
            var product = products[i];
            var productCount = this.productCounts[product];
            if (!productCount) {
                gs.debug('no product count found for: ' + product);
                continue;
            }

            // special case with ITOM Enteprise bundle where Service Mapping has x10 usage modifier
            if (bundleName == this.ITOM_ENT && product == this.SERVICE_MAPPING)
                productCount *= 10;

            if (productCount > highWaterMark.total) {
                highWaterMark.total = productCount;
                highWaterMark.product = product;
            }

            if (!this._findValidSku(product))
                highWaterMark.nonALaCarte = Math.max(productCount, highWaterMark.nonALaCarte);
        }

        return highWaterMark;
    },

    _findValidSku: function(productName) {
        var sku = this.aLaCarteSKUs[productName];
        if (sku)
            return sku;

        return null;
    },
    productCode2LegacyLicense: function(prodCode){
		var res;
		if(!prodCode) return res;
		var gr = new GlideRecord('sn_itom_license_legacy_mappings');
		gr.addQuery('product_code', prodCode);
		gr.query();
		if(gr.next()){
			res = {
				'name' : gr.bundle_name,
				'bundle' : this.bundle2Products.hasOwnProperty(gr.bundle_name)
			};
		}
		return res;
	},

    /*
     * we should NEVER encounter a scenario where there are multiple bundles in the SKU list
     * a customer can have ONE bundle with as many a la carte SKU's as they desire
     * if multiple bundles are found, we'll consider only the first bundle
     */
    _processLicenses: function() {
        var bundleInfo;
        var license;
        var sku;
        var i;
        var firstBundle = true;

        for (i = 0; i < this.instanceSkuList.length; i++) {
            sku = this.instanceSkuList[i];
            license = this.productCode2LegacyLicense(sku.product_code);
            if (!license) {
                gs.warn('Skipping invalid ITOM license assigned to the instance : ' + global.JSON.stringify(sku));
                continue;
            }

            if (!license.bundle) {
                this.aLaCarteSKUs[license.name] = sku;
                continue;
            }

            // we found the first bundle SKU.. we account the usage against this bundle first
            if (this.bundle2Products[license.name]) {
                // check if multiple bundles are in the SKU's assigned to this instance... skip it, log a warning
                if (!firstBundle) {
                    gs.warn('Skipping additional ITOM bundle SKU assigned to the instance : ' + skuId);
                } else {
                    firstBundle = false;
                    bundleInfo = {'sku': sku, 'name': license.name};
                }

                continue;
            }
        }

        gs.debug("bundleInfo=" + global.JSON.stringify(bundleInfo));
        return bundleInfo;
    },

    _processBundle: function(bundleInfo) {
        var highWaterMark = this._getHighWaterMark(bundleInfo.name);
        gs.debug("highWaterMark=" + global.JSON.stringify(highWaterMark));

        // only bundle SKU assigned to this instance.. fill the bundle up and exit
        if (Object.keys(this.aLaCarteSKUs).length == 0) {
            // use the high watermark as the bundle count and return
            this._createAccountRecord(bundleInfo.name, highWaterMark.total); // create the bundle usage record
            gs.debug('done accounting against bundle.. within bundle usage limits..');
            return;
        }

        // more than 1 SKU assigned.. start with checking the usage against the bundle
        var purchased_count = parseInt(bundleInfo.sku.purchased_count, 10);
        var products = this.bundle2Products[bundleInfo.name];

        var bundleUsageCount = (highWaterMark.total <= purchased_count) ? highWaterMark.total :
        Math.max(highWaterMark.nonALaCarte, purchased_count);

        for (i = 0; i < products.length; i++) {
            var product = products[i];
            var productCount = this.productCounts[product];
            if (!productCount)
                continue;

            // special case with ITOM Enteprise bundle where Service Mapping has x10 usage modifier
            if (bundleInfo.name == this.ITOM_ENT && product == this.SERVICE_MAPPING && product == highWaterMark.product) {
                var modifierApplied = true;
                productCount *= 10;
            }

            // adjust stream usage if there are valid SKU's available
            if (productCount > bundleUsageCount) {
                if (this._findValidSku(product)) {
                    // special case w/ x10 modifier on Service Mapping with ITOM Enterprise bundle,
                    // if its the highwater mark then we need to divide by 10 when accounting to a la carte SKUs ...
                    if (modifierApplied)
                        this.productCounts[product] -= (bundleUsageCount / 10);
                    else
                        this.productCounts[product] -= bundleUsageCount;
                }
            } else {
                this.productCounts[product] = 0; // reduce the usage to 0 since we are within limits here
            }
        }

        // create the bundle usage record
        this._createAccountRecord(bundleInfo.name, bundleUsageCount);
        gs.debug('done accounting against bundle.. accounting against a la carte sku next...');
    },

    _processALaCarteSKUs: function() {
        gs.debug("pending allocation=" + global.JSON.stringify(this.productCounts));

        // account for the remaining usage from the products against the available SKU's
        for (var j = 0; j < Object.keys(this.aLaCarteSKUs).length; j++) {
            var skuId = Object.keys(this.aLaCarteSKUs)[j];
            if (this.productCounts[skuId] > 0) {
                this._createAccountRecord(skuId, this.productCounts[skuId]);
            }
        }
    },

    type: 'ITOMLegacyLicensingAccountingHelper'
};

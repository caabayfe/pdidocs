var ITOMLicensingAggregationHelper = Class.create();
ITOMLicensingAggregationHelper.prototype = {
	initialize: function() {
		this.CI_COUNTS_TABLE_NAME = 'itom_lu_ci_counts';
		this.utils = new ITOMLicensingUtils();
		this.valueStreams = this.utils.getValueStreams();
		this.category2Ratio = this.utils.getCategory2Ratio();
		this.domains = this.utils.getDomains();
	},

	getAggregateMethod : function() {
		var isOTOMPresent = this.utils.isOTOMPresent();
		if(isOTOMPresent) {
			var gr = new GlideRecord('itom_lu_sku_type');
			gr.query();
			while (gr.next())
				this.aggregateCiCounts(gr.getValue('sku'));
		}
		else this.aggregateCiCounts("itom");

	},

	aggregateCiCounts: function(skuType) {

		var aggregates = this._initAggregatesJson();
		gs.info(JSON.stringify(aggregates));
        	var encodedQuery = 'sys_created_onONLast 90 days@javascript:gs.beginningOfLast90Days()@javascript:gs.endOfLast90Days()';
        	if (this._isDomainSeparated()) {
            		var domainSeparationEnabledOn = this._getDomainSeparationEnabledDate();
			if (domainSeparationEnabledOn && domainSeparationEnabledOn.length > 0) {
				var domainSeparationEnabledDate = new GlideDateTime();
				domainSeparationEnabledDate.setValue(domainSeparationEnabledOn);

				var currentDate = new GlideDateTime();
				var duration = GlideDateTime.subtract(domainSeparationEnabledDate, currentDate);
				if (duration.getDayPart() < 90) {
                    			//taking average from the days when domain separation is enabled
                    			encodedQuery = "sys_created_on>=" + domainSeparationEnabledOn;
                		}
            		}
        	}
		var ga = new GlideAggregate(this.CI_COUNTS_TABLE_NAME);
		ga.addAggregate('AVG', 'count');
		if(skuType) {
			this.skuId = this.utils.getSKUSysID(skuType);
			ga.addQuery('sku',this.skuId);
		}
		ga.addQuery('is_aggregated', false);
		ga.addEncodedQuery(encodedQuery);
		ga.addQuery('value_stream', 'IN', this.valueStreams);
		ga.addQuery('category', 'IN', Object.keys(this.category2Ratio));
		ga.groupBy('value_stream');
		ga.groupBy('category');
		ga.groupBy('sys_domain');
		ga.query();
		while (ga.next()) {
			var valueStream = ga.getValue('value_stream');
			var category = ga.getValue('category');
			var domain = ga.getValue('sys_domain');
			var categoryJson = aggregates[valueStream][domain][category];
			var avg = Math.floor(ga.getAggregate('AVG', 'count'));
			var suCount = this._calcSuCount(avg, categoryJson.su_ratio);
			categoryJson.count = avg;
			categoryJson.su_count = suCount;
		}

		this._updateCiCountsTable(aggregates);

		if(this.utils.isOTOMPresent()) {
			var accountingHelper = new ITOMLicensingAccountingHelperV2();
			accountingHelper.accountUsage(this._isDomainSeparated(),skuType);
		}
		else {
		var accountingHelper = new ITOMLicensingAccountingHelper();
		accountingHelper.accountUsage(this._isDomainSeparated());
		}
	},
	 _getDomainSeparationEnabledDate: function() {
        	var DSEnabledOn = gs.getProperty('sn_itom_license.domain_separation_enabled_date');
        	if (DSEnabledOn)
            		return DSEnabledOn;

        	// Check for oldest non-aggregated record where domain is not global i.e. a new domain has arrived
		var gr = new GlideRecord(this.CI_COUNTS_TABLE_NAME);
		gr.addQuery('sys_domain', '!=', 'global');
		gr.addQuery('is_aggregated', false);
		gr.setLimit(1);
		gr.orderBy('sys_created_on');
		gr.query();
		if (gr.next()) {
			// Update System Property
			var systemPropertyGr = new GlideRecord('sys_properties');
			systemPropertyGr.get('name', 'sn_itom_license.domain_separation_enabled_date');
			systemPropertyGr.setValue('value', gr.getValue('sys_created_on'));
			systemPropertyGr.update();
			return gr.getValue('sys_created_on');
        	}
    	},

	_isDomainSeparated: function(){
		return (GlidePluginManager.isActive('com.glide.domain.msp_extensions.installer') && this.domains.length > 1);
	},

	_initAggregatesJson: function() {
		var aggregates = {};
		var timestamp = new GlideDateTime();
		for (var i = 0; i < this.valueStreams.length; i++) {
			var valueStreamJson = {};
			for (var k = 0; k < this.domains.length; k++) {
				var domain = this.domains[k];
				var domainJson = {};

				var categories = Object.keys(this.category2Ratio);
				for (var j = 0 ; j < categories.length ; j++) {
					var category = categories[j];
					var categoryJson = {};
					categoryJson.count = 0;
					categoryJson.su_ratio = this.category2Ratio[category];
					categoryJson.su_count = 0;
					categoryJson.last_aggregated = timestamp;
					domainJson[category] = categoryJson;
				}

				valueStreamJson[domain] = domainJson;
			}

			var valueStream = this.valueStreams[i];
			aggregates[valueStream] = valueStreamJson;
		}

		return aggregates;
	},

	_updateCiCountsTable: function(aggregates) {
		var valueStreams = Object.keys(aggregates);
		for (var i = 0; i < valueStreams.length; i++) {
			var valueStream = valueStreams[i];
			var valueStreamJson = aggregates[valueStream];
			for (var j = 0; j < this.domains.length; j++){
				var domain = this.domains[j];
				var domainJson = valueStreamJson[domain];

				var categories = Object.keys(domainJson);
				for (var k = 0; k < categories.length; k++) {
					var category = categories[k];
					this._createOrUpdate(valueStream, category, domainJson[category], domain);
				}
			}
		}
	},

	_createOrUpdate: function(valueStream, category, values, domain) {
		var gr = new GlideRecord(this.CI_COUNTS_TABLE_NAME);
		gr.addQuery('value_stream', valueStream);
		if(this.skuId)
			gr.addQuery('sku',this.skuId);
		gr.addQuery('category', category);
		gr.addQuery('is_aggregated', true);
		gr.addQuery('sys_domain', domain);
		gr.query();
		var hasNext = gr.next();
		this._setValues(gr, values);
		if (hasNext) {
			gr.update();
		} else {
			gr.setValue('value_stream', valueStream);
			if(this.skuId)
				gr.setValue('sku',this.skuId);
			gr.setValue('category', category);
			gr.setValue('is_aggregated', true);
			gr.setValue('sys_domain', domain);
			gr.insert();
		}
	},

	_setValues: function(gr, values) {
		for (var key in values) {
			var value = values[key];
			if (key == 'su_ratio') {
				// Formatting ratio, assuming "to one"
				value = value + ":1";
			}
			gr.setValue(key, value);
		}
	},

	_calcSuCount: function(count, devicesPerSu) {
		if (devicesPerSu == 0)
			return 0;

		return parseInt(Math.floor(count / devicesPerSu));
	},

	type: 'ITOMLicensingAggregationHelper'
};

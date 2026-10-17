var WdfTokenMetrics = Class.create();
WdfTokenMetrics.prototype = {
    initialize: function() {
		this.logger = new WdfLogger();
		this.wdfUtil = new WdfUtil();
		this.dateFilterId = "1isbtneibfh62qooc5i8";
		this.productFilterId = "1isbto34eqi08e0jrilo";
		this.productDashboardMap = {
            "API Access Volume": "/now/platform-analytics-workspace/dashboards/params/edit/false/sys-id/543b66e7f350321033d25169f6968c2e",
			"Integration Hub - Transactions": "/now/integrationhub-usage-dashboard/ih-usage-dashboard",
			"Integration Hub - Orchestration": "/now/integrationhub-usage-dashboard/ih-usage-dashboard"
             };
    },

	fetchWDFDetailedProductMetrics: function(input) {
		var result = {
			"rows": []
		};

		if (typeof input !== 'object' || !input.hasOwnProperty("filter_inputs")) {
			return result;
		}
		var filterInputs = input["filter_inputs"];

		var {startDate, endDate} = this._getStartAndEndDates(filterInputs.filter(obj => obj.filterId === this.dateFilterId));

		var encodedQuery = "result=success^datestampBETWEENjavascript:gs.dateGenerate(" + JSON.stringify(startDate) + ",'start')@javascript:gs.dateGenerate(" + JSON.stringify(endDate) + ",'end')";

		var totalTokenUsedGar = new GlideAggregate("sn_wdf_token_usage_composition");
		totalTokenUsedGar.addEncodedQuery(encodedQuery);
		totalTokenUsedGar.setGroup(false);
		totalTokenUsedGar.addAggregate("SUM", "token_amount");
		totalTokenUsedGar.query();
		totalTokenUsedGar.next();

		var productFilterQuery = this._getProductFilterEncodedQuery(filterInputs.filter(obj => obj.filterId === this.productFilterId));
		encodedQuery += productFilterQuery;

		var tokenUsageCompositionGR = new GlideAggregate("sn_wdf_token_usage_composition");
		tokenUsageCompositionGR.addEncodedQuery(encodedQuery);
		tokenUsageCompositionGR.groupBy("usage_configuration");
		tokenUsageCompositionGR.addAggregate("SUM", "token_amount");
		tokenUsageCompositionGR.addAggregate("MAX", "datestamp");
		tokenUsageCompositionGR.orderByAggregate("SUM", "token_amount");
		tokenUsageCompositionGR.query();

		var tempRows = [];
		var totalTokensUsed = Number(totalTokenUsedGar.getAggregate("SUM", "token_amount"));
		var includeProductFamily = input?.include_product_family === true;

		while(tokenUsageCompositionGR.next()) {
			var row = {};
			var tokenUsageConfigurationGR = new GlideRecord("sn_wdf_token_usage_configuration");
			tokenUsageConfigurationGR.get(tokenUsageCompositionGR.getValue("usage_configuration"));

			row.type = "default";
			row.key = tokenUsageConfigurationGR.getUniqueValue();

			if (includeProductFamily)
				row.product_family = tokenUsageConfigurationGR.getValue("product_family");

			row.cells = {};
			var tokensUsed = parseFloat(tokenUsageCompositionGR.getAggregate("SUM", "token_amount"));

			// Get Capability Name
			row.cells.product_name = {
				"value": tokenUsageConfigurationGR.getValue("capability_label")
			};
			//Native Usage
			row.cells.native_usage = {
				"value": this._getNativeUsage(tokenUsageConfigurationGR.getValue("capability_id"), encodedQuery)
			};

			// Get Token Used
			row.cells.token_used = {
				"value": tokensUsed
			};

			// Get exchange value
			row.cells.exchange_value = {
				"value": tokenUsageConfigurationGR.getValue("exchange_value")
			};

			// Calculate Share of Usage
			row.cells.share_of_usage = {
				"value": "" // Placeholder
			};

			// Calculate Last Used
			row.cells.last_used = {
				"value": tokenUsageCompositionGR.getAggregate("MAX", "datestamp").split(" ")[0]
			};
var capabilityLabel = tokenUsageConfigurationGR.getValue("capability_label");
        var dashboardUrl = this.productDashboardMap[capabilityLabel] || null;

            row.cells.details = {
				"label": dashboardUrl ? sn_i18n.Message.getMessage('sn_wdf_token', 'View') : "",
				"value": dashboardUrl

			};

			tempRows.push({row: row, tokensUsed: tokensUsed});
		}

		for (var i = 0; i < tempRows.length; i++) {
			var currRowEntry = tempRows[i];
			var rowObj = currRowEntry.row;
			var tokensUsedInRow = rowObj?.cells?.token_used?.value;
			var shareOfUsagePercentage;

			if (totalTokensUsed > 0) {
				shareOfUsagePercentage = ((tokensUsedInRow / totalTokensUsed) * 100).toFixed(2) + "%";
			} else {
				shareOfUsagePercentage = "0%";
			}

			rowObj.cells.share_of_usage.value = shareOfUsagePercentage;
			result.rows.push(rowObj);
		}

		return result;
	},

	_getStartAndEndDates: function(datetime_interval) {
		var startDate = new GlideDate();
		startDate.addDaysUTC(-367);
		var endDate = new GlideDate();

		if (datetime_interval[0]?.start) {
			startDate = datetime_interval[0].start;
		}

		if (datetime_interval[0]?.end) {
			endDate = datetime_interval[0].end;
		}

		return {
			startDate,
			endDate
		};
	},

	_getProductFilterEncodedQuery: function(product_filters) {
		if(product_filters == null || !Array.isArray(product_filters) || product_filters[0]?.values == null){
			return "";
		}

		var productsToFilterBy = product_filters[0]?.values;
		var productFilterEncodedQuery = "";
		
		for(var i = 0; i < productsToFilterBy.length; i++) {
			if(i == 0){
				productFilterEncodedQuery += "^usage_configuration=" + productsToFilterBy[i];
			} else {
				productFilterEncodedQuery += "^ORusage_configuration=" + productsToFilterBy[i];
			}
		}

		return productFilterEncodedQuery;
	},

	_getNativeUsage: function(capability_id, encodedQuery) {
		// Get the usage configuration ID for the capability
		var usageConfigGR = new GlideRecord("sn_wdf_token_usage_configuration");
		usageConfigGR.addQuery("capability_id", capability_id);
		usageConfigGR.query();

		if (!usageConfigGR.next()) {
			this.logger.error("No usage configuration found for capability ID: " + capability_id);
			return "0";
		}

		var usageConfigId = usageConfigGR.getUniqueValue();
		var usageType = usageConfigGR.getValue("type");

		// Get the sum of native_amount for this usage configuration
		var nativeUsageGA = new GlideAggregate("sn_wdf_token_usage_composition");
		nativeUsageGA.setGroup(false);
		nativeUsageGA.addEncodedQuery(encodedQuery);
		nativeUsageGA.addQuery("usage_configuration", usageConfigId);
		nativeUsageGA.addQuery("result", "success");
		nativeUsageGA.addAggregate("SUM", "native_amount");
		nativeUsageGA.query();

		if (nativeUsageGA.next()) {
			// Determine the unit based on the capability type
			var unit = this._getUnitByType(usageType, capability_id);
			var nativeAmount = parseFloat(nativeUsageGA.getAggregate("SUM", "native_amount"));
			if (isNaN(nativeAmount) || nativeAmount <= 0) {
				return "0 " + unit;
			}

			// Format the number with appropriate scaling (K, M, etc.) and include unit
			return  this._formatNumberWithScale(nativeAmount) + " " + unit;
		}

		return "0";
	},

	_getUnitByType: function(type, capability_id) {
		// Determine the appropriate unit based on the type and capability
		switch(capability_id) {
			case 'API_ACCESS_VOLUME':
				return "bytes";
			case 'RPA_ATTENDED_BOTS':
			case 'RPA_UNATTENDED_BOTS':
				return "seconds";
			default:
				// Default units based on type
				switch(type.toLowerCase()) {
					case 'transaction':
						return "Tx";
					case 'transactions':
						return "Tx";
					case 'mb':
						return "MB";
					case 'data_throughput':
						return "MB";
					case 'usage':
						return "seconds";
					case 'user':
						return "users";
					default:
						return type;
				}
		}
	},

	_formatNumberWithScale: function(number) {
		var formattedNumber = "";
		// Return 0 with unit if number is negative
		if (number < 0) {
			return "0";
		}
		// Format the number with appropriate scaling
		if (number >= 1_000_000_000_000) {
			formattedNumber = (Math.floor((number / 1_000_000_000_000) * 10) / 10).toFixed(1) + "T";
		} else if (number >= 1_000_000_000) {
			formattedNumber = (Math.floor((number / 1_000_000_000) * 10) / 10).toFixed(1) + "B";
		} else if (number >= 1_000_000) {
			formattedNumber = (Math.floor((number / 1_000_000) * 10) / 10).toFixed(1) + "M";
		} else if (number >= 1_000) {
			formattedNumber = (Math.floor((number / 1_000) * 10) / 10).toFixed(1) + "K";
		} else {
			formattedNumber = number.toFixed(1);
		}
		return formattedNumber;
	},

    type: 'WdfTokenMetrics'
};

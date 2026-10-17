var MultisourceDashboardChartFilterUtil = Class.create();
MultisourceDashboardChartFilterUtil.prototype = {
	NUMBER_OF_DISCOVERY_SOURCES: "number_of_discovery_sources",
	RAW_RECORDS: "raw_records",
	RECONCILED_CIS: "reconciled_cis",
	SOURCE_OVERVIEW: "source_overview",
	ALL_FILTER: "97210c0743c331105552c29835b8f2e6",
	CIS_ONLY_FILTER: "c631cc0743c331105552c29835b8f212",
	PRINCIPAL_CLASS_FILTER: "ec41cc0743c331105552c29835b8f217",

    initialize: function(ciFilterType) {
		this.CI_FILTER_TYPE = ciFilterType;
    },

	isCiFilterTypeValid: function() {
		var isValid = true;
		if (gs.nil(this.CI_FILTER_TYPE)) {
			isValid = false;
		} else {
			switch(String(this.CI_FILTER_TYPE)) {
				case this.ALL_FILTER:
				case this.CIS_ONLY_FILTER:
				case this.PRINCIPAL_CLASS_FILTER:
					break;
				default:
					isValid = false;
					break;
			}
		}
		return isValid;
	},

	/*
		Will return all the table payload information
		for all the discovery sources charts in one JSON.
	*/
	getChartInformation: function() {
		var result = {
			"number_of_discovery_sources": this.getNumberOfDiscoverySources(),
			"raw_records": this.getTotalNumberOfCmdb360Records(),
			"reconciled_cis": this.getReconciledCIs(),
			"source_overview": this.getSourceOverview()
		};

		return result;
	},

	getNumberOfDiscoverySources: function()
	{
		var result = {
			"data": this._getFilteredChartData(this.NUMBER_OF_DISCOVERY_SOURCES),
			"metric": [{
				"dataSource": "sn_cmdb_ws_ms_ci_dashboard_data_source_" + this.NUMBER_OF_DISCOVERY_SOURCES,
				"id": "sn_cmdb_ws_ms_ci_dashboard_data_" + new Date().valueOf(),
				"aggregateFunction": "SUM",
				"aggregateField": "value",
				"numberFormat": {
					"abbreviationEnabled": true,
					"customFormat": true,
					"decimalPrecision": 0,
					"numberInTooltipsEnabled": true,
					"rounding": "HALF_UP",
					"thousandSeparatorEnabled": true
				},
				"axisId": "primary"
			}]
		};

		return result;
	},

	getTotalNumberOfCmdb360Records: function()
	{
		var result = {
			"data": this._getFilteredChartData(this.RAW_RECORDS),
			"metric": [{
				"dataSource": "sn_cmdb_ws_ms_ci_dashboard_data_source_" + this.RAW_RECORDS,
				"frequency": 10,
				"id": "sn_cmdb_ws_ms_ci_dashboard_data_" + new Date().valueOf(),
				"numberFormat": {
					"abbreviationEnabled": true,
					"customFormat": true,
					"decimalPrecision": 0,
					"numberInTooltipsEnabled": true,
					"rounding": "HALF_UP",
					"thousandSeparatorEnabled": true
				},
				"axisId": "primary"
			}
		]};

		result.data[0].sourceType = "indicator";

		var indicatorSysId = "29fef4b97705111023651605bc5a998b"; // All indicator by default

		switch(String(this.CI_FILTER_TYPE)) {
				case this.CIS_ONLY_FILTER:
					indicatorSysId = "0329df9da3505210ad81b6ae041e6188"; // CMDB CI indicator
					break;
				case this.PRINCIPAL_CLASS_FILTER:
					indicatorSysId = "2e3adb91a3905210ad81b6ae041e6114"; // Principal class indicator
					break;
				case this.ALL_FILTER:
				default:
					isValid = false;
					break;
			}

		result.data[0].uuid =  {
			"breakdowns": [
				
			],
			"indicator": indicatorSysId
		};
		result.data[0].indicatorType = "1";
		result.data[0].dataCategories = [
			"trend",
			"group",
			"simple"
		];
		result.data[0].allowTotalValue = true;
		result.data[0].allowRealTime = true;

		return result;
	},

	getReconciledCIs: function() {
		var result = {
			"data": this._getFilteredChartData(this.RECONCILED_CIS),
			"metric": [{
				"dataSource": "sn_cmdb_ws_ms_ci_dashboard_data_source_" + this.RECONCILED_CIS,
				"frequency": 10,
				"id": "sn_cmdb_ws_ms_ci_dashboard_data_" + new Date().valueOf(),
				"numberFormat": {
					"abbreviationEnabled": true,
					"customFormat": true,
					"decimalPrecision": 0,
					"numberInTooltipsEnabled": true,
					"rounding": "HALF_UP",
					"thousandSeparatorEnabled": true
				},
				"axisId": "primary"
			}
		]};

		result.data[0].sourceType = "indicator";

		var indicatorSysId = "da5ff4b97705111023651605bc5a99e8"; // All indicator by default

		switch(String(this.CI_FILTER_TYPE)) {
				case this.CIS_ONLY_FILTER:
					indicatorSysId = "6ace575da3905210ad81b6ae041e6145"; // CMDB CI indicator
					break;
				case this.PRINCIPAL_CLASS_FILTER:
					indicatorSysId = "880f5b5da3905210ad81b6ae041e6197"; // Principal class indicator
					break;
				case this.ALL_FILTER:
				default:
					isValid = false;
					break;
			}

		result.data[0].uuid =  {
			"breakdowns": [
				
			],
			"indicator": indicatorSysId
		};
		result.data[0].indicatorType = "1";
		result.data[0].dataCategories = [
			"trend",
			"group",
			"simple"
		];
		result.data[0].allowTotalValue = true;
		result.data[0].allowRealTime = true;

		return result;
	},

	getSourceOverview: function() {
		var result = {
			"data": this._getFilteredChartData(this.SOURCE_OVERVIEW),
			"metric": [{
				"dataSource": "sn_cmdb_ws_ms_ci_dashboard_data_source_" + this.SOURCE_OVERVIEW,
				"id": "sn_cmdb_ws_ms_ci_dashboard_data_" + new Date().valueOf(),
				"aggregateFunction": "SUM",
				"aggregateField": "value",
				"numberFormat": {
					"abbreviationEnabled": true,
					"customFormat": true,
					"decimalPrecision": 0,
					"numberInTooltipsEnabled": true,
					"rounding": "HALF_UP",
					"thousandSeparatorEnabled": true
				},
				"axisId": "primary"
			}],
			"groupBy": [{
				"groupBy": [{
					"dataSource": "sn_cmdb_ws_ms_ci_dashboard_data_source_" + this.SOURCE_OVERVIEW,
					"groupByField": "key"
				}]
			}]
		};

		return result;
	},

	_getFilteredChartData: function(chartType)
	{
		var result = [{
            "sourceType": "table",
            "tableOrViewName": "sn_cmdb_ws_ms_ci_dashboard_data",
            "filterQuery": "state=2^chart=" + chartType + "^filter=" + this.CI_FILTER_TYPE,
            "id": "sn_cmdb_ws_ms_ci_dashboard_data_source_" + chartType
        }];

		return result;
	},

    type: 'MultisourceDashboardChartFilterUtil'
};

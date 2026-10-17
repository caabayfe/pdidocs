/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({ api, event, helpers, imports }) {
	//processMetrics script in perf metrics page; fired after getPerfMetrics broker returns

	const FIELDS = {
		TOTAL_ROUNDTRIP_TIME: 'total_roundtrip_time',
		CMDB_FRONTEND_TIME: 'cmdb_frontend_time',
		NODEMAP_COMPONENT_RENDERING_TIME: 'nodemap_component_rendering_time',
		TOTAL_BACKEND_TIME: 'total_backend_time',
		UXF_GETMAP_INBOUND_RETURN_TIME: 'uxf_getmap_inbound_return_time',
		UXF_GETMAP_OUTBOUND_CALL_TIME: 'uxf_getmap_outbound_call_time',
		SM_GETMAP_API_TIME: 'sm_getmap_api_time',
		CMDB_GETMAP_API_TIME: 'cmdb_getmap_api_time'
	};


	var processMetrics = {

		execute: function () {
			var data = api.data.get_um_perf_metrics.output.result;
			api.setState('result', data);

			this.setAggregateChartData(data);
			this.setIndividualChartData(data);
			this.checkForNoMatches(data, api, helpers);

			api.setState('initialPageLoad', false);
		},

		setAggregateChartData: function (data) {
			var aggregateChartJson = this._assembleChartData(data);
			aggregateChartJson[0].aggregateNumNodes = this._calculateMetric(this._pluck('number_of_nodes', data));
			aggregateChartJson[0].aggregateNumEdges = this._calculateMetric(this._pluck('number_of_edges', data));
			api.setState('aggregateChartJson', aggregateChartJson);
		},

		setIndividualChartData: function (data) {
			//get mean or median for each field per CI
			var dataByCI = this._groupBy(data, "ci_sysid");
			var listOfIndividualChartJsons = Object.keys(dataByCI).map((ci_sysid) => {
				var individualCiChartJson = this._assembleChartData(dataByCI[ci_sysid]);

				//extra props not used by PAR chart and for our own single scores
				individualCiChartJson[0].ci_name = dataByCI[ci_sysid][0].ci_name;
				individualCiChartJson[0].ci_sysid = ci_sysid;
				individualCiChartJson[0].numNodes = this._calculateMetric(this._pluck('number_of_nodes', dataByCI[ci_sysid]));
				individualCiChartJson[0].numEdges = this._calculateMetric(this._pluck('number_of_edges', dataByCI[ci_sysid]));
				individualCiChartJson[0].numRecordsComprisingChart = dataByCI[ci_sysid].length;

				return individualCiChartJson;
			});

			api.setState('listOfIndividualChartJsons', listOfIndividualChartJsons);
		},

		checkForNoMatches: function (data, api, helpers) {
			if (data.length === 0 && api.state.initialPageLoad === true) {
				helpers.modal.open('zero_results');
				api.setState('hideFilter', false);
			} else if (data.length === 0) {
				api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
					"items": [{
						"id": '1234',
						"status": "info",
						"icon": "info-circle-outline",
						"content": 'No matches',
						"action": {
							"type": "dismiss"
						}
					}]
				});
			}
		},

		_assembleChartData: function (data) {
			var chartJson = this._getGenericChartJsonTemplate();

			//calculate mean per field OR find the median of the overall time and just use all the values from that record
			var aggregates;
			debugger;
			if (api.state.metricToCalculate === 'average') {
				chartJson[0].data = Object.values(FIELDS)
					.filter(o => o !== FIELDS.TOTAL_ROUNDTRIP_TIME && o !== FIELDS.SM_GETMAP_API_TIME && o !== FIELDS.CMDB_GETMAP_API_TIME)
					.map((field) => {
						var arrOfMs = this._pluck(field, data);
						var val = this._calculateMetric(arrOfMs);

						return {
							value: val, //per CI
							name: field,
							id: field
						};
					});

				// add in two other metrics not part of chart, but that need to be in the array for the repeater to access
				chartJson[0][FIELDS.SM_GETMAP_API_TIME] = this._calculateMetric(this._pluck(FIELDS.SM_GETMAP_API_TIME, data));
				chartJson[0][FIELDS.CMDB_GETMAP_API_TIME] = this._calculateMetric(this._pluck(FIELDS.CMDB_GETMAP_API_TIME, data));

			} else { //median, min, or max so find total roundtrip by one of those metrics and just use the record's values for rest
				var arrOfMs = this._pluck(FIELDS.TOTAL_ROUNDTRIP_TIME, data);
				var val = this._calculateMetric(arrOfMs);
				var medianObj = data.find((o) => parseInt(o[FIELDS.TOTAL_ROUNDTRIP_TIME]) === val);

				chartJson[0].data = Object.values(FIELDS)
					.filter(o => o !== FIELDS.TOTAL_ROUNDTRIP_TIME && o !== FIELDS.SM_GETMAP_API_TIME && o !== FIELDS.CMDB_GETMAP_API_TIME)
					.map((field) => {
						return {
							value: medianObj[field],
							name: field,
							id: field
						};
					});


				// add in two other metrics not part of chart, but that need to be in the array for the repeater to access
				chartJson[0][FIELDS.SM_GETMAP_API_TIME] = medianObj[FIELDS.SM_GETMAP_API_TIME];
				chartJson[0][FIELDS.CMDB_GETMAP_API_TIME] = medianObj[FIELDS.CMDB_GETMAP_API_TIME];
			}

			return chartJson;
		},

		_calculateMetric: function (arrOfNums) {
			var val;
			switch (api.state.metricToCalculate) {
				case 'median':
					val = this._calculateMedian(arrOfNums);
					break;
				case 'average':
					val = this._calculateAvg(arrOfNums);
					break;
				case 'min':
					val = this._calculateMin(arrOfNums);
					break;
				case 'max':
					val = this._calculateMax(arrOfNums);
					break;
				default:
					val = this._calculateMedian(arrOfNums);
			}

			return val;
		},

		_pluck: function (prop, arr) {
			return arr.reduce((acc, item) => {
				acc.push(item[prop]);
				return acc;
			}, []);
		},

		_calculateMin: function (arr) {
			return Math.min(...arr.map(o => parseInt(o)));
		},

		_calculateMax: function (arr) {
			return Math.max(...arr.map(o => parseInt(o)));
		},

		_calculateAvg: function (arr) {
			return Math.round(arr.reduce((acc, item) => acc + parseInt(item), 0) / arr.length);
		},

		_calculateMedian: function (arr) {
			arr = arr.map(item => parseInt(item));
			const mid = Math.floor(arr.length / 2);
			const sortedArr = arr.sort((a, b) => a - b);

			return sortedArr[mid];
		},

		_groupBy: function (data, key) {
			return data.sort((a, b) => (a.ci_name > b.ci_name) ? 1 : ((b.ci_name > a.ci_name) ? -1 : 0))
				.reduce((acc, o) => {
					(acc[o[key]] = acc[o[key]] || []).push(o);
					return acc;
				}, {});
		},

		_getGenericChartJsonTemplate: function () {
			return [
				{
					"data": [],
					"metadata": {
						"eventData": {
							"table": "" //okay to leave empty?
						},
						//"dataSourceLabel": "ms",
						"groupBy": [
							{
								"series": [ //what's the array for?
									{
										"id": "value",
										"label": "name",
										"type": "value"
									}
								],
								"elements": [], //what's this for?
								"label": "name",
								"id": "name", //why can't I use sysid here? shows the sysids if I change this; ignores the label defined here
								"fieldType": "reference"
							}
						],
						"format": {
							"unitFormat": "{0}"
						},
						"aggregateBy": 4, //what is this for???
						"metricId": "ZEdGaWJHVnBibU5wWkdWdWRERTJORFl5TXpRNE5UTXpNams9MTY0NjIzNDg1NTEwNg=="
					}
				}
			];
		}
	};

	processMetrics.execute();
}

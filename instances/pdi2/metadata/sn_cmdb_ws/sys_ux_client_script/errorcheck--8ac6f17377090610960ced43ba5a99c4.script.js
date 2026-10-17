function script({ api, event, helpers, imports }) {
	//errorCheck script in GetMapData controller; fired first upon receiving getMap response
	//TODO: Remove below comment after enabling mapDataFetchFailed flow.(STRY57881588 will address this)
	//let output = JSON.parse(event.payload.errors[0].match(/{.*}/));
	let output = api.data.getMapDataBroker.output;
	var { rawData, errors } = output;
	var postFetch = {

		init: function () {
			this.errorCheck();
		},

		errorCheck: function () {
			api.setState('errors', {});
			if (errors.length) {
				var codes = errors.reduce((acc, item) => {
					acc.push(item['code']);
					return acc;
				}, []);
				if (codes.includes('CMDBUM-400-001') || codes.includes('CMDBUM-400-003')) { //levels or sysid is missing
					return; //skip processing result and ignore these now that broker mode is EAGER since it'll take off prematurely without all inputs defined
				}
				api.setState('errors', errors);
				//TODO: Remove below comment after enabling mapDataFetchFailed flow. (STRY57881588 will address this)
				//api.emit('SN_UNIFIED_MAP_CTRL#MAP_DATA_FETCH_FAILED', {"result": output});

				//Fire mapFetchDataCompleted event since we don't need to process response object in case of failure

				api.emit('SN_UNIFIED_MAP_CTRL#MAP_DATA_FETCH_COMPLETED', { ciSysid: output.sysid, errors: errors });
			}
			else {
				this._capturePerfMetrics(); // only want to capture perf metrics for successful queries
				api.emit('SN_UNIFIED_MAP_CTRL#PROCESS_RESPONSE');
			}
		},

		_capturePerfMetrics: function () {
			if (api.context.props.perfLogging) {
				//capture timestamp for
				// 1) end of uxf getMap inbound return time and
				// 2) start of cmdb frontend time
				var timestamp = Date.now();
				const { cloneDeep, mergeDeep } = imports["sn_cmdb_ws.unifiedMapUtils"]();
				const { PERF_METRICS, capturePerfMetrics } = imports['sn_cmdb_ws.unifiedMapUtilsMapSearchFilter']();

				//getMap broker just returned; grab the perfMetrics recorded on the backend off the result output
				var perfMetrics = mergeDeep(cloneDeep(api.state.perfMetrics), rawData.perfMetrics);

				var captures = [
					{
						metricToCapture: PERF_METRICS.UXF_GETMAP_INBOUND_RETURN_TIME,
						isStartTime: false
					}, {
						metricToCapture: PERF_METRICS.CMDB_FRONTEND_TIME,
						isStartTime: true
					}
				];
				capturePerfMetrics({
					perfMetrics: perfMetrics,
					captures: captures,
					timestamp: timestamp,
					persist: false,
					api: api,
					helpers: helpers
				});
			}
		}
	};

	postFetch.init();
}

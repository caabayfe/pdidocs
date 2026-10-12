function script({ api, event, helpers, imports }) {
	//getRelatedItemsCompleted script in Get Related Items data controller; event fired after get_related_item_data broker returns with related items details data

	api.setState('relatedItemRecordsLoading', false);
	const { errors, data } = event.payload.data.output;
	const relatedItemCategorySysId = api.context.props.relatedItemCategorySysId;
    const allNodesSysId = api.context.props.allNodes;
	if (errors && errors.length) {
		// TODO: define an alert with this data
		console.error('Errors encountered fetching data from get_related_item_records data broker: ' + errors.join('. '));
		api.setState('relatedItemRecords', []);
		api.setState('relatedItemRecordsAll', []);
		return;
	} else if (!data) {
		// data should be an empty array and not undefined
		// TODO: Define an alert with this data
		console.error('An unknown error occurred when fetching get_related_item_records');
		api.setState('relatedItemRecords', []);
		api.setState('relatedItemRecordsAll', []);
		return;
	}
	let { cache } = api.state;
	const { getHash } = imports["sn_cmdb_ws.unifiedMapUtils"]();
	const keysContainObjects = data && Object.values(data).some(value => typeof value === 'object' && !Array.isArray(value));
    if(keysContainObjects){
		api.setState('allRelatedItemRecordsLoading', false);
		let hashedSysIds = getHash(allNodesSysId) + "ALLREL";
		api.emit("SN_UNIFIED_MAP_CTRL#ALL_RELATED_ITEMS_DATA_LOADED", {
			relatedItemsData: event.payload		
		});
		
		cache[hashedSysIds] = event.payload;

		Object.keys(data).forEach((sysId) => {
		    let hash = getHash([sysId]);
			if( data[sysId] && Object.keys(data[sysId]).length === 0) {
				cache[hash] = {};
			} else {
				Object.keys(data[sysId]).forEach((categoryId) => { 
					if (!cache[hash])
						cache[hash] = {};
					cache[hash][categoryId] = data[sysId][categoryId];
				});
			}
		});
		
		api.setState("cache", cache);
		return;
	}

	
	// set the cache only on successful fetch

	const sysids = api.context.props.relatedItemSysids;
	const sysidOrHash = getHash(sysids);
	let dataToDispatch;

	if (!cache[sysidOrHash])
		cache[sysidOrHash] = {};
	if (!relatedItemCategorySysId) {
		Object.keys(data).forEach((category) => {
			cache[sysidOrHash][category] = data[category];
		});
		dataToDispatch = {
			allData: Object.values(cache[sysidOrHash]).flat()
		}
		api.setState('relatedItemRecordsAll', Object.values(cache[sysidOrHash]).flat());
	} else {
		dataToDispatch = {
			allData: data[relatedItemCategorySysId]
		}
		cache[sysidOrHash][relatedItemCategorySysId] = dataToDispatch["allData"];
		api.setState('relatedItemRecords', dataToDispatch["allData"]);
	}
	api.setState("cache", cache);
	api.emit("SN_UNIFIED_MAP_CTRL#RELATED_ITEMS_DATA_READY", {
		relatedItemsData: dataToDispatch
	});
}

function transform(input) {
    var result = input.geniusResults;
    if (!result)
        return {
		is_last_page: true,
		all_actions: [],
		items: [],
	};

    var geniusResults = input.geniusResultsResponseFromSearchResponse;
    if (!geniusResults)
        return result;

    var geniusResultConfigByResultSysId = {};
    var orderByResultSysId = {};

    geniusResults
        .forEach(function(geniusResult) {
            var geniusResultItemId;
            var geniusResultConfigId;
            var order;
            for (grColumnIdx in geniusResult.data) {
                grColumnObj = geniusResult.data[grColumnIdx];

                if (grColumnObj.fieldName === 'sys_id')
                    geniusResultItemId = grColumnObj.value;
                if (grColumnObj.fieldName === 'ais_genius_config_id')
                    geniusResultConfigId = grColumnObj.value;
                if (grColumnObj.fieldName === 'order')
                    order = grColumnObj.value;

                if (geniusResultItemId && order) {
                    orderByResultSysId[geniusResultItemId] = order;
                }

                if (geniusResultItemId && geniusResultConfigId) {
                    geniusResultConfigByResultSysId[geniusResultItemId] = geniusResultConfigId;
                }


            }
        });

    result
        .items
        .forEach(function(geniusResultCard) {
            var model = geniusResultCard.propValues.model;
            if (!model)
                return;
            var cardSysId = model['columns.sys_id'];
            if (!cardSysId)
                return;

            var geniusResultConfigId = geniusResultConfigByResultSysId[cardSysId];
            if (!geniusResultConfigId)
                return;

            model['ais_genius_config_id'] = geniusResultConfigId;

            var order = orderByResultSysId[cardSysId];
            if (!order)
                return;

            model['order'] = order;

        });

    return result;
}

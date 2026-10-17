(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	const table = request.body?.data?.table;
	const filterQuery = request.body?.data?.filterQuery || '';

	function parseEncodedQuery (encodedQuery) {
		if (gs.nil(encodedQuery))
            return {
                filters: [],
                groupBy: [],
                orderBy: [],
                orderByDesc: [],
                trendBy: [],
                otherModifiers: []
            };

        var groupBy = (encodedQuery.match(/GROUPBY[^^]*/g) || []).map(s => s.replace('GROUPBY', ''));
        var orderByDesc = (encodedQuery.match(/ORDERBYDESC[^^]*/g) || []).map(s => s.replace('ORDERBYDESC', ''));
        var orderBy     = (encodedQuery.match(/ORDERBY(?!DESC)[^^]*/g) || []).map(s => s.replace('ORDERBY', ''));
        var trendBy = (encodedQuery.match(/TRENDBY[^^]*/g) || []).map(s => s.replace('TRENDBY', ''));
        var filters = encodedQuery.replace(/(?:\^|^)(GROUPBY|ORDERBYDESC|ORDERBY(?!DESC)|TRENDBY)[^^]*/g, '')
        .replace(/^\^|\^$/g, '');
        
		return {
            filters,
            groupBy,
            orderBy,
            orderByDesc,
            trendBy
        };
    }

    const result = {
        aiCanvas: false,
        table,
		filterQuery,
    };

	if (!table) {
        return result;
    }

    if (GlidePluginManager.isActive('sn_query_gen') && GlidePluginManager.isActive('sn_pa_ai_canvas')) {		
		const gr = new GlideRecord('sn_query_gen_entity');
        
		if (gr.isValid()) {
			gr.addQuery('name', table);
			gr.setLimit(1);
			gr.query();
			
			let parsedFields = '';
			let fields = [];
			
			if (filterQuery) {
				parsedFields = parseEncodedQuery(filterQuery);
				
				const { filters, groupBy, orderByDesc, orderBy, trendBy } = parsedFields;
				let filtersFields = global.GlideQueryParser.getTerms(table, filters).map(t => t.field);

				fields = [
					...filtersFields,
					...groupBy,
					...orderBy,
					...orderByDesc,
					...trendBy,
				];
			}

			if (!gr.hasNext())
				return result;

            if (!global.ScopedReportUtil.canViewReport(table, fields.join(','), '', '')) {
                result.aiCanvas = true;
            }
        }
    }

    return result;

})(request, response);

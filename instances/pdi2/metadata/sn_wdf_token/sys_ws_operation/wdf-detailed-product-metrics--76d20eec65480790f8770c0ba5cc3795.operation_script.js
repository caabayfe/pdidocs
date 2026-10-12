(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var startDate = request.queryParams.start;
    var endDate = request.queryParams.end;

	var input = {
      filter_inputs: [],
      include_product_family: true 
	};

    if (startDate && endDate) {
        input.filter_inputs = [{
            order: 0,
            filterId: '1isbtneibfh62qooc5i8',
            type: 'date',
            label: 'Date',
            source: {},
            start: startDate.toString(),
            end: endDate.toString(),
            apply_to: ['sn_wdf_token_usage_composition.datestamp']
        }];
    }

    var result = new sn_wdf_token.WdfTokenMetrics().fetchWDFDetailedProductMetrics(input);

    response.setStatus(200);
    response.setBody(result);

})(request, response);

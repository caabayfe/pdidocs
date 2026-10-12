(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    const apiHelper = new APIHelper(request, response);
    apiHelper.execute(function() {
        const data = request.body.data;
        const table = data.table;
        const searchValue = data.value;
        const limit = data.limit;
        const field = data.field;
        const referenceFilter = data.referenceFilter;
        const options = {
            limit: limit,
            field: field,
            referenceFilter: referenceFilter
        };

        const records = new BuilderToolkitAPIBase().searchTableForResults(
            table,
            searchValue,
            options
        );

		apiHelper.getResponse({
            table: table,
            records: records
        });
    });
})(request, response);

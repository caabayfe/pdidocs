(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    response.setContentType('application/json');

    var result = {
        success: true,
        refQualCondition: "",
        error: null
    };

    try {
        var helper = new CSDMAppServiceHelper();
        var target_table = helper.getParamAsString('table');
        var field = helper.getParamAsString('field');

        // Validate required params
        if (!target_table || !field) {
            throw new Error("Missing required parameters: 'table' and/or 'field'.");
        }

        // 1. Get base dictionary qualifier
        var dict = new GlideRecord('sys_dictionary');
        dict.addQuery('name', target_table);
        dict.addQuery('element', field);
        dict.query();

        if (dict.next() && dict.reference_qual) {
            result.refQualCondition = String(dict.reference_qual);
        }

        // 2. Check for dictionary override (ref qualifier)
        var over = new GlideRecord('sys_dictionary_override');
        over.addQuery('name', target_table);
        over.addQuery('element', field);
        over.addQuery('type', 'ref_qual');
        over.query();

        if (over.next() && over.reference_qual) {
            result.refQualCondition = String(over.reference_qual);
        }

        response.setStatus(200);
        response.setBody(result);

    } catch (e) {
        // Base exception handling
        gs.error("Error in getRefListFilterQuery API: " + e.message);

        result.success = false;
        result.error = e.message;

        response.setStatus(500);
        response.setBody(result);
    }

})(request, response);

(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var supportedTableNames = [Constants.TBL_RECOMMENDED_ACTIONS, Constants.TBL_ACTION_INPUT_GENERATOR,
        Constants.TBL_RESOURCE_GENERATOR, Constants.TBL_DECISION_TREE_NODE, Constants.TBL_FIELD_RECOMMENDATION_DEFINITION,Constants.TBL_SEARCH_RESULT_RA_MAPPING,Constants.TBL_RULE_CONTEXT
    ];
    response.setBody(supportedTableNames);

})(request, response);

var {
    RuleChecker
} = require('@devsnc/uibtk-api');

(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {	

  var rc = new RuleChecker();
  var ruleViolations = rc.checkAllRulesAgainstMacroponent(request.pathParams.macroponentId, request.pathParams.isMaint);

    var body = {};
    body.ruleViolations = ruleViolations;
    response.setBody(body);

})(request, response);

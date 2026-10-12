(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    // validate inputs
    // regex (local data pattern) or data_type (model pattern)
    var regex = request.body.data.regex;
    var type = request.body.data.type;
    var testValue = request.body.data.test_value;
    var keyword = request.body.data.keyword ? request.body.data.keyword : "";
    var keywordProximity = request.body.data.keywordProximity ? request.body.data.keywordProximity : "";
    var patternId = request.body.data.pattern_id ? request.body.data.pattern_id : "";
   
    if (!regex || !testValue) {
        response.setError(new sn_ws_err.BadRequestError(gs.getMessage("Both a regular expression and test value are required")));
        return;
    }

    if (type === 'model') {
      var sds = new SNC.SensitiveDataDiscoveryCore();
      // call API
      try {
          var startTimeToMatch = Date.now();
          var requestText = [{
            "text": testValue
          }];
          var textJson = JSON.stringify(requestText);
          var requestInclusionList = [ regex ];
          var inclusionListJson = JSON.stringify(requestInclusionList);
          var scanResult = sds.scan(textJson, null, inclusionListJson);
          var patternMatchTimeTaken = Date.now() - startTimeToMatch;
          var parsedResponse = JSON.parse(scanResult);
          if (parsedResponse.errorMessage && parsedResponse.errorMessage.length > 0) {
            response.setError(new sn_ws_err.BadRequestError(String(parsedResponse.errorMessage)));
            errorBody = {
              totalTime: patternMatchTimeTaken,
              error: gs.getMessage('PII service is not reachable.')
            };
            response.setBody(errorBody);
            return;
          }
          var isMatch = parsedResponse.discoveries.length > 0 && parsedResponse.discoveries[0].length > 0;
          //format response
          response.setContentType('application/json');
          response.setBody({
              isMatch: isMatch,
              totalTime: patternMatchTimeTaken
          });
          response.setStatus(200);
      } catch (error) {
          response.setError(new sn_ws_err.BadRequestError(String(error.message)));
          errorBody = {
              totalTime: patternMatchTimeTaken
          };
          response.setBody(errorBody);
          return;
      }

    } else {
      var validator = new SNC.DataPatternValidatorCore();
      var isValidPattern = validator.isValid(regex);
      if (!isValidPattern) {
          response.setError(new sn_ws_err.BadRequestError(gs.getMessage("The provided regular expression is invalid")));
          return;
      }

      // validate input length
      if (testValue.length > 2048) {
          response.setError(new sn_ws_err.BadRequestError(gs.getMessage("Text length can't be longer than 2048 characters")));
          return;
      }

      // validate keyword and proximity values
      if (keyword.length > 128) {
          response.setError(new sn_ws_err.BadRequestError(gs.getMessage('Keyword(s) length should not exceed 128 characters.')));
          return;
      }

      if (keyword.length > 0 && (keywordProximity.length == 0 || parseInt(keywordProximity) <= 0)) {
          response.setError(new sn_ws_err.BadRequestError(gs.getMessage('Keyword proximity value must be greater than 0 when keyword is configured.')));
          return;
      }

      if (keywordProximity.length > 0) {
          var keywordProximityValue = parseInt(keywordProximity);
          if (keyword.length == 0) {
              response.setError(new sn_ws_err.BadRequestError(gs.getMessage('Configure keyword(s) before setting keyword proximity.')));
              return;
          } else if (keywordProximityValue < 0 || keywordProximityValue > 64) {
              response.setError(new sn_ws_err.BadRequestError(gs.getMessage('Keyword proximity should be in range 0 to 64.')));
              return;
          }
      }

      // call API
      try {
          var startTimeToMatch = Date.now();
          
          // First check regex match only (for regexMatched flag)
          var regexMatched = validator.keywordMatches(regex, testValue, keyword, keywordProximity);
          var isMatch = regexMatched;
          var luhnFailed = false;
          
          // If regex matched and pattern_id provided, re-test with Luhn validation
          if (regexMatched && patternId) {
              // Use method that applies Luhn validation
              isMatch = validator.keywordMatchesWithValidation(regex, testValue, keyword, keywordProximity, patternId);
              luhnFailed = regexMatched && !isMatch;
          }
          
          var patternMatchTimeTaken = Date.now() - startTimeToMatch;
          //format response
          response.setContentType('application/json');
          response.setBody({
              isMatch: isMatch,
              regexMatched: regexMatched,
              luhnFailed: luhnFailed,
              totalTime: patternMatchTimeTaken
          });
          response.setStatus(200);
      } catch (error) {
          response.setError(new sn_ws_err.BadRequestError(String(error.message)));
          errorBody = {
              totalTime: patternMatchTimeTaken
          };
          response.setBody(errorBody);
          return;
      }
    }

})(request, response);

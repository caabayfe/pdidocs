function transform(input) {
    // Fetch updated configurations or responses from user in input variable and pass the input to VSCComplianceUtil to run the remediation script 
    var resultData = input.data || {};
    var util = new VSCComplianceUtil();
    var triggerPaJob = false;
    // Send in the flag to determine whether to trigger the pa job or not.
    if (resultData.hasOwnProperty("triggerPaJob")) {
        triggerPaJob = true;
        // Delete the key form the payload, not required beyond this point
        delete resultData["triggerPaJob"];
    }
    var result = util.activateConfigurations(resultData, triggerPaJob);
    // Return success message if the property value has been changed.
    if (result == "success") {
        return "success";
    } else if (result == '') { //for configurations for type plugin or tabular doesn't need security_admin elevation
        return "success";
    } else {
        return "error";
    }
}

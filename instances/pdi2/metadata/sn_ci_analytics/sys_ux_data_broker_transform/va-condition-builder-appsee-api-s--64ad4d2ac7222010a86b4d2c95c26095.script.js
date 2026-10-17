function transform(input) {
    var appseeApiPayload = input.appseeApiPayload;
    if (!appseeApiPayload) {
        return;
    }
    var returnValue = appseeApiPayload;
    var response = new VAConditionBuilderAPIUtils().getAppseeAPIResponse(appseeApiPayload);
    returnValue.choices = response;
    return returnValue;
}

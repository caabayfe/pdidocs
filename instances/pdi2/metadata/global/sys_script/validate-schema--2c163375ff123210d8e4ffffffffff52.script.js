(function executeRule(current, previous /*null when async*/ ) {
    var api = current.api;
    var api_path = current.api_path;
    var json = current.schema;
    var openapi_version = current.openapi_version ? current.openapi_version : "3.0.1";

    if (json.replace(/\s+/g, '') === '{}') {
        gs.addErrorMessage(gs.getMessage("Empty schema is not allowed."));
        current.setAbortAction(true);
        return;
    }

    try {
        JSON.parse(json);
    } catch (e) {
        gs.addErrorMessage(gs.getMessage("Unable to parse provided Schema with name: {0}. Ensure schema is in valid JSON format", current.name));
        current.setAbortAction(true);
        return;
    }

    var validator = new sn_ws.OpenAPISchemaValidator(openapi_version);
    var result = validator.validateSchema(json, api, api_path);

    if (result.warnings.length > 0) {
        var warningSummary = formatMessages(result.warnings);
        var warningMessage = gs.getMessage('Warnings:<br/> {0}', [warningSummary]);
        gs.addWarningMessage(warningMessage)
    }

    if (!result.isValid || result.errors.length > 0) {
        var openAPIUrl = 'https://swagger.io/docs/specification/v3_0/data-models/keywords/';
        var bannerMessage = gs.getMessage('Schema does not meet OpenAPI v{0} specification. See <a target=_blank href={1}>OpenAPI 3.0 Supported Keywords</a>', [openapi_version, openAPIUrl]);
        if (result.errors.length > 0) {
            var errorSummary = formatMessages(result.errors);
            var errorMessage = gs.getMessage('<br/> <br/> Errors:<br/> {0}', [errorSummary]);
            bannerMessage = bannerMessage + errorMessage;
        }

        gs.addErrorMessage(bannerMessage);
        current.setAbortAction(true);
    }

    function formatMessages(messages) {
        if (!messages || messages.length === 0) {
            return "";
        }

        var formatted = [];
        for (var i = 0; i < messages.length; i++) {
            formatted.push(gs.getMessage('- {0}', [messages[i].replace('$', 'root')]));
        }

        return formatted.join('<br/>');
    }
})(current, previous);

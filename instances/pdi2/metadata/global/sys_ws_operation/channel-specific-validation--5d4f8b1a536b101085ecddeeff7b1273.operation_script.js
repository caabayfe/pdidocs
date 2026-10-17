(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var payload = request.body.data;
    if (JSUtil.isEmpty(payload)) {
        response.setStatus(500);
        return;
    }
    var userTable = payload.user_table;
    var userDocument = payload.user_document;
    var sendToValue = payload.send_to_value;
    var channelId = payload.channel_id;

    var extensionPoints = new GlideScriptedExtensionPoint().getExtensions('global.ChannelSendToValidation');
    var validationResult = null;
    var foundExtensionPointImpl = false;
    for (var i = 0; i < extensionPoints.length; i++) {
        if (extensionPoints[i].isValid(channelId)) {
            var point = extensionPoints[i];
            validationResult = point.channelSendToValidation(userTable, userDocument, sendToValue);
            foundExtensionPointImpl = true;
            break;
        }
    }

    // if no extension point impl found return true;
    if (!foundExtensionPointImpl) {
        return {
            isValid: true,
            formattedValue: sendToValue
        };
    }

    response.setBody(validationResult);
    response.setStatus(200);

})(request, response);

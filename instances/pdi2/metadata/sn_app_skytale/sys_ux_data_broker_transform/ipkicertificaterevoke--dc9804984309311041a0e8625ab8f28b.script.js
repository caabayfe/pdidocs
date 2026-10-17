function transform(input) {

    var failedIds = [];
    for (var i = 0; i < input.certIds.length; i++) {
        var certId = input.certIds[i];
        var revocationResult = new IPKIHermesRevokeCertificate().revokeCertificate(certId, input.revocationReason);
        var parsedResult = JSON.parse(revocationResult);
        if (parsedResult.success === false) {
            failedIds.push(certId);
        }
    }

    var result = {};
    if (failedIds.length > 0) {
        var errorMessage = "Failed to revoke certificates with sys id: " + failedIds.join(", ");
        result.success = false;
        result.message = errorMessage;
        return result;
    }

    result.success = true;
    return result;
}

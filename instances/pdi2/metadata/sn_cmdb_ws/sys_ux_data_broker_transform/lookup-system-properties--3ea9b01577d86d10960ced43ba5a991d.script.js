function transform(input) {
    var properties = input.properties.trim().split(',');

    var result = {
        properties: {},
        errors: []
    };
    var workspaceId = input.workspaceId;
    var configIdentifierId = input.configIdentifierId;
    try {
        if (!properties || !properties.length) {
            result.errors.push('the properties param is missing');
        }

        if(!workspaceId) {
            result.errors.push('Workspace App Id is required');
        }

        if(!result.errors.length) {
            var umHelper = new UnifiedMapHelper();
            var output = umHelper.getConfigPropertyValues({
                workspaceId: workspaceId,
                configIdentifierId: configIdentifierId,
                properties: properties
            });
            result.properties = output.result;
        }
    } catch (error) {
        result.errors.push(error.toString());
    }

    return result;
}

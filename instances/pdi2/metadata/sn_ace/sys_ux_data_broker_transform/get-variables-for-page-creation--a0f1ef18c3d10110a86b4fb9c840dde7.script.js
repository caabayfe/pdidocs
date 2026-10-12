function transform(input) {
    var output = {
        fields: [],
        optional_parameters: [],
        appConfigId: ''
    };

    if (input.routeData.length) {
        var fields = input.routeData[0].fields.value;
        var optionalParams = input.routeData[0].optional_parameters.value;
        if (fields) {
            fields.split(',').forEach(function(field) {
                output.fields.push({
                    name: field
                });
            });
        }
        if (optionalParams) {
            optionalParams.split(',').forEach(function(optionalParam) {
                output.optional_parameters.push({
                    name: optionalParam
                });
            });
        }
    }

    if (input.appConfigData.length) {
        output.appConfigId = input.appConfigData[0].app_config.value;
    }

    return output;
}

function transform(input) {
    var output = {};
    if (!input || !input.properties_name) return [];
    var propNames = input.properties_name;
    if (typeof propNames == 'string')
        propNames = propNames.split(",");

    propNames.forEach(function(propName) {
        output[propName] = {
            value: gs.getProperty(propName)
        };
    });

    return output;
}

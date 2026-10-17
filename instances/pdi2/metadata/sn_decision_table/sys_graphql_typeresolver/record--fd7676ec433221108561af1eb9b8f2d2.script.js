(function process( /*TypeResolutionEnvironment*/ env) {
    var resolvedTo = "DecisionTableDetails";
    var responseObject = env.getObject();
    if (responseObject.errorStatus === 'Failure' && !gs.nil(responseObject.errorMessage)) {
        resolvedTo = "Error";
    }

    return resolvedTo;
})(env);

(function process( /*TypeResolutionEnvironment*/ env) {
    var resolvedTo = "DecisionInputDetails";
    var responseObject = env.getObject();
    if (responseObject.status === 'FAIL' && !gs.nil(responseObject.errorMessage)) {
        resolvedTo = "Error";
    }

    return resolvedTo;
})(env);

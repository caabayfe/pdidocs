(function process( /*ResolverEnvironment*/ env) {

    // implement data resolver here

    var trainingData = [];

    var queryArgs = env.getArguments().trainingDataExtractionInput;
    var serviceContract = queryArgs.parameters;
    var paginationData = queryArgs.pagination_data;

    var delegate = new global.DataExtraction();

    return delegate.getTrainingData(serviceContract, paginationData);

})(env);

(function process(/*TypeResolutionEnvironment*/ env) {


    return 'errorType' in env.getObject() ? 'Error' : 'Text2CatalogInfo';

})(env);

(function process(/*TypeResolutionEnvironment*/ env) {

    // implement type resolving here
	var obj = env.getObject();
    return obj.hasOwnProperty('apiErrorTitle') ? 'Error' : 'Flow';

})(env);

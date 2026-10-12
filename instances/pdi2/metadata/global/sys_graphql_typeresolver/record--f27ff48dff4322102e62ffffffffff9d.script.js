(function process(/*TypeResolutionEnvironment*/ env) {

    var obj = env.getObject();
    if (obj.hasOwnProperty('insertContent')) 
	return 'InsertContentItems';

	if (obj.hasOwnProperty('replaceContent')) 
	return 'ReplaceContentItems';

	if (obj.hasOwnProperty('customEvent')) 
	return 'CustomEventItems';

})(env);

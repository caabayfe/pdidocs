
(function(context, pageParams, blockcontext){
	var hasNLUAdminRole = gs.getUser().hasRole("nlu_admin");
	return {
		hasNLUAdminRole: hasNLUAdminRole
	};
})(context, pageParams, blockcontext);

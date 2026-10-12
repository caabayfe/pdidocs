//is a specific scoped app at or above a minimum version?
(function(input) {
	// alias_id == sys_id of sys_alias record.
	if (!input.hasOwnProperty("alias_id"))
		return false;

   return new sn_templates.SpokeValidator().isConfigured(input.alias_id);
	
})(input);

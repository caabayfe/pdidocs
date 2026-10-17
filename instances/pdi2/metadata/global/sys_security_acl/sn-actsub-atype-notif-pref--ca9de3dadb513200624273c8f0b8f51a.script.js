answer = execute();
function execute(){
	var hasRole = gs.hasRole('actsub_user') || gs.hasRole('actsub_admin') ;
	if(hasRole == false && pm.isActive('com.sn_communities')){
		return gs.hasRole('snc_internal') || gs.hasRole('snc_external') && !current.is_global;
	}
	return true;
}

answer = execute();
function execute(){
	var hasRole = gs.hasRole('actsub_user') || gs.hasRole('actsub_admin') ;
	if(!hasRole && pm.isActive('com.sn_communities')){
		return current.subscription.subscriber_id.document == gs.getUserID();
	}
	return true;
}

answer = execute();
function execute(){
	var hasRole = gs.hasRole('actsub_user') || gs.hasRole('actsub_admin') ;
	if(!hasRole && pm.isActive('com.sn_communities')){
		return (gs.hasRole('snc_internal') || gs.hasRole('snc_external') )
					&& gs.getUserID() == current.subscription.subscriber_id.document;
	}
	return true;
}

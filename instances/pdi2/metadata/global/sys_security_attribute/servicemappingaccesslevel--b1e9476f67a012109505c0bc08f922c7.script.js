/** 
 * Using 'current' in the script or included script-includes is not allowed. 
*/
answer = gs.hasRole('service_mapping_admin') ? 'admin' :
	gs.hasRole('sm_app_owner') ? 'app_owner' :
	gs.hasRole('service_mapping_user') ? 'user' : 
	'none';

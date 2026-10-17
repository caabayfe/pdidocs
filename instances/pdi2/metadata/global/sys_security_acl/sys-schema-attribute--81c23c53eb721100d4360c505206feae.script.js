var attributeName = current.name;
if (attributeName == 'use_instance_level_glideencrypter' || attributeName == 'use_legacy_glideencrypter') {
    //not using the current.read_roles because it truncates the string if the char length is greater than a certain value
	if(gs.hasRole('security_admin') && hasKMFMgrRole())
		answer = true;
	else
		answer = false;
} else
      answer = gs.hasRole(current.read_roles);

function hasKMFMgrRole(){
	return gs.hasRole('sn_kmf.cryptographic_manager');
}

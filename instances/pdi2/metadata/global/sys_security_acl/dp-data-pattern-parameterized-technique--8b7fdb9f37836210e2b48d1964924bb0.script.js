var acceptedRoles = ['data_discovery_admin', 'data_privacy_admin'];
answer = true;
for (var i=0; i<acceptedRoles.length; i++) {
	if (!gs.hasRole(acceptedRoles[i])) {
		answer = false;
		break;
	}
}

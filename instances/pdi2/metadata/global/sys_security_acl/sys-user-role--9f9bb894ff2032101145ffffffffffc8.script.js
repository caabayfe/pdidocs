var restrictedRoles = ['maint', 'nobody', 'admin', 'security_admin', 'impersonator', 'public', 'snc_internal', 'snc_external', 'itil', 'itil_admin', 'snc_high_assurance'];
var isRestricted = false;
for (i = 0; i < restrictedRoles.length; i++) {
	if (restrictedRoles[i] == current.name) {
		isRestricted = true;
		break;
	}
}
if (isRestricted && !gs.hasRole('maint')) 
    answer = false;
else 
    answer = true;

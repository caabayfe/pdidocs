answer = false;
if (gs.hasRole("maint")) { 
    answer = true;
} else if (! current.read_roles.nil()) {
    answer = gs.hasRole(current.read_roles);
} else {
    if ( gs.hasRole("admin") )
	    answer = true;
}

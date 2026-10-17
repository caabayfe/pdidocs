var allowedRoles = gs.getProperty("com.snc.on_call_rotation.calendar_read_roles");
answer = !gs.nil(allowedRoles) && gs.hasRole(allowedRoles);

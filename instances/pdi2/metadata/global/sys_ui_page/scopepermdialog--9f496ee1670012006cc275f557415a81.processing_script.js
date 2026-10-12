gs.addInfoMessage("Table: " + spd_permission_set);
gs.addInfoMessage("Scope: " + spd_scope);
gs.addInfoMessage("User: " + spd_user);

DelegatedDevRoleManager.forScopeAndPermissionSet(spd_scope, spd_permission_set).allocatePermissionToUser(spd_user);

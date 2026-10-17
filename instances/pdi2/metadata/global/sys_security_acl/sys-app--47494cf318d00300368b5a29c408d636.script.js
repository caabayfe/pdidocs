answer = (GlideSecurityManager.get().isScopeAdmin(current.sys_id) || gs.hasRole("admin")) && (current.getValue("private") != 1);

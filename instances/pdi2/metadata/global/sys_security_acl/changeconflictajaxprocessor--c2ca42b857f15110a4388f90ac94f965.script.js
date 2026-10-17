var conflictRoles = gs.getProperty('change.conflict.role', 'itil, sn_change_write');

answer = gs.hasRole(conflictRoles);

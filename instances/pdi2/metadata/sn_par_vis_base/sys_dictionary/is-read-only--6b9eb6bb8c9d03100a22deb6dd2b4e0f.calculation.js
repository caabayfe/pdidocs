(function calculatedFieldValue(current) {       if (gs.hasRole('maint') || gs.hasRole('admin') || current.roles.length === 0 ) return false;       return !gs.hasRole(current.roles);}     )(current);

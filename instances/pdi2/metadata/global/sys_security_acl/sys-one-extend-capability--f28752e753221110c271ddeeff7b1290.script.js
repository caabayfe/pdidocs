if (gs.hasRole('maint'))
    answer = true;
else
    answer = new global.RestrictCapabilityAccess().isFeatureMappingAccessible(current.sys_id);

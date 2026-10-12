if (gs.hasRole('maint'))
    answer = true;
else
    answer = new global.RestrictCapabilityAccess().isCapabilityDefinitionAccessible(current.definition);

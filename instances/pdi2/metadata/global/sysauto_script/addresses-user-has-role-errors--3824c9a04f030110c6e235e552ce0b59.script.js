fixUserHasRole();

function fixUserHasRole() {
    if (!GlideProperties.getBoolean('glide.role_management.use.inh_count', false) || !pm.isActive('com.glide.role_management.inh_count'))
        return;
    gs.log('Starting fix_sys_user_has_role script...');
    new GlideUserHasRoleInhCountFixer().recalculateInhCounts();
    gs.log('Finished fix_sys_user_has_role fix job!');
}

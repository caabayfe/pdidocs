var hasRolePulseCreator = gs.hasRole('sn_lp.creator');
var hasRoleContentManager = gs.hasRole('sn_cd.content_manager');
answer = hasRolePulseCreator && hasRoleContentManager;

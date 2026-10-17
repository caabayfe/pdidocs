
/* In instances that were upgraded to the Zurich release, this script removes the CMDB roles from ITIL roles (ITIL user role contained the CMDB user roles) and adds Create/Update/Delete access to the Configuration item [cmdb_ci] table for sn_cmdb_admin/sn_cmdb_editor roles.

Running this script on Zurich zbooted instances is not required and has no impact.

The length of time for this script to complete greatly depends on the number of itil/itil_admin users in your instance. As a rough estimate for how long it might take, consider that for 6K number of such users with around 100K records impacted in sys_user_has_role table, it will take approximately 5 mins. */
gs.info('Scheduled job: Remove CMDB Roles from ITIL roles and Add CUD access to sn_cmdb_admin/sn_cmdb_editor roles - Triggered');
const ROLESUTIL = new global.CMDBRolesUtil(); 
ROLESUTIL.removeContainsRole(ROLESUTIL.ROLES.SN_CMDB_EDITOR, ROLESUTIL.ROLES.ITIL); 
ROLESUTIL.removeContainsRole(ROLESUTIL.ROLES.SN_CMDB_ADMIN, ROLESUTIL.ROLES.ITIL_ADMIN); 
gs.info('Scheduled job: Remove CMDB Roles from ITIL roles and Add CUD access to sn_cmdb_admin/sn_cmdb_editor roles - Contain roles removed');
// Add ACLs on cmdb_ci table for roles: sn_cmdb_admin / sn_cmdb_editor
ROLESUTIL.createACLIfNotExists(ROLESUTIL.CMDB_CI.TABLE, ROLESUTIL.OPERATIONS, ROLESUTIL.ROLES.SN_CMDB_EDITOR); 
ROLESUTIL.createACLIfNotExists(ROLESUTIL.CMDB_CI.TABLE, ROLESUTIL.OPERATIONS, ROLESUTIL.ROLES.SN_CMDB_ADMIN);
gs.info('Scheduled job: Remove CMDB Roles from ITIL roles and Add CUD access to sn_cmdb_admin/sn_cmdb_editor roles - ACLs created and Execution completed');

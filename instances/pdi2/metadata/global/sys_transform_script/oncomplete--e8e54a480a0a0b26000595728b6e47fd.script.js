//
// It is possible that the manager for a user did not exist in the database when
// the user was processed and therefore we could not locate and set the manager field.
// The processManagers call below will find all those records for which a manager could
// not be found and attempt to locate the manager again.  This happens at the end of the
// import and therefore all users should have been created and we should be able to
// locate the manager at this point
ldapUtils.processManagers();

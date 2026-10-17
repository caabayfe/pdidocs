//
// The manager coming in from LDAP is the DN value for the manager.  
// The line of code below will locate the manager that matches the
// DN value and set it into the target record.  If you are not 
// interested in getting the manager from LDAP then remove or
// comment out the lines below
ldapUtils.setManagerField('u_managedby');
ldapUtils.setManager(source, target);

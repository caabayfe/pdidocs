//
// After a group has been inserted the line of code below will get
// all the users that belong to the group according to LDAP and
// put the users into this group.  This is done by getting 
// the value from the u_members field from the source record.
// If you do not want to put the users in the group then you 
// can comment out or remove the line below.  If you are using
// something other than Active Directory and user membership is
// not indicated via the 'member' attribute then you can add the
// following line to indicate what field should be used.  This
// line would be added before the the call to addMembers.
//
//  ldapUtils.setMemberField('u_yourAttributeNameGoesHere');
//
ldapUtils.addMembers(source, target);

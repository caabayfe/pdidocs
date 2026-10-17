//Deactivate LDAP-disabled users during transform based on 'userAccountControl' attribute.
//This transform script is inactive by default
//
//NOTE: User records must be visible based on the OU filter in order to be disabled

//Convert the userAccountControl attribute to a hex value
var ctrl = parseInt(source.u_useraccountcontrol, 10);
ctrl = ctrl.toString(16);

//The relevant digit is the final one
//A final hex digit value of '2' in 'ctrl' means disabled
if (ctrl.substr(-1) == "2") {
   target.active = false;
   target.locked_out = true;
   if (action == 'insert')
      ignore = true;
} else {
   //Optional: Reactivate and unlock the user account
   //target.active = true;
   //target.locked_out = ctrl.substr(-2, 1) == "1";
}

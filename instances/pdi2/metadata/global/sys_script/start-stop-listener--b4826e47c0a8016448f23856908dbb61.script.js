/**
 Service-now.com

 Description:  Start/Stop the Listener when the listener field is changed.  The listener field can be updated via the Server configuration form OR via the Start Listener/Stop Listener UI Actions.

 If you are in a clustered environment then we will start the listener on the node as defined in the LDAP Server Configuration.
**/ 

gs.include("LDAPUtils");
var ldapUtils = new LDAPUtils();

if (current.active) {
   if (current.listener) {
      ldapUtils.startListener(current);
      if (!ldapUtils.isListenerNode(current)) {
         // Information message to indicate what cluster should run the listener
         var clusterID = new GlideServlet.getSystemID(); 
         gs.addInfoMessage(gs.getMessage("Based on the Cluster Configuration your LDAP Listener will be started from the following node") + ":  " + clusterID);
         gs.addInfoMessage(gs.getMessage("This configuration information is specified in the the System ID field of the LDAP Server configuration record."));
      }
   } else {
      gs.log("Stopping the listener");
      ldapUtils.stopListener(current);
   }
} else
   ldapUtils.stopListener(current);

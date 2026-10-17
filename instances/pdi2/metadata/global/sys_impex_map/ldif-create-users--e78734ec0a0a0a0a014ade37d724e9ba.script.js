current.source = "LDAP:"+current.source;

cancel = true;
var ous = objectclass.split(",");
for (var i = 0; i < ous.length; i++) {
   if (ous[i] == 'Person') {
      cancel = false;
   } 
}
if (cancel == true)
   gs.log("Entry ignored because objectclass=Person was not found");

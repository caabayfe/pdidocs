// This is a sample script
var it = Packages.java.util.Iterator;
var additionalInfo = Packages.com.glide.collections.StringMap;

// ms.log("SnmpTrapKeyFilter: received: " + oidList + "::" + trap + "::" + event);
oidListToReturn = new Packages.com.glide.collections.StringList(oidList);

additionalInfo = event.getAdditionalParameters();
var snmpTrapOID = additionalInfo.get("snmpTrapOID"); // Get value from event additional info fields.

if (event.source == "Trap From Enterprise 111" && snmpTrapOID == "iso.org.dod.internet.private.enterprises.111.15.1") {
    oidListToReturn.add('foo'); // Add value to the list of keys to return
} else {
    it = oidListToReturn.iterator(); // Remove value from the list of keys to return
    while (it.hasNext()) {
        var key = it.next();
        if (key.equals("snmpTrapOID"))
            it.remove();
    }
}

oidListToReturn; // This will return the list of keys

(function() {
function createPublicSnmpCredential() {
    var snmpGr = new GlideRecord('snmp_credentials');
    snmpGr.initialize();
    snmpGr.type = 'snmp';
    snmpGr.name = 'public';
    snmpGr.active = true;
    snmpGr.password.setDisplayValue('public');
    snmpGr.order = 99999;
    snmpGr.insert();
    gs.log('Successfully created public SNMP credential')
}

createPublicSnmpCredential();
})();

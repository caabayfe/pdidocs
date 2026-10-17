// Discovery
gs.include("PrototypeServer");

/**
 * Implements an SNMP handler for Netware OS.  This handler is designed to be invoked by Classify.java as an interim step toward completely
 * moving the SNMP sensors into JavaScript.
 * 
 * Aleck Lin - aleck.lin@service-now.com
 */
var NetwareHandler = Class.create();

NetwareHandler.prototype = {
    initialize: function() {
        this.snmp = Classify; // current instance of Classify, from the global environment...
    },
    
    classifyAndIdentify: function() {
        var document = this.snmp.getDocument();
        var serverName = XMLUtil.getText(document, '//nwServer/nwSystem/nwSysServerName');
        if (!serverName)
            return;

        this.snmp.addCapability('netware', 'true');
        if (serverName)
            this.snmp.setProperty('sysname', serverName);    
    },
    
    type: 'NetwareHandler'
}

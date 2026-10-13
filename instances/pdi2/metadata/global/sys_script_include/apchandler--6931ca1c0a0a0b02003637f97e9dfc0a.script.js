// Discovery
gs.include("PrototypeServer");

/**
 * Implements an SNMP handler for UPSs. This handler is designed to be invoked by Classify.java as an interim step 
 * toward completely moving the SNMP sensors into JavaScript.
 * 
 * Tom Dilatush tom.dilatush@service-now.com
 */
var APCHandler = Class.create();

APCHandler.prototype = {
    initialize: function() {
        this.snmp = Classify; // current instance of Classify, from the global environment...
    },

    classifyAndIdentify: function() {
        var document = this.snmp.getDocument();
        var apcUPSModel = GlideXMLUtil.getText(document, 
            '//ups/upsIdent/upsBasicIdent/upsBasicIdentModel');
        var apcUPSSerial = GlideXMLUtil.getText(document, 
            '//ups/upsIdent/upsAdvIdent/upsAdvIdentSerialNumber');
        var isAPCUPS = (true && apcUPSModel);
        if (!isAPCUPS)
            return;

        var manufacturer = 'APC';
        var model = apcUPSModel;
        var name = GlideXMLUtil.getText(document, '//ups/upsIdent/upsBasicIdent/upsBasicIdentName');
        if (apcUPSSerial)
            this.snmp.addSerialNumber('standard', apcUPSSerial);
        this.snmp.addCapability('powering', 'true');
        this.snmp.addCapability('mfr_apc', 'true');
        if (name)
            this.snmp.setProperty('sysname', name);
        if (manufacturer)
            this.snmp.setProperty('maker', manufacturer);
        if (model)
            this.snmp.setProperty('model', model);        
    },

    type: 'APCHandler'
}

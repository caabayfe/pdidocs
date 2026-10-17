// Discovery
gs.include("PrototypeServer");

/**
 * Implements an SNMP handler for UPSs.  This handler is designed to be invoked by Classify.java as an interim step toward completely
 * moving the SNMP sensors into JavaScript.
 * 
 * Tom Dilatush tom.dilatush@service-now.com
 */
var UPSHandler = Class.create();

UPSHandler.prototype = {
    initialize: function() {
        this.snmp = Classify; // current instance of Classify, from the global environment...
    },
    
    classifyAndIdentify: function() {
        var document = this.snmp.getDocument();
        var isUPS = (GlideXMLUtil.getTextInt(document, '//upsObjects/upsOutput/upsOutputNumLines') > 0);
        if (!isUPS)
            return;

        var manufacturer = GlideXMLUtil.getText(document, '//upsIdent/upsIdentManufacturer');
        var model = GlideXMLUtil.getText(document, '//upsObjects/upsIdent/upsIdentModel');
        var upsName = GlideXMLUtil.getText(document, '//upsObjects/upsIdent/upsIdentName');
        this.snmp.addCapability('powering', 'true');
        if (upsName)
            this.snmp.setProperty('sysname', upsName);
        if (manufacturer)
            this.snmp.setProperty('maker', manufacturer);
        if (model)
            this.snmp.setProperty('model', model);        
    },
    
    type: 'UPSHandler'
}

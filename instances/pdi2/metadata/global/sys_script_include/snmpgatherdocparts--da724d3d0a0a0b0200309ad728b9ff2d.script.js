// Discovery SNMP Network Interfaces class
gs.include("PrototypeServer");

/**
 * Handles gathering the parts of an SNMP response document (following the ECC queue breadcrumbs) for JavaScript SNMP sensors.
 * 
 * Tom Dilatush tom.dilatush@service-now.com
 */
var SNMPGatherDocParts = Class.create();

SNMPGatherDocParts.prototype = {
    initialize: function() {
        this.XMLUtil = GlideXMLUtil;
        this.StringUtil = GlideStringUtil;
        this.Probe = SncProbe;
    },
    
    /*
     * Returns the given XML document with any data gather by prior SNMP probes.
     * 
     * doc: the XML document from this sensor
     * probe: the probe instance
     */
    gather: function(doc, probe) {
        var fSNMPElement = this.XMLUtil.selectSingleNode(doc, "//snmp");
        if (!fSNMPElement || !fSNMPElement.getFirstChild())
            return null;
        var bcs = probe.getParameter('ecc_breadcrumbs');
        if (!bcs)
            return doc;
            
        var fBreadcrumbs = this.StringUtil.split(bcs, ",");
        for (var i = 0; i < fBreadcrumbs.size(); i++) {
            var breadcrumb = fBreadcrumbs.get(i);
            var eccGR = new GlideRecord('ecc_queue');
            if (eccGR.get(breadcrumb)) {
                var prb = this.Probe.createProbeResponse(eccGR);
                var payload = this.XMLUtil.parse(prb.getPayload());
                var root = payload.getDocumentElement();
				// Try to fetch "snmp" node using "SNMP - Classify" payload structure
                var result = this.XMLUtil.getChildByTagName(root, "result");
                var snmp = this.XMLUtil.getChildByTagName(result, "snmp");
				
				if (!snmp) {
					// We probably handle "SNMP - Identity" payload structure
					var innerResults = this.XMLUtil.getChildByTagName(result, "results");
					var innerResult = this.XMLUtil.getChildByTagName(innerResults, "result");
					snmp = this.XMLUtil.getChildByTagName(innerResult, "snmp");
				}
                var ourRoot = doc.getDocumentElement();
                var ourResult = this.XMLUtil.getChildByTagName(ourRoot, "result");
                if (snmp != null) {
                    var newSnmp = doc.importNode(snmp, true);
                    ourResult.appendChild(newSnmp);
                }
            }
        }
        return doc;
    },
    
    type: 'SNMPGatherDocParts'
}

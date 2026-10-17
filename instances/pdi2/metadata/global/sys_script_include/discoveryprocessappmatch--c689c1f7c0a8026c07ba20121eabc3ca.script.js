// Discovery class

/**
 * Matches an application during process classification.
 *
 * Aleck Lin aleck.lin@service-now.com
 */
var DiscoveryProcessAppMatch = Class.create();

DiscoveryProcessAppMatch.prototype = Object.extend(new AbstractDBObject(), {    
    initialize: function(classifiedProcess, deviceGR ) {
        this.classifiedProcess = classifiedProcess;
        this.deviceGR = deviceGR;
    },
    
    match: function() {
        var correlationId = this.classifiedProcess.getUniqueId() + "@" + this.deviceGR.sys_id;

        var gr = new GlideRecord(this.classifiedProcess.getClassifiedTableName());
        gr.addQuery("correlation_id", correlationId);
        gr.query();

        return gr;
    },

    type: "DiscoveryProcessAppMatch"
});

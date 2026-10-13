// Discovery class

/**
 * Matches an application during application classification.
 *
 * Aleck Lin aleck.lin@service-now.com
 */
  
var DiscoveryApplicationDiscoMatcher = Class.create();

DiscoveryApplicationDiscoMatcher.prototype =  {    
    initialize: function(ciData, appClassificationGr) {
        this.ciData = ciData;
        this.appClassificationGr = appClassificationGr;
        this.newCI = false;

        this.cidata = this.ciData.getData();
    },
    
    match: function () { 
        var gr = this._find();
        if (JSUtil.notNil(gr))
            return gr;
  
        return this._create();
    },

    _find: function() {
        var appName = this.cidata.application_name;
        var tableName = this.appClassificationGr.getValue('table');
        
        var gr = new GlideRecord(tableName);
        gr.addQuery("name", appName);
        gr.addQuery("correlation_id", this._getCorrelationID());
        gr.query();
        if (!gr.next())
            return;

        this._setAppCIValues(gr);
        gr.update();

        return gr;
    },

    _create: function() {
        var tableName = this.appClassificationGr.getValue('table');

        var gr = new GlideRecord(tableName);
        this._setAppCIValues(gr);
        gr.insert();
        this.newCI = true;

        return gr;    
    },

    _setAppCIValues: function(gr) {
        // Convert base values in cidata to the app gr
        for (var name in this.cidata) {
            var value = this.cidata[name];

            var objType = JSUtil.type_of(value);
            if (objType == "object" || objType == "function")
                continue;

            if (JSUtil.nil(value))
                continue;

            gr[name] = value;
        }

        gr.name = this.cidata.application_name;;
        gr.short_description = this.cidata.description;
        gr.correlation_id = this._getCorrelationID();
		
		var grg = new GlideRecord("sys_user_group");
		grg.addQuery("name", this.cidata.ownership);
		grg.query();
		if (grg.next())
			gr.support_group = grg.sys_id + '';
    },

    _getCorrelationID: function() {
        return this.cidata.application_name + "@" + this.cidata.systemCI;
    },

    isNewCI: function() {
        return this.newCI;
    },

    type: "DiscoveryApplicationDiscoMatcher"
}

var GenerateWMIScriptPS1 = Class.create();

GenerateWMIScriptPS1.prototype = {

    initialize : function(fields, shouldFilterHotfix) {
        this.fields = fields;
        this.shouldFilterHotfix = shouldFilterHotfix;
    },

    generateScript: function() {
        var wmiFieldsString = this.fields;
        var filterHotfix = this.shouldFilterHotfix;
        var scriptValue = "";

        scriptValue += "filterHotfix('" + filterHotfix + "');\n";

        var wmiFields = wmiFieldsString.split(",");
        for (var i = 0; i < wmiFields.length; i++)
            scriptValue += "addFetch('" + wmiFields[i]+ "');\n";

        scriptValue += "fetch -computer $computer -cred $cred;\n";
        return scriptValue;
    },

    type: "GenerateWMIScriptJS"
}

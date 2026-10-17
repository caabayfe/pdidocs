var GenerateWMIScriptJS = Class.create();

GenerateWMIScriptJS.prototype = {

    initialize : function(fields) {
        this.fields = fields;
    },

    generateScript: function() {
        var wmiFields = this.fields.split(",");

	var scriptValue = "var scanner = getScanner();\n" +
                          "if (scanner) {\n";

	for (var i = 0; i < wmiFields.length; i++) {
            var path = wmiFields[i];
            path = path.replace(/'/g, "");
            path = path.replace(/\\/g, '\\\\');
            scriptValue +=	"    scanner.addFetch('" + path + "');\n";
        }

        scriptValue += "    scanner.fetch();\n" +
                       "}\n";

	return scriptValue;
    },

    type: "GenerateWMIScriptJS"
}

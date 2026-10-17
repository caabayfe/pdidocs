var GenerateWQLScriptJS = Class.create();

GenerateWQLScriptJS.prototype = {

    initialize : function(namespace, wql) {
        this.namespace = namespace;
        this.wql = wql;
    },

    generateScript: function() {
		var scriptValue = "var scanner = getScanner();\n" +
						  "if (scanner) {\n" +
		"   scanner.wmiQuery('" + this.namespace + "', '" + this.wql + "');\n" +
 						 "}\n";
		return scriptValue;
    },

    type: "GenerateWQLScriptJS"
}

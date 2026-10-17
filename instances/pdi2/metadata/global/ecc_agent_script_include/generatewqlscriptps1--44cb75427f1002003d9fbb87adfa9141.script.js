var GenerateWQLScriptPS1 = Class.create();

GenerateWQLScriptPS1.prototype = {

    initialize : function(namespace, wql, format_list,change_wql) {
        this.namespace = namespace;
        this.wql = wql;
		this.format_list = format_list;
		this.change_wql = change_wql;
    },
	
	generateScript: function(isLocalhost) {
		var scriptValue;
		if (this.change_wql) {
			scriptValue = this.change_wql;
		}else {
			scriptValue = "gwmi -query \"" + this.wql + "\"";
		}
		if (this.namespace)
			scriptValue += " -namespace \"" + this.namespace + "\"";
		if (!isLocalhost)
			scriptValue += " -cred $cred";
		
		if (this.format_list) {
			scriptValue += " -computername $computer";
			scriptValue += " | " + this.format_list + "\n";
		}
		else {
			scriptValue += " -computername $computer\n";
		}
		
		return scriptValue;
    },

    type: "GenerateWQLScriptPS1"
}

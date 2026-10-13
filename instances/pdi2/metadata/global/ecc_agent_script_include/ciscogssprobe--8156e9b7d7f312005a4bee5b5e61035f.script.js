ms.include("PostProcessorIncludes");
var GSS_DOMAIN_LIST_COMMAND = "show gslb-config domain-list";


var CiscoGSSProbe = Class.create();
CiscoGSSProbe.prototype = Object.extendsObject(SSHTerminalCommand, {
    
    /*
    This is the Ovveride function in order to provice cpecific implementation for Cisco. 
    */
    runCommands: function (cliCommands) {
		var domains = []; 
        for (var index in cliCommands){
			var cliCommand = cliCommands[index];
			if (cliCommand == GSS_DOMAIN_LIST_COMMAND){
				domains = this.getDomains(cliCommand); 
				this.probe.createCDATAElement('result',domains);
				this.probe.setHaveResult(true);
			} else 
				ms.log("Unsupported cli command for GSS Load balancer: " + cliCommand);
		}
    },
	
	getDomains: function (cliCommand){
		var domainList = []; 
		var cmdbResult = this.commandExecutor.execCommand(cliCommand);
		if ( !cmdbResult )
			return null;
		var lines = cmdbResult.split("\n");
		for (var i = 0; i < lines.length; i++){
			var line = lines[i].trim(); 
			var lineParts = String(line).split(new RegExp("\\s+"));
			if (lineParts[0] == "domain")
				domainList.push(lineParts[1]);
		}
		return domainList; 
	},
    type: "CiscoGSSProbe"
});

var F5FailoverStateViaSSHProbe = Class.create();


F5FailoverStateViaSSHProbe.prototype = Object.extendsObject(SSHTerminalCommand, {
    
    runCommands: function (cliCommands) {

       this.status = [];
		var commands = cliCommands[0].split(',');
	    for(var aIndex in commands){
		    var cliCommand = commands[aIndex];
            if (this.__runCliCommand(cliCommand)) {
				break;
			}
        }
        this.f5XmlPayload();       
    },

    __runCliCommand: function (cliCommand) {
        if (cliCommand) {
			if (this.getOperationalStatus(cliCommand)) {
				return true;
			}
			return false;
        }
    },

     getOperationalStatus: function (cliCommand) {
		var cmdResult;
			
		try {
			ms.log('execute command: ' + cliCommand);
			cmdResult = this.commandExecutor.execCommand(cliCommand);
			ms.log('command result is: ' + cmdResult);
		}
		catch(Err1) {
			cmdResult = '';
			return false;
		}
		 
		if(typeof cmdResult == null || cmdResult.indexOf('error') > -1 || cmdResult.indexOf('failed') > -1 || cmdResult.isEmpty()){
			
			cmdResult = '';
			return false;
		}
        
	    var lines = cmdResult.split("\n");
        var regex = new RegExp("\\s+");
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            line = line.trim();
            if (line) {
                line = line.replace("\"", ""); 
                var lineParts = String(line).split(regex);
                if (line.match(/Failover/i)) {
                    if (lineParts.length >=2){
						ms.log('Failover = ' + lineParts[1]);
						var entry = {
							value: lineParts[1].trim()							
						};
						this.status.push(entry);
                    }
                    else{
                    	ms.log('problem with Failover name parsing');
                    }
                }
			}
		}
		return true;
     },

     
     f5XmlPayload: function () {
        this.newResult();
        this.objectListXmlPayload('status', this.status);
        this.pop();
    },

    objectListXmlPayload: function (elementName, objects) {
        var elements = this.createElement(elementName + 'es', '');
        this.setCurrent(elements);

        // Handle each object
        for (var i = 0; i < objects.length; i++)
            this.objectXmlPayload(elementName, objects[i], true);

        this.pop();
    },

    objectXmlPayload: function (elementName, object, shouldPop) {
        var element = this.createElement(elementName, '');
        this.setCurrent(element);

        for (var value in object) {
            if (object[value] instanceof Array)
                this.objectListXmlPayload(value, object[value]);
            else
                this.setAttribute(value, object[value]);
        }

        if (shouldPop)
            this.pop();
    },


    type: "F5FailoverStateViaSSHProbe"
});

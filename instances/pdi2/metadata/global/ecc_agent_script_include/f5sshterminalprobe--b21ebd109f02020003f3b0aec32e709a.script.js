var F5SshTerminalProbe = Class.create();


F5SshTerminalProbe.prototype = Object.extendsObject(SSHTerminalCommand, {
    
   
    WELL_KNOWN_PROTOCOL_PORT: {
        'ftp': '21',
        'http': '80',
        'https': '443',
        'telnet': '23',
        'pptp': '1723',
        'smtp': '25',
        'snmp': '161',
        'snmp-trap': '162',
        'ms sql': '1443',
        'submission' : '587',
        'ldaps' : '389'
    },

    /*
    This is the Override function in order to provice cpecific implementation for Cisco. 
    */
    runCommands: function (cliCommands) {

        this.cliShell = 'tmsh';

        this.vipList = [];
        
        for(var aIndex in cliCommands){
            var cliCommand = cliCommands[aIndex];
            ms.log('running command ' + cliCommand);
            
            this.__runCliCommand(cliCommand);

        }
        if (this.vipList.length > 0) {
            this.f5XmlPayload();
        }
       
    },

    __runCliCommand: function (cliCommand) {
        if (cliCommand) {
            switch (String(cliCommand).trim()) {
                case 'list ltm virtual recursive':
                    this.getF5Vips(cliCommand);
                break;
                default:
                    ms.log("Unsupported cli command " + cliCommand);
                break;
                
            }
        }

    },

     getF5Vips: function (cliCommand) {
        var commandSyntax = 'tmsh ' + cliCommand;
        var cmdResult = this.commandExecutor.execCommand(commandSyntax);
        ms.log('command result is: ' + cmdResult);
            
        if(typeof cmdResult === null){
            cmdResult = 'empty';
        }

        var lines = cmdResult.split("\n");

        var vipName;
        var vipIp;
        var vipPort;
        var vipPool;
        var isPoolExist = false;

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            line = line.trim();
            if (line) {
                line = line.replace("\"", ""); 
                var lineParts = String(line).split(new RegExp("\\s+"));
                if (line.match(/ltm virtual/)) {
                    isPoolExist=false;
                    if (lineParts.length >=2){
                    	vipName=lineParts[2].trim();
                    }
                    else{
                    	ms.log('problem with VIP name parsing');
                    }
                }
                else if (line.match(/destination/)) {
                	if (lineParts.length >=1){
                    	var ipAndPort = lineParts[1].trim()
                    	var parts = ipAndPort.split(":");
                    	vipIp = parts[0].split("%")[0];

                    	var portValue = parts[1].trim();
                     	if (typeof this.WELL_KNOWN_PROTOCOL_PORT[portValue] !== 'undefined') {
                        	vipPort = this.WELL_KNOWN_PROTOCOL_PORT[portValue];
                    	} else {
                        	vipPort = portValue;
                    	}
                    }
                    else{
                    	ms.log('problem with IP parsing');
                    }
               }
               else if (line.match(/^\/pool/)) {     
                    isPoolExist=true;
                    if (lineParts.length >=1){
	                    vipPool = lineParts[1];
	                   
	                    var entry = {
	                        name: vipName,
	                        ip: vipIp,
	                        port: vipPort,
	                        pool: vipPool
	                    };
	                    this.vipList.push(entry); 
                    }
                    else{
                    	ms.log('problem with pool parsing');
                    }
              } 
              else if (line.match(/vs-index/) && !isPoolExist){
                    if (lineParts.length >=1){
	                    vipPool = lineParts[1];
	                   
	                    var entry = {
	                        name: vipName,
	                        ip: vipIp,
	                        port: vipPort,
	                        pool: ""
	                    };
	                    this.vipList.push(entry);   
                    }
                    else{
                    	ms.log('problem with pool parsing');
                    }         
                }
            }
        }
     },

     
     f5XmlPayload: function () {
        this.newResult();
        this.objectXmlPayload('device', null, false);
        this.objectListXmlPayload('vip', this.vipList);
        this.pop();
    },

    objectListXmlPayload: function (elementName, objects) {
        var elements = this.createElement(elementName + 's', '');
        this.setCurrent(elements);

        // Handle each object
        for (var i = 0; i < objects.length; i++)
            this.objectXmlPayload(elementName, objects[i], true);

        this.pop();
    },

    objectXmlPayload: function (elementName, object, shouldPop) {
        var element = this.createElement(elementName, '');
        this.setCurrent(element);

        for (var name in object) {
            if (object[name] instanceof Array)
                this.objectListXmlPayload(name, object[name]);
            else
                this.setAttribute(name, object[name]);
        }

        if (shouldPop)
            this.pop();
    },


    type: "F5SshTerminalProbe"
});

var CiscoCliProbe = Class.create();

CiscoCliProbe.prototype = Object.extendsObject(SSHTerminalCommand, {

    runCommands: function (cisco_cli_commands) {

        this.deviceVersion = {
            type: 'Cisco ACE LoadBalancder',
            version: ''
        };
        this.groups = [];
        this.realServers = [];
        this.interfaces = [];
        this.vipList = [];

        var ciscoContexts = this.getCiscoContexts();

        for (var cIndex in ciscoContexts) {
            var ciscoContext = ciscoContexts[cIndex];
            try {
                this.changeCiscoContext(ciscoContext);
                this.__runCliCommands(cisco_cli_commands);
            } catch (error) {
                ms.log("CiscoCliProbe: fail to change context: " + error);
            }
        }

        this.generateXMLPayload();

    },

    __runCliCommands: function (cliCommands) {
        for (var i in cliCommands) {
            cli_command = cliCommands[i];
            if (cli_command) {
                switch (String(cli_command).trim()) {
                    case 'show version':
                        ms.log("Trying to run cli command " + cli_command);
                        this.deviceVersion.version = this.getCiscoVersion();
                        break;

                    case 'show interface':
                        ms.log("Trying to run cli command " + cli_command);
                        this.getCiscoInterfaces();
                        break;
                    case 'show rserver':
                        ms.log("Trying to run cli command " + cli_command);
                        this.getCiscoRealServers();
                        break;
                    case 'show serverfarm':
                        ms.log("Trying to run cli command " + cli_command);
                        this.getCiscoFarms();
                        break;
                    case 'show service-policy detail':
                        ms.log("Trying to run cli command " + cli_command);
                        this.getCiscoVips();
                        break;
                    default:
                        ms.log("Unsupported cli command " + cli_command);
                        break;
                }
            }
        }

    },

    getCiscoVersion: function () {
        var cmd_result = this.commandExecutor.execCommand('show version|include system:|exclude filesystem');
        var ciscoVersion = cmd_result.replace('system:', '').trim();
        return ciscoVersion;

    },

    changeCiscoContext: function (contextName) {
        var cmdResult = this.commandExecutor.execCommand('changeto ' + contextName);
        if (cmdResult !== null && cmdResult !== '') {
            var subStrIndex = cmdResult.indexOf('Error:')
            if (subStrIndex > -1) {
                throw 'Error: Failed to change context to: ' + contextName + ' contact System Administrator';
            } else {
                ms.log("CiscoCliProbe:changeCiscoContext: context changed to: " + contextName);
            }
        }

    },

    getCiscoInterfaces: function () {

        var cmd_result = this.commandExecutor.execCommand('show interface | include is');
        var lines = cmd_result.split("\n");

        for (var i = 0; i < lines.length; i++) {
            var line = String(lines[i]).trim().split(new RegExp("\\s+"));

            if (line.length === 9 && line[0] === "GigabitEthernet") {
                var rowName = line[2].split("/");
                var interfaceName = rowName[0] + "." + rowName[1];
                var interfaceStatus = line[4].split(',')[0];
                var macAddress = "undefined";
                if (i + 1 < lines.length) {
                    macLine = String(lines[i + 1]).trim().split(new RegExp("\\s+"));
                    ms.log("The line of MAC length is: " + macLine.length);

                    if (macLine.length >= 8) {
                        macAddress = macLine[8];
                    }
                }
                this.interfaces.push({
                    name: interfaceName,
                    status: interfaceStatus,
                    MACAddress: macAddress
                });
            }
        }

        ms.log("This is the Json result " + JSON.stringify(this.interfaces));
    },

    getCiscoContexts: function () {

        var cmd_result = this.commandExecutor.execCommand('show context | include Name:');
        var raw_contexts = cmd_result.split('\n');
        var contexts = [];
        for (var i in raw_contexts) {
            var context = raw_contexts[i].replace('Name:', '').split(',')[0].trim();
            contexts.push(context);
        }

        return contexts;
    },

    getCiscoFarms: function () {
        var cmd_result = this.commandExecutor.execCommand('show serverfarm | exclude +-----|exclude serverfarm');
        var lines = cmd_result.split("\n");

        var serverFarmName;
        var balancingMethod;
        var isDetailsNextRow = false;
        var entry;
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            line = line.trim();

            if (line) {
                var lineParts = String(line).split(new RegExp("\\s+"));

                if (isDetailsNextRow) {
                    isDetailsNextRow = false;
                    balancingMethod = lineParts[2];
                    entry = {
                        name: serverFarmName,
                        method: balancingMethod
                    };
                    ms.log(entry.group);
                    ms.log(entry.method);
                    this.groups.push(entry);
                } else if (lineParts.length == 1) {
                    serverFarmName = lineParts[0];
                    isDetailsNextRow = true;

                }
            }
        }

        ms.log("This is the Json result " + JSON.stringify(this.groups));


    },

    getCiscoRealServers: function () {

        var cmd_result = this.commandExecutor.execCommand('show rserver | exclude state | exclude +--- | exclude connections');
        var lines = cmd_result.split("\n");

        var realServerName;
        var realServerAddress;
        var realServerPort;
        var pool;

        var isIPNextRow = false;

        var entry;

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            line = line.trim();

            if (line) {
                var lineParts = String(line).split(new RegExp("\\s+"));

                if (isIPNextRow) {
                    isIPNextRow = false;
                    var ipAndPort = lineParts[0].split(":");
                    realServerAddress = ipAndPort[0];
                    realServerPort = ipAndPort[1];

                    entry = {
                        name: realServerName,
                        ip: realServerAddress,
                        port: realServerPort,
                        group: pool
                    };
                    this.realServers.push(entry);
                } else if (lineParts[0].match(/rserver/)) {
                    realServerName = lineParts[2].split(',')[0];
                } else if (lineParts[0].match(/serverfarm/)) {
                    pool = lineParts[1];
                    isIPNextRow = true;
                }
            }
        }

        ms.log("This is the Json result " + JSON.stringify(this.realServers));

    },

    getCiscoVips: function () {

        var cmd_result = this.commandExecutor.execCommand('show service-policy detail');
        var lines = cmd_result.split("\n");

        var vipName;
        var vipIp;
        var vipPort;
        var vipState;

        var isDetailsNextRow = false;

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            line = line.trim();
            if (line) {
                var lineParts = String(line).split(new RegExp("\\s+"));
                if (isDetailsNextRow) {
                    isDetailsNextRow = false;
                    vipIp = lineParts[0];
                    if (lineParts.length == 4) {
                        vipPort = lineParts[3];
                    } else {
                        vipPort = "80";
                    }
                } else if (lineParts[0].match(/class:/)) {
                    if (lineParts[1]) {
                        vipName = lineParts[1].trim();
                    }
                } else if (line.match(/VIP Address:/)) {
                    isDetailsNextRow = true;
                } else if (line.match(/VIP State:/)) {
                    vipState = lineParts[2].trim();

                } else if (line.match(/primary serverfarm:/)) {
                    var serviceFarm = lineParts[2].trim();
                    var entry = {
                        name: vipName,
                        ip: vipIp,
                        port: vipPort,
                        state: vipState,
                        group: serviceFarm
                    };
                    this.vipList.push(entry);
                }

            }
        }

        ms.log("This is the Json result " + JSON.stringify(this.vipList));
    },

    /**
     * Writes the XML payload representing the VMWare environment managed by vCenter
     */
    generateXMLPayload: function () {
        this.createOutputRecord = false;
        this.newResult();
        this.ciscoXmlPayload();
    },

    ciscoXmlPayload: function () {
        this.objectXmlPayload('device', this.deviceVersion, false);
        this.objectListXmlPayload('group', this.groups);
        this.objectListXmlPayload('server', this.realServers);
        this.objectListXmlPayload('interface', this.interfaces);
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

    type: "CiscoCliProbe"
});

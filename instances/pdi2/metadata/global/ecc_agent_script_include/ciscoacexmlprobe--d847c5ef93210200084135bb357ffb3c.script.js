ms.include("PostProcessorIncludes");

var CiscoAceXmlProbe = Class.create();

/*
 * This is the implementation of Cisco ACE Load Balancer Probe that expect output result form the device in XML format
 * Each cli command are filtered and converted to a specific xml output format in order to prevent large data transfer to the Instance.
 *
 * Supported Cisco Versions:
 *
 * 1. build 3.0(0)A2(3.6a)(3.3)
 * 2. build 3.0(0)A3(2.0)
 * 3. build 3.0(0)A4(2.3) 
 * 4. build 3.0(0)A5
 */
CiscoAceXmlProbe.prototype = Object.extendsObject(SSHTerminalCommand, {
    /*
     * This is the map of the supported firmware versions
     * Based on this map version we are performing different parsing logic due to unsupported backward compatibility
     */
    SUPPORTED_VERSIONS: {
        A2: 'A2',
        A3: 'A3',
        A4: 'A4',
        A5: 'A5'
    },

    /*
     * We defined mapping Object in order to translate protocol name to real default port
     */
    DEFAULT_PROTOCOL_PORT: {
        'www': '80',
        'ftp': '21',
        'ssh': '22',
        'smtp': '25',
        'https': '443 ',
        'rtsp': '554',
        'rdp': '3389',
        'sip': '5060'
    },

    /*
    This is the Ovveride function in order to provice cpecific implementation for Cisco. 
    */
    runCommands: function (ciscoCliCommands) {

        this.deviceVersion = {
            type: 'Cisco ACE LoadBalancer',
            version: ''
        };
        this.groups = [];
        this.realServers = [];
        this.interfaces = [];
        this.vipList = [];
        this.ciscoContexts = [];
        /*In case of port range we need to limit the generation in order to prevent database overloading*/
        this.vipPortRangeLimit = this.getIntParameter('vip_port_range_limit', 10);
        /*Customer can change the default limit port reange limit from 10 to other number*/
        this.__getPortRangeLimit();
        this.commandExecutor.execCommand("xml-show on");
        this.deviceVersion.version = this.getCiscoVersion();
        this.__getCiscoContexts();

        /*
         * In order to perform full discovery we need to get the configuration from all defined contexts
         * We perform the set of the defined commands for each context
         * The configuration output is xml
         * Since xml is not the default output we turn it to on/off per context
         */
        for (var cIndex in this.ciscoContexts) {
            var ciscoContext = this.ciscoContexts[cIndex];
            try {
                this.changeCiscoContext(ciscoContext);
                this.commandExecutor.execCommand("xml-show on");
                this.__runCliCommands(ciscoCliCommands);
                this.commandExecutor.execCommand("xml-show off");
            } catch (error) {
                ms.error("CiscoAceXmlProbe: failed to change context: " + error);
            }
        }
        this.commandExecutor.execCommand("xml-show off");

        this.generateXMLPayload();

    },

    /*
     * This is the parent function that was overwritten in order to perform specific logic for Cisco Ace
     */
    __runCliCommands: function (cliCommands) {
        for (var i in cliCommands) {
            cli_command = cliCommands[i];
            if (cli_command) {
                switch (String(cli_command).trim()) {
                    case 'show version':
                        /*
                          We are using the version command in order to run relevant parse logic for each version
                          Since we called this function erliar we shoud skip this call.
                          The case is empty in order to prevent message from default case - Unsupported cli command
                        */
                        break;
                    case 'show interface':
                        this.getCiscoInterfaces();
                        break;
                    case 'show rserver':
                        this.getCiscoRealServers();
                        break;
                    case 'show serverfarm':
                        this.getCiscoFarms();
                        break;
                    case 'show service-policy detail':
                        this.getCiscoVips();
                        break;
                    default:
                        ms.error("Unsupported cli command " + cli_command);
                        break;
                }
            }
        }

    },

    getCiscoVersion: function () {
        var runCommand = 'show version';

        try {
            var jsonObject = this.__getJsonObjectByCliCommand(runCommand, true);

            if (jsonObject.xml_show_version.ver_software.hasOwnProperty('ver_system')) {
                return jsonObject.xml_show_version.ver_software.ver_system;
            }
        } catch (error) {
            ms.error("Failed due to parse command: " + runCommand + " output " + error);
        }

        return "";
    },

    __getCiscoContexts: function () {
        var runCommand = 'show context';
        try {
            var jsonObject = this.__getJsonObjectByCliCommand(runCommand, true);

            var pathToContext = null;

            if (!this.deviceVersion.version.match(this.SUPPORTED_VERSIONS.A2))
                pathToContext = jsonObject.xml_show_context.ctx_contexts.ctx_context;
            else
                pathToContext = jsonObject.xml_show_context.ctx_context;

            if (typeof pathToContext !== 'undefined') {
                var contexts = pathToContext;
                if (!(contexts instanceof Array))
                    contexts = [contexts];

                for (var contextIndex in contexts) {
                    var ciscoContext = contexts[contextIndex];
                    this.ciscoContexts.push(ciscoContext['name'].trim());
                }
            }
        } catch (error) {
            ms.error("Failed due to parse command: " + runCommand + " output " + error);
        }
    },

    /* 
     * This function changes the context to the provided context Name/User
     */
    changeCiscoContext: function (contextName) {
        var cmdResult = this.commandExecutor.execCommand('changeto ' + contextName);
        if (cmdResult !== null && cmdResult !== '') {
            var subStrIndex = cmdResult.indexOf('Error:');
            if (subStrIndex > -1)
                throw 'Error: Failed to change context to: ' + contextName + ' contact System Administrator';
        }
    },

    /* 
     * This function updates the list of the discovered interfaces for the current load balancer
     * The parsing knowledge is based on the above Cisco ACE firmware versions
     * If the version is unknown the default parsing is like A2,A4,A5
     */

    getCiscoInterfaces: function () {

        var runCommand = 'show interface';
        try {
            var jsonObject = this.__getJsonObjectByCliCommand(runCommand, true);
            if (!this.deviceVersion.version.match(this.SUPPORTED_VERSIONS.A3))
                this.__getCiscoInterfaces_A2_A4_A5(jsonObject);
            else
                this.__getCiscoInterfacesA3(jsonObject);

        } catch (error) {
            ms.error("Failed due to parse command: " + runCommand + " output " + error);
        }
    },

    /*
     * Specific parsing of the interace section for the A2, A4, A5 firmware versions
     */
    __getCiscoInterfaces_A2_A4_A5: function (jsonObject) {
        if (jsonObject && jsonObject.xml_show_interface.hasOwnProperty('xml_interface_entry')) {
            var ethInterfaces = jsonObject.xml_show_interface.xml_interface_entry;
            if (!(ethInterfaces instanceof Array))
                ethInterfaces = [ethInterfaces];

            for (var ethInterfaceIndex in ethInterfaces) {
                var ethInterface = ethInterfaces[ethInterfaceIndex];
                var iName = ethInterface.xml_interface['interface_name'].trim();
                var iStatus = ethInterface.xml_interface['interface_status'].trim();
                var iMacAddress = ethInterface.xml_interface.interface_mac['macaddress'].trim();

                this.__updateInteracesList(iName, iStatus, iMacAddress);
            }
        }
    },

    /*
     * Specific parsing of the interace section for the A3 firmware version
     */
    __getCiscoInterfacesA3: function (jsonObject) {
        if (jsonObject && jsonObject.xml_show_interface.hasOwnProperty('xml_interface_eth_entry')) {
            var ethInterfaces = jsonObject.xml_show_interface.xml_interface_eth_entry;
            if (!(ethInterfaces instanceof Array))
                ethInterfaces = [ethInterfaces];

            for (var ethInterfaceIndex in ethInterfaces) {
                var ethInterface = ethInterfaces[ethInterfaceIndex];
                var iName = ethInterface.xml_eth_interface['interface_name'].trim();
                var iStatus = ethInterface.xml_eth_interface['interface_status'].trim();
                var iMacAddress = ethInterface.xml_eth_interface.interface_eth_info.interface_mac['macaddress'].trim();

                this.__updateInterfacesList(iName, iStatus, iMacAddress);
            }
        }
    },

    __updateInterfacesList: function (iName, iStatus, iMacAddress) {
        this.interfaces.push({
            name: iName,
            status: iStatus,
            MACAddress: iMacAddress
        });
    },

    /* 
     * This function updates the list of groups/farms for the current load balancer
     */
    getCiscoFarms: function () {
        var runCommand = 'show serverfarm';

        try {
            var jsonObject = this.__getJsonObjectByCliCommand(runCommand, true);
            if (jsonObject.xml_show_serverfarm.hasOwnProperty('sf_entry')) {
                var serverFarms = jsonObject.xml_show_serverfarm.sf_entry;
                if (!(serverFarms instanceof Array))
                    serverFarms = [serverFarms];

                for (var farmIndex in serverFarms) {
                    var serverFarm = serverFarms[farmIndex];
                    var sName = serverFarm['name'].trim();
                    var balancingMethod = serverFarm['sf_predictor'].trim();

                    var entry = {
                        name: sName,
                        method: balancingMethod
                    };

                    this.groups.push(entry);
                }
            }
        } catch (error) {
            ms.error("Failed due to parse command: " + runCommand + " output " + error);
        }
    },

    /* 
     * This function updates the list of the real servers for the current load balancer
     */
    getCiscoRealServers: function () {
        var runCommand = 'show rserver';

        try {
            var jsonObject = this.__getJsonObjectByCliCommand(runCommand, true);
            if (jsonObject.xml_show_rserver.hasOwnProperty('rs_entry')) {
                var realServers = jsonObject.xml_show_rserver.rs_entry;
                if (!(realServers instanceof Array))
                    realServers = [realServers];

                for (var serverIndex in realServers) {

                    var realServer = realServers[serverIndex];
                    if (realServer !== null && realServer.hasOwnProperty('rs_entry')) {
                        var complexServer = realServer.rs_entry;
                        var sName = realServer['name'].trim();
                        if (!(realServer.rs_entry instanceof Array))
                            complexServer = [realServer.rs_entry];

                        for (var currentiIndex in complexServer) {
                            var currentServer = complexServer[currentiIndex];
                            var sGroup = currentServer['rs_sfarm'].trim();
                            var sIp = currentServer['address'].trim();
                            var sPort = currentServer['rs_port'].trim();
                            var sState = currentServer['rs_state'].trim();

                            var entry = {
                                name: sName,
                                ip: sIp,
                                port: sPort,
                                group: sGroup,
                                state: sState
                            };
                            this.realServers.push(entry);
                        }
                    }


                }
            }
        } catch (error) {
            ms.error("Failed due to parse command: " + runCommand + " output " + error);
        }
    },

    /* 
     * This function updates the list of the discovered VIP's for the current load balancer
     * The parsing knowledge is based on the above Cisco ACE firmware versions
     */
    getCiscoVips: function () {
        var runCommand = 'show running-config class-map';
        var policyMaps = this.__getPolicyMaps();
        if (!(policyMaps != null && policyMaps.length > 0))
            return;
        
        try {
            var validateAndFix = true;
            
            if (this.deviceVersion.version.match(this.SUPPORTED_VERSIONS.A4) || this.deviceVersion.version.match(this.SUPPORTED_VERSIONS.A5)) {
                validateAndFix = false;
            }
            var jsonObject = this.__getJsonObjectByCliCommand(runCommand, validateAndFix);
            if (jsonObject && jsonObject.xml_show_running_config.hasOwnProperty('class-map')) {
                var vipServices = jsonObject.xml_show_running_config['class-map'];
                if (!(vipServices instanceof Array))
                    vipServices = [vipServices];
                
                for (var vipIndex in vipServices) {
                    var vipService = vipServices[vipIndex];
                    var vipName = vipService['@name'].trim();
                    var vipIp = "";
                    var vipPort = '';
                    var vipState = 'INSERVICE';
                    var serviceFarm = '';
                    var portValue = '';

                    if (!vipService.hasOwnProperty('match_virtual-addr'))
                        continue;

                    var virtualAddresses = vipService['match_virtual-addr'];
                    if (!(virtualAddresses instanceof Array))
                        virtualAddresses = [virtualAddresses];
                        
                    for (var virtualAddressIndex in virtualAddresses) {
                        var virtualAddress = virtualAddresses[virtualAddressIndex];

                        vipIp = this.__getVipIpFromVirtualAddress(virtualAddress);
                        serviceFarm = this.__getGroupNameFromPolicyMapByVipName(policyMaps, vipName);

                        
                        if (!virtualAddress.hasOwnProperty('@operator'))
                            continue;
                            
                        var isPortRange = (virtualAddress['@operator'].trim() === 'range') ? true : false;
                        if (isPortRange) {
                            var portRange = this.__getVipPortRangeFromVirtualAddress(virtualAddress);
                            if (portRange === null) continue;
                            for (var currentPort = portRange.startPort; currentPort <= portRange.endPort; currentPort++) {
                                this.__addToListVipEntry(vipName + '-' + currentPort, vipIp, currentPort, vipState, serviceFarm);
                            }
                        } else {
                            vipPort = this.__getVipPortFromVirtualAddress(virtualAddress);
                            if (vipPort === null) continue;
                            this.__addToListVipEntry(vipName, vipIp, vipPort, vipState, serviceFarm);

                        }
                    }
                }
            }
        } catch (error) {
            ms.error("Failed due to parse command: " + runCommand + " output " + error);
        }
    },


    __getVipIpFromVirtualAddress: function (virtualAddress) {
        
        var ipAddress = '';
        if (this.deviceVersion.version.match(this.SUPPORTED_VERSIONS.A5)) {
            ipAddress = virtualAddress['@ipv4-address'].trim();
        } else {
            ipAddress = virtualAddress['@virtual-address'].trim();
        }
       
        return ipAddress;
    },

    __getVipPortFromVirtualAddress: function (virtualAddress) {
        var portValue = '';
        if (this.deviceVersion.version.match(this.SUPPORTED_VERSIONS.A3)) {
            if (!virtualAddress.hasOwnProperty('@protocol-value'))
                return null;
            portValue = virtualAddress['@protocol-value'].trim();
        } else {
            if (virtualAddress.hasOwnProperty('@port-tcp-name')) {
                portValue = virtualAddress['@port-tcp-name'].trim();
            }
            if (virtualAddress.hasOwnProperty('@port-udp-name')) {
                portValue = virtualAddress['@port-udp-name'].trim();
            }

        }
        var portNumber = '';
        if (typeof this.DEFAULT_PROTOCOL_PORT[portValue] !== 'undefined') {
            portNumber = this.DEFAULT_PROTOCOL_PORT[portValue].trim();
        } else {
            portNumber = portValue;
        }
        return portNumber;
    },

    __getVipPortRangeFromVirtualAddress: function (virtualAddress) {
        var startPort = parseInt(virtualAddress['@port-1'].trim());
        var endPort = parseInt(virtualAddress['@port-2'].trim());

        if (startPort >= 0 && startPort <= 65535) {
            if (endPort >= 0 && endPort <= 65535) {
                if ((endPort < startPort)) {
                    ms.error("Invalid, endPort<startPort range for vip name: " + vipName + ' port range: [ ' + startPort + ',' + endPort + ' ]');
                    return null;
                }
            } else {
                ms.error("Invalid startPort>endPort range for vip name: " + vipName + ' port range: [ ' + startPort + ',' + endPort + ' ]');
                return null;
            }
        } else {
            ms.error("Invalid startPort range for vip name: " + vipName + ' port range: [ ' + startPort + ',' + endPort + ' ]');
            return null;
        }

        /* Set port range limit according to the configuration */
        if ((endPort - startPort) > (this.vipPortRangeLimit - 1)) {
            endPort = startPort + this.vipPortRangeLimit - 1;
        }

        var portRange = {
            startPort: startPort,
            endPort: endPort
        };

        return portRange;
    },

    __getGroupNameFromPolicyMapByVipName: function (policyMaps, vipName) {
        var groupName = '';
        for (var mapIndex in policyMaps) {
            var policyMap = policyMaps[mapIndex];
            var tmpVipName = '';
            if ((vipName.length >= 3) && this.deviceVersion.version.match(this.SUPPORTED_VERSIONS.A4))
                tmpVipName = vipName.slice(0, -4);

            if ((policyMap['policy'].indexOf(tmpVipName) > -1))
                return policyMap['group'];
            else {
                if (vipName.length > 3 && vipName.indexOf('vip-') == 0) {
                    vipName = vipName.slice(4);
                    if ((policyMap['policy'].indexOf(vipName) > -1))
                        return policyMap['group'];
                }
            }
        }
        return groupName;
    },

    __addToListVipEntry: function (vipName, vipIp, vipPort, vipState, vipGroup) {

        var entry = {
            name: vipName,
            ip: vipIp,
            port: vipPort,
            state: vipState,
            group: vipGroup
        };

        this.vipList.push(entry);

    },

    /* 
     * This function return the List of the discovered Policy per Group/Farm
     * This information is needed in order identify to which group/farm the VIP is related
     */
    __getPolicyMaps: function () {
        var runCommand = 'show running-config policy-map';
        var policyMapsList = [];
        try {
            var jsonObject = this.__getJsonObjectByCliCommand(runCommand, false);

            if (jsonObject && jsonObject.xml_show_running_config.hasOwnProperty('policy-map_lb')) {
                var policyMaps = jsonObject.xml_show_running_config['policy-map_lb'];
                if (!(policyMaps instanceof Array))
                    policyMaps = [policyMaps];

                for (var policyMapIndex in policyMaps) {
                    var policyMap = policyMaps[policyMapIndex];
                    var pName = policyMap['@pmap-name'].trim();
                    var pFarm = '';
                    if (this.deviceVersion.version.match(this.SUPPORTED_VERSIONS.A4)){
                        if (policyMap.class_pmap_lb.hasOwnProperty('sticky-serverfarm') && policyMap.class_pmap_lb['sticky-serverfarm'].hasOwnProperty('@sticky-group')) {
                            var stickyGroup = policyMap.class_pmap_lb['sticky-serverfarm']['@sticky-group'];
                            if (stickyGroup.length > 7)
                                stickyGroup = stickyGroup.slice(0, -7).trim();
                            pFarm = stickyGroup;
                        }
                    }else{
                        pFarm = policyMap.class_pmap_lb.serverfarm_pmap['@sfarm-name'].trim();
                    }                           

                    var entry = {
                        policy: pName,
                        group: pFarm
                    };

                    policyMapsList.push(entry);
                }
            }
        } catch (error) {
            ms.error("Failed due to parse command: " + runCommand + " output " + error);
        }
        return policyMapsList;
    },

    /*
        Run Cisco ACE Cli commads and convert it to Json Object 
        cliCommand: cli command that we are running over SSH Terminal
        skipResultValidation: Due to invalid XML output in some cases,
        we are providing posibility to validate the validity of XML before parsing,
        in order to prevent Exceptions for known issues.
    */
    __getJsonObjectByCliCommand: function (cliCommand, skipResultValidation) {

        var isShowRunningConfTagExists = false;
        if (cliCommand.indexOf("running-config") > -1)
            isShowRunningConfTagExists = true;

        var cmdResult = this.commandExecutor.execCommand(cliCommand);
        /*
        As part of the xml output we are getting non ASCII characters and statements 
        Before parsing the XML output we should clean it from non ASCII chars and not relevant statements
        */

        cmdResult = String(cmdResult).replace(/[^\x00-\x7F]/g, '');
        cmdResult = String(cmdResult).replace(/undefined/g, '');
        cmdResult = String(cmdResult).replace(/--More--/, '');
        cmdResult = String(cmdResult).replace('Generating configuration....', '');

        if (!(skipResultValidation))
            cmdResult = this.__validateXmlResult(cmdResult);

        // In case xml tag droped down by enter the XML parser is fails.
        // In order to avoid this situation we are removing all new lines from the xml
        cmdResult = String(cmdResult).replace(/(\r\n|\n|\r)/gm, '');

        //In case XML corrupted and this tag is missing we are fixing the XML structure
        if (isShowRunningConfTagExists)
            if (cmdResult.indexOf("<xml_show_running_config>") == -1) {
                cmdResult = "<xml_show_running_config>" + cmdResult;
            }

        var jsonResult = null;
        try {
            var xmlHelper = new XMLHelper("<xml>" + cmdResult + "</xml>");
            jsonResult = xmlHelper.toObject();

        } catch (error) {
            var SAXParseException = Packages.org.xml.sax.SAXParseException;
            if (error instanceof SAXParseException) {
                ms.error("Trying to fix XML");
                ms.error("The column number is: " + error.getColumnNumber());
                ms.error("The line number is: " + error.getLineNumber());
                ms.error("The Public Id is: " + error.getPublicId());
                ms.error("The System Id is: " + error.getLineNumber());
            } else
                ms.error("Failed due to parse command: " + cliCommand + " output " + error);

        }

        return jsonResult;

    },

    /* 
        Due to invalid XML result for command we are fixing XML before parsing
        Missing last tag </policy-map_lb>
    */
    __validateXmlResult: function (xmlCliResult) {
        var fixedXmlOutput = "";

        var xmlRows = xmlCliResult.split('\n');
        for (var rowIndex = 0; rowIndex < xmlRows.length; rowIndex++) {
            var xmlRow = xmlRows[rowIndex];
            fixedXmlOutput = fixedXmlOutput + xmlRow + '\n';
            if (xmlRow.match('\<\/class_pmap_lb\>')) {
                if (!(xmlRows[rowIndex + 1].match('\<\/policy\-map_lb\>'))) {
                    fixedXmlOutput = fixedXmlOutput + '</policy-map_lb>\n';
                    rowIndex++;
                }
            }
        }
        return fixedXmlOutput;
    },

    /**
     * Writes the XML payload representing the Cisco load balancer environment configuration
     * The existing Probe api is used
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
        try {
            var element = this.createElement(elementName, '');
            this.setCurrent(element);

            for (var name in object) {
                if (object[name] !== undefined && object[name] instanceof Array)
                    this.objectListXmlPayload(name, object[name]);
                else
                if (object[name] !== undefined)
                    this.setAttribute(name, object[name]);
                else
                    this.setAttribute(name, 'undefined');
            }

            if (shouldPop) this.pop();
        } catch (error) {
            ms.error("Failed to add xml element: " + elementName + ":  " + error);
        }
    },

    type: "CiscoAceXmlProbe"
});

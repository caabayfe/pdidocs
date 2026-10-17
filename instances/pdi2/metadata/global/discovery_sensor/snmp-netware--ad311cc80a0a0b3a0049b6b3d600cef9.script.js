/**
 * Implements a sensor for Netware OS.
 * 
 * Aleck Lin aleck.lin@service-now.com
 */

new DiscoverySensor({

    process: function() {
        this.parseOutput(payload);  // from payload global...
    },

    parseOutput: function(document) {
        var sgdp = new SNMPGatherDocParts();
        this.document = sgdp.gather(document, g_probe); // Document...

        var processorCount   = XMLUtil.getText(this.document, '//nwHostExtensions/nwhrDevice/nwhrProcessorCount');
        var serverName       = XMLUtil.getText(this.document, '//nwServer/nwSystem/nwSysServerName');
        var serialNumber     = XMLUtil.getText(this.document, '//nwServer/nwSystem/nwSysSerialNumber');
        var OSVersion            = XMLUtil.getText(this.document, '//nwServer/nwSystem/nwSysOSMajorVer');
        var description          = XMLUtil.getText(this.document, '//nwServer/nwSystem/nwSysOSDescription');
        var RAM                  = XMLUtil.getText(this.document, '//host/hrStorage/hrMemorySize');

        // Process file system
        var vols  = g_disco_functions.getXMLMemoryTable( 'vols',  this.document, '//nwServer/nwFileSystem/nwFSVolEntry'   );
        this.processFileSystems(vols);

        // Process installed software
        var iSW  = g_disco_functions.getXMLMemoryTable( 'iSW',  this.document, '//host/hrSWInstalled/hrSWInstalledEntry'   );
        this.processInstalledSoftwares(iSW);        

        // Process running NLMs
        var processes  = g_disco_functions.getXMLMemoryTable( 'processes',  this.document, '//host/hrSWRun/hrSWRunEntry'   );
        this.processNLMprocesses(processes);        

        // Set up NICs
        var sni = new SNMPNetworkInterfaces();
        sni.process(this.getCmdbCi(), this.document, false, g_probe.getAgent(),
                    g_probe.getEccQueueRecord().getValue('sys_id'));

        // Setting the ip address
        var netProtocols  = g_disco_functions.getXMLMemoryTable( 'netProtocols',
                            this.document,
                            '//nwHostExtensions/nwhrOdi/nwhrProtocolEntry'   );
        netProtocols.first();
        while (netProtocols.next()) {
            if (netProtocols.getValue('nwhrProtocolName') == "IP") {
              current.ip_address = this.getIPAddress(new String(netProtocols.getValue('nwhrProtocolAddress')));
              break;
            }
        }   
        
        // update the CI's fields...
        current.name                = serverName;
        current.serial_number       = serialNumber;
        current.os_version          = OSVersion;
        current.short_description   = description;
        current.cpu_count           = processorCount;
        current.ram                 = new RoundingInterval("ram").getRoundedValue(RAM/1024); //RAM is in KB. We need to display MB
    },

    processFileSystems: function(vols) {
        var totalDiskSpace = 0;
        var gr = new GlideRecord('cmdb_ci_file_system');

        vols.first();
        while (vols.next()) {
            var name            = vols.getValue('nwVolPhysicalName');
            var size       = new StorageDataSize(vols.getValueInt( 'nwVolSize' ), 'KB');
            var free_space = new StorageDataSize(vols.getValueInt( 'nwVolFree' ), 'KB');

            totalDiskSpace += size.getBytes();

            gr.initialize();
            gr.addQuery('provided_by', this.getCmdbCi());
            gr.addQuery('mount_point', name);
            gr.query();
            if (gr.next()) {
                gr.name = name;
                size.applyToStorageVolumeSize(gr);
                free_space.applyToStorageVolumeFreeSpace(gr);
                gr.update();
            } else {
                gr.provided_by = this.getCmdbCi();
                gr.name = name;
                size.applyToStorageVolumeSize(gr);
                free_space.applyToStorageVolumeFreeSpace(gr);
                gr.mount_point = name;
                gr.insert();
            }
        }
        var totalSize = new StorageDataSize(totalDiskSpace);
        current.disk_space = Math.round(totalSize.to(StorageDataSize.Units.GB)) || 0; //Need to convert to GB
    },

    processInstalledSoftwares: function(items) {
        var packages = [];

        items.first();
        while (items.next()) {
            var software = {};
                        
            var swObj = this.getSoftwareNameAndVersion(items.getValue('hrSWInstalledName'));

            software.name = swObj.name;
            software.version = swObj.version;

            packages.push(software);
        }

        this.addToRelatedList('cmdb_ci_spkg', packages, '', '');
    },

    processNLMprocesses: function(items) {
    new DiscoveryRunningProcessSensor({
        mapProcesses: function(result) {
            var procs = [];
    
                items.first();
                while (items.next()) {
                var name = items.getValue('hrSWRunName');
                var index = items.getValueInt('hrSWRunIndex');  
                    var path = items.getValue('hrSWRunPath');
                var procDef = {};

                procDef.pid = index;
                procDef.name = name;
                procDef.parameters = "";
                procDef.command = path;
                procDef.type = "netware";

                procs.push(procDef);
            }
            return procs;
        },
    
        type: "DiscoverySensor"
    });
    },

    getIPAddress: function(input) {
        if (input == "")
            return;

        var str = input.split(" ");
        str = str[0].split(":");
        return str[1];

    },

    getSoftwareNameAndVersion: function(input) {
        if (input == "")
            return;

        var parsed = input.split(" ");
          
        var versionFound = false;
        var sw = {}; 
        sw.version = ""; 
        sw.name = "";
        for (var i=1; i<parsed.length; i++) {
            if (versionFound && parsed[i] != "")
                sw.name += (parsed[i] + " ");
            if (parsed[i] != "" && !versionFound) {
                sw.version = parsed[i];
                versionFound = true;
            }  
        }
        return sw;
    },


    type: 'NetwareSensor'
});

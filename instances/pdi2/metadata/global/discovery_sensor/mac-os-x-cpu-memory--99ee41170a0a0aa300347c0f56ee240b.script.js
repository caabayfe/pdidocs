new DiscoverySensor({
    process: function(result) {
        if (gs.nil(result.output))
            return;

        this.parseOutput(result.output);
    },

    parseOutput: function(output) {
        var DMPU = new DiscoveryMacProfileUtils();
        var baseElements = DMPU.getBaseElement(output);
        var section1 = baseElements[0];
        var section2 = baseElements[1];

        this.processHardware(section1['_items'][0]);
        this.processMemoryModules(section2['_items'][0]['_items']);
    },

    processHardware: function(items) {
        current.cpu_type = items['cpu_type'];
        current.cpu_count = items['packages'];
        current.cpu_core_count = items['number_processors'];
        current.ram = new RoundingInterval("ram").getRoundedValue(this.getMacMemoryToMB(items['physical_memory']));
    },

    getMacCPU: function(speed) {
        var parts = speed.split(" ", 2);
        var num = parts[0];
        var factor = parts[1];

        if (factor.toLowerCase() == "ghz")
            return parseFloat(num)*1000;
        else
            return num;
    },

    getMacMemoryToMB: function(mem) {
        var parts = mem.split(" ", 2);
        var num = parts[0];
        var factor = parts[1];

        if (factor.toLowerCase() == "gb")
            return parseFloat(num)*1024;
        else
            return num;
    },
    
    processMemoryModules: function(items) {
        var modules = [];
        
        for (var i = 0; i < items.length; i++) {
            var entry       = items[i];
            var module      = {};
            var name        = (entry['_name']+'').split("/");
            var capacity    = entry['dimm_size'].split(" ");
            
            module.name             = entry['_name'];
            module.capacity         = (capacity[1] == "GB") ? capacity[0] * 1024 : capacity[0];
            module.bank_label       = name[0];
            module.speed            = entry['dimm_speed'].split(" ")[0];
            module.module_status    = entry['dimm_status'];
            module.type             = entry['dimm_type'];
            module.form_factor      = name[1].substring(0, name[1].length - 1);
            module.device_locator   = name[1];
            module.manufacturer     = entry['dimm_manufacturer'];
            module.part_number      = entry['dimm_part_number'];
            module.serial_number    = entry['dimm_serial_number'];
            
            modules.push(module);
        }
        
        this.addToRelatedList('cmdb_ci_memory_module', modules, 'cmdb_ci', 'name');
    },

    type: "DiscoverySensor"
});

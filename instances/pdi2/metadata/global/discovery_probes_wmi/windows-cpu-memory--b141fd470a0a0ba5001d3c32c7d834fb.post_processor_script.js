new ProbePostProcessor({
    /**
     * Runs the probe instance
     */    
    process : function() {  
		var processors = g_array_util.ensureArray(output.Win32_Processor);
        var Win32_Processor = processors[0];

        if (JSUtil.notNil(Win32_Processor.Name))
            current.cpu_name = Win32_Processor.Name;
        if (JSUtil.notNil(Win32_Processor.MaxClockSpeed))
            current.cpu_speed = Win32_Processor.MaxClockSpeed;

        if (JSUtil.notNil(Win32_Processor.Manufacturer))
		    current.cpu_type = Win32_Processor.Manufacturer;
        if (processors.length > 0)
            current.cpu_count = processors.length;
		
		var cpuCoreCount;
		var logicalProcessors;		
		cpuCoreCount = parseInt(Win32_Processor.NumberOfCores);
		logicalProcessors = parseInt(Win32_Processor.NumberOfLogicalProcessors);

        if (JSUtil.notNil(cpuCoreCount) && cpuCoreCount > 0) {
            current.cpu_core_count = cpuCoreCount;		
            if (JSUtil.notNil(logicalProcessors) && logicalProcessors > 0)
                current.cpu_core_thread = logicalProcessors/cpuCoreCount;
        }

        var mem_modules = g_array_util.ensureArray(output.Win32_PhysicalMemory);
        var moduleArray = [];
        var total_memory = 0;
        for (var i = 0; i < mem_modules.length; i++) {
            var Win32_PhysicalMemory = mem_modules[i];
            var module = {};
            
            module.name             = Win32_PhysicalMemory.Tag;
            module.bank_label       = Win32_PhysicalMemory.BankLabel;
            module.capacity         = parseFloat(Win32_PhysicalMemory.Capacity) / 1048576;
            module.data_width       = Win32_PhysicalMemory.DataWidth;
            module.form_factor      = this.getMemoryFormFactor(Win32_PhysicalMemory.FormFactor);
            module.device_locator   = Win32_PhysicalMemory.DeviceLocator;
            module.manufacturer     = Win32_PhysicalMemory.Manufacturer;
            module.part_number      = Win32_PhysicalMemory.PartNumber;
            module.serial_number    = Win32_PhysicalMemory.SerialNumber;
            module.speed            = Win32_PhysicalMemory.Speed;
            module.module_status    = Win32_PhysicalMemory.Status;
            module.total_width      = Win32_PhysicalMemory.TotalWidth;
            module.type             = this.getMemoryType(Win32_PhysicalMemory.MemoryType);
            module.type_detail      = this.getMemoryTypeDetail(Win32_PhysicalMemory.TypeDetail);
            
            total_memory += (parseFloat(Win32_PhysicalMemory.Capacity) / 1048576);
            moduleArray.push(module);
        }

        related_data.module_array = moduleArray;
        if (JSUtil.notNil(total_memory))
             current.ram = total_memory;
    },

    getMemoryFormFactor: function(key) {
        var ffArray = ['Unknown', 'Other', 'SIP', 'DIP',
                       'ZIP', 'SOJ', 'Proprietary', 'SIMM',
                       'DIMM', 'TSOP', 'PGA', 'RIMM',
                       'SODIMM', 'SRIMM', 'SMD', 'SSMP',
                       'QFP', 'TQFP', 'SOIC', 'LCC',
                       'PLCC', 'BGA', 'FFBGA', 'LGA'];
        return ffArray[key];
    },
    
    getMemoryType: function(key) {
        var mtArray = ['Unknown', 'Other', 'DRAM', 'Synchronous DRAM',
                       'Cache DRAM', 'EDO', 'EDRAM', 'VRAM',
                       'SRAM', 'RAM', 'ROM', 'Flash',
                       'EEPROM', 'FEPROM', 'EPROM', 'CDRAM', 
                       '3DRAM', 'SDRAM', 'SGRAM', 'RDRAM',
                       'DDR', 'DDR2', 'DDR3'];
        return mtArray[key];
    },
    
    getMemoryTypeDetail: function(key) {
        var tdHash = {1:'Reserved', 2:'Other', 4:'Unknown', 8:'Fast-paged',
                      16:'Static column', 32:'Pseudo-static', 64:'RAMBUS', 128:'Synchronous',
                      256:'CMOS', 512:'EDO', 1024:'Window DRAM', 2048:'Cache DRAM',
                      4096:'Nonvolatile'
                     };
        return tdHash[key];
    },
	
	type: "ProbePostProcessor"
});

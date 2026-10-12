new ProbePostProcessor({
    /**
     * Runs the probe instance
     */    
    process : function() {  
        var snm = new SerialNumberManager();
        if (JSUtil.notNil(output.Win32_ComputerSystemProduct.IdentifyingNumber))
            snm.add('system', output.Win32_ComputerSystemProduct.IdentifyingNumber);
        if (JSUtil.notNil(output.Win32_ComputerSystemProduct.UUID))
            snm.add('uuid', output.Win32_ComputerSystemProduct.UUID);
        if (JSUtil.notNil(output.Win32_SystemEnclosure.SerialNumber))
            snm.add('chassis', output.Win32_SystemEnclosure.SerialNumber);
        if (JSUtil.notNil(output.Win32_BIOS.SerialNumber))
            snm.add('bios', output.Win32_BIOS.SerialNumber);
        if (JSUtil.notNil(output.Win32_BaseBoard.SerialNumber))
            snm.add('baseboard', output.Win32_BaseBoard.SerialNumber);

        related_data.srlArr = snm.getSerialsForCIData();
        if (JSUtil.notNil(related_data.srlArr))
			related_data.serial_array = snm.getSerialArray();
        if (JSUtil.notNil(output.Win32_SystemEnclosure.ChassisTypes))
            related_data.chassis_type = this.getChassisType(output.Win32_SystemEnclosure.ChassisTypes);
    },

    getChassisType: function(index) {
        var types = ["Other", "Unknown", "Desktop", "Low Profile Desktop", "Pizza Box", 
                     "Mini Tower", "Tower", "Portable", "Laptop", "Notebook", "Hand Held", 
                     "Docking Station", "All in One", "Sub Notebook", "Space-Saving", 
                     "Lunch Box", "Main System Chassis", "Expansion Chassis", "SubChassis", 
                     "Bus Expansion Chassis", "Peripheral Chassis", "Storage Chassis", 
                     "Rack Mount Chassis", "Sealed-Case PC"];
        return types[index - 1];
    },
    
    type: "ProbePostProcessor"
});

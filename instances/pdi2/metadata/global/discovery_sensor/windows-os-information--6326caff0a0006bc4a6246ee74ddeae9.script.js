new DiscoverySensor({
    process: function(result) {
        this.parseResult(result);
    },

    parseResult: function(result) {
        current.os_version = result.Win32_OperatingSystem.Version;
        current.os_service_pack = result.Win32_OperatingSystem.CSDVersion;

        var man = result.Win32_ComputerSystem.Manufacturer;
        var mod = result.Win32_ComputerSystem.Model;

        var mm = MakeAndModelJS.fromNames(man, mod, "hardware");
        current.manufacturer = mm.getManufacturerSysID();
        current.model_id = mm.getModelNameSysID();
        current.short_description = result.Win32_OperatingSystem.Description;

        // Contrary to what the name implies, this returns *OS* address width, not CPU
        var processors = g_array_util.ensureArray(result.Win32_Processor);
        current.os_address_width = processors[0].AddressWidth;

        this.setAssignedTo(result);
    },

    setAssignedTo: function(result) {
        var userName = result.Win32_ComputerSystem.UserName;

        if (!gs.nil(userName)) {
            var x = userName.indexOf("\\");

            if (x > -1)
                userName = userName.substring(x + 1);

            var nameField = gs.getProperty('glide.discovery.assigned_user_match_field', "user_name");
            var userID = GlideUser.getSysId(nameField, userName);
            
            var atOverwrite = JSUtil.toBoolean(gs.getProperty('glide.wmi.assigned_to_always_overwrite', "true"));
            if (!atOverwrite)
                if (this._isAssignedToFilled())
                    return;
                
            current.assigned_to = userID;
        }
    },
    
    /*
     * Is the assigned_to field already populated? Return true if yes; false if no.
     */
    _isAssignedToFilled: function() {
        var compGr = this.getCmdbRecord();
        if (JSUtil.notNil(compGr.assigned_to + ''))
            return true;
        
        return false;
    },

    type: "DiscoverySensor"
});

new ProbePostProcessor({
	
	/**
	 * Runs the probe instance
	 */
	process : function() { 
		if (!(g_probe.haveWarning() || g_probe.haveError()) && !output.contains("System Information")) {
			g_probe.setError("Unable to parse output of dmidecode: " + output);
			related_data.warn = "Unable to parse output of dmidecode: " + output;
			return;
		}
		var modules = [];
		var handleRegex = /.*DMI type ([0-9]+).*/;
		related_data.modules = modules; 
		
		/**
		 *  Output for dmidecode will be in this format:
		 *    Handle 0x0107, DMI type 3, 6 bytes
		 *    Serial Number: VMware-42 08 4b d3 41 9e eb e3-5e fd 7e 7b 42 42 c0 66;
		 *    UUID: 42084BD3-419E-EBE3-5EFD-7E7B4242C066
		 *
		 *    Handle 0x0105, DMI type 23, 13 bytes
		 *    ...
		 *
		 *  The following code splits the output into blocks (around "Handle 0x").
		 *  A bit of optimization is done based on the fact that we only care about
		 *  DMI type 17.
		 */
		var blocks = output.split(/Handle\s0x/);
		for(var i = 0; i < blocks.length; i++) {
			var block = blocks[i];
			var mat = handleRegex.exec(block);
			if (mat) {
				currentBlock = parseInt(mat[1]);
				// we're only interested in block 17...
				if (currentBlock != 17)
					continue;
			}

			var lines = block.split(/\n/);

			for (var j = 0; j < lines.length; j++) {
				var line = lines[j];

				if (line == "Memory Device") {
					var module = this.parseModule(lines, j + 1);

					if (module != null)
						modules.push(module);
				}
			}
		}
	},
	
	parseModule: function(lines, start) {
        var module = {};
        
        for (var i = start; i < lines.length; i++) {
            var line = lines[i];
            
            if (line == "")
                return module;
            
            var parts = line.split(":");
            var name = parts[0].trim();
            var value = parts[1].trim();
            
            if (name == "Total Width")
                module.total_width = value.split(" ")[0];
            else if (name == "Data Width")
                module.data_width = value.split(" ")[0];
            else if (name == "Size") {
                if (value == "No Module Installed")
                    return null;
                var sizeComponents = value.split(" ");
                var unit = sizeComponents[1];
                if (unit && unit == "GB")
                    module.capacity = sizeComponents[0] * 1024;
                else
                    module.capacity = sizeComponents[0];
            } else if (name == "Form Factor")
                module.form_factor = (value.startsWith("FB-")) ? value.split("-")[1] : value;
            else if (name == "Locator") {
                module.device_locator = value;
                module.name = value;
            } else if (name == "Bank Locator")
                module.bank_label = (value == "Not Specified") ? null : value;
            else if (name == "Type")
                module.type = value.split(" ")[0];
            else if (name == "Type Detail")
                module.type_detail = value;
            else if (name == "Speed")
                module.speed = (value == "Unknown") ? null : value.split(" ")[0];
            else if (name == "Serial Number")
                module.serial_number = value;
            else if (name == "Part Number")
                module.part_number = value;
            else if (name == "Manufacturer")
                module.manufacturer = value;
            else if (name =="Product Name")
                module.model_id = value;
        }
        
        return module;
    },
   
    type: "ProbePostProcessor"
});

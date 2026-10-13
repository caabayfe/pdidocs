StringPolyfill;

new ProbePostProcessor({
	/**
	* The following functions convert parts of the ID into big-endian representation.
	* For more details, please read the following guide:
	* https://azure.microsoft.com/en-us/blog/accessing-and-using-azure-vm-unique-id/
	*/
	swap16: function(val) {
		return ((val & 0xFF) << 8)
		| ((val >> 8) & 0xFF);
	},
	
	swap32: function(val) {
		return ((val & 0xFF) << 24)
		| ((val & 0xFF00) << 8)
		| ((val >> 8) & 0xFF00)
		| ((val >> 24) & 0xFF);
	},
	
	/**
 	* Runs the probe instance
 	*/
	process : function() {
		if (!(g_probe.haveWarning() || g_probe.haveError()) && !output.contains("UUID: ")) {
			g_probe.setError("Unable to parse output of dmidecode: " + output);
			related_data.warn = "Unable to parse output of dmidecode: " + output;
			return;
		}
		
		if (JSUtil.nil(output))
			return;
		
		var uuidSerial = output.split(" ")[1].toLowerCase();
		var uuidSerialParts = uuidSerial.split("-");
		
		uuidSerialParts[2] = this.swap16(parseInt(uuidSerialParts[2],16)).toString(16).padStart(4, '0');
		uuidSerialParts[1] = this.swap16(parseInt(uuidSerialParts[1],16)).toString(16).padStart(4, '0');
		uuidSerialParts[0] = (this.swap32(parseInt(uuidSerialParts[0],16))>>> 0).toString(16).padStart(8, '0');
		
		uuidSerial = uuidSerialParts.join("-").toUpperCase();
		
		related_data.host_object_id = uuidSerial;
	},
	
	type: "ProbePostProcessor"
});

new DiscoveryJSONSensor({
	
	processJSON: function() {  
		var sccmManaged = gs.getProperty("glide.discovery.software_sccm_managed", "false");
		
		// Ideally it would be better to not launch the probe at all if SCCM is invovled. However, 
		// the determination for probe launching is currently done in the classification phase, 
		// so it's not possible to do the lookup at that time.
		if (sccmManaged != "false" && this._isSoftwareBySCCM()) {					
			var logger = this.getLogger();
			logger.info("Skipping software population because the CI is managed by SCCM");			
			return;
		}
		
		if (JSUtil.nil(related_data) || JSUtil.nil(related_data.packages))
			return;
		
		this.packages = related_data.packages;
		
		if (JSUtil.notNil(related_data.osPackage)) {
			var osPkgObj = this.getOSPackage(related_data.osPackage, related_data.caption, related_data.osVersion);
			this.packages.push(osPkgObj);
		}

		for (var i = 0; i < this.packages.length; i++)
			if (JSUtil.notNil(this.packages[i]))
				this.packages[i].install_date = this.asGlideDate(this.packages[i].install_date);
		
		var filteredPackages = InstallSoftwareFilter.filterWindowsSoftware(this.packages);		
		
		this.addToRelatedList('cmdb_ci_spkg', filteredPackages, '', '');
	},
	
	getOSPackage: function(osPackage, caption, osVersion) {
		osPackage.name = JSUtil.nil(caption) ? "" : "" + new WindowsOSNameHelper().formatWindowsOSName(caption);
		osPackage.vendor = "Microsoft";
		osPackage.version = JSUtil.nil(osVersion) ? "" : osVersion;
		return osPackage;
	},

	asGlideDate: function(date) {
		if (JSUtil.nil(date))
			return '';
			
		var glideDate = new GlideDateTime();
		var x = date.trim();
		var pattern = /^(\d{4})(\d{2})(\d{2}$)/; // yyyyMMdd
		var epochPattern = /^\d{10}$/; // epoch time, exp. 1466806646
		if (x.match(pattern)) {
			var formattedDate = x.replace(pattern, "$1-$2-$3 00:00:00");
			glideDate.setValue(formattedDate);
		} else if (x.match(epochPattern)) {
			glideDate.setNumericValue(x * 1000);
		} else 
			return '';

		return glideDate;
	},

	_isSoftwareBySCCM: function() {
		// See if this CI was ever populated by SCCM...
		var deviceCI = this.getCmdbRecord();		
		
		if (gs.nil(deviceCI))
			return false;
		
		var gr = new GlideRecord("sys_object_source");
		gr.addQuery("name", "IN", ["SCCM","SG-SCCM"]);
		gr.addQuery("target_table", deviceCI.sys_class_name);
		gr.addQuery("target_sys_id", deviceCI.sys_id);
		gr.query();
		
		return gr.hasNext();
	},
	
	type: "DiscoveryJSONSensor"
});

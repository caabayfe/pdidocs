var WindowsInstalledSoftware = Class.create();

WindowsInstalledSoftware.prototype = {
	process : function(output, related_data) {
		related_data.packages = [];

		var jsonPayload = JSON.parse(output);
		// Using hash to make sure we get no dups (by name + version).
		var softwareList = this.getAllPackages(jsonPayload, related_data);

		for (var sw in softwareList){
			// Special case for OS IDs
			if (sw === "osId:prodId:dProdId")
				related_data.osPackage = softwareList[sw];
			else
				related_data.packages.push(softwareList[sw]);
		}

		related_data.caption = jsonPayload.wmi.Win32_OperatingSystem.Caption;
		related_data.osVersion = jsonPayload.wmi.Win32_OperatingSystem.Version;
	},

	getAllPackages: function(payload, related_data) {
		var registryKeys = payload.registry;
		var softwareList = {};
		var productIds = {};
		var officeLicenses = {};

		for(var reg in registryKeys) {
			var pkg = registryKeys[reg];
			var pkgPath = pkg.Path;

			if (pkgPath.includes("\\Package_")){
				// Need to process hotfixes
				var kb = this.parseInstalledKBs(pkg);

				if (kb)
					softwareList[kb.key] = kb;
			}
			else if (pkgPath.includes("HKEY_LOCAL_MACHINE\\Software\\Microsoft\\Internet Explorer")){
				// Need to process IE details
				var iePackage = this.parseIEDetails(pkg);

				if (!JSUtil.nil(iePackage))
					softwareList["iePackage"] = iePackage;

				continue;
			}
			else if (pkgPath.includes("Adobe Acrobat") && pkgPath.includes("AVEntitlement")) {
				related_data.adobe_acrobat_edition = this.getValueFromPackage(pkg, "iEntitlementLevel");
			}
			else if(pkgPath.includes("HKEY_LOCAL_MACHINE/SOFTWARE/WOW6432Node/Microsoft/InetStp"))
			{
				var iisPackage = this.parseIISDetails(pkg);

				if(!JSUtil.nil(iisPackage))
					softwareList["iispackage"] = iisPackage;

				continue; 
			}
			else{
				if (pkgPath == "HKEY_LOCAL_MACHINE\\Software\\Microsoft\\Windows\\CurrentVersion" || pkgPath == "HKEY_LOCAL_MACHINE\\Software\\Microsoft\\Windows NT\\CurrentVersion"){
					// Need to process OSIDs

					var osId = this.parseOSIDs(pkg);

					if (!JSUtil.nil(osId)){
						softwareList["osId:prodId:dProdId"] = osId;
						// Only continue if this is OS IDs section - otherwise parse package.
						continue;
					}
				}
				else if (pkgPath.startsWith("HKEY_LOCAL_MACHINE\\Software\\Microsoft\\Office") || pkgPath.startsWith("HKEY_LOCAL_MACHINE\\Software\\Wow6432Node\\Microsoft\\Office")){
					// This is a Office!

					// Grabs the string after the last slash and removes curly brackets if there are any
					var officeUuidRegex = /.*\\\{?(.*?)\}?$/mgi;

					var prodId = pkg.ProductId;
					var dProdId = pkg.DigitalProductId;
					var uuid = pkg.Path;

					// Try and get the UUID from the path
					var uuidDetails = officeUuidRegex.exec(pkg.Path);
					if (uuidDetails && uuidDetails[1])
						uuid = uuidDetails[1];

					officeLicenses[uuid] = {};
					officeLicenses[uuid].productid = prodId;
					officeLicenses[uuid].digitalproductid = dProdId;
				}

				var softwareItem = this.parseSoftwareAndProduct(pkg, related_data);
				if (!JSUtil.nil(softwareItem)){
					if (JSUtil.nil(softwareList[softwareItem.uniqueName]) || softwareList[softwareItem.uniqueName] == null || softwareList[softwareItem.uniqueName] == undefined)
						softwareList[softwareItem.uniqueName] = softwareItem;
					else
						softwareList[softwareItem.uniqueName] = this.mergeJsonObjects(softwareList[softwareItem.uniqueName], softwareItem);

					if (softwareList[softwareItem.uniqueName] != null && !JSUtil.nil(softwareItem.msi_id) && !JSUtil.nil(officeLicenses[softwareItem.msiID]))
						softwareList[softwareItem.uniqueName].digital_product_id = officeLicenses[softwareItem.msiID].digitalproductid;
				}
			}
		}
		// Finish processing adobe acrobat if neccesary
		if (related_data.adobe_acrobat != null) {
			// If we found the edition in registry, apply that instead.
			var acrobat_pkg = related_data.adobe_acrobat;
			acrobat_pkg = this.setAttributeOnlyIfHasValue(acrobat_pkg, "edition", related_data.adobe_acrobat_edition);
			
			// Merge/Re-Add to payload as neccessary
			if (!softwareList[acrobat_pkg.uniqueName])
				softwareList[acrobat_pkg.uniqueName] = related_data.adobe_acrobat;
			else
				softwareList[acrobat_pkg.uniqueName] = this.mergeJsonObjects(softwareList[acrobat_pkg.uniqueName], acrobat_pkg);
			
			// cleanup related_data of the unneeded adobe properties
			delete related_data.adobe_acrobat;
			delete related_data.adobe_acrobat_edition;
		}
		return softwareList;
	},

	getValueFromPackage: function(pkg, attribute){
		return pkg[attribute] || '';
	},

	parseIEDetails: function (pkg){
		var svcVersion = pkg.svcVersion;
		var ver = pkg.Version;

		if (JSUtil.nil(svcVersion) && JSUtil.nil(ver))
			return;

		var iePackage = {};
		iePackage.name = "Internet Explorer";
		iePackage.vendor = "Microsoft";

		// Version should work for IE 4.0+. svcVersion is new to IE 10. 
		iePackage.version = svcVersion ? svcVersion : ver;

		return iePackage;
	},

	parseIISDetails: function (pkg){
		var iisPackage = {};
		iisPackage.name = this.getValueFromPackage(pkg,"SetupString");
		iisPackage.version = this.getValueFromPackage(pkg,"VersionString").replace(/[^0-9.]/g, '');
		iisPackage.vendor = "Microsoft";

		return iisPackage;
	},

	parseOSIDs: function (pkg){
		var prodId = pkg.ProductId;
		var dProdId = pkg.DigitalProductId;

		if (!JSUtil.nil(prodId) || !JSUtil.nil(dProdId)){
			return {
				product_id: prodId,
				digital_product_id: dProdId
			};
		}
	},

	parseInstalledKBs: function(pkg){
		var kbRegEx = /Package_.*?_(KB\d+).*?([\d\.]*)\./mgi;
		var installLoc = pkg.InstallLocation;
		var rollUpFixNameRegex = /KB\d+/i;
		var rollUpFixVerRegex = /~(\d+\.\d+\.\d+\.\d+)\.mum$/i;
		var installName = pkg.InstallName;

              /* Refer the below articles for more information on install date calculation
                  1. https://forum.bigfix.com/t/how-to-find-install-date-of-windows-patch-delpoyed-via-bigfix/19623/2
                  2. https://stackoverflow.com/questions/51547064/convert-18-digit-ldap-filetime-timestamps-to-human-readable-date
              */
        	var installTimeHigh = parseInt(pkg.InstallTimeHigh);
        	var installTimeLow = parseInt(pkg.InstallTimeLow);
        	var installDate = ((((installTimeHigh * 4294967296) + installTimeLow) / 10000000) - 11644473600);

		var kbDetails;
		var rollUpFixName;
		var rollUpFixVersion;
		var kbPrefix = "Hotfix";
		var rollUpPrefix = "RollUpFix";

		// Extract the KB number and Version using regex
		kbDetails = kbRegEx.exec(installName);
		rollUpFixName = rollUpFixNameRegex.exec(installLoc);
		rollUpFixVersion = rollUpFixVerRegex.exec(installName);
		var kb = {};
		if (kbDetails && kbDetails[1]){
			var key = kbDetails[1];
			kb.name = kbPrefix + " (" + key + ")";
			if (kbDetails[2])
				kb.version = kbDetails[2];
		}
		else if (rollUpFixName && rollUpFixName[0]){
			var key = rollUpFixName[0];
			kb.name = rollUpPrefix + " (" + key + ")";
			if (rollUpFixVersion && rollUpFixVersion[1])
				kb.version = rollUpFixVersion[1];
		}
		else {
			return;
		}
		kb.key = key;
		kb.package_name = key;
		kb.vendor = "Microsoft Corporation";
		kb.install_date = parseInt(installDate) + "";
		// Fixed sys_id for Unknown
		kb.manufacturer = "0e8b8e650a0a0b3b004f285ffbb1a4fc";
		return kb;
	},

	parseSoftwareAndProduct: function(pkg, related_data){
		var softwareItem = {};

		var displayName = this.getValueFromPackage(pkg, "DisplayName");
		var parentDisplayName = this.getValueFromPackage(pkg, "ParentDisplayName");
		var displayVersion = this.getValueFromPackage(pkg, "DisplayVersion");
		var publisher = this.getValueFromPackage(pkg, "Publisher");
		var uninstallString = this.getValueFromPackage(pkg, "UninstallString");
		var installDate = this.getValueFromPackage(pkg, "InstallDate");
		var msiID = this.parseMsiId(uninstallString);
		var pid = this.getValueFromPackage(pkg, "ProductID");
		var installLocation = this.getValueFromPackage(pkg, "InstallLocation");
		var validPID = true;
		if (pid == null || pid.length == 0 || pid.toLowerCase() == "none")
			validPID = false;

		if (JSUtil.nil(displayName) || displayName === "")
			return;

		var uniqueName = this.getUniqueName(displayName, displayVersion);

		softwareItem = {};
		softwareItem = this.setAttributeOnlyIfHasValue(softwareItem, "uniqueName", uniqueName);
		softwareItem = this.setAttributeOnlyIfHasValue(softwareItem, "name", displayName);
		softwareItem = this.setAttributeOnlyIfHasValue(softwareItem, "version", displayVersion);
		softwareItem = this.setAttributeOnlyIfHasValue(softwareItem, "vendor", publisher);
		softwareItem = this.setAttributeOnlyIfHasValue(softwareItem, "part_of", parentDisplayName);
		softwareItem = this.setAttributeOnlyIfHasValue(softwareItem, "uninstall_string", uninstallString);
		softwareItem = this.setAttributeOnlyIfHasValue(softwareItem, "install_date", installDate);
		softwareItem = this.setAttributeOnlyIfHasValue(softwareItem, "install_location", installLocation);

		if (validPID)
			softwareItem = this.setAttributeOnlyIfHasValue(softwareItem, "product_id", pid);

		if (msiID != null && msiID.length > 0 && msiID.toLowerCase() != "none" && msiID != "")
			softwareItem = this.setAttributeOnlyIfHasValue(softwareItem, "msi_id", msiID);
		
		if (/Acrobat/.test(displayName) && !JSUtil.nil(uninstallString) && (uninstallString.indexOf("{") >= 0) && (uninstallString.indexOf("}") >= 0)) {
			var editionString = uninstallString.split("{")[1];
			editionString = editionString.split("}")[0];
			if (!JSUtil.nil(editionString)) {
				var splitEdition = editionString.split("-");
				if (splitEdition.length >= 4)
					softwareItem = this.setAttributeOnlyIfHasValue(softwareItem, "edition", splitEdition[3]);
			}
			related_data.adobe_acrobat = softwareItem;
			return;
		}

		return softwareItem;
	},

	getUniqueName: function(name, version) {
		return name + " " + version;
	},

	setAttributeOnlyIfHasValue: function(obj, att, value){
		if (!JSUtil.nil(value) && value != null && value.length > 0 && value.toLowerCase() != "none" && value != "")
			obj[att] = value;

		return obj;
	},

	mergeJsonObjects: function(obj1, obj2){
		for (var key in obj2){
			if (!obj1.hasOwnProperty(key) || JSUtil.nil(obj1[key]) || obj1[key] == null || obj1[key].length == 0 || obj1[key].toLowerCase() == "none" || obj1[key] == "")
				obj1[key] = obj2[key];
		}

		return obj1;
	},

	parseMsiId: function(str) {
		var msiID = "";

		if (str && str.toLowerCase().indexOf("msiexec") > -1) {
			var start = str.indexOf("{");
			var finalString = str.substring(start+1);
			var end = finalString.indexOf("}");
			msiID = finalString.substring(0, end);
		}

		return msiID;
	},
	type: "WindowsInstalledSoftware"
};

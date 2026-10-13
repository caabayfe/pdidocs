/**
 * Process all CIM Probe query results for a CIM ID Sensor.
 * @param { name: [XMLObj(//cimqueryset/cimquery/result/instance)],.. } results
 * @param CimCIData cimdata The CI data of the device being identified.
 * @param CimIDSensor sensor This sensor wrapping this function.
 * @throws DiscoveryException On error
 */
function process(results, cimdata, sensor) {
	var i;
	if (results.computer.length === 0) {
		DiscoveryLogger.warn('ComputerSystem information not provided. Skipped CI.', 'CIM - SMI-S - Identity', sensor.getEccQueueId(), null);
		return;
	}
	var computer = results.computer[0];
	var computerName = computer.ElementName;
	if (!isComputerNameValid(computerName)) {
		computerName = computer.Name;
		computer.SerialNumber = computer.SerialNumber || computerName;
	}
	if (!isComputerNameValid(computerName)) {
		DiscoveryLogger.warn(
			'Computer name "' + computerName + '" is invalid. SMI-S Provider may lack connectivity to physical device. Skipped CI.', 'CIM - SMI-S - Identity',
			sensor.getEccQueueId(),
			null);
		return;
	}
	var firmware_version = ( computer.FirmwareVersion || cimdata.data.firmware_version );
	if (firmware_version && CimCIData.isValueValid(firmware_version))
		cimdata.data.firmware_version = firmware_version;
	cimdata.data.name = computerName;
	cimdata.data.cim_object_path = CimInstanceToken.parse(computer);
	cimdata.data._cimObjectName = computer.Name; // pre-eureka migration. remove in H release
	cimdata.data.short_description = computer.Description || '';
	if (!gs.nil(computer.SerialNumber))
		cimdata.addSerial(CimCIData.serialType.chassis, computer.SerialNumber);
	var nics = new CIRelatedList('cmdb_ci_network_adapter', 'cmdb_ci');
	cimdata.cidata.addRelatedList(nics);
	// descriptions and info are arrays
	var ipAddresses = [],
		ids = ensureArray(computer.IdentifyingDescriptions),
		oii = ensureArray(computer.OtherIdentifyingInfo);
	if (JSUtil.notNil(ids) && JSUtil.notNil(oii)) {
		for (i = 0; i < ids.length; i++) {
			if (ids[i].toLowerCase().indexOf('ipv4 address') > -1) {
				var ip = {};
				ip.ip_address = oii[i];
				ip.netmask = '255.255.255.0';
				ip.ip_version = 4;
				ipAddresses.push(ip);
			}
		}
	}
	var rap = ensureArray(results.remoteAccessPoints).concat(ensureArray(results.remoteAccessPointsv2));
	// Try to get IPs from remoteAccessPoints
	rap.forEach(
		function(ap) {
			var ai = ap.AccessInfo;
			addIpFromAccessPoint(ap.EMCIpAddress);  // EMC management IP
			if (ai) {
				// Sanity check to make sure we have an IP.  The regex
				// matches 4 groups of 1 to 3 digits separated by dots,
				// followed by a non-digit, e.g.: 10.11.129.201
				// Note that non IPs may match, e.g.: 999.999.999.999Not_a_valid_ip
				match = /((?:\d{1,3}\.){3}\d{1,3})(?:\D|$)/.exec(ai + '');
				if (match)
					addIpFromAccessPoint(match[1]);
			}
		});
	if (ipAddresses.length > 0) {
		var adapter = {};
		adapter.name = 'Adapter';
		adapter.ip_address = (ipAddresses.length > 0) ? ipAddresses[0].ip_address : null;
		adapter.ip_addresses = ipAddresses;
		adapter.netmask = '255.255.255.0';
		nics.addRec(adapter);
		cimdata.data.ip_address = adapter.ip_address;
	}
	var ips = [];
	for (i = 0; i < ipAddresses.length; i++)
		ips.push(ipAddresses[i].ip_address);
	sensor.triggerDnsProbe('CIM - DNS', ips, g_device && g_device.source);
	
	var version ;
	// We'll try to get all chassis values from any place we can find them.
	// The firmware version will also be derived based on the below priority
	getChassisValues(results.chassisPhysicalPackage);
	getChassisValues(results.chassis);
	getChassisValues(results.chassisPhysicalPackage.filter(function(chassis) { return chassis.PackageType == 3; }));

	// PRB1347608 : I have added psnt as serial number for storage server instead of chassis serial number because a
	// stoarge server can have multiple chassis and each chassis will have different serial number.
	// PSNT is unique for a storage server and it should be used instead chassis one
	var psntSerial = getPSNT(computer);
	if (!gs.nil(psntSerial)) {
		cimdata.addSerial(CimCIData.serialType.psnt, psntSerial);
		cimdata.data.serial_number = psntSerial;
	}
	
	// set firmware_version from above version if not found yet
	if (!cimdata.data.firmware_version && version && CimCIData.isValueValid(version))
		cimdata.data.firmware_version = version;
	
	if (!cimdata.data.firmware_version)
		getFirmwareVersion();
	
	var locationId = sensor.getLocationID();
	if (!gs.nil(locationId))
		cimdata.data.location = locationId;
	// Extract psnt form storage server/device
	function getPSNT(computer)
	{
		if (gs.nil(computer))
			return;
		if (!gs.nil(computer.OtherIdentifyingInfo) &&
			!gs.nil(computer.IdentifyingDescriptions)) {
			psntIndex = computer.OtherIdentifyingInfo.indexOf("Cluster PSNT Serial Number");
			if (psntIndex >= 0)
			return computer.IdentifyingDescriptions[psntIndex];
		}
	}
	function getChassisValues(chassises) {
		chassises && chassises.forEach(function(chassis) {
			
			if ('SerialNumber' in chassis)
				cimdata.addSerial(CimCIData.serialType.chassis, chassis.SerialNumber);
			
			if ('Manufacturer' in chassis || 'Model' in chassis)
				cimdata.setMakeAndModel(chassis.Manufacturer, chassis.Model);
			
			if ('PartNumber' in chassis)
				cimdata.addSerial(CimCIData.serialType.partNumber, chassis.PartNumber);
			
			if ('Version' in chassis && chassis.Version != null)
				version = chassis.Version;
		});
	}
	function ensureArray(a) {
		if (!a)
			return [ ];
		if (!(a instanceof Array))
			return [ a ];
		return a;
	}
	function addIpFromAccessPoint(ip) {
		if (validIp(ip, ipAddresses))
			ipAddresses.push({
				ip_address: ip,
				netmask: '255.255.255.0',
				ip_version: 4
			});
	}
	function validIp(ip, addresses) {
		if (!ip || ip.match(/^(?:0|127)/)) // ignore invalid and local IPs
			return false;
		// check for dupes
		for (var i = 0, n = addresses.length; i < n; ++i) {
			if (addresses[i].ip_address == ip)
				return false;
		}
		return true;
	}
	function getFirmwareVersion() {
		check(equals) || check(substring) || check(setIt);
		function check(fn) {
			return results.softwareIdentity.some(fn);
		}
		function equals(software) {
			if (software.InstanceID == computer.Name)
				return setIt(software);
		}
		function substring(software) {
			if (~software.indexOf(computer.Name))
				return setIt(software);
		}
		function setIt(software) {
			cimdata.data.firmware_version = software.VersionString;
			return true;
		}
	}
	function sha1(str) {
		return ''+Packages.org.apache.commons.codec.digest.DigestUtils.shaHex(str);
	}
	function isComputerNameValid(name) {
		return CimCIData.isValueValid(name);
	}
}

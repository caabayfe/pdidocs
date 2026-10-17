var DiscoveryHostUtils = Class.create();

/*
 * DEF0751438: Moved definition of this function to DiscoveryFunctions Script Include
 * so that it can be shared by different plugins without dependency
 */
DiscoveryHostUtils.getIpsForCi = function(ciSysId) {
	return new DiscoveryFunctions.getIpsForCi(ciSysId);
};

DiscoveryHostUtils.prototype = {
    initialize: function() {
    },
	
   /*
    * this is a place holder function called by service mapping in order
    * to find the sys_id of the host that should be used to discover the input
    * endpoint. Usually, the system will find the host by IP. However, there might
    * be special cases where the target host might be determined using some lookup
    * table or other means. if this function returns non null value, and the system
    * finds the host ID in the CMDB, this host will be used.
    */
    getHostForEndpoint: function(endpointId) {
        return null;
    },

	getOsFamily : function(computerSystem){
		var sysClassName = String(computerSystem.sys_class_name);
		var os = String(computerSystem.os);
		// sysClassName cannot be null. It can be an empty string or the string "undefined".
		// this bug is since Geneva. We are not fixing it at this time.
		if (sysClassName != null) {
			if (sysClassName == 'cmdb_ci_win_server')
				return 'WINDOWS';
			if (sysClassName == 'cmdb_ci_hyper_v_server')
				return 'WINDOWS';
			if (sysClassName == "cmdb_ci_unix_server")
				return 'UNIX';
			if (sysClassName == "cmdb_ci_solaris_server")
				return 'UNIX';
			if (sysClassName == "cmdb_ci_hpux_server")
				return 'UNIX';
			if (sysClassName == "cmdb_ci_aix_server")
				return 'UNIX';
			if (sysClassName == "cmdb_ci_linux_server")
				return 'UNIX';
			if (sysClassName == "cmdb_ci_ibm_zos_server")
				return 'UNIX';
			if (sysClassName == "cmdb_ci_computer") {
			    // os cannot be null. It can be an empty string or the string "undefined".
			    // this bug is since Geneva. We are not fixing it at this time.
				if (os != null) {
					if (os.indexOf('Windows') == 0)
						return 'WINDOWS';
					if (os.indexOf('Linux') == 0)
						return 'UNIX';
					if (os.indexOf('AIX') == 0)
						return 'UNIX';
					if (os.indexOf('Solaris') == 0)
						return 'UNIX';
					if (os.indexOf('HP/UX') == 0)
						return 'UNIX';
					if (os.indexOf('Mac') == 0)
						return 'UNIX';
				}
			}
			
			return 'PROPRIETARY';
		}
		
		return 'UNKNOWN';
	},
	
	getOsType : function(computerSystem){
		var sysClassName = String(computerSystem.sys_class_name);
		// sysClassName cannot be null. It can be an empty string or the string "undefined".
		// this bug is since Geneva. We are not fixing it at this time.
		if (sysClassName != null) {
			if (sysClassName == "cmdb_ci_solaris_server")
				return 'SOLARIS';
			if (sysClassName == "cmdb_ci_hpux_server")
				return 'HP_UX';
			if (sysClassName == "cmdb_ci_aix_server")
				return 'AIX';
			if (sysClassName == "cmdb_ci_linux_server")
				return 'LINUX';
			if (sysClassName == "cmdb_ci_lb_bigip")
				return 'F5_BIG_IP';
			if (sysClassName == "cmdb_ci_lb_netscaler")
				return 'CITRIX_NETSCALER';
			if (sysClassName == "cmdb_ci_lb_a10")
				return 'ADVANCED_CORE_OS';
			if (sysClassName == "cmdb_ci_lb_alteon")
				return 'ALTEON';
			if (sysClassName == "cmdb_ci_lb_ace")
				return 'CISCO_CSM';
			if (sysClassName == "cmdb_ci_lb_radware")
				return 'RADWARE';
			if (sysClassName == "cmdb_ci_ucs_equipment")
				return 'CISCO_UCS_MANAGER';
			if (sysClassName == "cmdb_ci_datapower_server")
				return 'DATAPOWER';
			if (sysClassName == "cmdb_ci_isam_server")
				return 'ISAM';
			if (sysClassName == "cmdb_ci_ibm_zos_server")
				return 'IBM_ZOS';
			if (sysClassName == "cmdb_ci_hyper_v_server")
				return 'HYPER_V';
		}
			
		var os = String(computerSystem.os);
		// os cannot be null. It can be an empty string or the string "undefined".
        // this bug is since Geneva. We are not fixing it at this time.
		if (os != null) {
			if (os.indexOf('Windows XP') == 0)
				return 'WINDOWS_XP';
			if (os.indexOf('Windows 2000') == 0)
				return 'WINDOWS_2000';
			if (os.indexOf('Windows 2003') == 0)
				return 'WINDOWS_2003';
			if (os.indexOf('Windows 2008') == 0)
				return 'WINDOWS_2008';
			if (os.indexOf('Windows 2012') == 0)
				return 'WINDOWS_2012';
			if (os.indexOf('Windows 2016') == 0)
				return 'WINDOWS_2016';
			if (os.indexOf('Windows 2019') == 0)
				return 'WINDOWS_2019';
			if (os.indexOf('Windows 7') == 0)
				return 'WINDOWS_7';
			if (os.indexOf('Linux') == 0)
				return 'LINUX';
			if (os.indexOf('AIX') == 0)
				return 'AIX';
			if (os.indexOf('Solaris') == 0)
				return 'SOLARIS';
			if (os.indexOf('HP/UX') == 0)
				return 'HP_UX';
			if (os.indexOf('Mac') == 0)
				return os;
			return 'PROPRIETARY';
		}
		return 'UNKNOWN';
	},
	
	getIpAddresses : function(computerSystem) {
		
		var ipMaskMap = {};
		var addIpAddress = function(ipAddr, mask) {
			if (ipAddr != null && ipAddr.length > 0) {
				var prevMask = ipMaskMap[ipAddr];
				if(prevMask == null)
					ipMaskMap[ipAddr] = mask;
			}
		};
		
		var addIpAddrs = function (host) {
			var grIpAddr = new GlideRecord('cmdb_ci_ip_address');

			grIpAddr.addQuery('nic.cmdb_ci', host.sys_id);
			grIpAddr.addQuery('nic.install_status', '!=', 100);
			grIpAddr.addQuery('install_status', '!=', 100);

			grIpAddr.query();
			while (grIpAddr.next()) {
   			    addIpAddress(String(grIpAddr.ip_address), String(grIpAddr.netmask));
			}
		};
		
		var addNicIpAddrs = function (host) {
			var adaptersGr = new GlideRecord("cmdb_ci_network_adapter");
			adaptersGr.addQuery("cmdb_ci", host.sys_id);
			adaptersGr.query();
			while (adaptersGr.next()) {
				addIpAddress(String(adaptersGr.ip_address), String(adaptersGr.netmask));
			}
		};
			
		var addLbIpAddrs = function (host) {
			var lbServiceGr = new GlideRecord("cmdb_ci_lb_service");
			lbServiceGr.addQuery("load_balancer", host.sys_id);
			lbServiceGr.query();
			
			while(lbServiceGr.next()) {
				addIpAddress(String(lbServiceGr.ip_address), null);	
			}
		};
		
		addIpAddress(String(computerSystem.ip_address), null);
		addIpAddrs(computerSystem);
		addNicIpAddrs(computerSystem);
		addLbIpAddrs(computerSystem);

		return ipMaskMap;
	},

	findHostByIp : function(ip, candidates){
		return null;
	},
	
	findHostByIp : function(ip){
		return null;
	},
	
	getManagementIp : function(hostId){
		return null;
	},
	
	getHypervisorAddress : function(hostId){
		return null;
	},

	getHostname : function(hostId){
		return null;
	},
	
	isHostActive : function (hostRecord) {
		if (hostRecord) {
			var hostId = hostRecord.getUniqueValue();
			var hostName = hostRecord.name;
			if (SNC.HostIdentificationUtil.isInactiveOperationalStatus(hostId, hostName, hostRecord.operational_status))
				return false;
			if (SNC.HostIdentificationUtil.isInactiveInstallStatus(hostId, hostName, hostRecord.install_status))
				return false;
			if (SNC.HostIdentificationUtil.isInvalidDiscoverySource(hostId, hostName, hostRecord.discovery_source))
				return false;
			return true;
		}
		return null;
	},

	checkIsValidGr: function(gr) {
        return global.JSUtil.toBoolean(gs.getProperty("sa_find_host_scripts.check_host_active.enabled", "true")) ? this.isHostActive(gr) : true;
    },

	type: 'DiscoveryHostUtils'
};

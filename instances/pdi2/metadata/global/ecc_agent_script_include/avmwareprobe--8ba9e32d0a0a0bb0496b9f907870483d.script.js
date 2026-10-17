/* jshint -W030 */

ms.include("VMWareIncludes");

var AVMWareProbe = Class.create(),
	getWWNString = Packages.com.service_now.mid.probe.VMWareProbe.getWWNString;

(function() {

var serviceInstance, navigator, serverConnection,
	commonTypes = {
		KeyValue: Packages.com.vmware.vim25.KeyValue,
		KeyAnyValue: Packages.com.vmware.vim25.KeyAnyValue,
		ArrayOfKeyValue: Packages.com.vmware.vim25.ArrayOfKeyValue,
		ArrayOfKeyAnyValue: Packages.com.vmware.vim25.ArrayOfKeyAnyValue,
		LicenseManagerEvaluationInfo: Packages.com.vmware.vim25.LicenseManagerEvaluationInfo,
		LicenseManagerLicenseInfo: Packages.com.vmware.vim25.LicenseManagerLicenseInfo
	},
	drsDataObjectTypes = [
		Packages.com.vmware.vim25.ClusterHostGroup,
		Packages.com.vmware.vim25.ClusterVmGroup,
		Packages.com.vmware.vim25.ClusterVmHostRuleInfo,
		Packages.com.vmware.vim25.ClusterAffinityRuleSpec,
		Packages.com.vmware.vim25.ClusterAntiAffinityRuleSpec
	],
	keyAnyValue = { key: 'key' },
	keyValue = { key: 'key', value: 'value' },
	commonTemplates = {
		KeyValue: keyValue,
		KeyAnyValue: keyAnyValue,
		ArrayOfKeyValue: [ keyValue ],
		ArrayOfKeyAnyValue: [ keyAnyValue ],
		LicenseManagerEvaluationInfo: { properties: [ keyAnyValue] },
		LicenseManagerLicenseInfo: {
			costUnit: 'costUnit',
			editionKey: 'edition',
			licenseKey: 'licenseKey',
			name: 'name',
			total: 'total',
			used: 'used',
			properties: [ keyAnyValue]
		}
	},
	vcenterTimeout, _this;

keyAnyValue.value = keyAnyValue;
	
AVMWareProbe.prototype = Object.extendsObject(AProbe, {

	fetchManagedObjects: fetchManagedObjects,
	getPropsForManagedObject: getPropsForManagedObject,
	getPropsForUnknownType: getPropsForUnknownType,
	getPropsForDynamicData: getPropsForDynamicData,
	getApplianceInfo: getApplianceInfo,
	getTagsForResources: getTagsForResources,
	
	IPAddress : Packages.com.snc.commons.networks.IPAddress,

    initialize : function(probe) {
        this.probe = probe;
        this.output = "";
        this.createOutputRecord = true;
		_this = this;
    },
    
    /**
     * Runs the probe instance
     */
    run : function() {
        this.init();
        
        // If we couldn't connect to the vCenter given, abort before even trying to run the probe code
        if (!this.serviceInstance) {
            this.cleanup();
            return;
        }
    
        // If something fails in the probe code and an unhandled exception is thrown, make sure we clean up
        try {
            this.process();
        } catch (ex) {
            ms.log(ex);
			ms.log(ex.stack);
            this.setError(ex);
        } finally {
            this.cleanup();
        }
    },
	
    
    /**
      * Attempts to initialize the service instance to allow the process method to do its work
      */
    init : function() {
        var source = this.getParameter(SOURCE);
        // If it doesn't appear to be a URL, generate one
        var host = (source.indexOf('https://') == -1) ? (this.IPAddress.fromString(source).isV4() ? "https://" + source : "https://[" + source +"]") : source;

		// Default to 10 seconds.  Login retry count is defaulted to 3, so by default
		// we could end up trying for 30 seconds per cred which seems sufficient but
		// not excessive.
		vcenterTimeout = parseInt(probe.getParameter('vcenter_timeout')) || 10000;
		
		/*
		*  Possible cases of the host
		*  - https://markit8dude
		*  - https://markit8dude:444
		*  - https://markit8dude/sdk
		*  - https://markit8dude:444/sdk
		*  If the venter port is specified, make sure it's used!
		*/		
		var vcenterPort = (this.hasParameter('vcenter_port')) ? this.getParameter('vcenter_port') : ""; 
		if (vcenterPort != '') { 
			if (host.indexOf('/sdk') > 0) //tentatively remove the /sdk if it exists
				host = host.replace('/sdk', ''); 						 						
			
			// if the host URL has 2 colons, it already has a port and we need to replace it 			
			var hostArr = host.split(':');
			if (hostArr.length == 3) { 								
				hostArr.pop();
				host = hostArr.join(':') + ":" + vcenterPort;
			} else {
				host = host + ":" + vcenterPort;
			}
		}
		
        this.vmHost = (host.indexOf('/sdk') == -1) ? host + "/sdk" : host;
        this.ignoreCert = this.getBooleanParameter(IGNORE_CERT, true);

		serviceInstance = this.serviceInstance = this._getServiceInstance();
		if (!serviceInstance)
			return;

		navigator = this.navigator = vim25.mo.InventoryNavigator(serviceInstance.getRootFolder());
		serverConnection = this.serverConnection = serviceInstance.getServerConnection();
    },
    
    /**
      * Abstract function to run the probe functionality - the derived probes should have a body for this
      */
    process : function() {
    },
    
    /**
     * Logs out of the ServiceInstance connected to vCenter and creates the output result records when
     * we weren't able to connect so the error that is set gets propagated properly
     */
    cleanup : function() {
        if (serverConnection)
            serverConnection.logout();

		// This shouldn't be necessary because I just logged out, but during testing I saw a lot of zombie
		// sessions.  The zombie sessions seemed to be caused by Microsoft System Center Operations Manager,
		// but it doesn't hurt for me to be as safe as possible.
		serviceInstance = this.serviceInstance = 0;
		navigator = this.navigator = 0;
		serverConnection = this.serverConnection = 0;
		vim25 = 0;
		vim = 0;

		if (this.createOutputRecord)
            this.createOutputResult(this.output);
	},
    
    /**
     * Attempts to obtain a ServiceInstance object using the given URL and credentials in the credentials
     * table.
     */
	_getServiceInstance : function() {
		var serviceInstance, url, credentials, gotInvalidLogin, gotNoPermission, gotReadTimeout, fixedCred,
			_this = this,
			loginRetryCount = this.loginRetryCount || 3;

		// Just to be safe clamp the retryCount to the range 1 to 10.
		loginRetryCount = Math.max(1, Math.min(10, loginRetryCount));

		try {
			url = new URL(this.vmHost);

			fixedCred = this.getParameter('fixed_credential_id');
			// Very occasionally we get invalid login errors when we shouldn't.  If we've gotten
			// past the datacenters probe then we know we had a valid credential, so it's probably
			// an error if we can no longer validate.  loginRetryCount will default to 3, so we're
			// going to retry 3 times before giving up.
			// I had originally planned to have the datacenters probe set loginRetryCount to 1 -
			// a failure there is much more likely to be legitimate.  But it is possible for that
			// failure to be incorrect and it doesn't cost much to retry.
			while (!serviceInstance && loginRetryCount--) {
				if (fixedCred) {
					credential = this.probe.getCredential(null, null, null);
					tryCredential(credential);
				} else {

					// Loop through VMWare credentials - InvalidLogin exception is thrown for failed logons, if it isn't one of those, throw it
					// so we don't end up looping over and over if we have some real error
					credentials = this.getCredentials("vmware");
					while (credentials.hasNext()) {
						var credential = credentials.next();
						if (tryCredential(credential))
							break;
					}
				}
			}
		} catch (ex) {
			this.setError("Unable to establish connection to " + this.vmHost + ": " + ex);
			return;
		}

		if (!serviceInstance) {
			if (gotInvalidLogin)
				this.setError('No credential would validate for ' + this.vmHost);
			else if (gotNoPermission)
				this.setError('No required permission(s) provided for the account credentials used to connect to ' + this.vmHost);
			else if (gotReadTimeout)
				this.setError('Timeout trying to read from ' + this.vmHost);
			else
				this.setError("Unable to establish connection to " + this.vmHost);
		}

		function tryCredential(credential) {
			try {
				serviceInstance = new vim25.mo.ServiceInstance(url, credential.getUsername(), credential.getPassword(),
															  _this.ignoreCert, vcenterTimeout, vcenterTimeout);
				credentials.worked(_this.getParameter("probe"));
				return true;
			} catch (ex) {
				if (ex instanceof vim25.InvalidLogin)
					gotInvalidLogin = true;

				if (ex instanceof vim25.NoPermission)
					gotNoPermission = true;

				// vCenter 5.5 changed the exception from InvalidLogin to RemoteException.  The 
				// exception includes the text below in the description, thus, we need to look 
				// for this exception as well in order to make sure we walk all the credentials.
				if (ex instanceof Packages.java.rmi.RemoteException)
					if ((ex + "").indexOf('exception:com.vmware.vim25.InvalidLogin') != -1) {
						gotInvalidLogin = true;
						return false;
					} else if ((ex + "").indexOf('exception:com.vmware.vim25.NoPermission') != -1) {
						gotNoPermission = true;
						return false;
					} else if ((ex + "").indexOf('java.net.SocketTimeoutException') != -1) {
						gotReadTimeout = true;
						return true; // No sense trying other credentials if we are getting timeouts
					}

				if (!(ex instanceof vim25.InvalidLogin) && !(ex instanceof vim25.SystemError) && !(ex instanceof vim25.NoPermission))
					throw ex;
			}
		}

		/*
		// This was useful when debugging the zombie session problem.
		var sessions = serviceInstance.getSessionManager().getSessionList();
		for (var i = 0; i < sessions.length; i++) {
			var session = sessions[i];
			ms.log('IP address: ' + session.getIpAddress() + ', login time: ' + session.getLoginTime().getTime().toString() + ', last active: ' + session.getLastActiveTime().getTime().toString());
		}
		*/

		return serviceInstance;
	},

    _findObjectByMORid: function(type, morid) {
        if (type == 'Datastore')
            return this._findDatacenterObjectByMORid('datastore', morid);
        else if (type == 'Network')
            return this._findDatacenterObjectByMORid('network', morid);
        
        var rootFolder = this.serviceInstance.getRootFolder();
        var objects = new vim25.mo.InventoryNavigator(rootFolder).searchManagedEntities(type);

        for (var i = 0; i < objects.length; i++) {
            var object = objects[i];

            if ('' + object.getMOR().val == morid)
                return object;
        }

        return null;
    },

    _findDatacenterObjectByMORid: function(type, morid) {
        var rootFolder = this.serviceInstance.getRootFolder();
        var datacenters = new vim25.mo.InventoryNavigator(rootFolder).searchManagedEntities('Datacenter');

        for (var i = 0; i < datacenters.length; i++) {
            var props = [type];
            var o = datacenters[i].getPropertiesByPaths(props);

            var objects = o.get(type);
            for (var j = 0; j < objects.length; j++) {
                var object = new vim25.mo.Network(this.serviceInstance.getServerConnection(), objects[j]);
                if ('' + object.getMOR().val == morid)
                    return object;
            }
        }

        return null;
    },
           
    type: "AVMWareProbe"
});

// Use vijava to fetch data for all objects of a given type from our vCenter.
/////////////////////////////////////////////////////////////////////////
function fetchManagedObjects(type, dataMap) {

	var i, o,
		propNames = Object.keys(dataMap),
		mos = navigator.searchManagedEntities(type),
		js = [ ];

	for (i = 0; i < mos.length; i++) {
		o = getPropsForManagedObject(mos[i], dataMap, propNames);
		js.push(o);
	}
	
	return js;
}

/*
 * Use vijava to fetch data for a single managed object from our vCenter.
 *
 * The data to fetch is driven by the 'dataMaps' parameter.  In the simplest
 * case, dataMaps is a single object that gets primitive values from vCenter:
 *   { name: 'hostName' }
 * This says to get 'name' from 'mo' and to store it in 'hostName'.  The return
 * would be something like:
 *   { hostName: 'ESX 1' }
 * Nested objects can be retrieved by passing nested objects:
 *   {
 *      name: 'hostName',
 *      summary: { memorySize: 'ram' }
 *   }
 * In this case you can't choose the name of 'summary' in the result.  You'll get
 * something like:
 *  {
 *     hostName: 'ESX 1',
 *     summary: { ram: 4096 }
 *  }
 * Note that 'memorySize' is an integer, so it's returned as a number.
 * The nested object can itself contain nested objects.  If the returned data is going
 * to be an array, the datamap has to indicate this:
 *  {
 *     name: 'hostName',
 *     summary: { memorySize: 'ram' },
 *     hardware: {
 *        cpuPkg: [ { vendor: 'cpu_manf' } ]
 *     }
 *  }
 * This says to fetch 'hardware' for a managed object, then to fetch 'cpuPkg'
 * from hardware.  cpuPkg will be an array of objects.  From each object, get
 * the cpu's vendor.  The result will be something like:
 *  {
 *     hostName: 'ESX 1',
 *     summary: { ram: 4096 },
 *     hardware: {
 *        cpuPkg: [ { cpu_manf: 'Intel' }, { cpu_manf: 'Intel' } ]
 *     }
 *  }
 * Managed objects (both the original object and any nested objects which are managed)
 * will have a member named 'mo' which will have the MOR for the object.  If you only want
 * this MOR, specify an empty object:
 *  {
 *     name: 'hostName',
 *     summary: { memorySize: 'ram' },
 *     hardware: {
 *        cpuPkg: [ { vendor: 'cpu_manf' } ]
 *     },
 *     vm: [ { } ]
 *  }
 * Normally this function will use the member name to call a vijava function to get the value, so:
 *    name: 'hostName'
 * causes a call to getName() on vijava.  Unfortunately a handful of boolean values require 'is'
 * instead of 'get'.  Because of this, the value in the map can be a function:
 *  {
 *     template: function(value, o) { o.template = !!value.isTemplate(); }
 *  }
 * 'value' is the vijava object (assumed to be a simple value).  'o' is the JS object to stick
 * the result on.
 * Sometimes an array will contain objects of multiple types.  You can simply ask for any data
 * that you want off any of the types:
 *  {
 *     hardware: {
 *        device: [ {
 *           capacityInKB: 'capacity',
 *           macAddress: 'mac'
 *        } ]
 *     }
 *  }
 * If the hardware device is a hard disk it will fetch capacity.  If it's a NIC it will
 * fetch the MAC address.
 *
 * @param mo         a ManagedObjectReference or MOR ID (string)
 * @param dataMap    The data to get, as defined above
 * @param type       Requred when 'mo' is a string.  The manged object type.
 */
function getPropsForManagedObject(mo, dataMap, type) {

	var props, mor, o,
		propNames = dataMap.propNames || Object.keys(dataMap);

	if (typeof mo == 'string') {
		mor = new vim25.ManagedObjectReference();
		mor.setType(type);
		mor.setVal(mo);
		mo = vim25.mo.util.MorUtil.createExactManagedEntity(this.serverConnection, mor);
	}

	mor = mo.getMOR();
	o = {
		mo: mo,
		type: '' + mor.getType(),
		morid: '' + mor.getVal()
	};

	dataMap.propNames = propNames;

	// This isn't working - we're marking objects that we don't get
	// any values for as missing.  We don't use the information currently,
	// so don't worry about it.
	//if (propNames.length)
	//	o.noSuchObject = true;

	try {
		props = getProps(propNames);
	} catch (e) {
		propNames.forEach(getProp);
	}

	return o;

	function getProp(propName) {
		if (propName == 'propNames')
			return;

		try {
			getProps([ propName ]);
		} catch (e) {
			ms.log('Unable to get ' + propName);
			ms.log(e.toString());
			ms.log(e.stack);
		}
	}

	function getProps(propNames) {
		// Stop when DataMap is just {"propNames":["propNames"]}
		if (Object.keys(dataMap).length == 1 && propNames == "propNames") {
			return;
		}
		props = mo.getPropertiesByPaths(propNames);
		propNames.forEach(getVal);
		//o.noSuchObject = undefined;
	}

	function getVal(key) {
		var prop,
			newName = dataMap[key];

		if (!newName)
			return;

		prop = props.get(key);
		getValue(prop, key, o, newName);
	}
}

/*
 * Like getPropsForManagedObject, except you don't have to know the
 * type of the managed object.  You can pass in multiple datamaps for
 * multiple types of managed objects:
 *   {
 *      ComputeResource: computeMap,
 *      ClusterComputeResource: clusterMap
 *   }
 */
function getPropsForUnknownType(mo, dataMaps) {

	var name,
		mor = mo.getMOR(),
		type = '' + mor.getType(),
		map = dataMaps[type];

	if (!map) {
		for (name in dataMaps) {
			if (typeof dataMaps[name] != 'string') {
				if (mo instanceof vim25.mo[name]) {
					dataMaps[type] = name;
					map = name;
				}
			}
		}
	}

	if (typeof map == 'string')
		map = dataMaps[map];

	return getPropsForManagedObject(mo, map);
}

//////////////////////////////////////////////////////////////////////////
function getPropsForDynamicData(dd, map) {
	var o = { temp: 0 };

	getValue(dd, 'temp', o, map);

	return o.temp;
}

// value is a vCenter or Java object
// key is the name of the vCenter object in its parent
// o is a JS object
// name is the name in the JS object, or an array, or an object
//////////////////////////////////////////////////////////////////////////
function getValue(value, key, o, name, parent) {

	var template, mo;

	try {
		if (typeof name == 'string')
			getSimpleValue();
		else if (name instanceof Array)
			o[key] = getArrayValue(value, name[0], name._filter);
		else if (typeof name == 'function')
			name(parent, o);
		else if (value)
			o[key] = getObjectValue(value, name);
	} catch (e) {
		ms.log('Unable to get ' + key + ' from ' + value);
		ms.log(e.toString());
		ms.log(e.stack);
	}

	function getSimpleValue() {

		if (value === null || value === undefined)
			return;

		if (key == 'NodeWorldWideName' || key == 'PortWorldWideName')
			o[name] = new Packages.java.lang.Long(value).toHexString(value);
		else if (value instanceof Packages.java.lang.String)
			o[name] = '' + value;
		else if (value instanceof Packages.java.lang.Integer ||
				 value instanceof Packages.java.lang.Short)
			o[name] = +value;
		else if (value instanceof Packages.java.lang.Long) {

			// WWNs are 64 bit ints in the VMWare API.  JavaScript can only
			// represent 53 bit integers, so WWNs can't be stored in a JS
			// number.  I hate this special handling in an otherwise generic
			// function, but we try to keep numbers as numbers and vCenter
			// uses Longs in places where the 53 bit limitation doesn't matter.
			if (key == 'NodeWorldWideName' || key == 'PortWorldWideName')
				o[name] = value.toHexString(value);
			else 
				o[name] = +value;
				
		} else if (value instanceof Packages.java.lang.Boolean) {
			value = '' + value;
			o[name] = false;
			if (value == 'true')
				o[name] = true;
		} else if (value instanceof vim25.ManagedObjectReference)
			o[name] = ('' + value.getVal()) || 'no mor available';
		else if (value.length == 1)
			getValue(value[0], key, o, name);
		// vim25.ManagedEntityStatus and vim25.DrsBehavior are both enumerations of string
		// values.  For some reason ManagedEntityStatus gets the correct value without
		// forcing conversion to a string. I'd prefer to simply always convert values of
		// an unknown type to a string but I'm afraid of what it might break.
		else if (value instanceof vim25.DrsBehavior || value instanceof vim25.HostSystemConnectionState || value instanceof vim25.HostSystemPowerState)
			o[name] = value + '';
		else
			o[name] = value;
	}

	function getObjectValue(obj, template) {
		var mo, o, name, dest, member, commonTemplate, format;

		try {
			if (obj instanceof vim25.ManagedObjectReference) {
				mo = new vim25.mo.ManagedEntity(serverConnection, obj);
				o = getPropsForManagedObject(mo, template);
			} else if (obj instanceof Packages.java.lang.String)
				return '' + obj;
			else if (obj instanceof Packages.java.lang.Integer ||
						 value instanceof Packages.java.lang.Short ||
					     value instanceof Packages.java.lang.Long)
					return +obj;
			else if (obj instanceof Packages.java.util.GregorianCalendar) {

				// Constant values from https://docs.oracle.com/javase/7/docs/api/constant-values.html#java.util.Calendar.ALL_STYLES
				// 1 = YEAR, 2 = MONTH, 5 = DAY_OF_MONTH, 10 = HOUR, 12 = MINUTE, 13 = SECOND
				format = [ 1, '-', 2, '-', 5, 'T', 10, ':', 12, ':', 13, 'Z' ];
				format.forEach(
					function(fmt, idx) {
						var val;
						if (typeof fmt == 'number') {
							val = obj.get(fmt);
							if (fmt == 2)   // Month is 0 based - add 1 to get what people expect
								val++;
							if (fmt == 1)
								format[idx] = val;  // Don't add leading 0s to year
							else
								format[idx] = ('0' + val).substr(-2);   // Add leading 0s to all other numbers
						}
					});
				return format.join('');
			}
			else {
				for (name in commonTypes) {
					if (obj instanceof commonTypes[name])
						template = commonTemplates[name];
				}

				if (template instanceof Array)
					return getArrayValue(obj, template);

				o = { };
				
				for (var drsObjectType in drsDataObjectTypes) {
					if(obj instanceof drsDataObjectTypes[drsObjectType]) {
						o['parent'] = '' + obj;
						break;
					}
				}
				
				if (typeof template == 'object') {
					for (name in template) {
						dest = template[name];
						member = obj['get' + capitalize(name)]();
						getValue(member, name, o, dest, obj);
					}
				}
			}
		} catch (e) {
			ms.log('Unable to get ' + template + ' from ' + obj);
			ms.log(e.toString());
			ms.log(e.stack);
		}

		return o;

		function capitalize(s) { return s[0].toUpperCase() + s.substr(1); }
	}

	function getArrayValue(obj, template, filter) {
		var i, o,
			a = [ ];

		for (i = 0; obj && (i < obj.length); i++) {
			o = getObjectValue(obj[i], template);
			if (!filter || filter(obj[i], o))
				a.push(o);
		}

		return a;
	}
}


    // This function retrieves the vCenter appliance information.
    //////////////////////////////////////////////////////////////////////////////////////

function getApplianceInfo() {
	var response;
	var responseObj;
	var postMethod;
	var sessionKey;
	var headers = {
		'Content-Type': 'application/json',
		'Accept': 'application/json'
	};
	var source = probe.getParameter('source');
	var postMethodType = 'POST';
	var getMethodType = 'GET';
	var getApplianceInfovCenterURL = this.IPAddress.fromString(source).isV4() ? 'https://' + source + '/rest/appliance/networking' : 'https://[' + source + ']/rest/appliance/networking'; 
	var GlideHTTPClient = Packages.com.glide.communications.HTTPClient;
	var httpClient = new GlideHTTPClient();

        /*
        	In order to get the appliance information, first we've to establish a session with the
        	respctive vCenter in order to make further calls to it
        	URL: https:// {vCenter IP} /apiexplorer/#/session_

        	Below method makes a REST call to the VMWare for creating a session and returns
        	the response. Below is the sample output:
        	///////////////////////////////////////////////////////////////////////////////
        		{
        			"response": { "status":200,"value":"bba9433e467d08d8593f21b566e18360" }
        		}
        	///////////////////////////////////////////////////////////////////////////////
        */

	response = setUpvCenterSession(httpClient, source);
	if(response.status == "200")
        	sessionKey = response.value;

        if (!sessionKey)
            return {
                error: 'vCenter Message: ' + response
            };
        headers['vmware-api-session-id'] = sessionKey;

        responseObj = triggerRESTCall(httpClient, getApplianceInfovCenterURL, getMethodType, headers);

        if (responseObj.hasOwnProperty('error'))
            return {
                error: 'vCenter Message: ' + responseObj.error
            };

        return responseObj;

    }

// This function retrieves the tags information for the provided set of mor ids.
//////////////////////////////////////////////////////////////////////////////////////
// INPUT: [ "vm-2323", "vm-1324", "vm-865" ]
//
// OUTPUT:
//		[
//			{
//				"vm_mor_id": "vm-4564",		//mor_id of the vm
//				"key": "Dev_lab",			//tag category name
//				"value": "User",			//tag name
//				"source": "tags"
//			}
//		]
//////////////////////////////////////////////////////////////////////////////////////
function getTagsForResources(morIDs) {

	var body;
	var response;
	var responseObj;
	var postMethod;
	var sessionKey;
	var bodyContent = {};
	var outputToProbe = [];
	var tagsDatamap = {
						taggedVMs: [],
						resourceInfo: {},
						tagsInfo: {},
						tagCategoryInfo: {}
					};
	var uniqueTags = [];
	var uniqueCategories = [];
	var headers = {
		'Content-Type': 'application/json',
		'Accept': 'application/json'
	};
	var source = probe.getParameter('source');
	var postMethodType = 'POST';
	var getMethodType = 'GET';
	var getTagInfovCenterURL = this.IPAddress.fromString(source).isV4() ? 'https://'+ source +'/rest/com/vmware/cis/tagging/tag/id:' : 'https://['+ source +']/rest/com/vmware/cis/tagging/tag/id:';
	var getTagCategoryInfovCenterURL = this.IPAddress.fromString(source).isV4() ? 'https://'+ source +'/rest/com/vmware/cis/tagging/category/id:' : 'https://['+ source +']/rest/com/vmware/cis/tagging/category/id:';
	var getTagsForVMsvCenterURL = this.IPAddress.fromString(source).isV4() ? 'https://'+ source +'/rest/com/vmware/cis/tagging/tag-association?~action=list-attached-tags-on-objects' : 'https://['+ source +']/rest/com/vmware/cis/tagging/tag-association?~action=list-attached-tags-on-objects';
	var resourceMorIDs = JSON.parse(morIDs);
	var GlideHTTPClient = Packages.com.glide.communications.HTTPClient;
	var httpClient = new GlideHTTPClient();

        /*
        	In order to get the tags information, first we've to establish a session with the
        	respctive vCenter in order to make further calls to it
        	URL: https:// {vCenter IP} /apiexplorer/#/session_

        	Below method makes a REST call to the VMWare for creating a session and returns
        	the response. Below is the sample output:
        	///////////////////////////////////////////////////////////////////////////////
        		{
        			"response": { "status":200,"value":"bba9433e467d08d8593f21b566e18360" }
        		}
        	///////////////////////////////////////////////////////////////////////////////
        */

	response = setUpvCenterSession(httpClient, source);
	if(response.status == "200")
        	sessionKey = response.value;

	// If no credentials worked then we return the response with the error message
	if (!sessionKey)
		return { error: 'vCenter Message: ' + response };

	// Setting the sessionKey to the header variable in order to use it in further REST calls
	headers['vmware-api-session-id'] = sessionKey;

	/*
		Once the session key is received, we now trigger a REST call to fetch the tags used for
		the list of resources provided by using the list of mor ids passed.

		Below is the sample output:
		///////////////////////////////////////////////////////////////////////////////
			{
				"response": [
						{
							"tag_ids":[
								"urn:vmomi:InventoryServiceTag:22c1d0af-84f0-4b5a-a412-58ead2dc04c5:GLOBAL",
								"urn:vmomi:InventoryServiceTag:7b5419c6-4a60-4e83-a89b-c3a896424d41:GLOBAL"
							],
							"object_id":{
								"id":"vm-4564",
								"type":"VirtualMachine"
							}
						},
						{
							"tag_ids":[
								"urn:vmomi:InventoryServiceTag:c75576d3-2cea-4dd5-9875-ea602d83b7ad:GLOBAL"
							],
							"object_id":{
								"id":"vm-5228",
								"type":"VirtualMachine"
							}
						}
					]
			}
		///////////////////////////////////////////////////////////////////////////////
	*/
	//Build the body content for making the REST call
	bodyContent.object_ids = resourceMorIDs.map(function(id) { return { id: id.morid, type: id.type }; });

	body = {
		content: JSON.stringify(bodyContent),
		type: 'application/json',
		charSet: 'UTF-8'
	};

        responseObj = triggerRESTCall(httpClient, getTagsForVMsvCenterURL, postMethodType, headers, body);

	if (responseObj.hasOwnProperty('error'))
		return { error: 'vCenter Message: ' + responseObj.error };

	uniqueTags = extractUniqueTagIDs(responseObj.response);

	/*
		For the list of associated tags, below we discover further information about the
		tag categories, tags and build a data map that is further used to refine the data

		Sample data for "tagsDatamap" variable is
		///////////////////////////////////////////////////////////////////////////////
			{
				"taggedVMs":[
					"vm-4564"
				],
				"resourceInfo":{
					"vm-4564":[
						"urn:vmomi:InventoryServiceTag:22c1d0af-84f0-4b5a-a412-58ead2dc04c5:GLOBAL",
						"urn:vmomi:InventoryServiceTag:7b5419c6-4a60-4e83-a89b-c3a896424d41:GLOBAL"
					]
				},
				"tagsInfo":{
					"urn:vmomi:InventoryServiceTag:22c1d0af-84f0-4b5a-a412-58ead2dc04c5:GLOBAL":{
								"name":"User",
								"categoryID":"urn:vmomi:InventoryServiceCategory:6ac3d15f-807b-4081-a1bf-89209bc1c7ed:GLOBAL"
					},
					"urn:vmomi:InventoryServiceTag:7b5419c6-4a60-4e83-a89b-c3a896424d41:GLOBAL":{
								"name":"Dev_app",
								"categoryID":"urn:vmomi:InventoryServiceCategory:6ac3d15f-807b-4081-a1bf-89209bc1c7ed:GLOBAL"
					}
				},
			   "tagCategoryInfo":{
					   "urn:vmomi:InventoryServiceCategory:6ac3d15f-807b-4081-a1bf-89209bc1c7ed:GLOBAL":"Dev_lab"
				}
			}
		///////////////////////////////////////////////////////////////////////////////
	*/
	responseObj = responseObj.response;
	responseObj.forEach(function(obj){
		tagsDatamap.taggedVMs.push(obj.object_id.id);
		tagsDatamap.resourceInfo[obj.object_id.id] = obj.tag_ids;
	});

	//Getting the Information for each tag
	uniqueTags.forEach(function(tagId){
		var tagCategoryID;
		/*
			Trigger the REST call to retrieve the information about a tag when tag id is provided

			Below is the sample output:
			///////////////////////////////////////////////////////////////////////////////
				{
					"response":{
							"category_id":"urn:vmomi:InventoryServiceCategory:6ac3d15f-807b-4081-a1bf-89209bc1c7ed:GLOBAL",
							"name":"User",
							"description":"System Administrator",
							"id":"urn:vmomi:InventoryServiceTag:22c1d0af-84f0-4b5a-a412-58ead2dc04c5:GLOBAL",
							"used_by":[]
					}
				}
			///////////////////////////////////////////////////////////////////////////////
		*/
            responseObj = triggerRESTCall(httpClient, (getTagInfovCenterURL + tagId), getMethodType, headers);

		if (responseObj.hasOwnProperty('response')) {

			//Extracting the Category ID to fetch their information
			response = responseObj.response;
			tagCategoryID = response.category_id;

			//Adding Tags and it's information to the 'tagsDatamap' variable
			tagsDatamap.tagsInfo[response.id] = {
				name: response.name,
				categoryID: tagCategoryID
			};

			if (uniqueCategories.indexOf(tagCategoryID) == -1)
				uniqueCategories.push(tagCategoryID);
		}
	});

	uniqueCategories.forEach(function(categoryId){
		/*
			Trigger the REST call to retrieve the information about a tag category when category id is provided

			Below is the sample output:
			///////////////////////////////////////////////////////////////////////////////
				{
					"response":{
							"associable_types":[],
							"name":"Dev_lab",
							"description":"",
							"id":"urn:vmomi:InventoryServiceCategory:6ac3d15f-807b-4081-a1bf-89209bc1c7ed:GLOBAL",
							"used_by":[],
							"cardinality":"MULTIPLE"
					}
				}
			///////////////////////////////////////////////////////////////////////////////
		*/
            responseObj = triggerRESTCall(httpClient, (getTagCategoryInfovCenterURL + categoryId), getMethodType, headers);

		if (responseObj.hasOwnProperty('response')) {

			//Adding category and it's name to the 'tagsDatamap' variable
			response = responseObj.response;
			tagsDatamap.tagCategoryInfo[response.id] = response.name;

		}
	});

	/*
		Once "tagsDatamap" is constructed with all the data, we build a result to pass back to
		the probe

		Below is the sample output:
		///////////////////////////////////////////////////////////////////////////////
			[
				{
					"morid": "vm-4564",		//mor_id of the vm
					"key": "Dev_lab",			//tag category name
					"value": "User",			//tag name
					"tag": "Tags"
				}
			]
		///////////////////////////////////////////////////////////////////////////////
	*/

	tagsDatamap.taggedVMs.forEach(function(mor_id){
		var categoryID = '';
		var tags = tagsDatamap.resourceInfo[mor_id];
		for (var i in tags) {
				categoryID = tagsDatamap.tagsInfo[tags[i]].categoryID;
				outputToProbe.push({
					morid: mor_id,
					key: tagsDatamap.tagCategoryInfo[categoryID],
					value: tagsDatamap.tagsInfo[tags[i]].name,
					tag: 'Tags'
				});
		}
	});

	return { cmdb_key_value: outputToProbe };

        ///////////////////////////////////////////////////////////////////////////////
        function extractUniqueTagIDs(tagsInfoList) {
            var tagObj = {};
            tagsInfoList.forEach(function(obj) {
                for (var i in obj.tag_ids)
                    tagObj[obj.tag_ids[i]] = 1;
            });

            return Object.keys(tagObj);
        }
    }

    // Generic API for making the REST Call
    ///////////////////////////////////////////////////////////////////////////////
function triggerRESTCall(httpClient, url, methodType, headers, body) {
        var method;
        var GetMethod = Packages.org.apache.commons.httpclient.methods.GetMethod;
        var PostMethod = Packages.org.apache.commons.httpclient.methods.PostMethod;
        var StringRequestEntity = Packages.org.apache.commons.httpclient.methods.StringRequestEntity;

	if (methodType == 'GET')
		method = new GetMethod(url);
	else if (methodType == 'POST') {
		method = new PostMethod(url);
		method.setRequestEntity( new StringRequestEntity(body.content, body.type, body.charSet) );
	}

	for (var i in headers)
		method.setHeader(i, headers[i]);

        try {
		var status = (httpClient.executeMethod(method)) + '';
		var response = JSON.parse(method.getResponseBodyAsString());

		if (status != '200') {
			ms.log(status + ':' + JSON.stringify(response).substring(0, 10000));
			return { error: status + ': Unable to process the request' };
		}

		return { response: response.value };
	} catch(ex) {
		return { error : (ex.getMessage && ex.getMessage() || ex) + '' };
	}
    }


    //Below method makes a REST call to the VMWare for creating a session and returns the response.
    ///////////////////////////////////////////////////////////////////////////////

function setUpvCenterSession(httpClient, source) {
        var IPAddress = Packages.com.snc.commons.networks.IPAddress;
        var status;
        var response;
        var getSessionvCenterURL = IPAddress.fromString(source).isV4() ? 'https://' + source + '/rest/com/vmware/cis/session' : 'https://[' + source + ']/rest/com/vmware/cis/session';
        var credentials = _this.getCredentials("vmware");
        var PostMethod = Packages.org.apache.commons.httpclient.methods.PostMethod;
        var sessionAPIHeader = 'ServiceNow Discovery';

	while (credentials.hasNext() && (status != '200')) {
		var credential = credentials.next();
		postMethod = new PostMethod(getSessionvCenterURL);
		postMethod.setHeader('vmware-use-header-authn', sessionAPIHeader);
		httpClient.setBasicAuth(credential.getUsername(), credential.getPassword());

		try {
			status = (httpClient.executeMethod(postMethod)) + '';
			response = JSON.parse(postMethod.getResponseBodyAsString());

			if (status == '200') {
				response.status = status;
				return response;
		    } else
			response = (response.value.hasOwnProperty('messages') && response.value.messages[0].hasOwnProperty('default_message')) ?
			response.value.messages[0].default_message : 'Session cannot be established';

		} catch (ex) {
			if (typeof ex == 'object')
				response = ex.getMessage() || ex + '';
			else if (typeof ex == 'string' && ex.length)
				response = ex;
			else
				response = 'Session cannot be established';
		}
        }
        return response;

}})();

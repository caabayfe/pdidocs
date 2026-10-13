// Discovery

/**
 *
 * @author Aleck.Lin aleck.lin@service-now.com
 */

var DiscoveryAPDVersionSensor = Class.create();

DiscoveryAPDVersionSensor.prototype = Object.extendsObject(DiscoveryAPDSensor, {

    start: function(result) {
        this.cidata = this.ciData.getData();

        this.fileType = result.config["@type"];
        if (!this._isFileType("version"))
            return;
        
		this.versionResult = result;
		
        var envResultXML = this.getParameter("envResult");
		var xh = new XMLHelper();
		this.envResult = xh.toObject(XMLUtilJS.unescapeForXMLText("<specs>"+envResultXML+"</specs>"));
		
        this.ciData = new CIData(); // Initiate the ciData object for the application
        this.cidata = this.ciData.getData();
		
		this.enObj = {};

		this.processXML();
		this.processApplication();
		this.processEnv();
    },

    /*
     * Process the XML files
     */
    processXML: function() {		
		try {
			// Get the environment information
			this.enObj.version = this.envResult.config["@version"];
			this.enObj.label = this.envResult.config.environment.label;
			this.enObj.description = this.envResult.config.environment.description;
			this.enObj.ownership = this.envResult.config.environment.ownership;
			
			// Get app info from the env xml
			this.cidata.application_name = this.envResult.config["@application"];
			this.cidata.system  = this.envResult.config["@system"];
			this.cidata.business_service = this.envResult.config.environment.business_service;
		} catch (e) {
			gs.error("Exception while accessing envResult, Exception: " + e);
		}		

		this.cidata.services_provided = [];
		this.cidata.services_consumed = [];
		try {
	        this.cidata.services_provided = g_array_util.ensureArray(this.envResult.config.environment.subservices.subservices_provided.subservice);            
			this.cidata.services_consumed = g_array_util.ensureArray(this.envResult.config.environment.subservices.subservices_consumed.subservice);

		} catch (e) {
			// print out issues with the no subservice?
		}		
			
		try {
			// Get app info from the version xml		
			this.cidata.version = this.versionResult.config["@version"];
			this.cidata.application_name = this.versionResult.config["@application"];		
			this.cidata.label = this.versionResult.config.version.label;
			this.cidata.description = this.versionResult.config.version.description;
			this.cidata.ownership = this.versionResult.config.version.ownership;
		} catch (e) {
			gs.error("Exception while accessing versionResult, Exception: " + e);
		}		
        
		var srvsProvided = [];
		var srvsConsumed = [];
		try {
	        srvsProvided = g_array_util.ensureArray(this.versionResult.config.version.subservices.subservices_provided.subservice);            
	        srvsConsumed = g_array_util.ensureArray(this.versionResult.config.version.subservices.subservices_consumed.subservice);
		} catch (e) {
			// print out issues with the no subservice?
		}
		
		// Combine to the subservices
		this.cidata.services_provided = new ArrayUtil().concat(this.cidata.services_provided, srvsProvided);
		this.cidata.services_consumed = new ArrayUtil().concat(this.cidata.services_consumed, srvsConsumed);
	},
	
    /*
     * Process the environment...
     */
    processApplication: function() {
        this.systemCI = this._findSystemCI();
        this.cidata.systemCI = this.systemCI.sys_id;
        if (JSUtil.nil(this.systemCI))
            return;   

        // enforce that the application name cannot be empty?
        var dcaGr = this._classifyApplication();
        // If we did not classify an application, log the name of the application and abort
        if (JSUtil.nil(dcaGr)) {
            DiscoveryLogger.warn("Unable to classify application: " +  this.cidata.application_name, 'DiscoveryADEnvSensor', this.getEccQueueId());    
            return;
        }

        this.processCustom(dcaGr, this.versionResult, this.envResult);
        this.applicationGr = this.findOrCreateApplication(dcaGr);
        this.processAppToSystemRelation(dcaGr);
       
        this.processPartOfService();
        this.processServicesProvided();
        this.processServicesConsumed();
    },    
	
	processEnv: function() {	
		var gre = this._findCIEnvironment();				
		gre.short_description = this.enObj.description;
		gre.version = this.enObj.version;		
		
		// Based on specs, version ownership will be environment ownership if environment ownership is non-existent
		var ownership = this.enObj.ownership;
		if (JSUtil.nil(ownership))
			ownership = this.cidata.ownership;
			
		if (JSUtil.notNil(ownership)) {
			var grg = new GlideRecord("sys_user_group");
			grg.addQuery("name", ownership);
			grg.query();
			if (grg.next())
			gre.support_group = grg.sys_id + '';
		}
		
		gre.update();
    },    
	
	_findCIEnvironment: function() {
		var gre = new GlideRecord("cmdb_ci_environment");
		
		// Find the existing envronment tie to the CI
		var grec = new GlideRecord("cmdb_environment_to_ci");
		grec.addQuery("ci", this.applicationGr.sys_id);
		grec.query();
		if (grec.next()) {
			gre.get(grec.environment + '');
			
			return gre;
		}
		
		// If we didnt find an existing one tied to the CI, then let's find/create an environment and tie it to the CI.
        gre.initailize();
		gre.addQuery("name", this.enObj.label);
		gre.query();
		if (!gre.next()) {
			gre.initialize();
			gre.name = this.enObj.label;
			gre.insert();
		}		
		
		grec.initalize();
		grec.ci = this.applicationGr.sys_id;
		grec.environment = gre.sys_id;
		grec.insert();
		
		return gre;
	},

    _findSystemCI: function() {
        if (JSUtil.nil(this.cidata.system))
            return this.getCmdbRecord();

        var gr = new GlideRecord("cmdb_ci_hardware");
        gr.addQuery("name", this.cidata.system);
        gr.query();
        if (gr.next())
            return gr;
        
        // IF a system is specified, but we're unable to find it, then we just log it
        DiscoveryLogger.warn("Unable to find the host system (" + this.cidata.system + ") for application: " +  this.cidata.application_name, 'Discovery', this.getEccQueueId());    
        return;
    },

    _classifyApplication: function() { 
        var classificationMap = DiscoveryClassification.loadClassifications("discovery_classy_appl");
        var appl = this._buildApplObject();

        var dc = new DiscoveryClassification(this.getEccQueueRecord(), classificationMap);
        if (!dc.find("discovery_classy_proc", appl))
            return;

        var classyName = '' + dc.getClassificationRecord().getValue('name');
        if (gs.getProperty('glide.discovery.debug.classification') == 'true')
            gs.log("*********** The application is classified as " + classyName + " *******************" );

        return dc.getClassificationRecord();
    },

    _buildApplObject: function() {
        //Add name field to what we expose...
        this.cidata['name'] = this.cidata.application_name;
        
        return this.cidata;
    },

    findOrCreateApplication: function(dcaGr) { 
        var matcher = new DiscoveryApplicationDiscoMatcher(this.ciData, dcaGr);
        var gr = matcher.match();

        if (matcher.isNewCI()) {      
			this.isNewCI = true;
            DiscoveryLogger.info("Created application " + this._buildURL(gr.name, gr.sys_class_name, gr.sys_id) + " (" + gr.sys_class_name + ")", 'DiscoveryADSensor', this.getEccQueueId(), this.systemCI.sys_id);
		}

        this.cidata.sys_id = gr.sys_id +'';
        return gr;
    },
    
    processAppToSystemRelation: function(dcaGr) {
        var rtgr = new GlideRecord("cmdb_rel_type");
        if (rtgr.get(dcaGr.getValue("relation_type")))
            g_disco_functions.createRelationshipIfNotExists(this.applicationGr.sys_id, this.systemCI.sys_id, rtgr.name);        
    },	

  type: "DiscoveryAPDVersionSensor"
});

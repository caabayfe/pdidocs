// Discovery

/**
 *
 * @author Aleck.Lin aleck.lin@service-now.com
 */

var DiscoveryAPDSensor = Class.create();

DiscoveryAPDSensor.prototype = Object.extendsObject(DiscoverySensor, {

    process: function(result) {
        if (!this.hasValidContent(result)) {
            this.setTriggerProbes(false);
            return;
        }

        var processedResult = this.processResult(result);
        this.start(processedResult);
    },

    hasValidContent: function(result) {
        // Check for at least result has something...
        if (JSUtil.nil(result))
            return false;

        // IF output exists (which implies unix-based result), but it has no xml header, then no good...
        if (JSUtil.notNil(result.output) && result.output.indexOf("<?xml") == -1) {
			DiscoveryLogger.warn("Unable to process the APD file content because of bad XML", 'DiscoveryAPDSensor', this.getEccQueueId(), null);
            return false;
		}

        return true;
    },

    _isFileType: function(type) { 
        if (this.fileType == type)
            return true;
                 
        DiscoveryLogger.warn("Incorrect xml file type " + type , 'DiscoveryAPDSensor', this.getEccQueueId(), null);
        return false;
    },

	/*
	 *  turn xml into javascript object
     */
    processResult: function(result) {
	    // If there's no <output> tag, that should mean there's no need to parse.
	    if (JSUtil.nil(result.output))
		   return result;
	   
        var xh = new XMLHelper(); 
        xh.setTrim(true);
        return xh.toObject(XMLUtilJS.unescapeForXMLText(result.output));
    },

    processCustom: function(dcaGr, versionResult, envResult) {
        var script = dcaGr.getValue('script');

        if (JSUtil.nil(script)) 
            return;

        if (script.indexOf("function") == -1)
            return;

	    try {
        	var classyScript = eval( '(' + script + ')' );  // get the on classification script into a variable...
	        classyScript(versionResult, envResult, this.ciData, DiscoveryLogger, this);  // execute the script...        
		} catch (e) {
		    var errMsg = 'Error in evaluating script for ' + dcaGr.getValue('name') + ': ' + e;
            DiscoveryLogger.error(errMsg, 'DiscoveryAPDSensor', this.getEccQueueId(), null);
		}
    },
    
    processPartOfService: function() {
        if (JSUtil.nil(this.cidata.business_service))
            return;
        
        var relationship = "Depends on::Used by";
        var bsgr = this._findService(this.cidata.business_service);
        if (JSUtil.nil(bsgr)) {
            bsgr = this._createService(this.cidata.business_service);
            var relID = g_disco_functions.createRelationship(bsgr.sys_id, this.applicationGr.sys_id, relationship);
            this._logCreationServiceAndRelationship(bsgr, relID, relationship);
            
            return;
        }
            
        if (JSUtil.notNil(g_disco_functions.relationshipExists(bsgr.sys_id, this.applicationGr.sys_id, relationship)))
            return;
        
        var relID = g_disco_functions.createRelationship(bsgr.sys_id, this.applicationGr.sys_id, relationship);
        this._logSerivceAndAppRelationship(bsgr, relID, relationship);            
    },

    processServicesProvided: function() {
        var relationship = "Provided by::Provides";
        
        for (var i=0; i<this.cidata.services_provided.length; i++) {
            if (JSUtil.nil(this.cidata.services_provided[i]))
                continue;
            
            this._processApplicationProcessor(this.cidata.services_provided[i], relationship, "provide");
        }
    },

    processServicesConsumed: function() {
        var relationship = "Consumes::Consumed by";
        
        for (var i=0; i<this.cidata.services_consumed.length; i++) {
            if (JSUtil.nil(this.cidata.services_consumed[i]))
                continue;

            this._processApplicationProcessor(this.cidata.services_consumed[i], relationship, "consume");
        }    
    },

    _processApplicationProcessor: function(serviceName, relationship, type) {
        var relID;
        var bsgr = this._findService(serviceName);
        if (JSUtil.nil(bsgr)) {
            bsgr = this._createService(serviceName);
            
            if (type == "provide")
                relID = g_disco_functions.createRelationship(bsgr.sys_id, this.applicationGr.sys_id, relationship);
            else
                relID = g_disco_functions.createRelationship(this.applicationGr.sys_id, bsgr.sys_id, relationship);
            
            this._logCreationServiceAndRelationship(bsgr, relID, relationship);
            
            return;
        }
           
        if (type == "provide") 
            relgr = g_disco_functions.relationshipExists(bsgr.sys_id, this.applicationGr.sys_id, relationship);
        else
            relgr = g_disco_functions.relationshipExists(this.applicationGr.sys_id, bsgr.sys_id, relationship);
                        
        if (JSUtil.notNil(relgr))
            return;

		/*
		*  In the inception of APD, the relationship on the BSM was built backwards, so we need to check to see if there's any sign
		*  of old pattern of relatinoships. If there was, then we delete it and recreate a new one with the correct directionality. 
		*
		*  This following section of code should be removed by the time we stop supporting the Dublin release. In other words, there are no more 
		*  customer on a build before the Dublin release.
		*/
		/***** Beginning section of code to fix old relationship patern ******/		
        var old_p_relationship = "Provides::Provided by";     
        var old_c_relationship = "Consumed by::Consumes";		
        if (type == "provide") 
            relgr = g_disco_functions.relationshipExists(this.applicationGr.sys_id, bsgr.sys_id, old_p_relationship);
        else
            relgr = g_disco_functions.relationshipExists(bsgr.sys_id, this.applicationGr.sys_id, old_c_relationship);
		
		if (JSUtil.notNil(relgr)) {
			gs.log("***** Deleteing old relationship... parent:" + relgr.parent.name + " child:" + relgr.child.name + " sysid:" + relgr.sys_id );
			relgr.deleteRecord();
		}
		/***** end section of code to fix old relationship patern ******/
		
        if (type == "provide") 
            relID = g_disco_functions.createRelationship(bsgr.sys_id, this.applicationGr.sys_id, relationship);
        else
            relID = g_disco_functions.createRelationship(this.applicationGr.sys_id, bsgr.sys_id, relationship);
        
        this._logSerivceAndAppRelationship(bsgr, relID, relationship);
            
    },
    
    _findService: function(name) {
        var gr = new GlideRecord("cmdb_ci_service");
        gr.addQuery("name", name);
        gr.query();
        if (gr.next())
            return gr;

        return;
    },
    
    _createService: function(name) {
        var gr = new GlideRecord("cmdb_ci_service");
        gr.name = name;
        gr.insert();
        
        return gr;
    },
    
    _logCreationServiceAndRelationship: function(bsgr, relID, relationship) {
        var bsClass = bsgr.sys_class_name;
        var appClass = this.applicationGr.sys_class_name;
        
        DiscoveryLogger.info("Created " + this._buildURL(bsgr.name, bsClass, bsgr.sys_id) + " (" + bsClass + ") and its " + this._buildURL("relationship", "cmdb_rel_ci", relID) + " (" + relationship + ") to " + this._buildURL(this.applicationGr.name, appClass, this.applicationGr.sys_id) + " (" + appClass + ")", 'DiscoveryAPDSensor', this.getEccQueueId(), this.systemCI.sys_id);
    },
    
    _logSerivceAndAppRelationship: function(bsgr, relID, relationship) {
        var bsClass = bsgr.sys_class_name;
        var appClass = this.applicationGr.sys_class_name;
        
        DiscoveryLogger.info("Created " + this._buildURL("relationship", "cmdb_rel_ci", relID) + " (" + relationship + ") from " + this._buildURL(bsgr.name, bsClass, bsgr.sys_id) + " (" + bsClass + ") to " + this._buildURL(this.applicationGr.name, appClass, this.applicationGr.sys_id) + " (" + appClass + ")", 'DiscoveryAPDSensor', this.getEccQueueId(), this.systemCI.sys_id);
    },
    
    _buildURL: function(display, table, sysID) {
        return "[code]<a title='" + display + "' class='linked' href='" + table + ".do?sysparm_query=sys_id=" + sysID + "'>" + display + "</a>[/code]";
    },
    
    
  type: "DiscoveryAPDSensor"
});

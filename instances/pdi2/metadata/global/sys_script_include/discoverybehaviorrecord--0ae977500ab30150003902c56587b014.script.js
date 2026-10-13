// Discovery class

/**
 * Encapsulates the notion of a Discovery Behavior.  Instances where isValid() returns true have the 
 * following properties initialized:
 * 
 * sysID:         sys_id of the job record
 * name:          name of this instance
 * functionality: a JavaScript Array of DiscoveryFunctionality instances associated with this instance
 * 
 * Tom Dilatush tom.dilatush@service-now.com
 */
var DiscoveryBehaviorRecord = Class.create();

DiscoveryBehaviorRecord.prototype = Object.extend(new AbstractDBObject(), {
    /*
     * Initialize this instance using the given source, which must be either a MIDServer instance, a GlideRecord
     * for a behavior,  or a string sysID of a behavior record.  If the source is a MIDServer instance, then a simple 
     * synthetic behavior is created, with the "All" Discovery Functionality and the given MIDServer.  If the source 
     * is a sysID or a GlideRecord, then the behavior is loaded from the database.
     */
    initialize: function(source, discover) {
        // see if we've even got a record here...
        this.valid = false;
        if (source instanceof MIDServer) {
            this.valid = true;
            this.name = 'Synthetic Basic';
            this.sysID = '0';
            this.functionality = [];
            this.functionality.push(DiscoveryFunctionality.getSyntheticBasic(source, discover));
            return;
        }
        var gr = this._getRecord(source, 'discovery_behavior');
        if (!gr)
            return;
            
        // we've got a real job record, so record our information...
        this.valid = true;
        this.sysID = gr.getValue( 'sys_id' );
        this.name  = gr.getValue( 'name'   );
        
        // now resolve all our references...
        this.functionality = DiscoveryFunctionality.getForBehavior(this);
    },
    
    firstPhase: function() {
        return (this.functionality.length > 0) ? this.functionality[0].phase : null;
    },
    
    nextPhase: function(lastPhase) {
        for (var i = 0; i < this.functionality.length; i++) {
            var phase = this.functionality[i].phase;
            if (phase > lastPhase)
                return phase;
        }
        return null;
    },
    
    getPhase: function(phase) {
        result = [];
        for (var i = 0; i < this.functionality.length; i++) {
            var functionality = this.functionality[i];
            if (phase == functionality.phase)
                result.push(functionality);
        }
        return result;
    },
    
    /*
     * Returns a hashmap of information from this behavior if we can find a port probe that probes the given service name 
     * and for which the functionality criteria are met with the given left-hand values and right-hand values.  Returns null 
     * if no such port probe exists.
     * 
     * result:    the ShazzamResult instance for the device being processed
     * scanner:   the ShazzamScanner instance for the scanner being processed
     * phase:     the current phase of the behavior
     * midServer: the MIDServer instance for the MID server whose Shazzam results are being processed
     * status:    the DiscoveryStatus instance for the current discovery
     * returns:   a hashmap with the following properties, or null if none
     *     behavior:                the DiscoveryBehaviorRecord instance containing the service found
     *     functionality:           the DiscoveryFunctionality instance containing the service found
     *     functionalityDefinition: the DiscoveryFunctionalityDefinition instance containing the service found
     *     portProbe:               the DiscoveryPortProbe instance containing the service found
     *     service:                 the IPService instance found
     */
    getStuffForResult: function(result, scanner, phase, midServer, status) {
		// if the phase is null we are on the first run and scratchpad has not been created yet
		if (phase == null)
			phase = this.firstPhase();

        // get our left-hand and right-hand value hashmaps ready...
        var lh = {};
        var rh = {};
        if (result.domainName) {
            lh['win_domain'] = result.domainName.toLowerCase();
            lh['mid_server'] = ('' + midServer.name).toLowerCase();
        }
        if (midServer.windowsDomain)
            rh['mid_win_domain'] = midServer.windowsDomain.toLowerCase();
            
        // iterate through all the functionality in this behavior...
        for (var i = 0; i < this.functionality.length; i++) {
            var func = this.functionality[i];
            
            // if it's not in the phase we're looking for, move along...
            if ((phase - 0) != func.phase)
                continue;
                
            // if we can find a match for our service and criteria in this functionality, we've got a winner...
            var stuff = func.getStuffForServiceName(scanner.service, lh, rh, scanner.name);
            if (stuff)
                return stuff;
        }
        return null;
    },
    
    /*
     * Returns an array of objects, each of which has the following properties:
     * midServer:  the MIDServer instance for which services exist
     * portProbes: a hashmap of DiscoveryPortProbe instances (by name) needed for this MID server
     */
    getPortProbesForPhase: function(phase, status) {
        var dLogger = new DiscoveryLogger(status);
        var funcs = this.getPhase(phase);
        var result = [];
        var rec = null;
        for (var i = 0; i < funcs.length; i++) {
            var func = funcs[i];
            if ((result.length == 0) || (rec.midServer.sysID != func.midServer.sysID)) {
                rec = {};
                rec['midServer'] = func.midServer;
                rec['portProbes'] = {};
                result.push(rec);
            }
            var pps = func.functionality.portProbes;
            var deactivatedProbes = []; 
            for (var ppi = 0; ppi < pps.length; ppi++) {
                var pp = pps[ppi];
                
                // skip this port probe if it's not active or not right for the kind of discovery we're doing...
                if (! pp.active) { 
                  deactivatedProbes.push(pp.name); 
                  continue; 
                } 
                
                if (!( 
                       (pp.discoverCIs && status.discoverCIs()) || 
                       (pp.discoverIPs && status.discoverIPs()) ||
                       (pp.discoverCIs && status.discoverNets())
                    ))
                    continue;
                    
                var ipss = pp.services;
                rec.portProbes[pp.name] = pp;
            }
            if (deactivatedProbes.length > 0) 
               dLogger.info('Skipping deactivated port probes: ' + 
                            deactivatedProbes.toString(), 'ShazzamLaunch', null, null); 
        }
        return result;
    },
    
    type: "DiscoveryBehaviorRecord"
});

// Discovery class

/**
 * Encapsulates the notion of a Discovery Functionality record.  Instances where isValid() returns true have the following
 * properties initialized:
 *
 * sysID:         sys_id of the Discovery Status record
 * phase:         phase number of this instance
 * active:        active flag
 * matchCriteria: matchCriteria for this functionality ("Any" or "All")
 * midServer:     first instance of MIDServer associated with this instance
 * midServers:    a JavaScript array of MIDServer instances associated with this instance
 * functionality: instance of DiscoveryFunctionalityDefinition associated with this instance
 * behavior:      instance of DiscoveryBehavior associated with this instance
 * criteria:      a JavaScript Array of DiscoveryFunctionalityCriterion instances associated with this instance
 *
 * Tom Dilatush tom.dilatush@service-now.com
 */
var DiscoveryFunctionality = Class.create();

/*
 * Returns a JavaScript array of DiscoveryFunctionality instances related to the given behavior.
 *
 * behavior: a DiscoveryBehaviorRecord instance
 * returns:  a JavaScript array of DiscoveryFunctionality instances
 */
DiscoveryFunctionality.getForBehavior = function(behavior) {
    var result = [];
    var gr = new GlideRecord('discovery_functionality');
    gr.addQuery('behavior', behavior.sysID);
    gr.orderBy('phase');
    gr.query();
    while (gr.next()) {
        var df = new DiscoveryFunctionality(gr, behavior);
        if (df.isValid() && df.active)
            result.push(df);
    }
    return result;
}

/*
 * Returns a JavaScript array of one synthetic DiscoveryFunctionality instance, for the given MID server.
 *
 * behavior: a MIDServer instance
 * discover: what kind of discovery ('IPs', 'CIs', or 'Nets')
 * returns:  a JavaScript array of DiscoveryFunctionality instances
 */
DiscoveryFunctionality.getSyntheticBasic = function(midServer, discover) {
    var netFuncName = gs.getProperty('glide.discovery.network_discovery.functionality');
    if (netFuncName == null)
        netFuncName = 'SNMP only';
    var funcName = (discover == 'Nets') ? netFuncName : 'All';
    var result = new DiscoveryFunctionality();
    result.valid = true;
    result.sysID = '0';
    result.phase = 1;
    result.active = true;
    result.matchCriteria = 'Any';
    result.midServer = midServer;
    result.midServers = [];
    result.midServers.push(midServer);
    result.functionality = DiscoveryFunctionalityDefinition.getNamed(funcName);
    return result;
}

DiscoveryFunctionality.prototype = Object.extend(new AbstractDBObject(), {
    /*
     * Initializes this instance using the source, which must be either a GlideRecord or a sysID.
     * The optional behavior parameter will be used to resolve the behavior reference if its sysID matches the reference.
     */
    initialize: function(source, behavior) {
        this.valid = false;
        var gr = this._getRecord(source, 'discovery_functionality');
        if (!gr)
            return;

        // everything's cool, so save our values...
        this.valid = true;
        this.sysID         = gr.getValue( 'sys_id'         );
        this.phase         = gr.getValue( 'phase'          ) - 0;  // force to integer...
        this.active        = JSUtil.getBooleanValue( gr, 'active' );
        this.matchCriteria = gr.getValue( 'match_criteria' );

        // and resolve our references...
        this.midServer = null;
        var midServersList = gr.mid_servers.getGlideList().getValues();  // returns an ArrayList of ecc_agent sys_ids...

        this.midServers = [];
		var midServerIds = [];

        for (var i = 0; i < midServersList.size(); i++) {
			var mid = new MIDServer(midServersList.get(i));
			
			if (gs.getProperty('glide.ecc_agent.validated.override') + '' != 'true') {
				// mid.isValid() refers to AbstractDBObject.isValid() which does not check mid validated state
				if (!mid.isValid() || mid.validated + '' != 'true')
					continue;
			}

			this.midServers.push(mid);
			midServerIds.push(midServersList.get(i));
		}

		// select a random good mid server from the mid_servers list
		var midSelector = new SNC.MidSelector();
		this.midServer = new MIDServer(midSelector.selectBestMidFromList(midServerIds));

        this.functionality = new DiscoveryFunctionalityDefinition( gr.getValue( 'functionality' ) );
        var behaviorID = gr.getValue( 'behavior' );
        if (behavior && (behavior.sysID == behaviorID))
            this.behavior = behavior;
        else
            this.behavior  = new DiscoveryBehaviorRecord(behaviorID);
        this.criteria = DiscoveryFunctionalityCriterion.getForFunctionality(this);
    },

    /*
     * Returns a hashmap of information from this functionality if we can find a port probe that probes the given service name
     * and for which the functionality criteria are met with the given left-hand values and right-hand values.  Returns null
     * if no such port probe exists.
     *
     * name:    the name of the service for which a port probe is desired
     * lh:      a hashmap of left-hand criteria values (e.g., "win_domain"="service-now.com")
     * rh:      a hashmap of right-hand criteria values (e.g., "mid_win_domain"="bogus.com")
     * returns: a hashmap with the following properties, or null if none
     *     behavior:                the DiscoveryBehaviorRecord instance containing the service found
     *     functionality:           the DiscoveryFunctionality instance containing the service found
     *     functionalityDefinition: the DiscoveryFunctionalityDefinition instance containing the service found
     *     portProbe:               the DiscoveryPortProbe instance containing the service found
     *     service:                 the IPService instance found
     *     scannerName:             the name of the scanner
     */
    getStuffForServiceName: function(name, lh, rh, scannerName) {
        var funcDef = this.functionality;

        // iterate through the port probes in this functionality definition...
        for (var pi = 0; pi < funcDef.portProbes.length; pi++) {
            var pp = funcDef.portProbes[pi];

            // if we have a scanner name only check services valid for port probes using the scanner
            if (scannerName != null && pp.scanner != scannerName)
                continue;

            // iterate through the services in this port probe...
            for (var si = 0; si < pp.services.length; si++) {
                var svc = pp.services[si];

                // if the name matches the service we want, and the criteria are met, bingo!
                if (name == svc.name && this.evaluateCriteria(lh, rh)) {
                    var stuff = {};
                    stuff[ 'behavior'               ] = this.behavior;
                    stuff[ 'functionality'          ] = this;
                    stuff[ 'functionalityDefintion' ] = funcDef;
                    stuff[ 'portProbe'              ] = pp;
                    stuff[ 'service'                ] = svc;
                    return stuff;
                }
            }
        }
        return null;
    },

    /*
     * Evaluate the criteria in this functionality using the provided left-hand and right-hand values.
     *
     * lh:      a hashmap of left-hand criteria values (e.g., "win_domain"="service-now.com")
     * rh:      a hashmap of right-hand criteria values (e.g., "mid_win_domain"="bogus.com")
     * returns: true if the criteria are met
     */
    evaluateCriteria: function(lh, rh) {
        // create and initialize our criteria evaluator...
        var ce = new CriteriaEvaluator();
        for (var i = 0; i < this.criteria.length; i++) {
            var cri = this.criteria[i];
            ce.addCriterion(cri.name, cri.operator, cri.value);
        }

        // if we had no criteria, then by definition we've met them...
        if (ce.size() == 0)
            return true;

        // otherwise we need to actually run the evaluation...
        var any = ('Any' == this.matchCriteria);
        return ce.evaluate(lh, rh, any);
    },

    type: "DiscoveryFunctionality"
});

// Discovery class

/**
 * Encapsulates the notion of a Discovery Functionality Definition.  Instances where isValid() returns true have the 
 * following properties initialized:
 * 
 * sysID: sys_id of the functionality definition record
 * name:  name of the functionality definition 
 * portProbes: a JavaScript Array of DiscoveryPortProbe instances associated with this functionality definition
 * 
 * Tom Dilatush tom.dilatush@service-now.com
 */
var DiscoveryFunctionalityDefinition = Class.create();

DiscoveryFunctionalityDefinition.getAll = function() {
    return DiscoveryFunctionalityDefinition.getNamed('All');
}

DiscoveryFunctionalityDefinition.getNamed = function(name) {
    var gr = new GlideRecord('discovery_function_def');
    gr.addQuery('name', name);
    gr.query();
    if (!gr.next())
        return null;
    return new DiscoveryFunctionalityDefinition(gr);
}

DiscoveryFunctionalityDefinition.prototype = Object.extend(new AbstractDBObject(), {    
    initialize: function(source) {
        // see if we've even got a record here...
        this.valid = false;
        var gr = this._getRecord(source, 'discovery_function_def');
        if (!gr)
            return;
            
        // we've got our record, so record our information...
        this.valid = true;
        this.sysID       = gr.getValue( 'sys_id'       );
        this.name = gr.getValue( 'name' );
        
        // get our list of port probes...
        var svcs = gr.functionality.getGlideList().getValues();  // returns an ArrayList of discovery_port_probe sys_ids...
        this.portProbes = DiscoveryPortProbe.getFromArrayList(svcs);     
    },
    
    isRunOnce: function() {
        return (this.triggerType == 0);
    },
    
    type: "DiscoveryFunctionalityDefinition"
});

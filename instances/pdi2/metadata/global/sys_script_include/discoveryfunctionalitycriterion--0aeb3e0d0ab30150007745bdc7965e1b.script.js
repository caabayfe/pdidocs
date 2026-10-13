// Discovery class

/**
 * Encapsulates the notion of a Discovery Functionality Criterion.  Instances where isValid() returns true have the 
 * following properties initialized:
 * 
 * sysID:         sys_id of this record
 * name:          name of variable on left-hand side of criterion
 * operator:      operator in the criterion
 * value:         value or variable name on right-hand side of criterion
 * active:        active flag
 * functionality: instance of DiscoveryFunctionality associated with this instance
 * 
 * Tom Dilatush tom.dilatush@service-now.com
 */
var DiscoveryFunctionalityCriterion = Class.create();

/*
 * Get an array of DiscoveryFunctionalityCriterion instances associated with the given functionality.
 */
DiscoveryFunctionalityCriterion.getForFunctionality = function(functionality) {
    var result = [];
    var gr = new GlideRecord('discovery_func_criterion');
    gr.addQuery('functionality', functionality.sysID);
    gr.addActiveQuery();
    gr.query();
    while (gr.next()) {
        var df = new DiscoveryFunctionalityCriterion(gr, functionality);
        if (df.isValid()) 
            result.push(df);
    }
    return result;
}

DiscoveryFunctionalityCriterion.prototype = Object.extend(new AbstractDBObject(), {
    /*
     * Initializes this instance from the given source, which must be either a GlideRecord instance or a sysID string.
     * The optional functionality parameter will be used to resolve the functionality reference if its sysID matches the reference.
     */
    initialize: function(source, functionality) {
        // see if we've even got a record here...
        this.valid = false;
        var gr = this._getRecord(source, 'discovery_func_criterion');
        if (!gr)
            return;
            
        // we've got our record, so record our information...
        this.valid = true;
        this.sysID    = gr.getValue( 'sys_id'   );
        this.name     = gr.getValue( 'name'     );
        this.operator = gr.getValue( 'operator' );
        this.value    = gr.getValue( 'value'    );
        this.active   = gr.getValue( 'active'   );
        
        // and resolve our references...
        var functionalityID = gr.getValue( 'functionality' );
        if (functionality && (functionality.sysID == functionalityID))
            this.functionality = functionality;
        else
            this.functionality  = new DiscoveryFunctionality(functionalityID);
     },
    
    type: "DiscoveryFunctionalityCriterion"
});

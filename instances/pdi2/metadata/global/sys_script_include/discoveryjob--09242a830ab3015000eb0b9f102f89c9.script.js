// Discovery class

/**
 * Encapsulates the notion of a scheduled job that kicks off a Discovery.  Instances where isValid() returns true have the 
 * following properties initialized:
 * 
 * sysID:      sys_id of the job record
 * scheduleID: sys_id of the associated Discovery schedule record
 * 
 * Tom Dilatush tom.dilatush@service-now.com
 */
var DiscoveryJob = Class.create();

DiscoveryJob.prototype = Object.extend(new AbstractDBObject(), {    
    initialize: function(source) {
        // see if we've even got a record here...
        this.valid = false;
        var gr = this._getRecord(source, 'sys_trigger');
        if (!gr)
            return;
            
        // we've got a real job record, so record our information...
        this.valid = true;
        this.sysID       = gr.getValue( 'sys_id'       );
        this.triggerType = gr.getValue( 'trigger_type' );
        this.scheduleID  = gr.getValue( 'document_key' );
    },
    
    isRunOnce: function() {
        return (this.triggerType == 0);
    },
    
    type: "DiscoveryJob"
});

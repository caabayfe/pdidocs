var InteractionSegment = Class.create();
InteractionSegment.prototype = {
    initialize: function() {},

    isApplicable: function(externalSegmentId, interactionGr) {
        /* Returns true if this extension point applies for this interaction. If false, the rest of the result should be ignored and other extension point instances should be tried.
         */
        return false;
    },

    getSegment: function(externalSegmentId, agentSysId, interactionGr) {
        /*
		Returns an object with the following structure:
		{
			"segmentTable" : table name of segment.
			"segmentId" : sys ID of segment.
		}
		*/
        return null;
    },

    /**
     * Creates a segment and returns the segment
     * 
     * @param {String} externalSegmentId - externalSegmentId identifier.
     * @param {String} agentSysId - Agent sys Id.
     * @param {GlideRecord} interactionGr - GlideRecord object for the interaction record.
     * 
     * @return {Object} - Returns the details of the segment, which includes the segment table and ID.
     * {
     * 	"segmentTable" : table name of segment.
     *  "segmentId" : sys ID of segment.
     * }
     */
    createSegment: function(externalSegmentId, agentSysId, interactionGr) {
        return null;
    },

    type: 'InteractionSegment'
};

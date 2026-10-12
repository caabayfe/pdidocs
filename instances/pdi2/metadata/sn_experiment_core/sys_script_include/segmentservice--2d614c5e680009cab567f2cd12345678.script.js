/**
 * SegmentService
 * Service layer for segment operations (CRUD and evaluation)
 */
var SegmentService = Class.create();
SegmentService.prototype = {
    /**
     * Initialize the service
     */
    initialize: function() {
        this._evaluator = new SegmentEvaluator();
    },

    /**
     * Get segment by sys_id
     * @param {String} segmentId - Segment sys_id
     * @returns {Segment} Segment object or null
     */
    getSegment: function(segmentId) {
        try {
            var gr = new GlideRecord('sn_experiment_core_segment');
            if (!gr.get(segmentId)) {
                gs.warn('SegmentService: Segment not found: ' + segmentId);
                return null;
            }

            return Segment.fromGlideRecord(gr);

        } catch (e) {
            gs.error('SegmentService: Error loading segment - ' + e.message);
            return null;
        }
    },

    /**
     * Evaluate if a user matches a segment
     * @param {String} segmentId - Segment sys_id
     * @param {Object} context - User context {userId: String, userContext: Object}
     * @returns {Object} Evaluation result {matches: Boolean, details: Object, error: String}
     */
    evaluateSegment: function(segmentId, context) {
        try {
            // Load segment
            var segment = this.getSegment(segmentId);
            if (!segment) {
                return {
                    matches: false,
                    error: 'Segment not found: ' + segmentId
                };
            }

            // Evaluate
            return this._evaluator.evaluate(segment, context);

        } catch (e) {
            gs.error('SegmentService: Error evaluating segment - ' + e.message);
            return {
                matches: false,
                error: 'Evaluation error: ' + e.message
            };
        }
    },

    /**
     * Evaluate if a user matches a segment (by segment object)
     * @param {Segment} segment - Segment object
     * @param {Object} context - User context {userId: String, userContext: Object}
     * @returns {Object} Evaluation result {matches: Boolean, details: Object, error: String}
     */
    evaluateSegmentObject: function(segment, context) {
        try {
            return this._evaluator.evaluate(segment, context);
        } catch (e) {
            gs.error('SegmentService: Error evaluating segment object - ' + e.message);
            return {
                matches: false,
                error: 'Evaluation error: ' + e.message
            };
        }
    },

    type: 'SegmentService'
};

var PwdResetUsageInstrumentation = Class.create();
PwdResetUsageInstrumentation.prototype = {

    initialize: function(collectionPoint, collectionEvent) {
        this.collectionPoint = collectionPoint;
        this.collectionEvent = collectionEvent;
        this.bucket = {};
    },

    addBucket: function(key, value) {
        this.bucket[key] = value;
        return this;
    },

    buildUsageEvent: function() {
        var GCFMap = new GCFSampleMap();
        var bucketCount = 0;
        for (var bucketKey in this.bucket) {
            if (bucketCount >= PwdResetGCFConstants.MAX_BUCKETS_LIMIT)
                break;
            GCFMap.put(bucketKey, this.bucket[bucketKey]);
            bucketCount++;
        }
        this._addEventToGCFQueue(GCFMap);
    },

    _addEventToGCFQueue: function(GCFMap) {
        try {
            GCFCollector.recordUsageEvent(PwdResetGCFConstants.CATEGORY, this.collectionPoint, this.collectionEvent, GCFMap);
        } catch (ex) {
            gs.warn("Failed to record Password Reset Usage(GCF) event, Exception: " + ex);
        }
    },

    type: 'PwdResetUsageInstrumentation'
};

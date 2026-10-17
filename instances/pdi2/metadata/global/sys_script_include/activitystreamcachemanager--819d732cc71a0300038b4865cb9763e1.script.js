var ActivityStreamCacheManager = Class.create();
ActivityStreamCacheManager.prototype = {
	initialize: function() {
		this.CATALOG_STREAM = "Activity_stream";
		this.gcm = new GlideCacheManager();
		this.catalogKey = {
            "INVALIDATED_STREAMS": "invalidated_streams"
        };
	},

	/*
     * To add a catalog key,Value to application cache
     * @param catalogKey - name of the key from catalog to be stored in cache
     * @param catalogVal - value corresponding to the catalogKey which will be updated in application cache
     */
	_put: function (catalog, catalogKey, catalogVal) {
		this.gcm.put(catalog, catalogKey, JSON.stringify(catalogVal));
	},

	/*
     * To get the Value for catalog key from application cache
     * @param catalogKey - name of the key from catalog to be stored in cache
     * @return catalogVal - parsed value corresponding to the catalogKey which is present application cache
     */
	_get: function (catalog, catalogKey) {
		return JSON.parse(this.gcm.get(catalog, catalogKey));
	},

	_flush : function(){
		this.gcm.flush(this.CATALOG_STREAM); // To avoid multinode instance issue
	},

	_update: function(streams) {
		this._put(this.CATALOG_STREAM, this.catalogKey.INVALIDATED_STREAMS,streams);
	},

	streamLoaded : function(userId, lastSynch) {
		if(!userId)
			return;
		var streams = this._get(this.CATALOG_STREAM, this.catalogKey.INVALIDATED_STREAMS);
		this._flush();
		if(!streams)
			streams = {};
		streams[userId] = {'hasUpdates' : false, 'lastSynch': lastSynch}; // lastSynch : long milliseconds
		this._update(streams);
	},

	hasNewUpdates: function(userId, lastSynch) {
		if (!userId)
			return true;
		var streams = this._get(this.CATALOG_STREAM, this.catalogKey.INVALIDATED_STREAMS);
		if(!streams) 
			return true;
		var stream = streams[userId];
		if (stream != null) {
			if (stream.hasUpdates != true){
				if (lastSynch != null) { //Handling multi sessions data with lastsynch time check.
					try {
						lastSynch = parseInt(lastSynch);
						var cacheLastSynch = stream.lastSynch;
						if (cacheLastSynch != null) {
							cacheLastSynch = parseInt(cacheLastSynch);
							if (lastSynch < cacheLastSynch)
								return true;
						}
					} catch (e){
						return stream.hasUpdates == true;
					}
				}
				return false;
			}
		}
		return true;
	},

	/*
     * Flushes the streams from Cache
     * @param userIds - an array of userIds.
     */
	flushStreams : function(userIds) {
		if(!userIds)
			return;
		var streams = this._get(this.CATALOG_STREAM, this.catalogKey.INVALIDATED_STREAMS);
		this._flush();
		if(!streams)
			return;
		for( var idx = 0; idx < userIds.length; idx++) {
			delete streams[userIds[idx]];
		}
		this._update(streams);
	},

	/*
     * Flushes the streams from Cache
     * @param userIds - an array of userIds.
     */
	invalidateStreams : function() {
		this._flush();
		this._update(null);
	},

	type: 'ActivityStreamCacheManager'
};

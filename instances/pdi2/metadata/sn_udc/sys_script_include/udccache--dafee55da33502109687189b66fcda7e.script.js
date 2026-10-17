class UDCCache {
	static type = 'UDCCache';
	static #LOG = new Logger(UDCCache.type);

	static get(cacheName, key) {
		if (gs.nil(cacheName) || gs.nil(key)) return null;

		try {
			const cachedData = sn_scoped_cache.ScopedCacheManager.get(cacheName, key);
			return JSON.parse(cachedData);
		} catch (e) {
			UDCCache.#LOG.error(`[${cacheName}][${key}]: Unable to parse the cache entry`);
		}
	}

	static put(cacheName, key, value) {
		if (gs.nil(cacheName) || gs.nil(key)) return;

		try {
			sn_scoped_cache.ScopedCacheManager.put(cacheName, key, JSON.stringify(value));
		} catch (e) {
			UDCCache.#LOG.error(`[${cacheName}][${key}]: Unable to put the cache entry`);
		}
	}

	static putMultiRow(cacheName, key, value, ids) {
		if (gs.nil(cacheName) || gs.nil(key) || gs.nil(ids)) return;

		try {
			sn_scoped_cache.ScopedCacheManager.putMultiRow(
				cacheName,
				key,
				JSON.stringify(value),
				ids
			);
		} catch (e) {
			UDCCache.#LOG.error(`[${cacheName}][${key}]: Unable to put multi row cache entry`);
		}
	}

	static flush(cacheName, key) {
		if (gs.nil(cacheName) || gs.nil(key)) return;

		try {
			sn_scoped_cache.ScopedCacheManager.flushScopedCache(cacheName, key);
		} catch (e) {
			UDCCache.#LOG.error(`[${cacheName}][${key}]: Unable to flush the cache entry`);
		}
	}
}

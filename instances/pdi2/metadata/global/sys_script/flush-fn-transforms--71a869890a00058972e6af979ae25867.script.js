//Force flush the fn_transform table when a related variable changes. For most variable scenarios this //isn't needed, but because FieldNormalization is an engine, and it attempts to cache all its config 
	//variables on any query, and because of the way that cache is managed, there are difficult timing //problems that happen on a variable value update. This forces a second flush after the variable value //row has been updated, ensuring the cached value is accurate.
	var table = '' + current.document;
	GlideCacheManager.flush(table);
	

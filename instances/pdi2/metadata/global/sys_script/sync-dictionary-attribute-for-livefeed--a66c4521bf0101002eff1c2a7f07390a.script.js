if (current.operation() == 'update' || (current.operation() == 'insert' && current.live_feed_enabled == true))
	SNC.TableEditor.syncDictionaryAttribute(current);

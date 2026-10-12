
            
            // Fix script to deduplicate collection items by URL and creator
            var SOURCE_TABLE = 'sn_udc_collection_item';
            var LOG_PREFIX = '[DeduplicateCollectionItems] ';
            
            try {
                var deletedCount = 0;
                var lastKey = '';
                var lastSysId = '';
                
                // Query only items with URL (list bookmarks), ordered by URL, user, and creation date (descending)
                // Descending order ensures the first record per (url, user) key is the newest
                var sourceGr = new GlideRecord(SOURCE_TABLE);
                sourceGr.addNotNullQuery('url');
                sourceGr.orderBy('url');
                sourceGr.orderBy('user');
                sourceGr.orderByDesc('sys_created_on');
                sourceGr.query();
                
                // Single loop: keep first-seen (newest), delete subsequent (older) duplicates
                while (sourceGr.next()) {
                    var url = sourceGr.getValue('url');
                    var user = sourceGr.getValue('user');
                    var currentKey = url + '|' + user;
                    
                    // If same group (URL + user), delete this older record
                    if (currentKey === lastKey) {
                        sourceGr.deleteRecord();
                        deletedCount++;
                    }
                    
                    // Update tracking for next iteration
                    lastKey = currentKey;
                }
                
                // Log summary
                if (deletedCount > 0) {
                    gs.warn(LOG_PREFIX + 'Deleted ' + deletedCount + ' duplicate records');
                } else {
                    gs.info(LOG_PREFIX + 'No duplicates found');
                }
                
            } catch (error) {
                gs.error(LOG_PREFIX + 'Fatal error: ' + error.toString());
            }

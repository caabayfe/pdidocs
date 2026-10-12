
            
            // Fix script to migrate collection items to M2M architecture
            var SOURCE_TABLE = 'sn_udc_collection_item';
            var M2M_TABLE = 'sn_udc_collection_item_m2m';
            var BOOKMARKS_COLLECTION_ID = 'a231477dff240f50c76affffffffff8d';
            var LOG_PREFIX = '[CollectionMigration] ';
            
            try {
                var migratedCount = 0;
                var errors = [];
                
                // Build set of collection items that already have M2M records
                var itemsWithM2m = {};
                var m2mLookupGr = new GlideRecord(M2M_TABLE);
                m2mLookupGr.query();
                
                while (m2mLookupGr.next()) {
                    var collectionItemId = m2mLookupGr.getValue('collection_item');
                    itemsWithM2m[collectionItemId] = true;
                }
                
                // Collect records to insert in batch
                var recordsToInsert = [];
                
                // Scan source table and collect new records
                var sourceGr = new GlideRecord(SOURCE_TABLE);
                sourceGr.query();
                
                while (sourceGr.next()) {
                    var collectionItemId = sourceGr.getValue('sys_id');
                    
                    // Skip if this item already has any M2M record
                    if (!itemsWithM2m[collectionItemId]) {
                        recordsToInsert.push({
                            collection: BOOKMARKS_COLLECTION_ID,
                            collection_item: collectionItemId
                        });
                    }
                }
                
                // Batch insert all new records
                for (var i = 0; i < recordsToInsert.length; i++) {
                    var record = recordsToInsert[i];
                    var m2mGr = new GlideRecord(M2M_TABLE);
                    m2mGr.initialize();
                    m2mGr.setValue('collection', record.collection);
                    m2mGr.setValue('collection_item', record.collection_item);
                    
                    if (!m2mGr.insert()) {
                        errors.push(record.collection_item);
                    } else {
                        migratedCount++;
                    }
                }
                
                // Log final summary with errors if any
                if (errors.length > 0) {
                    gs.warn(LOG_PREFIX + 'Migration completed with ' + errors.length + ' errors. Created: ' + migratedCount + '. Failed items: ' + errors.join(', '));
                } else {
                    gs.info(LOG_PREFIX + 'Migration completed successfully. Created: ' + migratedCount);
                }
                
            } catch (error) {
                gs.error(LOG_PREFIX + 'Fatal error: ' + error.toString());
            }

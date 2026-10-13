var AbstractDeleteStrategy = Class.create();

AbstractDeleteStrategy.LOGGER_NAME = 'DeleteStrategy';
AbstractDeleteStrategy.LOGGER_NAME_LOG_PREFIX = '[' + AbstractDeleteStrategy.LOGGER_NAME + ']';

AbstractDeleteStrategy.prototype = {
    discoverySource: 'ServiceNow',
    deleteStrategies: {
        // 1 is "keep" but we don't use it in delete strategy
        2: {
            description: 'delete CI'
        },
        3: {
            description: 'mark as absent'
        },
        4: {
            description: 'delete relations'
        },
        5: {
            description: 'mark as retired'
        }
    },

    initialize: function() {
        // Can't initialize at the top. Functions are undefined on that phase
        this._initializeDeleteStrategyToDeleteFunctionMapping();
    },

    _initializeDeleteStrategyToDeleteFunctionMapping: function() {
        this.deleteStrategies[2].deletionFunction = this._deleteCIs.bind(this);
        this.deleteStrategies[3].deletionFunction = this._markCIsAsAbsent.bind(this);
        this.deleteStrategies[4].deletionFunction = this._deleteRelations.bind(this);
        this.deleteStrategies[5].deletionFunction = this._markCIsAsRetired.bind(this);
    },

    /*
     *_getRelationshipPaths: function() {
     *  // A subclass can provide additional relationship paths to walk down ex:
     *
     *  var additionalRelationPaths = {};
     *
     *  additionalRelationPaths['cmdb_ci_endpoint_block'] = [
     *     'cmdb_ci_endpoint_block', 'cmdb_ci_storage_volume', 'cmdb_ci_aws_datacenter'
     *  ];
     *
     *  return additionalRelationPaths;
     * },
     *
     * _getTightlyCoupledClassesMappings: function() {
     * 	// A sublass can provide information on tightly coupled classes
     *	// This allows to avoid unecessary queries
     *	// Example of deleting cmdb_ci_endpoint_block while deleting cmdb_ci_storage_volume
     *
     * 	var discoveryFunctions = new DiscoveryFunctions();
     *
     *  return [
     *		{
     *			classToDelete: 'cmdb_ci_endpoint_block',
     *			dependentOn: 'cmdb_ci_storage_volume',
     *			relationData: {
     *				relationId: discoveryFunctions.findCIRelationshipType('cmdb_rel_type',
     *					'Implement End Point To::Implement End Point From'),
     *				parentClass: 'cmdb_ci_endpoint_block'
     *			}
     *		}
     *	];
     * }
     */


    /*
    	scheduleStartTime - GlideDate
    	ciClass - class
    	patternInputs - specific discovery content
    	patternContext - specific discovery content
    	ciTypeStrategyMapping - map between class and delete strategy for children CIs
    	agentCorrelator - Discovery Status - optional for logging
    */
    reconcile: function(scheduleStartTime, ciClass, patternInputs, patternContext, ciTypeStrategyMapping, agentCorrelator) {
        /*
         * The reason creating this variable is to reduce the number of arguments on future function calls
         * We can't have it as "this.varibaleName" since the value is shared among multiple instances
         * of this object
         * At the moment, I [Oron] have decided to create a single object from input parameters
         * to pass through, rather having functions with ~10+ arguments
         * The algorithm did NOT change
         */
        var deleteStrategyData = {
            inputParams: {
                scheduleStartTime: scheduleStartTime,
                targetCiClass: ciClass,
                patternInputs: patternInputs,
                patternContext: patternContext,
                ciTypeToStrategy: ciTypeStrategyMapping,
                statusSysId: agentCorrelator
            },
            maxCIsToDelete: GlideProperties.get('glide.discovery.delete_strategy.max_deletion_records', 2000),
            maxCIsInSearchGroup: GlideProperties.get('glide.discovery.delete_strategy.max_ci_search_group', 100),
            maxRelatedEntriesToDeleteInIteration: GlideProperties.get('glide.discovery.delete_strategy.max_related_entries_delete_in_iteration', 500),
            ciDeletionBatchSize: GlideProperties.get('glide.discovery.delete_strategy.ci_batch_size_for_deletion', 500),
            ciCountToTriggerBatchDeletion: GlideProperties.get('glide.discovery.delete_strategy.max_ci_before_triggering_batch_deletion', 500),
            cisDeleted: 0,
            relatedEntries: this._findRelatedEntries(ciClass),
            nodeLogger: new sn_automation.AutomationAPI().getNodeLogger(AbstractDeleteStrategy.LOGGER_NAME)
        };

        if (this._getTightlyCoupledClassesMappings) {
            var isDependentClass = this._getTightlyCoupledClassesMappings().some(function(mapping) {
                return mapping.classToDelete == ciClass;
            });

            if (isDependentClass) {
                var dependentOnClasses = this._getTightlyCoupledClassesMappings()
                    .filter(function(mapping) {
                        return mapping.classToDelete == ciClass;
                    })
                    .map(function(mapping) {
                        return mapping.dependentOn;
                    });
                deleteStrategyData.nodeLogger.info(this._buildLogMessage(ciClass + ' is tightly coupled with ' +
                    dependentOnClasses + ' and will be deleted as part of these classes processing'));
                return;
            }
            deleteStrategyData.dependentClassesConfig = this._getTightlyCoupledClassesMappings()
                .filter(function(mapping) {
                    return mapping.dependentOn == ciClass;
                });
        }

        deleteStrategyData.nodeLogger.info(this._buildLogMessage('Starting delete strategy'));
        deleteStrategyData.nodeLogger.debug(this._buildLogMessage('Input parameters:\n' + JSON.stringify(deleteStrategyData.inputParams)));
        deleteStrategyData.nodeLogger.debug(this._buildLogMessage('Configuration:\nMax CIs to handle:' +
            deleteStrategyData.maxCIsToDelete + '\nCIs group size for related entries deletion: ' +
            deleteStrategyData.maxCIsInSearchGroup + '\nRelated entries config: ' + JSON.stringify(deleteStrategyData.relatedEntries)));

        if (this._getCIs || this._getStaleCIs) {
            deleteStrategyData.nodeLogger.info(this._buildLogMessage('Manual query function was implemented in provided script. Getting CIs to delete'));
            this._getStaleCIs = this._getStaleCIs || this._getCIs;

            if (!this._getStaleCIs)
                deleteStrategyData.nodeLogger.warn(this._buildLogMessage('No stale CIs function was specified by the subclass. Delete strategy won\'t process stale CIs'));
            else
                var staleCIs = this._getStaleCIs(scheduleStartTime, ciClass, patternInputs, patternContext, deleteStrategyData.nodeLogger);

            if (staleCIs) {
                var message = 'Stale CIs were specified by the subclass. Processing delete strategy for ' + ciClass;
                deleteStrategyData.nodeLogger.info(this._buildLogMessage(message));
                deleteStrategyData.nodeLogger.debug(this._buildLogMessage(' CIs to delete: ' + JSON.stringify(staleCIs)));

                for (var item in staleCIs) {
                    deleteStrategyData.nodeLogger.debug(this._buildLogMessage(' Deleting ' + staleCIs[item]));
                    this._reconcileOnStrategy(deleteStrategyData, staleCIs[item]);
                }

                deleteStrategyData.nodeLogger.debug(this._buildLogMessage(' Deleted total of ' + staleCIs.length + ' CIs'));
            }

            if (!this._getNonStaleCIs)
                deleteStrategyData.nodeLogger.warn(this._buildLogMessage('No non-stale CIs function was specified by the subclass. Delete strategy won\'t process non-stale CIs'));
            else
                var nonStaleCIs = this._getNonStaleCIs(scheduleStartTime, ciClass, patternInputs, patternContext, deleteStrategyData.nodeLogger);
            if (nonStaleCIs)
                this._findAndDeleteStaleRelatedEntriesOfCIs(deleteStrategyData, nonStaleCIs);

            // This will process any remaining accumulated CIs
            this._triggerBatchDeletion(deleteStrategyData);
            return;
        }

        // a subclass MUST provide an implementation of _getBoundaryConditions to find the CI's to reconcile
        // if no boundaries are specified, stop processing.. without a boundary condition, we _MIGHT_ end up
        // marking all the CI's in the CMDB as stale which is not a desirable behavior
        deleteStrategyData.nodeLogger.debug(this._buildLogMessage('Getting boundaries for context:\n' + JSON.stringify(patternContext)));
        var boundaries = this._getBoundaryConditions(patternContext, deleteStrategyData.nodeLogger);

        if (boundaries && boundaries.length == 0) {
            var message = 'No boundary conditions were provided. Cannot process delete strategy without a valid boundary condition';
            deleteStrategyData.nodeLogger.warn(this._buildLogMessage(message));
            gs.warn(message, 'DeleteStrategy');
            return;
        }
        var existingRelationPaths = this._getRelationshipPaths();
        deleteStrategyData.nodeLogger.info(this._buildLogMessage('Processing boundary conditions : ' + boundaries.join()));

        for (var boundary in boundaries) {
            var boundaryItem = boundaries[boundary];
            var isWithinSameClass = false;

            if (typeof boundaryItem == 'string')
                boundaryItem = this._getRecordByID(boundaryItem);
            var boundaryClass = boundaryItem.sys_class_name;

            deleteStrategyData.nodeLogger.debug(this._buildLogMessage('Processing boundary "' + boundaryItem.getValue('sys_id') + '" of class "' + boundaryClass + '"'));

            // Get path between our class and ldc
            var path = [];
            if (existingRelationPaths && existingRelationPaths[ciClass])
                path = existingRelationPaths[ciClass];
            else
                path = this._getPathBetweenClasses(boundaryClass, ciClass);

            if (path == null && (boundaryClass == ciClass)) {
                var message = 'Checking for dependent records within same CI class: ' + boundaryClass;
                deleteStrategyData.nodeLogger.debug(this._buildLogMessage(message));

                path = [boundaryClass];
                isWithinSameClass = true;
            }

            if (path == null) {
                var message = 'No path could be created between ' + boundaryClass + ' and ' + ciClass;
                deleteStrategyData.nodeLogger.warn(this._buildLogMessage(message));
                gs.warn(message, 'DeleteStrategy');
                continue;
            }
            deleteStrategyData.nodeLogger.debug(this._buildLogMessage('Classpath found between "' + ciClass + '" to "' + boundaryClass + '": ' + path.join('->')));

            deleteStrategyData.pathToBoundaryClass = path;

            var levelInPath = isWithinSameClass ? 0 : path.length - 2;
            var layerToExplore = {
                level: levelInPath,
                className: path[levelInPath],
                parentCi: boundaryItem.sys_id + ''
            };

            deleteStrategyData.nodeLogger.info(this._buildLogMessage('Starting CMDB search for stale CIs'));
            this._recursiveReconcileOnStrategy(deleteStrategyData, layerToExplore);
        }

        // This will process any remaining accumulated CIs
        this._triggerBatchDeletion(deleteStrategyData);

    },

    _recursiveReconcileOnStrategy: function(deleteStrategyData, layerToExplore) {
        deleteStrategyData.nodeLogger.debug(this._buildLogMessage('Layer to explore: ' + JSON.stringify(layerToExplore)));

        if (this._internalWalkStep(deleteStrategyData, 'parent', 'child', layerToExplore))
            return;

        this._internalWalkStep(deleteStrategyData, 'child', 'parent', layerToExplore);
    },

    _internalWalkStep: function(deleteStrategyData, relationDirectionFrom, relationDirectionTo, layerToExplore) {
        var isDeletionLayer = layerToExplore.className == deleteStrategyData.inputParams.targetCiClass;

        deleteStrategyData.nodeLogger.debug(this._buildLogMessage('Preparing a query on relations table for ' + relationDirectionTo + ' CIs of type ' + layerToExplore.className + ' that have a relation to ' + layerToExplore.parentCi));

        var children = this._prepareChildrenQuery(relationDirectionFrom, layerToExplore.parentCi, relationDirectionTo, layerToExplore.className);

        if (isDeletionLayer) {
            deleteStrategyData.nodeLogger.debug(this._buildLogMessage('Deletion layer have been reached. Adding additional conditions to the search'));

            this._addDeleteLayerCommonConditions(children, relationDirectionTo);

            deleteStrategyData.nodeLogger.debug(this._buildLogMessage('Adding condition: ' + relationDirectionTo + '\'s last_discovered is at or before ' + scheduleStartTime));
            this._addStaleConditions(children, relationDirectionTo, deleteStrategyData.inputParams.scheduleStartTime);

            this._enhanceDeleteLayerQuery(children, relationDirectionTo, deleteStrategyData.inputParams.scheduleStartTime);

            message = 'About to find and delete ' + layerToExplore.className + ' records. Deletion strategy is "' + this._getStrategyNameByCode(this._getDeleteStrategyCodeFromData(deleteStrategyData)) + '"';
            deleteStrategyData.nodeLogger.info(this._buildLogMessage(message));
        }

        deleteStrategyData.nodeLogger.debug(this._buildLogMessage('Query table: ' + children.getTableName() + ' Encoded query: ' + children.getEncodedQuery()));
        children.query();
        var hasChildren = children.hasNext();

        deleteStrategyData.nodeLogger.debug(this._buildLogMessage('Found ' + children.getRowCount() + ' ' + layerToExplore.className + ' records'));

        while (children.next()) {
            if (deleteStrategyData.cisDeleted >= deleteStrategyData.maxCIsToDelete)
                return;

            if (isDeletionLayer) {
                this._reconcileOnStrategy(deleteStrategyData, children.getValue(relationDirectionTo));

                deleteStrategyData.cisDeleted = deleteStrategyData.cisDeleted + 1;

                if (deleteStrategyData.cisDeleted == deleteStrategyData.maxCIsToDelete) {
                    var warnMsg = 'Reached the maximum number of deletions (' + deleteStrategyData.maxCIsToDelete + ') in one pattern. Execute the pattern again to continue deleteing stale records. Increase the number property: "glide.discovery.delete_strategy.max_deletion_records" to be able to trigger more deletions in one pattern.';

                    deleteStrategyData.nodeLogger.warn(this._buildLogMessage(warnMsg));

                    if (!deleteStrategyData.inputParams.statusSysId) {
                        gs.warn(warnMsg);
                        return;
                    }

                    var logger = new DiscoveryLogger(deleteStrategyData.inputParams.statusSysId);
                    logger.warn(warnMsg);

                    return;
                }

                continue;
            }

            var nextLevelInPath = layerToExplore.level - 1;
            var nextLayerToExplore = {
                level: nextLevelInPath,
                className: deleteStrategyData.pathToBoundaryClass[nextLevelInPath],
                parentCi: children.getValue(relationDirectionTo) + ''
            };

            deleteStrategyData.nodeLogger.debug(this._buildLogMessage('Further search required. Drilling down to the next layer'));
            this._recursiveReconcileOnStrategy(deleteStrategyData, nextLayerToExplore);
        }

        // For related entries
        if (isDeletionLayer) {
            message = 'About to handle related entries for non-stale CIs';
            deleteStrategyData.nodeLogger.info(this._buildLogMessage(message));

            var nonStaleChildrenRelations = this._prepareChildrenQuery(relationDirectionFrom, layerToExplore.parentCi, relationDirectionTo, layerToExplore.className);
            this._addDeleteLayerCommonConditions(nonStaleChildrenRelations, relationDirectionTo);

            deleteStrategyData.nodeLogger.debug(this._buildLogMessage('Adding condition: ' + relationDirectionTo + '\'s last_discovered is after ' + scheduleStartTime));
            this._addNonStaleConditions(nonStaleChildrenRelations, relationDirectionTo, deleteStrategyData.inputParams.scheduleStartTime);
            deleteStrategyData.nodeLogger.debug(this._buildLogMessage('Query table: ' + nonStaleChildrenRelations.getTableName() + ' Encoded query: ' + nonStaleChildrenRelations.getEncodedQuery()));

            nonStaleChildrenRelations.query();

            this._reconcileRelatedEntriesUsingRelations(deleteStrategyData, nonStaleChildrenRelations, relationDirectionTo);

            message = 'Finished handling stale related entries';
            deleteStrategyData.nodeLogger.info(this._buildLogMessage(message));
        }

        return hasChildren;
    },

    _prepareChildrenQuery: function(source, refCi, target, childClass) {
        var relationsGlideRecord = new GlideRecord('cmdb_rel_ci');
        relationsGlideRecord.addQuery(source, refCi);
        relationsGlideRecord.addQuery(target + '.sys_class_name', childClass);

        return relationsGlideRecord;
    },

    _reconcileRelatedEntriesUsingRelations: function(deleteStrategyData, relationsGlideRecord, relationPosition) {
        if (!deleteStrategyData.relatedEntries || JSUtil.isEmpty(deleteStrategyData.relatedEntries))
            return;
        var cisToWorkOn = [],
            totalStaleRelatedEntriesDeleted = 0;

        deleteStrategyData.nodeLogger.debug(this._buildLogMessage('Working on groups of ' + deleteStrategyData.maxCIsInSearchGroup + ' ' + deleteStrategyData.inputParams.targetCiClass));

        while (relationsGlideRecord.next()) {
            var sysId = relationsGlideRecord.getValue(relationPosition);
            cisToWorkOn.push(sysId);

            if (cisToWorkOn.length == deleteStrategyData.maxCIsInSearchGroup)
                totalStaleRelatedEntriesDeleted += this._findAndDeleteStaleRelatedEntriesOfCIs(deleteStrategyData, cisToWorkOn);
        }

        if (this._haveLeftOvers(cisToWorkOn.length))
            totalStaleRelatedEntriesDeleted += this._findAndDeleteStaleRelatedEntriesOfCIs(deleteStrategyData, cisToWorkOn);

        deleteStrategyData.nodeLogger.info(this._buildLogMessage('Deleted total of ' + totalStaleRelatedEntriesDeleted + ' related entries'));
    },

    _findAndDeleteStaleRelatedEntriesOfCIs: function(deleteStrategyData, cisToWorkOn) {
        deleteStrategyData.nodeLogger.debug(this._buildLogMessage('CIs to work on: ' + JSON.stringify(cisToWorkOn)));
        var relatedEntriesConfigData = deleteStrategyData.relatedEntries,
            totalStaleRelatedEntriesDeleted = 0;

        for (var index in relatedEntriesConfigData) {
            deleteStrategyData.nodeLogger.debug(this._buildLogMessage('About to find stale ' + relatedEntriesConfigData[index].table + ' records'));

            var staleRelatedEntriesRecordsSysIds = this._findStaleRelatedEntriesForCIs(relatedEntriesConfigData[index], cisToWorkOn, deleteStrategyData.inputParams.scheduleStartTime);
            deleteStrategyData.nodeLogger.debug(this._buildLogMessage('Found total of' + staleRelatedEntriesRecordsSysIds.length + ' stale related entries'));

            var itemsToDelete = staleRelatedEntriesRecordsSysIds.splice(0, deleteStrategyData.maxRelatedEntriesToDeleteInIteration);

            while (itemsToDelete.length > 0) {
                deleteStrategyData.nodeLogger.debug(this._buildLogMessage('Deleting the following sysids: ' + JSON.stringify(itemsToDelete)));

                this._deleteStaleRelatedEntries(relatedEntriesConfigData[index], itemsToDelete);

                deleteStrategyData.nodeLogger.debug(this._buildLogMessage(itemsToDelete.length + ' ' + relatedEntriesConfigData[index].table + ' items were deleted'));
                totalStaleRelatedEntriesDeleted += itemsToDelete.length;

                itemsToDelete = staleRelatedEntriesRecordsSysIds.splice(0, deleteStrategyData.maxRelatedEntriesToDeleteInIteration);
            }
        }
        cisToWorkOn.length = 0;
        return totalStaleRelatedEntriesDeleted;
    },

    _findStaleRelatedEntriesForCIs: function(relatedEntryConfigData, cisSysIds, scheduleStartTime) {
        var relatedEntriesSysIds = this._getAllRelatedEntriesForCIs(relatedEntryConfigData, cisSysIds);

        if (relatedEntriesSysIds.length == 0)
            return [];
        var staleRelatedEntriesRecordsSysIds = this._detectStaleRecordsInList(relatedEntriesSysIds, scheduleStartTime);

        return staleRelatedEntriesRecordsSysIds;
    },

    _getAllRelatedEntriesForCIs: function(relatedEntryConfigData, cisSysIds) {
        var relatedEntriesSysIds = [];
        var relatedEntryGlideRecord = new GlideRecord(relatedEntryConfigData.table);
        relatedEntryGlideRecord.addQuery(relatedEntryConfigData.referenced_field, 'IN', cisSysIds);
        relatedEntryGlideRecord.query();

        while (relatedEntryGlideRecord.next())
            relatedEntriesSysIds.push(relatedEntryGlideRecord.getUniqueValue());
        return relatedEntriesSysIds;
    },

    _detectStaleRecordsInList: function(relatedEntriesSysIds, scheduleStartTime) {
        var staleRecordsSysIds = [];

        var sysObjectSourceGlideRecord = new GlideRecord('sys_object_source');
        sysObjectSourceGlideRecord.addQuery('name', this.discoverySource);
        sysObjectSourceGlideRecord.addQuery('sys_updated_on', '<', scheduleStartTime);
        sysObjectSourceGlideRecord.addQuery('target_sys_id', 'IN', relatedEntriesSysIds);
        sysObjectSourceGlideRecord.query();

        while (sysObjectSourceGlideRecord.next())
            staleRecordsSysIds.push(sysObjectSourceGlideRecord.getValue('target_sys_id'));
        return staleRecordsSysIds;
    },

    _deleteStaleRelatedEntries: function(relatedEntryConfigData, staleRecordsSysIds) {
        var relatedEntryGlideRecord = new GlideRecord(relatedEntryConfigData.table);
        relatedEntryGlideRecord.addQuery('sys_id', 'IN', staleRecordsSysIds);
        relatedEntryGlideRecord.query();

        relatedEntryGlideRecord.deleteMultiple();
    },

    _haveLeftOvers: function(itemsToHandle) {
        return itemsToHandle > 0;
    },

    // Deletes related entries, tightly coupled CIs, children and the target CI
    _reconcileOnStrategy: function(deleteStrategyData, ciRef) {
        var ci = new GlideRecord(deleteStrategyData.inputParams.targetCiClass);

        if (!ci.get('sys_id', ciRef)) {
            var logger = new DiscoveryLogger(deleteStrategyData.inputParams.statusSysId);
            var message = 'No CI with sysid ' + ciRef + ' was found. Skipping deletion';

            deleteStrategyData.nodeLogger.warn(this._buildLogMessage(message));
            logger.warn(message);

            return;
        }
        this._removeRelatedEntries(deleteStrategyData, ciRef);
        this._removeTightlyCoupledCIs(deleteStrategyData, ciRef);
        var children = this._getChildrenBySysId(ci.sys_id, deleteStrategyData.inputParams.scheduleStartTime);
        this._processChildren(children, deleteStrategyData);
        // priority = 2 for the target CI. Delete the target CI last
        var ciInfo = {
            className: deleteStrategyData.inputParams.targetCiClass,
            sysId: ci.sys_id + '',
            deletionPriority: 2
        };
        this._processCI(ciInfo, deleteStrategyData);
    },

    _removeRelatedEntries: function(deleteStrategyData, ciRef) {
        if (deleteStrategyData.relatedEntries) {
            for (var counter = 0; counter < deleteStrategyData.relatedEntries.length; counter++) {
                var relatedEntry = deleteStrategyData.relatedEntries[counter];
                var relatedEntryCleanerGr = new GlideRecord(relatedEntry.table);
                relatedEntryCleanerGr.addQuery(relatedEntry.referenced_field, ciRef);
                relatedEntryCleanerGr.deleteMultiple();
            }
        }
    },

    _removeTightlyCoupledCIs: function(deleteStrategyData, ciRef) {
        deleteStrategyData.dependentClassesConfig.forEach(function(classConfig) {
            /*
             * This section is taking a small hit in readability so that the object we grab from
             * the extending class\file will be more intuitive for content developers
             */
            var currentClassLocation = null;
            var dependentClassLocation = null;
            if (classConfig.relationData.parentClass == deleteStrategyData.inputParams.targetCiClass) {
                currentClassLocation = 'parent';
                dependentClassLocation = 'child';
            } else {
                currentClassLocation = 'child';
                dependentClassLocation = 'parent';
            }
            var relCi = new GlideRecord('cmdb_rel_ci');
            relCi.addQuery('type', classConfig.relationData.relationId);
            relCi.addQuery(currentClassLocation, ciRef);
            relCi.addQuery(dependentClassLocation + '.sys_class_name', classConfig.classToDelete);
            relCi.query();

            while (relCi.next()) {
                var tightlyCoupledCiSysId = relCi.getValue(dependentClassLocation);
                // priority = 1 for tightly coupled CIs. Delete tightly coupled CIs before deleting the target CI
                var ciInfo = {
                    className: classConfig.classToDelete,
                    sysId: tightlyCoupledCiSysId + '',
                    deletionPriority: 1
                };
                this._processCI(ciInfo, deleteStrategyData);
            }

            /*
             * The "this" is providing the "this" object to use in the forEach
             * That way we can call functions in the Abstract file
             */
        }, this);
    },

    _processChildren: function(children, deleteStrategyData) {
        Object.keys(children).forEach(function(className) {
            children[className].forEach(function(sysId) {
                // priority = 1 for children. Delete children first before deleting the parent CI
                var ciInfo = {
                    className: className,
                    sysId: sysId + '',
                    deletionPriority: 1
                };
                this._processCI(ciInfo, deleteStrategyData);
            }, this);
        }, this);
    },

    /*
     * This logic accumulates sysIDs marked for deletion and triggers the deletion process
     * once a defined threshold is reached. This helps prevent OOM issues caused by storing
     * too many sysIDs in memory.
     *
     * The JSON structure looks like:
     * {
     *     "priorities": {
     *         "1": { // Priority 1
     *             "className1": {
     *                 "deleteStrategy": "delete",
     *                 "sysIDs": []
     *             }
     *         },
     *         "2": { // Priority 2
     *             "className2": {
     *                 "deleteStrategy": "markAsRetired",
     *                 "sysIDs": []
     *             }
     *         }
     *     },
     *     "totalSysIDs": X
     * }
     *
     * Priorities determine the order in which deletions are processed—ensuring that
     * child CIs are deleted before their parent CIs.
     *
     * The totalSysIDs count helps track the number of accumulated sysIDs. Once it meets
     * the ciCountToTriggerBatchDeletion threshold, the batch deletion process is initiated.
     */
    _processCI: function(ciInfo, deleteStrategyData) {
        var className = ciInfo.className;
        var sysId = ciInfo.sysId;
        var deletionPriority = ciInfo.deletionPriority;
        var targetClassDeleteStrategy = deleteStrategyData.inputParams.ciTypeToStrategy.get(deleteStrategyData.inputParams.targetCiClass);
        var preferredStrategy = deleteStrategyData.inputParams.ciTypeToStrategy.get(className) || targetClassDeleteStrategy;
        var ciCountToTriggerBatchDeletion = deleteStrategyData.inputParams.ciCountToTriggerBatchDeletion;

        deleteStrategyData.accumulatedCIs = deleteStrategyData.accumulatedCIs || {
            priorities: {},
            totalSysIDs: 0
        };

        deleteStrategyData.nodeLogger.debug(this._buildLogMessage('CI of class ' + className + ' is being accumulated with priority ' + deletionPriority));

        if (!deleteStrategyData.accumulatedCIs.priorities[deletionPriority]) {
            deleteStrategyData.accumulatedCIs.priorities[deletionPriority] = {};
        }

        var priorityGroup = deleteStrategyData.accumulatedCIs.priorities[deletionPriority];

        if (!priorityGroup[className]) {
            priorityGroup[className] = {
                deleteStrategy: preferredStrategy,
                sysIDs: []
            };
        }

        priorityGroup[className].sysIDs.push(sysId);
        deleteStrategyData.nodeLogger.debug(this._buildLogMessage('Accumulating sys_id: ' + sysId + ' for class: ' + className + ' with strategy: ' + preferredStrategy));

        deleteStrategyData.accumulatedCIs.totalSysIDs += 1;

        // If threshold is met, trigger the handler function for all accumulated CIs
        if (deleteStrategyData.accumulatedCIs.totalSysIDs >= ciCountToTriggerBatchDeletion) {
            this._triggerBatchDeletion(deleteStrategyData);
        }
    },

    _triggerBatchDeletion: function(deleteStrategyData) {
        var accumulatedCIs = deleteStrategyData.accumulatedCIs;
        if (!accumulatedCIs || !accumulatedCIs.priorities) {
            return;
        }

        var batchSize = deleteStrategyData.ciDeletionBatchSize;
        var scheduleStartTime = deleteStrategyData.inputParams.scheduleStartTime;
        var priorities = Object.keys(accumulatedCIs.priorities).sort(function(a, b) {
            return a - b;
        });

        priorities.forEach(function(priority) {
            var classesInPriority = accumulatedCIs.priorities[priority];
            Object.keys(classesInPriority).forEach(function(className) {
                var classData = classesInPriority[className];
                var strategy = classData.deleteStrategy;
                var sysIDs = classData.sysIDs;
                if (sysIDs.length > 0) {
                    var deleteStrategyFunction = this._getDeleteStrategyFunction(strategy);
                    while (sysIDs.length > 0) {
                        var toDelete = sysIDs.splice(0, batchSize);
                        deleteStrategyData.nodeLogger.debug(this._buildLogMessage('Calling delete strategy for sys_ids ' + toDelete + ' of class: ' + className + ' with strategy: ' + strategy));
                        deleteStrategyFunction(className, toDelete, scheduleStartTime);
                    }
                }
            }, this);
        }, this);

        // Reset the accumulator after processing
        deleteStrategyData.accumulatedCIs = {
            priorities: {},
            totalSysIDs: 0
        };
    },

    _getDeleteStrategyFunction: function(deleteStrategyCode) {
        return this.deleteStrategies[deleteStrategyCode].deletionFunction;
    },

    _findRelatedEntries: function(ciClass) {
        var relatedEntries = [];

        // process the related entries for the stale CI
        var relatedEntriesGr = new GlideRecord('cmdb_related_entry');
        var relJoinGr = relatedEntriesGr.addJoinQuery('cmdb_identifier', 'identifier', 'sys_id');
        relJoinGr.addCondition('applies_to', ciClass);
        relatedEntriesGr.query();

        while (relatedEntriesGr.next()) {
            var relatedEntry = {};
            relatedEntry.table = relatedEntriesGr.getValue('table');
            relatedEntry.referenced_field = relatedEntriesGr.getValue('referenced_field');
            relatedEntries.push(relatedEntry);
        }

        return relatedEntries;
    },

    _markCIsAsAbsent: function(className, sysIds) {
        var gr = new GlideRecord(className);
        gr.addQuery('sys_id', 'IN', sysIds);
        gr.query();
        gr.setValue('operational_status', '2'); // non-operational
        gr.setValue('install_status', '100'); //absent
        gr.setValue('state', 'terminated');
        gr.updateMultiple();
    },

    _markCIsAsRetired: function(className, sysIds) {
        var gr = new GlideRecord(className);
        gr.addQuery('sys_id', 'IN', sysIds);
        gr.query();
        gr.setValue('operational_status', '6'); // retired
        gr.setValue('install_status', '7'); //retired
        gr.setValue('state', 'terminated');
        gr.updateMultiple();
    },

    _deleteCIs: function(className, sysIds, scheduleStartTime) {
        this._deleteRelations(className, sysIds, scheduleStartTime);
        var gr = new GlideRecord(className);
        gr.addQuery('sys_id', 'IN', sysIds);
        gr.deleteMultiple();
    },

    _deleteRelations: function(className, sysIds, scheduleStartTime) {
        // for a CI that's being updated to stale, find the relationships that it's referenced in and
        // remove that if the timestamp is not after the discovery schedule launch time
        sysIds.forEach(function(sysId) {
            var relationsGr = new GlideRecord('cmdb_rel_ci');
            relationsGr.addQuery('parent', sysId);
            relationsGr.addQuery('sys_updated_on', '<=', scheduleStartTime);
            relationsGr.deleteMultiple(); // remove the stale relationship from the CMDB
        });
    },

    _getChildrenBySysId: function(cisSysId, scheduleStartTime) {
        var containsChildren = this._getChildrenByRelType('parent', '55c95bf6c0a8010e0118ec7056ebc54d', cisSysId, scheduleStartTime);
        var hostsChildren = this._getChildrenByRelType('child', '5f985e0ec0a8010e00a9714f2a172815', cisSysId, scheduleStartTime);
        var allChildren = Object.assign({}, containsChildren, hostsChildren);
        return allChildren;
    },

    _getChildrenByRelType: function(logicalParentField, relationType, ci, scheduleStartTime) {
        var logicalChildField = (logicalParentField == 'parent') ? 'child' : 'parent',
            children = {};
        var childrenQuery = new GlideRecord('cmdb_rel_ci');
        childrenQuery.addQuery(logicalParentField, ci);
        childrenQuery.addQuery('type', relationType);
        childrenQuery.addQuery(logicalChildField + '.operational_status', 'NOT IN', this._deleteLayerExcludes()); //filter out already reconciled CIs
        childrenQuery.addQuery(logicalChildField + '.last_discovered', '<=', scheduleStartTime); //add stale condition
        childrenQuery.query();

        while (childrenQuery.next()) {
            var sysId = childrenQuery.getValue(logicalChildField) + '';
            var className = childrenQuery[logicalChildField].sys_class_name + '';
            if (className in children)
                children[className].push(sysId);
            else
                children[className] = [sysId];
        }
        return children;
    },

    _getPathBetweenClasses: function(targetClass, sourceClass, path, level) {
        if (level == null)
            level = 0;

        if (level > 4)
            return null;

        if (sourceClass == null || sourceClass == '')
            return null;

        var newPath = [];
        if (path != null)
            path.forEach(function(item) {
                newPath.push(item);
            });

        newPath.push(sourceClass);

        var classHierarchy = SNC.ClassModel.getClassHierachy(sourceClass, 'cmdb_ci');

        // Check host parents
        var hostWalk = new GlideRecord('cmdb_metadata_hosting');
        hostWalk.addQuery('parent_type', 'IN', classHierarchy);
        hostWalk.addQuery('rel_type.name', 'Hosted on::Hosts');
        hostWalk.query();

        var possibleRelationPaths = [];

        while (hostWalk.next()) {
            if (SNC.ClassModel.isInstanceOf(targetClass, hostWalk.child_type)) {
                newPath.push(hostWalk.child_type);
                return newPath;
            }

            possibleRelationPaths.push(hostWalk.child_type);
        }

        for (var i = 0; i < possibleRelationPaths.length; i++) {
            var hostChildPathResult = this._getPathBetweenClasses(targetClass, possibleRelationPaths[i], newPath, level + 1);
            if (hostChildPathResult != null)
                return hostChildPathResult;
        }

        // Check contains parents
        var containWalk = new GlideRecord('cmdb_metadata_containment');
        containWalk.addQuery('ci_type', 'IN', classHierarchy);
        containWalk.addQuery('rel_type.name', 'Contains::Contained by');
        containWalk.query();

        possibleRelationPaths = [];

        while (containWalk.next()) {
            if (SNC.ClassModel.isInstanceOf(targetClass, containWalk.parent_id.ci_type)) {
                newPath.push(containWalk.parent_id.ci_type);
                return newPath;
            }

            possibleRelationPaths.push(containWalk.parent_id.ci_type);
        }

        for (i = 0; i < possibleRelationPaths.length; i++) {
            var containChildPathResult = this._getPathBetweenClasses(targetClass, possibleRelationPaths[i], newPath, level + 1);
            if (containChildPathResult != null)
                return containChildPathResult;
        }

        return null;
    },

    _getRecordByID: function(sysId) {
        var ciRecord = new GlideRecord('cmdb_ci');
        ciRecord.get(sysId);

        return ciRecord;
    },

    _addStaleConditions: function(currentQuery, positionInRelation, scheduleStartTime) {
        currentQuery.addQuery(positionInRelation + '.last_discovered', '<=', scheduleStartTime);
    },

    _addNonStaleConditions: function(currentQuery, positionInRelation, scheduleStartTime) {
        currentQuery.addQuery(positionInRelation + '.last_discovered', '>', scheduleStartTime);
    },

    _addDeleteLayerCommonConditions: function(currentQuery, positionInRelation) {
        currentQuery.addQuery(positionInRelation + '.operational_status', 'NOT IN', this._deleteLayerExcludes());
        currentQuery.addQuery(positionInRelation + '.discovery_source', 'IN', this._deleteLayerSources());
    },

    _enhanceDeleteLayerQuery: function(currentQuery, target, scheduleStartTime) {
        return currentQuery;
    },

    _deleteLayerExcludes: function() {
        return ['2', '6'];
    },

    _deleteLayerSources: function() {
        return ['ServiceNow'];
    },

    _getDeleteStrategyCodeFromData: function(deleteStrategyData) {
        return deleteStrategyData.inputParams.ciTypeToStrategy.get(deleteStrategyData.inputParams.targetCiClass);
    },

    _getStrategyNameByCode: function(deleteStrategyCode) {
        return this.deleteStrategies[deleteStrategyCode].description || 'Unknown'
    },

    _buildLogMessage: function(message) {
        return AbstractDeleteStrategy.LOGGER_NAME_LOG_PREFIX + '[' + this._getScriptTableName() + '_' + this._getScriptSysId() + '] ' + message;
    },

    _getScriptTableName: function() {
        return 'sys_script_include';
    },

    _getScriptSysId: function() {
        return '591e87c1db690010690cf9c31d9619f7';
    },

    type: 'AbstractDeleteStrategy'
};

// A template to create a new strategy script
AbstractDeleteStrategy.deleteStrategyTemplate = 'var sysparm_delete_strategy_name = Class.create(); \
 \
sysparm_delete_strategy_name.prototype = Object.extendsObject(global.AbstractDeleteStrategy, { \
\
	/* \
	 * Override if you want to implement your own custom search logic \
	 * This should return an array of stale CIs sysids \
	 * MUST implement with _getNonStaleCIs \
	 * \
	 * _getStaleCIs: function(scheduleStartTime, ciClass, patternInputs, patternContext, nodeLogger) { \
	 * \t// To use nodeLogger: nodeLogger.[info\\warn\\error\\debug](this._buildLogMessage(message)); \
	 * }, \
	 */ \
\
	/* \
	 * Override if you want to implement your own custom search logic \
	 * This should return an array of non-stale CIs sysids \
	 * MUST implement with _getStaleCIs \
	 * \
	 * _getNonStaleCIs: function(scheduleStartTime, ciClass, patternInputs, patternContext, nodeLogger) { \
	 * \t// To use nodeLogger: nodeLogger.[info\\warn\\error\\debug](this._buildLogMessage(message)); \
	 * }, \
	 */ \
\
	/* \
	 *_getRelationshipPaths: function() { \
	 *  // a sublass can provide additional relationship paths to walk down ex: \
	 * \
	 *  var additionalRelationPaths = {}; \
	 * \
	 *  additionalRelationPaths[\'cmdb_ci_endpoint_block\'] = [ \
	 *     \'cmdb_ci_endpoint_block\', \'cmdb_ci_storage_volume\', \'cmdb_ci_aws_datacenter\' \
	 *  ]; \
	 *  \
	 *  return additionalRelationPaths; \
	 * }, \
	 */ \
\
    // Given a pattern\'s context, return the boundaries needed to identify stale CI\'s \
    // MUST be implemented! \
    _getBoundaryConditions: function(patternContext, nodeLogger) { \
		// To use nodeLogger: nodeLogger.[info\\warn\\error\\debug](this._buildLogMessage(message)); \
		var boundaries = []; \
        return boundaries; \
	}, \
\
	_getScriptTableName: function() { \
		return \'sn_discovery_delete_strategy\'; \
	}, \
\
	_getScriptSysId: function() { \
		return \'sysparm_delete_strategy_sysid\'; \
	}, \
\
	type: \'sysparm_delete_strategy_name\' \
});';

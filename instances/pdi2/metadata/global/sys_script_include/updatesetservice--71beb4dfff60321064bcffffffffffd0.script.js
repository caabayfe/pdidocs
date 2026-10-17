class UpdateSetService {
    static TABLES = {
        UPDATE_SET: 'sys_update_set',
        PROGRESS_WORKER: 'sys_progress_worker',
        UPDATE_VERSION: 'sys_update_version',
        UPDATE_XML: 'sys_update_xml',
        SYS_SCOPE: 'sys_scope'
    };

    static SYSTEM_FIELDS = [
        'sys_created_on',
        'sys_created_by',
        'sys_updated_on',
        'sys_updated_by',
        'sys_mod_count',
        'sys_id',
        'sys_class_name',
        'sys_class_path'
    ];

    static FIELDS = {
        NAME: 'name',
        DESCRIPTION: 'description',
        STATE: 'state',
        PARENT: 'parent',
        BASE: 'base_update_set',
        APPLICATION: 'application',
        IS_DEFAULT: 'is_default',
        STATE_CODE: 'state_code',
        RECORD_NAME: 'record_name',
        SYS_RECORDED_AT: 'sys_recorded_at',
        SYS_CREATED_ON: 'sys_created_on',
        PAYLOAD: 'payload',
        SCOPE: 'scope'
    };

    static RENAME_ERROR_CODES = {
        INVALID_INPUT: 'INVALID_INPUT',
        FORBIDDEN: 'FORBIDDEN',
        NOT_FOUND: 'NOT_FOUND',
        WRITE_FAILED: 'WRITE_FAILED',
        UNEXPECTED: 'UNEXPECTED'
    };

    static STATES = {
        COMPLETE: 'complete',
        IN_PROGRESS: 'in progress',
        CURRENT: 'current'
    };

    static WORKER_STATES = {
        ERROR: 'error'
    };

    // Scan Engine aborts a completion write while its scan of the set is missing or stale,
    // kicking that scan off asynchronously (DEF0885216). Choice values can be returned as labels
    // or stored values, so case and separators are normalized before comparison.
    static SCAN_ENGINE = {
        SCAN_RESULT_TABLE: 'sn_se_scan_result',
        LOCAL_UPDATE_SET_FIELD: 'local_update_set',
        STATUS_FIELD: 'status',
        SCAN_TYPE_FIELD: 'scan_type',
        UPDATED_ON_FIELD: 'sys_updated_on',
        SCAN_TYPE: 'update_set_scan',
        RUNNING_STATUSES: ['getting_ready', 'waiting', 'scanning'],
        // Let a later completion attempt re-trigger Scan Engine instead of honoring an abandoned worker forever.
        MAX_AGE_MINUTES: 15,
        RETRY_AFTER_MS: 3000
    };

    static WORKER_CONFIG = {
        SCRIPT_INCLUDE: 'global.UpdateSetService',
        BACKOUT_METHOD: 'executeBackout',
        BACKOUT_PROGRESS_NAME: 'Update Set Backout: '
    };

    static WORKER_ARGS = {
        UPDATE_SET_SYS_ID: 'updateSetSysId',
        BACKOUT_REASON: 'backoutReason'
    };

    static VALIDATION_FIELDS = {
        UPDATE_SET_SYS_ID: 'updateSetSysId',
        BACKOUT_REASON: 'backoutReason'
    };

    static backoutUpdateSet(updateSetSysId, backoutReason) {
        sn_build_agent.BaeUtils.validateRequiredFields([UpdateSetService.VALIDATION_FIELDS.UPDATE_SET_SYS_ID, UpdateSetService.VALIDATION_FIELDS.BACKOUT_REASON], [updateSetSysId, backoutReason]);

        try {
            const updateSetGr = new GlideRecord(UpdateSetService.TABLES.UPDATE_SET);
            if (!updateSetGr.get(updateSetSysId)) {
                throw new Error('Update set not found: ' + updateSetSysId);
            }

            const state = updateSetGr.getValue(UpdateSetService.FIELDS.STATE);
            if (state !== UpdateSetService.STATES.COMPLETE) {
                throw new Error('Update set must be in complete state to back out. Current state: ' + state);
            }

            const worker = new GlideScriptedHierarchicalWorker();
            worker.setProgressName(UpdateSetService.WORKER_CONFIG.BACKOUT_PROGRESS_NAME + updateSetSysId);
            worker.setScriptIncludeName(UpdateSetService.WORKER_CONFIG.SCRIPT_INCLUDE);
            worker.setScriptIncludeMethod(UpdateSetService.WORKER_CONFIG.BACKOUT_METHOD);
            worker.putMethodArg(UpdateSetService.WORKER_ARGS.UPDATE_SET_SYS_ID, updateSetSysId);
            worker.putMethodArg(UpdateSetService.WORKER_ARGS.BACKOUT_REASON, backoutReason);
            worker.setBackground(true);
            worker.start();

            const progressId = worker.getProgressID();

            gs.info('[UpdateSetService]: Backout initiated for update set ' + updateSetSysId + ' with progress ID: ' + progressId);

            return {
                progressId: progressId,
                updateSetSysId: updateSetSysId
            };
        } catch (error) {
            throw new Error('[UpdateSetService]: Error backing out update set - ' + error.message);
        }
    }

    // NOTE: backoutReason is retained in the signature in the event that we
    // revert to an updated version of SNC.BackOutAPI() that handles scoped apps.
    executeBackout(updateSetSysId, backoutReason) {
        const tracker = new GlideExecutionTracker();

        gs.info('[UpdateSetService]: Starting backout for update set ' + updateSetSysId + ' (reason: ' + backoutReason + ')');

        try {
            tracker.updateDetailMessage('Backing out update set: ' + updateSetSysId);

            const backout = new BuildAgentUpdateSetBackOut(updateSetSysId, { verbose: true, tracker: tracker });
            const stats = backout.backOut();

            gs.info('[UpdateSetService]: Backout completed. reverted=' + stats.reverted +
                ', purged=' + stats.purged + ', skipped=' + stats.skipped +
                ', errors=' + stats.errors + ', deduplicatedMarked=' + stats.deduplicatedMarked);

            if (stats.errors > 0) {
                const errorMsg = 'Backout completed with ' + stats.errors + ' errors for update set ' + updateSetSysId;
                tracker.fail(errorMsg);
                throw new Error(errorMsg);
            }

            tracker.updateDetailMessage('Update set backed out successfully');
            gs.info('[UpdateSetService]: Backout completed for update set ' + updateSetSysId);
        } catch (error) {
            gs.error('[UpdateSetService]: Backout failed - ' + error.message);
            tracker.fail('Backout failed: ' + error.message);
            throw error;
        }
    }

    static waitForProgressCompletion(progressId, maxWaitTime, waitInterval) {
        maxWaitTime = maxWaitTime || 300;
        waitInterval = waitInterval || 5;

        const progressGr = new GlideRecordSecure(UpdateSetService.TABLES.PROGRESS_WORKER);
        let currentWait = 0;
        let isComplete = false;
        let stateCode = '';
        let state = '';

        do {
            if (progressGr.get(progressId)) {
                state = progressGr.getValue('state');
                stateCode = progressGr.getValue(UpdateSetService.FIELDS.STATE_CODE);

                if (state === 'complete' || stateCode === UpdateSetService.WORKER_STATES.ERROR) {
                    isComplete = true;
                    gs.info('[UpdateSetService]: Progress worker completed with state: ' + state + ', state_code: ' + stateCode);
                }
            }

            if (!isComplete) {
                gs.sleep(waitInterval * 1000);
                currentWait += waitInterval;
            }
        } while (!isComplete && currentWait < maxWaitTime);

        if (!isComplete) {
            gs.warn('[UpdateSetService]: Progress worker timed out after ' + maxWaitTime + ' seconds');
            return {
                success: false,
                stateCode: 'timeout',
                message: 'Operation timed out after ' + maxWaitTime + ' seconds'
            };
        }

        const success = stateCode !== UpdateSetService.WORKER_STATES.ERROR;

        return {
            progressId,
            success,
            stateCode,
            state
        };
    }

    static getScopeByFileUpdateVersion(updateVersionId) {
        const gr = new GlideRecordSecure(UpdateSetService.TABLES.UPDATE_VERSION);

        if (!gr.get(updateVersionId)) {
            return {
                name: '',
                label: '',
                sysId: ''
            };
        }

        return {
            name: gr.application?.scope?.toString() || '',
            label: gr.getDisplayValue(UpdateSetService.FIELDS.APPLICATION) || '',
            sysId: gr.getValue(UpdateSetService.FIELDS.APPLICATION) || ''
        };
    }

    static getFieldValue(sysId, fieldName) {
        const gr = new GlideRecordSecure(UpdateSetService.TABLES.UPDATE_VERSION);
        if (!gr.get(sysId)) {
            throw new Error(`[UpdateSetService]: Update version not found for sys_id: ${sysId}`);
        }

        return gr.getValue(fieldName);
    }

    static getLatestUpdateVersionBeforeDate(fileName, beforeDate) {
        const uvGr = new GlideRecordSecure(UpdateSetService.TABLES.UPDATE_VERSION);
        uvGr.addQuery(UpdateSetService.FIELDS.NAME, fileName);
        uvGr.addQuery(UpdateSetService.FIELDS.SYS_CREATED_ON, '<', beforeDate);
        uvGr.orderByDesc(UpdateSetService.FIELDS.SYS_CREATED_ON);
        uvGr.setLimit(1);
        uvGr.query();

        if (uvGr.next()) {
            return uvGr.getUniqueValue();
        }
    }

    static getUpdateVersionByName(fileName) {
        const updateVersionGr = new GlideRecord(UpdateSetService.TABLES.UPDATE_VERSION);
        updateVersionGr.addQuery(UpdateSetService.FIELDS.NAME, fileName);
        updateVersionGr.addQuery(UpdateSetService.FIELDS.STATE, UpdateSetService.STATES.CURRENT);
        updateVersionGr.orderByDesc(UpdateSetService.FIELDS.SYS_RECORDED_AT);
        updateVersionGr.setLimit(1);
        updateVersionGr.query();

        if (updateVersionGr.next()) {
            return {
                updateVersionSysId: updateVersionGr.sys_id.toString(),
                recordName: updateVersionGr.getValue(UpdateSetService.FIELDS.RECORD_NAME),
                payload: updateVersionGr.getValue(UpdateSetService.FIELDS.PAYLOAD)
            };
        }

        return null;
    }

    /**
     * Get version information for a file to determine if it's new or updated
     * This method is called from scoped apps that don't have cross-scope access to sys_update_version
     * @param {string} fileName - name of the file (from sys_update_xml.name)
     * @param {string} currentUpdateSetSysId - sys_id of the current update set
     * @returns {Object} { hasVersionFromOtherUpdateSet: boolean, priorVersionPayload: string|null }
     */
    static getVersionInfoForFile(fileName, currentUpdateSetSysId) {
        const versionGr = new GlideRecord(UpdateSetService.TABLES.UPDATE_VERSION);
        versionGr.addQuery(UpdateSetService.FIELDS.NAME, fileName);
        versionGr.orderByDesc(UpdateSetService.FIELDS.SYS_CREATED_ON);
        versionGr.query();

        // Look through versions to find the most recent one from a DIFFERENT update set
        while (versionGr.next()) {
            const versionUpdateSet = versionGr.getValue('source');

            if (versionUpdateSet !== currentUpdateSetSysId) {
                // Found a version from a different update set
                return {
                    hasVersionFromOtherUpdateSet: true,
                    priorVersionPayload: versionGr.getValue(UpdateSetService.FIELDS.PAYLOAD)
                };
            }
            // Version is from current update set - continue looking for older versions
        }

        // No version from a different update set found
        return {
            hasVersionFromOtherUpdateSet: false,
            priorVersionPayload: null
        };
    }

    /**
     * Create a new update set for an application
     * @param {string} name - The name for the update set
     * @param {string} description - Optional description for the update set
     * @param {string} parentUpdateSetId - Optional parent update set sys_id
     * @param {string} applicationId - Optional sys_id of the application
     * @param {string} state - Optional state of the update set
     * @param {string} baseUpdateSetId - Optional batch base update set sys_id (set on base_update_set)
     * @returns {object} Result object with success status and update set details
     */
    static createUpdateSet(name, description, parentUpdateSetId, applicationId, state, baseUpdateSetId) {
        try {
            if (!name) {
                return {
                    success: false,
                    error: 'Update set name is required'
                };
            }

            // Create new update set record
            const gr = new GlideRecordSecure(UpdateSetService.TABLES.UPDATE_SET);
            gr.initialize();
            gr.setValue(UpdateSetService.FIELDS.NAME, name);

            if (applicationId) {
                gr.setValue(UpdateSetService.FIELDS.APPLICATION, applicationId);
            }

            if (state) {
                gr.setValue(UpdateSetService.FIELDS.STATE, state);
            } else {
                gr.setValue(UpdateSetService.FIELDS.STATE, UpdateSetService.STATES.IN_PROGRESS);
            }

            if (description) {
                gr.setValue(UpdateSetService.FIELDS.DESCRIPTION, description);
            }

            if (parentUpdateSetId) {
                gr.setValue(UpdateSetService.FIELDS.PARENT, parentUpdateSetId);
            }

            if (baseUpdateSetId) {
                gr.setValue(UpdateSetService.FIELDS.BASE, baseUpdateSetId);
            }

            const updateSetId = gr.insert();

            // GlideRecordSecure refuses to write `application`, silently
            // substituting the scope, so a globally scoped app's update set came
            // out as Global. The fluent load then rejected the app-scoped
            // records it contained (DEF0880326). Re-apply the field through
            // GlideRecord, which this global script include is entitled to do,
            // rather than relaxing the secure insert above.
            if (updateSetId && applicationId) {
                const appGr = new GlideRecord(UpdateSetService.TABLES.UPDATE_SET);
                if (
                    appGr.get(updateSetId) &&
                    appGr.getValue(UpdateSetService.FIELDS.APPLICATION) !== applicationId
                ) {
                    appGr.setValue(UpdateSetService.FIELDS.APPLICATION, applicationId);
                    if (!appGr.update()) {
                        gs.warn(
                            '[UpdateSetService.createUpdateSet] Could not set application ' +
                                applicationId +
                                ' on update set ' +
                                updateSetId
                        );
                    }
                }
            }

            if (!updateSetId) {
                gs.error('[UpdateSetService.createUpdateSet] Failed to create update set');
                return {
                    success: false,
                    error: 'Failed to create update set'
                };
            }

            const gus = new GlideUpdateSet();
            gus.set(updateSetId);

            gs.info('[UpdateSetService.createUpdateSet] Successfully created update set: ' + name + ' (' + updateSetId + ') for application: ' + applicationId);

            return {
                success: true,
                message: 'Update set created successfully',
                updateSetId: updateSetId,
                updateSetName: name,
                applicationId: applicationId,
                parentUpdateSetId: parentUpdateSetId,
                baseUpdateSetId: baseUpdateSetId,
                state: UpdateSetService.STATES.IN_PROGRESS
            };
        } catch (error) {
            gs.error('[UpdateSetService.createUpdateSet] Error: ' + error.message);
            return {
                success: false,
                error: 'Failed to create update set: ' + error.message
            };
        }
    }

    /**
     * Delete an update set by its sys_id. When purgePlatformUpdates is true, phantom
     * platform-tracked members are stripped first so the delete ACL permits it.
     * @param {string} updateSetSysId - The sys_id of the update set to delete
     * @param {boolean} [purgePlatformUpdates=false] - strip phantom members before deleting
     * @returns {object} Result object with success status
     */
    static deleteUpdateSet(updateSetSysId, purgePlatformUpdates = false) {
        try {
            if (!updateSetSysId) {
                return {
                    success: false,
                    error: 'Update set sys_id is required'
                };
            }

            // Strip phantom members so the delete ACL permits it; refuse if real changes remain.
            if (purgePlatformUpdates) {
                const purge = UpdateSetService.#purgePhantomMembers(updateSetSysId);
                if (purge.hasRealMember) {
                    return {
                        success: false,
                        error: 'Update set ' + updateSetSysId + ' has non-platform changes; refusing to delete'
                    };
                }
            }

            // Any remaining child sys_update_xml rows are removed by the platform's cascade-delete rule.
            const gr = new GlideRecordSecure(UpdateSetService.TABLES.UPDATE_SET);
            if (!gr.get(updateSetSysId)) {
                gs.warn('[UpdateSetService.deleteUpdateSet] Update set not found: ' + updateSetSysId);
                return {
                    success: false,
                    error: 'Update set not found: ' + updateSetSysId
                };
            }

            // deleteRecord() returns false when a business rule aborts the delete — e.g. the platform's
            // "you cannot delete a default update set" guard. Honor it instead of reporting a false
            // success: a swallowed failure orphans the set while callers log it as deleted.
            if (!gr.deleteRecord()) {
                const reason = gs.getLastErrorMessage() || 'delete blocked';
                gs.error('[UpdateSetService.deleteUpdateSet] deleteRecord() failed for ' + updateSetSysId + ': ' + reason);
                return {
                    success: false,
                    error: 'Failed to delete update set: ' + reason
                };
            }

            gs.info('[UpdateSetService.deleteUpdateSet] Deleted update set: ' + updateSetSysId);
            return { success: true };
        } catch (error) {
            gs.error('[UpdateSetService.deleteUpdateSet] Error: ' + error.message);
            return {
                success: false,
                error: 'Failed to delete update set: ' + error.message
            };
        }
    }

    /**
     * Remove phantom platform-generated members (collection dictionary rows, system-field metadata)
     * from an update set. Uses GlideRecord (global scope required for sys_update_xml deletion).
     * If any real member exists, nothing is stripped and hasRealMember is set.
     * @param {string} updateSetSysId - sys_id of the update set to purge
     * @returns {object} { hasRealMember, deletedCount }
     * @private
     */
    static #purgePhantomMembers(updateSetSysId) {
        const gr = new GlideRecord(UpdateSetService.TABLES.UPDATE_XML);
        gr.addQuery('update_set', updateSetSysId);
        gr.query();

        const phantomMemberSysIds = [];
        let hasRealMember = false;
        while (gr.next()) {
            const fileName = gr.getValue('name');
            if (UpdateSetService.#isPhantomMember(fileName, gr.getValue('payload'), updateSetSysId)) {
                phantomMemberSysIds.push(gr.getUniqueValue());
            } else {
                hasRealMember = true;
                break;
            }
        }

        if (hasRealMember) {
            return { hasRealMember: true, deletedCount: 0 };
        }

        let deletedCount = 0;
        for (let i = 0; i < phantomMemberSysIds.length; i++) {
            const memberGr = new GlideRecord(UpdateSetService.TABLES.UPDATE_XML);
            if (memberGr.get(phantomMemberSysIds[i])) {
                // Suppress business rules so the deletion itself is not re-tracked into sys_update_xml.
                memberGr.setWorkflow(false);
                if (memberGr.deleteRecord()) {
                    deletedCount++;
                } else {
                    gs.warn('[UpdateSetService.#purgePhantomMembers] Failed to delete sys_update_xml ' + phantomMemberSysIds[i]);
                }
            }
        }
        return { hasRealMember: false, deletedCount: deletedCount };
    }

    /**
     * True when a sys_update_xml member is phantom platform noise. Collection dictionary rows
     * are phantom only when versioned in another update set (not the sole capture).
     * @param {string} fileName - update name from sys_update_xml
     * @param {string} payload - XML payload from sys_update_xml
     * @param {string} updateSetSysId - sys_id of the update set the member belongs to
     * @returns {boolean}
     * @private
     */
    static #isPhantomMember(fileName, payload, updateSetSysId) {
        if (UpdateSetService.#isSystemFieldMetadataRecord(fileName, payload)) {
            return true;
        }
        if (UpdateSetService.#isCollectionDictionaryRecord(fileName, payload)) {
            const versionInfo = UpdateSetService.getVersionInfoForFile(fileName, updateSetSysId);
            return !!(versionInfo && versionInfo.hasVersionFromOtherUpdateSet);
        }
        return false;
    }

    /**
     * True when the member is a table-level collection dictionary record (internal_type=collection).
     * @param {string} fileName - update name from sys_update_xml
     * @param {string} payload - XML payload from sys_update_xml
     * @returns {boolean}
     * @private
     */
    static #isCollectionDictionaryRecord(fileName, payload) {
        if (!fileName || fileName.indexOf('sys_dictionary_') !== 0 || !payload) {
            return false;
        }

        try {
            const xmlDoc = new XMLDocument2();
            xmlDoc.parseXML(payload);
            return xmlDoc.getNodeText('//internal_type') === 'collection';
        } catch (e) {
            gs.warn('[UpdateSetService.#isCollectionDictionaryRecord] Error parsing payload: ' + e.message);
            return false;
        }
    }

    /**
     * True when the member is a sys_dictionary/sys_documentation record for a platform-managed
     * system field (sys_created_on, sys_id, etc.).
     * @param {string} fileName - update name from sys_update_xml
     * @param {string} payload - XML payload from sys_update_xml
     * @returns {boolean}
     * @private
     */
    static #isSystemFieldMetadataRecord(fileName, payload) {
        if (!fileName || !payload) return false;

        if (fileName.indexOf('sys_dictionary_') !== 0 && fileName.indexOf('sys_documentation_') !== 0) {
            return false;
        }

        // Match on the record's exact <element> node rather than a fileName suffix. The table and
        // element are both underscore-delimited and cannot be split reliably from the name alone, so
        // a suffix match misclassifies real fields whose name merely ends with a system-field token
        // (e.g. 'parent_sys_id' -> sys_dictionary_<table>_parent_sys_id) and would delete them.
        try {
            const xmlDoc = new XMLDocument2();
            xmlDoc.parseXML(payload);
            const element = xmlDoc.getNodeText('//element');
            return UpdateSetService.SYSTEM_FIELDS.indexOf(element) !== -1;
        } catch (e) {
            gs.warn('[UpdateSetService.#isSystemFieldMetadataRecord] Error parsing payload: ' + e.message);
            return false;
        }
    }

    /**
     * Read Scan Engine's result only after the caller's secured update-set lookup succeeds. This
     * narrow global helper is the intentional privilege boundary: Build Agent users do not normally
     * hold Scan Engine roles, and the returned data remains scoped to the readable update set.
     * @returns {object|null} null when Scan Engine is absent or has no readable scan row
     */
    static #getScanEngineStatus(updateSetSysId) {
        const config = UpdateSetService.SCAN_ENGINE;
        try {
            const gr = new GlideRecord(config.SCAN_RESULT_TABLE);
            if (!gr.isValid()) {
                return null;
            }
            gr.addQuery(config.LOCAL_UPDATE_SET_FIELD, updateSetSysId);
            gr.addQuery(config.SCAN_TYPE_FIELD, config.SCAN_TYPE);
            gr.addQuery(config.UPDATED_ON_FIELD, '>=', gs.minutesAgo(config.MAX_AGE_MINUTES));
            gr.orderByDesc(config.UPDATED_ON_FIELD);
            gr.setLimit(1);
            gr.query();
            if (!gr.next()) {
                return null;
            }
            return {
                status: gr.getValue(config.STATUS_FIELD) || '',
                scanResultId: gr.getUniqueValue(),
                scanLink: gr.getLink(true)
            };
        } catch (e) {
            gs.warn('[UpdateSetService.#getScanEngineStatus] Scan Engine lookup failed for ' + updateSetSysId + ': ' + e.message);
            return null;
        }
    }

    /**
     * Check a readable update-set subtree for an in-flight scan. Restore uses this once before
     * parking the session and completing individual members, avoiding a full subtree scan per member.
     * @returns {object|null} pending result, or null when no scan is in flight
     */
    static getPendingScan(updateSetSysId) {
        if (!updateSetSysId) return null;
        const gr = new GlideRecordSecure(UpdateSetService.TABLES.UPDATE_SET);
        if (!gr.get(updateSetSysId)) {
            gs.warn('[UpdateSetService.getPendingScan] Update set not found: ' + updateSetSysId);
            return null;
        }
        return UpdateSetService.#findPendingScan(updateSetSysId);
    }

    /**
     * Check for an in-flight scan before attempting completion of a set or batch.
     * @returns {object|null} null when there is no readable scan in flight,
     *   otherwise the pending result to propagate to the transaction boundary
     */
    static #findPendingScan(updateSetSysId) {
        const MAX_TRAVERSAL = 50;
        const queue = [updateSetSysId];
        const visited = {};
        let traversed = 0;
        while (queue.length) {
            const id = queue.shift();
            if (visited[id]) continue;
            if (++traversed > MAX_TRAVERSAL) {
                gs.warn('[UpdateSetService.#findPendingScan] Traversal limit reached for subtree rooted at ' + updateSetSysId);
                break;
            }
            visited[id] = true;
            const scan = UpdateSetService.#getScanEngineStatus(id);
            const normalizedStatus = scan && String(scan.status).toLowerCase().replace(/[\s-]+/g, '_');
            if (scan && UpdateSetService.SCAN_ENGINE.RUNNING_STATUSES.indexOf(normalizedStatus) !== -1) {
                return UpdateSetService.#scanPendingResult(id, scan);
            }
            const children = new GlideRecordSecure(UpdateSetService.TABLES.UPDATE_SET);
            children.addQuery('parent', id).addOrCondition('base_update_set', id);
            children.query();
            while (children.next()) {
                queue.push(children.getUniqueValue());
            }
        }
        return null;
    }

    /**
     * Return scan progress without holding the originating transaction open.
     * @returns {object} Pending completion and an ACL-protected scan result link
     */
    static #scanPendingResult(updateSetSysId, scan) {
        return {
            success: false,
            completionProtocol: 1,
            code: 'SCAN_ENGINE_PENDING',
            scanEnginePending: true,
            retryAfterMs: UpdateSetService.SCAN_ENGINE.RETRY_AFTER_MS,
            updateSetSysId: updateSetSysId,
            scanStatus: scan.status,
            scanResultId: scan.scanResultId,
            scanLink: scan.scanLink,
            error: 'Scan Engine is still scanning update set ' + updateSetSysId + ' (status "' + scan.status + '"). Retry completion once the scan finishes. View scan results: ' + scan.scanLink
        };
    }

    /**
     * Mark an update set as complete by its sys_id
     * @param {string} updateSetSysId - The sys_id of the update set to mark as complete
     * @param {string} applicationId - optional application sys_id to correct on the update set
     * @param {boolean} skipPendingScanCheck - true only when the caller already checked the whole subtree
     * @returns {object} Result object with success status and details
     */
    static markUpdateSetComplete(updateSetSysId, applicationId, skipPendingScanCheck) {
        try {
            if (!updateSetSysId) {
                return {
                    success: false,
                    error: 'Update set sys_id is required'
                };
            }

            // Get the update set record
            const gr = new GlideRecordSecure(UpdateSetService.TABLES.UPDATE_SET);
            if (!gr.get(updateSetSysId)) {
                gs.warn('[UpdateSetService.markUpdateSetComplete] Update set not found: ' + updateSetSysId);
                return {
                    success: false,
                    error: 'Update set not found',
                    updateSetSysId: updateSetSysId
                };
            }

            const updateSetName = gr.getValue(UpdateSetService.FIELDS.NAME);
            const currentState = gr.getValue(UpdateSetService.FIELDS.STATE);

            // Completion is idempotent because negotiated clients retry after an asynchronous scan.
            // Still correct a stale application value: the first completion attempt may have supplied
            // the wrong scope, and skipping that overwrite would make retry results order-dependent.
            if (currentState === UpdateSetService.STATES.COMPLETE) {
                if (applicationId && gr.getValue(UpdateSetService.FIELDS.APPLICATION) !== applicationId) {
                    try {
                        const appGr = new GlideRecord(UpdateSetService.TABLES.UPDATE_SET);
                        if (appGr.get(updateSetSysId) && appGr.getValue(UpdateSetService.FIELDS.APPLICATION) !== applicationId) {
                            appGr.setValue(UpdateSetService.FIELDS.APPLICATION, applicationId);
                            if (!appGr.update()) {
                                gs.warn('[UpdateSetService.markUpdateSetComplete] Could not correct application on completed update set ' + updateSetSysId);
                            }
                        }
                    } catch (applicationError) {
                        gs.warn('[UpdateSetService.markUpdateSetComplete] Could not correct application on completed update set ' + updateSetSysId + ': ' + applicationError.message);
                    }
                }
                return { success: true, alreadyComplete: true, updateSetSysId: updateSetSysId, newState: currentState };
            }
            if (currentState !== UpdateSetService.STATES.IN_PROGRESS) {
                gs.error('[UpdateSetService.markUpdateSetComplete] Update set is not in progress. Current state: ' + currentState);
                return {
                    success: false,
                    error: 'Update set must be in progress to be marked complete',
                    currentState: currentState
                };
            }

            if (!skipPendingScanCheck) {
                const pending = UpdateSetService.#findPendingScan(updateSetSysId);
                if (pending) return pending;
            }

            // Set application ID (overwrite if provided, as first one might be incorrect)
            if (applicationId) {
                gr.setValue(UpdateSetService.FIELDS.APPLICATION, applicationId);
                gs.info('[UpdateSetService.markUpdateSetComplete] Set application ID: ' + applicationId);
            }

            // Log the current update set info
            gs.info('[UpdateSetService.markUpdateSetComplete] Found update set: ' + updateSetName + ' (' + updateSetSysId + '), current state: ' + currentState);

            // Mark the update set as complete. update() returns null when the write is rejected (e.g.
            // an ACL abort); surface that as a failure rather than a false success.
            gr.setValue(UpdateSetService.FIELDS.STATE, UpdateSetService.STATES.COMPLETE);
            if (!gr.update()) {
                const reason = gs.getLastErrorMessage() || 'update rejected';
                gs.error('[UpdateSetService.markUpdateSetComplete] Failed to persist complete state for ' + updateSetName + ' (' + updateSetSysId + '): ' + reason);

                // A scan in flight is transient, so return to the caller before retrying; a rejection with no
                // scan pending preserves the platform reason and must not burn the retry budget.
                const pending = UpdateSetService.#findPendingScan(updateSetSysId);
                if (pending) return pending;

                return {
                    success: false,
                    error: 'Failed to mark update set as complete: ' + reason,
                    updateSetSysId: updateSetSysId
                };
            }

            gs.info('[UpdateSetService.markUpdateSetComplete] Successfully marked update set as complete: ' + updateSetName + ' (' + updateSetSysId + ')');

            return {
                success: true,
                message: 'Update set marked as complete successfully',
                updateSetSysId: updateSetSysId,
                updateSetName: updateSetName,
                previousState: currentState,
                newState: UpdateSetService.STATES.COMPLETE
            };
        } catch (error) {
            gs.error('[UpdateSetService.markUpdateSetComplete] Error: ' + error.message);
            return {
                success: false,
                error: 'Failed to mark update set as complete: ' + error.message
            };
        }
    }

    /**
     * Reopen a completed update set back to 'in progress' by its sys_id. The inverse of
     * markUpdateSetComplete: used by checkpoint-restore recovery to return the chain's trailing set
     * to an editable state. Reopening a batch member also flips its batch base back to 'in progress'
     * via the platform's "Reset Batch Status" business rule. Surfaces a rejected write as a failure
     * rather than a false success.
     * @param {string} updateSetSysId - The sys_id of the update set to reopen
     * @returns {object} Result object with success status and details
     */
    static markUpdateSetInProgress(updateSetSysId) {
        try {
            if (!updateSetSysId) {
                return {
                    success: false,
                    error: 'Update set sys_id is required'
                };
            }

            const gr = new GlideRecordSecure(UpdateSetService.TABLES.UPDATE_SET);
            if (!gr.get(updateSetSysId)) {
                gs.warn('[UpdateSetService.markUpdateSetInProgress] Update set not found: ' + updateSetSysId);
                return {
                    success: false,
                    error: 'Update set not found',
                    updateSetSysId: updateSetSysId
                };
            }

            const updateSetName = gr.getValue(UpdateSetService.FIELDS.NAME);
            const currentState = gr.getValue(UpdateSetService.FIELDS.STATE);

            // Already editable — nothing to do.
            if (currentState === UpdateSetService.STATES.IN_PROGRESS) {
                return {
                    success: true,
                    message: 'Update set already in progress',
                    updateSetSysId: updateSetSysId,
                    updateSetName: updateSetName,
                    previousState: currentState,
                    newState: UpdateSetService.STATES.IN_PROGRESS
                };
            }

            gr.setValue(UpdateSetService.FIELDS.STATE, UpdateSetService.STATES.IN_PROGRESS);
            if (!gr.update()) {
                const reason = gs.getLastErrorMessage() || 'update rejected';
                gs.error('[UpdateSetService.markUpdateSetInProgress] Failed to reopen ' + updateSetName + ' (' + updateSetSysId + '): ' + reason);
                return {
                    success: false,
                    error: 'Failed to reopen update set: ' + reason,
                    updateSetSysId: updateSetSysId
                };
            }

            gs.info('[UpdateSetService.markUpdateSetInProgress] Reopened update set to in progress: ' + updateSetName + ' (' + updateSetSysId + ')');

            return {
                success: true,
                message: 'Update set reopened to in progress',
                updateSetSysId: updateSetSysId,
                updateSetName: updateSetName,
                previousState: currentState,
                newState: UpdateSetService.STATES.IN_PROGRESS
            };
        } catch (error) {
            gs.error('[UpdateSetService.markUpdateSetInProgress] Error: ' + error.message);
            return {
                success: false,
                error: 'Failed to reopen update set: ' + error.message
            };
        }
    }

    /**
     * Rename an update set by its sys_id. Writes only sys_update_set.name — state, membership,
     * and parentage are untouched. Surfaces a rejected write as a failure rather than a false
     * success (mirrors markUpdateSetComplete). Idempotent: renaming to the current name succeeds
     * without a write.
     * @param {string} updateSetSysId - The sys_id of the update set to rename
     * @param {string} name - The new name
     * @returns {object} Result object with success status and details
     */
    static #renameUpdateSet(updateSetSysId, name) {
        try {
            const gr = new GlideRecordSecure(UpdateSetService.TABLES.UPDATE_SET);
            if (!gr.get(updateSetSysId)) {
                gs.warn('[UpdateSetService.#renameUpdateSet] Update set not found: ' + updateSetSysId);
                return {
                    success: false,
                    errorCode: UpdateSetService.RENAME_ERROR_CODES.NOT_FOUND,
                    error: 'Update set not found',
                    updateSetSysId: updateSetSysId
                };
            }

            const previousName = gr.getValue(UpdateSetService.FIELDS.NAME);
            // Idempotent: nothing to write when the name already matches.
            if (previousName === name) {
                return {
                    success: true,
                    updateSetSysId: updateSetSysId,
                    updateSetName: name,
                    previousName: previousName,
                    alreadyNamed: true
                };
            }

            gr.setValue(UpdateSetService.FIELDS.NAME, name);
            if (!gr.update()) {
                const reason = gs.getLastErrorMessage() || 'update rejected';
                gs.error('[UpdateSetService.#renameUpdateSet] Failed to rename ' + updateSetSysId + ': ' + reason);
                return {
                    success: false,
                    errorCode: UpdateSetService.RENAME_ERROR_CODES.WRITE_FAILED,
                    error: 'Failed to rename update set: ' + reason,
                    updateSetSysId: updateSetSysId
                };
            }

            gs.info('[UpdateSetService.#renameUpdateSet] Renamed update set ' + updateSetSysId + ' from "' + previousName + '" to "' + name + '"');
            return {
                success: true,
                updateSetSysId: updateSetSysId,
                updateSetName: name,
                previousName: previousName
            };
        } catch (error) {
            gs.error('[UpdateSetService.#renameUpdateSet] Error: ' + error.message);
            return {
                success: false,
                errorCode: UpdateSetService.RENAME_ERROR_CODES.UNEXPECTED,
                error: 'Failed to rename update set: ' + error.message
            };
        }
    }

    /**
     * Rename the default update set for an application. Resolves the scope's is_default set via
     * getDefaultUpdateSetId, then delegates to #renameUpdateSet. Global-scope entry point for scoped
     * callers: used to tie the platform's auto-created "Default" update set back to the work item an
     * app was created for. Returns a failure (not a throw) when the scope has no default set.
     * @param {string} applicationId - sys_id of the application (sys_scope) whose default set to rename
     * @param {string} name - The new name
     * @returns {object} Result object with success status and details
     */
    static renameDefaultUpdateSetForApp(applicationId, name) {
        // Keep validation at this public cross-scope boundary because callers can invoke the service without the REST route.
        if (!applicationId) {
            return { success: false, errorCode: UpdateSetService.RENAME_ERROR_CODES.INVALID_INPUT, error: 'applicationId is required' };
        }
        if (typeof applicationId !== 'string') {
            return { success: false, errorCode: UpdateSetService.RENAME_ERROR_CODES.INVALID_INPUT, error: 'applicationId must be a string' };
        }
        if (!name) {
            return { success: false, errorCode: UpdateSetService.RENAME_ERROR_CODES.INVALID_INPUT, error: 'Update set name is required' };
        }
        if (typeof name !== 'string') {
            return { success: false, errorCode: UpdateSetService.RENAME_ERROR_CODES.INVALID_INPUT, error: 'Update set name must be a string' };
        }

        applicationId = applicationId.trim();
        name = name.trim();
        if (!applicationId) {
            return { success: false, errorCode: UpdateSetService.RENAME_ERROR_CODES.INVALID_INPUT, error: 'applicationId is required' };
        }
        if (!name) {
            return { success: false, errorCode: UpdateSetService.RENAME_ERROR_CODES.INVALID_INPUT, error: 'Update set name is required' };
        }

        if (applicationId === 'global') {
            gs.warn('[UpdateSetService.renameDefaultUpdateSetForApp] Refusing to rename the global default update set for application ' + applicationId);
            return {
                success: false,
                errorCode: UpdateSetService.RENAME_ERROR_CODES.FORBIDDEN,
                error: 'Cannot rename the global default update set',
                applicationId: applicationId
            };
        }

        const scopeGr = new GlideRecordSecure(UpdateSetService.TABLES.SYS_SCOPE);
        if (!scopeGr.get(applicationId)) {
            gs.warn('[UpdateSetService.renameDefaultUpdateSetForApp] Application not found: ' + applicationId);
            return {
                success: false,
                errorCode: UpdateSetService.RENAME_ERROR_CODES.NOT_FOUND,
                error: 'Application not found',
                applicationId: applicationId
            };
        }
        if (scopeGr.getValue(UpdateSetService.FIELDS.SCOPE) === 'global') {
            gs.warn('[UpdateSetService.renameDefaultUpdateSetForApp] Refusing to rename the global default update set for application ' + applicationId);
            return {
                success: false,
                errorCode: UpdateSetService.RENAME_ERROR_CODES.FORBIDDEN,
                error: 'Cannot rename the global default update set',
                applicationId: applicationId
            };
        }

        const defaultUpdateSetId = UpdateSetService.getDefaultUpdateSetId(applicationId);
        if (!defaultUpdateSetId) {
            gs.warn('[UpdateSetService.renameDefaultUpdateSetForApp] No default update set found for application ' + applicationId);
            return {
                success: false,
                errorCode: UpdateSetService.RENAME_ERROR_CODES.NOT_FOUND,
                error: 'No default update set found',
                applicationId: applicationId
            };
        }

        return UpdateSetService.#renameUpdateSet(defaultUpdateSetId, name);
    }

    /**
     * Find the sys_id of the default update set, optionally scoped to an application. The default set
     * is the safe "fall back" current set: checkpoint restore switches the session onto it before
     * completing/backing out a batch so it is never sitting inside the subtree it is about to remove.
     * @param {string} applicationId - sys_id of the application to scope to (optional)
     * @returns {string} sys_id of the default update set, or '' when none exists
     */
    static getDefaultUpdateSetId(applicationId) {
        const gr = new GlideRecordSecure(UpdateSetService.TABLES.UPDATE_SET);
        gr.addQuery(UpdateSetService.FIELDS.IS_DEFAULT, true);
        if (applicationId) {
            gr.addQuery(UpdateSetService.FIELDS.APPLICATION, applicationId);
        }
        gr.setLimit(1);
        gr.query();
        return gr.next() ? gr.getUniqueValue() : '';
    }

    /**
     * Move the session's current update set off the subtree rooted at the given update set, onto that
     * set's application default. Checkpoint restore completes and backs out an update set subtree; if
     * the session's current set is the batch base or one of its members, completing/backing out the
     * set the session is sitting in fails in the non-interactive REST context. Parking on the default
     * first guarantees the session is never inside the subtree.
     * @param {string} rootUpdateSetSysId - sys_id of the subtree root (the update set about to be backed out)
     * @returns {object} Result object with success status
     */
    static parkCurrentUpdateSetOffSubtree(rootUpdateSetSysId) {
        try {
            if (!rootUpdateSetSysId) {
                return { success: false, error: 'Update set sys_id is required' };
            }

            const gr = new GlideRecordSecure(UpdateSetService.TABLES.UPDATE_SET);
            if (!gr.get(rootUpdateSetSysId)) {
                gs.warn('[UpdateSetService.parkCurrentUpdateSetOffSubtree] Update set not found: ' + rootUpdateSetSysId);
                return { success: false, error: 'Update set not found', updateSetSysId: rootUpdateSetSysId };
            }

            const applicationId = gr.getValue(UpdateSetService.FIELDS.APPLICATION);
            const defaultUpdateSetId = UpdateSetService.getDefaultUpdateSetId(applicationId);
            if (!defaultUpdateSetId) {
                gs.warn('[UpdateSetService.parkCurrentUpdateSetOffSubtree] No default update set found for application ' + applicationId);
                return { success: false, error: 'No default update set found', applicationId: applicationId };
            }

            const previousUpdateSetId = new GlideUpdateSet().get();
            gs.info('[UpdateSetService.parkCurrentUpdateSetOffSubtree] Parking current update set on default ' + defaultUpdateSetId + ' (off subtree ' + rootUpdateSetSysId + ')');
            return { ...UpdateSetService.setCurrentUpdateSet(defaultUpdateSetId), previousUpdateSetId: previousUpdateSetId };
        } catch (error) {
            gs.error('[UpdateSetService.parkCurrentUpdateSetOffSubtree] Error: ' + error.message);
            return { success: false, error: 'Failed to park current update set: ' + error.message };
        }
    }

    /**
     * Make an update set current for the executing session. GlideUpdateSet.set() is session-scoped,
     * so call this from a request authenticated as the target user, not a background worker.
     * @param {string} updateSetSysId - sys_id of the update set to make current
     * @returns {object} Result object with success status
     */
    static setCurrentUpdateSet(updateSetSysId) {
        try {
            if (!updateSetSysId) {
                return { success: false, error: 'Update set sys_id is required' };
            }
            const gus = new GlideUpdateSet();
            gus.set(updateSetSysId);
            gs.info('[UpdateSetService.setCurrentUpdateSet] Set current update set: ' + updateSetSysId);
            return { success: true, updateSetId: updateSetSysId };
        } catch (error) {
            gs.error('[UpdateSetService.setCurrentUpdateSet] Error: ' + error.message);
            return { success: false, error: 'Failed to set current update set: ' + error.message };
        }
    }

    /**
     * Batch-link an existing update set under a parent (sys_update_set.parent field assignment only —
     * no sys_update_xml rows are read, copied, or modified). Global-scope entry point for scoped
     * callers: sys_update_set writes from a scoped app silently no-op (cross-scope table policy), so
     * the sn_build_agent release-ops export BR (exportUpdateSetOnPlanComplete, D18) delegates its
     * parent-linking here. Idempotent: re-linking an already-parented set succeeds without a write.
     * @param {string} updateSetSysId - sys_id of the child update set to link
     * @param {string} parentUpdateSetSysId - sys_id of the batch parent
     * @returns {object} Result object with success status
     */
    static setParentUpdateSet(updateSetSysId, parentUpdateSetSysId) {
        try {
            if (!updateSetSysId || !parentUpdateSetSysId) {
                return { success: false, error: 'Both updateSetSysId and parentUpdateSetSysId are required' };
            }
            if (updateSetSysId === parentUpdateSetSysId) {
                return { success: false, error: 'An update set cannot be its own parent' };
            }

            const gr = new GlideRecordSecure(UpdateSetService.TABLES.UPDATE_SET);
            if (!gr.get(updateSetSysId)) {
                gs.warn('[UpdateSetService.setParentUpdateSet] Update set not found: ' + updateSetSysId);
                return { success: false, error: 'Update set not found', updateSetSysId: updateSetSysId };
            }

            if (String(gr.getValue(UpdateSetService.FIELDS.PARENT) || '') === parentUpdateSetSysId) {
                return { success: true, updateSetId: updateSetSysId, parentUpdateSetId: parentUpdateSetSysId, alreadyLinked: true };
            }

            gr.setValue(UpdateSetService.FIELDS.PARENT, parentUpdateSetSysId);
            if (!gr.update()) {
                gs.error('[UpdateSetService.setParentUpdateSet] Failed to link ' + updateSetSysId + ' under ' + parentUpdateSetSysId);
                return { success: false, error: 'Failed to update parent' };
            }

            gs.info('[UpdateSetService.setParentUpdateSet] Linked ' + updateSetSysId + ' under parent ' + parentUpdateSetSysId);
            return { success: true, updateSetId: updateSetSysId, parentUpdateSetId: parentUpdateSetSysId };
        } catch (error) {
            gs.error('[UpdateSetService.setParentUpdateSet] Error: ' + error.message);
            return { success: false, error: 'Failed to set parent update set: ' + error.message };
        }
    }

    /**
     * Un-link an update set from its batch parent (clears sys_update_set.parent). Global-scope
     * entry point for scoped callers, same rationale as setParentUpdateSet — the sn_build_agent
     * relink BR (relinkExportUpdateSetOnPromotion, D18) clears stale children before re-deriving
     * the current promoted set. Idempotent: clearing an unparented set succeeds without a write.
     * @param {string} updateSetSysId - sys_id of the update set to un-link
     * @returns {object} Result object with success status
     */
    static clearParentUpdateSet(updateSetSysId) {
        try {
            if (!updateSetSysId) {
                return { success: false, error: 'updateSetSysId is required' };
            }

            const gr = new GlideRecordSecure(UpdateSetService.TABLES.UPDATE_SET);
            if (!gr.get(updateSetSysId)) {
                gs.warn('[UpdateSetService.clearParentUpdateSet] Update set not found: ' + updateSetSysId);
                return { success: false, error: 'Update set not found', updateSetSysId: updateSetSysId };
            }

            if (!gr.getValue(UpdateSetService.FIELDS.PARENT)) {
                return { success: true, updateSetId: updateSetSysId, alreadyCleared: true };
            }

            gr.setValue(UpdateSetService.FIELDS.PARENT, '');
            if (!gr.update()) {
                gs.error('[UpdateSetService.clearParentUpdateSet] Failed to clear parent on ' + updateSetSysId);
                return { success: false, error: 'Failed to clear parent' };
            }

            gs.info('[UpdateSetService.clearParentUpdateSet] Cleared parent on ' + updateSetSysId);
            return { success: true, updateSetId: updateSetSysId };
        } catch (error) {
            gs.error('[UpdateSetService.clearParentUpdateSet] Error: ' + error.message);
            return { success: false, error: 'Failed to clear parent update set: ' + error.message };
        }
    }
}

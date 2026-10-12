/**
 * Checkpoint Restore Executor for background worker execution.
 * Must be in global scope because GlideScriptedHierarchicalWorker requires
 * the script include to be accessible from the global namespace.
 */
class CheckpointRestoreExecutor {
    static TABLES = {
        CHECKPOINT: 'sn_build_agent_checkpoint',
        CONVERSATION_CHANGE_LOG: 'sn_build_agent_conversation_change_log',
        MESSAGE: 'sn_build_agent_message'
    };

    static FIELDS = {
        SYS_ID: 'sys_id',
        CONVERSATION: 'conversation',
        SEQUENCE: 'sequence',
        CHECKPOINT: 'checkpoint',
        WORKING_SET: 'working_set'
    };

    /**
     * Execute post-processing after backout and ba completes (instance method for GlideScriptedHierarchicalWorker)
     * @param {string} backoutProgressId - progress worker ID of the backout operation
     * @param {string} targetCheckpointId - checkpoint to restore to
     * @param {string} conversationId - conversation ID
     */
    executePostProcessing(backoutProgressId, targetCheckpointId, conversationId) {
        if (!backoutProgressId || !targetCheckpointId || !conversationId) {
            throw new Error('[CheckpointRestoreExecutor]: Missing required parameters - backoutProgressId, targetCheckpointId, and conversationId are all required');
        }

        gs.info('[CheckpointRestoreExecutor]: Post-processing started for checkpoint restore: ' + targetCheckpointId);

        const tracker = new GlideExecutionTracker();

        try {
            tracker.updateDetailMessage('Waiting for backout to complete...');
            const backoutResult = global.UpdateSetService.waitForProgressCompletion(backoutProgressId);

            if (!backoutResult.success) {
                const errorMsg = 'Backout operation failed with state_code: ' + backoutResult.stateCode;
                tracker.fail(errorMsg + ' (from backout worker: ' + backoutProgressId + ')');
                throw new Error(errorMsg);
            }

            tracker.updateDetailMessage('Backout complete. Cleaning up checkpoints and messages...');

            // Resolve sequence once — both app deletion and context clearing need it
            const targetSequence = CheckpointRestoreExecutor._getCheckpointSequence(targetCheckpointId);

            // Delete app before message cleanup — _wasAppCreatedInConversation scans
            // messages that _deleteMessagesAfterCheckpoint removes
            try {
                CheckpointRestoreExecutor._deleteAppIfCreatedInConversation(targetSequence, conversationId);
            } catch (appDeleteError) {
                gs.error('[CheckpointRestoreExecutor]: App deletion failed for checkpoint ' + targetCheckpointId + ': ' + appDeleteError.message);
            }

            // Clear app context separately — the user may have been updating an
            // existing app (not created in this conversation) so context must be
            // reset even when no app was deleted.
            try {
                CheckpointRestoreExecutor._clearAppContextIfInitialCheckpoint(targetSequence, conversationId);
            } catch (clearError) {
                gs.error('[CheckpointRestoreExecutor]: Failed to clear app context for checkpoint ' + targetCheckpointId + ': ' + clearError.message);
            }

            CheckpointRestoreExecutor._deleteMessagesAfterCheckpoint(targetCheckpointId, conversationId);
            CheckpointRestoreExecutor._deleteSubsequentCheckpointsAndChangeLogs(targetCheckpointId, conversationId);
            
            // Working set restoration is best-effort — don't fail the entire restore if it errors
            try {
                CheckpointRestoreExecutor._restoreWorkingSetToConversation(targetCheckpointId, conversationId);
            } catch (wsError) {
                gs.error('[CheckpointRestoreExecutor]: Working set restoration failed for checkpoint ' + targetCheckpointId + ': ' + wsError.message);
            }

            // Restoring to initial checkpoint leaves it in a stale condition so remove it and its hidden message
            // AFTER cleaning up subsequent checkpoints. CP0 restore preserves existing behavior — no
            // manual-edit update set is reopened.
            if (targetSequence === 0) {
                CheckpointRestoreExecutor._deleteMessageByCheckpointId(targetCheckpointId);
                CheckpointRestoreExecutor._deleteCheckpoint(targetCheckpointId);
            } else if (targetSequence > 0) {
                // After cleanup the target checkpoint is the chain tail. Ensure the chain ends with an
                // open manual-edit update set ready for the next user change (STRY64024037 invariant).
                // Best-effort: the user already sees the restore as complete, and the next install
                // self-heals the chain, so a failure here must not fail the restore.
                try {
                    CheckpointRestoreExecutor._openManualEditChainTail(targetCheckpointId, conversationId);
                } catch (chainError) {
                    gs.error('[CheckpointRestoreExecutor]: Failed to open manual-edit chain tail for checkpoint ' + targetCheckpointId + ': ' + chainError.message);
                }
            }

            tracker.updateDetailMessage('Checkpoint restore completed successfully');
            gs.info('[CheckpointRestoreExecutor]: Post-processing completed successfully for checkpoint: ' + targetCheckpointId);
        } catch (error) {
            gs.error('[CheckpointRestoreExecutor]: Post-processing failed for checkpoint ' + targetCheckpointId + ': ' + error.message);
            tracker.fail('Checkpoint restore failed: ' + error.message);
            throw error;
        }
    }

    /**
     * Delete all checkpoints and their change logs created after the target checkpoint
     * @param {string} targetCheckpointId - checkpoint to restore to
     * @param {string} conversationId - conversation ID
     * @private
     */
    static _deleteSubsequentCheckpointsAndChangeLogs(targetCheckpointId, conversationId) {
        const targetGr = new GlideRecordSecure(CheckpointRestoreExecutor.TABLES.CHECKPOINT);
        if (!targetGr.get(targetCheckpointId)) {
            gs.warn('[CheckpointRestoreExecutor]: Target checkpoint not found: ' + targetCheckpointId);
            return;
        }

        const targetSequence = parseInt(targetGr.getValue(CheckpointRestoreExecutor.FIELDS.SEQUENCE), 10);

        // Query checkpoints to delete
        const checkpointsGr = new GlideRecordSecure(CheckpointRestoreExecutor.TABLES.CHECKPOINT);
        checkpointsGr.addQuery(CheckpointRestoreExecutor.FIELDS.CONVERSATION, conversationId);
        checkpointsGr.addQuery(CheckpointRestoreExecutor.FIELDS.SEQUENCE, '>', targetSequence);
        checkpointsGr.query();

        let checkpointCount = 0;
        let changeLogCount = 0;

        // First delete change logs for each checkpoint
        while (checkpointsGr.next()) {
            const checkpointId = checkpointsGr.getUniqueValue();
            try {
                CheckpointRestoreExecutor._deleteChangeLogsForCheckpoint(checkpointId);
                changeLogCount++;
            } catch (error) {
                gs.error('[CheckpointRestoreExecutor]: Failed to delete change logs for checkpoint ' + checkpointId + ': ' + error.message);
            }
        }

        // Now delete the checkpoints
        const deleteGr = new GlideRecordSecure(CheckpointRestoreExecutor.TABLES.CHECKPOINT);
        deleteGr.addQuery(CheckpointRestoreExecutor.FIELDS.CONVERSATION, conversationId);
        deleteGr.addQuery(CheckpointRestoreExecutor.FIELDS.SEQUENCE, '>', targetSequence);
        deleteGr.query();

        checkpointCount = deleteGr.getRowCount();
        deleteGr.deleteMultiple();

        gs.info(
            '[CheckpointRestoreExecutor]: Deleted change logs for ' +
            changeLogCount +
            ' checkpoints and deleted ' +
            checkpointCount +
            ' checkpoints after target checkpoint'
        );
    }

    /**
     * Delete a specific checkpoint
     * @param {string} checkpointId - checkpoint ID to delete
     */
    static _deleteCheckpoint(checkpointId) {
        if (!checkpointId) {
            gs.warn('[CheckpointRestoreExecutor]: No checkpoint ID provided for deletion');
            return;
        }

        const checkpointGr = new GlideRecordSecure(CheckpointRestoreExecutor.TABLES.CHECKPOINT);
        if (!checkpointGr.get(checkpointId)) {
            gs.warn('[CheckpointRestoreExecutor]: Checkpoint not found: ' + checkpointId);
            return;
        }

        try {
            checkpointGr.deleteRecord();
            gs.info(
                '[CheckpointRestoreExecutor]: Deleted checkpoint: ' + checkpointId
            );
        } catch (error) {
            gs.error('[CheckpointRestoreExecutor]: Error deleting checkpoint ' + checkpointId + ': ' + error.message);
        }
    }

    /**
     * Delete change logs for a specific checkpoint
     * @param {string} checkpointId - checkpoint ID
     * @private
     */
    static _deleteChangeLogsForCheckpoint(checkpointId) {
        const gr = new GlideRecordSecure(CheckpointRestoreExecutor.TABLES.CONVERSATION_CHANGE_LOG);
        gr.addQuery(CheckpointRestoreExecutor.FIELDS.CHECKPOINT, checkpointId);
        gr.query();
        gr.deleteMultiple();
    }

    /**
     * Copy the working_set from the target checkpoint back to the conversation.
     * Delegates to sn_build_agent.ConversationManager because this executor runs
     * in global scope and cannot directly update sn_build_agent-scoped tables.
     * @param {string} targetCheckpointId - checkpoint being restored to
     * @param {string} conversationId - conversation ID
     * @private
     */
    static _restoreWorkingSetToConversation(targetCheckpointId, conversationId) {
        const checkpointGr = new GlideRecordSecure(CheckpointRestoreExecutor.TABLES.CHECKPOINT);
        if (!checkpointGr.get(targetCheckpointId)) {
            gs.warn('[CheckpointRestoreExecutor]: Target checkpoint not found for working_set restore: ' + targetCheckpointId);
            return;
        }

        const workingSet = checkpointGr.getValue(CheckpointRestoreExecutor.FIELDS.WORKING_SET);
        sn_build_agent.ConversationManager.updateWorkingSet(conversationId, workingSet);

        gs.info('[CheckpointRestoreExecutor]: Restored working_set from checkpoint ' + targetCheckpointId + ' to conversation ' + conversationId);
    }

    /**
     * Delete all messages after the message associated with the target checkpoint
     * @param {string} targetCheckpointId - The checkpoint ID to restore to
     * @param {string} conversationId - The conversation ID to delete messages from
     * @private
     */
    static _deleteMessagesAfterCheckpoint(targetCheckpointId, conversationId) {
		sn_build_agent.CheckpointManager.deleteMessagesForRestore(targetCheckpointId, conversationId);
    }

    /**
     * Delete message record for a given checkpoint ID
     * @param {string} checkpointId - The checkpoint ID to delete associated message for
     * @private
     */
    static _deleteMessageByCheckpointId(checkpointId) {
        sn_build_agent.CheckpointManager.deleteMessageByCheckpointId(checkpointId);
    }

    /**
     * Resolve the sequence number of a checkpoint.
     * @param {string} checkpointId - checkpoint sys_id
     * @returns {number} sequence number, or -1 if the checkpoint was not found
     * @private
     */
    static _getCheckpointSequence(checkpointId) {
        const checkpointGr = new GlideRecordSecure(CheckpointRestoreExecutor.TABLES.CHECKPOINT);
        if (!checkpointGr.get(checkpointId)) {
            return -1;
        }
        return parseInt(checkpointGr.getValue(CheckpointRestoreExecutor.FIELDS.SEQUENCE), 10);
    }

    /**
     * If the target checkpoint is the initial checkpoint (sequence 0) and the
     * create_new_servicenow_app tool was used successfully during the conversation,
     * delete the application that was created.
     * @param {number} sequence - resolved checkpoint sequence number (-1 if not found)
     * @param {string} conversationId - conversation ID
     * @private
     */
    static _deleteAppIfCreatedInConversation(sequence, conversationId) {
        if (sequence !== 0) {
            if (sequence >= 0) {
                gs.info('[CheckpointRestoreExecutor]: Not restoring to initial checkpoint, skipping app deletion');
            }
            return;
        }

        if (!CheckpointRestoreExecutor._wasAppCreatedInConversation(conversationId)) {
            gs.info('[CheckpointRestoreExecutor]: App was not created in conversation ' + conversationId);
            return;
        }

        const conversationGr = new GlideRecordSecure('sn_build_agent_conversation');
        if (!conversationGr.get(conversationId)) {
            gs.warn('[CheckpointRestoreExecutor]: Conversation not found: ' + conversationId);
            return;
        }

        // application_id stores the scope string (e.g. 'x_snc_my_app'), not a sys_id
        const applicationScope = conversationGr.getValue('application_id');
        if (!applicationScope) {
            gs.warn('[CheckpointRestoreExecutor]: No application_id on conversation ' + conversationId);
            return;
        }

        const appGr = new GlideRecordSecure('sys_app');
        appGr.addQuery('scope', applicationScope);
        appGr.query();
        if (!appGr.next()) {
            gs.warn('[CheckpointRestoreExecutor]: Application record not found: ' + applicationScope);
            return;
        }

        // Safety check: only delete the app if it was created by the conversation owner
        const appCreatedBy = appGr.getValue('sys_created_by');
        const convCreatedBy = conversationGr.getValue('sys_created_by');
        if (appCreatedBy !== convCreatedBy) {
            gs.warn('[CheckpointRestoreExecutor]: App ' + applicationScope + ' was created by ' + appCreatedBy + ', conversation owned by ' + convCreatedBy + ' — skipping deletion');
            return;
        }

        gs.info('[CheckpointRestoreExecutor]: Deleting application ' + applicationScope);
        if (!appGr.deleteRecord()) {
            gs.error('[CheckpointRestoreExecutor]: Failed to delete application ' + applicationScope);
        }
    }

    /**
     * Clear application context and reset title when restoring to the initial checkpoint (sequence 0).
     * Always runs regardless of whether an app was created or deleted — the user may have been
     * updating an existing app rather than creating a new one.
     * @param {number} sequence - resolved checkpoint sequence number (-1 if not found)
     * @param {string} conversationId - conversation ID
     * @private
     */
    static _clearAppContextIfInitialCheckpoint(sequence, conversationId) {
        if (sequence !== 0) {
            return;
        }

        gs.info('[CheckpointRestoreExecutor]: Clearing app context for conversation ' + conversationId);
        // Delegate to scoped ConversationManager — this executor runs in global
        // scope and cannot directly update sn_build_agent-scoped tables.
        sn_build_agent.ConversationManager.clearApplicationContext(conversationId);
    }

    /**
     * Ensure the restored chain tail ends with an open manual-edit update set, mirroring the
     * post-install invariant that the user always has a manual-edit US ready for their next change.
     * Caller guarantees the target is now the chain tail (subsequent checkpoints already removed)
     * and that this only runs for sequence > 0 (CP0 restore is handled separately).
     *
     * The target's own update set is left untouched — it is already complete (a non-tail manual-edit
     * checkpoint was completed by the reconcile of the install that followed it, and an install
     * checkpoint's set is always complete). Regardless of the target's type we simply open a fresh
     * manual-edit US + paired checkpoint at the tail, exactly as the post-install flow does. Reopening
     * the target's own set instead would re-complete and re-log it on the next install, duplicating
     * its conversation change-log entries.
     * @param {string} targetCheckpointId - checkpoint restored to (the chain tail)
     * @param {string} conversationId - conversation ID
     * @private
     */
    static _openManualEditChainTail(targetCheckpointId, conversationId) {
        // This worker runs detached in the system scope, so pass the chat's application explicitly;
        // otherwise the new set would default to the worker's (wrong) scope. A null here lets
        // openManualEditUpdateSet fall back to the target's update set application.
        const applicationId = sn_build_agent.CheckpointManager.getConversationApplicationSysId(conversationId);

        const result = sn_build_agent.CheckpointManager.openManualEditUpdateSet({ conversationId: conversationId, applicationId: applicationId, installCheckpointId: targetCheckpointId });
        gs.info('[CheckpointRestoreExecutor]: Opened new manual-edit update set at tail for restored checkpoint ' + targetCheckpointId);

        // This detached worker can't make the set current for the owner (GlideUpdateSet.set is
        // session-scoped); record it as pending so the owner's session applies it via applyPendingUpdateSet.
        if (result && result.updateSetId) {
            sn_build_agent.ConversationManager.setPendingUpdateSetId(conversationId, result.updateSetId);
        }
    }

    /**
     * Scan conversation messages for a successful create_new_servicenow_app tool execution.
     * @param {string} conversationId - conversation ID
     * @returns {boolean} true if the app was created during this conversation
     * @private
     */
    static _wasAppCreatedInConversation(conversationId) {
        const messageGr = new GlideRecordSecure(CheckpointRestoreExecutor.TABLES.MESSAGE);
        messageGr.addQuery(CheckpointRestoreExecutor.FIELDS.CONVERSATION, conversationId);
        messageGr.addQuery('content', 'CONTAINS', 'create_new_servicenow_app');
        messageGr.orderBy('sys_created_on');
        messageGr.query();

        while (messageGr.next()) {
            try {
                const content = messageGr.getValue('content');
                if (!content) continue;

                const parsed = JSON.parse(content);
                if (parsed.sender === 'assistant-tool' &&
                    parsed.toolActualName === 'create_new_servicenow_app' &&
                    parsed.success === true) {
                    return true;
                }
            } catch (e) {
                // Skip messages with unparseable content
            }
        }

        return false;
    }
}

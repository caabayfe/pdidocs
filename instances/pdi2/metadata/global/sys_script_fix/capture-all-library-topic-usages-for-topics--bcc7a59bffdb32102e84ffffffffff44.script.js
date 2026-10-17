
/**
 *   Phase 1 – Deletes sys_cs_topic_library_usage records incorrectly scoped to
 *             Conversational Studio where the calling topic's sys_scope
 *             does not match. Records without a calling_cs_topic or where
 *             the topic is not found are skipped.
 *
 *   Phase 2 – Creates any missing library usage records for active topics
 *             with the correct sys_scope inherited from the topic.
 */

var CONVO_STUDIO_SCOPE = '16950f38cb5a3daf196aaf884386ef97';

// ──────────────────────────────────────────────
//  Phase 1 – Delete incorrectly scoped records
// ──────────────────────────────────────────────

var cleanupStats = {
    totalRecords: 0,
    recordsDeleted: 0,
    scopeMatched: 0,
    topicNotFound: 0,
    noCallingTopic: 0,
    noLibraryTopic: 0,
    errors: 0
};

gs.info('SNCS Fix: ===== Phase 1 – Delete incorrectly scoped library usage records =====');

var usageGr = new GlideRecord('sys_cs_topic_library_usage');
usageGr.addQuery('sys_scope', CONVO_STUDIO_SCOPE);
usageGr.query();

gs.info('SNCS Fix: Found ' + usageGr.getRowCount() + ' library usage records with sys_scope=' + CONVO_STUDIO_SCOPE);

// Collect sys_ids to delete (avoid modifying while iterating)
var sysIdsToDelete = [];

while (usageGr.next()) {
    cleanupStats.totalRecords++;
    var callingTopicId = usageGr.getValue('calling_cs_topic_id');
    if (!callingTopicId) {
        gs.info('SNCS Fix: No calling_cs_topic_id for usage record ' + usageGr.getUniqueValue() + ', skipping');
        cleanupStats.noCallingTopic++;
        continue;
    }

    var libraryTopicId = usageGr.getValue('library_cs_topic_id');
    if (!libraryTopicId) {
        gs.info('SNCS Fix: No library_cs_topic_id for usage record ' + usageGr.getUniqueValue() + ' (dynamic topic block), skipping');
        cleanupStats.noLibraryTopic++;
        continue;
    }

    var topicGr = new GlideRecord('sys_cs_topic');
    if (!topicGr.get(callingTopicId)) {
        gs.info('SNCS Fix: calling_cs_topic_id ' + callingTopicId + ' not found for usage record ' + usageGr.getUniqueValue() + ', skipping');
        cleanupStats.topicNotFound++;
        continue;
    }

    var topicScope = topicGr.getValue('sys_scope');
    var usageScope = usageGr.getValue('sys_scope');

    if (usageScope !== topicScope) {
        sysIdsToDelete.push(usageGr.getUniqueValue());
    } else {
        cleanupStats.scopeMatched++;
    }
}

gs.info('SNCS Fix: ' + sysIdsToDelete.length + ' records identified for deletion');

// Delete mismatched records
for (var i = 0; i < sysIdsToDelete.length; i++) {
    try {
        var deleteGr = new GlideRecord('sys_cs_topic_library_usage');
        if (!deleteGr.get(sysIdsToDelete[i])) {
            gs.info('SNCS Fix: Record ' + sysIdsToDelete[i] + ' no longer exists, skipping');
            continue;
        }
        if (deleteGr.deleteRecord()) {
            cleanupStats.recordsDeleted++;
        } else {
            gs.info('SNCS Fix: Failed to delete record ' + sysIdsToDelete[i]);
            cleanupStats.errors++;
        }
    } catch (ex) {
        gs.info('SNCS Fix: Exception deleting record ' + sysIdsToDelete[i] + ': ' + ex.message);
        cleanupStats.errors++;
    }
}

gs.info('SNCS Fix: Phase 1 complete');
gs.info('SNCS Fix:   - Total records examined: ' + cleanupStats.totalRecords);
gs.info('SNCS Fix:   - Records deleted: ' + cleanupStats.recordsDeleted);
gs.info('SNCS Fix:   - Records with matching scope (kept): ' + cleanupStats.scopeMatched);
gs.info('SNCS Fix:   - No calling_cs_topic_id (skipped): ' + cleanupStats.noCallingTopic);
gs.info('SNCS Fix:   - calling_cs_topic_id not found (skipped): ' + cleanupStats.topicNotFound);
gs.info('SNCS Fix:   - No library_cs_topic_id (dynamic, skipped): ' + cleanupStats.noLibraryTopic);
gs.info('SNCS Fix:   - Errors: ' + cleanupStats.errors);

// ──────────────────────────────────────────────
//  Phase 2 – Recreate missing library usage records
// ──────────────────────────────────────────────

/**
 * Fix script to populate missing library usage records for active topics
 * This script identifies active topics, extracts library calls from their flow,
 * and creates any missing records in the sys_cs_topic_library_usage table.
 */

// Statistics for tracking progress
var stats = {
    processedTopics: 0,
    topicsWithLibraryCalls: 0,
    libraryCallsFound: 0,
    recordsCreated: 0,
    recordsAlreadyExist: 0,
    skippedDynamicBlocks: 0,
    errors: 0
};

// Get all active topics
var activeTopics = getAllActiveTopics();
gs.info("SNCS Migration:Found " + activeTopics.length + " active topics to check for library usage records");
for (var j = 0; j < activeTopics.length; j++) {
    var topic = activeTopics[j];
    try {
        processTopicLibraryUsage(topic);
        stats.processedTopics++;
    } catch (ex) {
        gs.info("Error processing topic " + topic.sys_id + " (" + topic.name + "): " + ex.message);
        stats.errors++;
    }
}

// Log final statistics
var recordsProcessed = stats.recordsCreated + stats.recordsAlreadyExist;
var netChange = stats.recordsCreated - cleanupStats.recordsDeleted;

gs.info("SNCS Migration: ===== Phase 2 Summary =====");
gs.info("SNCS Migration: - Processed topics: " + stats.processedTopics);
gs.info("SNCS Migration: - Topics with library calls: " + stats.topicsWithLibraryCalls);
gs.info("SNCS Migration: - Library calls found: " + stats.libraryCallsFound);
gs.info("SNCS Migration: - Records processed with valid library_topic_id: " + recordsProcessed + " (" + stats.recordsAlreadyExist + " existed + " + stats.recordsCreated + " created)");
gs.info("SNCS Migration: - Dynamic topic blocks skipped: " + stats.skippedDynamicBlocks + " (" + stats.libraryCallsFound + " found - " + recordsProcessed + " processed)");
gs.info("SNCS Migration: - Phase 1 deleted: " + cleanupStats.recordsDeleted);
gs.info("SNCS Migration: - Phase 2 created: " + stats.recordsCreated);
gs.info("SNCS Migration: - Expected net change: " + netChange + " (verify against actual table count)");
gs.info("SNCS Migration: - Silent insert failures (scope protection): " + (stats.silentFailures || 0));
gs.info("SNCS Migration: - Actually persisted: " + (stats.recordsCreated - (stats.silentFailures || 0)));
gs.info("SNCS Migration: - Errors: " + stats.errors);

/**
 * Get all active topics
 */
function getAllActiveTopics() {
    var activeTopics = [];

    // Get all active topics
    var gr = new GlideRecord('sys_cs_topic');
    gr.addQuery('active', true);
    gr.query();

    var totalActive = 0;

    while (gr.next()) {
        totalActive++;
        activeTopics.push({
            sys_id: gr.getUniqueValue(),
            name: gr.getValue('name'),
            cb_topic_id: gr.getValue('cb_topic_id'),
            sys_scope: gr.getValue('sys_scope')
        });
    }

    gs.info("SNCS Migration:Found " + totalActive + " total active topics");

    return activeTopics;
}

/**
 * Process a single topic to find and record library usage
 */
function processTopicLibraryUsage(topic) {
    var topicId = topic.sys_id;
    var cbTopicId = topic.cb_topic_id;

    if (!cbTopicId) {
        gs.info("No CB topic ID found for topic: " + topicId + " (" + topic.name + ")");
        return;
    }

    // First check if the design_definition field contains library calls directly
    var designTopicGr = new GlideRecord("sys_cb_design_topic");
    designTopicGr.addQuery("design_topic_id", cbTopicId);
    designTopicGr.query();

    if (designTopicGr.next()) {
        // Extract library calls directly from design_definition
        var designDefinition = designTopicGr.getValue('design_definition');
        if (designDefinition) {
            var libraryCallNodes = extractLibraryCallsFromDesignDefinition(topicId, designDefinition);
            if (libraryCallNodes.length > 0) {
                stats.topicsWithLibraryCalls++;
                stats.libraryCallsFound += libraryCallNodes.length;

                gs.info("SNCS Migration:Found " + libraryCallNodes.length + " library calls in topic: " + topicId + " (" + topic.name + ")");

                // Create library usage records for any missing entries
                for (var i = 0; i < libraryCallNodes.length; i++) {
                    var libraryCall = libraryCallNodes[i];
                    createLibraryUsageRecord(topicId, libraryCall, topic.sys_scope);
                }
                return;
            }
        }
    }

    // Fallback to the old method if no design_definition found or no library calls in it
    var cbTopicGr = new GlideRecord("sys_cb_topic");
    if (!cbTopicGr.get(cbTopicId)) {
        gs.info("CB topic not found: " + cbTopicId + " for topic: " + topicId + " (" + topic.name + ")");
        return;
    }

    // Extract graph from CB topic
    var graphJson = cbTopicGr.getValue('graph');
    if (!graphJson) {
        gs.info("SNCS Migration:No graph found for CB topic: " + cbTopicId + " for topic: " + topicId + " (" + topic.name + ")");
        return;
    }

    // Extract library calls from the graph
    var extractedLibraryCallNodes = extractLibraryCallNodes(topicId, graphJson);
    if (extractedLibraryCallNodes.length === 0) {
        gs.info("SNCS Migration:No library calls found in topic: " + topicId + " (" + topic.name + ")");
        return;
    }

    stats.topicsWithLibraryCalls++;
    stats.libraryCallsFound += extractedLibraryCallNodes.length;

    gs.info("SNCS Migration:Found " + extractedLibraryCallNodes.length + " library calls in topic: " + topicId + " (" + topic.name + ")");

    // Create library usage records for any missing entries
    for (var i = 0; i < extractedLibraryCallNodes.length; i++) {
        var extractedLibraryCall = extractedLibraryCallNodes[i];
        createLibraryUsageRecord(topicId, extractedLibraryCall, topic.sys_scope);
    }
}

/**
 * Extract library calls directly from design_definition JSON
 */
function extractLibraryCallsFromDesignDefinition(topicId, designDefinitionJson) {
    var libraryCallNodes = [];

    try {
        var designDefinition = JSON.parse(designDefinitionJson);

        // Check if the design definition contains goals
        if (designDefinition.goals) {
            // Iterate through each goal (goals is an object, not an array)
            Object.keys(designDefinition.goals).forEach(function(goalKey) {
                var goal = designDefinition.goals[goalKey];

                // Check if goal has nodes
                if (goal.nodes && Array.isArray(goal.nodes)) {
                    // Find all LibraryCall nodes
                    goal.nodes.forEach(function(node) {
                        if (node.type === "LibraryCall") {
                            // Make sure goal_id is set on the node
                            node.goal_id = node.goal_id || goalKey || "primary";
                            libraryCallNodes.push(node);
                        }
                    });
                }
            });
        }
    } catch (ex) {
        gs.info("Error parsing design definition JSON for topic " + topicId + ": " + ex.message);
    }

    return libraryCallNodes;
}

/**
 * Extract library call nodes from topic graph JSON
 */
function extractLibraryCallNodes(topicId, graphJson) {
    var libraryCallNodes = [];

    try {
        var graph = JSON.parse(graphJson);

        // Process all goals, not just primary
        if (graph.goals) {
            Object.keys(graph.goals).forEach(function(goalKey) {
                var goal = graph.goals[goalKey];

                // Process nodes in this goal
                if (goal && goal.nodes) {
                    Object.keys(goal.nodes).forEach(function(nodeId) {
                        var node = goal.nodes[nodeId];

                        if (node.stepType === 'ReusableTopic') {
                            // Add goal_id to the node for context
                            node.goal_id = goalKey;

                            // Format node to match what we need for library usage record
                            var libraryCallNode = formatLibraryCallNode(node, nodeId);
                            libraryCallNodes.push(libraryCallNode);
                        }
                    });
                }

            });
        }
    } catch (ex) {
        gs.info("SNCS Migration: Error parsing graph JSON for topic " + topicId + ": " + ex.message);
    }

    return libraryCallNodes;
}

/**
 * Format a library call node to match the expected format for library usage records
 */
function formatLibraryCallNode(node, nodeId) {
    // Create a standardized library call object that matches the expected format
    var libraryCall = {
        "type": "LibraryCall",
        "id": node.id || nodeId,
        "name": node.name || "",
        "goal_id": node.goal_id || "primary",
        "library_topic_id": node.reusableTopicId || node.library_topic_id || "",
        "library_topic_name": node.reusableTopicName || node.library_topic_name || "",
        "library_topic_is_template": node.library_topic_is_template || false,
        "expert_mode": node.expert_mode || false
    };

    // Add parameter mappings if present
    if (node["parameter-mappings"] || node.parameterMappings) {
        libraryCall["parameter-mappings"] = node["parameter-mappings"] || node.parameterMappings || [];
    } else {
        libraryCall["parameter-mappings"] = [];
    }

    // Add return value mappings if present
    if (node["return-value-mappings"] || node.returnValueMappings) {
        libraryCall["return-value-mappings"] = node["return-value-mappings"] || node.returnValueMappings || [];
    } else {
        libraryCall["return-value-mappings"] = [];
    }

    // Add header card fields if present
    if (node["header_card_fields"] || node.headerCardFields) {
        libraryCall["header_card_fields"] = node["header_card_fields"] || node.headerCardFields || [];
    } else {
        libraryCall["header_card_fields"] = [];
    }

    // Add applicability if present
    if (node.applicability) {
        libraryCall["applicability"] = node.applicability;
    } else {
        libraryCall["applicability"] = {
            "type": "Applicability",
            "mode": "script",
            "value": "true"
        };
    }

    return libraryCall;
}

/**
 * Create a library usage record
 */
function createLibraryUsageRecord(topicId, libraryCall, sysScope) {
    if (!libraryCall.library_topic_id && libraryCall.reusableTopicId) {
        libraryCall.library_topic_id = libraryCall.reusableTopicId;
    }

    if (!libraryCall.library_topic_id || !libraryCall.id) {
        gs.info("Library call missing required fields (dynamic topic block): " + JSON.stringify(libraryCall));
        stats.skippedDynamicBlocks++;
        return;
    }

    // Check if record already exists (exact match on all 3 fields)
    var existingGr = new GlideRecord("sys_cs_topic_library_usage");
    existingGr.addQuery("node_id", libraryCall.id);
    existingGr.addQuery("calling_cs_topic_id", topicId);
    existingGr.addQuery("library_cs_topic_id", libraryCall.library_topic_id);
    existingGr.query();
    if (existingGr.next()) {
        gs.info("SNCS Migration:Library usage record already exists for topic " + topicId + " and node " + libraryCall.id + " (" + libraryCall.name + ")");
        stats.recordsAlreadyExist++;
        return;
    }

    // DEBUG: Check if ANY record exists with same node_id and calling_cs_topic_id (regardless of library_cs_topic_id)
    var partialMatchGr = new GlideRecord("sys_cs_topic_library_usage");
    partialMatchGr.addQuery("node_id", libraryCall.id);
    partialMatchGr.addQuery("calling_cs_topic_id", topicId);
    partialMatchGr.query();
    var partialCount = partialMatchGr.getRowCount();
    if (partialCount > 0) {
        partialMatchGr.next();
        gs.info("SNCS Migration: DEBUG - Found " + partialCount + " partial match(es). Existing: library_cs_topic_id=" + partialMatchGr.getValue("library_cs_topic_id") + ", sys_scope=" + partialMatchGr.getValue("sys_scope") + ". New: library_cs_topic_id=" + libraryCall.library_topic_id + " for topic " + topicId + " node " + libraryCall.id);
    } else {
        gs.info("SNCS Migration: DEBUG - No existing record found for topic " + topicId + " node " + libraryCall.id + " - this is a NEW record");
    }

    try {
        // Create new record
        var gr = new GlideRecord("sys_cs_topic_library_usage");
        gr.initialize();
        gr.setValue("calling_cs_topic_id", topicId);
        gr.setValue("library_cs_topic_id", libraryCall.library_topic_id);
        gr.setValue("node_id", libraryCall.id);
        if (sysScope) {
            gr.setValue("sys_scope", sysScope);
        }

        // Format library usage JSON to match expected structure
        var libraryUsage = JSON.stringify(libraryCall);
        gr.setValue("library_usage", libraryUsage);

        var sysId = gr.insert();
        if (sysId) {
            stats.recordsCreated++;
            gs.info("SNCS Migration: Created library usage record: " + sysId + " for topic " + topicId + " node " + libraryCall.id + " with sys_scope=" + (sysScope || "NOT SET") + " (" + libraryCall.name + ")");
            // Verify the record actually persisted
            var verifyGr = new GlideRecord("sys_cs_topic_library_usage");
            if (!verifyGr.get(sysId)) {
                gs.info("SNCS Migration: WARNING - Record " + sysId + " was NOT persisted (scope protection?) - topic " + topicId + " node " + libraryCall.id + " target sys_scope=" + (sysScope || "NOT SET"));
                stats.silentFailures = (stats.silentFailures || 0) + 1;
            }
        } else {
            gs.info("SNCS Migration: Failed to create library usage record for topic " + topicId + " and node " + libraryCall.id);
            stats.errors++;
        }
    } catch (ex) {
        gs.info("SNCS Migration: Exception creating library usage record for topic " + topicId + ": " + ex.message);
        stats.errors++;
    }
}

(function() {
    if (pm.isZboot()) return;
    var DEPLOYMENT_CONFIG_TABLE = 'sys_now_assist_deployment_config';
    var DEPLOYMENT_CONFIG_ATTRS_TABLE = 'sys_now_assist_deployment_config_attributes';
    var DEPLOYMENT_TABLE = 'sys_now_assist_deployment';
    var MAPPING_TABLE = 'knowledge_based_question_service_mapping';
    var QUESTION_TABLE = 'knowledge_based_question';

    var PRIMARY_ATTR = 'primary_identification_type';
    var SECONDARY_ATTR = 'secondary_identification_type';

    var migratedCount = 0;
    var skippedCount = 0;
    var errorCount = 0;

    // Find deployment configs for voice assistant deployments only
    var configGr = new GlideRecord(DEPLOYMENT_CONFIG_TABLE);
    if (!configGr.isValid()) {
        gs.error('KB Redesign Migration: ' + DEPLOYMENT_CONFIG_TABLE + ' table is not valid');
        return;
    }
    configGr.addQuery('now_assist_deployment.assistant_type', 'voice');
    configGr.query();

    while (configGr.next()) {
        var deploymentId = configGr.getValue('now_assist_deployment');
        if (!deploymentId) continue;

        // Get attributes for this deployment config
        var primaryQuestionId = _getAttributeValue(configGr.getUniqueValue(), PRIMARY_ATTR);
        var secondaryQuestionId = _getAttributeValue(configGr.getUniqueValue(), SECONDARY_ATTR);

        // Migrate primary identification question
        if (primaryQuestionId) {
            var result = _createMappingRecord(primaryQuestionId, deploymentId, 'identification', 'primary');
            if (result === 'created') migratedCount++;
            else if (result === 'exists') skippedCount++;
            else errorCount++;
        }

        // Migrate secondary/fallback identification question
        if (secondaryQuestionId) {
            var result2 = _createMappingRecord(secondaryQuestionId, deploymentId, 'identification', 'fallback');
            if (result2 === 'created') migratedCount++;
            else if (result2 === 'exists') skippedCount++;
            else errorCount++;
        }
    }

    gs.info('KB Redesign Migration: Migrated ' + migratedCount + ' deployment config attributes to mapping table, skipped ' + skippedCount + ' (already exist), errors: ' + errorCount);

    function _getAttributeValue(configId, attrName) {
        var attrGr = new GlideRecord(DEPLOYMENT_CONFIG_ATTRS_TABLE);
        if (!attrGr.isValid()) return null;
        attrGr.addQuery('deployment_config', configId);
        attrGr.addQuery('name', attrName);
        attrGr.setLimit(1);
        attrGr.query();
        if (attrGr.next()) {
            var val = attrGr.getValue('value');
            return (val && val.trim() !== '') ? val.trim() : null;
        }
        return null;
    }

    function _createMappingRecord(questionId, deploymentId, type, usage) {
        // Validate question exists
        var questionGr = new GlideRecord(QUESTION_TABLE);
        if (!questionGr.get(questionId)) {
            gs.warn('KB Redesign Migration: Question ' + questionId + ' not found, skipping');
            return 'error';
        }

        // Check if mapping already exists
        var existingGr = new GlideRecord(MAPPING_TABLE);
        if (!existingGr.isValid()) return 'error';
        existingGr.addQuery('question', questionId);
        existingGr.addQuery('service_profile', deploymentId);
        existingGr.addQuery('type', type);
        existingGr.setLimit(1);
        existingGr.query();
        if (existingGr.next()) {
            var needsUpdate = false;
            if (existingGr.getValue('usage') !== usage) {
                existingGr.setValue('usage', usage);
                needsUpdate = true;
            }
            if (existingGr.getValue('active') != 1) {
                existingGr.setValue('active', true);
                needsUpdate = true;
            }
            if (needsUpdate) {
                existingGr.setWorkflow(false);
                existingGr.autoSysFields(false);
                existingGr.update();
                gs.info('KB Redesign Migration: Updated existing mapping ' + existingGr.getUniqueValue() + ' (usage=' + usage + ', active=true)');
                return 'created';
            }
            return 'exists';
        }

        // Create mapping record
        var mappingGr = new GlideRecord(MAPPING_TABLE);
        if (!mappingGr.isValid()) return null;
        mappingGr.initialize();
        mappingGr.setValue('question', questionId);
        mappingGr.setValue('service_profile_table', DEPLOYMENT_TABLE);
        mappingGr.setValue('service_profile', deploymentId);
        mappingGr.setValue('type', type);
        mappingGr.setValue('usage', usage);
        mappingGr.setValue('active', true);
        mappingGr.setWorkflow(false);
        mappingGr.autoSysFields(false);
        var insertedId = mappingGr.insert();

        if (insertedId) {
            gs.info('KB Redesign Migration: Created mapping record ' + insertedId + ' for question ' + questionId + ' -> deployment ' + deploymentId + ' (type=' + type + ', usage=' + usage + ')');
            return 'created';
        } else {
            gs.error('KB Redesign Migration: Failed to create mapping record for question ' + questionId + ' -> deployment ' + deploymentId);
            return 'error';
        }
    }
})();

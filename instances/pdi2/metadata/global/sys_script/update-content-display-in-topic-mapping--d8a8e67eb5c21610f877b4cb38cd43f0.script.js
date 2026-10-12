(function executeRule(current, previous /*null when async*/) {
  if(current.operation() == 'insert') {
        var kbGr = new GlideRecord('m2m_connected_content');
        var KB_CONTENT_TYPE = '4c32a92153622010069addeeff7b12a3';
        var updatedContentDisplayValue = getContentDisplayValueForInitialVersion(current);
        kbGr.addQuery('content_type', KB_CONTENT_TYPE);
        kbGr.addQuery('knowledge.sys_id', current.sys_id);
        kbGr.query();
        kbGr.setValue('content_display_value', updatedContentDisplayValue);
        kbGr.updateMultiple();
    } else if (current.operation() == 'update') {
        handleUpdate(current, previous);
    }
    function getContentDisplayValueForInitialVersion(current) {
        var version = (new KBVersioning())._getInitialVersion(current);
        var knowledgeNumber = current.number + '';
        displayValue = gs.getMessage("Knowledge: {0} v{1}", [knowledgeNumber, version]);

        return displayValue;
    }

    function handleUpdate(current, previous) {
        updateContentDisplayValue(current, previous);
        if (current.workflow_state == 'published' && previous.workflow_state != 'published') {
            updateNewVersionForFeaturedContent(current.sys_id, current.number);
        }
    }

    function updateContentDisplayValue(currentKB, previousKB) {
        var updatedContentDisplayValue = getContentDisplayValue(currentKB, previousKB);
        var kbGr = new GlideRecord('m2m_connected_content');
        var KB_CONTENT_TYPE = '4c32a92153622010069addeeff7b12a3';
        kbGr.addQuery('content_type', KB_CONTENT_TYPE);
        kbGr.addQuery('knowledge.sys_id', currentKB.sys_id);
        kbGr.query();
        kbGr.setValue('content_display_value', updatedContentDisplayValue);
        kbGr.updateMultiple();
    }

    function updateNewVersionForFeaturedContent(currentKbSysId, currentKbNumber) {
        var KB_CONTENT_TYPE = '4c32a92153622010069addeeff7b12a3';
        var checkoutArticleTaxonomyMappingGr = new GlideRecord('m2m_connected_content');
        checkoutArticleTaxonomyMappingGr.addQuery('knowledge.sys_id', currentKbSysId);
        checkoutArticleTaxonomyMappingGr.addQuery('content_type', KB_CONTENT_TYPE);
        checkoutArticleTaxonomyMappingGr.query();

        while (checkoutArticleTaxonomyMappingGr.next()) {
            updateFeaturedContent(currentKbSysId, currentKbNumber, checkoutArticleTaxonomyMappingGr.getUniqueValue(), checkoutArticleTaxonomyMappingGr.topic);
        }
    }

    function updateFeaturedContent(currentKbSysId, currentKbNumber, newContentSysId, topic) {
        var featuredContentGr = new GlideRecord('featured_content');
        featuredContentGr.addQuery('connected_content.knowledge', '!=', currentKbSysId);
        featuredContentGr.addQuery('connected_content.knowledge.number', currentKbNumber);
        featuredContentGr.addQuery('connected_content.topic', topic);
        featuredContentGr.query();
        featuredContentGr.setValue('connected_content', newContentSysId);
        featuredContentGr.updateMultiple();
    }

	function getContentDisplayValue(currentKB, previousKB) {
        if (new KBCommon().isVersioningEnabled() && (currentKB.workflow_state == 'published' && isMinorVersion(currentKB.version.version))) {
            var nextMajorVersion = (new KBVersioning())._nextMajorVersion(currentKB.version.version + '');
            var knowledgeNumber = currentKB.number + '';
            var displayValue = gs.getMessage("Knowledge: {0} v{1}", [knowledgeNumber, nextMajorVersion]);
            
            return displayValue;
        } else if (new KBCommon().isVersioningEnabled() && (currentKB.workflow_state != previousKB.workflow_state && isMinorVersion(currentKB.version.version))) {
            var nextMinorVersion = (new KBVersioning())._nextMinorVersion(currentKB.version.version + '');
            knowledgeNumber = currentKB.number + '';
            displayValue = gs.getMessage("Knowledge: {0} v{1}", [knowledgeNumber, nextMinorVersion]);

            return displayValue;
        }
        return gs.getMessage("Knowledge: {0}", [currentKB.getDisplayValue()]);
    }

    function isMinorVersion(version){
        var digits = version.split('.');
        if(digits.length > 0 && digits[1]!=0)
            return true;
        else
            return false;
    }

})(current, previous);

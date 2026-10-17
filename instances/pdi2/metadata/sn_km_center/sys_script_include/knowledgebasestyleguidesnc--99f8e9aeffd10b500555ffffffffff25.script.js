var KnowledgeBaseStyleGuideSNC = Class.create();
KnowledgeBaseStyleGuideSNC.prototype = {

	LOG_PROPERTY: 'sn_km_center.kb_style_guide.debug',

    initialize: function() {
        this._debugEnabled = gs.getProperty(this.LOG_PROPERTY) === 'true';
    },

	/**
     * Logs a message when the debug property sn_km_center.kb_style_guide.debug is set to true.
     *
     * @param {string} scriptIncludeName - Name of the calling script include.
     * @param {string} method            - Name of the calling method.
     * @param {string} msg               - Message to log.
     */
    _log: function(method, msg) {
        if (!this._debugEnabled) return;
        var logger = new sn_log.GlideLogger('sn_km_center');
        logger.info('sn_km_center : KnowledgeBaseStyleGuideSNC : ' + method + ' : ' + msg);
    },

    /**
     * Returns the list of style guides associated with a knowledge base.
     *
     * @param {string} knowledgeBaseSysId - sys_id of the knowledge base.
     * @returns {Array<{name: string, sys_id: string, order: number, description: string}>}
     */
    getStyleGuidesForKnowledgeBase: function(knowledgeBaseSysId) {
        this._log('getStyleGuidesForKnowledgeBase', 'knowledgeBaseSysId=' + knowledgeBaseSysId);
        var results = [];
        var m2mRecord = new GlideRecordSecure('kb_style_guide_m2m_knowledge_base');
        m2mRecord.addQuery('kb_knowledge_base', knowledgeBaseSysId);
        m2mRecord.addQuery('kb_knowledge_style_guide.active', 'true');
        m2mRecord.orderBy('order');
        m2mRecord.query();
        while (m2mRecord.next()) {
            var styleGuideRecord = m2mRecord.getElement('kb_knowledge_style_guide').getRefRecord();
            results.push({
                name: styleGuideRecord.getDisplayValue('name'),
                sys_id: styleGuideRecord.getValue('sys_id'),
                order: parseInt(m2mRecord.getValue('order'), 10) || 0,
                description: styleGuideRecord.getDisplayValue('description')
            });
        }
        return results;
    },

    /**
     * Returns a single active style guide, including its rich-text content.
     * Inactive style guides are not returned.
     *
     * @param {string} sysId - sys_id of the style guide.
     * @returns {{name: string, sys_id: string, description: string, content: string} | null}
     */
    getStyleGuide: function(sysId) {
        this._log('getStyleGuide', 'sysId=' + sysId);
        var styleGuideRecord = new GlideRecordSecure('kb_knowledge_style_guide');
        if (!styleGuideRecord.get(sysId)) return null;
		this._log('getStyleGuide', 'active=' + styleGuideRecord.getValue('active'));
        if (styleGuideRecord.getValue('active') !== '1') return null;
        return {
            name: styleGuideRecord.getDisplayValue('name'),
            sys_id: styleGuideRecord.getValue('sys_id'),
            description: styleGuideRecord.getDisplayValue('description'),
            content: styleGuideRecord.getDisplayValue('content')
        };
    },

    type: 'KnowledgeBaseStyleGuideSNC'
};

var ITSMHighlightedValueUtilsSNC = Class.create();
ITSMHighlightedValueUtilsSNC.prototype = {

    LOG_PROPERTY: 'com.snc.itsm_workspace.log.level',
    HIGHLIGHTED_VALUE_CACHE: 'highlighted_value_workspace_cache',

    initialize: function(_gr, _gs) {
        this._gr = _gr || current;
        this._gs = _gs || gs;
        this._log = new global.GSLog(this.LOG_PROPERTY, this.type).setLog4J();
    },

    getHighlightedAttributes: function(appId) {
        appId = appId ? appId : '';
        if (!appId)
            return null;

        var highlightedAttributes = this._getHighlightedAttributes(appId);
        var highlightedAttributesFields = this._getHighlightedAttributesFields(highlightedAttributes, this._gr);

        if (this._log.atLevel(global.GSLog.DEBUG))
            this._log.debug('[getHighlightedAttributes] highlightedAttributesFields: ' + JSON.stringify(highlightedAttributesFields));

        return highlightedAttributesFields;
    },

    _getHighlightedAttributesFields: function(highlightedAttributes, record) {
        if (!highlightedAttributes)
            return null;

        var highlightedAttributesFields = {};

        var table = this._gr.getTableName();

        if (!highlightedAttributes[table])
            return null;
        var fields = Object.keys(highlightedAttributes[table]);

        fields.forEach(function(field) {
            var highlightedValueConditions = highlightedAttributes && highlightedAttributes[table] && highlightedAttributes[table][field] ? highlightedAttributes[table][field] : null;
            if (highlightedValueConditions) {
                highlightedAttributesFields[table] = highlightedAttributesFields[table] ? highlightedAttributesFields[table] : {};
                highlightedAttributesFields[table][field] = this._getFirstMatch(record, highlightedValueConditions);
            }
        }, this);

        return highlightedAttributesFields;
    },

    _getFirstMatch: function(record, highlightedValueConditions) {
        if (!record || !Array.isArray(highlightedValueConditions))
            return null;

        for (var i = 0; i < highlightedValueConditions.length; i++) {
            var highlightedValueConfig = highlightedValueConditions[i];
            var condition = highlightedValueConfig && highlightedValueConfig.conditions && highlightedValueConfig.conditions.value ? highlightedValueConfig.conditions.value : '';
            if (GlideFilter.checkRecord(record, condition))
                return {
                    variant: highlightedValueConfig.variant,
                    color: highlightedValueConfig.color,
                    icon: highlightedValueConfig.icon,
                    value_override: highlightedValueConfig.value_override
                };
        }
        return null;
    },

    _getHighlightedAttributes: function(appId) {
        if (!appId || !this._gr || !this._gr.canRead() || !this._gr.getTableName())
            return null;

        var key = this.getCacheKey(appId, true);
        var highlightedAttributesStr = sn_scoped_cache.ScopedCacheManager.get(this.HIGHLIGHTED_VALUE_CACHE, key);
        if (highlightedAttributesStr)
            return JSON.parse(highlightedAttributesStr);

        var table = this._gr.getTableName();

        var highlightedValueConfigSysId = this._getHighlightedValueConfigSysId(appId);
        if (!highlightedValueConfigSysId)
            return null;

        var highlightedValueSysIds = this._getHighlightedValueSysIds(highlightedValueConfigSysId);
        if (!highlightedValueSysIds)
            return null;

        var uniqueFields = this._getHighlightedFields(highlightedValueSysIds, table);
        if (!Array.isArray(uniqueFields))
            return null;

        var highlightedAttributes = {};
        uniqueFields.forEach(function(field) {
            this._getHighlightedAttributesByField(highlightedValueSysIds, highlightedValueConfigSysId, table, field, highlightedAttributes);
        }, this);

        highlightedAttributesStr = JSON.stringify(highlightedAttributes);
        sn_scoped_cache.ScopedCacheManager.put(this.HIGHLIGHTED_VALUE_CACHE, key, highlightedAttributesStr);

        return JSON.parse(highlightedAttributesStr);
    },

    _getHighlightedValueConfigSysId: function(appId) {
        if (!appId)
            return null;

        var highlightedValueConfigSysId = null;
        var pagePropGr = new GlideRecordSecure('sys_ux_page_property');
        pagePropGr.addQuery('page', appId);
        pagePropGr.addQuery('name', 'highlightedValueConfigId');
        pagePropGr.query();
        if (pagePropGr.next())
            highlightedValueConfigSysId = pagePropGr.getValue('value');

        return highlightedValueConfigSysId;
    },

    _getHighlightedValueSysIds: function(highlightedValueConfigSysId) {
        if (!highlightedValueConfigSysId)
            return null;

        var highlightedValueSysIds = [];
        var highlightedValueM2mGr = new GlideRecord('sys_ux_m2m_highlighted_value_config');
        highlightedValueM2mGr.addQuery('highlighted_value_config', highlightedValueConfigSysId);
        highlightedValueM2mGr.query();
        while (highlightedValueM2mGr.next())
            highlightedValueSysIds.push(highlightedValueM2mGr.getValue('highlighted_value'));

        highlightedValueSysIds = highlightedValueSysIds.length < 1 ? null : highlightedValueSysIds;

        return highlightedValueSysIds;
    },

    _getHighlightedAttributesByField: function(highlightedValueSysIds, highlightedValueConfigSysId, table, field, highlightedAttributes) {
        highlightedAttributes = highlightedAttributes ? highlightedAttributes : {};
        var highlightedValueCondGr = new GlideRecord('sys_highlighted_value_condition');
        var highlightedValueGr = highlightedValueCondGr.addJoinQuery('sys_highlighted_value', 'highlighted_value', 'sys_id');
        highlightedValueGr.addCondition('highlighted_value', 'IN', highlightedValueSysIds);
        highlightedValueGr.addCondition('table', table);
        highlightedValueGr.addCondition('field', field);
        var gr = highlightedValueCondGr.addJoinQuery('sys_ux_m2m_highlighted_value_config', 'highlighted_value', 'highlighted_value');
        gr.addCondition('highlighted_value_config', highlightedValueConfigSysId);
        highlightedValueCondGr.orderBy('order');
        highlightedValueCondGr.query();
        while (highlightedValueCondGr.next()) {
            highlightedAttributes[table] = highlightedAttributes[table] ? highlightedAttributes[table] : {};
            highlightedAttributes[table][field] = highlightedAttributes[table][field] ? highlightedAttributes[table][field] : [];

            var highlightedValueConfig = this._highlightedValueConfigToJSON(highlightedValueCondGr, ['variant', 'color', 'icon', 'conditions', 'value_override']);
            if (highlightedValueConfig)
                highlightedAttributes[table][field].push(highlightedValueConfig);
        }

        if (this._log.atLevel(global.GSLog.DEBUG))
            this._log.debug('[_getHighlightedAttributesByField] highlightedAttributes: ' + JSON.stringify(highlightedAttributes));

        return highlightedAttributes;
    },

    _highlightedValueConfigToJSON: function(highlightedValueCondGr, fields) {
        if (!highlightedValueCondGr || !fields)
            return null;

        var configJSON = {};
        for (var i=0; i< fields.length; i++) {
            var field = fields[i];

            if (highlightedValueCondGr.isValidField(field))
                configJSON[field] = {
                    value: highlightedValueCondGr.getValue(field),
                    display_value: highlightedValueCondGr.getDisplayValue(field)
                };
        }

        return configJSON;
    },

    _getHighlightedFields: function(highlightedValueSysIds, table) {
        var fields = [];
        var highlightedValueGa = new GlideAggregate('sys_highlighted_value');
        highlightedValueGa.addAggregate('COUNT', 'field');
        highlightedValueGa.addQuery('sys_id', 'IN', highlightedValueSysIds);
        highlightedValueGa.addQuery('table', table);
        highlightedValueGa.groupBy('field');
        highlightedValueGa.query();
        while (highlightedValueGa.next()) {
            var field = highlightedValueGa.getValue('field');
            if (!fields.includes(field))
                fields.push(field);
        }

        return fields;
    },

    getCacheKey: function(appId, hasTranslatedContent) {
        var key = appId || '';
        var domain = gs.getSession().getCurrentDomainID();
        if (global.JSUtil.nil(domain))
            domain = 'global';

        key += '^' + domain;

        if (hasTranslatedContent)
            key += '^' + gs.getSession().getLanguage() || gs.getProperty('glide.sys.language', 'en');

        if (this._log.atLevel(global.GSLog.DEBUG))
            this._log.debug('[getCacheKey] key: ' + key);

        return key;
    },

    type: 'ITSMHighlightedValueUtilsSNC'
};

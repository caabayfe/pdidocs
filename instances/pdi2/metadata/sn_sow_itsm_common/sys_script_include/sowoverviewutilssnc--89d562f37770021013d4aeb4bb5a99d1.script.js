var SOWOverviewUtilsSNC = Class.create();
SOWOverviewUtilsSNC.prototype = {
    LOG_PROPERTY: 'com.snc.change_management.sow_overview_utils.log.level',
    SOW_OVERVIEW_CFG_CACHE: '_overview_config',

    initialize: function() {
        this._log = new global.GSLog(this.LOG_PROPERTY, this.type);


        if (this._log.atLevel(global.GSLog.DEBUG)) {
            this._log.includeTimestamp();
            this._log.debug('[initialize] type: ' + this.type);
        }
    },

    getFormSectionsForLayout: function(table, sysId, view) {
        if (!table || !sysId || !view)
            return {};

        var result = {
            formLayout: {
                isValidRecord: true,
                table: table,
                sysId: sysId,
                sectionLayout: []
            }
        };

        var sectionGr = new GlideRecord('sys_ui_section');
        sectionGr.addQuery('name', table);
        sectionGr.addQuery('view.name', view);
        sectionGr.orderBy('sys_created_on');
        sectionGr.query();
        while (sectionGr.next()) {
            var sectionSysId = sectionGr.getUniqueValue();
            var section = {
                sysId: sectionSysId,
                caption: (sectionGr.getValue('caption') || '').toLowerCase(),
                captionDisplay: sectionGr.caption.getDisplayValue() || sectionGr.name.getDisplayValue(),
                rows: this._getSectionRows(sectionSysId)
            };
            result.formLayout.sectionLayout.push(section);
        }

        return result;
    },

    _getSectionRows: function(sectionSysId) {
        var rows = [];

        if (!sectionSysId)
            return rows;

        var blocks = [];
        var fields = [];

        var elementGr = new GlideRecord('sys_ui_element');
        elementGr.addQuery('sys_ui_section', sectionSysId);
        elementGr.orderBy('position');
        elementGr.query();
        while (elementGr.next()) {
            var field = elementGr.element + '';
            var elementType = elementGr.type + '';
            switch (elementType) {
                case '.begin_split':
                    if (fields.length > 0) {
                        blocks.push({
                            fields: fields
                        });
                        rows.push(blocks);
                    }
                    fields = [];
                    blocks = [];
                    break;
                case '.split':
                    if (fields.length > 0)
                        blocks.push({
                            fields: fields
                        });
                    fields = [];
                    break;
                case '.end_split':
                    if (fields.length > 0)
                        blocks.push({
                            fields: fields
                        });
                    fields = [];
                    rows.push(blocks);
                    blocks = [];
                    break;
                default:
                    fields.push(field);
            }
        }

        // No Splits
        if (fields.length > 0) {
            blocks.push({
                fields: fields
            });
            rows.push(blocks);
        }

        return rows;
    },

    getSectionsForState: function(table, sysId, state, isNew, chgModel) {
        var sectionsForState = {};

        if (!table || !sysId || !state)
            return sectionsForState;

        var taskGr = new GlideRecord(table);
        if (sysId === '-1' || isNew + '' === 'true') {
            if (table === 'problem')
                taskGr.setValue('problem_state', state);
            else {
                taskGr.setValue('state', state);
                if (chgModel) {
                    var chgModelGr = new GlideRecordSecure('chg_model');
                    if (chgModelGr.get(chgModel))
                        new global.ChangeModel(chgModelGr).applyRecordPresets(taskGr);
                }
            }
        } else if (!taskGr.get(sysId) || !taskGr.canRead())
            return sectionsForState;

        var matched = false;
        var orderMatched = '';
        var overviewContainers = this._getOverviewContainers(table, taskGr);
        for (var i = 0; i < overviewContainers.length && !matched; i++) {
            var overviewContainer = overviewContainers[i];
            if (GlideFilter.checkRecord(taskGr, overviewContainer.condition)) {
                matched = true;
                orderMatched = overviewContainer.order;
                sectionsForState = overviewContainer;
            }
        }

        var scriptedSectionsForState = this._getScriptedOverviewContainers(orderMatched, table, taskGr);
        sectionsForState = scriptedSectionsForState ? scriptedSectionsForState : sectionsForState;

        if (sysId === '-1' || isNew + '' === 'true') { // Action bar should never be displayed for unsaved records
            sectionsForState.displayActionBar = false;
        }

        if (this._log.atLevel(global.GSLog.DEBUG))
            this._log.debug('[getSectionsForState] cards: ' + JSON.stringify(sectionsForState));

        sectionsForState.isReadOnly = !taskGr.canWrite();
        return sectionsForState;
    },

    _getOverviewContainers: function(table, taskGr) {
        table = table || '';
        var key = this.getCacheKey(table, true);
        var overviewContainersStr = sn_scoped_cache.ScopedCacheManager.get(table + this.SOW_OVERVIEW_CFG_CACHE, key);

        if (overviewContainersStr)
            return JSON.parse(overviewContainersStr);

        overviewContainers = [];

        var prefix = (table === 'change_request') ? 'chg' : table;

        var overviewCntGr = new GlideRecord(prefix + '_overview_container');
        overviewCntGr.addActiveQuery();
        overviewCntGr.addQuery('table', table);
        overviewCntGr.addQuery('use_advanced_condition', false);
        overviewCntGr.orderBy('order');
        overviewCntGr.orderBy('sys_id');
        overviewCntGr.query();
        while (overviewCntGr.next()) {
            var overviewContainer = {};
            overviewContainer.name = overviewCntGr.getDisplayValue();
            overviewContainer.order = overviewCntGr.order + '';
            overviewContainer.condition = overviewCntGr.condition + '';
            overviewContainer.displayActionBar = overviewCntGr.getValue('display_action_bar') + '' === '1';
            overviewContainer.items = this._getOverviewSections(overviewCntGr.getUniqueValue(), prefix, taskGr);
            overviewContainers.push(overviewContainer);
        }

        overviewContainersStr = JSON.stringify(overviewContainers);
        sn_scoped_cache.ScopedCacheManager.put(table + this.SOW_OVERVIEW_CFG_CACHE, key, overviewContainersStr);

        return JSON.parse(overviewContainersStr);
    },

    _getScriptedOverviewContainers: function(order, table, taskGr) {
        var sectionsForState = null;

        if (!taskGr || !table)
            return sectionsForState;

        var prefix = (table === 'change_request') ? 'chg' : table;
        var evaluator;
        var matched = false;
        var overviewCntGr = new GlideRecord(prefix + '_overview_container');
        overviewCntGr.addActiveQuery();
        overviewCntGr.addQuery('table', table);
        overviewCntGr.addQuery('use_advanced_condition', true);
        if (!global.JSUtil.nil(order))
            overviewCntGr.addQuery('order', '<', order);

        overviewCntGr.orderBy('order');
        overviewCntGr.orderBy('sys_id');
        overviewCntGr.query();
        while (overviewCntGr.next() && !matched) {
            if (!evaluator) {
                evaluator = new GlideScopedEvaluator();
                evaluator.withEnforcedSecurity(true);
                evaluator.putVariable('current', taskGr);
                evaluator.putVariable('answer', false);
            }
            evaluator.evaluateScript(overviewCntGr, 'advanced_condition');
            matched = evaluator.getVariable('answer');

            if (matched) {
                sectionsForState = {};
                sectionsForState.id = taskGr.getValue('state');
                sectionsForState.state = taskGr.state.getDisplayValue();
                sectionsForState.name = overviewCntGr.getDisplayValue();
                sectionsForState.displayActionBar = overviewCntGr.getValue('display_action_bar') + '' === '1';
                sectionsForState.items = this._getOverviewSections(overviewCntGr.getUniqueValue(), prefix, taskGr);
            }
        }

        return sectionsForState;
    },

    _getOverviewSections: function(overviewContainerSysId, prefix, taskGr) {
        var sections = [];
        if (!overviewContainerSysId)
            return sections;

        var tableName = (prefix === 'chg') ? prefix + '_overview_card' : prefix + '_overview_section';
        var overviewSectionGr = new GlideRecord(tableName);
        overviewSectionGr.addActiveQuery();
        overviewSectionGr.addQuery(prefix + '_overview_container', overviewContainerSysId);
        overviewSectionGr.orderBy('order');
        overviewSectionGr.orderBy('sys_id');
        overviewSectionGr.query();
        while (overviewSectionGr.next()) {
            var section = {};
            section.name = overviewSectionGr.getValue('name');
            section.expanded = overviewSectionGr.getValue('expanded') + '' === '1';
            section.showNewRecord = overviewSectionGr.getValue('show_new_record') + '' === '1';
            section.heading = overviewSectionGr.heading.getDisplayValue();
            if (overviewSectionGr.isValidField('description'))
                section.description = overviewSectionGr.getDisplayValue('description');
            var fields = this._getOverviewFields(overviewSectionGr.getUniqueValue(), prefix);
            if (fields && fields.length > 0)
                section.fields = fields;

            if (!overviewSectionGr.isValidField('condition') || GlideFilter.checkRecord(taskGr, overviewSectionGr.condition))
                sections.push(section);
        }

        if (this._log.atLevel(global.GSLog.DEBUG))
            this._log.debug('[_getOverviewSections] sections: ' + JSON.stringify(sections));

        return sections;
    },

    _getOverviewFields: function(overviewSectionSysId, prefix) {
        var fields = [];
        if (!overviewSectionSysId)
            return fields;

        var overviewFieldGr = new GlideRecord(prefix + '_overview_field');
        overviewFieldGr.addActiveQuery();
        var fieldName = (prefix === 'chg') ? prefix + '_overview_card' : prefix + '_overview_section';
        overviewFieldGr.addQuery(fieldName, overviewSectionSysId);
        overviewFieldGr.query();
        while (overviewFieldGr.next())
            fields.push(overviewFieldGr.getValue('name'));

        if (this._log.atLevel(global.GSLog.DEBUG))
            this._log.debug('[_getOverviewFields] fields: ' + JSON.stringify(fields));

        return fields;
    },

    getCacheKey: function(table, hasTranslatedContent) {
        var key = table || '';
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

    type: 'SOWOverviewUtilsSNC'
};

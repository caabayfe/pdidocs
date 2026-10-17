var CreateChangeLandingSNC = Class.create();

CreateChangeLandingSNC.STANDARD_TEMPLATE_TAG = gs.getMessage('Standard');
CreateChangeLandingSNC.LEGACY_TEMPLATE_TAG = gs.getMessage('Legacy');
CreateChangeLandingSNC.UNPIN = gs.getMessage('Unpin this change');
CreateChangeLandingSNC.PIN = gs.getMessage('Pin this change');
CreateChangeLandingSNC.SUCCESS = gs.getMessage('Success rate');
CreateChangeLandingSNC.CREATE_TEMPLATE = gs.getMessage('Create template for selected model');
CreateChangeLandingSNC.EDIT_TEMPLATE = gs.getMessage('Edit template');
CreateChangeLandingSNC.PROPOSE_STANDARD_TEMPLATE = gs.getMessage('Propose a new standard change template');
CreateChangeLandingSNC.EDIT_MODEL = gs.getMessage('Edit model');
CreateChangeLandingSNC.TEMPLATE_MANAGEMENT = '00728916937002002dcef157b67ffb6d';
CreateChangeLandingSNC.REQUIRED_FIELDS = {
    'sys_id': true,
    'sys_class_name': true,
    'display_value': true,
    'target_field': true,
    'value': true,
    'values': true,
    'name': true,
    'sys_name': true,
    'default_change_model': true,
    'sys_created_by': true,
    'table_name': true,
    'description': true,
    'short_description': true,
    'current_version': true,
    'sc_catalogs': true,
    'closed_change_count': true,
    'percent_successful': true,
    'title': true,
    'sttrm_model': true
};

CreateChangeLandingSNC.prototype = Object.extendsObject(sn_chg_model_ui.ChgLandingBase, {
    initialize: function(_gs) {
        sn_chg_model_ui.ChgLandingBase.prototype.initialize.call(this, null, _gs);
        this._isStdChgCatalogActive = global.ChangeCommon.isPluginActive('com.snc.change_management.standard_change_catalog');
        this._isSuccessScoreActive = GlidePluginManager.isActive('com.snc.change_management.change_success_score');
        this._isTypeCompatibility = gs.getProperty('com.snc.change_management.change_model.type_compatibility', false) === 'true';
        this.currentModels = ['Standard'];
    },

    getChangeCards: function(startAt, limit, filter, orderBy, textSearch, restrict, encodedQuery) {
        var cards = this._defaultCardsData();
        this.startAt = startAt || 0;
        orderBy = orderBy || sn_chg_model_ui.ChgLandingBase.NAME;
        limit = this._getValidLimit(limit);
        
        var filterData = this._parseFilters(filter);
        var queryParams = {
            orderBy: orderBy,
            textSearch: textSearch,
            encodedQuery: this._buildEncodedQuery(encodedQuery, filterData)
        };

        var allCards = [];
        var totalCards = 0;
        
        var fetchConfigs = [
            {
                shouldFetch: this._shouldFetchChangeModels(filterData.type, restrict, ['all', 'model', 'pinned']),
                fetchFn: this._fetchChangeModels.bind(this, queryParams, limit, allCards)
            },
            {
                shouldFetch: this._shouldFetchChangeTypes(filterData.type, restrict, ['all', 'model', 'pinned']),
                fetchFn: this._fetchChangeTypes.bind(this, queryParams, limit, allCards)
            },
            {
                shouldFetch: this._shouldFetchStdChangeTemplates(filterData.type, restrict, ['all', 'pinned', 'parentStdChangeTemplate']),
                fetchFn: this._fetchStdChangeTemplates.bind(this, queryParams, limit, allCards, filterData)
            },
            {
                shouldFetch: this._shouldFetchTemplates(filterData.type, restrict, ['all', 'pinned', 'parentTemplate']),
                fetchFn: this._fetchTemplates.bind(this, queryParams, limit, allCards, filterData)
            }
        ];

        fetchConfigs.forEach(function(config) {
            if (!config.shouldFetch) return;
            
            var results = config.fetchFn();
            allCards = allCards.concat(results.cards || []);
            totalCards += parseInt(results.count || 0);
        });

        cards[sn_chg_model_ui.ChgLandingBase.CHG_MODEL] = this._formatCards(allCards);
        cards.__totalRecords = totalCards;
        cards.__pinned = this._getPinned(restrict);
        
        return cards;
    },

    getDropdownValues: function() {
        var modelGr = new GlideRecord(sn_chg_model_ui.ChgLandingBase.CHG_MODEL);
        var stdChangeProposalGr = new GlideRecord('std_change_proposal');
        var templateGr = new GlideRecord(sn_chg_model_ui.ChgLandingBase.CHG_TEMPLATE);

        var returnVals= [
            {
                id: 'propose',
                label: CreateChangeLandingSNC.PROPOSE_STANDARD_TEMPLATE,
                disabled: !stdChangeProposalGr.canCreate(),
                canCreateProposal: stdChangeProposalGr.canCreate()
            },
            {
                id: 'create',
                label: CreateChangeLandingSNC.CREATE_TEMPLATE,
                disabled: true,
                canCreateTemplate: templateGr.canCreate()
            },
            {
                id: 'edit',
                label: CreateChangeLandingSNC.EDIT_TEMPLATE,
                disabled: true,
                canEditModel: modelGr.canWrite(),
                canCreateProposal: stdChangeProposalGr.canCreate(),
                canEditTemplate: templateGr.canWrite(),
                modelLabel: CreateChangeLandingSNC.EDIT_MODEL,
                templateLabel: CreateChangeLandingSNC.EDIT_TEMPLATE
            }
        ];

        return returnVals;
    },

    getCategories: function(restrict) {
        var filterCategories = [{
            id: 'pinned',
            label: gs.getMessage('Pinned')
        }];

        if (!restrict)
            filterCategories.push({
                id: 'all',
                label: gs.getMessage('All')
            });

        if (!restrict || restrict === 'models')
            filterCategories.push({
                id: 'model',
                label: gs.getMessage('Model')
            });

        if (!restrict || restrict === 'preapproved')
            filterCategories.push(this.getPreapprovedCategories());

        if (!restrict || restrict === 'templates')
            filterCategories.push(this.getTemplateCategories());

        return filterCategories;
    },

    getPreapprovedCategories: function() {
        var stdCategories = {
            id: 'parentStdChangeTemplate',
            label: gs.getMessage('Standard Change'),
            children: [{
                id: 'all',
                label: gs.getMessage('All')
            }]
        };

        var category = new global.StdChangeUtils().getValue('category');
        var categories = this._getStdChgSubCategories(category);

        for (var i = 0; i < categories.length; i++) {
            stdCategories.children.push({
                id: categories[i].id,
                label: categories[i].label
            });
        }
        return stdCategories;
    },

    getTemplateCategories: function() {
        var templateCategories = {
            id: 'parentTemplate',
            label: gs.getMessage('Templates'),
            children: [{
                id: 'all',
                label: gs.getMessage('All')
            }].concat(this._getTemplateSubCategories())
        };

        return templateCategories;
    },

    _getValidLimit: function(limit) {
        return (!limit || isNaN(limit)) ? sn_chg_model_ui.ChgLandingBase.LANDING_LIMIT : parseInt(limit);
    },
    
    _parseFilters: function(filter) {
        var validTypes = ['pinned', 'model', 'parentStdChangeTemplate', 'parentTemplate'];
        var filterData = {
            type: 'all',
            id: null
        };

        if (!filter)
            return filterData;

        var parts = filter.split('~');
        var isValidFilter = validTypes.includes(parts[0]);
        var id = null;

        // id field can be a single sys_id or a comma-separated list of sys_ids, or string literal 'all'
        if (parts[1]) {
            if (parts[1] === 'all') 
                id = 'all';
            else {
                var validSysIds = parts[1].split(',').filter(global.ChangeCommon.filters.sysId);
                id = validSysIds.length ? validSysIds.join(',') : null;
            }
        }

        filterData = {
            type: isValidFilter ? parts[0] : 'all',
            id: id
        };

        if (this._log.atLevel(global.GSLog.DEBUG))
            this._log.debug("[_parseFilters] filterData: " + JSON.stringify(filterData));

        return filterData;
    },

    _buildEncodedQuery: function(encodedQuery, filterData) {
        if (filterData.type === 'pinned')
            return 'sys_idIN' + this._getPinned();

        if (filterData.type === 'parentStdChangeTemplate') {
            if (filterData.id && filterData.id !== 'all' && global.ChangeCommon.filters.sysId(filterData.id))
                return 'category=' + filterData.id;

            return encodedQuery || '';
        }

        if (filterData.type === 'parentTemplate') {
            if (filterData.id && filterData.id !== 'all') {
                var sysIds = filterData.id.split(',').filter(global.ChangeCommon.filters.sysId);
                return 'sttrm_categoryIN' + sysIds.join(',');
            }

            return '';
        }

        return encodedQuery || '';
    },

    _shouldFetchChangeModels: function(type, restrict, validTypes) {
        const isMatchingRestriction = !restrict || restrict === 'models';

        return isMatchingRestriction && validTypes.includes(type);
    },
    
    _shouldFetchChangeTypes: function(type, restrict, validTypes) {
        const isMatchingRestriction = !restrict || restrict === 'models';

        return isMatchingRestriction && this._isTypeCompatibility && validTypes.includes(type);
    },
    
    _shouldFetchStdChangeTemplates: function(type, restrict, validTypes) {
        const isMatchingRestriction = !restrict || restrict === 'preapproved';

        return isMatchingRestriction && this._isStdChgCatalogActive && validTypes.includes(type);
    },

    _shouldFetchTemplates: function(type, restrict, validTypes) {
        const isMatchingRestriction = !restrict || restrict === 'templates';

        return isMatchingRestriction && validTypes.includes(type);
    },
    
    _fetchChangeModels: function(params, limit, existingCards) {
        var modelResult = this._getCardsData(
            this._getChangeModelsGr(params.orderBy, params.textSearch, params.encodedQuery), 
            limit, 
            existingCards
        );
        
        return {
            cards: modelResult.cards || [],
            count: parseInt(modelResult.count || 0)
        };
    },
    
    _fetchChangeTypes: function(params, limit, existingCards) {
        if (!this._isTypeCompatibility) {
            return { cards: [], count: 0 };
        }
        
        var typeResult = this._getCardsData(
            this._getChangeTypesGr(params.orderBy, params.textSearch, params.encodedQuery),
            limit,
            existingCards
        );
        
        return {
            cards: typeResult.cards || [],
            count: parseInt(typeResult.count || 0)
        };
    },
    
    _fetchStdChangeTemplates: function(params, limit, existingCards, filterData) {
        if (!this._isStdChgCatalogActive) {
            return { cards: [], count: 0 };
        }
        
        var templateResult = this._getCardsData(
            global.StandardChangeTemplate.findAll(params.orderBy, params.textSearch, params.encodedQuery),
            limit,
            existingCards
        );
        
        return {
            cards: templateResult.cards || [],
            count: parseInt(templateResult.count || 0)
        };
    },

    _fetchTemplates: function(params, limit, existingCards, filterData) {
        var templateResult = this._getCardsData(
            this._getTemplatesGr(params.orderBy, params.textSearch, params.encodedQuery, filterData),
            limit,
            existingCards
        );
        
        return {
            cards: templateResult.cards || [],
            count: parseInt(templateResult.count || 0)
        };
    },

    _defaultCardsData: function() {
        var model = {
            __totalRecords: 0,
            __pinned: [],
            __pinLabels: {
                'pin': CreateChangeLandingSNC.PIN,
                'unpin': CreateChangeLandingSNC.UNPIN
            }
        };
        model[sn_chg_model_ui.ChgLandingBase.CHG_MODEL] = [];

        return model;
    },

    _getCardsData: function(gr, limit, allCards) {
        var cards = {cards: [], count: 0};
        
        if (!gr || isNaN(limit))
            return cards;

        cards.count = gr.getRowCount();

        var offset = 0;
        while ((offset < this.startAt) && gr.hasNext()) {
            gr._next();
            offset++;
        }

        this.startAt -= offset;

        var counter = 0;
        while (gr._next()) {
            if (limit === (counter + allCards.length))
                break;

            cards.cards.push(this._toJS(gr, CreateChangeLandingSNC.REQUIRED_FIELDS));
            this.currentModels.push(gr.getValue(sn_chg_model_ui.ChgLandingBase.NAME));
            counter++;
        }

        return cards;
    },

    _getChangeModelsGr: function(orderBy, textSearch, encodedQuery) {
        var changeModelsGr = new GlideRecordSecure(sn_chg_model_ui.ChgLandingBase.CHG_MODEL);
        if (!orderBy)
            orderBy = sn_chg_model_ui.ChgLandingBase.NAME;

        changeModelsGr.addActiveQuery();
        if (textSearch && typeof textSearch !== 'undefined' && textSearch.trim() !== '')
            changeModelsGr.addQuery('name', 'CONTAINS', textSearch).addOrCondition('description', 'CONTAINS', textSearch);

        if (encodedQuery)
            changeModelsGr.addUserEncodedQuery(encodedQuery);

        changeModelsGr.orderBy(orderBy);
        changeModelsGr.query();
        return changeModelsGr;
    },

    _getChangeTypesGr: function(orderBy, textSearch, encodedQuery) {
        var changeTypesGr = new GlideRecordSecure('sn_sow_interceptor_record_type_selector');
        if (!orderBy)
            orderBy = 'title';

        changeTypesGr.addActiveQuery();
        if (textSearch && typeof textSearch !== 'undefined' && textSearch.trim() !== '')
            changeTypesGr.addQuery('title', 'CONTAINS', textSearch).addOrCondition('description', 'CONTAINS', textSearch);

        if (encodedQuery)
            changeTypesGr.addUserEncodedQuery(encodedQuery);

        changeTypesGr.orderBy(orderBy);
        changeTypesGr.addQuery('target_table', 'change_request');
        changeTypesGr.addQuery('title', 'NOT IN', this.currentModels);
        changeTypesGr.query();
        return changeTypesGr;
    },

    _getTemplatesGr: function(orderBy, textSearch, encodedQuery, filterData) {
        var templateIds = [];
        var isFilteredByCategory = filterData.type === 'parentTemplate' && filterData.id !== 'all';
        
        if (isFilteredByCategory) {
            var templateToCategoryGr = new GlideRecordSecure('sttrm_template_sttrm_category');
            templateToCategoryGr.addUserEncodedQuery(encodedQuery);
            templateToCategoryGr.query();

            while (templateToCategoryGr.next())
                templateIds.push(templateToCategoryGr.getValue('sttrm_template'));

            if (templateIds.length === 0) 
                return null;
        }
        
        var templatesGr = new GlideRecordSecure(sn_chg_model_ui.ChgLandingBase.CHG_TEMPLATE);
        if (!orderBy)
            orderBy = 'name';

        templatesGr.addActiveQuery();
        templatesGr.addQuery('state', 'IN', 'published,pending_retirement');
        if (isFilteredByCategory)
            templatesGr.addQuery('sys_id', 'IN', templateIds.join(','));
        else
            templatesGr.addUserEncodedQuery(encodedQuery);
        if (textSearch && typeof textSearch !== 'undefined' && textSearch.trim() !== '')
            templatesGr.addQuery('name', 'CONTAINS', textSearch).addOrCondition('short_description', 'CONTAINS', textSearch);

        templatesGr.orderBy(orderBy);
        templatesGr.query();
        return templatesGr;
    },

    _getDefaultStruct: function() {
        return {
            sysIds: [],
            __more: false,
            limit: parseInt(sn_chg_model_ui.ChgLandingBase.LANDING_LIMIT),
            recordCount: 0,
            maxLimit: parseInt(sn_chg_model_ui.ChgLandingBase.MAX_CHG_MODELS),
            offset: 0
        };
    },

    _getPinned: function() {
        var pinnedUserPref = gs.getUser().getPreference('sn_chg_model_ui.landing_page.pinned_change_models');
        return pinnedUserPref || '';
    },

    _getChgSuccessRate: function(chgCard) {
        var successRate = '-';
        if (!chgCard)
            return successRate;

        if (chgCard.sys_class_name.value === 'std_change_record_producer') {
            if (!chgCard.closed_change_count)
                return successRate;

            var closedChangeCount = parseInt(chgCard.closed_change_count.value || 0);
            if (!closedChangeCount)
                return successRate;

            var percentSuccessful = parseFloat(chgCard.percent_successful.value);
            if (isNaN(percentSuccessful))
                return successRate;

            successRate = Math.round(percentSuccessful) + '%';

            return successRate;
        } else if (chgCard.sys_class_name.value === 'chg_template') {
            var scoreGr = new GlideRecordSecure('chg_template_metric');
            scoreGr.addQuery('chg_template', chgCard.sys_id.value);
            scoreGr.query();
            
            if (scoreGr.next()) {
                var templateSuccessScore = scoreGr.getValue('percent_successful');

                if (templateSuccessScore)
                    successRate = Math.round(templateSuccessScore) + '%';
            }

            return successRate;
        } else {
            if (this._isSuccessScoreActive) {
                var scoreData = new sn_chg_score.ChangeSuccess().getModelScoreForModelId(chgCard.sys_id.value);
                var hasScore = scoreData && scoreData.score && scoreData.score.value;

                if (hasScore)
                    successRate = Math.round(scoreData.score.value) + '%';
            }
            return successRate;
        }
    },

    _formatCards: function(cardsData) {
        var cards = [];
        var pinned = this._getPinned();
        var isTwoStepStdTemplate = new global.StdChangeUtils()._getBooleanPropertyValue('two_step', false);

        cardsData.forEach(function(cardData) {
            var card = {};

            switch (cardData.sys_class_name.value) {
                case 'chg_model':
                    card = this._formatModelCard(cardData);
                    break;
                case 'std_change_record_producer':
                    card = this._formatStdChgTemplateCard(cardData, isTwoStepStdTemplate);
                    break;
                case 'sn_sow_interceptor_record_type_selector':
                    card = this._formatLegacyTypeCard(cardData);
                    break;
                case 'chg_template':
                    card = this._formatChgTemplateCard(cardData);
                    break;
                default:
                    card = this._formatDefaultCard(cardData);
            }

            if (pinned.indexOf(card.sysId) >= 0) {
                card.isPinned = true;
                card.pinIcon = [{
                    'icon': 'thumbtack-fill',
                    'label': CreateChangeLandingSNC.UNPIN
                }];
            } else {
                card.isPinned = false;
                card.pinIcon = [{
                    'icon': 'thumbtack-outline',
                    'label': CreateChangeLandingSNC.PIN
                }];
            }

            cards.push(card);
        }.bind(this));

        return cards;
    },

    _formatDefaultCard: function(cardData) {
        var card = {};

        card.sysId = cardData.sys_id.value;
        card.sys_class_name = cardData.sys_class_name.value;

        card.name = cardData.name.display_value;
        card.sys_name = cardData.sys_name.value;
        card.description = cardData.hasOwnProperty('short_description') ? cardData.short_description.display_value : cardData.description.display_value;

        return card;
    },

    _formatModelCard: function(cardData) {
        var card = this._formatDefaultCard(cardData);

        if (cardData.default_change_model.value + '' === 'true') {
            card.sidebar = {
                color: 'positive',
                variant: 'secondary'
            };
            card.color = 'positive';
        } else if (card.sys_name === 'Emergency') {
            card.sidebar = {
                color: 'critical',
                variant: 'secondary'
            };
            card.color = 'critical';
        } else if (cardData.sys_created_by.display_value === 'admin' || cardData.sys_created_by.display_value === 'Change.Manager') {
            card.sidebar = {
                color: 'info',
                variant: 'secondary'
            };
            card.color = 'info';
        } else {
            card.sidebar = {
                color: 'pink',
                variant: 'secondary'
            };
            card.color = 'pink';
        }

        card.tagLabel = '‎‎ ';
        card.successScore = (this._isSuccessScoreActive ? this._getChgSuccessRate(cardData) : '');
        card.successLabel = (this._isSuccessScoreActive ? CreateChangeLandingSNC.SUCCESS : '');
        card.targetTableName = cardData.table_name.value;

        return card;
    },

    _formatStdChgTemplateCard: function(cardData, isTwoStepStdTemplate) {
        var card = this._formatDefaultCard(cardData);

        card.versionId = cardData.current_version.value;
        card.sc_catalogs = cardData.sc_catalogs.value;
        card.sessionToken = gs.getSessionToken();
        card.isTwoStep = isTwoStepStdTemplate;

        card.sidebar = {
            color: 'purple',
            variant: 'secondary'
        };
        card.color = 'purple';
        card.tagLabel = CreateChangeLandingSNC.STANDARD_TEMPLATE_TAG;

        card.successScore = this._getChgSuccessRate(cardData);
        card.successLabel = CreateChangeLandingSNC.SUCCESS;

        return card;
    },

    _formatLegacyTypeCard: function(cardData) {
        var card = {};

        card.sysId = cardData.sys_id.value;
        card.sys_class_name = cardData.sys_class_name.value;

        card.name = cardData.title.display_value;
        card.description = cardData.description.display_value;
        card.qry = cardData.values.value;

        card.sidebar = {
            color: 'teal',
            variant: 'secondary'
        };
        card.color = 'teal';
        card.tagLabel = CreateChangeLandingSNC.LEGACY_TEMPLATE_TAG;

        card.successScore = '';
        card.successLabel = '';

        return card;
    },

    _formatChgTemplateCard: function(cardData) {
        var card = this._formatDefaultCard(cardData);

        card.qry = 'chg_model=' + cardData.sttrm_model.value + '^chg_model_template=' + cardData.sys_id.value;

        card.sidebar = {
            color: 'low',
            variant: 'secondary'
        };
        card.color = 'low';
        card.tagLabel = cardData.sttrm_model.display_value;

        card.successScore = this._getChgSuccessRate(cardData);
        card.successLabel = CreateChangeLandingSNC.SUCCESS;

        return card;
    },

    _getStdChgSubCategories: function(parent) {
        var categoryGr = new GlideRecord('sc_category');
        categoryGr.addQuery('parent', parent);
        categoryGr.orderBy('order');
        categoryGr.query();
        var categories = [];
        while (categoryGr.next()) {
            if (categoryGr.getUniqueValue() !== CreateChangeLandingSNC.TEMPLATE_MANAGEMENT) {
                var cat = {};
                cat.id = categoryGr.getUniqueValue();
                cat.label = categoryGr.getDisplayValue('title');
                cat.children = this._getStdChgSubCategories(categoryGr.getUniqueValue());
                categories.push(cat);
            }
        }
        return categories;
    },

    _getTemplateSubCategories: function() {
        var categoryMap = {};
        var rootCategories = [];
        var orphans = [];

        var categoryGr = new GlideRecordSecure('sttrm_category');
        categoryGr.orderBy('order');
        categoryGr.query();

        while (categoryGr.next()) {
            var sysId = categoryGr.getUniqueValue();
            var parentId = categoryGr.getValue('parent');
            
            var category = {
                id: sysId,
                label: categoryGr.getDisplayValue('name'),
                parentId: parentId,
                children: []
            };
            
            categoryMap[sysId] = category;
            
            if (parentId) {
                if (categoryMap[parentId]) {
                    categoryMap[parentId].children.push(category);
                } else {
                    orphans.push(category);
                }
            } else {
                rootCategories.push(category);
            }
        }
        
        for (var i = 0; i < orphans.length; i++) {
            var orphan = orphans[i];
            if (categoryMap[orphan.parentId]) {
                categoryMap[orphan.parentId].children.push(orphan);
            }
        }

        var processNode = function(node) {
            var allIds = [node.id];
            
            for (var i = 0; i < node.children.length; i++) {
                var childIds = processNode(node.children[i]);
                allIds = allIds.concat(childIds);
            }
            
            node.id = allIds.join(',');
            delete node.parentId;
            
            return allIds;
        };

        for (var i = 0; i < rootCategories.length; i++) {
            processNode(rootCategories[i]);
        }

        return rootCategories;
    },

    type: 'CreateChangeLandingSNC'
});

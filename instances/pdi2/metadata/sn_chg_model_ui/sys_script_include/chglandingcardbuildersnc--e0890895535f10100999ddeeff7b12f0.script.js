var ChgLandingCardBuilderSNC = Class.create();
ChgLandingCardBuilderSNC.prototype = Object.extendsObject(ChgLandingBase, {
    initialize: function(_gs) {
        ChgLandingBase.prototype.initialize.call(this, null, _gs);
        this._isStdChgCatalogActive = global.ChangeCommon.isPluginActive("com.snc.change_management.standard_change_catalog");
        this.uniqueChgModels = {};
    },

    landingPageEnabled: function() {
        var typeCompatibility = gs.getProperty('com.snc.change_management.change_model.type_compatibility', false) === 'true';
        var hideChgModel = gs.getProperty('com.snc.change_management.change_model.hide', false) === 'true';
        return !(typeCompatibility && hideChgModel);
    },

    initialHit: function(orderBy, textSearch) {
        var model = {};
        model.__struct = {};

        if (this._isStdChgCatalogActive) {
            model.__struct.change_models = this.findModels(orderBy, textSearch, "available_in_ui=true", this._getDefaultStruct());
            model.__struct.preapproved = this.findPreapproved(orderBy, textSearch, "available_in_ui=true", this._getDefaultStruct());

            // Combine stdChgs and chgModels
            model.__struct.all = this._buildAll(model.__struct.change_models, model.__struct.preapproved);
        } else
            model.__struct.all = this.findModels(orderBy, textSearch, "available_in_ui=true", this._getDefaultStruct());

        // Whatever the limit and record count we always get pinned
        model.__struct.pinned = this.findPinned(orderBy, textSearch, this._getDefaultStruct());

        model.__struct.change_templates = this.findTemplates(orderBy, textSearch, this._getDefaultStruct());

        model[ChgLandingBase.CHG_MODEL] = this.uniqueChgModels;
        return model;
    },

    getChgLandingCards: function(startAt, limit, filter, orderBy, textSearch) {
        if (!orderBy)
            orderBy = ChgLandingBase.NAME;

        if (!limit || isNaN(limit) || limit < ChgLandingBase.LANDING_MIN_LIMIT)
            limit = ChgLandingBase.LANDING_MIN_LIMIT;

        if (!startAt || isNaN(startAt))
            startAt = 0;

        var gr = null;
        var chgModels;
        var stdChgModels;
        var chgTemplates;

        if (filter === ChgLandingBase.MODELS) {
            chgModels = this._getModel(this._getChangeModelsGr(orderBy, textSearch, "available_in_ui=true"), startAt, limit);
            chgModels.__filter = ChgLandingBase.MODELS;
            return chgModels;
        } else if (filter === ChgLandingBase.PREAPPROVED && this._isStdChgCatalogActive) {
            stdChgModels = this._getModel(global.StandardChangeTemplate.findAll(orderBy, textSearch, "available_in_ui=true"), startAt, limit);
            stdChgModels.__filter = ChgLandingBase.PREAPPROVED;
            return stdChgModels;
        } else if (filter === ChgLandingBase.CHG_TEMPLATE) {
            chgTemplates = this._getModel(this._getChangeTemplatesGr(orderBy, textSearch), startAt, limit);
            chgTemplates.__filter = ChgLandingBase.CHG_TEMPLATE;
            return chgTemplates;
        } else if (filter === ChgLandingBase.ALL || filter === ChgLandingBase.PINNED) {
            var models = this._getDefaultModel();
            var encodedQuery = "available_in_ui=true";
            if (filter === ChgLandingBase.PINNED) {
                encodedQuery = this._getPinnedEncodedQuery();
                models.__filter = ChgLandingBase.PINNED;
            }

            chgModels = this._getModel(this._getChangeModelsGr(orderBy, textSearch, encodedQuery), startAt, limit);

            if (this._isStdChgCatalogActive) {
                startAt = startAt - chgModels.__rowCount;
                stdChgModels = this._getModel(global.StandardChangeTemplate.findAll(orderBy, textSearch, encodedQuery), startAt, limit);
                models[ChgLandingBase.CHG_MODEL] = chgModels[ChgLandingBase.CHG_MODEL].concat(stdChgModels[ChgLandingBase.CHG_MODEL]);
                models.__more = chgModels.__more || stdChgModels.__more;
            } else {
                models[ChgLandingBase.CHG_MODEL] = chgModels[ChgLandingBase.CHG_MODEL];
                models.__more = chgModels.__more;
            }

            return models;
        }

        return this._getDefaultModel();
    },

    _getDefaultModel: function() {
        var model = {
            __more: false,
            __filter: ChgLandingBase.ALL
        };
        model[ChgLandingBase.CHG_MODEL] = [];
        return model;
    },

    _getModel: function(gr, startAt, limit) {
        var model = this._getDefaultModel();

        if (!gr || isNaN(startAt) || isNaN(limit))
            return model;

        model.__rowCount = gr.getRowCount();

        var offset = 0;
        while (offset < startAt) {
            gr.next();
            offset++;
        }

        limit = (ChgLandingBase.MAX_CHG_MODELS - offset) < limit ? ChgLandingBase.MAX_CHG_MODELS - offset : limit;
        var counter = 0;
        while (gr.next()) {

            if (parseInt(ChgLandingBase.MAX_CHG_MODELS) === counter) {
                model.__more = false;
                break;
            }

            if (limit === counter) {
                model.__more = true;
                break;
            }

            model[ChgLandingBase.CHG_MODEL].push(new ChgLandingCard(gr, this._gs).toJS());
            counter++;
        }

        return model;
    },

    unique: function(arr) {
        return arr.filter(function(elem, index, arr) {
            return arr.indexOf(elem) == index;
        });
    },

    _buildAll: function(struct1, struct2) {
        var struct = this._getDefaultStruct();
        if (!struct1 && !struct2)
            return struct;

        if (struct1 && struct1.sysIds)
            struct.sysIds = this.unique(struct1.sysIds);

        if (struct2 && struct2.sysIds)
            struct.sysIds = this.unique(struct.sysIds.concat(struct2.sysIds));

        struct.__more = (struct1 && struct1.__more) || (struct2 && struct2.__more);
        return struct;
    },

    _getChangeModelsGr: function(orderBy, textSearch, encodedQuery) {
        var changeModelsGr = new GlideRecordSecure(ChgLandingBase.CHG_MODEL);
        if (!orderBy)
            orderBy = ChgLandingBase.NAME;

        changeModelsGr.addActiveQuery();
        if (textSearch && typeof textSearch !== "undefined" && textSearch.trim() !== "")
            changeModelsGr.addQuery("name", "CONTAINS", textSearch).addOrCondition("description", "CONTAINS", textSearch);

        if (encodedQuery)
            changeModelsGr.addEncodedQuery(encodedQuery);

        changeModelsGr.orderBy(orderBy);
        changeModelsGr.query();
        return changeModelsGr;
    },

    _getDefaultStruct: function() {
        var limit = parseInt(ChgLandingBase.LANDING_LIMIT) < ChgLandingBase.LANDING_MIN_LIMIT ? ChgLandingBase.LANDING_MIN_LIMIT : parseInt(ChgLandingBase.LANDING_LIMIT);
        return {
            sysIds: [],
            __more: false,
            limit: limit,
            recordCount: 0,
            maxLimit: parseInt(ChgLandingBase.MAX_CHG_MODELS),
            offset: 0
        };
    },

    _getPinnedEncodedQuery: function() {
        var pinnedUserPref = gs.getUser().getPreference("sn_chg_model_ui.landing_page.pinned_change_models");
        var pinnedSysIds = pinnedUserPref ? pinnedUserPref.split(",") : [];

        var validSysIds = pinnedSysIds.filter(function(sysId) {
            return GlideStringUtil.isEligibleSysID(sysId.trim());
        });

        return "sys_idIN" + validSysIds;
    },

    _getChangeTemplatesGr: function(orderBy, textSearch) {
        var chgTemplateSysIds = [];
        // 1. Get all chg_template records, skipping ACLs
        var changeTemplatesGr = new GlideRecord(ChgLandingBase.CHG_TEMPLATE);
        if (!orderBy)
            orderBy = ChgLandingBase.NAME;

        changeTemplatesGr.addActiveQuery();
        changeTemplatesGr.addQuery(ChgLandingBase.STATE, "IN", "published,pending_retirement");
        if (textSearch && typeof textSearch !== "undefined" && textSearch.trim() !== "")
            changeTemplatesGr.addQuery(ChgLandingBase.NAME, "CONTAINS", textSearch).addOrCondition(ChgLandingBase.SHORT_DESCRIPTION, "CONTAINS", textSearch);

        changeTemplatesGr.orderBy(orderBy);
        changeTemplatesGr.query();
        while (changeTemplatesGr.next()) {
            // 2. Get only chg_template records with "read" access to sttrm_model (chg_model) where sttrm_model is not empty
            if (global.JSUtil.notNil(changeTemplatesGr.getValue("sttrm_model")) && changeTemplatesGr.sttrm_model.getRefRecord().canRead())
                chgTemplateSysIds.push(changeTemplatesGr.getUniqueValue());
        }

        // 3. Now with ACLs, return only the records the user has "read" access to chg_template and also "read" access to sttrm_model (chg_model)
        changeTemplatesGr = new GlideRecordSecure(ChgLandingBase.CHG_TEMPLATE);
        changeTemplatesGr.addQuery("sys_id", "IN", chgTemplateSysIds.join(","));
        changeTemplatesGr.query();
        return changeTemplatesGr;
    },

    _buildComponent: function(params) {
        params = params || {};

        if (!params.gr)
            return this._getDefaultStruct();

        if (!params.struct)
            params.struct = this._getDefaultStruct();

        var gr = params.gr;
        params.struct.limit = parseInt(params.struct.limit) || parseInt(ChgLandingBase.LANDING_LIMIT);
        if (params.struct.limit < ChgLandingBase.LANDING_MIN_LIMIT)
            params.struct.limit = ChgLandingBase.LANDING_MIN_LIMIT;
        params.struct.recordCount = parseInt(params.struct.recordCount) || 0;
        while (gr.next()) {

            // MAX limit reached
            if (params.struct.recordCount >= params.struct.maxLimit) {
                params.struct.__more = false;
                break;
            }

            // Current request limit reached
            if (params.struct.recordCount >= params.struct.limit) {
                params.struct.__more = true;
                break;
            }

            var sysId = gr.getUniqueValue();
            if (!this.uniqueChgModels[sysId])
                this.uniqueChgModels[sysId] = new ChgLandingCard(gr, this._gs).toJS();

            params.struct.sysIds.push(sysId);
            params.struct.recordCount++;
        }

        return params.struct;
    },

    findPinned: function(orderBy, textSearch, struct) {
        if (!orderBy)
            orderBy = ChgLandingBase.NAME;

        if (!textSearch)
            textSearch = "";

        var encodedQuery = this._getPinnedEncodedQuery();

        if (this._isStdChgCatalogActive)
            return this.findPreapproved(orderBy, textSearch, encodedQuery, this.findModels(orderBy, textSearch, encodedQuery, struct));

        return this.findModels(orderBy, textSearch, encodedQuery, struct);
    },

    findPreapproved: function(orderBy, textSearch, encodedQuery, struct) {
        if (!this._isStdChgCatalogActive)
            return null;

        return this._buildComponent({
            "gr": global.StandardChangeTemplate.findAll(orderBy, textSearch, encodedQuery),
            "struct": struct
        });
    },

    findModels: function(orderBy, textSearch, encodedQuery, struct) {
        return this._buildComponent({
            "gr": this._getChangeModelsGr(orderBy, textSearch, encodedQuery),
            "struct": struct
        });
    },

    findTemplates: function(orderBy, textSearch, struct) {
        return this._buildComponent({
            "gr": this._getChangeTemplatesGr(orderBy, textSearch),
            "struct": struct
        });
    },

    type: 'ChgLandingCardBuilderSNC'
});

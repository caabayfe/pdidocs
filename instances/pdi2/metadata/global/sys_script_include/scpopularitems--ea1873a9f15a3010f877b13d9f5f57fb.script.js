var SCPopularItems = Class.create();
SCPopularItems.prototype = {

    initialize: function() {
        this._basicQueryFilters = {
            '12': 'sys_created_on>=javascript:gs.beginningOfLast12Months()^',
            '6': 'sys_created_on>=javascript:gs.beginningOfLast6Months()^',
            '3': 'sys_created_on>=javascript:gs.beginningOfLast3Months()^'
        };
        this._baseQuery = '12';
        this._itemValidator = function(catalogItemObject, catalogItemSummary) {
            return true;
        };
        this._itemsLimit = 10;
        this._useOptimisedQuery = true;
        this._includeOrderGuides = false;
        this._allowedItemsList = null;
        this._restrictedItemTypes = null;
		this._checkRestrictedTypes = false;
        this._responseObjectFormatter = function(itemObj, itemType, itemCount) {
            var resultObj = JSON.parse(JSON.stringify(itemObj));
            resultObj.table = itemType;
            resultObj.count = itemCount;
            return resultObj;
        };
        this._checkVisibleServicePortal = false;
        this._checkVisibleStandalone = false;
        this._itemSummaryFetcher = function(item) {
            return item.getItemSummary();
        };
        this._allowedUsersList = null;
    },

    baseQuery: function(query) {
        this._baseQuery = query || '';
        return this;
    },

    visibleStandalone: function(check) {
        this._checkVisibleStandalone = (check === true || check === 'true');
        return this;
    },

    visibleServicePortal: function(check) {
        this._checkVisibleServicePortal = (check === true || check === 'true');
        return this;
    },

    itemsLimit: function(limit) {
        this._itemsLimit = isNaN(parseInt(limit)) ? this._itemsLimit : parseInt(limit);
        return this;
    },

    itemValidator: function(validator) {
        this._itemValidator = typeof validator === 'function' ? validator : this._itemValidator;
        return this;
    },

    restrictedItemTypes: function(itemsList) {
        this._restrictedItemTypes = Array.isArray(itemsList) ? itemsList : this._restrictedItemTypes;
        return this;
    },

    responseObjectFormatter: function(formatter) {
        this._responseObjectFormatter = typeof formatter === 'function' ? formatter : this._responseObjectFormatter;
        return this;
    },

    useOptimisedQuery: function(optimise) {
        this._useOptimisedQuery = (optimise === true || optimise === 'true');
        return this;
    },

    includeOrderGuides: function(includeGuides) {
        this._includeOrderGuides = (includeGuides === true || includeGuides === 'true');
        return this;
    },

    allowedItems: function(allowedItems) {
        this._allowedItemsList = Array.isArray(allowedItems) ? allowedItems : this._allowedItemsList;
        return this;
    },

    allowedUsersList: function(allowedUsersList) {
        this._allowedUsersList = Array.isArray(allowedUsersList) && allowedUsersList.length > 0 ? allowedUsersList : this._allowedUsersList;
        return this;
    },

	checkRestrictedTypes: function(checkRestrictedTypes) {
		this._checkRestrictedTypes = (checkRestrictedTypes === true || checkRestrictedTypes === 'true');
        return this;
	},

    _sortItemResult: function(itemsResult) {
        return itemsResult.sort(function (a, b) {
            return a.order == b.order ? a.name.localeCompare(b.name) : -(a.order - b.order);
        });
    },

    generate: function() {
        var channelAnalytics = new GlideRecord('catalog_channel_analytics');
        return this._useOptimisedQuery && channelAnalytics.isValid() ? this._getFromChannelAnalytics() : this._getFromTableQuery();
    },

    _allowItem: function(catalogItemJS, catItemDetails) {
        if (this._checkVisibleStandalone && !catItemDetails.visible_standalone)
            return false;

        if (this._checkVisibleServicePortal && !catalogItemJS.isVisibleServicePortal())
            return false;

        return true;
    },

    // Always include order guides
    _getFromChannelAnalytics: function() {
        var itemsResult = [];
        var citm = 0;
        var count = new GlideAggregate('catalog_channel_analytics');
        count.setCategory('catalog_meta');
        count.setGroupByFollowRef(false);
        count.setOrderByFollowRef(false);
        count.addAggregate('COUNT', 'catalog_item');
        count.groupBy('catalog_item');

        count.addEncodedQuery(this._basicQueryFilters[this._baseQuery] || '');
        if (Array.isArray(this._allowedItemsList))
            count.addQuery('catalog_item', "IN", this._allowedItemsList);
        if (Array.isArray(this._allowedUsersList))
            count.addQuery('requested_for', "IN", this._allowedUsersList);

        count.addNotNullQuery('catalog_item');
        // Donot Include items ordered as part of orderguide
        count.addNullQuery('order_guide');
        count.addNotNullQuery('document_key');

        count.orderByAggregate('COUNT', 'catalog_item');
        count.query();
        while (citm < this._itemsLimit && count.next()) {
            var catItemId = count.getValue("catalog_item");
            var catalogItemJS = new sn_sc.CatItem(catItemId);
            var catItemDetails = this._itemSummaryFetcher(catalogItemJS);
            if (!this._allowItem(catalogItemJS, catItemDetails) ||
			(this._checkRestrictedTypes && this._isRestrictedItemType(catalogItemJS.getRecordClass())))
                continue;

            if (this._itemValidator(catalogItemJS, catItemDetails)) {
                var response = this._responseObjectFormatter(catItemDetails, catItemDetails.sys_class_name, count.getAggregate('COUNT', 'catalog_item'));
                var massageWith = this._getMassageObject(catItemDetails.name, count.getAggregate('COUNT', 'catalog_item'));
                itemsResult.push(this._massageResponseObject(response, massageWith));
                citm++;
            }
        }
        var guides = 0;
        count = new GlideAggregate('catalog_channel_analytics');
        count.setCategory('catalog_meta');
        count.setGroupByFollowRef(false);
        count.setOrderByFollowRef(false);
        count.addAggregate('COUNT', 'sys_id');
        count.groupBy('catalog_item');
        count.addNotNullQuery('catalog_item');
        count.addQuery('table_name', 'sc_cat_item_guide');
        count.addEncodedQuery(this._basicQueryFilters[this._baseQuery] || '');
        if (Array.isArray(this._allowedItemsList))
            count.addQuery('catalog_item', "IN", this._allowedItemsList);
        count.orderByAggregate('COUNT', 'sys_id');
        if (Array.isArray(this._allowedUsersList))
            count.addQuery('requested_for', "IN", this._allowedUsersList);
        count.query();
        while (guides < this._itemsLimit && count.next()) {
            var guideId = count.getValue("catalog_item");
            catalogItemJS = new sn_sc.CatItem(guideId);
            catItemDetails = this._itemSummaryFetcher(catalogItemJS);
            if (!this._allowItem(catalogItemJS, catItemDetails))
                continue;
            if (this._itemValidator(catalogItemJS, catItemDetails)) {
                response = this._responseObjectFormatter(catItemDetails, 'sc_cat_item_guide', count.getAggregate('COUNT', 'sys_id'));
                massageWith = this._getMassageObject(catItemDetails.name, count.getAggregate('COUNT', 'sys_id'));
                itemsResult.push(this._massageResponseObject(response, massageWith));
                guides++;
            }
        }

        itemsResult = this._sortItemResult(itemsResult);

        return itemsResult.length > this._itemsLimit ?
               itemsResult.slice(itemsResult.length - this._itemsLimit, itemsResult.length) :
               itemsResult;
    },

    // Only include Order guides if asked
    _getFromTableQuery: function() {
        var itemsResult = [];
        var ritms = 0;
        var count = new GlideAggregate('sc_req_item');
        count.setCategory('catalog_meta');
        count.setGroupByFollowRef(false);
        count.setOrderByFollowRef(false);
        count.addAggregate('COUNT', 'cat_item');
        count.groupBy('cat_item');
        count.addNotNullQuery('cat_item');
        if (Array.isArray(this._allowedItemsList))
            count.addQuery('cat_item', "IN", this._allowedItemsList);
        if (this._includeOrderGuides)
            count.addNullQuery('order_guide');
        count.addEncodedQuery(this._basicQueryFilters[this._baseQuery] || '');
        count.orderByAggregate('COUNT', 'cat_item');
        count.query();
        while (ritms < this._itemsLimit && count.next()) {
            var catItemId = count.getValue("cat_item");
            var catalogItemJS = new sn_sc.CatItem(catItemId);
            var catItemDetails = this._itemSummaryFetcher(catalogItemJS);
            if (!this._allowItem(catalogItemJS, catItemDetails) || this._isRestrictedItemType(catalogItemJS.getRecordClass()))
                continue;
            if (this._itemValidator(catalogItemJS, catItemDetails)) {
                var response = this._responseObjectFormatter(catItemDetails, catItemDetails.sys_class_name, count.getAggregate('COUNT', 'cat_item'));
                massageWith = this._getMassageObject(catItemDetails.name, count.getAggregate('COUNT', 'cat_item'));
                itemsResult.push(this._massageResponseObject(response, massageWith));
                ritms++;
            }
        }
        if (this._includeOrderGuides) {
            var guides = 0;
            count = new GlideAggregate('sc_req_item');
            count.setCategory('catalog_meta');
            count.setGroupByFollowRef(false);
            count.setOrderByFollowRef(false);
            count.addAggregate('COUNT', 'order_guide');
            count.addAggregate('COUNT(DISTINCT', 'request');
            count.groupBy('order_guide');
            count.addNotNullQuery('order_guide');
            count.addEncodedQuery(this._basicQueryFilters[this._baseQuery] || '');
            if (Array.isArray(this._allowedItemsList))
                count.addQuery('order_guide', "IN", this._allowedItemsList);
            count.orderByAggregate('COUNT(DISTINCT', 'request');
            count.query();
            while (guides < this._itemsLimit && count.next()) {
                var guideId = count.getValue("order_guide");
                catalogItemJS = new sn_sc.CatItem(guideId);
                catItemDetails = this._itemSummaryFetcher(catalogItemJS);
                if (!this._allowItem(catalogItemJS, catItemDetails))
                    continue;
                if (this._itemValidator(catalogItemJS, catItemDetails)) {
                    response = this._responseObjectFormatter(catItemDetails, 'sc_cat_item_guide', count.getAggregate('COUNT(DISTINCT', 'request'));
                    massageWith = this._getMassageObject(catItemDetails.name, count.getAggregate('COUNT(DISTINCT', 'request'));
                    itemsResult.push(this._massageResponseObject(response, massageWith));
                    guides++;
                }
            }
        }
        var producers = 0;
        count = new GlideAggregate('sc_item_produced_record');
        count.setCategory('catalog_meta');
        count.setGroupByFollowRef(false);
        count.setOrderByFollowRef(false);
        if (Array.isArray(this._allowedItemsList))
            count.addQuery('producer', "IN", this._allowedItemsList);
        count.addEncodedQuery(this._basicQueryFilters[this._baseQuery] || '');
        count.addAggregate('COUNT', 'producer');
        count.addNotNullQuery('producer');
        count.groupBy('producer');
        count.orderByAggregate('COUNT', 'producer');
        count.query();
        while (producers < this._itemsLimit && count.next()) {
            var rpId = count.getValue('producer');
            catalogItemJS = new sn_sc.CatItem(rpId);
            catItemDetails = this._itemSummaryFetcher(catalogItemJS);
            if (!this._allowItem(catalogItemJS, catItemDetails))
                continue;
            if (this._itemValidator(catalogItemJS, catItemDetails)) {
                response = this._responseObjectFormatter(catItemDetails, 'sc_cat_item_producer', count.getAggregate('COUNT', 'producer'));
                massageWith = this._getMassageObject(catItemDetails.name, count.getAggregate('COUNT', 'producer'));
                itemsResult.push(this._massageResponseObject(response, massageWith));
                producers++;
            }
        }

        itemsResult = this._sortItemResult(itemsResult);

        return itemsResult.length > this._itemsLimit ?
               itemsResult.slice(itemsResult.length - this._itemsLimit, itemsResult.length) :
               itemsResult;
    },

    _getMassageObject: function(name, order) {
        return {
            'name': name || '',
            'order': 0 - (parseInt(order) || 0)
        };
    },

    _massageResponseObject: function(responseObj, massageObj) {
        if (typeof responseObj == 'undefined')
            responseObj = {};
        if (typeof massageObj != 'undefined')
            for (var key in massageObj)
                responseObj[key] = massageObj[key];

        return responseObj;

    },

    _isRestrictedItemType: function(itemType) {
        if (!Array.isArray(this._restrictedItemTypes))
            return false;
        return this._restrictedItemTypes.indexOf(itemType) >=0;
    },

    type: 'SCPopularItems'
};

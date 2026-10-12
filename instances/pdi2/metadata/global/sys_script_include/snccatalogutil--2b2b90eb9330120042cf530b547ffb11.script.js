var SNCCatalogUtil = Class.create();
SNCCatalogUtil.prototype = {
    initialize: function() {},
    //category/catalog field in related list
    getReferenceQual: function(prefix) {
        if (!gs.hasRole('catalog_admin') && (gs.hasRole('catalog_manager') || gs.hasRole('catalog_editor')))
            return prefix + 'manager=' + gs.getUserID() + '^OR' + prefix + 'editorsCONTAINS' + gs.getUserID();
        return '';
    },
    //category field in cat item
    getReferenceQualItem: function() {
        return this.getReferenceQualItemGivenCatalogs(current.getValue('sc_catalogs'));
    },

    getReferenceQualItemGivenCatalogs: function(catalogs) {
        if (!gs.hasRole('catalog_admin') && (gs.hasRole('catalog_manager') || gs.hasRole('catalog_editor')))
            return 'sc_catalog.manager=' + gs.getUserID() + '^ORsc_catalog.editorsCONTAINS' + gs.getUserID() + '^sc_catalogIN' + (catalogs || '') + '^sys_class_name!=sc_category_top_n';
        else
            return 'sc_catalogIN' + (catalogs || '') + '^sys_class_name!=sc_category_top_n';
    },

    //cat item field in related list
    getReferenceQualRlt: function() {
        if (!gs.hasRole('catalog_admin') && (gs.hasRole('catalog_manager') || gs.hasRole('catalog_editor'))) {
            var result = [];
            var gr = new GlideRecord("sc_catalog");
            gr.addQuery('manager', gs.getUserID()).addOrCondition('editors', 'CONTAINS', gs.getUserID());
            gr.query();
            if (gr.hasNext())
                while (gr.next())
                    result.push('sc_catalogsCONTAINS' + gr.getUniqueValue());
            else
                result.push('sc_catalogs=-1');

            return result.join('^OR');
        } else
            return '';
    },

	getReferenceQualForCatItemOnVariableSetAssoc : function(variableSet) {
		var baseQualifier = this.getReferenceQualRlt();
		if (JSUtil.notNil(variableSet) && variableSet.sys_class_name == 'item_option_new_producer_set') {
			if (baseQualifier)
				baseQualifier = baseQualifier + '^';

			return baseQualifier + 'sys_class_name=sc_cat_item_composite_producer';
		}
		else
			return baseQualifier;
    },

	getReferenceQualForVarSet : function(catalogItem) {
		if (JSUtil.notNil(catalogItem) && catalogItem.sys_class_name == 'sc_cat_item_composite_producer')
			return '';
		else
			return 'sys_class_name!=item_option_new_producer_set';
    },

    getReferenceQualCatalogClientScript: function() {
        gs.log("getReferenceQualCatalogClientScript api is deprecated, use getReferenceQualRltConditions instead");
        return getReferenceQualRltConditions();
    },
    getReferenceQualRltConditions: function() {
        var conditions = this.getReferenceQualRlt();
        if (conditions === '')
            return 'sc_ic_item_stagingISEMPTY^NQsc_ic_item_stagingISNOTEMPTY^active=true^EQ';
        else
            return conditions + '^sc_ic_item_stagingISEMPTY^NQsc_ic_item_stagingISNOTEMPTY^' + conditions + '^active=true^EQ';
    },
    canRead: function(cat_item, isNewRecord) {
        return this.canWrite(cat_item, isNewRecord);
    },
    canWrite: function(cat_item, isNewRecord) {
        if (cat_item) {
            if (cat_item.isNewRecord())
                return true;
            else if (JSUtil.notNil(cat_item.sc_catalogs.toString())) {
                var gr = new GlideRecord('sc_catalog');
                gr.addEncodedQuery('sys_idIN' + cat_item.sc_catalogs.toString());
                gr.addQuery('manager', gs.getUserID()).addOrCondition('editors', 'CONTAINS', gs.getUserID());
                gr.query();
                if (gr.next())
                    return true;
            }
        } else if (isNewRecord)
            return true;
    },
    canCreate: function(cat_item) {
        if (cat_item) {
            if (cat_item.sc_catalogs.toString()) {
                var gr = new GlideRecord('sc_catalog');
                gr.addEncodedQuery('sys_idIN' + cat_item.sc_catalogs.toString());
                gr.addQuery('manager', gs.getUserID()).addOrCondition('editors', 'CONTAINS', gs.getUserID());
                gr.query();
                if (gr.next())
                    return true;
            }
        } else
            return true;
    },
    canDelete: function(cat_item) {
        if (cat_item) {
            if (cat_item.sc_catalogs.toString()) {
                var gr = new GlideRecord('sc_catalog');
                gr.addEncodedQuery('sys_idIN' + cat_item.sc_catalogs.toString());
                gr.addQuery('manager', gs.getUserID()).addOrCondition('editors', 'CONTAINS', gs.getUserID());
                gr.query();
                if (gr.next())
                    return true;
            }
        }
    },
    getActiveWorkFlows: function(tableName) {
        var gr = GlideRecord('wf_workflow_version');
        if (tableName)
            gr.addQuery('table', tableName);
        gr.addActiveQuery();
        var qc = gr.addQuery('published', true);
        qc.addOrCondition('checked_out_by', gs.getUserID());
        gr.query();
        var ids = [];
        while (gr.next()) {
            ids.push(gr.workflow + "");
        }
        return 'sys_idIN' + ids.join(',');
    },

    getCatalogIDFromURL: function() {
        try {
            var uri = gs.action.getGlideURI();
            return GlideappCatalogItem.getCatalogID(uri.get('sysparm_collection'), uri.get('sysparm_collectionID'));
        } catch (ex) {
            gs.log('Error in retrieving CatalogID from URL');
        }
    },

    getCategoryIDFromURL: function() {
        try {
            var uri = gs.action.getGlideURI();
            if (uri.get('sysparm_collection') == 'sc_category')
                return uri.get('sysparm_collectionID');
            return '';
        } catch (ex) {
            gs.log('Error in retrieving CategoryID from URL');
        }
    },

    getStagingItemsInDomain: function(currentDomain) {
        if (new CatalogDomainUtil().isDomainIsolationEnabled()) {
            var gr = new GlideRecord('sc_ic_item_staging');
            var ids = [];
            gr.query();
            while (gr.next()) {
                if (!gr.sc_cat_item || currentDomain == gr.sc_cat_item.sys_domain)
                    ids.push(gr.sys_id);
            }
            return 'sys_idIN' + ids.join(',');
        }
        return '';
    },

    getCatalogsOfPortal: function(portal_id) {
        var catalogs = [];
        var gr = new GlideRecord('m2m_sp_portal_catalog');
        gr.addActiveQuery();
        gr.addQuery('sp_portal', portal_id);
        gr.addQuery('sc_catalog.active', true);
        gr.query();
        if (gr.hasNext())
            while (gr.next())
                catalogs.push('sc_catalogsCONTAINS' + gr.sc_catalog);
        else
            catalogs.push('sc_catalogs=-1');

        return catalogs.join('^OR');
    },
    syncVariableTableName: function(catItem, variableSet) {
        //This function will be automatically called when this rule is processed.
        var newTable = current.getValue('table_name');
        var gr = new GlideRecord('item_option_new');
        if (catItem)
            gr.addQuery('cat_item', catItem);
        if (variableSet)
            gr.addQuery('variable_set', variableSet);
        gr.setValue('record_producer_table', newTable);
        gr.updateMultiple();

        gr.initialize();
        if (catItem)
            gr.addQuery('cat_item', catItem);
        if (variableSet)
            gr.addQuery('variable_set', variableSet);
        gr.addQuery('map_to_field', true);
        gr.query();

        var count = 0;
        var testGr = new GlideRecord(newTable);
        while (gr.next()) {
            if (!testGr.isValidField(gr.getValue('field'))) {
                gr.setValue('map_to_field', false);
                gr.setValue('field', null);
                gr.update();
                count++;
            }
        }
        if (count > 0)
            gs.addInfoMessage(gs.getMessage("Map to fields was turned off for {0} variable(s)", count + ''));
    },

    getAllInstancesOfTable: function(table) {
        var instances = [];
        var instanceList = GlideDBObjectManager.get().getAllExtensions(table);
        for (var i = 0; i < instanceList.size(); i++)
            instances.push(instanceList.get(i));
        return instances;
    },

    getUsersFromGroup: function(group) {
        if (!group)
            return '';

        var users = [];
        var gr = GlideUserGroup.getMembers(group);
        while (gr.next())
            users.push(gr.getValue('user'));

        return 'sys_idIN' + users.join();
    },

	checkTableValidityOnRecordProducer: function(table_name) {
		if (JSUtil.nil(table_name))
			return true;

		var gr = new GlideRecord(table_name);
		if (gr.instanceOf('sc_task') || gr.instanceOf('sc_req_item') || gr.instanceOf('sc_request'))
			return false;

		return true;
	},

	_getSingleRowVariableSetIdList: function(catItemId) {
	    var srvsIdList = [];
	    var gr = new GlideRecord('io_set_item');
	    gr.addQuery('sc_cat_item', catItemId);
	    gr.addQuery('variable_set.type', 'one_to_one');
	    gr.query();
	    while (gr.next())
	        srvsIdList.push(gr.getValue('variable_set'));
	    return srvsIdList;
	},

	getAllSiblingVarRefQual: function(catItemId, variableSetId, variableId) {
		if (catItemId) {
			var srvsIdList = this._getSingleRowVariableSetIdList(catItemId);
			if (srvsIdList.length != 0)
				return 'cat_item='+catItemId+'^ORvariable_setIN'+(srvsIdList)+'^sys_id!='+variableId+'^active=true';
			else
				return 'cat_item='+catItemId+'^sys_id!='+variableId+'^active=true';
		}
		else if (variableSetId)
			return 'variable_set='+variableSetId+'^sys_id!='+variableId;
		return 'cat_item=-1';
	},

	getDynamicValueFieldRefQual: function(catItemId, variableSetId, variableId) {
		if(catItemId || variableSetId){
			return this.getAllSiblingVarRefQual(catItemId, variableSetId, variableId) + '^typeIN8,31';
		}
		return 'cat_item=-1';
	},

    getCatItemSCTask : function(current) {
		if (current && current.request_item)
			return current.request_item.cat_item;

		return '';
	},

	hasPricingImplicationsImpact: function(current) {
        if (!current)
            return false;

		if(current.operation() == 'insert')
			return true;

        if (current.instanceOf("item_option_new"))
            return current.lookup_price.changes() || current.rec_lookup_price.changes() ||
                current.price_if_checked.changes() || current.rec_price_if_checked.changes() ||
                current.pricing_implications.changes() || current.cat_item.changes() || current.variable_set.changes();
        else if (current.instanceOf("sc_cat_item"))
            return current.price.changes() || current.recurring_price.changes();
        else if (current.instanceOf("io_set_item"))
            return current.sc_cat_item.changes() || current.variable_set.changes();
        else
            return false;
    },

    isProcessBuilder: function(current, operations) {
        if (!current || !isProcessMarkedDefined() || !Array.isArray(operations))
            return false;

        return GlideappScriptHelper.isProcessMarked(operations, current.sys_id);
        function isProcessMarkedDefined() {
            try {
                return JSUtil.has(GlideappScriptHelper.isProcessMarked);
            } catch (e) {
                return false;
            }
        }
    },

    type: 'SNCCatalogUtil'
};

var ProductCatalogUtils = Class.create();
ProductCatalogUtils.prototype = {
    initialize: function() {
		this.CATALOG_CONTENT_TYPE = '98f9a16553622010069addeeff7b1248';
    },

    getCurrencyPropertyValue: function() {
		var currencyProp = false;
        new global.GlideQuery('sys_properties')
            .where('name', 'glide.model.catalog_item_currency')
            .selectOne('value')
            .ifPresent(function (prop) {
                currencyProp = prop.value;
            });
        return currencyProp;
	},

    createChildProductCatalog: function(parent, type) {
        var modelComponent = new GlideRecord('cmdb_m2m_model_component');
        modelComponent.addQuery('parent', parent.sys_id);
        modelComponent.query();
        while (modelComponent.next()) {
            var source = new GlideRecord('cmdb_model');
            source.get(modelComponent.child);
            if (source.product_catalog_item.nil()) {
                if (new global.PublishHardwareCatalogUtil().isEligibleProductModel(source.sys_class_name.toString()))
                    source.product_catalog_item = (new ProductCatalogUtils()).createProductCatalog(source, parent.product_catalog_item.category, 'model', 'pc_hardware_cat_item');
                else if (source.sys_class_name == 'cmdb_software_product_model')
                    source.product_catalog_item = (new ProductCatalogUtils()).createProductCatalog(source, parent.product_catalog_item.category, 'model', 'pc_software_cat_item');
                else
                    source.product_catalog_item = (new ProductCatalogUtils()).createProductCatalog(source, parent.product_catalog_item.category, 'model', 'pc_product_cat_item');
                source.update();
            }
            var sc_cat = new GlideRecord('sc_cat_item_children');
            sc_cat.child = source.product_catalog_item;
            sc_cat.parent = parent.product_catalog_item;
            sc_cat.insert();
        }
    },

    createProductCatalog: function(source, category, type, table, topic) {
        var destination = new GlideRecord(table);
        this._syncRows(destination, source, category, type, topic);
        var sys_id = destination.insert();
        this._syncPicture(source, table, sys_id);
		if (!gs.nil(topic)) {
			this._associateCatalogToTopic(sys_id, table);
		}
        return sys_id
    },

    updateProductCatalog: function(source, type, table) {
        var destination = new GlideRecord(table);
        destination.get(source.product_catalog_item);
        this._syncRows(destination, source, '', type);
        destination.update();
        // Fix to a PRB1606865 to sync pictures
        this._syncPicture(source, table, destination.sys_id);
    },

	_associateCatalogToTopic: function(item, table) {
		var itemGr = new GlideRecord(table);
		if (itemGr.get(item)) {
			// Check if the m2m_connected_content record already exists
			var gr = new GlideRecord('m2m_connected_content');
			gr.addQuery('catalog_item', item);
			gr.addQuery('topic', itemGr.getValue('taxonomy_topic'));
			gr.query();
			if (!gr.hasNext()) {
				// Create new m2m_connected_content record
				var m2mGr = new GlideRecord('m2m_connected_content');
				m2mGr.initialize();
				m2mGr.setValue('content_type', this.CATALOG_CONTENT_TYPE);
				m2mGr.setValue('catalog_item', item);
				m2mGr.setValue('topic', itemGr.getValue('taxonomy_topic'));
				m2mGr.insert();
			}
		}
	},

	_getVendorItemDescription: function(item) {
		var description = '';
		if(item.description) // not null and not empty string
			description = item.description;
		else if (item.model)
			description = item.model.description;

		return description;
	},

	_getVendorItemPrice: function(item) {
		var priceCurrency = 'USD';
		var priceValue = '0.00';

		if(item.price && item.price != '0' && item.price != '0.00') {
		    //not null, undefined, or 0
			priceCurrency = item.price.getReferenceCurrencyCode();
			priceValue = item.price.getReferenceValue();
		}
		else if (item.model && item.model.cost != null) {
			priceCurrency = item.model.cost.getReferenceCurrencyCode();
			priceValue = item.model.cost.getReferenceValue();
		}

		return priceCurrency + ';' + priceValue
	},

    _syncRows: function(destination, source, category, type, topic) {
		destination.sys_domain = source.sys_domain;
        destination.setDisplayValue('description', source.description.getDisplayValue());
	destination.setDisplayValue('short_description', source.short_description.getDisplayValue());
        destination.auto_created = true;
        if (category != '') {
            destination.category = category;
			destination.sc_catalogs = GlideappCategory.get(category).getCatalog();
		}
		if (!gs.nil(topic)) {
			destination.taxonomy_topic = topic;
		}

        if (type == 'vendor') {
			destination.description = this._getVendorItemDescription(source);
            if (destination.name == '')
                destination.name = source.name;
            destination.product_id = source.product_id;
            if (destination.price == 0)
                destination.price = this._getVendorItemPrice(source);
            destination.cost = source.price;
            destination.vendor = source.vendor;
            destination.vendor_catalog_item = source.sys_id;
            destination.specs = source.specs;
            destination.features = source.features;
            destination.model = source.model;
            destination.upc = source.upc;
        } else {
            if (type == 'model_use_display_name') {
               if (destination.name == '') {
                  if (!gs.nil(source.display_name)) {
                     destination.name = source.display_name;
                  } else {
                     destination.name = source.name;
                  }
               }
            } else {
               if (destination.name == '')
                  destination.name = source.name;
            }
            destination.product_id = source.model_number;
            if (destination.price == 0){
				// If property is set, use Model currency if not use Reference currency
				if (this.getCurrencyPropertyValue() === 'true') {
					destination.price = source.cost.getCurrencyCode() + ';' + source.cost.getCurrencyValue();
				} else {
					destination.price = source.cost;
				}
			}
			// If property is set, use Model currency if not use Reference currency
			if (this.getCurrencyPropertyValue() === 'true') {
				destination.cost = source.cost.getCurrencyValue();
				destination.recurring_price = source.cost.getCurrencyCode() + ';' + 0;
				destination.list_price = source.cost.getCurrencyCode() + ';' + 0;
			}
			else {
				destination.cost = source.cost;
			}
            destination.model = source.sys_id;
            if (destination.vendor.nil())
                destination.vendor = source.manufacturer;
        }
    },

    _syncPicture: function(sourceRecord, targetTable, targetID) {
		GlideSysAttachment.copy(
			sourceRecord.getRecordClassName(),
			sourceRecord.getUniqueValue(),
			targetTable,
			targetID
		);
    },

    _createVariableRequestFor: function(catItemSysId){
        if(!GlidePluginManager.isActive('com.snc.samp')) {
            return;
        }

        var variable = new GlideRecord('item_option_new');
		variable.mandatory = true;
		variable.question_text = gs.getMessage('Request for');
		variable.name = 'requested_for_user';
		variable.cat_item = catItemSysId;

		//Variable type
		variable.type = 31;
		variable.order = 100;
		//help text
		variable.show_help = true;
		variable.help_text = gs.getMessage('Request for yourself or on behalf of another person.');

		var reqForUserSysId = variable.insert();
        return reqForUserSysId;
    },

    _createVariableForDeviceName: function(catItemSysId){
		if(!GlidePluginManager.isActive('com.snc.samp')) {
            return;
        }

		var variable = new GlideRecord('item_option_new');
		variable.name = 'device_name';
		variable.mandatory = false;
		variable.question_text = gs.getMessage('Device name');
		variable.cat_item = catItemSysId;

		//Variable type and reference
		variable.type = 8;
        variable.order = 200;
		variable.reference = 'cmdb_ci_computer';
		variable.use_reference_qualifier = 'advanced';
		variable.reference_qual ='javascript: new SAMPVirutalAgentCatalogUtil().filterDevices(current.variables.requested_for_user);';
		//help text
		variable.show_help = true;
		variable.help_text = gs.getMessage('Please select the device this software will be installed on.');
		//variable roles
		variable.read_roles = 'cmdb_read,service_viewer';

		variable.insert();

	},

    _prepareScript: function() {
        var script = [];
        script.push("function onChange(control, oldValue, newValue, isLoading) {");
        script.push("function processUserInfo(serverResponse) {");
        script.push("var value = serverResponse.responseXML.documentElement.getAttribute('answer');");
        script.push("if(value && value!==''){");
        script.push("g_form.setValue('device_name',value);");
        script.push("}else{");
        script.push("g_form.setValue('device_name','');");
        script.push("}");
        script.push("}");
        script.push("var ga = new GlideAjax('global.SAMPVirutalAgentCatalogUtil');");
        script.push("ga.addParam('sysparm_name', 'defaultValueForDevice');");
        script.push("ga.addParam('sysparm_id', newValue);");
        script.push("ga.getXML(processUserInfo);");
        script.push("}");
        return script.join('\n');
    },

    _createCatalogClientScript: function(catItemSysId,reqForUserSysId){
		if(!GlidePluginManager.isActive('com.snc.samp')) {
            return;
        }
		var catScriptGr = new GlideRecord('catalog_script_client');
		catScriptGr.addQuery('name','Update Device Name on User Change');
		catScriptGr.addQuery('cat_item',catItemSysId);
		catScriptGr.addQuery('cat_variable','IO:'+reqForUserSysId);
		catScriptGr.query();
		if(!catScriptGr.next()){
			var catClientScriptGr = new GlideRecord('catalog_script_client');
	        catClientScriptGr.initialize();
			catClientScriptGr.name = 'Update Device Name on User Change';
			catClientScriptGr.type = 'onChange';
	        catClientScriptGr.active = true;
			catClientScriptGr.ui_type = '10';

			catClientScriptGr.cat_item = catItemSysId;
			catClientScriptGr.cat_variable = 'IO:'+reqForUserSysId;

			catClientScriptGr.applies_to = 'item';
	        catClientScriptGr.applies_sc_task = false;
	        catClientScriptGr.applies_catalog = true;
	        catClientScriptGr.applies_req_item = false;

	        //script
			catClientScriptGr.script = this._prepareScript();

			catClientScriptGr.insert();
		}

	},

    createVarForExisitingCatalogItems: function(catItemSysId){
		//User variable
		var varGr = new GlideRecord('item_option_new');
		varGr.addQuery('cat_item', catItemSysId);
		varGr.addQuery('name', 'requested_for_user');
		varGr.query();
		if (!varGr.next()) {
			var reqForUserSysId = this._createVariableRequestFor(catItemSysId);
			this._createCatalogClientScript(catItemSysId, reqForUserSysId);
		}

		//Device name variable
		varGr = new GlideRecord('item_option_new');
		varGr.addQuery('cat_item', catItemSysId);
		varGr.addQuery('name', 'device_name');
		varGr.query();
		if (!varGr.next()) {
			this._createVariableForDeviceName(catItemSysId);
		}
	},

    type: 'ProductCatalogUtils'
}

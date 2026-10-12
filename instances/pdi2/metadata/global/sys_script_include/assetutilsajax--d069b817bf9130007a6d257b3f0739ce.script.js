var AssetUtilsAJAX = Class.create();
AssetUtilsAJAX.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    isSerialNumberMandatory: function() {
        if (gs.getProperty('glide.asset.create_ci_with_ire') === 'true') {
            var modelCategory = this.getParameter('sysparm_model_category');
            var tableName = this.getParameter('sysparm_table_name');
            if (tableName != 'alm_consumable' && tableName != 'alm_license') {
                var modelCategoryGr = new GlideRecord('cmdb_model_category');
                if (modelCategoryGr.get(modelCategory)) {
                    var ciClass = modelCategoryGr.cmdb_ci_class;
                    if (!gs.nil(ciClass)) {
                        var res = SNC.CmdbMetadataScriptableApi.hasSerialNumberRuleWithNoRelationship(ciClass);
                        return res;
                    }
                }
            }
        }
        return false;
    },

	getMandatoryAttributes: function() {
    	var modelCategory = this.getParameter('sysparm_model_category');
    	var tableName = this.getParameter('sysparm_table_name');
    	var mandatoryfields = [];
    	if (tableName !== 'alm_consumable' && tableName !== 'alm_license') {
        	mandatoryfields = global.AssetUtils.getMandatoryAttributes(modelCategory);
    	}
    	return JSON.stringify([mandatoryfields]);
	},

    getQuantity: function() {
        var model = this.getParameter('sysparm_model');
        var stockroom = this.getParameter('sysparm_stockroom');
        return (new AssetUtils()).getAvailableQuantity(model, stockroom);
    },

    needMore: function() {
        var model = this.getParameter('sysparm_model');
        return (new AssetUtils()).getStockRooms(model).toString();

    },

    findVendor: function() {
        var model = this.getParameter('sysparm_model');
        return (new AssetUtils()).getVendors(model).toString();
    },

    mergeLicenses: function() {
        return (new AssetUtils()).mergeLicenses(this.getParameter('sysparm_licenseId'));
    },

    shouldMakeStatusSubstatusReadonly: function () {
		var result = {
			install_status: false,
			substatus: false,
		};
		var assetGr = new GlideRecord('alm_asset');
		assetGr.addQuery('sys_id', this.getParameter('sysparm_asset'));
		assetGr.query();
		if (assetGr.next()) {
			// Check disposal order number
			if (GlidePluginManager.isActive('com.sn_eam')
				&& (sn_eam.EAMUtils.isEnterpriseClassAsset(assetGr) || sn_eam.EAMUtils.isEnterpriseModel(assetGr.model))) {
				var out = new sn_eam.EAMDisposalUtils.shouldMarkFieldsReadOnly(assetGr, result);
				out = new sn_eam.EAMRMAUtils.shouldMarkFieldsReadOnly(assetGr, out);
				result.install_status = out.install_status;
				result.substatus = out.substatus;
			} else if (GlidePluginManager.isActive('com.sn_hamp')) {
				var out = new sn_hamp.HampHWDisposalUtils().shouldMarkFieldsReadOnly(assetGr);
				result.install_status = out.install_status;
				result.substatus = out.substatus;
			}
			if (!result.install_status || !result.substatus) {
				// Check if marked for disposal
				if (assetGr.getValue('sys_class_name') === 'alm_consumable') {
					var consumableGr = new GlideRecord('alm_consumable');
					consumableGr.get(assetGr.getUniqueValue());
					if (consumableGr.getValue('planned_for_disposal') === '1') {
						result.install_status = true;
						result.substatus = true;
					}
				}
			}
			if (!result.substatus) {
				var status = assetGr.getValue('install_status');
				if (status === '10' || status === '2' || status === '3') {
					result.substatus = true;
				}
			}
			// DEF0274026 - State field should be readonly for pre-allocated assets
			if(!result.install_status){
				var subStatus = assetGr.getValue('substatus');
				if (subStatus === 'pre_allocated') {
					result.install_status = true;
				}
			}
		}
		return JSON.stringify(result);
	},

	shouldUpdateDepreciationValues: function() {
		var assetClass = this.getParameter('sysparm_class');
		return AssetUtils.shouldUpdateDepreciationValues(assetClass);
	},

	isDomainDataSeparationEnabled: function() {
		return GlideDomainSupport.isDataSeparationEnabled();
	},

	validateConsumables: function() {
		var sysIds = this.getParameter('sysparm_ids');
		var state = this.getParameter('sysparm_state');
		var temp = new Array();
		temp = sysIds.split(",");
		for(var i = 0; i < temp.length; i++) {
			var assetGr = new GlideRecord('alm_consumable');
			assetGr.addQuery('sys_id', temp[i]);
			assetGr.query();
			if(state == '10') {
				if(!assetGr.hasNext()) {
					gs.addInfoMessage(gs.getMessage("Consumed is a valid state only for consumables, please select correct state"));
					return false;
				}
			}
			if(state == '1') {
				if(assetGr.hasNext()) {
					gs.addInfoMessage(gs.getMessage("In use is an invalid state for consumables, please select correct state"));
					return false;
				}
			}
		}
		return true;
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

	getModelValues: function() {
		var sysId = this.getParameter("sysparm_sysId");
		var fields = this.getParameter("sysparm_fields");
		var modelGr = new GlideRecordSecure('cmdb_model');
		modelGr.get(sysId);
		if (!modelGr.isValid()) {
			this.setError("Invalid GlideRecord cmdb_model " + ":" + sysId);
			return;
		}
		var result = {};
		if (fields.includes('description')){
			result.description = modelGr.getValue('description') || '';
		}
		if (fields.includes('cost')){
			var field = modelGr.getElement("cost");
			// If property is set, use Model currency if not use Reference currency
			if (this.getCurrencyPropertyValue() === 'true') {
				result.value = field.getCurrencyValue();
				result.currency = field.getCurrencyCode();
			}
			else{
				result.value = field.getReferenceValue();
				result.currency = field.getReferenceCurrencyCode();
			}
		}
		return JSON.stringify(result);
	},
});

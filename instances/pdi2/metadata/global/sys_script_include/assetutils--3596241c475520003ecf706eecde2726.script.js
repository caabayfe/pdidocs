var AssetUtils = Class.create();
AssetUtils.INSTOCK_STATUS = 6;
AssetUtils.CONSUMED_STATUS = '10';
AssetUtils.AVAILABLE_SUBSTATUS = 'available';
AssetUtils.RESERVED_SUBSTATUS = 'reserved';
AssetUtils.ASSET_FUNCTION_FEATURE = {
    SOURCING: 'SOURCING',
    TO_FORM: 'TO_FORM',
    COMMON: 'COMMON',
    STOCK_RULE: 'STOCK_RULE',
};
AssetUtils.ASSET_UPDATE_SOURCE = {
    IBI: 'IBI',
    CI: 'CI'
};
AssetUtils.prototype = {
    initialize: function() {},

    // The substatus that we consider available is different for FSM returns
    determineAvailableStatus: function(tol) {
        var availableStatus = 'available';
        if (SNC.AssetMgmtUtil.isPluginRegistered('com.snc.work_management') &&
            !tol.return_from_tol.nil() &&
            !tol.return_from_tol.transfer_order.service_order_task.nil()) {
            availableStatus = 'received' == tol.return_from_tol.stage ? 'pending_transfer' : 'reserved';
        } else if (SNC.AssetMgmtUtil.isPluginRegistered('com.snc.field_service_management') &&
            !tol.return_from_tol.nil() &&
            !tol.return_from_tol.transfer_order.service_order.nil()) {
            availableStatus = 'received' == tol.return_from_tol.stage ? 'pending_transfer' : 'reserved';
        }
        if (tol.transfer_order.drop_off == true) {
            availableStatus = 'defective';
        }

        return availableStatus;
    },

    doesCiExist: function(sysId) {
        if (gs.nil(sysId)) {
            return false;
        }
        var gr = new GlideRecord('cmdb_ci');
        gr.addQuery('sys_id', sysId);
        gr.query();
        return gr.hasNext();
    },

    getFirstItem: function(model, stockroom, status, substatus) {
        var gr = new GlideRecord('alm_asset');
        global.AssetUtils.addAssetQuery(gr, global.AssetUtils.ASSET_FUNCTION_FEATURE.SOURCING);
        gr.addQuery('model', model.sys_id);
        gr.addQuery('install_status', status);
        gr.addQuery('substatus', substatus);
        gr.addQuery('stockroom', stockroom);
        gr.setLimit(1);
        gr.query();
        if (gr.next()) {
            return gr.sys_id;
        }
        throw gs.getMessage('{0} asset in State - {1} and Subsate - {2} not found',
            [model.display_name, status, substatus]);
    },

    getItemCount: function(model, status, substatus) {
        var gr = new GlideRecord('alm_asset');
        gr.addQuery('model', model.sys_id);
        gr.addQuery('install_status', status);
        gr.addQuery('substatus', substatus);
        gr.query();
        return gr.getRowCount();
    },

    getStockRooms: function(model) {
        var stock = [];
        var gr = new GlideAggregate('alm_asset');
        gr.addQuery('model', model);
        gr.addQuery('install_status', '6');
        gr.addQuery('substatus', 'available');
        gr.groupBy('stockroom');
        gr.query();
        while (gr.next()) {
            stock.push(gr.stockroom.toString());
        }
        return stock;
    },

    getVendors: function(model) {
        var vendors = [];
        var checkRepeat = [];
        var field = '';
        var price = 0;
        var stock = ' ';
        var currency = '';
        var found = false;
        var gr = new GlideRecord('pc_vendor_cat_item');
        gr.addQuery('model', model);
        gr.addQuery('active', true);
        gr.addQuery('vendor.vendor', true);
        gr.addNotNullQuery('vendor');
        gr.orderBy('vendor.name');
        gr.query();
        if (gr.getRowCount() != 0) {
            while (gr.next()) {
                field = gr.vendor.name.toString();
                price = gr.price.getCurrencyDisplayValue();
                stock = gr.out_of_stock.toString();
                checkRepeat.push(field + ' (' + price + ')');
                vendors += '^' + field + ' (' + price + ')^' + stock + '^pc_vendor_cat_item|' + gr.sys_id;
            }
        }
        gr = new GlideRecord('sc_cat_item');
        gr.addQuery('model', model);
        gr.addQuery('active', true);
        gr.addNotNullQuery('vendor');
        gr.addQuery('vendor.vendor', true);
        gr.orderBy('vendor.name');
        gr.query();
        if (gr.getRowCount() != 0) {
            while (gr.next()) {
                field = gr.vendor.name.toString();
                price = gr.price.getCurrencyDisplayValue();
                found = false;
                // preventing duplicates
                for (var i = 0; i < checkRepeat.length; i++)
                    if (checkRepeat[i] == field + ' (' + price + ')')
                        found = true;
                if (!found)
                    vendors += '^' + field + ' (' + price + ')^' + 'N/A' + '^sc_cat_item|' + gr.sys_id;
            }
        }
        // DEF0253862 - Sanitizing the names of vendors
        return SNC.GlideHTMLSanitizer.sanitize(vendors);
    },

    getAvailableQuantity: function(modelSid, stockroomSid) {
        var gr = new GlideAggregate('alm_asset');
        var counter = 0;
        global.AssetUtils.addAssetQuery(gr, global.AssetUtils.ASSET_FUNCTION_FEATURE.SOURCING);
        gr.addQuery('model', modelSid);
        gr.addQuery('install_status', '6');
        gr.addQuery('substatus', 'available');
        gr.addQuery('stockroom', stockroomSid);
        gr.addAggregate('SUM', 'quantity');
        gr.groupBy('stockroom');
        gr.query();
        if (gr.next())
            counter = gr.getAggregate('SUM', 'quantity');
        return counter;
    },

    getAssetOrConsumable: function(model) {
        var assetClass;
        new global.GlideQuery('cmdb_model_category')
            .where('sys_id', 'IN', model.cmdb_model_category.split(','))
            .select('asset_class')
            .forEach(function(gr) {
                if (gr.asset_class == 'alm_consumable') {
                    assetClass = gr.asset_class;
                }
            });
        if (model.sys_class_name == 'cmdb_consumable_product_model' || model.asset_tracking_strategy == 'track_as_consumable' || assetClass == 'alm_consumable')
            return 'consumable';
        else if (model.sys_class_name == 'cmdb_software_product_model')
            return 'software';
        else if (AssetUtils.IS_HAMP_ACTIVE && model.sys_class_name == AssetManagementConstants.MODEL_CLASSES.PRODUCT_MODEL && model.bundle_assets == true && model.bundle == true)
            return 'bundle';
        else
            return 'asset';
    },

    canConsume: function(asset) {
        if (SNC.AssetMgmtUtil.isPluginRegistered('com.snc.work_management')) {
            var record = new GlideRecord('sm_asset_usage');
            record.addQuery('asset', asset.sys_id);
            record.query();
            return !record.hasNext() && asset.install_status == '6' && (asset.substatus == 'available' || asset.substatus == 'reserved') && asset.quantity > 0;
        } else {
            var status = true;

            if (GlidePluginManager.isActive('com.sn_eam') && sn_eam.EAMUtils.canConsume) {
                var response = sn_eam.EAMUtils.canConsume(asset);

                if (!response.continueProcessing) {
                    return response.answer;
                }

                status = response.answer;
            }
            if (GlidePluginManager.isActive('com.sn_hamp') && sn_hamp.HAMUtils.canConsume) {
                response = sn_hamp.HAMUtils.canConsume(asset);

                if (!response.continueProcessing) {
                    return response.answer;
                }

                status = response.answer;
            }

            return status && (asset.install_status == '6' && (asset.substatus == 'available' || asset.substatus == 'reserved') && asset.quantity > 0);
        }
    },

    mergeLicenses: function(licenseId, type) {
        var mergeableLicensesResponse = this._getMergeLicensesData(licenseId);
        if (typeof mergeableLicensesResponse === 'string')
            return false;

        var almLicenseGr = mergeableLicensesResponse.almLicenseGr;
        var mergeCost = mergeableLicensesResponse.mergeCost;
        var mergeRights = mergeableLicensesResponse.mergeRights;
        var mergedLicenseId = mergeableLicensesResponse.mergedLicenseId;
        var mergingLicenses = mergeableLicensesResponse.mergingLicenses;

        if (type === 'check') {
            return mergingLicenses !== '';
        }

        //Create or update merged license
        if (mergedLicenseId !== '') {
            almLicenseGr.get(mergedLicenseId);
            almLicenseGr.cost = almLicenseGr.cost.getReferenceCurrencyCode() + ';' + mergeCost;
            almLicenseGr.rights = mergeRights;
            almLicenseGr.update();
        } else {
            almLicenseGr.is_merged_license = true;
            almLicenseGr.cost = almLicenseGr.cost.getReferenceCurrencyCode() + ';' + mergeCost;
            almLicenseGr.rights = mergeRights;
            almLicenseGr.asset_tag = '';
            mergedLicenseId = almLicenseGr.insert();
            //Add upgrade downgrades and assets covered
            var updownsgr = new GlideRecord('cmdb_m2m_downgrade_model');
            updownsgr.addQuery('license', licenseId);
            updownsgr.query();
            while (updownsgr.next()) {
                updownsgr.setValue('license', mergedLicenseId);
                updownsgr.insert();
            }
            var assetsgr = new GlideRecord('clm_m2m_contract_asset');
            assetsgr.addQuery('asset', licenseId);
            assetsgr.query();
            while (assetsgr.next()) {
                assetsgr.setValue('asset', mergedLicenseId);
                assetsgr.insert();
            }
        }
        var transfer = new GlideRecord('alm_license');
        transfer.addQuery('sys_id', 'IN', mergingLicenses);
        transfer.setValue('merged_into', mergedLicenseId);
        transfer.setValue('install_status', 7);
        transfer.updateMultiple();

        transfer = new GlideRecord('alm_entitlement');
        transfer.addQuery('licensed_by', 'IN', mergingLicenses);
        transfer.setValue('licensed_by', mergedLicenseId);
        transfer.updateMultiple();

        transfer = new GlideRecord('fm_expense_line');
        transfer.addQuery('asset', 'IN', mergingLicenses);
        transfer.setValue('asset', mergedLicenseId);
        transfer.setValue('source_id', mergedLicenseId);
        transfer.updateMultiple();

        transfer = new GlideRecord('clm_m2m_rate_card_asset');
        if (transfer.isValid()) {
            transfer.addQuery('asset', 'IN', mergingLicenses);
            transfer.setValue('asset', mergedLicenseId);
            transfer.updateMultiple();
        }

        //Return merged record id
        return 'id' + mergedLicenseId;
    },

    _getMergeLicensesData: function(licenseId) {
        var almLicenseGr = new GlideRecord('alm_license');
        almLicenseGr.get(licenseId);

        //Get all matching licenses that have not been merged already
        var mergeableAlmLicenseGr = new GlideRecord('alm_license');
        mergeableAlmLicenseGr.addQuery('model', almLicenseGr.model);
        mergeableAlmLicenseGr.addQuery('entitlement_condition', almLicenseGr.entitlement_condition);
        mergeableAlmLicenseGr.addQuery('assigned_condition', almLicenseGr.assigned_condition);
        mergeableAlmLicenseGr.addQuery('company', almLicenseGr.company);
        mergeableAlmLicenseGr.addQuery('location', almLicenseGr.location);
        mergeableAlmLicenseGr.addQuery('department', almLicenseGr.department);
        mergeableAlmLicenseGr.addQuery('cost_center', almLicenseGr.cost_center);
        mergeableAlmLicenseGr.addQuery('state', almLicenseGr.state);
        mergeableAlmLicenseGr.addQuery('merged_into', '');
        mergeableAlmLicenseGr.orderBy('sys_id');
        //Join queries for upgrade/downgrade and assets covered matching
        var downgradeModelGr = new GlideRecord('cmdb_m2m_downgrade_model');
        downgradeModelGr.addQuery('license', almLicenseGr.getUniqueValue());
        downgradeModelGr.query();
        var numUpDowns = downgradeModelGr.getRowCount();

        var downgradeModels = [];
        while (downgradeModelGr.next()) {
            downgradeModels.push({
                downgrade_child: downgradeModelGr.getValue('downgrade_child'),
                upgrade_parent: downgradeModelGr.getValue('upgrade_parent'),
                start_date: downgradeModelGr.getValue('start_date'),
                end_date: downgradeModelGr.getValue('end_date'),
            });
        }

        var contractAssetRelatedToAlmLicenseGr = new GlideRecord('clm_m2m_contract_asset');
        contractAssetRelatedToAlmLicenseGr.addQuery('asset', almLicenseGr.getUniqueValue());
        contractAssetRelatedToAlmLicenseGr.query();
        var numAssetsCovered = contractAssetRelatedToAlmLicenseGr.getRowCount();

        var contractAssets = [];
        while (contractAssetRelatedToAlmLicenseGr.next()) {
            contractAssets.push({
                contract: contractAssetRelatedToAlmLicenseGr.getValue('contract'),
                added: contractAssetRelatedToAlmLicenseGr.getValue('added'),
                removed: contractAssetRelatedToAlmLicenseGr.getValue('removed'),
            });
        }

        var licenseIdsToMerge = [];
        mergeableAlmLicenseGr.query();
        while (mergeableAlmLicenseGr.next()) {
            var downgradeModelsMatch = this._downgradeModelsMatch(downgradeModels, mergeableAlmLicenseGr);
            var contractAssetsMatch = this._contractAssetsMatch(contractAssets, mergeableAlmLicenseGr);
            if (downgradeModelsMatch && contractAssetsMatch) {
                licenseIdsToMerge.push(mergeableAlmLicenseGr.getUniqueValue());
            }
        }

        if (licenseIdsToMerge.length <= 1)
            return 'There are no eligible licenses to merge.';

        var mergeCost = 0;
        var mergeRights = 0;
        var mergedLicenseId = '';
        var mergingLicenses = '';

        var updowns = new GlideAggregate('cmdb_m2m_downgrade_model');
        updowns.addQuery('license.model', almLicenseGr.model);
        updowns.addQuery('license.entitlement_condition', almLicenseGr.entitlement_condition);
        updowns.addQuery('license.assigned_condition', almLicenseGr.assigned_condition);
        updowns.addQuery('license.company', almLicenseGr.company);
        updowns.addQuery('license.location', almLicenseGr.location);
        updowns.addQuery('license.department', almLicenseGr.department);
        updowns.addQuery('license.cost_center', almLicenseGr.cost_center);
        updowns.addQuery('license.state', almLicenseGr.state);
        updowns.addQuery('license.merged_into', '');
        updowns.orderBy('license.sys_id');
        updowns.groupBy('license');
        updowns.addAggregate('COUNT');
        updowns.query();
        updowns.next();

        var assets = new GlideAggregate('clm_m2m_contract_asset');
        assets.addQuery('asset.model', almLicenseGr.model);
        assets.addQuery('asset.entitlement_condition', almLicenseGr.entitlement_condition);
        assets.addQuery('asset.assigned_condition', almLicenseGr.assigned_condition);
        assets.addQuery('asset.company', almLicenseGr.company);
        assets.addQuery('asset.location', almLicenseGr.location);
        assets.addQuery('asset.department', almLicenseGr.department);
        assets.addQuery('asset.cost_center', almLicenseGr.cost_center);
        assets.addQuery('asset.state', almLicenseGr.state);
        assets.addQuery('asset.merged_into', '');
        assets.orderBy('asset.sys_id');
        assets.groupBy('asset');
        assets.addAggregate('COUNT');
        assets.query();
        assets.next();

        mergeableAlmLicenseGr = new GlideRecord('alm_license');
        mergeableAlmLicenseGr.addQuery('sys_id', 'IN', licenseIdsToMerge.toString());
        mergeableAlmLicenseGr.query();
        while (mergeableAlmLicenseGr.next()) {
            //Continue if count do not match
            while (updowns.license < mergeableAlmLicenseGr.sys_id && updowns.hasNext())
                updowns.next();
            if (updowns.license != mergeableAlmLicenseGr.sys_id) {
                if (numUpDowns != 0)
                    continue;
            } else if (updowns.getAggregate('COUNT') != numUpDowns)
                continue;
            while (assets.asset < mergeableAlmLicenseGr.sys_id && assets.hasNext())
                assets.next();
            if (assets.asset != mergeableAlmLicenseGr.sys_id) {
                if (numAssetsCovered != 0)
                    continue;
            } else if (assets.getAggregate('COUNT') != numAssetsCovered)
                continue;

            mergeCost += parseFloat(mergeableAlmLicenseGr.cost.getReferenceValue());
            mergeRights += mergeableAlmLicenseGr.rights;
            if (mergeableAlmLicenseGr.is_merged_license && mergedLicenseId == '')
                mergedLicenseId = mergeableAlmLicenseGr.sys_id + '';
            else {
                if (mergingLicenses != '')
                    mergingLicenses += ',';
                mergingLicenses += mergeableAlmLicenseGr.sys_id;
            }
        }

        return {
            almLicenseGr: almLicenseGr,
            mergeCost: mergeCost,
            mergeRights: mergeRights,
            mergedLicenseId: mergedLicenseId,
            mergingLicenses: mergingLicenses,
        };
    },

    _downgradeModelsMatch: function(downgradeModelsToCompare, mergeableAlmLicenseGr) {
        var downgradeModelGr = new GlideRecord('cmdb_m2m_downgrade_model');
        downgradeModelGr.addQuery('license', mergeableAlmLicenseGr.getUniqueValue());
        downgradeModelGr.query();

        var downgradeModels = [];
        while (downgradeModelGr.next()) {
            downgradeModels.push({
                downgrade_child: downgradeModelGr.getValue('downgrade_child'),
                upgrade_parent: downgradeModelGr.getValue('upgrade_parent'),
                start_date: downgradeModelGr.getValue('start_date'),
                end_date: downgradeModelGr.getValue('end_date'),
            });
        }

        if (downgradeModelsToCompare.length !== downgradeModels.length)
            return false;

        return downgradeModels.every(function(downgradeModel) {
            return downgradeModelsToCompare.some(function(downgradeModelToCompareTo) {
                return downgradeModelToCompareTo.downgrade_child === downgradeModel.downgrade_child &&
                    downgradeModelToCompareTo.upgrade_parent === downgradeModel.upgrade_parent &&
                    downgradeModelToCompareTo.start_date === downgradeModel.start_date &&
                    downgradeModelToCompareTo.end_date === downgradeModel.end_date;
            });
        });
    },

    _contractAssetsMatch: function(contractAssetsToCompare, mergeableAlmLicensesGr) {
        var contractAssetGr = new GlideRecord('clm_m2m_contract_asset');
        contractAssetGr.addQuery('asset', mergeableAlmLicensesGr.getUniqueValue());
        contractAssetGr.query();
        var contractAssets = [];
        while (contractAssetGr.next()) {
            contractAssets.push({
                contract: contractAssetGr.getValue('contract'),
                added: contractAssetGr.getValue('added'),
                removed: contractAssetGr.getValue('removed'),
            });
        }
        if (contractAssetsToCompare.length !== contractAssets.length)
            return false;

        return contractAssets.every(function(contractAsset) {
            return contractAssetsToCompare.some(function(contractAssetToCompareTo) {
                return contractAssetToCompareTo.contract === contractAsset.contract &&
                    contractAssetToCompareTo.added === contractAsset.added &&
                    contractAssetToCompareTo.removed === contractAsset.removed;
            });
        });
    },

    calculateDisplayName: function(asset) {
        var display_name = "";
        if (asset.asset_tag)
            display_name += asset.asset_tag + " - ";
        if (asset.model)
            display_name += asset.model.display_name;

        if (asset.display_name == display_name)
            return false;

        asset.display_name = display_name.trim();
        return true;
    },

    /* Very given CI satisfy the license's assigned condition or not */
    verifyDeviceEntitlement: function(license, ci) {
        var licenseGR = new GlideRecord('alm_license');
        licenseGR.get(license);
        var gr = new GlideRecord('cmdb_ci');
        gr.addEncodedQuery(licenseGR.entitlement_condition);
        gr.addQuery('sys_id', ci);
        gr.query();
        var queryRows = gr.getRowCount();
        if (queryRows != 1) {
            return false;
        }
        return true;
    },

    /* Very given user satisfy the license's assigned condition or not */
    verifyUserEntitlement: function(license, user) {
        var licenseGR = new GlideRecord('alm_license');
        licenseGR.get(license);
        var gr = new GlideRecord('sys_user');
        gr.addEncodedQuery(licenseGR.assigned_condition);
        gr.addQuery('sys_id', user);
        gr.query();
        var queryRows = gr.getRowCount();
        if (queryRows != 1) {
            return false;
        }
        return true;
    },

    hasVendors: function(model) {
        var hasVendor = false;
        var gr = new GlideRecord('pc_vendor_cat_item');
        gr.addQuery('model', model);
        gr.addQuery('active', true);
        gr.addNotNullQuery('vendor');
        gr.addQuery('vendor.vendor', true);
        gr.setLimit(1);
        gr.query();
        if (gr.getRowCount() != 0) {
            hasVendor = true;
        }
        if (!hasVendor) {
            gr = new GlideRecord('sc_cat_item');
            gr.addQuery('model', model);
            gr.addQuery('active', true);
            gr.addNotNullQuery('vendor');
            gr.addQuery('vendor.vendor', true);
            gr.setLimit(1);
            gr.query();
            if (gr.getRowCount() != 0) {
                hasVendor = true;
            }
        }

        return hasVendor;
    },

    isJobRunning: function(jobSysId) {
        var sysTriggerGr = new GlideRecord('sys_trigger');
        sysTriggerGr.addQuery('job_context', 'CONTAINS', jobSysId);
        sysTriggerGr.addQuery('state', '1');
        sysTriggerGr.setLimit(2);
        sysTriggerGr.query();
        if (sysTriggerGr.getRowCount() >= 2) {
            return true;
        }
        return false;
    },

    allowListEditOfStatusandSubStatus: function(gr) {
        var isHampActive = GlidePluginManager.isActive('com.sn_hamp') || GlidePluginManager.isActive('sn_hamp');
        var isEamActive = GlidePluginManager.isActive('com.sn_eam') || GlidePluginManager.isActive('sn_eam');
        if (isEamActive && this.isEamEditRestricted(gr)) {
            return false;
        }
        if (isHampActive && this.isHampEditRestricted(gr)) {
            return false;
        }
        return true;
    },

    isHampEditRestricted: function(gr) {
        // Restrict editing when state is retired and substate is disposed and disposal order number is filled
        return (!gr.disposal_order_number.nil() &&
            gr.getValue('install_status') === '7' &&
            gr.getValue('substatus') === 'disposed');
    },

    isEamEditRestricted: function(gr) {
        // Restrict editing when asset is part of active rma order or disposal order
        return ((gr.getValue('sn_itam_common_process_table') === 'sn_eam_rma_order_line' ||
                gr.getValue('sn_itam_common_process_table') === 'sn_eam_disposal_order') &&
            !gs.nil(gr.sn_itam_common_process_id));
    },

    type: 'AssetUtils'
};
AssetUtils.ASSET_PROPERTY = 'asset_property';
AssetUtils.DEFAULT_IRE_FIELDS = ['mac_addr', 'serial_number', 'asset_tag'];
AssetUtils.ASSET_IRE_PROPERTY = AssetCMDBUtil.ASSET_IRE_PROPERTY;
AssetUtils.IS_IRE_ENABLED = gs.getProperty(AssetUtils.ASSET_IRE_PROPERTY) === 'true';
AssetUtils.IS_HAMP_ACTIVE = GlidePluginManager.isActive('com.sn_hamp');
AssetUtils.IS_SAMP_ACTIVE = GlidePluginManager.isActive('com.snc.samp');
AssetUtils.IS_EAM_ACTIVE = GlidePluginManager.isActive('com.sn_eam') || GlidePluginManager.isActive('sn_eam');
AssetUtils.IS_ITAM_COMMON_ACTIVE = GlidePluginManager.isActive('com.sn_itam_common');

AssetUtils.getAssetProperty = function(property, defaultValue) {
    var propertyValue;
    var assetProperty = new GlideRecord(AssetUtils.ASSET_PROPERTY);
    if (assetProperty.get('key', property)) {
        propertyValue = assetProperty.getValue('value');
    }
    return gs.nil(propertyValue) ? (gs.nil(defaultValue) ? '' : defaultValue) : propertyValue;
};

AssetUtils.addAssetQuery = function(gr, feature) {
    if ((global.AssetUtils.IS_EAM_ACTIVE || global.AssetUtils.IS_HAMP_ACTIVE) && sn_itam_common.ITAMCommonUtil.addAssetFunctionQuery) {
        sn_itam_common.ITAMCommonUtil.addAssetFunctionQuery(gr, feature);
    }
};

AssetUtils.addHAMPAssetQuery = function(gr, feature) {
    if (global.AssetUtils.IS_HAMP_ACTIVE && sn_hamp.HAMUtils.addAssetFunctionQuery) {
        sn_hamp.HAMUtils.addAssetFunctionQuery(gr, feature);
    }
};

AssetUtils.isFlowPresent = function(flowName) {
    var gr = new GlideRecord('sys_hub_flow');
    if (gr.get('internal_name', flowName)) {
        return true;
    }
    return false;
};

AssetUtils.isAssetLoanerInTOL = function(tol) {
    if (((global.AssetUtils.IS_EAM_ACTIVE &&
                sn_eam.EAMConstants.ASSET_FUNCTION && sn_eam.EAMConstants.ASSET_FUNCTION.LOANER &&
                String(tol.asset.asset_function) === sn_eam.EAMConstants.ASSET_FUNCTION.LOANER &&
                sn_eam.EAMUtils.isEnterpriseClassAsset(tol.asset)) ||
            (global.AssetUtils.IS_HAMP_ACTIVE &&
                sn_hamp.HAMConstants.ASSET_FUNCTION && sn_hamp.HAMConstants.ASSET_FUNCTION.LOANER &&
                String(tol.asset.asset_function) === sn_hamp.HAMConstants.ASSET_FUNCTION.LOANER)) &&
        String(tol.asset.sys_class_name) !== 'alm_consumable' &&
        String(tol.asset.sys_class_name) !== 'alm_license') {
        return true;
    }
    return false;
};

AssetUtils.shouldUpdateDepreciationValues = function(assetClass) {
    var excludedClasses = ['alm_consumable', 'alm_license'];
    if (global.AssetUtils.IS_HAMP_ACTIVE && sn_hamp.HAMUtils.getDepreciationExcClasses) {
        excludedClasses = excludedClasses.concat(sn_hamp.HAMUtils.getDepreciationExcClasses());
    }
    if (excludedClasses.indexOf(assetClass) !== -1) {
        return false;
    }
    var tableName = assetClass;
    var gr = new GlideRecord(tableName);
    if (gr.isValid()) {
        return excludedClasses.every(function(className) {
            if (gr.instanceOf(className)) {
                return false;
            }
            return true;
        });
    }
    return false;
};
AssetUtils.MODEL_CATEGORY_TABLE = 'cmdb_model_category';
AssetUtils.MOBILE_DEVICE_CATEGORY_SYSID = '0be11f58c7432010f74c784c95c260b7';
AssetUtils.COMM_HARDWARE_CATEGORY_SYSID = '8c4cfdfb77b1a110da1f99f69c5a99d3';
AssetUtils.COMM_HARDWARE_CI_CLASS = 'cmdb_ci_comm_hardware';
AssetUtils.HANDHELD_COMPUTING_CI_CLASS = 'cmdb_ci_handheld_computing';
AssetUtils.updateMobileDeviceMC = function() {
    AssetUtils.updateCommunicationHardwareMC();
    // Assign CI class to Mobile Device if CMDB CI Class is active and if there is no existing MC with Handheld Computing
    if (GlidePluginManager().isActive('com.sn_cmdb_ci_class')) {
        // If Mobile Device has CI class, return
        var catGr = new GlideRecord(AssetUtils.MODEL_CATEGORY_TABLE);
        catGr.get(AssetUtils.MOBILE_DEVICE_CATEGORY_SYSID);
        if (!gs.nil(catGr.cmdb_ci_class)) {
            gs.info('Fix script: CI Class is already added to Mobile Device Model Category');
            return;
        }
        catGr.initialize();
        catGr.addQuery('cmdb_ci_class', AssetUtils.HANDHELD_COMPUTING_CI_CLASS);
        catGr.query();
        if (catGr.hasNext()) {
            gs.info('Fix script: Not adding CI Class to Mobile Device as Model category with' +
                'Handheld Computing CI Class already exists');
            return;
        }
        catGr.initialize();
        if (catGr.get(AssetUtils.MOBILE_DEVICE_CATEGORY_SYSID)) {
            catGr.setValue('cmdb_ci_class', AssetUtils.HANDHELD_COMPUTING_CI_CLASS);
            global.ModelUtils.updateDisableBR(catGr);
            gs.info('Fix script: Added Handheld Computing CI class to Mobile Device Model category');
        }
    }
};

AssetUtils.updateCommunicationHardwareMC = function() {
    // Assign CI class to Communication Hardware if CMDB CI Class is active and if there is no existing MC with Comm HW
    if (GlidePluginManager().isActive('com.sn_cmdb_ci_class')) {

        // If Mobile Device has CI class, return
        var catGr = new GlideRecord(AssetUtils.MODEL_CATEGORY_TABLE);
        catGr.get(AssetUtils.COMM_HARDWARE_CATEGORY_SYSID);
        if (!gs.nil(catGr.cmdb_ci_class)) {
            gs.info('Fix script: CI Class is already added to Communication Hardware Model Category');
            return;
        }
        // Clear CI class of Mobile Device MC
        catGr.initialize();
        catGr.addQuery('sys_id', AssetUtils.MOBILE_DEVICE_CATEGORY_SYSID);
        catGr.addQuery('cmdb_ci_class', AssetUtils.COMM_HARDWARE_CI_CLASS);
        catGr.query();
        if (catGr.next()) {
            catGr.setValue('cmdb_ci_class', '');
            global.ModelUtils.updateDisableBR(catGr);
            gs.info('Fix script: Communication Hardware CI Class is cleared for Mobile Device Model Category');
        }
        catGr.initialize();
        catGr.addQuery('cmdb_ci_class', AssetUtils.COMM_HARDWARE_CI_CLASS);
        catGr.query();
        if (catGr.hasNext()) {
            gs.info('Fix script: Not adding CI Class to Communication Hardware as Model category with' +
                'Communication Hardware CI Class already exists');
            return;
        }
        catGr.initialize();
        if (catGr.get(AssetUtils.COMM_HARDWARE_CATEGORY_SYSID)) {
            catGr.setValue('cmdb_ci_class', AssetUtils.COMM_HARDWARE_CI_CLASS);
            global.ModelUtils.updateDisableBR(catGr);
            gs.info('Fix script: Added Communication Hardware CI class to Communication Hardware Model category');
        }
    }
};

AssetUtils.isPlaybookInReview = function(current) {
    if (GlidePluginManager.isActive('com.sn_sam_playbook') && !gs.nil(current.playbook_entitlement_setup) && current.playbook_entitlement_setup.playbook_state.toString() === 'review') {
        return true;
    }
    return false;
};

AssetUtils.validateMandatoryDetails = function(taskRec) {
    // validate mandatory details
    if (AssetUtils.IS_EAM_ACTIVE) {
        var output = sn_eam.EAMUtils.validateMandatoryDetails(taskRec);
        if (output.isProcessed) {
            return output.returnValue;
        }
    }
    if (AssetUtils.IS_HAMP_ACTIVE) {
        output = sn_hamp.HAMUtils.validateMandatoryDetails(taskRec);
        if (output.isProcessed) {
            return output.returnValue;
        }
    }

    if (AssetUtils.IS_ITAM_COMMON_ACTIVE) {
        output = sn_itam_common.ITAMCommonUtil.validateMandatoryDetails(taskRec);
        if (output.isProcessed) {
            return output.returnValue;
        }
    }

    var task = taskRec.getValue('sys_class_name');
    switch (task) {
        case 'consume_asset_task':
            return global.ProcurementUtils.validateFieldsForConsumeAsset(taskRec);
        default:
            return taskRec;
    }
};

AssetUtils.canCloseTask = function(taskRec) {
    if (AssetUtils.IS_EAM_ACTIVE) {
        var output = sn_eam.EAMUtils.canCloseTask(taskRec);
        if (output.isProcessed) {
            return output.returnValue;
        }
    }
    if (AssetUtils.IS_HAMP_ACTIVE) {
        output = sn_hamp.HAMUtils.canCloseTask(taskRec);
        if (output.isProcessed) {
            return output.returnValue;
        }
    }

    if (AssetUtils.IS_ITAM_COMMON_ACTIVE) {
        output = sn_itam_common.ITAMCommonUtil.canCloseTask(taskRec);
        if (output.isProcessed) {
            return output.returnValue;
        }
    }
    var task = taskRec.getValue('sys_class_name');
    switch (task) {
        case 'consume_asset_task':
            return global.ProcurementUtils.canCloseConsumeTask(taskRec);
        default:
            // close task button will be not visible by default
            return false;
    }
};
AssetUtils.convertUTCtoTimezone = function(utcTime, timeZone) {
    if (!gs.nil(timeZone)) {
        var gr = new GlideScheduleDateTime(utcTime);
        var currentTime = gr.convertTimeZone('UTC', timeZone);
        return new GlideDateTime(currentTime);
    }
    return utcTime;
};
/* returns date in yyyy-MM-dd format and current user's timezone */
AssetUtils.getInternalDate = function(userDate, userDateFormat) {
    var gdt = new GlideDateTime();
    gdt.setDisplayValue(userDate, userDateFormat);
    return gdt.getLocalDate();

};
AssetUtils.isParentPallet = function(parentSysId) {
    var parentGr = new GlideRecord('alm_asset');
    parentGr.get(parentSysId);
    if (parentGr.instanceOf('alm_pallet')) {
        return true;
    }
    return false;
};
AssetUtils.getClassFromName = function(className) {
    var parts = className.split('.');
    var classObj = global;
    for (var i = 0; i < parts.length; i++) {
        if (!gs.nil(classObj)) {
            classObj = classObj[parts[i]];
        }
    }
    return classObj;
};
AssetUtils.canUpdateCIStatus = function(ritmGr) {
    if (gs.getProperty("glide.itam_update_ci_status_from_ritm", "false") === "true") {
        return true;
    } else {
        return (!gs.nil(ritmGr.configuration_item.asset) &&
            !gs.nil(ritmGr.configuration_item.asset.request_line) &&
            ritmGr.configuration_item.asset.request_line.toString() === ritmGr.sys_id.toString());
    }
};

AssetUtils.canSyncAssetLegacyAndCSDM = function(assetGr) {
    return (new LifeCycleUtil().isLifeCycleMigrationActivated() || GlidePluginManager.isActive('com.snc.install_base'));
};

AssetUtils.getSourceOfAssetUpdate = function(assetGr) {
    var source = '';
    if (String(assetGr.skip_sync) === 'true')
        source = AssetUtils.ASSET_UPDATE_SOURCE.CI;
    else if (String(assetGr.skip_sync_to_ib) === 'true')
        source = AssetUtils.ASSET_UPDATE_SOURCE.IBI;
    return source;
};

AssetUtils.syncAssetLegacyAndCSDMOnPlugin = function(assetGr, callingTable, isLegacyUpdated, isLCUpdated) {
    var lcUtil = new global.LifeCycleUtil();
    var isBothUpdated = isLegacyUpdated && isLCUpdated;
    if (isBothUpdated) {
        var isLCActivated = lcUtil.isLifeCycleMigrationActivated();
        if (isLCActivated) {
            lcUtil.updateFromCSDM(callingTable, assetGr);
        } else {
            lcUtil.updateFromLegacy(callingTable, assetGr);
        }
    } else if (isLCUpdated) {
        lcUtil.updateFromCSDM(callingTable, assetGr);
    } else if (isLegacyUpdated) {
        lcUtil.updateFromLegacy(callingTable, assetGr);
    }
};

AssetUtils.getSubModels = function(model) {
    var subModels = [];

    var subs = new GlideRecord('cmdb_m2m_model_substitute');
    subs.addQuery('model', model);
    subs.query();

    while (subs.next()) {
        subModels.push(subs.getValue('substitute'));
    }

    // Allow swapped in asset of substitute model to be swapped back with asset of original model
    var modelsGr = new GlideRecord('cmdb_m2m_model_substitute');
    modelsGr.addQuery('substitute', model);
    modelsGr.query();

    while (modelsGr.next()) {
        subModels.push(modelsGr.getValue('model'));
    }
    return subModels;
};

AssetUtils.getAssetChildren = function(parent) {
    var grAsset = new GlideRecord(global.AssetManagementConstants.ASSET_CLASSES.ASSET);
    grAsset.addQuery('parent', parent);
    grAsset.query();
    return grAsset;
};

AssetUtils.showUIActionOverAsset = function(asset) {
    // Hide the UI action over license if SAMS is active
    return asset.sys_class_name.toString() !== global.AssetManagementConstants.ASSET_CLASSES.SOFTWARE_ENTITLEMENT || !GlidePluginManager.isActive('com.snc.sams');
};

/* Returns true if serial number is mandatory or product instance is enabled over model category. Currently used for allocate UI action */
AssetUtils.isSerialNumberMandatory = function(modelCategory) {
    return (new AssetCMDBUtil()).isSerialNumberMandatory(modelCategory) || global.ProductInstanceUtil.isProductInstance(modelCategory);
};

// Regex to validate sys_id
AssetUtils.isValidSysID = function(id) {
    return !gs.nil(id) && /^[\dA-F]{32}$/i.test(id);
};

// If EAM is active and the asset is an enterprise asset, serial_number is mandatory when IRE is off
AssetUtils.getMandatoryAttributes = function(modelCategory) {
    var modelCategoryGr = new GlideRecord(AssetUtils.MODEL_CATEGORY_TABLE);
    if (!modelCategoryGr.get(modelCategory)) {
        return [];
    }
    var assetClass = modelCategoryGr.getValue("asset_class");
    var mandatoryfields = AssetUtils.IS_IRE_ENABLED ? new AssetCMDBUtil().getMandatoryFieldCheck(modelCategory) : [];

    if (mandatoryfields.length === 0 && AssetUtils.IS_EAM_ACTIVE && sn_ent.EnterpriseContentEAMUtils.isEnterpriseClassAsset(assetClass)) {
        mandatoryfields = ["serial_number"];
    }

    if (mandatoryfields.length === 0) {
        return mandatoryfields;
    }

    var gr = new GlideRecord(assetClass);
    return mandatoryfields.filter(function(field) {
        return gr.isValidField(field);
    });
};

/**
 * Returns the IRE mandatory identity fields for the given model record.
 *
 * used by mobile create-asset flows to enforce identity fields before write-back.
 *
 * Resolves the model's category and delegates to AssetUtils.getMandatoryAttributes, which is
 * the single source of truth for IRE/enterprise/EAM mandatory-field determination. Consumable
 * models are never mandatory-field checked.
 *
 * @param {String} modelId - Sys_id of the cmdb_model record used for the asset.
 * @returns {Array<String>} List of mandatory identity fields for the asset.
 */
AssetUtils.getIREMandatoryFieldsForModel = function(modelId) {
    var mandatoryFields = [];

    var modelGr = new GlideRecord(AssetManagementConstants.MODEL_CLASSES.PRODUCT_MODEL);
    if (!gs.nil(modelId) && modelGr.get(modelId) && !gs.nil(modelGr.cmdb_model_category) &&
        !modelGr.instanceOf('cmdb_consumable_product_model') &&
        modelGr.getValue('asset_tracking_strategy') !== 'track_as_consumable') {
        var categories = modelGr.getValue('cmdb_model_category') || '';
        var modelCategoryId = categories.split(',')[0];
        mandatoryFields = AssetUtils.getMandatoryAttributes(modelCategoryId);
    }

    return AssetUtils.removeInvalidFields(mandatoryFields);
};

AssetUtils.isMacAddressColumnValid = function() {
	var assetGr = new GlideRecord('alm_asset');
	assetGr.initialize();
	return assetGr.isValidField('mac_addr');
}

AssetUtils.removeInvalidFields = function(mandatoryFields){
	var fields = [];

	var assetGr = new GlideRecord('alm_asset');
	assetGr.initialize();

	mandatoryFields.forEach((field) => {
		if (assetGr.isValidField(field)) fields.push(field);
	});

	return fields;
};

/**
 * Validates MAC address format for mobile asset flows.
 *
 * Accepts:
 * - Standard 48-bit MAC formats (colon, hyphen, dotted, or plain hex).
 * - EUI-64 (64-bit) MAC formats with embedded FF:FE variants.
 *
 * Empty / nil MAC values are treated as valid so that the field remains optional
 * and separate mandatory-field checks can enforce identity where required.
 *
 * @param {String} macAddress - MAC address value entered by the user.
 * @returns {Boolean} True when the MAC address matches a supported format or is empty.
 */
AssetUtils.isValidMacAddress = function(macAddress) {
    // Empty MAC addresses are considered valid (field is optional).
    if (gs.nil(macAddress)) {
        return true;
    }
    // 48-bit MAC formats (colon-separated, hyphen-separated, dotted, or contiguous hex)
    var mac48Pattern = /^(?:[0-9A-Fa-f]{2}[:]){5}[0-9A-Fa-f]{2}$|^(?:[0-9A-Fa-f]{2}[-]){5}[0-9A-Fa-f]{2}$|^(?:[0-9A-Fa-f]{4}\.){2}[0-9A-Fa-f]{4}$|^[0-9A-Fa-f]{12}$/;
    // 64-bit EUI-64 MAC formats with embedded FF:FE (or FF-FE / FF.FE)
    var mac64Pattern = /^(?:[0-9A-Fa-f]{2}[:]){2}(?:[0-9A-Fa-f]{2}[:])FF[:]FE[:](?:[0-9A-Fa-f]{2}[:]){2}[0-9A-Fa-f]{2}$|(?:[0-9A-Fa-f]{2}[-]){2}(?:[0-9A-Fa-f]{2}[-])FF[-]FE[-](?:[0-9A-Fa-f]{2}[-]){2}[0-9A-Fa-f]{2}$|^(?:[0-9A-Fa-f]{4}\.){3}[0-9A-Fa-f]{4}$|^[0-9A-Fa-f]{8}FFFE[0-9A-Fa-f]{4}$/;
    var macAddressPattern = new RegExp(mac48Pattern.source + "|" + mac64Pattern.source);
    return macAddressPattern.test(macAddress);
};

AssetUtils.hasMandatoryAttributes = function(modelCategory) {
    if (global.ProductInstanceUtil.isProductInstance(modelCategory)) {
        return true;
    } else {
        var mandatoryfields = AssetUtils.getMandatoryAttributes(modelCategory);
        return mandatoryfields.length > 0;
    }
};

/**
 * Check if asset is enterprise asset or has enterprise model
 */
AssetUtils.isEnterpriseAssetOrEnterpriseModel = function(assetGr) {

	if (gs.nil(assetGr)) {
        return false;
    }
    
    // Check if asset itself is an enterprise class
    if (sn_ent.EnterpriseContentEAMUtils.isEnterpriseClassAsset(assetGr.sys_class_name.toString())) {
        return true;
    }
    
    // Check if it has an enterprise model
    if (!gs.nil(assetGr.getValue('model')) && 
        sn_ent.EnterpriseContentEAMUtils.isEnterpriseModelClass(assetGr.model.sys_class_name.toString())) {
        return true;
    }
    
    return false;
};

/**
 * Get support group reference qualifier
 */
AssetUtils.getSupportGroupRefQual = function(assetGr) {
    // Check if EAM plugins are active
    if (!AssetUtils.IS_EAM_ACTIVE) {
        return '';
    }
    
    if (AssetUtils.isEnterpriseAssetOrEnterpriseModel(assetGr) && sn_eam.EAMUtils && sn_eam.EAMUtils.supportedGroupRefQual) {
        return sn_eam.EAMUtils.supportedGroupRefQual(assetGr);
    }
    return '';
};

/**
 * Get support reference qualifier
 */
AssetUtils.getSupportByRefQual = function(assetGr) {
    // Check if EAM plugins are active
    if (!AssetUtils.IS_EAM_ACTIVE) {
        return '';
    }
    
    if (AssetUtils.isEnterpriseAssetOrEnterpriseModel(assetGr) && sn_eam.EAMUtils && sn_eam.EAMUtils.supportedRefQual) {
        return sn_eam.EAMUtils.supportedRefQual(assetGr);
    }
    return '';
};

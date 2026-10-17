var Consumables = Class.create();
Consumables.prototype = {
    initialize: function() {},

    canMarkForDisposal: function(consumable) {
        var status = true;

        if (GlidePluginManager.isActive('com.sn_eam') && sn_eam.EAMUtils.canMarkForDisposal) {
            var response = sn_eam.EAMUtils.canMarkForDisposal(consumable);

            if (!response.continueProcessing) {
                return response.answer;
            }

            status = response.answer;
        }

        if (GlidePluginManager.isActive('com.sn_hamp') && sn_hamp.HAMUtils.canMarkForDisposal) {
            var response = sn_hamp.HAMUtils.canMarkForDisposal(consumable);

            if (!response.continueProcessing) {
                return response.answer;
            }

            status = response.answer;
        }

        return status && consumable.getValue('install_status') === '6' && (consumable.getValue('planned_for_disposal') === '0' || consumable.getValue('planned_for_disposal') === null);
    },

    canRetire: function(consumable) {
        var status = true;

        if (GlidePluginManager.isActive('com.sn_eam') && sn_eam.EAMUtils.canRetire) {
            var response = sn_eam.EAMUtils.canRetire(consumable);

            if (!response.continueProcessing) {
                return response.answer;
            }

            status = response.answer;
        }

        if (GlidePluginManager.isActive('com.sn_hamp') && sn_hamp.HAMUtils.canRetire) {
            var response = sn_hamp.HAMUtils.canRetire(consumable);

            if (!response.continueProcessing) {
                return response.answer;
            }

            status = response.answer;
        }

        return status && (consumable.getValue('install_status') === '10');
    },

	canSplit: function(consumable) {
		var status = true;
        if (GlidePluginManager.isActive('com.sn_eam') && sn_eam.EAMUtils.canSplit) {
            var response = sn_eam.EAMUtils.canSplit(consumable);
            if (!response.continueProcessing) { return response.answer; }
            status = response.answer;
        }
		if (GlidePluginManager.isActive('com.sn_hamp') && sn_hamp.HAMUtils.canSplit) {
			var response = sn_hamp.HAMUtils.canSplit(consumable);
			if (!response.continueProcessing) { return response.answer; }
			status = response.answer;
		} 
		
		var isConsumableInStock = (consumable.getValue('install_status') === '6');
		var isQuantityMoreThanOne = ((parseInt(consumable.getValue('quantity'), 10)) > 1);
		var isTransferOrderPresent = this.transferOrderCheck(consumable);
		return status && isConsumableInStock && isQuantityMoreThanOne && !isTransferOrderPresent && !consumable.planned_for_disposal && gs.nil(consumable.process_id);
	},
    
    transferOrderCheck: function(consumable){
		var gr = new GlideRecord('alm_transfer_order_line');
		gr.addQuery('asset',consumable.getUniqueValue());
		gr.addQuery('stage','NOT IN',['delivered','cancelled']);
		gr.query();
		return gr.hasNext();
	},

    canCancelFromDisposal: function(consumable) {
        var status = true;

        if (GlidePluginManager.isActive('com.sn_eam') && sn_eam.EAMUtils.canCancelFromDisposal) {
            var response = sn_eam.EAMUtils.canCancelFromDisposal(consumable);

            if (!response.continueProcessing) {
                return response.answer;
            }

            status = response.answer;
        }

        if (GlidePluginManager.isActive('com.sn_hamp') && sn_hamp.HAMUtils.canCancelFromDisposal) {
            var response = sn_hamp.HAMUtils.canCancelFromDisposal(consumable);

            if (!response.continueProcessing) {
                return response.answer;
            }

            status = response.answer;
        } 

        return status && (current.getValue('planned_for_disposal') === '1' && gs.nil(current.getValue('disposal_order_number')) && gs.nil(current.getValue('sn_eam_disposal_order_number')));

    },

    cancelFromDisposal: function(consumable, status, substatus, stockroom, current_stockroom) {
        var current = new GlideRecord('alm_consumable');
        current.get(consumable);
        if (GlidePluginManager.isActive('com.sn_hamp')) {
            new sn_hamp.HampHWDisposalUtils().cancelFromDisposal(current);
        }
        if (GlidePluginManager.isActive('com.sn_eam')) {
            new sn_eam.EAMDisposalUtils().cancelFromDisposal(current); //TODO
        }
        // Update the current record
        current.setValue('install_status', status);
        current.setValue('substatus', substatus);
        if (current_stockroom == '') {
            current.setValue('stockroom', stockroom);
        }
        current.setValue('planned_for_disposal', false);
        current.update();
    },

    markReadyForDisposal: function(consumable, qty, status, substatus) {
        var redirectId = consumable;
        var consumableGr = this._getConsumable(consumable);
        var split = (parseInt(consumableGr.quantity, 10) > parseInt(qty, 10)) ? true : false;
        if (split) {
            var unitCost = consumableGr.cost / consumableGr.quantity;
            // Update fields of original consumable
            consumableGr.quantity = consumableGr.quantity - qty;
            consumableGr.update();
            // Inserting new consumable
            consumableGr.quantity = qty;
            consumableGr.cost = unitCost * qty;
            consumableGr.install_status = status;
            consumableGr.substatus = substatus;
            consumableGr.planned_for_disposal = true;
            redirectId = consumableGr.insert();
        } else {
            // Marking entire quantity as ready for disposal, so update original record
            consumableGr.substatus = substatus;
            consumableGr.planned_for_disposal = true;
            consumableGr.update();
        }

        if (qty === '1') {
            gs.addInfoMessage(gs.getEscapedMessage('{0} asset marked for disposal', qty));
        } else {
            gs.addInfoMessage(gs.getEscapedMessage('{0} assets marked for disposal', qty));
        }
        return redirectId;
    },

    retireConsumable: function(sys_id, qty, status, substatus, stockroom) {
        var redirectSysId;
        var consumable = this._getConsumable(sys_id);

        if (GlidePluginManager.isActive('com.sn_eam') && sn_eam.EAMUtils.canRetireQty) {
		if(!sn_eam.EAMUtils.canRetireQty(consumable, qty))
			return;
	}

        var split = (parseInt(consumable.quantity, 10) != parseInt(qty, 10));
        var unitCost = consumable.cost / consumable.quantity;

        if (split) {
            // Update fields of original consumable
            consumable.quantity = consumable.quantity - qty;
            consumable.update();
            // Inserting new consumable
            consumable.quantity = qty;
            consumable.cost = unitCost * qty;
            consumable.install_status = status;
            consumable.substatus = substatus;
            consumable.stockroom = stockroom;
            consumable.parent = '';
            redirectSysId = consumable.insert();

            var tableName = consumable.getValue('sys_class_name');
            var parms = [];
            var msgText;
            parms.push(qty);
            if (qty === '1') {
                msgText = gs.getEscapedMessage('asset');
            } else {
                msgText = gs.getEscapedMessage('assets');
            }
            parms.push(msgText);
            gs.addInfoMessage(gs.getEscapedMessage('{0} {1} has been retired', parms));
        } else {
            // Retiring entire quantity, so update original record
            consumable.install_status = status;
            consumable.substatus = substatus;
            consumable.parent = '';
            consumable.stockroom = stockroom;
            consumable.update();

            if (qty === '1') {
                gs.addInfoMessage(gs.getEscapedMessage('{0} asset has been retired', qty));
            } else {
                gs.addInfoMessage(gs.getEscapedMessage('{0} assets have been retired', qty));
            }
        }
    },

    splitForeground: function(sys_id, qty, status, substatus, asset, stockroom, location, assigned_to, columnUpdates) {
        this.split(sys_id, qty, status, substatus, asset, stockroom, location, assigned_to, '', columnUpdates);
        if (asset != '') {
            var assetRecord = new GlideRecord('alm_asset');
            if (assetRecord.get(asset)) {
                if (qty == 1)
                    gs.addInfoMessage(gs.getEscapedMessage('One item has been consumed and attached to {0}', assetRecord.getDisplayValue()));
                else if (qty > 1)
                    gs.addInfoMessage(gs.getEscapedMessage('{0} items have been consumed and attached to {1}', [qty + '', assetRecord.getDisplayValue()]));
            }
        }
        if (assigned_to != '') {
            var userRecord = new GlideRecord('sys_user');
            if (userRecord.get(assigned_to)) {
                if (qty == 1)
                    gs.addInfoMessage(gs.getEscapedMessage('One item has been consumed and attached to {0}', userRecord.getDisplayValue()));
                else if (qty > 1)
                    gs.addInfoMessage(gs.getEscapedMessage('{0} items have been consumed and attached to {1}', [qty + '', userRecord.getDisplayValue()]));
            }
        }
    },

    split: function(sys_id, qty, status, substatus, asset, stockroom, location, assigned_to, asset_function, columnUpdates) {
        var consumable = this._getConsumable(sys_id);

        if (parseInt(qty, 10) > parseInt(consumable.quantity, 10)) {
            gs.addErrorMessage(gs.getEscapedMessage(
                'Trying to split {0} when only {1} exist', [qty + '',
                    consumable.quantity + ''
                ]));
            return consumable;
        }
        var split = (parseInt(consumable.quantity, 10) != parseInt(qty, 10));
		
        if (split) {
            cost = consumable.cost / consumable.quantity;
            consumable.quantity = consumable.quantity - qty;
            consumable.update();
            consumable.quantity = qty;
            consumable.cost = cost * qty;
        }
        consumable.install_status = status;
        consumable.substatus = substatus;
        if (asset != '') {
            // Asset is being split and associated with real asset.
            consumable.parent = asset;
            consumable.assigned_to = assigned_to;
        } else {
            // Only setting these fields when the split consumable is
            // not associated with a real asset. For real-assets,
            // downstream BRs manage these assignments.
            consumable.stockroom = stockroom;
            consumable.location = location;
            consumable.assigned_to = assigned_to;
        }
		
		if (asset_function) {
			consumable.asset_function = asset_function;
		}
		
		if (columnUpdates) {
			try {
				for (column in columnUpdates) {
					if (consumable.isValidField(column)) {
						consumable.setValue(column, columnUpdates[column]);
					}
				}
			} catch(e) {
				gs.error(e);
				return null;
			}
		}
		
        if (split)
            return consumable.insert();
        else {
			// PRB1576614 - Updating the fields of the underlying expense line
			this.updateExpenseLine(consumable);
			return consumable.update();
		}
    },
	
    updateExpenseLine: function(consumable) {
		var fieldMapping = {'assigned_to': 'user', 'cost_center': 'cost_center'};
		var gr = new GlideRecord('fm_expense_line');
		gr.addQuery('asset', consumable.getUniqueValue());
		gr.query();
		if (gr.next() && !gr.hasNext()) {
			for(var field in fieldMapping) {
				var existingValue = gr.getValue(fieldMapping[field]);
				var newValue = consumable.getValue(field);
				if(existingValue === null && newValue !== null)
					gr.setValue(fieldMapping[field], newValue);
			}
			gr.update();
		}
    },

    getMaxInState: function(model, stockroom, status, substatus, asset) {
        var qty = 0;
        var gr = new GlideRecord('alm_asset');
        gr.addQuery('stockroom', stockroom);
        gr.addQuery('install_status', status);
        gr.addQuery('substatus', substatus);
        gr.addQuery('model', model);
        if (asset != '')
            gr.addQuery('sys_id', asset);
        gr.query();
        if (gr.next())
            qty = gr.quantity;

        return qty;
    },

    _getConsumable: function(sys_id) {
        var consumable = new GlideRecord('alm_consumable');
        consumable.addQuery('sys_id', sys_id);
        consumable.query();
        consumable.next();
        return consumable;
    },

    mergeConsumable: function(current) {
		if (Consumables.shouldMergeConsumable(current)) {
			var doRedirect = false;
			if ((!current.nil()) && (!current.doRedirect.nil()))
				doRedirect = current.doRedirect;

			var gr = new GlideRecord('alm_consumable');
			gr.addQuery('model', current.model);
			gr.addQuery('location', current.location);
			gr.addQuery('model_category', current.model_category);
			gr.addQuery('stockroom', current.stockroom);
			gr.addQuery('install_status', current.install_status);
			gr.addQuery('substatus', current.substatus);
			gr.addQuery('parent', current.parent);
			gr.addQuery('asset_function', current.asset_function);
			gr.addQuery('assigned_to', current.assigned_to);
			gr.addQuery('sys_domain', current.sys_domain);
			if (SNC.AssetMgmtUtil.isPluginRegistered('com.snc.procurement')) {
				if (current.install_status == 2)
					gr.addQuery('purchase_line', current.purchase_line);
			}
			if (global.AssetUtils.IS_EAM_ACTIVE && sn_eam.EAMUtils.addMergeConsumableQuery) {
				sn_eam.EAMUtils.addMergeConsumableQuery(gr, current);
			}
			if (current.active_to == true)
				gr.addQuery('active_to', true);
			else
				gr.addQuery('active_to', false).addOrCondition('active_to', null);
			gr.addNullQuery('planned_for_disposal').addOrCondition('planned_for_disposal', false);
			gr.query();

			while (gr.next()) {
				if (gr.sys_id != current.sys_id) {
					var parms = [];
					parms.push(gr.getDisplayValue('stockroom'));
					parms.push(gr.getDisplayValue('install_status'));
					parms.push(gr.getDisplayValue('substatus'));
					// eslint-disable-next-line  max-len
					gs.addInfoMessage(gs.getEscapedMessage('Merged updated record with previous record with similar attributes: Stockroom - {0}, State - {1}, Substate - {2}', parms));
					gr.quantity = parseInt(gr.quantity, 10) + parseInt(current.quantity, 10);
					gr.cost = parseFloat(gr.cost) + parseFloat(current.cost);
					gr.update();
					if (new TableUtils("sm_asset_usage").tableExists()) {

						var assetUsageRecords = new GlideRecord('sm_asset_usage');

						assetUsageRecords.addQuery('asset', current.sys_id);
						assetUsageRecords.setValue('asset', gr.getUniqueValue());
						assetUsageRecords.updateMultiple();
					}
                    current.parent = '';
					current.deleteRecord();
					current = gr;
					if (doRedirect == true)
						action.setRedirectURL(gr);
					break;
				}
			}
		}
    },

    type: 'Consumables'
};
Consumables.shouldMergeConsumable = function (consumableGr) {
	if (Consumables.mergeFieldCheck(consumableGr)) {
		if (Consumables.mergeConditionCheck(consumableGr)) {
			return true;
		}
	}
	return false;
};

Consumables.mergeFieldCheck = function (consumableGr) {
	var canMerge = false;
	var orFields = ['model', 'location', 'model_category', 'assigned_to',
					'stockroom', 'install_status', 'substatus', 'active_to',
					'parent', 'planned_for_disposal', 'asset_function',];
	if (consumableGr.operation() == 'insert') {
		canMerge = true;
	} else {
		canMerge = orFields.some(function(field) {
			return consumableGr[field].changes();
		});
	}
	// EAM check
	if (global.AssetUtils.IS_EAM_ACTIVE &&
		sn_eam.EAMUtils.consumableMergeFieldCheck) {
		canMerge = sn_eam.EAMUtils.consumableMergeFieldCheck(consumableGr, canMerge);
	}
	// HAMP check
	if (global.AssetUtils.IS_HAMP_ACTIVE &&
		sn_hamp.HAMUtils.consumableMergeFieldCheck) {
		canMerge = sn_hamp.HAMUtils.consumableMergeFieldCheck(consumableGr, canMerge);
	}			
	return canMerge;
};

Consumables.mergeConditionCheck = function (consumableGr) {
	var canMerge = (consumableGr.install_status != '9' && consumableGr.substatus != 'pending_transfer' && consumableGr.active_to != true) ||
		(consumableGr.install_status == '6' && consumableGr.substatus == 'reserved' && consumableGr.active_to == true);
	canMerge = canMerge && !consumableGr.planned_for_disposal;
	// EAM check
	if (global.AssetUtils.IS_EAM_ACTIVE &&
		sn_eam.EAMUtils.consumableMergeConditionCheck) {
		canMerge = sn_eam.EAMUtils.consumableMergeConditionCheck(consumableGr, canMerge);
	}
	// HAMP check
	if (global.AssetUtils.IS_HAMP_ACTIVE &&
		sn_hamp.HAMUtils.consumableMergeConditionCheck) {
		canMerge = sn_hamp.HAMUtils.consumableMergeConditionCheck(consumableGr, canMerge);
	}
	return canMerge;
};

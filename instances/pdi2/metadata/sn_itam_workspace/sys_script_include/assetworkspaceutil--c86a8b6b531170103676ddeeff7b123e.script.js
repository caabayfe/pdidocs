var AssetWorkspaceUtil = Class.create();
AssetWorkspaceUtil.prototype = {
	initialize: function() {},

	getMissingData: function(input) {
		var table = sn_itam_workspace.AssetWorkspaceUtil.CMDB_MODEL_TABLE_NAME;
		var impActionSetupQueries = new sn_itam_workspace.ImportantActionsSetupQueries();
		return {
			tableName: table,
			missingName: [impActionSetupQueries.getModelImpActionsData(false, table,
				sn_itam_workspace.AssetWorkspaceUtil.MODEL_NAME, input),
			impActionSetupQueries.getModelImpActionsData(true, table,
				sn_itam_workspace.AssetWorkspaceUtil.MODEL_NAME, input),
			gs.getMessage('Missing name models'),
			],
			missingManufacture: [impActionSetupQueries.getModelImpActionsData(false, table,
				sn_itam_workspace.AssetWorkspaceUtil.MODEL_MANUFACTURER, input),
			impActionSetupQueries.getModelImpActionsData(true, table,
				sn_itam_workspace.AssetWorkspaceUtil.MODEL_MANUFACTURER, input),
			gs.getMessage('Missing manufacturer models'),
			],
			missingModelNumber: [impActionSetupQueries.getModelImpActionsData(false, table,
				sn_itam_workspace.AssetWorkspaceUtil.MODEL_NUMBER, input),
			impActionSetupQueries.getModelImpActionsData(true, table,
				sn_itam_workspace.AssetWorkspaceUtil.MODEL_NUMBER, input),
			gs.getMessage('Missing model number models'),
			],
		};
	},

	// Get dropdown values for Select/Typeahead fields
	getDropwdownValues: function(input) {
		var gr = new GlideRecordSecure(input.table);
		gr.addEncodedQuery(input.encodedQuery,true);
		if (input.hasOwnProperty('orderBy') && input.orderBy) {
			if (input.hasOwnProperty('sortType') && (!input.sortType || (input.sortType === 'desc'))) {
				gr.orderByDesc(input.orderBy);
			} else {
				gr.orderBy(input.orderBy);
			}
		}
		gr.setLimit(AssetWorkspaceUtil.MAX_DROPDOWN_ITEMS + 1);
		gr.query();
		var rowCount = gr.getRowCount();
		var label = '';
		if (rowCount === 0) {
			label = gs.getMessage('No results found');
		} else if (rowCount <= parseInt(input.limit, 10)) {
			label = gs.getMessage('Showing 1-{0} of {0}', [rowCount]);
		} else {
			if (rowCount <= AssetWorkspaceUtil.MAX_DROPDOWN_ITEMS) {
				label = gs.getMessage('Showing 1-{0} of {1}', [input.limit, rowCount]);
			} else {
				// eslint-disable-next-line max-len
				label = gs.getMessage('Showing 1-{0} of more than {1}', [input.limit, AssetWorkspaceUtil.MAX_DROPDOWN_ITEMS.toString()]);
			}
			gr.setLimit(parseInt(input.limit, 10));
			gr.query();
		}
		var dropdownvalues = [];
		if (!gs.nil(input.repeaterRowId)) {
			// Parse repeaterRowId only if it's defined and not null
			var repeaterRowIdNew = JSON.parse(input.repeaterRowId);
			var defaultValue = !gs.nil(repeaterRowIdNew.defaultValue) ? repeaterRowIdNew.defaultValue : {};
			// Push dropdown item only if defaultValue is valid
			if (!gs.nil(defaultValue.value) && !gs.nil(defaultValue.displayValue)) {
				var dropdownItem = {
					id: defaultValue.value,
					label: defaultValue.displayValue,
					sublabel: defaultValue.displayValue
				};
				dropdownvalues.push(dropdownItem);
			}
		}
		while (gr.next()) {
			var sublabel = input.sublabel.split(',').map(function(field) {
				return gr.getDisplayValue(field);
			}).filter(function(element) {
				return element;
			});
			dropdownvalues.push({
				id: gr.getUniqueValue(),
				label: gr.getDisplayValue(input.label),
				sublabel: sublabel.join(', '),
			});
		}
		return [{
			id: 0,
			label: label,
			children: dropdownvalues,
		}];
	},

	getAssetEstateTabs: function() {
		var assetEstateTabs = {
			'': {
				listTitle: '',
				table: '',
				listView: '',
				query: '',
			},
			alm_asset: {
				listTitle: gs.getMessage('All assets'),
				table: 'alm_asset',
				listView: 'itam_workspace',
				query: '',
			},
			alm_hardware: {
				listTitle: gs.getMessage('Hardware assets'),
				table: 'alm_hardware',
				listView: 'itam_workspace',
				query: '',
			},
			alm_consumable: {
				listTitle: gs.getMessage('Consumable assets'),
				table: 'alm_consumable',
				listView: 'itam_workspace',
				query: '',
			},
			alm_license: {
				listTitle: gs.getMessage('Software licenses'),
				table: 'alm_license',
				listView: 'itam_workspace',
				query: '',
			},
			alm_asset_other: {
				listTitle: gs.getMessage('Other assets'),
				table: 'alm_asset',
				listView: 'itam_workspace',
				query: 'sys_class_name=alm_asset',
			},
			asset_task: {
				listTitle: gs.getMessage('Asset tasks'),
				table: 'asset_task',
				listView: '',
				query: '',
			},

		};
		var isSamActive = AssetWorkspaceUtil.isSamActive();
		var data = [];
		var tabs = Object.keys(assetEstateTabs);
		for (var i = 0; i < tabs.length; i++) {
			if (tabs[i] === 'alm_license' && isSamActive) {
				continue;
			} else {
				data.push(assetEstateTabs[tabs[i]]);
			}
		}

		return data;
	},
	getModelManagementTabs: function() {
		var modelManagementTabs = [
			{
				listTitle: '',
				table: '',
				listView: '',
				query: '',
			}, {
				listTitle: gs.getMessage('All models'),
				table: 'cmdb_model',
				listView: 'itam_workspace',
				query: '',
			}, {
				listTitle: gs.getMessage('Hardware models'),
				table: 'cmdb_hardware_product_model',
				listView: 'itam_workspace',
				query: '',
			}, {
				listTitle: gs.getMessage('Consumable models'),
				table: 'cmdb_consumable_product_model',
				listView: 'itam_workspace',
				query: '',
			}, {
				listTitle: gs.getMessage('Bundled models'),
				table: 'cmdb_model',
				listView: 'itam_workspace',
				query: 'bundle=true',
			}, {
				listTitle: gs.getMessage('Contract models'),
				table: 'cmdb_contract_product_model',
				listView: 'itam_workspace',
				query: '',
			}, {
				listTitle: gs.getMessage('Software models'),
				table: 'cmdb_software_product_model',
				listView: '',
				query: '',
			},
		];
		return modelManagementTabs;
	},
	getContractTabs: function() {
		var contractTabs = {
			'': {
				listTitle: '',
				table: '',
				listView: '',
				query: '',
			},
			all_contracts: {
				listTitle: gs.getMessage('All contracts'),
				table: 'ast_contract',
				listView: '',
				query: '',
			},
			lease: {
				listTitle: gs.getMessage('Leases'),
				table: 'ast_contract',
				listView: '',
				query: 'contract_model=' + global.ContractManagementUtils.LEASE,
			},
			insurance: {
				listTitle: gs.getMessage('Insurance'),
				table: 'ast_contract',
				listView: '',
				query: 'contract_model=' + global.ContractManagementUtils.INSURANCE,
			},
			maintenance: {
				listTitle: gs.getMessage('Maintenance'),
				table: 'ast_contract',
				listView: '',
				query: 'contract_model=' + global.ContractManagementUtils.MAINTENANCE,
			},
			warranties: {
				listTitle: gs.getMessage('Warranties'),
				table: 'ast_contract',
				listView: '',
				query: 'contract_model=' + global.ContractManagementUtils.WARRANTY,
			},
			puragreements: {
				listTitle: gs.getMessage('Purchasing agreements'),
				table: 'ast_contract',
				listView: '',
				query: 'contract_model=' + global.ContractManagementUtils.PURCHASE_AGREEMENT,
			},
			purorders: {
				listTitle: gs.getMessage('Purchase orders'),
				table: 'ast_contract',
				listView: '',
				query: 'contract_model=' + global.ContractManagementUtils.PURCHASE_ORDER,
			},
			service: {
				listTitle: gs.getMessage('Service'),
				table: 'ast_contract',
				listView: '',
				query: 'contract_model=' + global.ContractManagementUtils.SERVICE_CONTRACT,
			},
			software_license: {
				listTitle: gs.getMessage('Software licenses'),
				table: 'ast_contract',
				listView: '',
				query: 'contract_model=' + global.ContractManagementUtils.SOFTWARE_LICENSE,
			},
			subscription: {
				listTitle: gs.getMessage('Subscriptions'),
				table: 'ast_contract',
				listView: '',
				query: 'contract_model=' + global.ContractManagementUtils.SUBSCRIPTION,
			},
			nondisclousre: {
				listTitle: gs.getMessage('Non-Disclosure'),
				table: 'ast_contract',
				listView: '',
				query: 'contract_model=' + global.ContractManagementUtils.NDA,
			},
			mycontracts: {
				listTitle: gs.getMessage('My contracts'),
				table: 'ast_contract',
				listView: '',
				query: 'business_owner=' + gs.getUserID() + '^stateINdraft,active',
			},
			myapprovals: {
				listTitle: gs.getMessage('My approvals'),
				table: 'sysapproval_approver',
				listView: '',
				query: 'approver=' + gs.getUserID(),
			},
			termsandconditons: {
				listTitle: gs.getMessage('Terms and conditions'),
				table: 'clm_terms_and_conditions',
				listView: '',
				query: '',
			},
		};
		var data = [];
		var tabs = Object.keys(contractTabs);
		for (var i = 0; i < tabs.length; i++) {
			data.push(contractTabs[tabs[i]]);
		}
		return data;
	},
	getProcurementTabs: function() {
		var procurementTabs = {
			'': {
				listTitle: '',
				table: '',
				listView: '',
				query: '',
			},
			requests: {
				listTitle: gs.getMessage('Requests'),
				table: 'sc_request',
				listView: '',
				query: 'active=true^sourceable=true',
			},
			items: {
				listTitle: gs.getMessage('Items'),
				table: 'sc_req_item',
				listView: '',
				query: '',
			},
			tasks: {
				listTitle: gs.getMessage('Tasks'),
				table: 'sc_task',
				listView: '',
				query: 'active=true^request.sourceable=true',
			},
			purchase_orders: {
				listTitle: gs.getMessage('Purchase orders'),
				table: 'proc_po',
				listView: '',
				query: '',
			},
			receiving_slips: {
				listTitle: gs.getMessage('Receiving slips'),
				table: 'proc_rec_slip',
				listView: '',
				query: '',
			},
		};
		var data = [];
		var tabs = Object.keys(procurementTabs);
		for (var i = 0; i < tabs.length; i++) {
			data.push(procurementTabs[tabs[i]]);
		}
		return data;
	},
	getRenwalCostAdjustmentTypes: function() {
		var current_language = AssetWorkspaceUtil.getSessionLanguage();
		var results = [];
		results.push({
			id: 'none',
			value: '',
			label: gs.getMessage('-- None --'),
		});
		new global.GlideQuery('sys_choice')
			.where('name', 'ast_contract')
			.where('element', 'cost_adjustment_type')
			.where('language', current_language)
			.select('value', 'sys_id', 'label')
			.forEach(function(type) {
				var costType = {};
				costType.id = type.value;
				costType.value = type.value;
				costType.label = type.label;
				results.push(costType);
			});
		return results;
	},
	getRenewOptions: function() {
		var current_language = AssetWorkspaceUtil.getSessionLanguage();
		var results = [];
		results.push({
			id: 'none',
			value: '',
			label: gs.getMessage('-- None --'),
		});
		new global.GlideQuery('sys_choice')
			.where('name', 'ast_contract')
			.where('element', 'renewal_options')
			.where('language', current_language)
			.select('value', 'sys_id', 'label')
			.forEach(function(option) {
				var options = {};
				options.id = option.value;
				options.value = option.value;
				options.label = option.label;
				results.push(options);
			});
		return results;
	},
	getInventoryTabs: function() {
		// Added all the tabs information here for supporting backward compatibility
		// For any future modifification of tabs related to HAM, please use HAMAssetWorkspaceUtil - Do not add any HAM specific tab information here

		var titles = ['', gs.getMessage('All stockrooms'), gs.getMessage('Asset audits'), gs.getMessage('Disposal orders'), gs.getMessage('Loaner asset orders'), gs.getMessage('RMA orders'), gs.getMessage('RMA line items'), gs.getMessage('Transfer orders'), gs.getMessage('Donation orders'), gs.getMessage('Repair orders'), gs.getMessage('Asset attestations')];
		var tables = ['', 'alm_stockroom', 'sn_hamp_asset_audit', 'sn_hamp_hardware_disposal', 'sn_hamp_loaner_asset_order', 'sn_hamp_rma_request', 'sn_hamp_rma_request_line', 'alm_transfer_order', 'sn_itam_common_donation_order','sn_itam_common_repair_order', 'sn_itam_common_asset_attestation'];
		var hampTables = ['sn_hamp_asset_audit', 'sn_hamp_hardware_disposal', 'sn_hamp_loaner_asset_order', 'sn_hamp_rma_request', 'sn_hamp_rma_request_line'];
		var commonTables = ['sn_itam_common_donation_order','sn_itam_common_repair_order','sn_itam_common_asset_attestation'];

		var data = [];
		var params = {};
		var emptyParams = {
			'listTitle': '',
			'table': '',
			'listView':'',
			'query':''
		};
		var isHampActive = GlidePluginManager.isActive('sn_hamp');
		var isCommonActive = GlidePluginManager.isActive('sn_itam_common');

		for (var i = 0; i < titles.length; i++) {
			if (gs.nil(titles[i])) {
				data.push(emptyParams);
			}
			else if (hampTables.indexOf(tables[i]) !== -1 && !(isHampActive)) {
				continue;
			}
			else if(commonTables.indexOf(tables[i]) !== -1 && !(isCommonActive)) {
				continue;
			}
			else {
				params = {};
				params['listTitle'] = titles[i];
				params['table'] = tables[i];
				params['listView'] = '';
				params['query'] = '';
				data.push(params);
			}
		}

		return data;
	},

	type: 'AssetWorkspaceUtil',
};
AssetWorkspaceUtil.isSamActive = function() {
	return GlidePluginManager.isActive('com.snc.sam.core') || GlidePluginManager.isActive('com.snc.samp');
};
AssetWorkspaceUtil.isHAMActive = function() {
	return GlidePluginManager.isActive('sn_hamp');
};
AssetWorkspaceUtil.isCSDMActive = function() {
	return GlidePluginManager.isActive('com.snc.cmdb.csdm.activation');
};
AssetWorkspaceUtil.getSessionLanguage = function() {
	return gs.getSession().getLanguage();
};
AssetWorkspaceUtil.CMDB_MODEL_TABLE_NAME = 'cmdb_model';
AssetWorkspaceUtil.HARDWARE_MODEL_TABLE_NAME = 'cmdb_hardware_product_model';
AssetWorkspaceUtil.MODEL_NAME = 'name';
AssetWorkspaceUtil.MODEL_NUMBER = 'model_number';
AssetWorkspaceUtil.USEFUL_LIFE = 'useful_life';
AssetWorkspaceUtil.MODEL_MANUFACTURER = 'manufacturer';
AssetWorkspaceUtil.STOCKROOM_TABLE_NAME = 'alm_stockroom';
AssetWorkspaceUtil.MANAGER = 'manager';
AssetWorkspaceUtil.ASSIGNMENT_GROUP = 'assignment_group';
AssetWorkspaceUtil.TYPE = 'type';
AssetWorkspaceUtil.STOCKROOM_NAME = 'name';
AssetWorkspaceUtil.MAX_DROPDOWN_ITEMS = 250;

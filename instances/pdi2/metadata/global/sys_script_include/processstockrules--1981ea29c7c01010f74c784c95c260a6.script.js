var ProcessStockRules = Class.create();
ProcessStockRules.prototype = Object.extendsObject(global.AssetManagementPerGlideRecordBaseJob, {
	CONS_MODEL: 'cmdb_consumable_product_model',
	TRACK_CONS: 'track_as_consumable',
	HARDWARE_INVENTORY_STOCK_ORDER: '4109aa5fdb22001015a8ffefbf961984',
	ENTERPRISE_STOCK_ORDER_CAT_ITEM: '3af2a990737e30105c042978caf6a775',
	initialize: function() {
        this.transfer = new StockRuleTransfer();
        this.jobLog = new global.AssetJobLogUtil();
        this.JOBLOG_DETAILS = {
            JOBNAME: 'Stock Rule Runner',
            STOCK_RULE_BATCH_SIZE: this.getBatchSize(),
            TOTAL_STOCK_RULES_COUNT: 0,
            STOCKROOM_RULE_COUNT: 0,
            VENDOR_RULE_COUNT: 0,
            CURR_COUNT: 0,
            STEP_LOG_NAME: '',
			JOB_STATUSES: {
				COMPLETED: 'completed',
				FAILED: 'failed',
			}
        };
    },
    getBatchSize: function() {
        var batchSize = gs.getProperty('sn_itam_stockrulejob_batch_size');
        return ((batchSize > 0) ? batchSize : 1000);
    },
    getRecords: function() {
        this.jobLog.startJobLog(this.JOBLOG_DETAILS.JOBNAME);
        var stockRules = new GlideRecord('alm_stock_rule');
        stockRules.addQuery('active', 'true');
        stockRules.orderBy('restocking_option');
        stockRules.query();
        return stockRules;
    },
    runJobForRecord: function(stockRuleGr) {
       
		this.JOBLOG_DETAILS.CURR_COUNT++;

		if (((this.JOBLOG_DETAILS.CURR_COUNT % this.JOBLOG_DETAILS.STOCK_RULE_BATCH_SIZE) === 1)) {
			this.JOBLOG_DETAILS.STEP_LOG_NAME = "Stock Rules batch started " +
				parseInt(this.JOBLOG_DETAILS.CURR_COUNT / this.JOBLOG_DETAILS.STOCK_RULE_BATCH_SIZE);
			this.jobLog.startJobStep(this.JOBLOG_DETAILS.STEP_LOG_NAME);
		}

		if (stockRuleGr.getValue('restocking_option') === 'stockroom') {
			this.JOBLOG_DETAILS.STOCKROOM_RULE_COUNT++;
			this._processStockoomStockrule(stockRuleGr);
		} else {
			this.JOBLOG_DETAILS.VENDOR_RULE_COUNT++;
			this._processVendorStockrule(stockRuleGr);
		}

		if (((this.JOBLOG_DETAILS.CURR_COUNT % this.JOBLOG_DETAILS.STOCK_RULE_BATCH_SIZE) === 0)) {
			this.jobLog.stopJobStep(this.JOBLOG_DETAILS.STEP_LOG_NAME, this.JOBLOG_DETAILS.CURR_COUNT + 
			' Processed. Stockroom Rule:' + this.JOBLOG_DETAILS.STOCKROOM_RULE_COUNT +
			' ,Vendor Rule:' + this.JOBLOG_DETAILS.VENDOR_RULE_COUNT);
		}      
    },

	postRunJobOnSuccess: function() {
		this.jobLog.stopJobStep(this.JOBLOG_DETAILS.STEP_LOG_NAME, this.JOBLOG_DETAILS.CURR_COUNT + 
			' Processed. Stockroom Rule:' + this.JOBLOG_DETAILS.STOCKROOM_RULE_COUNT +
			' ,Vendor Rule:' + this.JOBLOG_DETAILS.VENDOR_RULE_COUNT);

		var comments = "PROCESS COMPLETED.\nTOTAL STOCK RULES = " + this.JOBLOG_DETAILS.CURR_COUNT +
			"\n STOCKROOM RULE = " + this.JOBLOG_DETAILS.STOCKROOM_RULE_COUNT +
			"\n VENDOR RULE = " + this.JOBLOG_DETAILS.VENDOR_RULE_COUNT;
		this.jobLog.stopJobLog(this.JOBLOG_DETAILS.JOB_STATUSES.COMPLETED, comments);
	},
	
	postRunJobOnError: function() {
		this.jobLog.stopJobLog(this.JOBLOG_DETAILS.JOB_STATUSES.FAILED,  'stock rule job failed');
	},

	_processStockoomStockrule: function(stockRuleGr) {
		var parent = stockRuleGr.parent_stockroom;
		var stockroom = stockRuleGr.stockroom;
		var model = stockRuleGr.model;
		var stockRuleSysId = stockRuleGr.getValue('sys_id');
		var supply = this.transfer.getTotalRecordCount(stockroom, model, stockRuleGr);
		var thresh = parseInt(stockRuleGr.threshold, 10);
		var need = thresh - supply;
		var order = 0;
		var size = parseInt(stockRuleGr.order_size, 10);
		if (need > 0) {
			if (size <= 0) {
				order = need;
			} else {
				while (order < need) {
					order += size;
				}
			}
			var stock = this.transfer.checkStockroomTransferAvailability(parent, model, stockRuleGr);
			if (stock >= order) {
				if (model.sys_class_name.toString() === this.CONS_MODEL ||
					model.asset_tracking_strategy.toString() === this.TRACK_CONS) {
					this.transfer.consumableTransfer(parent, stockroom, model, order,stockRuleSysId);
				} else {
					this.transfer.assetTransfer(parent, stockroom, model, order,stockRuleSysId);
				}
			}
			// if it does not have enough, it will run each night until the parent stockroom has enough supply
		}
	},
	_processVendorStockrule: function(stockRuleGr) {
		/*
		If quantity is below threshold and pending_delivery is false, send email & create task/purchaseOrder
		If quantity is below threshold and pending_delivery is true, check if there is existing purchaseOrder
		If quantity is above threshold and pending_delivery is false, do nothing
		If quantity is above threshold and pending_delivery is true, change pending_delivery to false
		*/
		var threshold = stockRuleGr.threshold;
		var stockroom = stockRuleGr.stockroom;
		var model = stockRuleGr.model;
		var quantity = this.transfer.getTotalRecordCount(stockroom, model, stockRuleGr);
		var size = parseInt(stockRuleGr.order_size, 10);

		//check if quantity below treshold and pending delivery is false	
		if ((quantity < threshold) && stockRuleGr.pending_delivery.toString() === 'true') {

			var pending_order = false;

			if ((GlidePluginManager.isActive('com.sn_eam') && sn_eam.EAMUtils.isEnterpriseModel(model)) || (GlidePluginManager.isActive('com.sn_hamp') && !sn_hamp.HAMUtils.checkIfEAMClass(stockRuleGr.model.sys_class_name, sn_hamp.HAMConstants.EAM_MODEL_BASE_CLASS))) {
				gr = new GlideRecord('sc_req_item');
				gr.addQuery('active', 'true');
				gr.addQuery('cat_item',this.HARDWARE_INVENTORY_STOCK_ORDER).addOrCondition('cat_item',this.ENTERPRISE_STOCK_ORDER_CAT_ITEM);// checking for item = hardware/enterprise inventory stock orders
				gr.addQuery('stage', 'IN', ['waiting_for_approval', 'fulfillment', 'awaiting_delivery']);
				gr.query();
				while (gr.next()) {
					if ((gr.variables.model == model) && (gr.variables.stockroom == stockroom)) {
						pending_order = true;
					}
				}
			} else if (GlidePluginManager.isActive('com.snc.procurement')) {
				new GlideQuery('proc_po_item')
					.where('model', model) //checking purchaseOrderLines for model from stockrule
					.where('status', 'IN', ['requested', 'ordered', 'pending'])
					.where('sys_created_by', 'system')
					.where('purchase_order.ship_to', stockroom)
					.selectOne()
					.ifPresent(function() {
						pending_order = true;
					});
			}
			if (pending_order == false) {
				// No existing purchase order or stock order but pending delivery is true
				stockRuleGr.pending_delivery = 'false';
			}
		}

		// Quantity below threshold
		if ((quantity < threshold) && stockRuleGr.pending_delivery.toString() !== 'true') {
			var need = threshold - quantity;
			var order = 0;
			if (size <= 0) {
				order = need;
			} else {
				while (order < need) {
					order += size;
				}
			}
			// Trigger event
			gs.eventQueue('asset.restock', stockRuleGr, order, threshold);
			// STRY52899577 - If model belongs to EAM, order is handled by EAM
			if (GlidePluginManager.isActive('com.sn_eam') && sn_eam.EAMUtils.isEnterpriseModel(model) || this.isOTStockrule(stockRuleGr)) {
				sn_eam.StockOrderUtils.createStockOrderReq(stockRuleGr, quantity, order);
			} else if (GlidePluginManager.isActive('com.sn_hamp') && !sn_hamp.HAMUtils.checkIfEAMClass(stockRuleGr.model.sys_class_name, sn_hamp.HAMConstants.EAM_MODEL_BASE_CLASS)) {
				sn_hamp.StockOrderUtils.createStockOrderReq(stockRuleGr, quantity, order);
			} else {
				this._createPurchaseOrder(stockRuleGr, quantity, order);
			}
			// Set "pending_delivery" to true
			stockRuleGr.pending_delivery = 'true';
		} else if ((quantity > threshold) && stockRuleGr.pending_delivery.toString() === 'true') {
			// Quantity above threshold
			stockRuleGr.pending_delivery = 'false';
		}
		stockRuleGr.update();
	},
	_createPurchaseOrder: function(stockLevel, quantity, order) {
		var stockroom = stockLevel.stockroom;
		var model = stockLevel.model;
		var threshold = stockLevel.threshold;
		// Add Task
		// we keep adding task because:
		// if procurement plugin is not enabled, then we create TASK for existing Stock Rule records
		// if procurement plugin is enabled, then we create TASK for the user who have been used to TASK
		var task = new GlideRecord('task');
		task.initialize();
		task.assigned_to = stockroom.manager;
		task.short_description = 'Quantity threshold breached: ' + stockroom.name;
		task.description = 'Stockroom: ' + stockroom.name + '\nItem: ' + model.display_name + '\nQuantity: ' +
			quantity + '\nThreshold: ' + threshold;
		task.insert();
		if (GlidePluginManager.isActive('com.snc.procurement')) {
			// Add Purchase Order
			var po = new GlideRecord('proc_po');
			po.initialize();
			po.ship_to = stockroom;
			po.short_description = 'Quantity threshold breached: ' + stockroom.name;
			po.description = '-- Created by Stock Rule --\nStockroom: ' + stockroom.name + '\nItem: ' +
				model.display_name + '\nQuantity: ' + quantity + '\nThreshold: ' + threshold;
			var poId = po.insert();
			// Add Purcahse Order Line Item
			var poli = new GlideRecord('proc_po_item');
			poli.initialize();
			poli.purchase_order = poId;
			poli.model = model;
			poli.list_price = model.cost;
			poli.cost = model.cost;
			poli.ordered_quantity = order;
			poli.total_cost = order * model.cost;
			poli.insert();
		}
	},
	getRefQualCondition: function(stockRuleGr) {
		/*
		 * Description: Used as RefQual for model and stockroom list in Stock Rule when domain separation is enabled
		 */
		if (this.fIsDomainDataSeparationEnabled) {
			return stockRuleGr.getValue('sys_domain') === 'global' ? 'sys_domain=global' : 'sys_domain=' +
				stockRuleGr.sys_domain + '^ORsys_domain=global';
		}
		return '';
	},
	isOTStockrule: function(stockRuleGr) {
		return (!gs.nil(stockRuleGr) && GlidePluginManager.isActive('com.sn_otam') && stockRuleGr.isValidField('ot_stock_rule') && stockRuleGr.ot_stock_rule.toString() === 'true');
	},
	type: 'ProcessStockRules',
});

var StockRuleTransfer = Class.create();
StockRuleTransfer.prototype = {
    initialize : function() {
    },

    /**
     * creates transfer order with a single consumable transfer order line
     */
    consumableTransfer : function(parent, stockroom, model, amount, stockRuleSysId) {
        var to = new GlideRecord("alm_transfer_order");
        to.initialize();
        to.from_stockroom = parent;
        to.to_stockroom = stockroom;
        to.from_location = parent.location;
        to.to_location = stockroom.location;
        to.type = "stock_rule_request";
        if ((GlidePluginManager.isActive('com.sn_eam') || (GlidePluginManager.isActive('com.sn_hamp')))) {
            to.stock_rule_id = stockRuleSysId;
        }
        var transferId = to.insert();

        var tol = new GlideRecord("alm_transfer_order_line");
        tol.initialize();
        tol.transfer_order = transferId;
        tol.model = model;
        tol.quantity_requested = amount;
        tol.insert();
    },

    /**
     * creates transfer order with multiple asset transfer order line
     */
    assetTransfer : function(parent, stockroom, model, amount, stockRuleSysId) {
        var to = new GlideRecord("alm_transfer_order");
        to.initialize();
        to.from_stockroom = parent;
        to.to_stockroom = stockroom;
        to.from_location = parent.location;
        to.to_location = stockroom.location;
        if ((GlidePluginManager.isActive('com.sn_eam') || (GlidePluginManager.isActive('com.sn_hamp')))) {
            to.stock_rule_id = stockRuleSysId;
        }
        var transferId = "";

        var gr = new GlideRecord("alm_asset");
        gr.addQuery("model", model);
        gr.addQuery("stockroom", parent);
        gr.addQuery("install_status", "6");
        gr.addQuery("substatus", "available");
        global.AssetUtils.addAssetQuery(gr, global.AssetUtils.ASSET_FUNCTION_FEATURE.STOCK_RULE);
        gr.query();

        for ( var i = 0; i < amount; ++i) {
            if (gr.next()) {

                if (i == 0) {
                    transferId = to.insert();
                }

                var tol = new GlideRecord("alm_transfer_order_line");
                tol.initialize();
                tol.transfer_order = transferId;
                tol.model = model;
                tol.asset = gr.sys_id;
                tol.insert();
            } else {
                gs.addErrorMessage(gs.getMessage("Parent stockroom ran out of assets to transfer. Aborting transfer"));
                break;
            }
        }
    },

    checkStockroomAvailability: function(stockroom, model, stockRuleGr) {
        // retrieve all matching assets in the stockroom
        var ga = new GlideAggregate("alm_asset");
        ga.addQuery("stockroom", stockroom);
        ga.addQuery("model", model);
        ga.addQuery("install_status", "6");
        ga.addQuery("substatus", "available").addOrCondition("substatus",
            "reserved");
        ga.addQuery('active_to', 'false').addOrCondition('active_to', null);
        ga = this.addOTQuery(ga, stockRuleGr);
        global.AssetUtils.addAssetQuery(ga, global.AssetUtils.ASSET_FUNCTION_FEATURE.STOCK_RULE);

        ga.addAggregate("SUM", "quantity");
        ga.setGroup(false);
        ga.query();

        var count = 0;
        if (ga.next()) {
            var sumStr = ga.getAggregate("SUM", "quantity");
            count = parseInt((gs.nil(sumStr) ? 0 : sumStr), 10);
        }

        return count;
    },

    checkStockroomTransferAvailability: function(stockroom, model, stockRuleGr) {
        // retrieve all matching assets in the stockroom
        var ga = new GlideAggregate("alm_asset");
        ga.addQuery("stockroom", stockroom);
        ga.addQuery("model", model);
        ga.addQuery("install_status", "6");
        ga.addQuery("substatus", "available");
        ga.addQuery('active_to', 'false').addOrCondition('active_to', null);
        ga = this.addOTQuery(ga, stockRuleGr);
        global.AssetUtils.addAssetQuery(ga, global.AssetUtils.ASSET_FUNCTION_FEATURE.STOCK_RULE);

        ga.addAggregate("SUM", "quantity");
        ga.setGroup(false);
        ga.query();

        var count = 0;
        if (ga.next()) {
            var sumStr = ga.getAggregate("SUM", "quantity");
            count = parseInt((gs.nil(sumStr) ? 0 : sumStr), 10);
        }

        return count;
    },

    getTotalRecordCount: function(stockroom, model, stockRuleGr) {
        return this.checkStockroomAvailability(stockroom, model, stockRuleGr) +
            this.transferOrderAvailability(stockroom, model, stockRuleGr);
    },

    /**
     * retrieves record count for assets that are currently in a transfer order
     * going to that stockroom
     */
    transferOrderAvailability: function(stockroom, model, stockRuleGr) {

        var tolsGa = new GlideAggregate('alm_transfer_order_line');
        tolsGa.addQuery('transfer_order.to_stockroom', stockroom);
        tolsGa.addQuery('model', model);
        tolsGa.addQuery('stage', 'NOT IN', 'received,delivered,cancelled');
        if (new ProcessStockRules().isOTStockrule(stockRuleGr)) {
            tolsGa.addQuery('asset.ot_entity', 'true');
        } else if (this.isOTStockrulePropertyEnabled()) {
            tolsGa.addQuery('asset.ot_entity', 'false');
        }
        tolsGa.addAggregate('SUM', 'quantity_calculated');
        tolsGa.setGroup(false);
        tolsGa.query();

        var count = 0;
        if (tolsGa.next()) {
            var sumStr = tolsGa.getAggregate("SUM", "quantity_calculated");
            count = parseInt((gs.nil(sumStr) ? 0 : sumStr), 10);
        }

        return count;
    },

    addOTQuery: function(ga, stockRuleGr) {
        if (!gs.nil(stockRuleGr)) {
            if (new ProcessStockRules().isOTStockrule(stockRuleGr)) {
                ga.addQuery('ot_entity', 'true');
            } else if (this.isOTStockrulePropertyEnabled()) {
                ga.addQuery('ot_entity', 'false');
            }
        }
        return ga;
    },

    isOTStockrulePropertyEnabled: function() {
        return global.AssetUtils.getAssetProperty(global.StockRuleTransfer.ASSET_PROPERTY.OT_STOCK_RULE, 'false').toLowerCase() === 'true';
    },

    type : 'StockRuleTransfer'
};

StockRuleTransfer.ASSET_PROPERTY = {
    OT_STOCK_RULE: 'com.sn_otam.enable_ot_stock_rule'
};

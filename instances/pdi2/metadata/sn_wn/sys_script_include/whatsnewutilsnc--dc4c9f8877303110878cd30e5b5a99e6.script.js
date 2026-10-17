var WhatsNewUtilSNC = Class.create();
WhatsNewUtilSNC.prototype = {
    initialize: function() {},

    insert: function(table, params, useGlideRecord) {
        if (gs.nil(table) || !table.startsWith(WhatsNewCommonConstants.SCOPE) || gs.nil(params))
            return;
        var gr;
        if (useGlideRecord)
            gr = new GlideRecord(table);
        else
            gr = new GlideRecordSecure(table);
        if (!gr.isValid())
            return;
        gr.initialize();
        for (var column in params)
            gr.setValue(column, params[column]);
        return gr.insert();

    },

    update: function(params, gr) {
        if (gs.nil(gr) || gs.nil(params) || !gr.isValidRecord())
            return;
        for (var column in params)
            gr.setValue(column, params[column]);
        return gr.update();
    },

    getRecordByParams: function(table, params, orderBy, desc, useGlideRecord) {
        if (gs.nil(table))
            return;
        var gr;
        if (useGlideRecord)
            gr = new GlideRecord(table);
        else
            gr = new GlideRecordSecure(table);
        if (!gs.nil(params))
            for (var column in params)
                gr.addQuery(column, params[column]);
        if (!gs.nil(orderBy)) {
            if (desc)
                gr.orderByDesc(orderBy);
            else
                gr.orderBy(orderBy);
        }
        gr.query();
        return gr;
    },

    deleteRecordByParams: function(table, params, useGlideRecord) {
        if (gs.nil(table) || !table.startsWith(WhatsNewCommonConstants.SCOPE))
            return;
        var gr;
        if (useGlideRecord)
            gr = new GlideRecord(table);
        else
            gr = new GlideRecordSecure(table);
        if (!gs.nil(params))
            for (var column in params)
                gr.addQuery(column, params[column]);
        gr.query();
        if (gr.hasNext())
            gr.deleteMultiple();
    },

    checkAndInsert: function(table, params, useGlideRecord) {
        if (gs.nil(table) || !table.startsWith(WhatsNewCommonConstants.SCOPE) || gs.nil(params))
            return;
        var gr = this.getRecordByParams(table, params, null, null, useGlideRecord);
        if (!gs.nil(gr) && gr.hasNext())
            return;
        return this.insert(table, params, useGlideRecord);
    },

    getRecordBySysId: function(table, sysId, useGlideRecord) {
        if (gs.nil(table) || gs.nil(sysId))
            return;
        var gr;
        if (useGlideRecord)
            gr = new GlideRecord(table);
        else
            gr = new GlideRecordSecure(table);
        if (!gr.isValid())
            return;
        gr.get(sysId);
        return gr;
    },

    type: 'WhatsNewUtilSNC'
};

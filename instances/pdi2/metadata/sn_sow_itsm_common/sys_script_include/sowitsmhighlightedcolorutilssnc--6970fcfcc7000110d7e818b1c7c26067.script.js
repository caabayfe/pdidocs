var SOWITSMHighlightedColorUtilsSNC = Class.create();
SOWITSMHighlightedColorUtilsSNC.prototype = {
    initialize: function () { },
    /*
    Sample Schema for DEFAULT_HIGHLIGHTED_COLORS
    {"table_name": {
            "field_name": {
                "value 1": {
                    "color": 'high',
                    "status": 'high',
                    "variant": 'tertiary',
                    "icon": '',
                    "show_icon": 'false'
                },
                ...
                ...
                ...
                "value N": {
                    "color": 'moderate',
                    "status": 'moderate',
                    "variant": 'tertiary',
                    "icon": '',
                    "show_icon": 'false'
                }}
    */
    DEFAULT_HIGHLIGHTED_COLORS: {},
    SOW_HIGHLIGHTED_VALUE_CONFIG: "8db6365c535130108e4dddeeff7b1296",

    getHighlightedColor: function (record, field) {
        var table = record.getTableName();
        var value = record.getValue(field);
        var gr = new GlideRecord('sys_highlighted_value_condition');
        var gr1 = gr.addJoinQuery('sys_highlighted_value', 'highlighted_value', 'sys_id');
        gr1.addCondition("table", table);
        gr1.addCondition("field", field);
        var gr2 = gr.addJoinQuery('sys_ux_m2m_highlighted_value_config', 'highlighted_value', 'highlighted_value');
        gr2.addCondition("highlighted_value_config", this.SOW_HIGHLIGHTED_VALUE_CONFIG);
        gr.query();
        while (gr.next()) {
            if (GlideFilter.checkRecord(record, gr.conditions))
                return {
                    "color": gr.color + '',
                    "status": gr.status + '',
                    "variant": gr.variant + '',
                    "icon": gr.icon + '',
                    "show_icon": gr.show_icon + ''
                };
        }
        if (this.DEFAULT_HIGHLIGHTED_COLORS[table] && this.DEFAULT_HIGHLIGHTED_COLORS[table][field])
            return this.DEFAULT_HIGHLIGHTED_COLORS[table][field][value];
        return null;
    },

    getAllHighlightedColors: function (table, field) {
        var gr = new GlideRecord('sys_highlighted_value_condition');
        var gr1 = gr.addJoinQuery('sys_highlighted_value', 'highlighted_value', 'sys_id');
        gr1.addCondition("table", table);
        gr1.addCondition("field", field);
        var gr2 = gr.addJoinQuery('sys_ux_m2m_highlighted_value_config', 'highlighted_value', 'highlighted_value');
        gr2.addCondition("highlighted_value_config", this.SOW_HIGHLIGHTED_VALUE_CONFIG);
        gr.query();
        var highlightedColors = {};
        while (gr.next()) {
            highlightedColors[gr.conditions] = {
                "color": gr.color + '',
                "status": gr.status + '',
                "variant": gr.variant + '',
                "icon": gr.icon + '',
                "show_icon": gr.show_icon + ''
            };
        }
        return highlightedColors;
    },

    type: 'SOWITSMHighlightedColorUtilsSNC'
};

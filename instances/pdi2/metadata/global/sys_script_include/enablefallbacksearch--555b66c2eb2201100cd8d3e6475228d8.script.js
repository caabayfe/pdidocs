var EnableFallbackSearch = Class.create();
EnableFallbackSearch.prototype = {

    ENABLE_FALLBACK_NUM_SEARCH: 'glide.ui.text_search.enable_fallback_number_search',
    FALLBACK_TABLE_LIST: 'glide.ui.text_search.fallback_table_list',
    GLOBAL: 'global',

    initialize: function() {},

    enable: function(lookupTable) {
        var propGr = new GlideRecord("sys_properties");
        propGr.addQuery("name", this.ENABLE_FALLBACK_NUM_SEARCH);
        propGr.query();

        if (propGr.next()) {
            if (propGr.value == 'true')
                this.checkFallbackTableProp(lookupTable);
        } else {
            //insert fallback num search property
            propGr.initialize();
            propGr.sys_scope = this.GLOBAL;
            propGr.name = this.ENABLE_FALLBACK_NUM_SEARCH;
            propGr.value = "true";
            propGr.insert();

            //insert/update fallback table list property
            this.checkFallbackTableProp(lookupTable);
        }
    },

    checkFallbackTableProp: function(lookupTable) {
        var tableProp = new GlideRecord("sys_properties");
        tableProp.addQuery("name", this.FALLBACK_TABLE_LIST);
        tableProp.query();

        if (tableProp.next()) {
            var fallbackTableList = tableProp.getValue('value');
            if (fallbackTableList != null) {
                //check if table exists
                if (!fallbackTableList.includes(lookupTable)) {
                    tableProp.value = fallbackTableList.concat(',', lookupTable);
                    tableProp.update();
                }
            } else {
                //if property value is empty
                tableProp.value = lookupTable;
                tableProp.update();
            }
        } else {
            //insert property
            tableProp.initialize();
            tableProp.sys_scope = this.GLOBAL;
            tableProp.name = this.FALLBACK_TABLE_LIST;
            tableProp.value = lookupTable;
            tableProp.insert();
        }
    },
    type: 'EnableFallbackSearch'
};

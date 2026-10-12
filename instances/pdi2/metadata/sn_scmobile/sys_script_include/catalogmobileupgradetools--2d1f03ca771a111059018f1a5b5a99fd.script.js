var CatalogMobileUpgradeTools = Class.create();
CatalogMobileUpgradeTools.prototype = {
    SYS_SG_ITEM_VIEW_MAP: {},
    SYS_SG_BUTTON_INSTANCE_MAP: {},
    initialize: function() {
        catalogMobileUpgradeUtil = new global.CatalogMobileUpgradeUtil();
        this.initCardMap();
        this.initButtonInstanceMap();
    },

    initCardMap: function() {
        this.SYS_SG_ITEM_VIEW_MAP = {

            //Catalog Recent and Popular Item View
            "40e01e8487703300e0ef0cf888cb0b32": {
                "sys_sg_form_screen": "",
                "sys_sg_master_item": "6cfd9592871c3300e0ef0cf888cb0b63"
            },


            //Incident Item View
            "8240adee87203300e0ef0cf888cb0b7c": {
                "sys_sg_form_screen": "ebb94d9c0f2033001befa68ca8767e4e",
                "sys_sg_master_item": "15200d980f2033001befa68ca8767ec8"
            },

            //REQ -> RITM Item List View

            "924f9fedb79033001befcd58de11a9a1": {
                "sys_sg_form_screen": "",
                "sys_sg_master_item": "28ab6fe1b7d033001befcd58de11a955"
            },

            //REQ Approval Item View

            "74df285387732300e0ef0cf888cb0b79": {
                "sys_sg_form_screen": "c6f277b687fb2300e0ef0cf888cb0bd6",
                "sys_sg_master_item": "31627f7687fb2300e0ef0cf888cb0b42"
            },

            //Request Details Item View

            "b19d17edb79033001befcd58de11a9f5": {
                "sys_sg_form_screen": "276dd3edb79033001befcd58de11a9c7",
                "sys_sg_master_item": ""
            },
            //RITM Approval Details Item View
            "38f8966e87203300e0ef0cf888cb0bb2": {
                "sys_sg_form_screen": "34ad6c5673332300c0b958c234f6a70d",
                "sys_sg_master_item": ""
            },

            //RITM Approval List Item View

            "a97b408673bb2300c0b958c234f6a7ed": {
                "sys_sg_form_screen": "",
                "sys_sg_master_item": "c45b008673bb2300c0b958c234f6a7ef"
            },


            //RITM Item View

            "16d42b7287fb2300e0ef0cf888cb0bdb": {
                "sys_sg_form_screen": "7516f9d787232300e0ef0cf888cb0b4d",
                "sys_sg_master_item": "ca21b55787232300e0ef0cf888cb0b36"
            },

        };
    },


    initButtonInstanceMap: function() {
        this.SYS_SG_BUTTON_INSTANCE_MAP = {
            //Incident reopen
            "308287a3735333001bef3ae234f6a75e": {
                "new_instance": "2913682377a41110ba328f1a5b5a9906"
            },
            //Incident add comment
            "8015f6eb731333001bef3ae234f6a7fe": {
                "new_instance": "7561e0ef77641110ba328f1a5b5a9924"
            },

            //Req apprve w/comments
            "18c7ec4f873f2300e0ef0cf888cb0bbb": {
                "new_instance": "8222586377641110ba328f1a5b5a996f"
            },

            //reject
            "b808608f873f2300e0ef0cf888cb0b31": {
                "new_instance": "0eea5c6b77641110ba328f1a5b5a9955"
            },

            //RITM approve w comments
            "98c8d4d373732300c0b958c234f6a7d1": {
                "new_instance": "6af65c6777641110ba328f1a5b5a998c"
            },

            //RITM reject 

            "6c9c727a73332300c0b958c234f6a793": {
                "new_instance": "3d8cd0eb77641110ba328f1a5b5a9920"
            },
        };
    },

    cleanUpgradeCardViews: function() {
        catalogMobileUpgradeUtil.cleanItemViewUpgrade(this.SYS_SG_ITEM_VIEW_MAP);
    },

    cleanUpgradeInputFormScreen: function() {
        catalogMobileUpgradeUtil.cleanButtonInstanceUpgrade(this.SYS_SG_BUTTON_INSTANCE_MAP);
    },



    type: 'CatalogMobileUpgradeTools'
};

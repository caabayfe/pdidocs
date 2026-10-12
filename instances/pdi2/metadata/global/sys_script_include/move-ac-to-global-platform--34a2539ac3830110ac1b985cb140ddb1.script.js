var move_ac_to_global_platform = Class.create();
move_ac_to_global_platform.prototype = {
    initialize: function() {},
    doMigration: function() {
        var scopePri = new GlideRecord("sys_scope_privilege");
        var uibScreen = new GlideRecord("sys_uib_screen_test_values");
        var appRoute = new GlideRecord("sys_ux_app_route");
        var uxClientScript = new GlideRecord("sys_ux_client_script");
        var dataBroker = new GlideRecord("sys_ux_data_broker_graphql");
        var event = new GlideRecord("sys_ux_event");
        var macroponent = new GlideRecord("sys_ux_macroponent");
        var pageProps = new GlideRecord("sys_ux_page_property");
        var screen = new GlideRecord("sys_ux_screen");
        var screenType = new GlideRecord("sys_ux_screen_type");

        var scope = "a14fcd733b221010ba51ac20e2efc4dd";

        var ids = ["0210c582c3b02010ec37e0dd9740ddde", "065a553b532c0110aab9ddeeff7b123d",
            "1e3a913b532c0110aab9ddeeff7b123f", "2419b88ec3702010ec37e0dd9740dd5a", "66a8b08ec3702010ec37e0dd9740dd0b",
            "937d40e9c3110110d938e4788940ddc5", "a17ad8a1c313101001a6e0dd9740ddd0", "ae4b90e1c313101001a6e0dd9740ddac",
            "ae5064cec3302010ec37e0dd9740dd01", "b4fffc42c3b02010ec37e0dd9740dd86", "baab14e1c313101001a6e0dd9740ddff",
            "beea10e1c313101001a6e0dd9740dd19", "c0cfd0cec3302010ec37e0dd9740dde5", "c41181c2c3b02010ec37e0dd9740dd0a",
            "d52f188ec3302010ec37e0dd9740dd51", "e86145c2c3b02010ec37e0dd9740dd25", "beea10e1c313101001a6e0dd9740dd19"
        ];

        for (var i = 0; ids.length > i; i++) {
            try {
				if (uibScreen.get(ids[i]) && uibScreen.sys_scope == scope) {
                    uibScreen.deleteRecord();
                }
            } catch (e) {
                gs.info("Failed to delete AC record with sysId:" + ids[i]);
            }
        }


        var ids = ["5ccfd0cec3302010ec37e0dd9740ddf0", "62a8b88ec3702010ec37e0dd9740dd50",
            "695dcca9c3110110d938e4788940dd1f", "7cffb482c3b02010ec37e0dd9740dd53", "7d7a5ca1c313101001a6e0dd9740dd16",
            "ea3ad13b532c0110aab9ddeeff7b1296", "7d7a5ca1c313101001a6e0dd9740dd16"
        ];

        for (var i = 0; ids.length > i; i++) {
            try {
				if (appRoute.get(ids[i]) && appRoute.sys_scope == scope) {
                    appRoute.deleteRecord();
                }
            } catch (e) {
                gs.info("Failed to delete AC record with sysId:" + ids[i]);
            }
        }

        var ids = ["0c92d26db7720110ac1b9f78ce11a95a", "16d78554c3312010e777ebbdf040dd9f",
            "1e487377c3110110d938e4788940dd37", "2b1d6056c3210110d938e4788940dd41", "3a269bffb7620110ac1b9f78ce11a9c4",
            "437f585a6f72011089060168e25b36db", "47f70954c3312010e777ebbdf040dd0e", "516f5205c3420110540de4788940dd43",
            "71fcdf8bc3f10110540de4788940dd80", "7258e1bfc3120110540de4788940dd87", "7d233b4e6f72011089060168e25b36a0",
            "8542f8b1c3210110d938e4788940dd3a", "b8cd0f73b7620110ac1b9f78ce11a996", "e9209771eb32201045151ebd985228eb",
            "f30e47b3b7620110ac1b9f78ce11a99b"
        ];

        for (var i = 0; ids.length > i; i++) {
            try {
				if (uxClientScript.get(ids[i]) && uxClientScript.sys_scope == scope) {
                    uxClientScript.deleteRecord();
                }
            } catch (e) {
                gs.info("Failed to delete AC record with sysId:" + ids[i]);
            }
        }

        var ids = ["32a752d2c3210110d938e4788940ddf4", "aa3828926fb2011089060168e25b36b6"];

        for (var i = 0; ids.length > i; i++) {
            try {
				if (dataBroker.get(ids[i]) && dataBroker.sys_scope == scope) {
                    dataBroker.deleteRecord();
                }
            } catch (e) {
                gs.info("Failed to delete AC record with sysId:" + ids[i]);
            }
        }

        var ids = ["128ddca1c3110110d938e4788940ddc7", "166595d6b70201109fda8079ce11a904",
            "2c14e40ec3302010ec37e0dd9740dd71", "59d0c50ec3302010ec37e0dd9740dd66", "fa90db31eb32201045151ebd9852283b"
        ];

        for (var i = 0; ids.length > i; i++) {
            try {
				if (event.get(ids[i]) && event.sys_scope == scope) {
                    event.deleteRecord();
                }
            } catch (e) {
                gs.info("Failed to delete AC record with sysId:" + ids[i]);
            }
        }

        var ids = ["163a913b532c0110aab9ddeeff7b1241", "70fffc42c3b02010ec37e0dd9740dd88",
            "88cfd0cec3302010ec37e0dd9740dde6", "a6a8b88ec3702010ec37e0dd9740dd43", "ed7ad8a1c313101001a6e0dd9740ddd1", "ed7ad8a1c313101001a6e0dd9740ddd1"
        ];

        for (var i = 0; ids.length > i; i++) {
            try {
				if (macroponent.get(ids[i]) && macroponent.sys_scope == scope) {
                    macroponent.deleteRecord();
                }
            } catch (e) {
                gs.info("Failed to delete AC record with sysId:" + ids[i]);
            }
        }

        var ids = ["fa4d4b80b8c4a010f877e0fbf20f34dc"];

        for (var i = 0; ids.length > i; i++) {
            try {
				if (pageProps.get(ids[i]) && pageProps.sys_scope == scope) {
                    pageProps.deleteRecord();
                }
            } catch (e) {
                gs.info("Failed to delete AC record with sysId:" + ids[i]);
            }
        }

        var ids = ["00cfd0cec3302010ec37e0dd9740ddeb", "3cfffc42c3b02010ec37e0dd9740dd8c",
            "6d7a5ca1c313101001a6e0dd9740dd08", "6ea8b88ec3702010ec37e0dd9740dd48", "923a913b532c0110aab9ddeeff7b1243",
            "e15dcca9c3110110d938e4788940dd1a", "0ccf10cec3302010ec37e0dd9740ddba", "2aa8b08ec3702010ec37e0dd9740dd08",
            "615dcc29c3110110d938e4788940dd8b", "70fffc42c3b02010ec37e0dd9740dd84", "da3a913b532c0110aab9ddeeff7b123d",
            "e97ad8a1c313101001a6e0dd9740ddcb", "6d7a5ca1c313101001a6e0dd9740dd08"
        ];

        for (var i = 0; ids.length > i; i++) {
            try {
				if (screen.get(ids[i]) && screen.sys_scope == scope) {
                    screen.deleteRecord();
                }
            } catch (e) {
                gs.info("Failed to delete AC record with sysId:" + ids[i]);
            }
        }

        var ids = ["6356c745c313101001a6e0dd9740dd6f", "ff6aec86c3702010ec37e0dd9740ddc3"];

        for (var i = 0; ids.length > i; i++) {
            try {
				if (scopePri.get(ids[i]) && scopePri.sys_scope == scope) {
                    scopePri.deleteRecord();
                }
            } catch (e) {
                gs.info("Failed to delete AC record with sysId:" + ids[i]);
            }
        }

        var ids = ["e97ad8a1c313101001a6e0dd9740ddcb"];

        for (var i = 0; ids.length > i; i++) {
            try {
                if (screenType.get(ids[i]) && screenType.sys_scope == scope) {
                    screenType.deleteRecord();
                }
            } catch (e) {
                gs.info("Failed to delete AC record with sysId:" + ids[i]);
            }
        }
    },

    type: 'move_ac_to_global_platform'
};

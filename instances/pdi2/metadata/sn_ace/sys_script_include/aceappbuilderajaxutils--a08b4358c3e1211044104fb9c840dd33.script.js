var ACEAppBuilderAjaxUtils = Class.create();
ACEAppBuilderAjaxUtils.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {

    updatePageBundle: function() {
        var pageId = this.getParameter('sysparm_pageId');
        var contentBlockMetadata = new sn_ace.ACEAppBuilderUtilV2()._getContentBlockMetaData(pageId);
        if (contentBlockMetadata && contentBlockMetadata.contentBlocks) {
            var bundle = new global.ACEAppBuilderGlobalScopedUtil().getCompressedPageBundle(contentBlockMetadata.contentBlocks);
            if (bundle) {
                var gr = new GlideRecord('sn_ace_page');
                var result = null;
                if (gr.get(pageId)) {
                    gr.setValue('bundle', bundle);
                    if (gr.canWrite()) {
                        result = gr.update();
                        if (result) {
                            return result;
                        }
                    }
                }
            }
        }
        return null;
    },


    blankTemplatev2Tov3Migration: function() {
        var globalUtils = new global.ACEAppBuilderGlobalScopedUtil();
        var pageId = this.getParameter('sysparm_pageId');
        var clientScriptSysIds = [];
        var pageMacroponentId = '';
        var cbGr = new GlideRecord('sn_ace_page');
        cbGr.get(pageId);
        var scripts = cbGr.getValue('client_scripts');
        if (scripts) {
            clientScriptSysIds = scripts.split(",");
        }
        var routeId = cbGr.getValue('route');
        var routeGr = new GlideRecord('sys_ux_app_route');
        routeGr.get(routeId);
        var screenTypeId = routeGr.getValue('screen_type');
        var sysUxScreenGr = new GlideRecord('sys_ux_screen');
        sysUxScreenGr.addQuery('screen_type', screenTypeId);
        sysUxScreenGr.query();
        while (sysUxScreenGr.next()) {
            pageMacroponentId = sysUxScreenGr.getValue('macroponent');
        }
        var macroponnentGR = new GlideRecord('sys_ux_macroponent');
        macroponnentGR.get(pageMacroponentId);
        var pageComposition = JSON.parse(macroponnentGR.getValue('composition'));
        if (pageComposition.length > 0) {
            var _self = this;
            pageComposition.forEach(function(composition, compositionIndex) {
                if (composition && composition.definition.id == "db78b1b67e04495772a27dc5abc80a49") {
                    composition['eventMappings'] = _self.updateMacroponentComposition(gs.generateGUID(), clientScriptSysIds);
                    composition['preset'] = {
                        "controllerElementId": "ace_default_controller_1",
                        "disabledEventTargetIds": [

                        ],
                        "id": "7ff90b977143a110f877d65dc8b01747"
                    };

                    delete composition['propertyValues']['contentTree'];
                    delete composition['propertyValues']['blockcontext'];
                    pageComposition[compositionIndex] = composition;
                    new global.ACEAppBuilderGlobalScopedUtil().updateRecord("sys_ux_macroponent", pageMacroponentId, {
                        composition: JSON.stringify(pageComposition, null, "\t")
                    });

                }
            });

            var data = [{
                "definition": {
                    "id": "88a307df7103a110f877d65dc8b01791",
                    "type": "CONTROLLER"
                },
                "dependencies": {},
                "elementId": "ace_default_controller_1",
                "elementLabel": "ACE Default Controller 1",
                "eventMappings": [

                ],
                "inputValues": {
                    "page": {
                        "type": "JSON_LITERAL",
                        "value": pageId
                    },
                    "pageParams": {
                        "binding": {
                            "address": [
                                "pageParams"
                            ]
                        },
                        "type": "STATE_BINDING"
                    }
                },
                "readEvaluationMode": "EAGER"
            }];


            var internalEventMapping = {
                "MACROPONENT_READY": [{
                    "broker": null,
                    "clientScript": null,
                    "conditional": null,
                    "declarativeAction": null,
                    "event": {
                        "apiName": "sn_uxf.MACROPONENT_STATE_UPDATE_REQUESTED",
                        "payload": {
                            "script": {
                                "apiVersion": "1.0.0",
                                "controllerElementId": null,
                                "inlineScript": "/**\n * @param {params} params\n * @param {api} params.api\n * @param {any} params.event\n * @param {any} params.imports\n */\nfunction evaluateEvent({\n    api,\n    event\n}) {\n    var res = {};\n    Object.keys(api.context.props).forEach(function(propName) {\n        if (api.context.props[propName])\n            res[propName] = api.context.props[propName];\n    });\n    return {\n        propName: \"pageParams\",\n        value: res\n    };\n}",
                                "scriptSysId": null,
                                "target": null
                            },
                            "type": "CLIENT_TRANSFORM_SCRIPT"
                        },
                        "sysId": "32408b42ff7a10109046e490703bf176"
                    },
                    "operation": null,
                    "targetId": "cljiccstjjhhaaaaggrddbhhzrlcajjms",
                    "type": "EVENT"
                }],
                "sn_ace.ACE_CONTROLLER_UPDATED": [{
                    "broker": null,
                    "clientScript": null,
                    "conditional": null,
                    "declarativeAction": null,
                    "event": null,
                    "operation": {
                        "dataBrokerId": "88a307df7103a110f877d65dc8b01791",
                        "operationName": "ACE_CONTROLLER_UPDATED",
                        "parentResourceId": "ace_default_controller_1",
                        "payload": {
                            "container": {
                                "eventName": {
                                    "binding": {
                                        "address": [
                                            "eventName"
                                        ]
                                    },
                                    "type": "EVENT_PAYLOAD_BINDING"
                                },
                                "eventPayload": {
                                    "binding": {
                                        "address": [
                                            "eventPayload"
                                        ]
                                    },
                                    "type": "EVENT_PAYLOAD_BINDING"
                                }
                            },
                            "type": "MAP_CONTAINER"
                        }
                    },
                    "targetId": "clilddhaffbaaaaggccddbhhxahhgggqdbg",
                    "type": "DATABROKER_OP"
                }]
            };

            globalUtils.updateRecord("sys_ux_macroponent", pageMacroponentId, {
                state_properties: JSON.stringify([{
                    "fieldType": "json",
                    "initialValue": {
                        "type": "JSON_LITERAL",
                        "value": {}
                    },
                    "name": "pageParams",
                    "shape": "",
                    "valueType": "json"
                }], null, "\t"),
                data: JSON.stringify(data, null, "\t"),
                internal_event_mappings: JSON.stringify(internalEventMapping, null, "\t"),
                props: JSON.stringify([], null, "\t")
            });
            globalUtils.updateHandeledEventForV2toV3TemplateMigration(pageMacroponentId);
            cbGr.template.setDisplayValue('BlankTemplateV3');
            if (cbGr.canWrite()) {
                var result = cbGr.update();
                if (result) {
                    return result;
                }
            }


        }

        return null;
    },

    updateMacroponentComposition: function(eventMappingId, clientScriptSysIds) {
        var macroponentEventMapping = [];
        if (clientScriptSysIds && clientScriptSysIds.length > 0) {
            var _self = this;
            clientScriptSysIds.forEach(function(sysId) {
                macroponentEventMapping.push({
                    "eventMappingId": eventMappingId,
                    "sourceEventApiName": "sn_ace.ACE_ACTION_PERFORMED",
                    "sourceEventDefinition": {
                        "apiName": "sn_ace.ACE_ACTION_PERFORMED",
                        "id": null,
                        "type": "UXEVENT"
                    },
                    "targets": [{
                        "broker": null,
                        "clientScript": {
                            "sysId": sysId
                        },
                        "targetId": _self.getGUID(),
                        "type": "CLIENT_SCRIPT"
                    }]
                });

            });
            return macroponentEventMapping;

        }

    },

    getGUID: function() {
        return 'xxxx-xxxx-yyyyyy-xxxx-yyyyxxyy'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

    migrateExperienceToACEV2: function() {
        var appId = this.getParameter('app_id');
        var result = new sn_ace.ACEAppBuilderUtilV2().migrateToAceRenderer(appId);
        if (result) {
            return result;
        }
    }

});

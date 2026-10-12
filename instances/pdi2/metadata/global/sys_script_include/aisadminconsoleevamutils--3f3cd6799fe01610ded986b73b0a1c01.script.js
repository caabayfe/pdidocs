var AISAdminConsoleEvamUtils = Class.create();
AISAdminConsoleEvamUtils.prototype = {
    initialize: function() {
        this.SEARCH_APP_CONFIG_TABLE = 'sys_search_context_config';
        this.PORTAL_TABLE = 'sp_portal';
        this.WORKSPACE_REGISTRY_TABLE = 'sys_ux_page_registry';
        this.MOBILE_SEARCH_TABLE = 'sys_sg_global_search';
        this.VA_SEARCH_TABLE = 'sys_cs_context_profile_search';
        this.EVAM_DEFINITION_TABLE = 'sys_ux_composite_data';
        this.EVAM_BUNDLE_TABLE = 'sys_ux_composite_data_template_predicate_bundle';
        this.EVAM_BUNDLE_M2M_TABLE = 'sys_ux_composite_data_m2m_predicate_bundle';
        this.EVAM_VIEW_CONFIG_TABLE = 'sys_ux_composite_data_template_predicate';
        this.EVAM_VIEW_TEMPLATE = 'sys_ux_composite_data_template';
        this.ACTION_ASSIGNMENT_M2M_TABLE = 'sys_ux_predicate_m2m_action_assignment';
    },

    //Update EVAM defnition for the app
    updateAppEVAM: function(appId, createNewEvam, newEvamDef) {
        var appGr = this.getAppGr(appId);
        if (!appGr)
            return null;

        switch (appGr.table) {
            case this.PORTAL_TABLE:
                if (createNewEvam)
                    newEvamDef = this._createEVAMDefinition(newEvamDef);
                var portalGR = new GlideRecord(this.PORTAL_TABLE);
                if (portalGR.get(appId)) {
                    portalGR.search_results_configuration = newEvamDef;
                    portalGR.update();
                }
                return newEvamDef;
            case this.VA_SEARCH_TABLE:
                if (createNewEvam)
                    newEvamDef = this._createEVAMDefinition(newEvamDef);
                var vaGR = new GlideRecord(this.VA_SEARCH_TABLE);
                if (vaGR.get(appId)) {
                    vaGR.search_result_config = newEvamDef;
                    vaGR.update();
                }
                return newEvamDef;

            default:
                if (createNewEvam)
                    newEvamDef = this._createEVAMDefinition(newEvamDef);
                var app = new GlideRecord(this.SEARCH_APP_CONFIG_TABLE);
                if (app.get(appId)) {
                    app.evam_definition = newEvamDef;
                    app.update();
                    return newEvamDef;
                }
        }
    },

    getAppGr: function(appId) {
        if (!appId)
            return null;

        var appTables = [this.SEARCH_APP_CONFIG_TABLE, this.PORTAL_TABLE, this.WORKSPACE_REGISTRY_TABLE, this.MOBILE_SEARCH_TABLE, this.VA_SEARCH_TABLE];

        for (var i = 0; i < appTables.length; i++) {
            var appGr = new GlideRecord(appTables[i]);
            if (appGr.get(appId))
                return {
                    table: appTables[i],
                    gr: appGr
                };
        }
        gs.info('[AIS] App not found: {0}', appId);

        return null;
    },

    //Create new EVAM definition and create and link new bundle to it
    _createEVAMDefinition: function(name) {
        var evamGr = new GlideRecord(this.EVAM_DEFINITION_TABLE);
        evamGr.initialize();
        evamGr.name = name;
        var evamId = evamGr.insert();

        var bundleGr = new GlideRecord(this.EVAM_BUNDLE_TABLE);
        bundleGr.initialize();
        bundleGr.name = name + ' Bundle';
        var bundleId = bundleGr.insert();

        var m2mGr = new GlideRecord(this.EVAM_BUNDLE_M2M_TABLE);
        m2mGr.initialize();
        m2mGr.dataset = evamId;
        m2mGr.predicate_bundle = bundleId;
        m2mGr.order = 100;
        m2mGr.insert();

        return evamId;
    },

    //Create new EVAM view config
    createEVAMConfig: function(name, predicate) {
        var template = this._createStarterViewTemplate(name + " template");

        var evamConfigGr = new GlideRecord(this.EVAM_VIEW_CONFIG_TABLE);
        evamConfigGr.initialize();
        evamConfigGr.name = name;
        evamConfigGr.predicate_bundle = predicate;
        evamConfigGr.order = 100;
        evamConfigGr.ux_template = template;
        // add custom fields as default that are to be removed in view template screen if identified the view config is genius
        evamConfigGr.custom_field_list = "ai_search_teaser_title,ai_search_teaser_text,document_index,navigation_url";

        var viewConfigId = evamConfigGr.insert();

        if (viewConfigId) {
            // Link navigation to the newly created View Config
            var linkStatus = this._linkNavigationToViewConfig(viewConfigId);
            if (!linkStatus) {
                gs.error('Failed to link navigation to View Config');
            }
        } else {
            gs.error('Failed to create EVAM View Config');
        }

        return viewConfigId;
    },

    createBlankViewTemplateAndLink: function(viewConfigId, viewTemplateName) {
        var status = 'Error';
        var items = [];
        var message = '';
        try {
            // Create new view template
            var templateId = this._createStarterViewTemplate(viewTemplateName);
            if (!templateId) {
                message = 'Failed to create view template with name: ' + viewTemplateName;
                throw new Error(message);
            }

            // Link navigation to view config
            var linkStatus = this._linkNavigationToViewConfig(viewConfigId);
            if (!linkStatus) {
                message = 'Failed to link navigation to View Config';
                throw new Error(message);
            }

            // Link the newly created template to the sys_ux_composite_data_template_predicate table
            var evamConfigGr = new GlideRecord(this.EVAM_VIEW_CONFIG_TABLE);
            if (evamConfigGr.get(viewConfigId)) {
                evamConfigGr.ux_template = templateId; // Link the new template to the record
                evamConfigGr.update(); // Update the record with the new UX template

                message = 'Template created and linked successfully';
                status = 'Success';
                items.push({
                    status: 'positive',
                    icon: 'check-outline',
                    content: {
                        type: 'html',
                        value: '<span>' + gs.getMessage(message) + '</span>'
                    },
                    action: {
                        type: 'dismiss'
                    }
                });
            } else {
                message = 'View Config record not found';
                throw new Error(message);
            }
        } catch (error) {
            message = 'An error occurred while creating and linking the view template';
            gs.error('An error occurred in createBlankViewTemplateAndLink: ' + error.message);
            items.push({
                status: 'critical',
                icon: 'circle-exclamation-outline',
                content: {
                    type: 'html',
                    value: '<span>' + gs.getMessage(message) + '</span>'
                },
                action: {
                    type: 'dismiss'
                }
            });
        }

        return {
            status: status,
            items: items
        };
    },

    createCopyOfViewTemplateAndLink: function(viewConfigId) {
        var status = 'Error';
        var items = [];
        var message = '';
        try {
            // Get the current ux_template from the sys_ux_composite_data_template_predicate record
            var evamConfigGr = new GlideRecord(this.EVAM_VIEW_CONFIG_TABLE);

            if (evamConfigGr.get(viewConfigId)) {
                var uxTemplateId = evamConfigGr.getValue('ux_template');

                // Get the actual template from the sys_ux_composite_data_template table
                var templateGr = new GlideRecord(this.EVAM_VIEW_TEMPLATE);

                if (templateGr.get(uxTemplateId)) {
                    var existingTemplate = templateGr.getValue('template');
                    var templateName = templateGr.getValue('name') + ' - Copy'; // Create a name for the new template

                    // Create a copy of the template
                    var newTemplateGr = new GlideRecord(this.EVAM_VIEW_TEMPLATE);
                    newTemplateGr.initialize();
                    newTemplateGr.name = templateName;
                    newTemplateGr.template = existingTemplate; // Copy the existing template content
                    var newTemplateId = newTemplateGr.insert(); // Insert the new record and get its sys_id

                    // Link the new template to the sys_ux_composite_data_template_predicate record
                    evamConfigGr.ux_template = newTemplateId;
                    evamConfigGr.update();

                    message = 'Template copied and linked successfully';
                    status = 'Success';
                    items.push({
                        status: 'positive',
                        icon: 'check-outline',
                        content: {
                            type: 'html',
                            value: '<span>' + gs.getMessage(message) + '</span>'
                        },
                        action: {
                            type: 'dismiss'
                        }
                    });
                } else {
                    message = 'Template not found';
                    items.push({
                        status: 'critical',
                        icon: 'circle-exclamation-outline',
                        content: {
                            type: 'html',
                            value: '<span>' + gs.getMessage(message) + '</span>'
                        },
                        action: {
                            type: 'dismiss'
                        }
                    });
                    throw new Error(message);
                }
            } else {
                message = 'View Config record not found';
                throw new Error(message);
            }
        } catch (error) {
            message = 'An error occurred while creating a copy of the view template: ' + error.message;
            gs.error('An error occurred in createCopyOfViewTemplateAndLink: ' + error.message);
            items.push({
                status: 'critical',
                icon: 'circle-exclamation-outline',
                content: {
                    type: 'html',
                    value: '<span>' + gs.getMessage(message) + '</span>'
                },
                action: {
                    type: 'dismiss'
                }
            });
        }

        return {
            status: status,
            items: items
        };
    },

    //Create new view template
    _createStarterViewTemplate: function(name) {
        var default_template = JSON.stringify({
            component: "",
            staticValues: {},
            mappings: {},
            actionMappings: {
                clickAction: "navigation"
            }
        }, null, 2);
        var templateGr = new GlideRecord(this.EVAM_VIEW_TEMPLATE);
        templateGr.initialize();
        templateGr.name = name;
        templateGr.template = default_template;
        return templateGr.insert();
    },

    _linkNavigationToViewConfig: function(viewConfigId) {
        try {
            var m2mGr = new GlideRecord(this.ACTION_ASSIGNMENT_M2M_TABLE);
            m2mGr.addQuery('predicate', viewConfigId);
            m2mGr.addQuery('declarative_action_assignment', 'd46f400473211010c342d5fdbdf6a7cf'); // Check if navigation is already present
            m2mGr.query();

            if (!m2mGr.hasNext()) { // Only insert if navigation action is not already linked
                var newM2mGr = new GlideRecord(this.ACTION_ASSIGNMENT_M2M_TABLE);
                newM2mGr.initialize();
                newM2mGr.predicate = viewConfigId;
                newM2mGr.declarative_action_assignment = 'd46f400473211010c342d5fdbdf6a7cf'; // Link navigation action
                return newM2mGr.insert();
            }

            gs.info('Navigation action assignment is already present.');
            return true;
        } catch (error) {
            gs.error('An error occurred in _linkNavigationToViewConfig: ' + error.message);
            throw error;
        }
    },

    updateViewConfig: function(id, active) {
        var arr = [];
        var configGr = new GlideRecord(this.EVAM_VIEW_CONFIG_TABLE);
        if (configGr.get(id)) {
            configGr.active = active;
            var msg = active ? ' activated' : ' deactivated';
            configGr.update();

            arr.push({
                'type': 'info',
                'message': 'View config ' + configGr.name + msg
            });
        }
        return arr;
    },

    deleteViewConfig: function(id) {
        var configGr = new GlideRecord(this.EVAM_VIEW_CONFIG_TABLE);
        if (configGr.get(id))
            configGr.deleteRecord();
    },

    //Copy EVAM view config and template
    copyEVAMConfig: function(name, predicate, configToCopy) {
        var configGr = new GlideRecord(this.EVAM_VIEW_CONFIG_TABLE);
        if (configGr.get(configToCopy)) {
            var tId = '';
            var tempGr = new GlideRecord(this.EVAM_VIEW_TEMPLATE);
            if (tempGr.get(configGr.ux_template)) {
                tempGr.name = name + " template";
                tId = tempGr.insert();
            }
            configGr.name = name;
            configGr.predicate_bundle = predicate;
            configGr.ux_template = tId;
            return configGr.insert();
        }
    },

    updateViewConfigFieldsAndViewTemplate: function(input) {
        var status = 'Error';
        var items = [];
        var message = '';

        try {
            var fieldsUpdated = this.updateFields(input);
            if (fieldsUpdated) {
                var templateUpdated = this.updateViewTemplate(input);
                if (templateUpdated) {
                    message = 'Configuration updated successfully';
                    status = 'Success';

                    items.push({
                        status: 'positive',
                        icon: 'check-outline',
                        content: {
                            type: 'html',
                            value: '<span>' + gs.getMessage(message) + '</span>'
                        },
                        action: {
                            type: 'dismiss'
                        }
                    });
                } else {
                    message = 'Failed to update template';
                    throw new Error(message);
                }
            } else {
                message = 'Failed to update fields; aborting template update';
                throw new Error(message);
            }
        } catch (error) {
            message = 'An error occurred while updating the configuration: ' + error.message;
            gs.error('An error occurred in updateViewConfigFieldsAndViewTemplate: ' + error.message);
            items.push({
                status: 'critical',
                icon: 'circle-exclamation-outline',
                content: {
                    type: 'html',
                    value: '<span>' + gs.getMessage(message) + '</span>'
                },
                action: {
                    type: 'dismiss'
                }
            });
        }

        return {
            status: status,
            items: items
        };
    },

    updateFields: function(input) {
        try {
            var gr = new GlideRecord(this.EVAM_VIEW_CONFIG_TABLE);

            if (!gr.get(input.viewConfigId)) {
                throw new Error('Record not found.');
            }

            // Handle custom fields
            if (input.updates.customFields) {
                var currentCustomFieldList = gr.custom_field_list ? gr.custom_field_list.split(',') : [];
                var newCustomFields = input.updates.customFields.split(',');

                for (var i = 0; i < newCustomFields.length; i++) {
                    var newField = newCustomFields[i].trim();
                    if (newField && currentCustomFieldList.indexOf(newField) === -1) {
                        currentCustomFieldList.push(newField);
                    }
                }

                gr.custom_field_list = currentCustomFieldList.join(',');
            }

            // Handle model and table fields
            if (input.updates.modelFields || input.updates.tableFields) {
                var currentFieldList = gr.field_list ? gr.field_list.split(',') : [];
                var newFields = (input.updates.modelFields + ',' + input.updates.tableFields).split(',');

                for (var j = 0; j < newFields.length; j++) {
                    var newFieldEntry = newFields[j].trim();
                    if (newFieldEntry && currentFieldList.indexOf(newFieldEntry) === -1) {
                        currentFieldList.push(newFieldEntry);
                    }
                }

                gr.field_list = currentFieldList.join(',');
            }

            if (input.clearCustomFields) {
                gr.custom_field_list = '';
            }

            var updated = gr.update();
            if (!updated) {
                throw new Error('Failed to update the record');
            }

            gs.info('Record updated successfully with new custom_field_list: ' + gr.custom_field_list + ' and field_list: ' + gr.field_list);
            return true;

        } catch (error) {
            gs.error('An error occurred while updating fields: ' + error.message);
            return false;
        }
    },

    updateViewTemplate: function(input) {
        try {
            var grPredicate = new GlideRecord(this.EVAM_VIEW_CONFIG_TABLE);

            if (!grPredicate.get(input.viewConfigId)) {
                throw new Error('Predicate record not found.');
            }

            var templateId = grPredicate.ux_template.toString(); // Get the associated template ID

            var grTemplate = new GlideRecord(this.EVAM_VIEW_TEMPLATE);

            if (!grTemplate.get(templateId)) {
                throw new Error('Template record not found.');
            }

            // Parse the JSON string into an object and then stringify it with formatting
            var formattedJsonString;
            try {
                var jsonObj = JSON.parse(input.jsonString); // Parse the input JSON string to an object
                formattedJsonString = JSON.stringify(jsonObj, null, 2); // Format it with indentation
            } catch (jsonError) {
                throw new Error('Invalid JSON string provided: ' + jsonError.message);
            }

            grTemplate.template = formattedJsonString; // Set the formatted JSON string to the template

            if (!grTemplate.update()) {
                throw new Error('Failed to update the template.');
            }

            gs.info('Template updated successfully.');
            return true;

        } catch (error) {
            gs.error('An error occurred while updating the template: ' + error.message);
            return false;
        }
    },

    //Link EVAM bundle
    linkEvamBundle: function(evamId, bundle, order) {
        var m2mEvam = new GlideRecord('sys_ux_composite_data_m2m_predicate_bundle');
        m2mEvam.addQuery('dataset', evamId);
        m2mEvam.addQuery('predicate_bundle', bundle);
        m2mEvam.query();
        if (!m2mEvam.next()) {
            m2mEvam.initialize();
            m2mEvam.dataset = evamId;
            m2mEvam.predicate_bundle = bundle;
            m2mEvam.order = order;
            m2mEvam.insert();
        }
    },
    linkExistingViewTemplate: function(viewConfigId, templateId) {
        var gr = new GlideRecord(this.EVAM_VIEW_CONFIG_TABLE);
        if (!gr.get(viewConfigId)) {
            throw new Error('Predicate record not found.');
        }
        gr.ux_template = templateId;
        if (!gr.update()) {
            throw new Error('Failed to link the view template.');
        }
        return true;
    },

    // Only keys present in `fields` are written.
    updateViewConfigFields: function(viewConfigId, fields) {
        var gr = new GlideRecord(this.EVAM_VIEW_CONFIG_TABLE);
        if (!gr.get(viewConfigId)) {
            throw new Error('Predicate record not found.');
        }
        fields = fields || {};
        if (fields.name !== undefined) gr.setValue('name', fields.name);
        if (fields.order !== undefined) gr.setValue('order', fields.order);
        if (fields.condition !== undefined) gr.setValue('condition', fields.condition);
        if (fields.table !== undefined) gr.setValue('table', fields.table);
        if (!gr.update()) {
            throw new Error('Failed to update the view config fields.');
        }
        return true;
    },

    // jsonString must be valid JSON — the before-insert BR parses it.
    createViewTemplate: function(name, jsonString) {
        if (!name) {
            throw new Error('createViewTemplate: name is required');
        }
        var templateGr = new GlideRecord(this.EVAM_VIEW_TEMPLATE);
        templateGr.initialize();
        templateGr.name = name;
        templateGr.template = jsonString || '{}';
        var templateId = templateGr.insert();
        if (!templateId) {
            throw new Error('createViewTemplate: insert failed');
        }
        return {
            templateId: templateId
        };
    },

    createViewConfig: function(params) {
        params = params || {};
        if (!params.evamDefId) {
            throw new Error('createViewConfig: evamDefId is required');
        }
        if (!params.table) {
            throw new Error('createViewConfig: table is required');
        }
        if (!params.name) {
            throw new Error('createViewConfig: name is required');
        }
        if (!params.templateId) {
            throw new Error('createViewConfig: templateId is required');
        }

        var bundleId = params.bundleId || this._resolveOrCreateBundle(params.evamDefId);

        var gr = new GlideRecord(this.EVAM_VIEW_CONFIG_TABLE);
        gr.initialize();
        gr.setValue('name', params.name);
        gr.setValue('table', params.table);
        if (params.condition) {
            gr.setValue('condition', params.condition);
        }
        gr.setValue('ux_template', params.templateId);
        gr.setValue('predicate_bundle', bundleId);
        gr.setValue('order', (params.order === undefined || params.order === null) ? 100 : parseInt(params.order, 10));
        if (params.tableFields) {
            gr.setValue('field_list', params.tableFields);
        }
        if (params.customFields) {
            gr.setValue('custom_field_list', params.customFields);
        }
        gr.setValue('active', true);

        var viewConfigId = gr.insert();
        if (!viewConfigId) {
            throw new Error('createViewConfig: predicate insert failed');
        }

        this._linkNavigationToViewConfig(viewConfigId);

        return {
            viewConfigId: viewConfigId,
            bundleId: bundleId
        };
    },

    _resolveOrCreateBundle: function(evamDefId) {
        var m2m = new GlideRecord(this.EVAM_BUNDLE_M2M_TABLE);
        m2m.addQuery('dataset', evamDefId);
        m2m.orderBy('order');
        m2m.setLimit(1);
        m2m.query();
        if (m2m.next()) {
            return m2m.getValue('predicate_bundle');
        }

        var bundleGr = new GlideRecord(this.EVAM_BUNDLE_TABLE);
        bundleGr.initialize();
        bundleGr.name = 'AISA Result Cards';
        var bundleId = bundleGr.insert();
        if (!bundleId) {
            throw new Error('_resolveOrCreateBundle: bundle insert failed');
        }

        this.linkEvamBundle(evamDefId, bundleId, 100);
        return bundleId;
    },

    type: 'AISAdminConsoleEvamUtils'
};

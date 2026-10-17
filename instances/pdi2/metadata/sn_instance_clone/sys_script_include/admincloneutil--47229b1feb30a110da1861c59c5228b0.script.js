var AdminCloneUtil = Class.create();
AdminCloneUtil.prototype = {
    initialize: function() {
        this.PROFILE_EXCLUSION_KEY = 'exclusion';
        this.PROFILE_PRESERVER_KEY = 'preserver';
        this.PROFILE_CLEANUP_SCRIPT_KEY = 'cleanup_script';
        this.cloneRestService = new CloneRestService();
        this._appsDataApi = new sn_appclient.AppsDataAPI();
        this.sevenDaysAgo = gs.beginningOfLast7Days();
    },

	_getStoreAppSysId: function() {
		var storeGr = new GlideRecord('sys_store_app');
		if(storeGr.get('scope','sn_instance_clone')) {
			return storeGr.getUniqueValue();
		}
		return 'global';
	},

	closeIframeByUser: function() {
		var result = {
            status: 200,
            body: {
                ready: false,
				cancelled: true
            }
        };
		return result;
	},

	getUrlForIFrame: function() {
		var result = {
            status: 400,
            body: {
				isError: true,
                url: ''
            }
        };
		try {
			result.body.url = this.getiFrameUrl();
			result.status = 200;
			result.body.isError = false;
		}
		catch(e) {
			gs.error("Error fetching iFrameUrl: "+e.message);
		}
		return result;
	},

    checkOauthSetupForInstance: function(instanceUrl) {
        var result = {
            status: 400,
            body: {
                ready: false
            }
        };
        var providerName = CloneConstants.oAuthAppConstants.APP_PROVIDER_NAME + ' - ' + this._extractHost(instanceUrl);
        var providerGr = new GlideRecord('oauth_entity');
        providerGr.addQuery('name', providerName);
        providerGr.setLimit(1);
        providerGr.query();
        if (!providerGr.next()) {
			result.status = 200;
            return result;
		}
        var profileGr = new GlideRecord('oauth_entity_profile');
        profileGr.addQuery('oauth_entity', providerGr.getValue('sys_id'));
        profileGr.addQuery('default', true);
        profileGr.setLimit(1);
        profileGr.query();
        if (!profileGr.next()) {
			result.status = 200;
            return result;
		}
        result.status = 200;
        result.body.ready = true;
        result.body.oauth_entity_profile = profileGr.getUniqueValue();
        return result;

    },

    createOAuthAppClient: function(sourceInstanceUrl) {
        var LOG_PREFIX = '[AdminCloneUtil.createOAuthAppClient] ';
        var result = {
            status: 400,
            body: {
                error: true,
                message: ''
            }
        };
        try {
            // --- 1. Input validation ---
            if (gs.nil(sourceInstanceUrl)) {
                result.body.message = gs.getMessage('Source instance URL is required');
                return result;
            }
            sourceInstanceUrl = gs.base64Decode(sourceInstanceUrl);
            var APP_NAME = CloneConstants.oAuthAppConstants.APP_CLIENT_NAME;
            var APP_TYPE = CloneConstants.oAuthAppConstants.APP_CLIENT_TYPE;
            var newRedirectUrl = sourceInstanceUrl + CloneConstants.oAuthAppConstants.OAUTH_REDIRECT_URI;

            // --- 2. Existing OAuth client? Append redirect URL and return its client_id ---
            var existing = new GlideRecord('oauth_entity');
            existing.addQuery('name', APP_NAME);
            existing.setLimit(1);
            existing.query();

            if (existing.next()) {
                this._appendRedirectUrl(existing, newRedirectUrl);
                return this._buildSuccess(existing);
            }

            // --- 3. Otherwise create a fresh OAuth client via platform API ---
            var registry = {
                name: APP_NAME,
                type: APP_TYPE,
                public_client: true,
                redirect_url: newRedirectUrl,
				logo_url: CloneConstants.oAuthAppConstants.LOGO_NAME,
                default_grant_type: CloneConstants.oAuthAppConstants.DEFAULT_GRANT_TYPE,
                token_format: CloneConstants.oAuthAppConstants.TOKEN_FORMAT,
                sub_claim: CloneConstants.oAuthAppConstants.SUB_CLAIM,
                access_token_lifespan: CloneConstants.oAuthAppConstants.ACCESS_TOKEN_LIFESPAN,
                refresh_token_lifespan: CloneConstants.oAuthAppConstants.REFRESH_TOKEN_LIFESPAN,
				sys_scope: this._getStoreAppSysId()
            };

            var res = new sn_auth.OAuthAppAPI().createOAuthApp(JSON.stringify(registry));

            // Platform returns a Java response object — use its accessors
            var status = (typeof res.getStatus === 'function') ? String(res.getStatus()) : '';
            var message = (typeof res.getMessage === 'function') ? String(res.getMessage()) : '';

            // sys_id accessor name varies by platform release — try both, then fall back to toString
            var newId = '';
            if (typeof res.getID === 'function') newId = String(res.getID() || '');
            if (!newId && typeof res.getId === 'function') newId = String(res.getId() || '');
            if (!newId) {
                var match = String(res).match(/ID:([0-9a-f]{32})/);
                if (match) newId = match[1];
            }

            if (status !== 'SUCCESS' || gs.nil(newId)) {
                result.body.message = gs.getMessage('Failed to create OAuth client: {0}',(message || 'unknown error'));
                gs.error(LOG_PREFIX + 'createOAuthApp failed. status=' + status + ' message=' + message + ' raw=' + res);
                return result;
            }

            // --- 4. Read credentials off the freshly created row ---
            var created = new GlideRecord('oauth_entity');
            if (!created.get(newId) || gs.nil(created.getValue('client_id'))) {
                result.body.message = gs.getMessage('OAuth client was created but credentials are missing on the record');
                gs.error(LOG_PREFIX + 'oauth_entity sys_id=' + newId + ' has empty client_id.');
                return result;
            }

            return this._buildSuccess(created);
        } catch (ex) {
			result.status = 200;
            gs.error(LOG_PREFIX + ex.message + ' | Line: ' + ex.lineNumber);
            result.body.message = gs.getMessage('Exception while creating OAuth client: {0}',ex.message);
            return result;
        }
    },

    // Idempotent: appends newRedirectUrl to oauth_entity.redirect_url only if absent.
    // redirect_url is a space-separated list per OAuth 2.0 (RFC 6749).
    _appendRedirectUrl: function(oauthGr, newRedirectUrl) {
        var current = (oauthGr.getValue('redirect_url') || '').trim();
        var urls = current ? current.split(/\s+/) : [];

        if (urls.indexOf(newRedirectUrl) !== -1) {
            return;
        }

        urls.push(newRedirectUrl);
        oauthGr.redirect_url = urls.join(',');
        oauthGr.update();
    },

    _buildSuccess: function(oauthGr) {
        return {
            status: 200,
            body: {
                error: false,
                sys_id: oauthGr.getValue('sys_id'),
                client_id: oauthGr.getValue('client_id'),
                redirect_url: oauthGr.getValue('redirect_url') || ''
            }
        };
    },

    createOAuthAppProvider: function(sourceInstanceUrl, targetInstanceUrl, clientId) {
        var LOG_PREFIX = '[AdminCloneUtil.createOAuthAppProvider] ';
        var result = {
            status: 400,
            body: {
                error: true,
                message: ''
            }
        };
        try {
            // --- 1. Input validation ---
            if (gs.nil(sourceInstanceUrl) || gs.nil(targetInstanceUrl) || gs.nil(clientId)) {
                result.body.message = gs.getMessage('sourceInstanceUrl, targetInstanceUrl and clientId are required');
                return result;
            }

            // Provider must be unique per target — auth_url/token_url differ per target,
            // so a fixed shared name would collide on the platform's unique-name constraint.
            var providerName = CloneConstants.oAuthAppConstants.APP_PROVIDER_NAME + ' - ' + this._extractHost(targetInstanceUrl);
            var authUrl = targetInstanceUrl + CloneConstants.oAuthAppConstants.OAUTH_AUTH_URI;
            var tokenUrl = targetInstanceUrl + CloneConstants.oAuthAppConstants.OAUTH_TOKEN_URI;
            var redirectUrl = sourceInstanceUrl + CloneConstants.oAuthAppConstants.OAUTH_REDIRECT_URI;

            // --- 2. Existing provider for this target? Sync drift and return ---
            var existing = new GlideRecord('oauth_entity');
            existing.addQuery('name', providerName);
            existing.setLimit(1);
            existing.query();

            if (existing.next()) {
                this._syncProviderFields(existing, {
                    client_id: clientId,
                    auth_url: authUrl,
                    token_url: tokenUrl,
                    redirect_url: redirectUrl
                });
                return this._buildProviderSuccess(existing);
            }

            // --- 3. Otherwise create a fresh OAuth provider via platform API ---
            var registry = {
                name: providerName,
                type: CloneConstants.oAuthAppConstants.APP_PROVIDER_TYPE,
                public_client: true,
                redirect_url: redirectUrl,
                default_grant_type: CloneConstants.oAuthAppConstants.DEFAULT_GRANT_TYPE,
                client_id: clientId,
                auth_url: authUrl,
                token_url: tokenUrl,
                refresh_token_lifespan: CloneConstants.oAuthAppConstants.REFRESH_TOKEN_LIFESPAN,
				sys_scope: this._getStoreAppSysId(),
                oauth_entity_profile: [{
                    grant_type: CloneConstants.oAuthAppConstants.DEFAULT_GRANT_TYPE,
                    name: providerName + ' Profile',
                    'default': true
                }]
            };

            var res = new sn_auth.OAuthAppAPI().createOAuthApp(JSON.stringify(registry));

            // Platform returns a Java response object — use its accessors
            var status = (typeof res.getStatus === 'function') ? String(res.getStatus()) : '';
            var message = (typeof res.getMessage === 'function') ? String(res.getMessage()) : '';

            // sys_id accessor name varies by platform release — try both, then fall back to toString
            var newId = '';
            if (typeof res.getID === 'function') newId = String(res.getID() || '');
            if (!newId && typeof res.getId === 'function') newId = String(res.getId() || '');
            if (!newId) {
                var match = String(res).match(/ID:([0-9a-f]{32})/);
                if (match) newId = match[1];
            }

            if (status !== 'SUCCESS' || gs.nil(newId)) {
                result.body.message = gs.getMessage('Failed to create OAuth provider: {0}',(message || 'unknown error'));
                gs.error(LOG_PREFIX + 'createOAuthApp failed. status=' + status + ' message=' + message + ' raw=' + res);
                return result;
            }

            // --- 4. Read back the freshly created row ---
            var created = new GlideRecord('oauth_entity');
            if (!created.get(newId)) {
                result.body.message = gs.getMessage('OAuth provider was created but could not be read back');
                gs.error(LOG_PREFIX + 'oauth_entity sys_id=' + newId + ' not found after create.');
                return result;
            }

            return this._buildProviderSuccess(created);

        } catch (ex) {
			result.status = 200;
            gs.error(LOG_PREFIX + ex.message + ' | Line: ' + ex.lineNumber);
            result.body.message = gs.getMessage('Exception while creating OAuth provider: {0}',ex.message);
            return result;
        }
    },

    // Idempotently rewrites drift on an existing provider — only writes if a field actually differs.
    _syncProviderFields: function(oauthGr, expected) {
        var dirty = false;
        var fields = Object.keys(expected);
        for (var i = 0; i < fields.length; i++) {
            var f = fields[i];
            if (f === 'redirect_url') {
                var current = (oauthGr.getValue('redirect_url') || '').trim();
                var urls = current ? current.split(/\s+/) : [];
                if (urls.indexOf(expected[f]) === -1) {
                    urls.push(expected[f]);
                    oauthGr.setValue('redirect_url', urls.join(','));
                    dirty = true;
                }
                continue;
            }
            if (oauthGr.getValue(f) !== expected[f]) {
                oauthGr.setValue(f, expected[f]);
                dirty = true;
            }
        }
        if (dirty) oauthGr.update();
    },

    // Extracts host (eg "target.service-now.com") from a URL. Falls back to the input if it can't parse.
    _extractHost: function(url) {
        var m = String(url || '').match(/^https?:\/\/([^\/]+)/i);
        return m ? m[1] : String(url || '');
    },

    _buildProviderSuccess: function(oauthGr) {
        var oauthEntityProf = '';
        var oauthEntityProfGr = new GlideRecord('oauth_entity_profile');
        if (oauthEntityProfGr.get('oauth_entity', oauthGr.getValue('sys_id'))) {
            oauthEntityProf = oauthEntityProfGr.getUniqueValue();
        }
        return {
            status: 200,
            body: {
                error: false,
                sys_id: oauthGr.getValue('sys_id'),
                name: oauthGr.getValue('name'),
                client_id: oauthGr.getValue('client_id'),
                auth_url: oauthGr.getValue('auth_url'),
                token_url: oauthGr.getValue('token_url'),
                redirect_url: oauthGr.getValue('redirect_url') || '',
                oauth_entity_profile: oauthEntityProf
            }
        };
    },

    checkOAuthToken: function(targetInstanceUrl) {
        var result = {
            status: 400,
            body: {
                ready: false,
				cancelled: false
            }
        };

        try {
            if (gs.nil(targetInstanceUrl)) return result;

			if(gs.getUser().getPreference(CloneConstants.oAuthAppConstants.CANCEL_PREF_NAME) === 'true') {
				gs.getUser().savePreference(CloneConstants.oAuthAppConstants.CANCEL_PREF_NAME, 'false');
				result.status = 200;
				result.body.cancelled = true;
				return result;
			}

            var requestorId = CloneConstants.oAuthAppConstants.REQUESTOR_ID;
            var providerName = CloneConstants.oAuthAppConstants.APP_PROVIDER_NAME + ' - ' + this._extractHost(targetInstanceUrl);

            var providerGr = new GlideRecord('oauth_entity');
            providerGr.addQuery('name', providerName);
            providerGr.setLimit(1);
            providerGr.query();
            if (!providerGr.next()) return result;

            var profileGr = new GlideRecord('oauth_entity_profile');
            profileGr.addQuery('oauth_entity', providerGr.getValue('sys_id'));
            profileGr.addQuery('default', true);
            profileGr.setLimit(1);
            profileGr.query();
            if (!profileGr.next()) return result;

            var token = new sn_auth.GlideOAuthClient().getToken(requestorId, profileGr.getValue('sys_id'));
			if(token && token.getAccessToken()) {
				result.body.ready = token.getExpiresIn() > 30;
			}
			result.status = 200;
            return result;

        } catch (ex) {
            gs.error('[AdminCloneUtil.checkOAuthToken] ' + ex.message + ' | Line: ' + ex.lineNumber);
            return result;
        }
    },


    getAdjacentClones: function(targetInstanceSysId, scheduledDateTime) {
        var result = {
            status: 400,
            body: {}
        };
        try {
            var targetInstanceId = this.getInstanceId(targetInstanceSysId);
            var response = this.cloneRestService.getAdjacentClones(targetInstanceId, scheduledDateTime);
            result.body = response;
            result.status = 200;
        } catch (ex) {
            result.body = {
                "isError": true + ex,
            };
        }
        return result;
    },

    saveUserPrefs: function(prefName, value) {
        try {
            var result = {};
            gs.getUser().savePreference(prefName, value);
            result.status = 200;
        } catch (ex) {
            result.body = {
                "isError": true + ex,
            };
            result.status = 400;
        }
        return result;
    },

    checkAppUpdate: function() {
        var result = {
                'body': {}
            },
            storeAppIds = [];
        var storeApp = new GlideRecord('sys_store_app');
        storeApp.addQuery('scope', 'sn_instance_clone');
        storeApp.query();
        while (storeApp.next()) {
            storeAppIds.push(storeApp.getUniqueValue());
        }
        var appStatusData = this.fetchData(storeAppIds);
        var baseURL = gs.getProperty('glide.servlet.uri');

        for (var i = 0; i < storeAppIds.length; i++) {

            var appStatus = appStatusData[storeAppIds[i]];
            if (!appStatus)
                continue;

            result['body'][appStatus.scope] = {
                'isUpdateAvailable': appStatus.isInstalledAndUpdateAvailable,
                'newVersion': appStatus.latest_version,
                'name': appStatus.name,
                'baseUrl': baseURL
            };
        }
        return result;
    },

    fetchData: function(appIds) {
        var apps = {};
        var appsObj = {};
        if (!this._appsDataApi) {
            gs.error('Unable to instantiate sn_appclient.AppsDataAPI');

            return null;
        }

        apps = this._appsDataApi.getEntitledApps(appIds);
        for (var i = 0; i < apps.length; i++) {
            if (apps[i].isApplication)
                appsObj[apps[i].sys_id] = apps[i];
            else
                appsObj[apps[i].plugin_id] = apps[i];
        }

        return appsObj;
    },

    getBreadCrumbsByPageParams: function(table_name) {
        try {
            var result = {};
            var href = "now/clone/ui/list/" + table_name + "/params/ace-nav/" + table_name;
            var gr = new GlideRecord(table_name);
            var table_display_value = gr.getClassDisplayValue();

            var data = [{
                    "label": table_display_value + "s",
                    "href": href
                },
                {
                    "label": table_display_value,
                    "href": "#"
                }
            ];
            result.body = data;
            result.status = this.setStatus(result.body);
        } catch (ex) {
            result.body = {
                "isError": true + ex,
            };
            result.status = 400;
        }
        return result;
    },

    getCloneLogs: function(sysId, searchTerm, pageNumber) {
        try {
            var cloumnDefinitions = [],
                rowDefinitions = [],
                totalRecs = 0,
                result = {};
            cloumnDefinitions.push({
                'key': 'sys_created_on',
                'label': 'Created',
                'type': 'string',
                'width': '150px',
                'icons': {
                    'endIcons': [{
                        'value': 'caret-down-fill'
                    }]
                }
            }, {
                'key': 'level',
                'label': 'Level',
                'type': 'string',
                'width': '150px',
            }, {
                'key': 'message',
                'label': 'Message',
                'type': 'string'
            });

            var grAgg = new GlideAggregate("sn_instance_clone_log");
            grAgg.addQuery("clone_request", sysId);
            if (searchTerm)
                grAgg.addQuery("message", "CONTAINS", searchTerm);
            grAgg.addAggregate('COUNT');
            grAgg.query();
            if (grAgg.next())
                totalRecs = grAgg.getAggregate('COUNT');

            var rowIndex = 0;
            if (!pageNumber) pageNumber = 0;
            var cloneLogGr = new GlideRecord("sn_instance_clone_log");
            cloneLogGr.addQuery("clone_request", sysId);
            if (searchTerm)
                cloneLogGr.addQuery("message", "CONTAINS", searchTerm);
            cloneLogGr.orderByDesc("sys_created_on");
            cloneLogGr.chooseWindow((pageNumber * 10), ((pageNumber + 1) * 10));
            cloneLogGr.query();
            while (cloneLogGr.next()) {
                rowDefinitions.push({
                    'key': 'row_' + rowIndex,
                    'cells': {
                        'sys_created_on': {
                            'value': cloneLogGr.getDisplayValue('sys_created_on')
                        },
                        'level': {
                            'value': cloneLogGr.getDisplayValue('level')
                        },
                        'message': {
                            'value': cloneLogGr.getDisplayValue('message')
                        }
                    }
                });
                rowIndex++;
            }
            result.body = {
                'columns': {
                    'columns': cloumnDefinitions
                },
                'rows': {
                    'rows': rowDefinitions
                },
                'totalRecords': totalRecs
            };
            result.status = this.setStatus(result.body);
        } catch (err) {
            result.body = {
                "isError": true + err,
            };
            result.status = 400;
        }
        return result;
    },

    deleteInstance: function(record_sys_id) {
        try {
            var result = {};
            var grInstance = new GlideRecord("instance");
            grInstance.get(record_sys_id);
            var isError = grInstance.deleteRecord() ? false : true;
            result.body = {
                "isError": isError,
            };
            result.status = this.setStatus(result.body);
        } catch (ex) {
            result.body = {
                "isError": true,
            };
        }
        return result;
    },

    getCloneRequestSysId: function(request_id) {
        var result = {};
        // var useVTable = gs.getProperty("sn_instance_clone.enable.mif") == "true";
        var useVTable = gs.getProperty("sn_instance_clone.enable.mif") == "true" && this._isVTableReady();


        var tableName = useVTable ? 'sn_instance_clone_request_vtable' : 'sn_instance_clone_request';

        var query = "request_id=" + request_id + "^ORchange_number=" + request_id;

        var cloneStatusGr = new GlideRecord(tableName);
        cloneStatusGr.addEncodedQuery(query, true);
        cloneStatusGr.query();
        var id;

        if (cloneStatusGr.next()) {
            if (!useVTable) {
                id = cloneStatusGr.sys_id;
            } else {
                id = cloneStatusGr.request_sys_id;
            }
            result.body = {
                sys_id: id.toString()
            };
        } else {
            result.body = null;
        }

        result.status = this.setStatus(result.body);
        return result;

    },
    getCloneCancelRollbackReasons: function(options) {
        var result = {};
        if (options == "cancelOptions") {
            result.body = CloneConstants.cancelOptions;
        } else if (options == "rollbackOptions") {
            result.body = CloneConstants.rollbackOptions;
        }
        result.status = this.setStatus(result.body);
        return result;
    },

    getCloneDefinitionsReocrds: function(table_name, profile_sys_id, row_name) {
        var result = {};
        var gr = new GlideRecord(table_name);
        if (!gs.nil(profile_sys_id))
            gr.addEncodedQuery("profile.sys_id=" + profile_sys_id + "^ORprofile.sys_id=" + CloneConstants.SYSTEM_PROFILE_SYS_ID, true);
        if (gr.isValidField('active'))
            gr.addQuery('active', true);
        gr.orderBy(row_name);
        gr.query();
        var cloneDefinitionsData = [];
        while (gr.next()) {
            row_data = [gr.sys_id.toString(), gr.getDisplayValue(row_name)];
            cloneDefinitionsData.push(row_data);
        }
        result.body = cloneDefinitionsData;
        result.status = this.setStatus(result.body);
        return result;
    },

    setStepperComponentData: function(record) {
        try {
            var stepperData = [];
            var progress = "done";
            var steps = CloneConstants.stepperComponentsSteps;
            var isValideState = false;
            for (var i = 0; i < steps.length; i++) {
                var step = steps[i];
                for (var key in step) {
                    if (step[key] == record.stage) {
                        isValideState = true;
                        break;
                    }
                }
            }
            if (!isValideState) {
                record.stage = gs.getMessage("Building Configurations");
                record.stage_percent_complete = 0;
                record.substep_heading = record.stage;
                progress = "partial";
                record.current_step = gs.getMessage("{0} of {1} Steps Completed", ['0', steps.length.toString()]);
            }
            for (i = 0; i < steps.length; i++) {
                step = steps[i];
                for (key in step) {
                    if (step[key] == record.stage) {
                        record.current_step = gs.getMessage("{0} of {1} Steps Completed", [i.toString(), steps.length.toString()]);
                        record.current_step_id = key;
                        progress = "partial";
                        record.substep_icon = "circle-outline";
                        record.substep_sub_heading = "In Progress";
                        if (i == steps.length - 1) {
                            if (record.stage_percent_complete == 100) {
                                record.current_step = gs.getMessage("{0} of {1} Steps Completed", [(i + 1).toString(), steps.length.toString()]);
                                record.substep_sub_heading = "Completed";
                                progress = "done";
                                record.substep_icon = "circle-check-fill";
                            }
                        }
                        record.show_substep_container = false;
                        record.show_step_progress = true;
                    }
                    stepperData.push({
                        "id": key,
                        "label": step[key],
                        "progress": progress,
                    });
                    if (progress == "partial") {
                        progress = "none";
                    }
                }
            }
            record.steps = stepperData;
            return record;
        } catch (ex) {
            gs.info("Failed in Fetching Stepper data", ex);
            return record;
        }
    },

    getCloneStatusRequestData: function(sys_id) {
        var result = {};
        var _tYes = gs.getMessage("Yes");
        var _tNo = gs.getMessage("No");

        // var useVTable = gs.getProperty("sn_instance_clone.enable.mif") == "true";
        var useVTable = gs.getProperty("sn_instance_clone.enable.mif") == "true" && this._isVTableReady();


        var tableName = useVTable ? 'sn_instance_clone_request_vtable' : 'sn_instance_clone_request';

        try {
            var record = {
                isdisablecomponent: false,
                current_sys_id: "",
                request_status: "",
                source_instance: "",
                target_instance: "",
                clone_profile_name: "",
                clone_progress_percent: 0,
                clone_progress_heading: "",
                clone_scheduled: "",
                estimated_clone_duration: "",
                estimated_completion: "",
                request_id: "",
                status_icon: "undo-top-fill",
                clone_status_heading: gs.getMessage("Clone Status"),
                show_clone_cancel_button: false,
                show_roll_back_button: false,
                show_semi_check: false,
                show_green_tick: false,
                show_red_error: false,
                show_clock_running: false,
                show_clone_outline: false,
                show_rollback_top: false,
                estimated_label: "",
                estimated_value: "",
                show_more_less_text: "Show more",
                show_more_data: false,
                show_more_logs: false,
                show_more_logs_text: "Show logs",
				show_cleanup_panel: false,	
				cleanup_toggle_label: gs.getMessage("Show cleanup scripts"),
                profile_sys_id: "",
                excluders: 0,
                preservers: 0,
                cleanups: 0,
                main_content_css: "block",
                show_record_missing: false,
                exclude_all_from_exclusion_list: "",
                exclude_large_data: "",
                preserve_theme: "",
                preserve_in_progress_update_sets: "",
                filter_attachment_data: "",
                amount_of_data_copied_from_large_tables: "",
                backup_type: "",
                clone_request_id_for_backup: "",
                //on_demand_backup: "",
                occurrences: "",
                lock_profile_settings: "",
                email: "",
                frequency: "",
                stage: "",
                sub_stage: "",
                stage_percent_complete: "",
                substep_heading: "",
                substep_progress_bar_heading: "",
                show_substep_container: false,
                show_step_progress: false,
                substep_icon: "circle-semi-check-fill",
                substep_sub_heading: "Not Started",
                current_step_id: "",
                rollback_eligible_until_date: "",
                show_modal_container: true,
                show_loader_modal: false,
                show_modal_stack: false,
                show_stack_links: false,
                learn_more_about_rollback: "",
                learn_more_about_steps: "",
                show_definitons_alert: false,
                progress: gs.getMessage("Progress :"),
                refreshInterval: gs.getProperty('sn_instance_clone.status.refreshInterval', 600000),
                disable_cancel_clone_button: false,
                show_cancel_info_button: false,
                cancel_info_text: gs.getMessage('Cancel info text'),
                logColumns: [{
                    'key': 'sys_created_on',
                    'label': 'Created'
                }, {
                    'key': 'level',
                    'label': 'Level'
                }, {
                    'key': 'message',
                    'label': 'Message'
                }],
            };
            var cloneStatusGr = new GlideRecord(tableName);
            // cloneStatusGr.get(sys_id);

            if (!useVTable)
                cloneStatusGr.get(sys_id);
            else
                cloneStatusGr.get("request_sys_id", sys_id);

            if (useVTable && gs.getProperty("instance_name") !== cloneStatusGr.getDisplayValue('instance_id')) {
                record.isdisablecomponent = true;
            }

            if (cloneStatusGr.request_id == "") {
                record.request_status = gs.getMessage("Record not found");
                record.main_content_css = "none";
                record.show_record_missing = true;
            } else {
                record.request_status = cloneStatusGr.getValue('state');
                if (record.request_status == "Completed" || record.request_status == "Rollback requested" || record.request_status == "Rolling back" ||
                    record.request_status == "Roll back Failure" || record.request_status == "Rolled back") {
                    record.stage = gs.getMessage("Post Clone");
                    record.substep_heading = record.stage;
                    record.sub_stage = cloneStatusGr.sub_stage;
                    record.substage_percent_value = 100;
                    record.stage_percent_complete = 100;
                } else {
                    record.stage = cloneStatusGr.stage || "";
                    record.substep_heading = record.stage;
                    record.sub_stage = cloneStatusGr.sub_stage;
                    record.substage_percent_value = cloneStatusGr.stage_percent_complete || 0;
                    record.stage_percent_complete = record.substage_percent_value || 0;
                }
                try {
                    record = this.setStepperComponentData(record);
                } catch (ex) {
                    gs.info("Failed Fetching stepperData" + ex);
                }
                record.request_id = cloneStatusGr.getValue('change_number') || cloneStatusGr.getValue('request_id');
                record.source_instance = cloneStatusGr.getDisplayValue('source_instance') || gs.getProperty('instance_name');
                record.target_instance = cloneStatusGr.getDisplayValue('target_instance');
				record.target_instance_url = 'https://' + cloneStatusGr.getDisplayValue('target_instance');
				var __targetInstanceSysId = cloneStatusGr.getValue('target_instance');
				if (__targetInstanceSysId) {
					var __targetInstanceGr = new GlideRecord('instance');
					if (__targetInstanceGr.get(__targetInstanceSysId) && __targetInstanceGr.getValue('instance_url')) {
						record.target_instance_url = __targetInstanceGr.getValue('instance_url').replace(/\/$/, '') + '/now/clone/ui/post-clone-cleanup-script-exec/params/chg/' + record.request_id;
					}
				}
                record.clone_profile_name = cloneStatusGr.getDisplayValue('profile_name') || "None selected";
                record.clone_scheduled = cloneStatusGr.getDisplayValue('scheduled');
                record.request_status = cloneStatusGr.getValue('state');
                record.clone_progress_percent = parseInt(cloneStatusGr.clone_percent_complete) || 0;
                record.substep_progress_bar_heading = gs.getMessage("Progress : {0} %", record.stage_percent_complete.toString());
                record.progress_bar_heading = gs.getMessage("Overall clone progress : {0} %", record.clone_progress_percent.toString());
                record.current_sys_id = sys_id;
                record.profile_sys_id = cloneStatusGr.profile;
                record.estimated_clone_duration = cloneStatusGr.getDisplayValue("estimated_clone_duration") || "";
                record.exclude_all_from_exclusion_list = cloneStatusGr.exclude_all_from_exclusion_list ? _tYes : _tNo;
                record.exclude_large_data = cloneStatusGr.exclude_large_data ? _tYes : _tNo;
                record.preserve_theme = cloneStatusGr.preserve_theme ? _tYes : _tNo;
                record.preserve_in_progress_update_sets = cloneStatusGr.preserve_in_progress_update_sets ? _tYes : _tNo;
                record.filter_attachment_data = cloneStatusGr.filter_attachment_data ? _tYes : _tNo;
                record.amount_of_data_copied_from_large_tables = cloneStatusGr.getDisplayValue('amount_of_data_copied_from_large_tables');
                //record.on_demand_backup = cloneStatusGr.on_demand_backup ? _tYes : _tNo;
                record.backup_type = /*cloneStatusGr.getDisplayValue('backup_type');*/ cloneStatusGr.on_demand_backup ? gs.getMessage("On-demand backup") : gs.getMessage("Most recent (recommended default)");
                record.clone_request_id_for_backup = cloneStatusGr.getDisplayValue('clone_request_id_for_backup');
                record.occurrences = cloneStatusGr.occurrences || "0";
                record.lock_profile_settings = cloneStatusGr.lock_profile_settings ? _tYes : _tNo;
                record.frequency = cloneStatusGr.getDisplayValue('clone_frequency') || gs.getMessage("None");
                record.show_substep_container = false;
                record.show_step_progress = true;
                var emails = [];
                /*var emailQuery = "sys_idIN" + cloneStatusGr.getValue("email");
                var userGr = new GlideRecord('sys_user');
                userGr.addEncodedQuery(emailQuery,true);
                userGr.query();
                while (userGr.next())
                    emails += userGr.getValue('email') + "; ";

                emails = emails.slice(0, -2);*/

                var _emails = cloneStatusGr.getValue('email') || '';
                if (_emails) {
                    _emails = _emails.split(',');
                    for (var i in _emails) {
                        var userGr = new GlideRecord('sys_user');
                        if (userGr.get(_emails[i])) {
                            emails.push(userGr.getValue('email'));
                        } else {
                            emails.push(_emails[i]);
                        }
                    }
                }

                record.email = emails.length > 0 ? emails.join(', ') : gs.getMessage("None");
                var duration_obj = new GlideDateTime(cloneStatusGr.estimated_clone_duration);
                var scheduled_date = new GlideDateTime(cloneStatusGr.scheduled);
                scheduled_date.add(duration_obj.getNumericValue());
                record.estimated_value = scheduled_date.getDisplayValue();
                if (record.lock_profile_settings == 'Yes') {
                    record.show_definitons_alert = true;
                } else {
                    record.show_definitons_alert = false;
                }

                if (record.source_instance === gs.getProperty('instance_name')) {
                    record.show_modal_stack = true;
                    record.show_stack_links = false;
                    var definitions = this.getDefinitions(cloneStatusGr.profile);
                    for (var key in definitions)
                        if (definitions.hasOwnProperty(key))
                            record[key] = definitions[key];
                } else {
                    try {
                        if (cloneStatusGr.cloud_details) {
                            record.show_modal_stack = false;
                            record.show_stack_links = true;
                            record.cloud_details = JSON.parse(cloneStatusGr.cloud_details);
                            record.excluders_link = record.cloud_details.exclusion.link;
                            record.preserver_link = record.cloud_details.preserver.link;
                            record.cleanupScript_link = record.cloud_details.cleanupScript.link;
                        }
                    } catch (ex) {
                        gs.info("Failed to fetch Clould Details for " + record.request_id);
                    }
                }
                record.estimated_label = gs.getMessage("Estimated Time of Completion");
                switch (record.request_status) {
                    case "Requested":
                        record.show_clone_cancel_button = true;
                        record.show_clock_running = true;
                        break;
                    case "Running":
                        record.show_clone_cancel_button = true;
                        record.show_clock_running = true;
                        break;
                    case "Canceled":
                        record.show_clone_outline = true;
                        break;
                    case "Error":
                        record.show_clone_cancel_button = false;
                        record.show_red_error = true;
                        record.error_message = cloneStatusGr.error_message ? cloneStatusGr.error_message : gs.getMessage("Error Occured . Please contact support");
                        break;
                    case "Completed":
                        record.estimated_label = gs.getMessage("Duration of Clone");
                        record.rollback_eligible_until_date = gs.getMessage("Rollback eligible until {0}", cloneStatusGr.getDisplayValue('rollback_eligible_until_date'));
                        record.estimated_value = cloneStatusGr.getDisplayValue("duration");
                        record.show_green_tick = true;
                        record.show_roll_back_button = this._showRollbackButton(sys_id);
                        break;
                    case "Rolled back":
                        record.show_rollback_top = true;
                        break;
                    case "Rolling back":
                        record.show_rollback_top = true;
                        break;
                    case "Roll back Failure":
                        record.show_rollback_top = true;
                        break;
                    case "Rollback requested":
                        record.show_rollback_top = true;
                        break;
                    default:
                        record.request_status = gs.getMessage("Invalid State");
                }
                if (record.show_clone_cancel_button && (record.stage == CloneConstants._stepperComponentsSteps.NODE_RESTART || record.stage == CloneConstants._stepperComponentsSteps.SCHEDULING_CLEANUP_SCRIPTS || record.stage == CloneConstants._stepperComponentsSteps.POST_CLONE)) {
                    record.disable_cancel_clone_button = true;
                    record.show_cancel_info_button = true;
                }
                record.request_status = record.clone_status_heading + " : " + record.request_status;
            }
        } catch (exception) {
            record.request_status = gs.getMessage("Failed Fetching Record");
            record.main_content_css = "none";
            record.show_record_missing = true;
            gs.info("Failed in fetching Data" + exception + exception.stack);
        }
		// Cleanup script counts injection	
        var __chg = record.request_id || '';	
        record.cleanupTotal = record.cleanupScriptCount || 0;	
        record.cleanupCompleted = 0;	
        record.cleanupFailed = 0;	
        record.cleanupNotExecuted = 0;	
        record.cleanupScheduled = 0;	
        record.cleanupRunning = 0;	
		record.cleanupReadyToSchedule = record.cleanupScriptCount || 0;	
		record.cleanupLabelTotal = gs.getMessage("Scripts:");	
		record.cleanupLabelReadyToSchedule = gs.getMessage("Ready To Schedule");	
		record.cleanupLabelScheduled = gs.getMessage("Scheduled");	
		record.cleanupLabelRunning = gs.getMessage("Running");	
		record.cleanupLabelFailed = gs.getMessage("failed_uppercase");	
		record.cleanupLabelNotExecuted = gs.getMessage("Not Executed");	
		record.cleanupLabelCompleted = gs.getMessage("Completed");	
		record.cleanupHeading = gs.getMessage("Post-clone Cleanup Scripts");	
		record.cleanupDescription = gs.getMessage("Status of cleanup scripts that configure on the target instance after a clone completes.");	
		record.cleanupMIFDescription = gs.getMessage("To view script progress on this page, enable Multi-Instance View under Configuration and add your target instance to the list of connected instances there.");	
		record.cleanupViewOnTargetLabel = gs.getMessage("View on target instance");	
		record.cleanupHeadingLabel = gs.getMessage("Cleanup Script Execution");	
		if (__chg) {	
			var __cleanupGr = new GlideRecord('sn_instance_clone_cleanup_script_execution_vtable');	
			__cleanupGr.addQuery('chg', __chg);	
			__cleanupGr.query();	
			if (__cleanupGr.hasNext()) {	
				record.cleanupTotal = 0;	
				record.cleanupReadyToSchedule = 0;	
				while (__cleanupGr.next()) {	
					record.cleanupTotal++;	
					var __status = (__cleanupGr.getValue('status') || '').toString();	
					if (__status == 'completed') record.cleanupCompleted++;	
					else if (__status == 'error' || __status == 'failed') record.cleanupFailed++;	
					else if (__status == 'not_executed' || __status == 'Not Executed') record.cleanupNotExecuted++;	
					else if (__status == 'scheduled') record.cleanupScheduled++;	
					else if (__status == 'running') record.cleanupRunning++;	
					else if (__status == 'ready') record.cleanupReadyToSchedule++;	
				}	
			}	
		}	
		record.cleanupSummaryHtml = '<div style="border:1px solid #D3D6DC;border-radius:4px;padding:0.5rem 0.75rem;background:#f7f8fa;font-size:14px;font-weight:bold;">' +	
		record.cleanupTotal + ' ' + record.cleanupLabelTotal + ' ' +	
		'<span style="color:#B8860B;">' + record.cleanupReadyToSchedule + ' ' + record.cleanupLabelReadyToSchedule + '</span> \u00B7 ' +	
		'<span style="color:#0095DA;">' + record.cleanupScheduled + ' ' + record.cleanupLabelScheduled + '</span> \u00B7 ' +	
		'<span style="color:#003D73;">' + record.cleanupRunning + ' ' + record.cleanupLabelRunning + '</span> \u00B7 ' +	
		'<span style="color:#c23934;">' + record.cleanupFailed + ' ' + record.cleanupLabelFailed + '</span> \u00B7 ' +	
		'<span style="color:#706e6b;">' + record.cleanupNotExecuted + ' ' + record.cleanupLabelNotExecuted + '</span> \u00B7 ' +	
		'<span style="color:#2e844a;">' + record.cleanupCompleted + ' ' + record.cleanupLabelCompleted + '</span>' +	
		'</div>';
        result.body = record;
        result.status = this.setStatus(result.body);
        return result;
    },


    _showRollbackButton: function(cloneId) {
        var gr = new GlideRecord('sn_instance_clone_request');
        gr.addQuery('sys_id', cloneId);
        gr.query();
        if (gr.next()) {
            var currentDateTime = new GlideDateTime();
            var targetDateTime = new GlideDateTime(gr.getValue('rollback_eligible_until_date'));
            targetDateTime.add(-30 * 60 * 1000);
            if (currentDateTime > targetDateTime) {

                return false;
            }
        }
        return true;

    },
    cancelRollbackCloneRequest: function(cloneId, reason, request_type) {
        var cloneRestService = new sn_instance_clone.CloneRestService();
        var result = {};
        try {
            if (request_type == "cancelOptions") {
                result.body = cloneRestService.cancelClone(cloneId, reason);
            }
            if (request_type == "rollbackOptions") {
                result.body = cloneRestService.rollbackClone(cloneId, reason);
            }
            cloneRestService.getCloneStatus(cloneId);
            result.status = this.setStatus(result.body);
            return result;
        } catch (ex) {}
    },

    updateRecord: function(table, sysId, props) {
        var result = {};
        sysId = this.updateRecordGr(table, sysId, props);
        if (sysId) {
            result.body = {
                isError: false,
                sysId: sysId
            };
        } else {
            result.body = {
                isError: true,
                message: sn_i18n.Message.getMessage("sn_instance_clone", "Invalid update")
            };
        }
        result.status = this.setStatus(result.body);
        return result;
    },

    authenticateInstance: function(instanceUrl, userName, password, registerInstance) {
        var cloneRestService = new sn_instance_clone.CloneRestService(),
            result = {},
            cloneReqSysId = '';
        if (!registerInstance)
            cloneReqSysId = gs.generateGUID();
        result.body = cloneRestService.authenticateInstance(instanceUrl, userName, password, cloneReqSysId);
        result.status = this.setStatus(result.body);
        result.body['cloneReqSysId'] = cloneReqSysId;
        return result;
    },

    authenticateInstanceByOauth: function(instanceUrl, registerInstance) {
        var LOG_PREFIX = '[AdminCloneUtil.authenticateInstanceByOauth] ';
        var cloneRestService = new sn_instance_clone.CloneRestService();
        var result = {};
        var cloneReqSysId = '';

        if (!registerInstance) {
            cloneReqSysId = gs.generateGUID();
        }

        // Retrieve a valid access token for this target
        var accessToken = this._getAccessTokenForTarget(instanceUrl);
        if (gs.nil(accessToken)) {
            result.status = 401;
            result.body = {
                isError: true,
                message: gs.getMessage('No valid OAuth token for this target. Complete the consent flow first.')
            };
            gs.error(LOG_PREFIX + 'No access token available for instance=' + instanceUrl);
            return result;
        }

        result.body = cloneRestService.authenticateInstanceByOauth(instanceUrl, cloneReqSysId, accessToken);
        result.status = this.setStatus(result.body);
        result.body['cloneReqSysId'] = cloneReqSysId;
        return result;
    },

    // Resolves the OAuth access token for the provider tied to this target.
    // Returns the string or null if no usable token exists.
    _getAccessTokenForTarget: function(targetInstanceUrl) {
        if (gs.nil(targetInstanceUrl)) return null;

        var requestorId = CloneConstants.oAuthAppConstants.REQUESTOR_ID;
        var providerName = CloneConstants.oAuthAppConstants.APP_PROVIDER_NAME + ' - ' + this._extractHost(targetInstanceUrl);

        var pGr = new GlideRecord('oauth_entity');
        pGr.addQuery('name', providerName);
        pGr.setLimit(1);
        pGr.query();
        if (!pGr.next()) return null;

        var prGr = new GlideRecord('oauth_entity_profile');
        prGr.addQuery('oauth_entity', pGr.getValue('sys_id'));
        prGr.addQuery('default', true);
        prGr.setLimit(1);
        prGr.query();
        if (!prGr.next()) return null;

        var token = new sn_auth.GlideOAuthClient().getToken(requestorId, prGr.getValue('sys_id'));
        if (token == null) return null;

        var accessToken = token.getAccessToken();
        return gs.nil(accessToken) ? null : String(accessToken);
    },

    deleteRecord: function(table, sysId) {
        var deleted = this.deleteRecordGr(table, sysId);
        var result = {};
        if (deleted) {
            result.body = {
                isError: false,
                sysId: sysId
            };
        } else {
            result.body = {
                isError: true,
                message: sn_i18n.Message.getMessage("sn_instance_clone", "Invalid update")
            };
        }
        result.status = this.setStatus(result.body);
        return result;
    },

    createRecord: function(table, valuePairs) {
        var result = {};
        var sysId = this._grRecordCreator(table, valuePairs, null);
        if (sysId) {
            result.body = {
                isError: false,
                sysId: sysId
            };
        } else {
            result.body = {
                isError: true,
                message: gs.getErrorMessages()[0],
            };
        }
        result.status = this.setStatus(result.body);
        return result;
    },

    readRecord: function(table, sysId) {
        var result = {};
        result.body = {
            "record": this.getRecord(table, sysId, props)
        };
        result.status = this.setStatus(result.body);
        return result;
    },

    getSysUsersRecord: function(query) {
        var result = {};
        result.body = this.getSysUsers(query);
        result.status = this.setStatus(result.body);
        return result;
    },

	isAllowedCloneTargetUrl: function(instanceUrl) {
		var host = String(instanceUrl || '').replace(/^https?:\/\//i, '').split(/[\/:]/)[0].toLowerCase();
		if (!host || this._isPrivateOrLoopbackHost(host)) {
			return false;
		}

		var instanceGr = new GlideRecord("instance");
		instanceGr.addQuery("source", false);
		instanceGr.query();
		while (instanceGr.next()) {
			var registeredHost = String(instanceGr.getValue("instance_url") || '')
				.replace(/^https?:\/\//i, '').split(/[\/:]/)[0].toLowerCase();
			if (registeredHost && registeredHost === host) {
				return true;
			}
		}
		return false;
	},

	_isPrivateOrLoopbackHost: function(host) {
		if (host === 'localhost' || host === '::1') {
			return true;
		}
		var ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
		if (!ipv4) {
			return false;
		}
		var a = parseInt(ipv4[1], 10);
		var b = parseInt(ipv4[2], 10);
		return a === 127 ||                       // loopback
			a === 0 ||                             // "this network"
			(a === 169 && b === 254) ||            // link-local
			a === 10 ||                            // RFC1918
			(a === 172 && b >= 16 && b <= 31) ||   // RFC1918
			(a === 192 && b === 168);              // RFC1918

	},

    getRemoteInstanceCloneProfileList: function(instanceUrl, username, password) {
        var result = {};
        if (!instanceUrl.startsWith("https://") && !instanceUrl.startsWith("http://")) {
            instanceUrl = "https://" + instanceUrl;
        }
		if (!this.isAllowedCloneTargetUrl(instanceUrl)) {
			result.body = { isError: true, message: 'instanceUrl is not a registered clone target.' };
			result.status = this.setStatus(null);
			return result;
    	}
        result.body = ProfileUtils.fetchProfilesFromInstance(instanceUrl, username, password);
        result.status = this.setStatus(result.body);
        return result;
    },

    getRemoteInstanceDefinitionsData: function(instanceUrl, username, password, profileName) {
        var result = {};
        if (!instanceUrl.startsWith("https://") && !instanceUrl.startsWith("http://")) {
            instanceUrl = "https://" + instanceUrl;
        }
		if (!this.isAllowedCloneTargetUrl(instanceUrl)) {
			result.body = { isError: true, message: 'instanceUrl is not a registered clone target.' };
			result.status = this.setStatus(null);
			return result;
		}
        result.body = ProfileUtils.buildConfigCountFromRemoteInstance(instanceUrl, username, password, profileName);
        if (!gs.nil(result.body) && !result.body.isError) {
            if (gs.nil(result.body.exclusion.count)) {
                result.body.exclusion.count = "N/A";
            }
            if (gs.nil(result.body.preserver.count)) {
                result.body.preserver.count = "N/A";
            }
            if (gs.nil(result.body.cleanupScript.count)) {
                result.body.cleanupScript.count = "N/A";
            }
        }
        result.status = this.setStatus(result.body);
        return result;
    },

    getCloneProfileData: function(sysId) {
        var result = {};
        result.body = this.getCloneProfileRecord(sysId);
        result.status = this.setStatus(result.body);
        return result;
    },

    setStatus: function(obj) {
        if (!obj) {
            return 400;
        }
        return 200;
    },

    getRecord: function(table, sysId, props /* Array of fields */ ) {
        var result = {};
        var _self = this;
        try {
            var gr = new GlideRecordSecure(table);
            if (gr.get(sysId)) {
                props.forEach(function(prop) {
                    result[prop] = gr[prop].toString(); //Do not use getValue() as it is showing display value in some cases like incident.category
                });
            }
            return result;
        } catch (e) {
            return result;
        }
    },

    _grRecordCreator: function(table, valuePairs) {
        try {
            var clonedValuePairs = {},
                field;
            var gr = new GlideRecordSecure(table);
            gr.initialize();
            for (field in clonedValuePairs) {
                gr[field] = clonedValuePairs[field];
            }
            for (field in valuePairs) {
                gr[field] = valuePairs[field];
            }
            if (gr.canWrite()) {
                return gr.insert();
            } else {
                gs.error("Inserting record failed to perform the operation as the user don't have write accesss " + table);
            }
        } catch (e) {
            return null;
        }
    },

    deleteRecordGr: function(table, sysId) {
        var gr = new GlideRecordSecure(table);
        if (gr.get(sysId)) return gr.deleteRecord();
        return null;
    },

    updateRecordGr: function(table, sysId, props) {
        var gr = new GlideRecordSecure(table);
        var result = null;
        if (gr.get(sysId)) {
            for (var key in props) {
                gr.setValue(key, props[key]);
            }
            if (gr.canWrite()) {
                result = gr.update();
                if (result) {
                    return result;
                } else {
                    gs.error("Updating record failed to perform the operation");
                }
            } else {
                gs.error("Updating record failed to perform the operation as the user don't have write accesss " + table + " " + sysId);
            }
        }
        return null;
    },

    getDefinitions: function(currentProfileSysId) {
        var definitions = {
            excluderCount: 0,
            excluderTable: '',
            excluderLabel: 'Clone Exclusions',
            excluderRowName: 'name',
            preserverCount: 0,
            preserverTable: '',
            preserverLabel: 'Clone Preservers',
            preserverRowName: 'table',
            cleanupScriptCount: 0,
            cleanupScriptTable: '',
            cleanupScriptLabel: 'Clone Cleanup Scripts',
            cleanupScriptRowName: 'name',
        };
        var props = {};
        if (gs.nil(currentProfileSysId)) {
            definitions.excluderCount = this.getRecordCount(CloneConstants.tableName.CLONE_DATA_EXCLUSION);
            definitions.excluderTable = CloneConstants.tableName.CLONE_DATA_EXCLUSION;
            definitions.preserverCount = this.getRecordCount(CloneConstants.tableName.CLONE_DATA_PRESERVER);
            definitions.preserverTable = CloneConstants.tableName.CLONE_DATA_PRESERVER;
            definitions.cleanupScriptCount = this.getRecordCount(CloneConstants.tableName.CLONE_CLEANUP_SCRIPT);
            definitions.cleanupScriptTable = CloneConstants.tableName.CLONE_CLEANUP_SCRIPT;
        } else {
            definitions.excluderCount = this.getRecordCount(CloneConstants.tableName.CLONE_PROFILE_EXCLUSION, currentProfileSysId);
            definitions.excluderTable = CloneConstants.tableName.CLONE_PROFILE_EXCLUSION;
            definitions.excluderRowName = 'exclusion';
            definitions.preserverCount = this.getRecordCount(CloneConstants.tableName.CLONE_PROFILE_PRESERVER, currentProfileSysId);
            definitions.preserverTable = CloneConstants.tableName.CLONE_PROFILE_PRESERVER;
            definitions.preserverRowName = 'preserver';
            definitions.cleanupScriptCount = this.getRecordCount(CloneConstants.tableName.CLONE_PROFILE_CLEANUP_SCRIPT, currentProfileSysId);
            definitions.cleanupScriptTable = CloneConstants.tableName.CLONE_PROFILE_CLEANUP_SCRIPT;
            definitions.cleanupScriptRowName = 'cleanup_script';
        }
        return definitions;
    },

    getRecordCount: function(table, currentProfileSysId) {
        var tableGr = new GlideAggregate(table);
        tableGr.addAggregate('COUNT');
        if (!gs.nil(currentProfileSysId)) {
            var query = tableGr.addQuery('profile', currentProfileSysId);
            query.addOrCondition('profile.name', 'System Profile');
        }
        if (tableGr.isValidField('active'))
            tableGr.addQuery('active', true);
        tableGr.query();
        if (tableGr.next())
            return tableGr.getAggregate('COUNT');
    },

    getTargetInstances: function(refreshCall, skipAddInstance) {
        var instanceGr = new GlideRecord("instance");
        instanceGr.addQuery("source", false);
        instanceGr.orderBy("instance_name");
        instanceGr.query();
        var items = [];
        while (instanceGr.next()) {
            var instance = {};
            instance.label = instanceGr.getValue("instance_name");
            instance.instanceUrl = instanceGr.getValue("instance_url");
            instance.id = instanceGr.getValue("sys_id");
            items.push(instance);
        }

        if (!skipAddInstance) {
            var _instance = {};
            _instance.label = gs.getMessage("Add a target instance");
            _instance.instanceUrl = '';
            _instance.id = 'target_instance';
            items.push(_instance);
        }

        if (refreshCall) {
            var result = {
                body: {}
            };
            result.body.items = items;
            result.status = this.setStatus(result.body);

            return result;
        }

        return items;
    },

    getCloneRequestId: function() {
        var cloneRequestGr = new GlideRecord("sn_instance_clone_request");
        var strQuery = 'state=Requested^ORstate=Running^ORstate=Completed^sys_updated_on>=javascript:gs.beginningOfLast7Days()';
        cloneRequestGr.addEncodedQuery(strQuery, true);
        cloneRequestGr.query();
        var items = [];
        items.push({
            label: gs.getMessage("Click to select a clone request"),
            id: "clickToSelectCloneRequest"
        });
        while (cloneRequestGr.next()) {
            var request = {};
            request.label = cloneRequestGr.getValue("request_id");
            request.id = cloneRequestGr.getValue("sys_id");
            items.push(request);
        }
        return items;
    },

    getSourceInstances: function() {
        var instanceGr = new GlideRecord("instance");
        instanceGr.addQuery("source", false);
        instanceGr.orderBy("instance_name");
        instanceGr.query();
        var items = [];
        items.push({
            label: gs.getMessage("Current instance"),
            instanceUrl: "",
            id: "currentInstance"
        });
        while (instanceGr.next()) {
            var instance = {};
            instance.label = instanceGr.getValue("instance_name");
            instance.instanceUrl = instanceGr.getValue("instance_url");
            instance.id = instanceGr.getValue("sys_id");
            items.push(instance);
        }
        return items;
    },

    getNextAvailableSlot: function(srcInstanceSysId, targetInstanceSysId) {
        var result = {};
        if (targetInstanceSysId) {
            var srcInstanceId = "";
            if (!gs.nil(srcInstanceSysId)) {
                srcInstanceId = this.getInstanceId(srcInstanceSysId);
            }
            var targetInstanceId = this.getInstanceId(targetInstanceSysId);
            result.body = this.cloneRestService.getNextAvailableSlot(srcInstanceId, targetInstanceId);
        }
        if (!gs.nil(result.body) && !result.body.isError) {
            result.body.estimatedDuration = this.millisecondToDuration(result.body.estimatedDurationMs);
            var startDiffMs = new GlideDateTime(result.body.estimatedStartDateTime).getNumericValue() - new GlideDateTime().getNumericValue();
            //converting date time into user date time format
            result.body.estimatedDurationInternal = result.body.estimatedDuration;
            result.body.estimatedStartDateTime = this.convertDateTimeToUserDateTime(result.body.estimatedStartDateTime);
            result.body.serverCurrentTime = this.convertDateTimeToUserDateTime(new GlideDateTime().getValue());
            result.body.relativeTimeTooltip = this._getRelativeTimeTooltip(startDiffMs);
        }
        result.status = this.setStatus(result.body);
        return result;
    },

    getMaximumCloneOccurrence: function(maxCloneDuration, frequency) {
        var result = {};
        var maxCloneOccurrences = CloneUtils.getMaxCloneOccurrence(maxCloneDuration, frequency);
        result.body = {
            maxCloneOccurrences: maxCloneOccurrences || 0
        };
        result.status = this.setStatus(result.body);
        return result;
    },

    getEstimatedCloneSeriesEndDate: function(requestedTime, cloneFrequency, numberOfOccurrences, days) {
        var result = {};
        var estimatedSeriesEndDate = CloneUtils.getEstimatedSeriesEndDate(requestedTime, cloneFrequency, numberOfOccurrences, days);
        result.body = {
            estimatedSeriesEndDate: estimatedSeriesEndDate.displayValue || estimatedSeriesEndDate
        };
        result.status = this.setStatus(result.body);
        return result;
    },

    getCloneProfiles: function() {
        var cloneProfileGr = new GlideRecord("clone_profile");
        cloneProfileGr.orderBy('name');
        cloneProfileGr.query();
        var items = [];
        while (cloneProfileGr.next()) {
            var profile = {};
            profile.label = cloneProfileGr.getValue("name");
            profile.id = cloneProfileGr.getValue("sys_id");
            profile.isDefault = cloneProfileGr.getValue("default_profile");
            items.push(profile);
        }
        return items;
    },

    getSysUsers: function(query) {
        var filter = "emailISNOTEMPTY";
        if (!gs.nil(query)) {
            filter += "^emailSTARTSWITH" + query;
        }
        var sysUserGr = new GlideRecord("sys_user");
        sysUserGr.addEncodedQuery(filter, true);
        sysUserGr.orderBy('email');
        sysUserGr.setLimit(10);
        sysUserGr.query();
        var users = [];
        while (sysUserGr.next()) {
            var userData = {
                avatarProps: {}
            };
            userData.label = sysUserGr.getValue("email");
            userData.id = sysUserGr.getValue("sys_id");
            userData["avatarProps"]["imageSrc"] = sysUserGr.getValue("avatar") ? sysUserGr.getValue("avatar") + ".iix" : "";
            userData["avatarProps"]["userName"] = sysUserGr.getValue("name");
            users.push(userData);
        }
        return users;
    },

    getCurrentUserDetails: function() {
        var sysUserGr = new GlideRecord("sys_user");
        var currentUserSysId = gs.getUserID();
        sysUserGr.addQuery("sys_id", currentUserSysId);
        sysUserGr.query();
        var userData = {};
        if (sysUserGr.next()) {
            userData.label = sysUserGr.getValue("email");
            userData.id = sysUserGr.getValue("sys_id");
            userData["avatarProps"] = {};
            userData["avatarProps"]["imageSrc"] = sysUserGr.getValue("avatar") ? sysUserGr.getValue("avatar") + ".iix" : "";
            userData["avatarProps"]["userName"] = sysUserGr.getValue("name");
        }
        return userData;
    },

    getCloneProfileDefaultRecord: function() {
        return record = {
            "amount_of_data_copied_from_large_tables": "full",
            "backupTypeFromCloneProfileDefaultSelectedItem": "use_recent_backup",
            "default_profile": false,
            "exclude_all_from_exclusion_list": true,
            "exclude_large_data": true,
            "filter_attachment_data": true,
            "name": "",
            //"on_demand_backup": false,
            "preserve_in_progress_update_sets": "none",
            "preserve_theme": true,
            "target_instance": "",
            "header": gs.getMessage("Add new clone profile"),
            "modalDeleteMessageText": gs.getMessage("Are you sure you want to delete the Clone profile "),
            "dataCopyItems": [{
                    "id": "full",
                    "label": sn_i18n.Message.getMessage("sn_instance_clone", "Full")
                },
                {
                    "id": "last_90_days",
                    "label": sn_i18n.Message.getMessage("sn_instance_clone", "Last 90 days")
                }
            ],
            "backupTypeForCloneProfileItems": [{
                    "id": "use_recent_backup",
                    "label": gs.getMessage("Most recent (recommended default)")
                },
                {
                    "id": "on_demand_backup",
                    "label": gs.getMessage("On-Demand Backup")
                }
            ],
            "updateSetItems": [{
                    "id": "none",
                    "label": gs.getMessage("None")
                },
                {
                    "id": "last_90_days",
                    "label": sn_i18n.Message.getMessage("sn_instance_clone", "Last 90 days")
                }
            ],
            "hasCustomPreserver": {
                isCustom: false
            }
        };
    },

    getCloneProfileRecord: function(sysId) {
        var record = this.getCloneProfileDefaultRecord();
        if (gs.nil(sysId)) {
            record.preserversCount = this.getRecordCount(CloneConstants.tableName.CLONE_DATA_PRESERVER);
            record.exclusionsCount = this.getRecordCount(CloneConstants.tableName.CLONE_DATA_EXCLUSION);
            record.cleanupScriptsCount = this.getRecordCount(CloneConstants.tableName.CLONE_CLEANUP_SCRIPT);
        } else {
            var cloneProfileGr = new GlideRecord("clone_profile");
            cloneProfileGr.get(sysId);
            record.name = cloneProfileGr.getValue("name");
            record.amount_of_data_copied_from_large_tables = cloneProfileGr.getValue("amount_of_data_copied_from_large_tables");
            record.default_profile = cloneProfileGr.getDisplayValue("default_profile");
            record.exclude_all_from_exclusion_list = cloneProfileGr.getDisplayValue("exclude_all_from_exclusion_list") || "No";
            record.exclude_large_data = cloneProfileGr.getDisplayValue("exclude_large_data");
            record.filter_attachment_data = cloneProfileGr.getDisplayValue("filter_attachment_data");
            //record.on_demand_backup = cloneProfileGr.getDisplayValue("on_demand_backup");
            record.preserve_in_progress_update_sets = cloneProfileGr.getValue("preserve_in_progress_update_sets") || "none";
            record.preserve_theme = cloneProfileGr.getDisplayValue("preserve_theme");
            record.sys_class_name = cloneProfileGr.getValue("sys_class_name");
            record.sys_created_by = cloneProfileGr.getValue("sys_created_by");
            record.sys_created_on = cloneProfileGr.getValue("sys_created_on");
            record.sys_id = cloneProfileGr.getValue("sys_id");
            record.sys_scope = cloneProfileGr.getValue("sys_scope");
            record.target_instance = cloneProfileGr.getValue("target_instance");
            record.backupTypeFromCloneProfileDefaultSelectedItem = cloneProfileGr.getValue('backup_type'); // == 'true' ? 'on_demand_backup' : 'use_recent_backup';
            //record.backupTypeFromCloneProfileDefaultSelectedItem = cloneProfileGr.getValue('backup_type');
            record.header = record.name;
            var definitions = this.getDefinitions(sysId || CloneConstants.SYSTEM_PROFILE_SYS_ID);
            record.preserversCount = definitions.preserverCount;
            record.exclusionsCount = definitions.excluderCount;
            record.cleanupScriptsCount = definitions.cleanupScriptCount;
            record.hasCustomPreserver = this._profileHasCustomPreserver(sysId || CloneConstants.SYSTEM_PROFILE_SYS_ID);
            record.isDiffScope = false;
            record.diffScopeMsg = '';
            if (gs.hasRole('admin')) {
                record.isDiffScope = !(cloneProfileGr.getValue('sys_scope') == gs.getCurrentApplicationId());
                var msgParams = [];
                //msgParams.push('now/nav/ui/classic/params/target/sys_scope.do?sys_id=' + cloneProfileGr.getValue('sys_scope'));
                msgParams.push(cloneProfileGr.sys_scope.getDisplayValue());
                //msgParams.push('now/nav/ui/classic/params/target/sys_scope.do?sys_id=' + gs.getCurrentApplicationId());
                msgParams.push(this._getCurrentAppName());
                record.diffScopeMsg = gs.getMessage('Clone app scope switcher message.', msgParams);
            }
        }
        return record;
    },

    _getCurrentAppName: function() {
        var appGr = new GlideRecord('sys_scope');
        if (appGr.get(gs.getCurrentApplicationId()))
            return appGr.getValue('name');
    },

    _profileHasCustomPreserver: function(cloneProfile) {
        var grAgg = new GlideAggregate(CloneConstants.tableName.CLONE_PROFILE_PRESERVER);
        grAgg.addEncodedQuery('preserver.default=false^clone_profile=' + cloneProfile, true);
        grAgg.addAggregate('COUNT');
        grAgg.query();
        if (grAgg.next()) {
            if (grAgg.getAggregate('COUNT') > 0) {
                var _msg3 = "now/nav/ui/classic/params/target/clone_profile_preservers_list.do" + encodeURIComponent("?sysparm_query=preserver.default=false^clone_profile=" + cloneProfile);
                return {
                    isCustom: false,
                    messages: {
                        msg1: gs.getMessage('preserve_increase_clone_msg'),
                        msg2: gs.getMessage('preserve_increase_clone_use_conditions_msg'),
                        msg3: gs.getMessage('customPreserversLink', _msg3)
                    }
                };
            }
        }
        return {
            isCustom: false
        };
    },

    getCloneRequestData: function() {
        return {
            "frequencyCard": {
                "cloneFrequency": {
                    "items": [{
                        "id": "0",
                        "label": gs.getMessage("None")
                    }, {
                        "id": "1",
                        "label": gs.getMessage("Weekly")
                    }, {
                        "id": "2",
                        "label": gs.getMessage("Every two weeks")
                    }, {
                        "id": "3",
                        "label": gs.getMessage("Every four weeks")
                    }],
                    "selected": ""
                },
                "occurrences": {
                    "show": "false",
                    "label": gs.getMessage("Total clones cannot be more than "),
                    "maxCount": 0,
                    "count": 0
                },
                "estimatedEndDateLabel": gs.getMessage("Please review the dates for your clones:"),
                "estimatedEndDate": "",
                "estimatedEdnDateShow": "false",
                "weeklyBiweekly": {
                    "show": "false",
                    "label": "",
                    "monthlyLabel": gs.getMessage("Every four weeks on"),
                    "weeklyLabel": gs.getMessage("Weekly on"),
                    "biweeklyLabel": sn_i18n.Message.getMessage("sn_instance_clone", "Bi-weekly on"),
                    "days": {
                        "sunday": {
                            "variant": "secondary",
                            "selected": "false"
                        },
                        "monday": {
                            "variant": "secondary",
                            "selected": "false"
                        },
                        "tuesday": {
                            "variant": "secondary",
                            "selected": "false"
                        },
                        "wednesday": {
                            "variant": "secondary",
                            "selected": "false"
                        },
                        "thursday": {
                            "variant": "secondary",
                            "selected": "false"
                        },
                        "friday": {
                            "variant": "secondary",
                            "selected": "false"
                        },
                        "saturday": {
                            "variant": "secondary",
                            "selected": "false"
                        }
                    }
                }
            },
            "backupTypeForCloneRequestItems": [{
                    "id": "use_recent_backup",
                    "label": gs.getMessage("Most recent (recommended default)")
                },
                {
                    "id": "on_demand_backup",
                    "label": gs.getMessage("On-demand backup")
                },
                /*{
                    "id": "use_another_clone_backup",
                    "label": gs.getMessage("Use the same backup as another clone")
                }*/
            ],
            "estimatedDurationInfoMessage": gs.getMessage("Based on the Clone Scheduled Start time specified above and the size of the data to be copied to the target instance, the estimated duration for the Clone is "),
            "estimatedDurationLabel": gs.getMessage("Estimated duration"),
            "estimatedCompletionLabel": gs.getMessage("Estimated completion"),
            "successModalInfoMessage": gs.getMessage("The estimated duration for the Clone is "),
            "authenticateTargetHeader": gs.getMessage("Authenticate Target - "),
            "today": this.getTodaysDate(),
            "timeZone": this.getTimeZone(),
            "errorMessage": gs.getMessage("Clone Request creation failed"),
            "dataCopyItems": [{
                    "id": "full",
                    "label": sn_i18n.Message.getMessage("sn_instance_clone", "Full")
                },
                {
                    "id": "last_90_days",
                    "label": sn_i18n.Message.getMessage("sn_instance_clone", "Last 90 days")
                }
            ],
            "updateSetItems": [{
                    "id": "none",
                    "label": gs.getMessage("None")
                },
                {
                    "id": "last_90_days",
                    "label": sn_i18n.Message.getMessage("sn_instance_clone", "Last 90 days")
                }
            ],
            "text": {
                "None": gs.getMessage("None"),
                "Current_instance": gs.getMessage("Current instance"),
                "Click_to_select_clone_request": gs.getMessage("Click to select a clone request"),
                "Yes": gs.getMessage("Yes"),
                "No": gs.getMessage("No"),
                "Full": sn_i18n.Message.getMessage("sn_instance_clone", "Full"),
                "Last_90_days": sn_i18n.Message.getMessage("sn_instance_clone", "Last 90 days"),
                "Authenticate": gs.getMessage("Authenticate"),
                "Authenticating": gs.getMessage("Authenticating"),
                "NumberZero": gs.getMessage("0"),
                "Exclusions": gs.getMessage("Exclusions"),
                "Preservers": gs.getMessage("Preservers"),
                "Cleanup_Scripts": gs.getMessage("Cleanup Scripts"),
                "GenericErrorMessage": gs.getMessage("Error Occurred. Please contact your administrator."),
                "OnDemandBackupMessage": gs.getMessage("Requesting on-demand backup will increase the time for your clone"),
                "TargetOverrideBody": gs.getMessage("The profile you selected includes a default target instance. Your target has been updated from {0} to {1}."),
            }
        };
    },

    runPreflightChecks: function(cloneProfileSysId, validationRules, largeTablesList) {
        var result = {};
        result.body = CloneUtils.runPreflightChecks(cloneProfileSysId, validationRules, largeTablesList);
        result.status = this.setStatus(result.body);
        return result;
    },

    createCloneRequest: function(cloneRequestData) {
        var result = {};
        var gr = new GlideRecord("sn_instance_clone_request");
        var scheduledGlideDateTime = new GlideDateTime();
        scheduledGlideDateTime.setDisplayValue(cloneRequestData.estimated_start_date_time);
        var estimatedGlideDuration = new GlideDuration(cloneRequestData.estimated_duration);
        gr.initialize();
        gr.setValue("amount_of_data_copied_from_large_tables", cloneRequestData.amount_of_data_copied_from_large_tables);
        gr.setValue("email", cloneRequestData.email_upon_completion);
        gr.setValue("estimated_clone_duration", estimatedGlideDuration);
        gr.setValue("exclude_all_from_exclusion_list", cloneRequestData.exclude_all_from_exclusion_list);
        gr.setValue("exclude_large_data", cloneRequestData.exclude_large_data);
        gr.setValue("filter_attachment_data", cloneRequestData.filter_attachment_data);
        gr.setValue("clone_frequency", cloneRequestData.frequency);
        gr.setValue("lock_profile_settings", cloneRequestData.lock_profile_settings);
        gr.setValue("occurrences", cloneRequestData.occurrences);
        gr.setValue("on_demand_backup", cloneRequestData.on_demand_backup);
        gr.setValue("preserve_in_progress_update_sets", cloneRequestData.preserve_in_progress_update_sets);
        gr.setValue("preserve_theme", cloneRequestData.preserve_theme);
        gr.setValue("profile", cloneRequestData.clone_profile);
        gr.setValue("profile_name", cloneRequestData.clone_profile_name);
        gr.setValue("scheduled", scheduledGlideDateTime.getValue());
        gr.setValue("source_instance", cloneRequestData.source_instance);
        gr.setValue("state", "Requested");
        gr.setValue("target_instance", cloneRequestData.target_instance);
        gr.setValue("cloud_details", JSON.stringify(cloneRequestData.cloud_details));
        gr.setValue('security_token', cloneRequestData.securityToken);
        gr.setValue('backup_type', cloneRequestData.backup_type);
        gr.setValue('clone_request_id_for_backup', cloneRequestData.clone_request_id_for_backup);
        gr.setNewGuidValue(cloneRequestData.cloneReqSysId);
        var response = CloneUtils.validateAndSubmitCloneRequest(gr);
        if (response.isError) {
            result.body = {
                error: response.message.join("<br/><br/>")
            };
            result.status = 400;
            return result;
        }
        try {
            CloneUtils.generateRecurringClones(gr, cloneRequestData.selectedDayOfWeek);
            var cloneRequestId = gr.getValue("sys_id");
            result.body = {
                cloneRequestId: cloneRequestId
            };
            result.status = 200;
        } catch (e) {
            result.body = {
                error: "Clone request created, but failed to create recurring clones."
            };
            result.status = 400;
        }
        return result;
    },

    getCalendarEntries: function(startDate, endDate, targetInstanceSysId) {
        startDate = new GlideDateTime(startDate);
        endDate = new GlideDateTime(endDate);
        var result = {};
        if (targetInstanceSysId) {
            var targetInstanceId = this.getInstanceId(targetInstanceSysId);
            result.body = CloneUtils.getConflictsArray(startDate, endDate, targetInstanceId);
        }
        result.status = this.setStatus(result.body);
        return result;
    },

    getInstanceId: function(instanceSysId) {
        var gr = new GlideRecord("instance");
        if (gr.get(instanceSysId)) {
            return gr.instance_id;
        }
        return null;
    },

    getTodaysDate: function() {
        var today = new GlideDateTime();
        return today.getDisplayValueInternal().split(' ')[0];
    },

    getTimeZone: function() {
        var session = gs.getSession();
        var zoneName = session.getTimeZoneName();
        return zoneName;
    },

    getListHeader: function(tableName) {
        switch (tableName) {
            case 'clone_data_exclude':
                return gs.getMessage('Exclusions');
            case 'clone_data_preserver':
                return gs.getMessage('Preservers');
            case 'clone_cleanup_script':
                return gs.getMessage('Cleanup scripts');
            default:
        }
    },

    millisecondToDuration: function(millisecond) {
        var duration = new GlideDuration(millisecond);
        return duration.getDisplayValue();
    },

    convertDateTimeToUserDateTime: function(dateTime) {
        var userDateTime = new GlideDateTime(dateTime);
        //GlideDateTime .getDisplayValue method returns date time in user date time format
        return userDateTime.getDisplayValue();
    },

    _getRelativeTimeTooltip: function(startDiffMs) {
        var diffMins = parseInt("" + Math.round(parseInt("" + startDiffMs, 10) / 60000), 10);
        if (diffMins < 0)
            return gs.getMessage("Scheduled clone time is in the past");
        if (diffMins === 0)
            return gs.getMessage("just now");
        var days = parseInt("" + Math.floor(diffMins / 60 / 24), 10);
        if (days > 0)
            return gs.getMessage("about {0} days from now", ["" + days]);
        var hours = parseInt("" + Math.floor(diffMins / 60), 10);
        if (hours > 0)
            return gs.getMessage("about {0} hours from now", ["" + hours]);
        return gs.getMessage("about {0} minutes from now", ["" + diffMins]);
    },

    checkSlotAvailability: function(sourceInstanceSysId, targetInstanceSysId, requestedTime) {
        var result = {};
        var requestedTimeGlideDateTime = new GlideDateTime();
        requestedTimeGlideDateTime.setDisplayValue(requestedTime);
        var bufferTime = new GlideTime();
        bufferTime.setValue("00:05:00"); // Setting buffer time as 5 min
        var currentTime = new GlideDateTime();
        currentTime.subtract(bufferTime);
        if (requestedTimeGlideDateTime.before(currentTime)) {
            result.body = {
                isError: true,
                message: gs.getMessage("Scheduled start time cannot be past time.")
            };
            result.status = this.setStatus(result.body);
            return result;
        }
        if (targetInstanceSysId) {
            var sourceInstanceId = "";
            if (!gs.nil(sourceInstanceSysId)) {
                sourceInstanceId = this.getInstanceId(sourceInstanceSysId);
            }
            var targetInstanceId = this.getInstanceId(targetInstanceSysId);
            result.body = this.cloneRestService.checkForAvailableSlot(sourceInstanceId, targetInstanceId, requestedTimeGlideDateTime.getValue());
        }
        if (!result.body.isError) {
            result.body.estimatedDuration = this.millisecondToDuration(result.body.estimatedDurationMs);
            var startDiffMs = requestedTimeGlideDateTime.getNumericValue() - new GlideDateTime().getNumericValue();
            //converting date time into user date time format
            result.body.estimatedStartDateTime = this.convertDateTimeToUserDateTime(requestedTimeGlideDateTime.getValue());
            result.body.serverCurrentTime = this.convertDateTimeToUserDateTime(new GlideDateTime().getValue());
            result.body.relativeTimeTooltip = this._getRelativeTimeTooltip(startDiffMs);
        }
        result.status = this.setStatus(result.body);
        return result;
    },

    getCloneProfileDefinitionDetails: function(tableName, filter) {
        var result = {
            "header": sn_i18n.Message.getMessage("sn_instance_clone", "All"),
            "listAlertMessage": gs.getMessage(" saved successfully"),
            "listAlertDeleteMessage": gs.getMessage("clone profile deleted successfully")
        };
        switch (tableName) {
            case 'clone_data_exclude':
                result.header = gs.getMessage('Exclusions');
                break;
            case 'clone_profile_exclusions':
                result.header = gs.getMessage('Exclusions');
                result.definitions = this.getAvailableDefinitions(CloneConstants.tableName.CLONE_DATA_EXCLUSION, tableName, filter, this.PROFILE_EXCLUSION_KEY);
                result.selected = this.getSelectedDefinitions(tableName, filter, this.PROFILE_EXCLUSION_KEY);
                break;
            case 'clone_data_preserver':
                result.header = gs.getMessage('Preservers');
                break;
            case 'clone_profile_preservers':
                result.header = gs.getMessage('Preservers');
                result.definitions = this.getAvailableDefinitions(CloneConstants.tableName.CLONE_DATA_PRESERVER, tableName, filter, this.PROFILE_PRESERVER_KEY);
                result.selected = this.getSelectedDefinitions(tableName, filter, this.PROFILE_PRESERVER_KEY);
                result.showWarning = this.checkProfileEditRights(filter.split(',')[1]);
                break;
            case 'clone_cleanup_script':
                result.header = gs.getMessage('Cleanup scripts');
                break;
            case 'clone_profile_cleanup_scripts':
                result.header = gs.getMessage('Cleanup scripts');
                result.definitions = this.getAvailableDefinitions(CloneConstants.tableName.CLONE_CLEANUP_SCRIPT, tableName, filter, this.PROFILE_CLEANUP_SCRIPT_KEY);
                result.selected = this.getSelectedDefinitions(tableName, filter, this.PROFILE_CLEANUP_SCRIPT_KEY);
                break;
            case 'clone_profile':
                result.header = sn_i18n.Message.getMessage("sn_instance_clone", "Clone Profile Header");
                break;
            case 'instance':
                result.header = sn_i18n.Message.getMessage("sn_instance_clone", "Clone Instance Header");
                break;
            default:
        }
        result.breadcrumbs = this.getBreadcrumbs(filter, result.header) || [];
        return result;
    },

    checkProfileEditRights: function(profileName) {
        var _showWarning = {
            warn: false,
            messages: {
                msg1: gs.getMessage('preserve_increase_clone_msg'),
                msg2: gs.getMessage('preserve_increase_clone_use_conditions_msg')
            }
        };

        if (!profileName)
            return _showWarning;
        var profGr = new GlideRecord('clone_profile');
        if (profGr.get('name', profileName)) {
            if (profGr.canWrite()) {
                _showWarning.warn = true;
            }
        }
        return _showWarning;
    },

    getBreadcrumbs: function(filter, header) {
        if (!filter) {
            return [];
        }
        var currentProfileName = filter.split('IN')[1].split(',')[1];
        var profileId = this.getCloneProfileId(currentProfileName);
        var link = '/now/clone/ui/clone-profile/' + profileId + '/params/aceNav/clone_profile';
        var breadcrumbs = [{
                label: currentProfileName,
                href: link
            },
            {
                label: header,
                href: '#'
            },
        ];
        return breadcrumbs;
    },

    getCloneProfilesForDefinition: function(table, sysId) {
        var result = {},
            available = {},
            selected = [],
            profiles = {},
            cloneProfileTable,
            definitionKey;
        switch (table) {
            case CloneConstants.tableName.CLONE_DATA_EXCLUSION:
                cloneProfileTable = CloneConstants.tableName.CLONE_PROFILE_EXCLUSION;
                definitionKey = this.PROFILE_EXCLUSION_KEY;
                break;
            case CloneConstants.tableName.CLONE_DATA_PRESERVER:
                cloneProfileTable = CloneConstants.tableName.CLONE_PROFILE_PRESERVER;
                definitionKey = this.PROFILE_PRESERVER_KEY;
                break;
            case CloneConstants.tableName.CLONE_CLEANUP_SCRIPT:
                cloneProfileTable = CloneConstants.tableName.CLONE_PROFILE_CLEANUP_SCRIPT;
                definitionKey = this.PROFILE_CLEANUP_SCRIPT_KEY;
                break;
            default:
                break;
        }
        var profileGr = new GlideRecord('clone_profile');
        profileGr.addQuery('sys_id', '!=', CloneConstants.SYSTEM_PROFILE_SYS_ID);
        profileGr.query();
        while (profileGr.next()) {
            var gr = new GlideRecord(cloneProfileTable);
            gr.addQuery(definitionKey, sysId);
            gr.addQuery('profile', profileGr.sys_id);
            gr.query();
            if (gr.next()) {
                var selectedProfile = [];
                var selectedItem = {};
                selectedItem.id = gr.getValue('profile');
                selectedItem.label = gr.getDisplayValue('profile');
                selectedProfile.push(selectedItem);
                selected.push(selectedProfile);
            } else {
                var profileId = profileGr.sys_id;
                var profileName = profileGr.getValue('name');
                var item = {};
                item.label = profileName;
                profiles[profileId] = item;
            }
        }
        available.profiles = profiles;
        result.available = available;
        result.selected = selected;
        return result;
    },

    getAvailableDefinitions: function(baseTable, table, filter, key) {
        var result = {};
        var definitions = {};
        var currentProfileName = filter.split('IN')[1].split(',')[1];
        var profileId = this.getCloneProfileId(currentProfileName);
        var finalQuery = 'profile=' + profileId + '^' + key + '=';
        var gr = new GlideRecord(baseTable);
        gr.addQuery('default', false);
        if (baseTable == CloneConstants.tableName.CLONE_CLEANUP_SCRIPT)
            gr.addQuery('active', true);
        gr.query();
        while (gr.next()) {
            var item = {};
            item.label = gr.getDisplayValue('name');
            definitions[gr.getUniqueValue()] = item;
            /*var definitionId = gr.getUniqueValue();
			var definitionName = gr.getDisplayValue('name');
			var grt = new GlideRecord(table);
            grt.addEncodedQuery((finalQuery + definitionId),true);
            grt.query();
            if (!grt.next()) {
                item.label = definitionName;
                definitions[definitionId] = item;
            }*/
        }
        result.definitions = definitions;
        return result;
    },

    getSelectedDefinitions: function(table, filter, key) {
        var result = [];
        var currentProfileName = filter.split('IN')[1].split(',')[1];
        var profileId = this.getCloneProfileId(currentProfileName);
        var grt = new GlideRecord(table);
        grt.addQuery('profile', profileId);
        grt.query();
        while (grt.next()) {
            var selected = [];
            var item = {};
            item.id = grt.getValue(key);
            item.label = grt.getDisplayValue(key);
            selected.push(item);
            result.push(selected);
        }
        return result;
    },

    getCloneProfileId: function(profileName) {
        var cloneProfileGr = new GlideRecord('clone_profile');
        cloneProfileGr.addQuery('name', profileName);
        cloneProfileGr.query();
        if (cloneProfileGr.next()) {
            return cloneProfileGr.getUniqueValue();
        }
        return '';
    },

    getCloneProfileName: function(sysId) {
        var result = {
            body: {
                "isError": true,
                "name": ''
            }
        };
        var cloneProfileGr = new GlideRecord('clone_profile');
        if (cloneProfileGr.get(sysId)) {
            result.body.isError = false;
            result.body.name = cloneProfileGr.getValue('name');
            result.status = this.setStatus(result.body);
            return result;
        }
        result.status = this.setStatus('');
        return result;
    },

    createM2MRecordsForDefinitions: function(table, filter, items) {
        var result = {};
        var currentProfileName = filter.split('IN')[1].split(',')[1];
        var profileId = this.getCloneProfileId(currentProfileName);
        var key;
        switch (table) {
            case CloneConstants.tableName.CLONE_PROFILE_EXCLUSION:
                key = this.PROFILE_EXCLUSION_KEY;
                break;
            case CloneConstants.tableName.CLONE_PROFILE_PRESERVER:
                key = this.PROFILE_PRESERVER_KEY;
                break;
            case CloneConstants.tableName.CLONE_PROFILE_CLEANUP_SCRIPT:
                key = this.PROFILE_CLEANUP_SCRIPT_KEY;
                break;
        }
        items.haveToCreate.forEach(function(item) {
            var createDefinitionGr = new GlideRecord(table);
            createDefinitionGr.initialize();
            createDefinitionGr.setValue('profile', profileId);
            createDefinitionGr.setValue(key, item);
            createDefinitionGr.insert();
        });
        items.haveToDelete.forEach(function(item) {
            var deleteDefinitionGr = new GlideRecord(table);
            deleteDefinitionGr.addQuery(key, item);
            deleteDefinitionGr.addQuery('profile', profileId);
            deleteDefinitionGr.query();
            if (deleteDefinitionGr.next()) {
                deleteDefinitionGr.deleteRecord();
            }
        });
        result.body = {
            "isError": false
        };
        result.status = this.setStatus(result.body);
        return result;
    },

    createM2MRecordsWithProfilesForDefinition: function(table, sysId, items) {
        var result = {};
        var profileDefinitionTable;
        var key;
        switch (table) {
            case CloneConstants.tableName.CLONE_DATA_EXCLUSION:
                key = this.PROFILE_EXCLUSION_KEY;
                profileDefinitionTable = CloneConstants.tableName.CLONE_PROFILE_EXCLUSION;
                break;
            case CloneConstants.tableName.CLONE_DATA_PRESERVER:
                key = this.PROFILE_PRESERVER_KEY;
                profileDefinitionTable = CloneConstants.tableName.CLONE_PROFILE_PRESERVER;
                break;
            case CloneConstants.tableName.CLONE_CLEANUP_SCRIPT:
                key = this.PROFILE_CLEANUP_SCRIPT_KEY;
                profileDefinitionTable = CloneConstants.tableName.CLONE_PROFILE_CLEANUP_SCRIPT;
                break;
        }
        items.haveToCreate.forEach(function(item) {
            var createDefinitionGr = new GlideRecord(profileDefinitionTable);
            createDefinitionGr.initialize();
            createDefinitionGr.setValue('profile', item);
            createDefinitionGr.setValue(key, sysId);
            createDefinitionGr.insert();
        });
        items.haveToDelete.forEach(function(item) {
            var deleteDefinitionGr = new GlideRecord(profileDefinitionTable);
            deleteDefinitionGr.addQuery(key, sysId);
            deleteDefinitionGr.addQuery('profile', item);
            deleteDefinitionGr.query();
            if (deleteDefinitionGr.next()) {
                deleteDefinitionGr.deleteRecord();
            }
        });
        result.body = {
            "isError": false
        };
        result.status = this.setStatus(result.body);
        return result;
    },

    _isVTableReady: function() {
        try {
            var gr = new GlideRecord('sn_instance_clone_request_vtable');
            gr.setLimit(1);
            gr.query();
            return true;
        } catch (e) {
            return false;
        }
    },

    getCloneHomeData: function(input) {
        if (input.activity === 'overview') {
            return this._getOverviewData(input);
        }
        return this._getCloneActivityData(input);
    },

    _getCloneActivityData: function(input) {
        var useVTable = gs.getProperty("sn_instance_clone.enable.mif") == "true" && this._isVTableReady();
        var tableName = useVTable ? 'sn_instance_clone_request_vtable' : 'sn_instance_clone_request';
        var scheduledField = 'scheduled';
        var durationField = 'estimated_clone_duration';
        var return_fields = input.returnFields.split(",");
        var pageOffset = parseInt(input.offset);
        var pageLimit = parseInt(input.limit);

        var gr = new GlideRecord(tableName);
        gr.orderByDesc(scheduledField);
        if (input.encodedQuery)
            gr.addEncodedQuery(input.encodedQuery, true);
        gr.chooseWindow(pageOffset, pageOffset + pageLimit);
        gr.query();

        var data = {
            "data": {
                "GlideRecord_Query": {},
                "source_instances": [],
                "mifview": useVTable
            }
        };
        data.data.GlideRecord_Query['sn_instance_clone_request'] = {
            "_table_metadata": {
                "label": gr.getLabel(),
                "displayValue": gr.getDisplayName(),
                "canWrite": gr.canWrite(),
                "canDelete": gr.canDelete(),
                "canCreate": gr.canCreate(),
                "canRead": gr.canRead()
            },
            "_results": [],
            "_rowCount": 0
        };
        var payload = {
            data: data.data
        };
        var rowcount = gr.getRowCount();
        var records = [];

        while (gr.next()) {
            var scheduledVal = gr.getValue(scheduledField);
            var estimatedDuration = gr.getValue(durationField);
            var sch = scheduledVal ? new GlideDateTime(scheduledVal) : null;
            var est = estimatedDuration ? new GlideDateTime(estimatedDuration).getTime() : null;
            if (sch && est !== null) {
                sch.add(est);
            }
            var record = {
                "_row_data": {
                    "displayValue": gr.getDisplayValue(),
                    "uniqueValue": useVTable ? gr.getValue('request_sys_id') : gr.getUniqueValue()
                },
                "estimated_end_time": {
                    "displayValue": sch ? sch.getDisplayValue() : null
                }
            };
            for (var i in return_fields) {
                record[return_fields[i]] = {
                    "value": gr.getValue(return_fields[i]),
                    "displayValue": gr.getDisplayValue(return_fields[i])
                };
            }
            if (tableName === 'sn_instance_clone_request' && !gr.getValue('source_instance')) {
                record['source_instance'] = {
                    "value": gs.getProperty('instance_name'),
                    "displayValue": gs.getProperty('instance_name')
                };
            }
            records.push(record);
        }

        if (useVTable) {
            payload.data.source_instances = this.getUniqueSourceInstancesFromVTable();
        }

        payload.data.GlideRecord_Query.sn_instance_clone_request._results = records;
        payload.data.GlideRecord_Query.sn_instance_clone_request._rowCount = rowcount;
        return payload;
    },

    _getOverviewData: function(input) {
        var useVTable = gs.getProperty("sn_instance_clone.enable.mif") == "true" && this._isVTableReady();
        var tableName = useVTable ? 'sn_instance_clone_request_vtable' : 'sn_instance_clone_request';
        var scheduledField = 'scheduled';
        var durationField = 'estimated_clone_duration';
        var return_fields = input.returnFields.split(",");
        var pageOffset = parseInt(input.offset);
        var pageLimit = parseInt(input.limit);

        // ── Fetch all records for dedup ───────────────────────────────
        var grCount = new GlideAggregate(tableName);
        grCount.addAggregate('COUNT');
        if (input.encodedQuery)
            grCount.addEncodedQuery(input.encodedQuery, true);
        grCount.query();
        var totalCount = grCount.next() ? parseInt(grCount.getAggregate('COUNT')) : 0;

        var gr = new GlideRecord(tableName);
        gr.orderByDesc(scheduledField);
        if (input.encodedQuery)
            gr.addEncodedQuery(input.encodedQuery, true);
        gr.chooseWindow(0, totalCount);
        gr.query();

        var data = {
            "data": {
                "GlideRecord_Query": {},
                "source_instances": [],
                "mifview": useVTable
            }
        };
        data.data.GlideRecord_Query['sn_instance_clone_request'] = {
            "_table_metadata": {
                "label": gr.getLabel(),
                "displayValue": gr.getDisplayName(),
                "canWrite": gr.canWrite(),
                "canDelete": gr.canDelete(),
                "canCreate": gr.canCreate(),
                "canRead": gr.canRead()
            },
            "_results": [],
            "_rowCount": 0
        };
        var payload = {
            data: data.data
        };
        var records = [];

        while (gr.next()) {
            var scheduledVal = gr.getValue(scheduledField);
            var estimatedDuration = gr.getValue(durationField);
            var sch = scheduledVal ? new GlideDateTime(scheduledVal) : null;
            var est = estimatedDuration ? new GlideDateTime(estimatedDuration).getTime() : null;
            if (sch && est !== null) {
                sch.add(est);
            }
            var record = {
                "_row_data": {
                    "displayValue": gr.getDisplayValue(),
                    "uniqueValue": useVTable ? gr.getValue('request_sys_id') : gr.getUniqueValue()
                },
                "estimated_end_time": {
                    "displayValue": sch ? sch.getDisplayValue() : null
                }
            };
            for (var i in return_fields) {
                record[return_fields[i]] = {
                    "value": gr.getValue(return_fields[i]),
                    "displayValue": gr.getDisplayValue(return_fields[i])
                };
            }
            if (tableName === 'sn_instance_clone_request' && !gr.getValue('source_instance')) {
                record['source_instance'] = {
                    "value": gs.getProperty('instance_name'),
                    "displayValue": gs.getProperty('instance_name')
                };
            }
            records.push(record);
        }

        if (useVTable) {
            payload.data.source_instances = this.getUniqueSourceInstancesFromVTable();
        }

        // ── Dedup: latest per source|target pair ─────────────────────
        var latestPerPair = {};
        records.forEach(function(record) {
            var source = record['source_instance'] ? record['source_instance'].value : '__none__';
            var target = record['target_instance'] ? record['target_instance'].value : '__none__';
            var pairKey = source + '|' + target;
            var completedVal = record['completed'] && record['completed'].value ?
                record['completed'].value :
                record['scheduled'] && record['scheduled'].value ?
                record['scheduled'].value : '';
            if (!latestPerPair[pairKey] || completedVal > latestPerPair[pairKey].completedVal) {
                latestPerPair[pairKey] = {
                    record: record,
                    completedVal: completedVal
                };
            }
        });
        var deduped = Object.keys(latestPerPair).map(function(k) {
            return latestPerPair[k].record;
        });

        payload.data.GlideRecord_Query.sn_instance_clone_request._results = deduped.slice(pageOffset, pageOffset + pageLimit);
        payload.data.GlideRecord_Query.sn_instance_clone_request._rowCount = deduped.length;
        return payload;
    },

    getCloneHomeDictionaryFields: function() {
        var colTypeLabelMap = {};

        var gr = new GlideRecord('sys_dictionary');
        gr.addQuery('name', 'sn_instance_clone_request');
        gr.addQuery('internal_type', '!=', 'collection');
        gr.query();

        while (gr.next()) {
            var element = gr.element.toString();
            var label = gr.column_label.toString();

            switch (element) {
                case 'change_number':
                case 'request_id':
                    colTypeLabelMap[element] = {
                        key: element,
                        type: 'link',
                        label: label
                    };
                    break;

                case 'state':
                    colTypeLabelMap[element] = {
                        key: element,
                        type: 'custom',
                        componentTag: 'now-highlighted-value',
                        label: label
                    };
                    break;

                default:
                    colTypeLabelMap[element] = {
                        key: element,
                        type: 'string',
                        label: label
                    };
            }
        }

        return {
            colTypeLabelMap: colTypeLabelMap
        };
    },


    getUniqueSourceInstancesFromVTable: function() {
        var sourceInstancesArray = [];
        var sourceInstancesSet = {};
        sourceInstancesArray.push({
            id: 'l1',
            label: gs.getMessage('All')
        });
        try {
            var gr = new GlideAggregate('sn_instance_clone_request_vtable');
            gr.query();
            while (gr.next()) {
                var instanceNameVTable = gr.getValue('instance_id');
                if (instanceNameVTable && !sourceInstancesSet[instanceNameVTable]) {
                    sourceInstancesSet[instanceNameVTable] = true;
                    sourceInstancesArray.push({
                        id: instanceNameVTable,
                        label: gr.getDisplayValue('instance_id')
                    });
                }
            }
        } catch (e) {
            SncCloneLoggerUtil.warn('VTable not ready: ' + e.message, this.type);
        }
        return sourceInstancesArray;
    },

    getCloneRequestPageDetails: function(input) {
        var payload = {};
        payload.cloneRequestId = this.getCloneRequestId();
        payload.targetInstances = this.getTargetInstances();
        payload.sourceInstances = this.getSourceInstances();
        payload.cloneProfiles = this.getCloneProfiles();

        var _cloneProfile = payload.cloneProfiles.find(function(el) {
            return el.isDefault == '1';
        });
        payload.preSelectedDefaultProfile = _cloneProfile ? _cloneProfile.id : '';
        payload.cloneProfileData = this.getCloneProfileRecord(payload.preSelectedDefaultProfile);

        payload.users = this.getSysUsers("");
        payload.currentUser = this.getCurrentUserDetails();
        payload.cloneRequestData = this.getCloneRequestData();
        payload.iframeUrl = this.getiFrameUrl();
        return payload;
    },

    getiFrameUrl: function() {
        var hostUrl = this.replaceIpWithLocalhost(gs.getProperty('glide.servlet.uri'));
        return hostUrl + 'cac?id=get_oauth_token';
    },

    replaceIpWithLocalhost: function(input) {
        if (!input) return input;

        // Match <ip_address>:<port> pattern
        var ipPortRegex = /(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}):(\d+)/;

        if (ipPortRegex.test(input)) {
            return input.replace(ipPortRegex, 'localhost:$2');
        }

        return input;
    },

    fetchMIFInstances: function(searchinput, page) {
        var result = {};
        var search = (searchinput || '').trim();
        var currentInstanceId = gs.getProperty('instance_id');

        // Get IDs that are already MIF-enabled
        var enabledIds = [];
        var enabledGr = new GlideRecord('sn_instance_clone_mif_enabled_instance');
        enabledGr.query();
        while (enabledGr.next()) {
            enabledIds.push(enabledGr.getValue('trustor_instance_id'));
        }

        // Get valid instance IDs from instance table
        var validInstanceIds = [];
        var instGr = new GlideRecord('instance');
        instGr.query();
        while (instGr.next()) {
            validInstanceIds.push(instGr.getValue('instance_id'));
        }

        // Query MIF instances excluding already enabled ones and current instance
        var gr = new GlideRecord('sn_mif_instance');

        gr.addQuery('instance_id', '!=', currentInstanceId);

        if (enabledIds.length > 0) {
            gr.addQuery('instance_id', 'NOT IN', enabledIds);
        }
        if (validInstanceIds.length > 0) {
            gr.addQuery('instance_id', 'IN', validInstanceIds);
        }
        if (search) {
            gr.addEncodedQuery('instance_nameLIKE' + search, true);
        }

        gr.orderBy('instance_name');
        gr.query();

        var records = [];
        while (gr.next()) {
            records.push({
                itemId: gr.getValue('instance_id'),
                label: gr.getValue('instance_name'),
                checked: false,
                readonly: false,
                instance_name: gr.getValue('instance_name')
            });
        }

        result.body = {
            records: records,
            page: page,
            totalItems: records.length
        };

        return result;
    },

    setupMIFInstances: function(trustorInstances) {
        gs.info("trustor instance: " + JSON.stringify(trustorInstances));
        var cloneRestService = new sn_instance_clone.CloneRestService();
        var result = {};
        var trusteeInstance = gs.getProperty('instance_id');
        result.body = cloneRestService.setupTrustorInstances(trustorInstances, trusteeInstance);
        result.status = this.setStatus(result.body);
        return result;
    },

    toggleMifSetupPopUpProp: function() {
        gs.setProperty('sn_instance_clone.show.homepage.mif.setup.popup', false);
    },

    isMifEnabled: function() {
        var result = {};
        var body = {};
        var isMifEnabled = JSON.parse(gs.getProperty("sn_instance_clone.enable.mif")) || false;
        body.isMifEnabled = isMifEnabled;
        result.body = body;
        result.status = this.setStatus(result.body);
        return result;
    },

    cleanupMifPopUpPref: function() {
        var prefGr = new GlideRecord('sys_user_preference');
        prefGr.addQuery('name', 'STARTSWITH', 'mif_remind_me_in_7days');
        prefGr.addQuery('sys_updated_on', '<', this.sevenDaysAgo);
        prefGr.query();

        while (prefGr.next()) {
            gs.info('Deleting preference: ' + prefGr.name);
            prefGr.deleteRecord();
        }
    },

    toggleMifEnable: function(toggle) {
        var result = {},
            body = {
                toggleProperty: false,
                updated: false
            };
        result.body = body;
        try {
            var gr = new GlideRecord('sys_properties');
            gr.addQuery('name', 'sn_instance_clone.enable.mif');
            gr.query();
            while (gr.next()) {
                gr.setValue('value', toggle);
                gr.update();
            }
            body.toggleProperty = toggle;
            body.updated = true;
            result.status = this.setStatus(result.body);
        } catch (e) {
            result.isError = true;
            body.message = e;
            body.toggleProperty = !toggle;
        }
        result.body = body;
        return result;
    },

    removeAllTrust: function() {
        var trustorInstances = [];

        //all records with trust status failure and remove all those records 
        var gr1 = new GlideRecord('sn_instance_clone_mif_enabled_instance');
        gr1.addEncodedQuery('trust_statusINfailure,set-up failed,remove failed', true);
        gr1.query();

        while (gr1.next()) {
            gr1.deleteRecord(); // Deletes each matching record
        }

        var gr = new GlideRecord('sn_instance_clone_mif_enabled_instance');
        gr.query();
        while (gr.next()) {
            trustorInstances.push({
                instance_id: gr.getValue('trustor_instance_id'),
                operation_type: "remove",
                instance_name: gr.getValue('trustor_instance_id')
            });
        }
        gs.info("trustor instance: " + JSON.stringify(trustorInstances));
        var cloneRestService = new sn_instance_clone.CloneRestService();
        var result = {};
        var trusteeInstance = gs.getProperty('instance_id');
        result.body = cloneRestService.setupTrustorInstances(trustorInstances, trusteeInstance);
        result.status = this.setStatus(result.body);
        return result;
    },

    triggerVtable: function() {
        var result = {};
        var body = {
            isTriggered: false,
            isError: false,
            message: ""
        };
        result.body = body;
        try {
            var cloneRequestGr = new GlideRecord('sn_instance_clone_request');
            cloneRequestGr.query();
            if (cloneRequestGr.next()) {
                cloneRequestGr.setValue('sys_updated_on', new GlideDateTime());
                cloneRequestGr.update();
                body.isTriggered = true;
            }
            result.status = this.setStatus(result.body);
        } catch (e) {
            body.isError = true;
            body.message = gs.getMessage('Error in MIF instances settings please try again');
            SncCloneLoggerUtil.error(body.message + ": Error : " + e, this.className);
        }
        return result;
    },

    getCloneMIFData: function() {
        var payload = {};

        // Get MIF enabled status
        var isMifEnabled = JSON.parse(gs.getProperty("sn_instance_clone.enable.mif")) || false;
        payload.isMifEnabled = isMifEnabled;

        // Get trustor instances
        var trustorInstances = [];
        var gr = new GlideRecord('sn_instance_clone_mif_enabled_instance'); // adjust table name as needed
        gr.query();
        while (gr.next()) {
            trustorInstances.push({
                itemId: gr.getValue('trustor_instance_id'),
                instance_name: gr.getValue('trustor_instance_name') || '',
                label: gr.getValue('trustor_instance_name') || '',
                status: gr.getValue('trust_status') || '',
                failureReason: gr.getValue('trust_failure_reason') || ''
            });
        }
        payload.trustorInstances = trustorInstances;

        return payload;
    },

    getCloneMIFInstances: function() {
        var mifInstances = this.fetchMIFInstances();
        return mifInstances.body;
    },

    duplicateCloneProfile: function(sourceProfileSysId, valuePairs) {
        var result = {};

        gs.getSession().putClientData('sn_clone_is_duplicate', 'true');

        var newProfileSysId = this._grRecordCreator('clone_profile', valuePairs);

        gs.getSession().putClientData('sn_clone_is_duplicate', '');

        if (!newProfileSysId) {
            result.body = {
                isError: true,
                message: gs.getErrorMessages()[0]
            };
            result.status = 400;
            return result;
        }

        // Skip copy if BR preloaded records (old glide) — preserves old behavior
        if (!this._isProfilePreloaded(newProfileSysId))
            sn_instance_clone.ProfileUtils.duplicateProfile(sourceProfileSysId, newProfileSysId);

        result.body = {
            isError: false,
            sysId: newProfileSysId
        };
        result.status = this.setStatus(result.body);
        return result;
    },

    _isProfilePreloaded: function(profileSysId) {
        var tables = [
            CloneConstants.tableName.CLONE_PROFILE_EXCLUSION,
            CloneConstants.tableName.CLONE_PROFILE_PRESERVER,
            CloneConstants.tableName.CLONE_PROFILE_CLEANUP_SCRIPT
        ];
        for (var i = 0; i < tables.length; i++) {
            var gr = new GlideRecord(tables[i]);
            gr.addQuery('profile', profileSysId);
            gr.setLimit(1);
            gr.query();
            if (gr.next()) return true;
        }
        return false;
    },

    getVersionInfo: function() {
        var result = {};
        var gr = new GlideRecord('sys_store_app');
        gr.addQuery('sys_id', '31774a2953839110a6f8ddeeff7b12cb');
        gr.query();
        if (gr.next()) {
            result.currentVersion = gr.getValue('version');
            result.latestVersion = gr.getValue('latest_version');
            result.isUpToDate = (result.currentVersion == result.latestVersion);
        }

        var raw = gs.getProperty('sn_appclient.apps_last_sync_time');
        if (raw) {
            var gdt = new GlideDateTime(raw);
            result.lastSyncTime = gdt.getDisplayValue(); // converts to session user's timezone
        } else {
            result.lastSyncTime = 'Never';
        }

        return result;
    },

    saveLastChecked: function() {
        try {
            var result = {};
            var timestamp = new Date().toLocaleString();
            gs.getUser().savePreference('clone_last_checked', timestamp);
            result.status = 200;
            result.body = {
                isError: false,
                lastChecked: timestamp
            };
        } catch (ex) {
            result.body = {
                isError: true,
                error: ex + ''
            };
            result.status = 400;
        }
        return result;
    },

    getLastChecked: function() {
        return gs.getUser().getPreference('clone_last_checked') || 'Never';
    },

    getCleanupScriptExecData: function() {
        var gr = new GlideAggregate('sn_instance_clone_cleanup_script_execution');
        gr.addAggregate('COUNT', 'status');
        gr.groupBy('status');
        gr.query();

        var counts = {
            completed: 0,
            error: 0,
            running: 0,
            scheduled: 0,
            ready: 0,
            not_executed: 0
        };
        var total = 0;
        while (gr.next()) {
            var st = gr.getValue('status');
            var cnt = parseInt(gr.getAggregate('COUNT', 'status'));
            if (counts.hasOwnProperty(st)) counts[st] = cnt;
            total += cnt;
        }

        var parts = [];
        if (counts.completed) parts.push(gs.getMessage('{0} Completed',counts.completed));
        if (counts.error) parts.push(gs.getMessage('{0} Failed',counts.error));
        if (counts.not_executed) parts.push(gs.getMessage('{0} Skipped',counts.not_executed));
        if (counts.running) parts.push(gs.getMessage('{0} Executing',counts.running));
        if (counts.scheduled) parts.push(gs.getMessage('{0} Scheduled',counts.scheduled));

        return {
            total: total,
            counts: counts,
            summaryText: gs.getMessage('{0} scripts: {1}',total, parts.join(' \u00b7 ')),
            hideAlert: !counts.error // true = no errors → hide; false = errors exist → show
        };
    },

    type: 'AdminCloneUtil'
};

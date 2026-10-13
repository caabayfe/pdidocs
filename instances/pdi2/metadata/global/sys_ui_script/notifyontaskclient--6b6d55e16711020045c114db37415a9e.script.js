/**
 *  Usage:
 *
 *   function openPopUpSMS() {
 *       var notifyOnTask = new NotifyOnTaskClient(g_form.getTableName(), g_form.getUniqueValue());
 *       notifyOnTask.setNumber(g_form.getValue("number"));
 *       notifyOnTask.setSubmitCallback(smsOnSubmitCallback);
 *       notifyOnTask.setSuccessCallback(smsOnSuccessCallback);
 *       notifyOnTask.setCancelCallback(smsCancelCallback);
 *       notifyOnTask.setErrorCallback(function() {});
 *       notifyOnTask.openForSms();
 *   }
 *
 *  function smsOnSuccessCallback(notifyParameters, formObj, formParameters, data) {
 *	    var obj = $j.parseJSON(data);
 *      for (var i=0; obj.successMessages.length > i; i++) {
 *		    g_form.addInfoMessage(obj.successMessages[i]);
 *      }
 *
 *      for (var j=0; obj.errorMessages.length > j; j++) {
 *	        g_form.addErrorMessage(obj.errorMessages[j]);
 *      }
 *  }
 *
 *  function smsOnSubmitCallback(notifyParameters, formObj, formParameters) {
 *      notifyParameters.dlgWindow.destroy();
 *  }
 *
 *  function smsCancelCallback(notifyParameters) {
 *	    notifyParameters.dlgWindow.destroy();
 *  }
 *
 **/
if (typeof NotifyOnTaskClient == 'undefined') {
    window.NotifyOnTaskClient = (function() {
        function NotifyOnTaskClient(source_table, sys_id, confId, uiPage, siProcessor) {
            this.sourceTable = source_table;
            this.sysId = sys_id;
            this.confId = confId;
            this.uiPage = uiPage;
            this.siProcessor = siProcessor || 'NotifyOnTaskAjaxProcessor_V2';
            this.number = null;
            this.submitCallback = null;
            this.successCallback = null;
            this.errorCallback = null;
            this.cancelCallback = null;
            this.notifyType = "sms";
            this.showLoading = false;
            this.showAllMsgs = false;
            // default values
            this.addToWorkNotes = false;
            this.reloadPage = false;
            this.allowMulticonference = false;

            this.isSMS = false;

            this.setNumber = function(val) {
                this.number = val;
            };
            this.setAllowMulticonfernece = function(val) {
                this.allowMulticonference = val;
            };
            this.setReloadPage = function(val) {
                this.reloadPage = val;
            };

            this.setAddToWorkNotes = function(val) {
                this.addToWorkNotes = val;
            };

            this.setNotifyType = function(val) {
                this.notifyType = val;
            };

            this.setShowLoading = function(val) {
                this.showLoading = val;
            };

            this.setSourceTable = function(val) {
                this.sourceTable = val;
            };

            this.setSysId = function(val) {
                this.sysId = val;
            };

            /**
             * Callback immediately ran after we send the data to the server.  Allows dialog to be dismissed before success/error is returned.
             */
            this.setSubmitCallback = function(callback) {
                this.submitCallback = callback;
            };

            this.hasSubmitCallback = function() {
                return (this.submitCallback != null);
            };

            /**
             * Callback immediately ran after we send the data to the server.  Allows dialog to be dismissed before success/error is returned.
             */
            this.setSuccessCallback = function(callback) {
                this.successCallback = callback;
            };

            this.hasSuccessCallback = function() {
                return (this.successCallback != null);
            };

            /**
             * Callback immediately ran after we send the data to the server.  Allows dialog to be dismissed before success/error is returned.
             */
            this.setCancelCallback = function(callback) {
                this.cancelCallback = callback;
            };

            this.hasCancelCallback = function() {
                return (this.cancelCallback != null);
            };

            /**
             * Callback immediately ran after we send the data to the server.  Allows dialog to be dismissed before success/error is returned.
             */
            this.setErrorCallback = function(callback) {
                this.errorCallback = callback;
            };

            this.hasErrorCallback = function() {
                return (this.errorCallback != null);
            };

            this.open = function(title, notifyType) {
                if (notifyType)
                    this.setNotifyType(notifyType);
                var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
                var dialog = new dialogClass("notify_on_task");
                dialog.setWidth("350");
                dialog.setTitle(title);
                //Required
                dialog.setPreference("source_table", this.sourceTable);
                dialog.setPreference("sys_id", this.sysId);
                dialog.setPreference("type", this.notifyType);
                dialog.setPreference("add_to_work_notes", this.addToWorkNotes);
                dialog.setPreference("show_loading", this.showLoading);
                //Optional
                if (this.hasSubmitCallback)
                    dialog.setPreference("submit_callback", this.submitCallback);
                if (this.hasCancelCallback)
                    dialog.setPreference("cancel_callback", this.cancelCallback);
                if (this.hasSuccessCallback)
                    dialog.setPreference("success_callback", this.successCallback);
                if (this.hasErrorCallback)
                    dialog.setPreference("error_callback", this.errorCallback);

                dialog.render(); // Open the dialog box
            };

            this.openForSms = function() {
                this.open(new GwtMessage().format("SMS alert for {0}", this.number), "sms");
            };

            this.openForConferenceCall = function() {
                this.open(new GwtMessage().format("Conference call for {0}", this.number), "conference");
            };
            this.showResults = function(par1, par2, par3, result) {
                if (!this.showAllMsgs)
                    return;
                g_form.clearMessages();
                var i = 0;
                if (Array.isArray(result.errorMessages)) {
                    for (i = 0; i < result.errorMessages.length; i++)
                        g_form.addErrorMessage(result.errorMessages[i]);
                }
                if (Array.isArray(result.successMessages)) {
                    for (i = 0; i < result.successMessages.length; i++)
                        g_form.addInfoMessage(result.successMessages[i]);
                }
                if (Array.isArray(result.warnMessages)) {
                    for (i = 0; i < result.warnMessages.length; i++)
                        g_form.addWarningMessage(result.warnMessages[i]);
                }
            };
            var self = this;
            var NOTIFY_CONFERENCE_DIALOG_MSG = 'NOTIFY_CONFERENCE_DIALOG_MSG';
            CustomEvent.un(NOTIFY_CONFERENCE_DIALOG_MSG, NotifyOnTaskClient.observeConferenceDialogEvents);
            NotifyOnTaskClient.observeConferenceDialogEvents = function(msg) {
                var dlg = GlideModal.prototype.get(self.uiPage);
                if (dlg == null)
                    return;
                var callback = null;
                if (msg.cmd == 'cancel') {
                    CustomEvent.un(NOTIFY_CONFERENCE_DIALOG_MSG, NotifyOnTaskClient.observeConferenceDialogEvents);
                    dlg.destroy();
                    callback = self.cancelCallback;
                } else if (msg.cmd == 'submit') {
                    callback = self.submitCallback;
                } else if (msg.cmd == 'ok') {
                    CustomEvent.un(NOTIFY_CONFERENCE_DIALOG_MSG, NotifyOnTaskClient.observeConferenceDialogEvents);
                    dlg.destroy();
                    if (msg.data && msg.data.status)
                        callback = self.successCallback;
                    else
                        callback = self.errorCallback;
                } else
                    return;
                if (msg.cmd == 'cancel' || msg.cmd == 'ok')
                    callback = callback || self.showResults.bind(self);
                if (!callback)
                    return;
                try {
                    // compatible to older callbacks
                    callback({}, {}, {}, msg.data || []);
                } catch (e) {} finally {
                    if (self.reloadPage && (msg.cmd == 'ok'))
                        document.location.reload();
                }
            };
            // Allowed parameters in dialogOptions - title
            this.openConferenceDialog = function(data, dialogOptions) {
                CustomEvent.un(NOTIFY_CONFERENCE_DIALOG_MSG, NotifyOnTaskClient.observeConferenceDialogEvents);
                CustomEvent.observe(NOTIFY_CONFERENCE_DIALOG_MSG, NotifyOnTaskClient.observeConferenceDialogEvents);
                if (!data)
                    data = NotifyOnTaskClient.getNotifyActionTemplate();
                data.table = data.table || this.sourceTable;
                data.sysId = data.sysId || this.sysId;
                data.confId = data.confId || this.confId;
                data.uiPage = data.uiPage || this.uiPage || DEFAULT_START_UI_PAGE;
                for (var prop in data) {
                    if (this[prop])
                        this[prop] = data[prop];
                }
                data.uiPage = data.uiPage || this.uiPage || DEFAULT_START_UI_PAGE;
                data.isSMS = false;
                data.showConferenceTitle = true;
                if (typeof data.showAllMsgs != 'undefined')
                    this.showAllMsgs = data.showAllMsgs;
                if (typeof data.addToWorkNotes != 'undefined')
                    this.addToWorkNotes = data.addToWorkNotes;
                if (typeof data.reloadPage != 'undefined')
                    this.reloadPage = data.reloadPage;
                if (typeof data.allowMulticonference != 'undefined')
                    this.allowMulticonference = data.allowMulticonference;
                var inputData = NotifyOnTaskClient.getNotifyActionTemplate();
                for (var p in data)
                    inputData[p] = data[p];
                if ((typeof inputData.confId == 'string') && inputData.confId.length > 0) {
                    inputData.siProcessor = inputData.siProcessor || 'NotifyOnTaskAjaxProcessor_V2';
                    var ga = new GlideAjax(inputData.siProcessor);
                    ga.addParam('sysparm_name', 'isConferenceActive');
                    ga.addParam('sysparm_data', JSON.stringify(inputData));
                    ga.getXMLAnswer(function(r) {
                        var result = JSON.parse(r);
                        if (!result.status) {
                            self.showResults(undefined, undefined, undefined, result);
                            return;
                        }
                        getMessage('Add Participants', function(title) {
                            self.openIframeDialog(title, data);
                        });
                    });
                } else {
                    if (dialogOptions && dialogOptions.title)
                        self.openIframeDialog(dialogOptions.title, data);
                    else
                        getMessage('Initiate conference call', function(title) {
                            self.openIframeDialog(title, data);
                        });
                }
            };
            var DEFAULT_END_UI_PAGE = 'notify_end_conference_dialog';
            var DEFAULT_START_UI_PAGE = 'notify_conference_dialog';
            var DEFAULT_MANAGE_CONFERENCE_UI_PAGE = 'notify_manage_conference_dialog';
            var NOTIFY_MANAGE_CONFERENCE_DIALOG_MSG = 'NOTIFY_MANAGE_CONFERENCE_DIALOG_MSG';
            NotifyOnTaskClient.observeManageConferenceDialogEvents = function(msg) {
                var dlg = GlideModal.prototype.get(self.uiPage);
                if (dlg == null)
                    return;
                var callback = null,
                    client;
                CustomEvent.un(NOTIFY_MANAGE_CONFERENCE_DIALOG_MSG, NotifyOnTaskClient.observeManageConferenceDialogEvents);
                dlg && dlg.destroy();
                if (msg.cmd == 'cancel') {
                    callback = self.cancelCallback;
                } else if (msg.cmd == 'joinconference') {
                    self.showAllMsgs = true;
                    self.showResults(undefined, undefined, undefined, msg.data);
                } else if (msg.cmd == 'addparticipant') {
                    if (msg.data && msg.data.confId) {
                        client = new NotifyOnTaskClient("", "", msg.data.confId, msg.data.uiPage || DEFAULT_START_UI_PAGE);
                        var addPartData = {
                            showAllMsgs: true,
                            reloadPage: false,
                            confId: msg.data.confId
                        };
                        if (msg.data.addToWorkNotes)
                            addPartData.addToWorkNotes = msg.data.addToWorkNotes;
                        client.openConferenceDialog(addPartData);
                    }
                } else if (msg.cmd == 'endconference') {
                    if (msg.data && msg.data.confId) {
                        client = new NotifyOnTaskClient("", "", msg.data.confId, msg.data.uiPage || DEFAULT_END_UI_PAGE);
                        var endData = NotifyOnTaskClient.getNotifyActionTemplate();
                        endData.showAllMsgs = true;
                        endData.confId = msg.data.confId;
                        endData.serviceProvider = msg.data.serviceProvider;
                        client.openEndConferenceDialog(endData);
                    }
                } else
                    return;
                if (!callback)
                    return;
                try {
                    // compatible to older callbacks
                    callback({}, {}, {}, msg.data || []);
                } catch (e) {} finally {
                    if (self.reloadPage)
                        document.location.reload();
                }
            };

            this.openManageConferenceDialog = function(data) {
                CustomEvent.un(NOTIFY_MANAGE_CONFERENCE_DIALOG_MSG, NotifyOnTaskClient.observeManageConferenceDialogEvents);
                CustomEvent.observe(NOTIFY_MANAGE_CONFERENCE_DIALOG_MSG, NotifyOnTaskClient.observeManageConferenceDialogEvents);
                if (!data)
                    data = NotifyOnTaskClient.getNotifyActionTemplate();
                data.table = data.table || this.sourceTable;
                data.sysId = data.sysId || this.sysId;
                var self = this;
                data.uiPage = data.uiPage || self.uiPage || DEFAULT_MANAGE_CONFERENCE_UI_PAGE;
                getMessage('Manage Conferences', function(title) {
                    self.openIframeDialog(title, data);
                });
            };

            this.openEndConferenceDialog = function(data, successCallback, cancelCallback) {
                if (!data)
                    throw new Error('Invalid input data');
                for (var prop in data) {
                    if (data[prop])
                        this[prop] = data[prop];
                }
                CustomEvent.un(NOTIFY_CONFERENCE_DIALOG_MSG, NotifyOnTaskClient.observeConferenceDialogEvents);
                CustomEvent.observe(NOTIFY_CONFERENCE_DIALOG_MSG, NotifyOnTaskClient.observeConferenceDialogEvents);
                var self = this;
                data.uiPage = data.uiPage || this.uiPage || DEFAULT_END_UI_PAGE;
                if (successCallback)
                    this.successCallback = successCallback;
                if (cancelCallback)
                    this.cancelCallback = cancelCallback;
                getMessage("End Conference", function(title) {
                    self.openIframeDialog(title, data, 'modal-sm');
                });
            };
            this.openIframeDialog = function(title, data, width, height) {
                this.uiPage = data.uiPage;
                data.table = this.sourceTable;
                var inputData = NotifyOnTaskClient.getNotifyActionTemplate();
                if (data) {
                    for (var p in data)
                        inputData[p] = data[p];
                }
                inputData.table = inputData.table || this.sourceTable;
                inputData.sysId = inputData.sysId || this.sysId;
                inputData.uiPage = inputData.uiPage || this.uiPage;

                function openDialog() {
                    if (!inputData.uiPage)
                        throw new Error("Empty UIPage");
                    var queryParms = 'sysparm_focustrap=true&sysparm_wb=true&sysparm_stack=no';
                    queryParms += '&sysparm_data=' + encodeURIComponent(JSON.stringify(inputData));
                    var url = data.uiPage + '.do?' + queryParms;
                    var dialog = new GlideModal(data.uiPage, false, width || 'modal-md', height || 250);
                    ScriptLoader.getScripts('/scripts/incident/glide_modal_accessibility.js', function() {
                        dialog.template = glideModalTemplate;
                        dialog.on('bodyrendered', function(event) {
                            glideModalKeyDownHandler(event, dialog.getID());
                        });
                        dialog.on('beforeclose', function() {
                            // clean up everything
                            CustomEvent.un(NOTIFY_CONFERENCE_DIALOG_MSG, NotifyOnTaskClient.observeConferenceDialogEvents);
                            CustomEvent.un(NOTIFY_MANAGE_CONFERENCE_DIALOG_MSG, NotifyOnTaskClient.observeManageConferenceDialogEvents);
                        });
                        dialog.renderIframe(url, function() {});
                        dialog.setTitle(title);
                        dialog.updateTitle();
                    });
                }
                openDialog();
            };
            this.openSmsDialog = function(data) {
                CustomEvent.un(NOTIFY_CONFERENCE_DIALOG_MSG, NotifyOnTaskClient.observeConferenceDialogEvents);
                CustomEvent.observe(NOTIFY_CONFERENCE_DIALOG_MSG, NotifyOnTaskClient.observeConferenceDialogEvents);
                if (!data)
                    data = NotifyOnTaskClient.getNotifyActionTemplate();
                data.isSMS = true;
                data.uiPage = data.uiPage || this.uiPage || DEFAULT_START_UI_PAGE;
                var self = this;
                getMessage('Send SMS', function(title) {
                    self.openIframeDialog(title, data);
                });
            };
        }
        var registeredProviders = {};
        /**
         * @type {Promise}
         */
        var spDetailsPromise;
        /**
         * @type {{ caps: Object, api: Array<string> }}
         */
        var serviceProviderDetails = {
            caps: {},
            api: []
        };
        var confIdPromiseMap = {};
        var capMap = {};
        /**
         *
         * @param {Function} API
         */
        NotifyOnTaskClient.registerServiceProvider = function(API) {
            /**
             * @type {string}
             */
            var name;
            if (typeof API == 'function' && typeof API.prototype.getName == 'function') {
                try {
                    name = API.prototype.getName.call(undefined);
                } catch (e) {}
            }
            if (typeof name != 'string')
                throw new Error('Provider name must be string');
            name = name.trim();
            if (name.length == 0)
                throw new Error('Not a valid provider');
            registeredProviders[name] = API;
        };
        NotifyOnTaskClient.getCapabilityTypes = function() {
            return {
                NOT_SUPPORTED: 0,
                FULLY_SUPPORTED: 1
            };
        };
        NotifyOnTaskClient.getConferenceDetails = function(confId) {
            var actionPromise = jQuery.Deferred();
            var headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            };
            if (typeof g_ck === 'string' && g_ck.length > 0)
                headers['X-UserToken'] = g_ck;
            jQuery.ajax({
                url: '/api/now/notify/ConferenceDetails/' + confId,
                type: 'GET',
                data: {},
                headers: headers,
                success: function(response) {
                    var result = JSON.parse(response.result);
                    actionPromise.resolve(result);
                },
                fail: function(jqXHR, textStatus) {
                    actionPromise.reject(textStatus);
                }
            });
            return actionPromise;
        };
        NotifyOnTaskClient.getCapabilityMap = function() {
            var spDetails = NotifyOnTaskClient.getServiceProviderDetails();
            for (var providerName in spDetails.caps) {
                capMap[providerName] = {};
                var spInstance = NotifyOnTaskClient.getServiceProviderAPIInstance(providerName);
                var caps = spDetails.caps[providerName];
                for (var cap in caps) {
                    var r = spInstance.isActionSupported(cap);
                    capMap[providerName][cap] = r;
                }
            }
            return capMap;
        };
        NotifyOnTaskClient.getAllServiceProvidersCapabilities = function() {
            /**
             * @type {Promise<any>}
             */
            var capPromise = jQuery.Deferred();
            NotifyOnTaskClient.fetchServiceProviderDetails().then(function() {
                var capMap = NotifyOnTaskClient.getCapabilityMap();
                capPromise.resolve(capMap);
            }, function() {
                capPromise.reject("Unable to find capabilities");
            });
            return capPromise;
        };
        NotifyOnTaskClient.getServiceProviderCapabilities = function(serviceProviderName) {
            var capPromise = jQuery.Deferred();
            NotifyOnTaskClient.getAllServiceProvidersCapabilities().then(function(allCaps) {
                capPromise.resolve(allCaps[serviceProviderName]);
            }, function() {
                capPromise.reject("unable to find service provider");
            });
            return capPromise;
        };
        NotifyOnTaskClient.getConferenceCapabilities = function(confId, spName) {
            if (typeof spName == 'string' && spName.length > 0)
                return NotifyOnTaskClient.getServiceProviderCapabilities(spName);
            if (confIdPromiseMap[confId])
                return confIdPromiseMap[confId];
            var capPromise = jQuery.Deferred();
            confIdPromiseMap[confId] = capPromise;
            NotifyOnTaskClient.getConferenceDetails(confId).then(function(resp) {
                if (!resp.service_provider)
                    return capPromise.reject("Unable to find service provider");
                NotifyOnTaskClient.getServiceProviderCapabilities(resp.service_provider).then(function(spCaps) {
                    capPromise.resolve(spCaps);
                }, function(reason) {
                    capPromise.reject(reason);
                });
            }, function(errorResp) {
                capPromise.reject(errorResp);
            });
            return capPromise;
        };

        /**
         * @param {string} serviceProvider
         */
        NotifyOnTaskClient.getServiceProviderAPIInstance = function(serviceProvider) {
            if (typeof serviceProvider != 'string')
                return null;
            serviceProvider = serviceProvider.trim();
            if (serviceProvider.length == 0)
                return null;
            if (!registeredProviders[serviceProvider])
                return null;
            var caps = {};
            caps = serviceProviderDetails.caps[serviceProvider];
            var instance = new registeredProviders[serviceProvider](caps);
            return instance;
        };
        NotifyOnTaskClient.getServiceProviderDetails = function() {
            return jQuery.extend(true, {}, serviceProviderDetails);
        };
        /**
         * @param {{ caps: Object, api: Array<string> }} spDetails
         */
        NotifyOnTaskClient.updateServiceProviderDetails = function(spDetails) {
            if (!spDetails)
                return;
            if (!spDetails.caps)
                return;
            if (!Array.isArray(spDetails.api))
                return;
            serviceProviderDetails = spDetails;
            serviceProviderDetails.api.forEach(function(apiImpl) {
                try {
                    var feval = new Function('NotifyOnTaskClient', apiImpl);
                    feval(NotifyOnTaskClient);
                } catch (e) {
                    if (window.console && window.console.error)
                        window.console.error("Error while evaluating service provider script: " + e + "\n\n" + apiImpl);
                }
            });
        };
        NotifyOnTaskClient.getNotifyActionTemplate = function() {
            return {
                /**@type {string} */
                serviceProvider: undefined,
                /**@type {string} */
                table: undefined,
                /**@type {string} */
                sysId: undefined,
                /**@type {string} */
                confId: undefined,
                addToWorkNotes: false,
                allowMulticonference: false,
                /**@type {string} */
                message: undefined,
                isNewConference: false,
                /**@type {string} */
                fromNumber: undefined,
                reloadPage: false,
                showAllMsgs: false,
                /** @type {Array<ParticipantInfo>} */
                items: []
            };
        };
        /**
         * @returns {Promise<{caps: Object, api: Array<string>}>}
         */
        NotifyOnTaskClient.fetchServiceProviderDetails = function() {
            if (spDetailsPromise)
                return spDetailsPromise;
            spDetailsPromise = jQuery.Deferred();
            if (serviceProviderDetails.api.length > 0) {
                return spDetailsPromise.resolve(serviceProviderDetails);
            }
            jQuery.ajax({
                url: '/api/now/notify/serviceProviderDetails',
                type: 'GET',
                data: {},
                headers: {
                    'X-UserToken': g_ck,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                success: function(response) {
                    var result = JSON.parse(response.result);
                    NotifyOnTaskClient.updateServiceProviderDetails(result);
                    spDetailsPromise.resolve(result);
                },
                fail: function(jqXHR, textStatus) {
                    spDetailsPromise.reject(textStatus);
                }
            });
            return spDetailsPromise;
        };
        /**
         * @typedef {{
        			status: boolean, errorMessages: Array<string>,
        			warnMessages: Array<string>,
        			successMessages: Array<string>,
        			details: {[key: string]: any;}
        		}} ConferenceActionResult
        	*/
        /**
         * @typedef {{isSupported?: number, meta?: any}} Capability
         */
        /**
         * @typedef {{
        			start?: Capability,
        			end?: Capability,
        			selfJoin?: Capability,
        			join?: Capability,
        			multiJoin?: Capability,
        			multiMute?: Capability,
        			mute?: Capability,
        			multiMute?: Capability,
        			unmute?: Capability,
        			multiUnmute?: Capability,
        			kick?: Capability,
        			multiKick?: Capability,
        			speaking?: Capability,
        			screenSharing?: Capability,
        			archive?: Capability,
        			muteOnJoin?: Capability,
        			beepOnJoin?: Capability,
        			beepOnLeave?: Capability
        		}} ConferenceCapabilities
        	*/
        /**
         * @typedef {{
        			notifyParticipantId?: string,
        			id: string,
        			name: string,
        			phoneNumber?: string,
        			email?: string
        			users?: Array<{
        				notifyParticipantId?: string,
        				id: string,
        				name: string,
        				phoneNumber?: string,
        				email?: string
        			}>
        		}} ParticipantInfo
        	*/
        /**
         * @typedef {{
        		serviceProvider?: string,
        		table: string,
        		sysId: string,
        		confId?: string,
        		addToWorkNotes?: boolean,
        		allowMulticonference?: boolean,
        		message?: string,
        		isNewConference?: boolean,
        		fromNumber?: string,
        		items?: Array<ParticipantInfo>
        	}} ConferenceInputData
        	*/
        var conferenceActions = {
            START: 'start',
            END: 'end',
            SELF_JOIN: 'selfJoin',
            JOIN: 'join',
            MULTI_JOIN: 'multiJoin',
            MUTE: 'mute',
            MULTI_MUTE: 'multiMute',
            UNMUTE: 'unmute',
            MUTLTI_UNMUTE: 'multiUnmute',
            KICK: 'kick',
            MULTI_KICK: 'multiKick'
        };
        /**
         * @param {ConferenceInputData} data
         * @returns {Promise<Conferenceac<ConferenceActionResult>}
         */
        NotifyOnTaskClient.start = function(data) {
            return NotifyOnTaskClient.doConferenceAction(conferenceActions.START, data);
        };
        /**
         * @param {ConferenceInputData} data
         * @returns {Promise<Conferenceac<ConferenceActionResult>}
         */
        NotifyOnTaskClient.addParticipants = function(data) {
            return NotifyOnTaskClient.doConferenceAction(conferenceActions.MULTI_JOIN, data);
        };
        /**
         * @param {ConferenceInputData} data
         * @returns {Promise<Conferenceac<ConferenceActionResult>}
         */
        NotifyOnTaskClient.endConference = function(data) {
            return NotifyOnTaskClient.doConferenceAction(conferenceActions.END, data);
        };
        /**
         * @param {ConferenceInputData} data
         * @returns {Promise<Conferenceac<ConferenceActionResult>}
         */
        NotifyOnTaskClient.join = function(data) {
            return NotifyOnTaskClient.doConferenceAction(conferenceActions.JOIN, data);
        };
        /**
         * @param {ConferenceInputData} data
         * @returns {Promise<Conferenceac<ConferenceActionResult>}
         */
        NotifyOnTaskClient.multiJoin = function(data) {
            return NotifyOnTaskClient.doConferenceAction(conferenceActions.MULTI_JOIN, data);
        };
        /**
         * @param {ConferenceInputData} data
         * @returns {Promise<Conferenceac<ConferenceActionResult>}
         */
        NotifyOnTaskClient.kick = function(data) {
            return NotifyOnTaskClient.doConferenceAction(conferenceActions.KICK, data);
        };
        /**
         * @param {ConferenceInputData} data
         * @returns {Promise<Conferenceac<ConferenceActionResult>}
         */
        NotifyOnTaskClient.multiKick = function(data) {
            return NotifyOnTaskClient.doConferenceAction(conferenceActions.MULTI_KICK, data);
        };
        /**
         * @param {ConferenceInputData} data
         * @returns {Promise<Conferenceac<ConferenceActionResult>}
         */
        NotifyOnTaskClient.selfJoin = function(data) {
            return NotifyOnTaskClient.doConferenceAction(conferenceActions.SELF_JOIN, data);
        };
        /**
         * @param {string} action
         * @param {ConferenceInputData} data
         * @returns {Promise<Conferenceac<ConferenceActionResult>}
         */
        NotifyOnTaskClient.doConferenceAction = function(action, data) {
            /**
             * @type {PromiseConstructor}
             */
            var actionPromise = jQuery.Deferred();

            function doActionByFetchingSPDetails() {
                NotifyOnTaskClient.fetchServiceProviderDetails().then(function() {
                    var spInstnace = NotifyOnTaskClient.getServiceProviderAPIInstance(data.serviceProvider);
                    if (!spInstnace)
                        return actionPromise.reject('Unable to find service provider implementation');

                    spInstnace.doAction(action, data).then(function(result) {
                        actionPromise.resolve(result)
                    }, function(rejectMsg) {
                        actionPromise.reject(rejectMsg);
                    });

                }, function(r) {
                    actionPromise.reject(r);
                });
            }

            if (typeof action != 'string')
                actionPromise.reject("action must be string");
            if (action.length == 0)
                actionPromise.reject('Not a valid action');
            if (action == conferenceActions.START) {
                if (typeof data.serviceProvider != 'string')
                    return actionPromise.reject('Not a valid service provider name');
                if (data.serviceProvider.length == 0)
                    return actionPromise.reject('Not a valid service provider name');
                doActionByFetchingSPDetails();
                return actionPromise;
            }

            if (typeof data.confId != 'string')
                actionPromise.reject("Not a valid conference Id");
            if (data.confId.length == 0)
                actionPromise.reject("Not a valid conference Id");

            if (data.serviceProvider) {
                doActionByFetchingSPDetails();
                return actionPromise;
            }

            NotifyOnTaskClient.getConferenceDetails(data.confId).then(function(result) {
                data.serviceProvider = result.serviceProvider;
                if (!data.serviceProvider)
                    return actionPromise.reject('Unable to find service provider implementation');
                doActionByFetchingSPDetails();
            }, function(errResponse) {
                actionPromise.reject(errResponse);
            });
            return actionPromise;
        };



        return NotifyOnTaskClient;
    })();
}

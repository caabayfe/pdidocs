function include({
    imports
}) {
    const {
        NowDateTime
    } = imports['sn_uxf.core_libraries']();
    class NotifyConferenceUxfClientUtilSNC {

        static confActions = {
            START: 'start',
            END: 'end',
            JOIN: 'join',
            SELF_JOIN: 'selfJoin',
            MUTE: 'mute',
            MULTI_MUTE: 'multiMute',
            UNMUTE: 'unmute',
            MULT_UNMUTE: 'multiUnmute',
            MULTI_JOIN: 'multiJoin',
            KICK: 'kick',
            MULTI_KICK: 'multiKick',
            ASYNC_START: 'asyncStart',
            ASYNC_MULTI_JOIN: 'asyncMultiJoin'
        };

        static async supportedActionsMap (helpers) {
            var actions = {
                "kick": {
                    "value": "kick",
                    "displayValue": await helpers.translate("Remove")
                },
                "mute": {
                    "value": "mute",
                    "displayValue": await helpers.translate("Mute")
                },
                "unmute": {
                    "value": "unmute",
                    "displayValue": await helpers.translate("Unmute")
                }
            };
            return actions;
        }

        static async  getFliterMenuOptions (helpers) {
            return [{
                "id": "all",
                "label": await helpers.translate("All")
            }, {
                "id": "organized_by_me",
                "label": await helpers.translate("Organized by me")
            }, {
                "id": "organized_by_others",
                "label": await helpers.translate("Organized by others")
            }];
        }

        static ALLOWED_PAGE_TYPES = {
            startConference: "startConference",
            sendSms: "sendSms",
            addParticipants: "addParticipants"
        };

        static TELEPHONY_PROVIDER = "Telephony";

        static GROUP_ICON = "user-group-outline";

        static COLLAPSE_ICON = {
            "EXPANDED": "chevron-up-outline",
            "NOT_EXPANDED": "chevron-down-outline"
        };

        static DEFAULT_NO_OF_CHAR_MESSAGE = 160;

        static DEFAULT_NO_OF_CARDS_TO_LOAD = 50;

        static GFORM_ADD_INFO_MESSAGE = "GFORM#ADD_INFO_MESSAGE";
        static GFORM_ADD_ERROR_MESSAGE = "GFORM#ADD_ERROR_MESSAGE";
        
        static DEFAULT_NO_OF_PARTICIPANTS_TO_LOAD = 100;
        static PARTICIPANTS_DATA_REFRESH_INTERVAL_MS = 2000;
        static REFRESH_PARTICIPANTS_INTERVAL_TIMEOUT_MS = 10000;

        static TYPES = {
            staticPhone: "static_phone",
            staticEmail: "static_email",
            user: "user",
            group: "group",
        };

        static META_PAYLOAD_DELIMETER = ".";

        static UXF_POST_NOTIFY_EVENTS = {
            OPEN_URL_WINDOW: "OPEN_URL_WINDOW"
        };

        static DATE_TIME_FORMAT_CONFERENCE_CALL_CARD = "MMMM DD, YYYY HH:mm a";

        static UXF_POST_EVENT_TEMPLATES = {
            "OPEN_URL_WINDOW": {
                event: "NAV_ITEM_SELECTED",
                payload: {
                    route: null,
                    fields: null,
                    params: null,
                    redirect: null,
                    passiveNavigation: null,
                    title: null,
                    multiInstField: null,
                    targetRoute: null,
                    external: null
                }
            }
        };

        static resetModal(api){
            api.setState("showLoader", true);
            api.setState("selectedParticipantsAndGroups", []);
            api.setState("recommendations", []);
            api.setState("providerSelectors", []);
        };

        static formatMessage(message, values){
            let result = message;
            for (let i = 0; i < values.length; i++){
                result = result.replace(`{${i}}`, values[i]);
            }
            return result;
        }

        static showAlert(api, message, level){
            var payload = {
                "items": [{
                    "id": "notify-error-message",
                    "action": {
                        "type": "dismiss"
                    },
                    "content": {
                        // setting message content type to html to render rich text content properly
                        "type": "html",
                        "value": "<div>" + message + "</div>"
                    },
                    "status": level,
                }]
            };
            api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', payload);
        };

        static showMultipleAlerts(api, alerts, isExternal = false){
            let alertsPayload = {
                items: []
            };
            for (let index in alerts){
                var payload = {
                    "id": `notify-${alerts[index].level}-message-${index}`,
                    "action": {
                        "type": "dismiss"
                    },
                    "content": {
                        // setting message content type to html to render rich text content properly
                        "type": "html",
                        "value": "<div>" + alerts[index].message + "</div>"
                    },
                    "status": alerts[index].level,
                };
                alertsPayload.items.push(payload);
            }
            if (!isExternal)
                api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', alertsPayload);
            else
                api.emit('NOTIFY_ADD_MESSAGES', alertsPayload);
        };

        static getCapabilityTypes() {
            return {
                NOT_SUPPORTED: 0,
                FULLY_SUPPORTED: 1
            };
        };

        static isProviderActionSupported(providerCaps, action){
            const actionSupportInfo = providerCaps[action] || {};
            const capsSupports = this.getCapabilityTypes();
            return capsSupports.FULLY_SUPPORTED == actionSupportInfo.isSupported;
        };

        static getAsyncFallbackAction(asyncFallbackActions, asyncAction){
            const fallBackAction = asyncFallbackActions|| {};
            if (asyncFallbackActions[asyncAction]){
                return asyncFallbackActions[asyncAction];
            }
            return;
        };


        static formatRecommendation(recommendationObj){
            let obj = {
                data: recommendationObj
            };
            if (recommendationObj.users) {
                //Use case for groups
                if (recommendationObj.showGroupName) {
                    obj.pillText = recommendationObj.name;
                    obj.pillValue = recommendationObj.id;
                    obj.id = recommendationObj.id;
                    obj.icon = this.GROUP_ICON;
                } else {
                    obj.users = [];
                    for (let j = 0; j < recommendationObj.users.length; j++) {
                        let userObj = {};
                        userObj.pillText = recommendationObj.users[j].name;
                        userObj.pillValue = recommendationObj.users[j].id;
                        userObj.imageSrc = recommendationObj.users[j].avatarProps.imageSrc ? recommendationObj.users[j].avatarProps.imageSrc + "?t=small" : "";
                        userObj.id = recommendationObj.users[j].id;
                        userObj.data = recommendationObj.users[j];
                        obj.users.push(userObj);
                    }
                }
            } else {
                obj.pillText = recommendationObj.name;
                obj.pillValue = recommendationObj.id;
                obj.imageSrc = recommendationObj.avatarProps.imageSrc ? recommendationObj.avatarProps.imageSrc + "?t=small" : "";
                obj.id = recommendationObj.id;
            }
            return obj;
        };

        static findDifference(currentParticipants, prevParticipants) {
            let difference;
            let foundParticipant = false;
            if (prevParticipants.length > currentParticipants.length){
                for (let index in currentParticipants) {
                    if (currentParticipants[index].id != prevParticipants[index].id) {
                        foundParticipant = true;
                        difference = prevParticipants[index];
                        break;
                    }
                }
                if (!foundParticipant) {
                    difference = prevParticipants[prevParticipants.length - 1];
                }
            }
            else {
                for (let index in prevParticipants) {
                    if (currentParticipants[index].id != prevParticipants[index].id) {
                        foundParticipant = true;
                        difference = currentParticipants[index];
                        break;
                    }
                }
                if (!foundParticipant) {
                    difference = currentParticipants[currentParticipants.length - 1];
                }
            }

            return difference;
        };

        static inRecommendation(participantId, api) {
            const recommendations = api.data.notify_conference_get_recommendations.output;
            return recommendations.reduce((accumulator, recommendation) => {
                    return accumulator.concat(recommendation.users && !recommendation.showGroupName ? [...recommendation.users] : recommendation);
                }, [])
                .filter(recommendation => (api.context.props.type != this.ALLOWED_PAGE_TYPES['sendSms'] || !recommendation.isLoggedIn)) // Filter out the logged in user from recommendations in case of SMS Modal
                .filter(recommendation => recommendation.id == participantId)
                .map(recommendation => this.formatRecommendation(recommendation))[0];
        };

        static inSelectedParticipantsAndGroups(participantId, api) {
            let recommendationParticipant;
            const selectedParticipants = api.state.selectedParticipantsAndGroups;
            for (let index in selectedParticipants) {
                if (selectedParticipants[index].id == participantId) {
                    return true;
                }
            }
            return false;
        };

        static removeFromRecommendation(recommendationObj, filteredRecommendations, api) {
            let result = [];
            for (let index in filteredRecommendations) {
                if (filteredRecommendations[index].id == recommendationObj.id) {
                    continue;
                }
                else{
                    result.push(filteredRecommendations[index]);
                }
            }
            return result;
        };

        static convertPillToMutilAhead(pillTypeParticipant) {
            let convertedParticipant = {
                data: pillTypeParticipant.data
            };
            convertedParticipant.id = pillTypeParticipant.id;
            convertedParticipant.label = pillTypeParticipant.pillText;
            convertedParticipant.avatarProps = {
                userName: convertedParticipant.label,
                imageSrc: pillTypeParticipant.imageSrc
            };
            return convertedParticipant;
        };

        static convertMutilAheadToPill(multiAheadParticipantData){
            let convertedParticipant = {};
            convertedParticipant.pillText = multiAheadParticipantData.label;
            convertedParticipant.id = multiAheadParticipantData.id;
            convertedParticipant.pillValue = multiAheadParticipantData.id;
            convertedParticipant.imageSrc = multiAheadParticipantData.avatarProps.imageSrc;
            return convertedParticipant;
        };

        static defaultParticipantValidate(participantObj, serviceProvider){
            if (!participantObj.email && !(participantObj.phoneNumber && participantObj.phoneNumber.length > 0)) {
                return false;
            }
            if (serviceProvider == this.TELEPHONY_PROVIDER){
                if (participantObj.phoneNumber && participantObj.phoneNumber.length > 0){
                    return true;
                }
            }
            else {
                if (participantObj.email && participantObj.email.length > 0){
                    return true;
                }
            }
            return false;
        };

        static providerParticipantValidate(participantObj, uxfValidateTemplate){
            for (let index in uxfValidateTemplate){
                const validateCheckItem = uxfValidateTemplate[index];
                if (!participantObj[validateCheckItem] || !participantObj[validateCheckItem].length > 0) {
                    return false;
                }
            }
            return true;
        };

        static isValidParticipant(participantObj, api, provider = null){
            const supportsPostActionsAndValidations = api.data.notify_conference_get_initial_data.output.supportsEventActionsAndIdentifiers;
            const serviceProvider = provider || api.state.selectedProvider.provider;
            if (!supportsPostActionsAndValidations || !serviceProvider){
                return this.defaultParticipantValidate(participantObj, serviceProvider);
            }
            else {
                const confDriverActions = api.data.notify_conference_get_initial_data.output.confDriverActions;
                const confDriverValidationTemplate = confDriverActions.identifiers;
                const providerSupportForValidations = confDriverValidationTemplate[serviceProvider];
                if (!providerSupportForValidations){
                    return this.defaultParticipantValidate(participantObj, serviceProvider)
                }
                if (providerSupportForValidations.length == 0){
                    return this.defaultParticipantValidate(participantObj, serviceProvider);
                }
                return this.providerParticipantValidate(participantObj, providerSupportForValidations);
            }
            
            return false;
        };

        static isValidConferenceStartData(api){
            const selelctedProvider = api.state.selectedProvider;
            const selectedParticipants = api.state.selectedParticipantsAndGroups;
            const conferenceTitle = api.state.conferenceTitle;
            const conferenceMessage = api.state.message;
            let result = {
                status: true,
                errors: []
            }
            if (!selelctedProvider) {
                result.status = false;
                result.errors.push("Please select a provider to start the meeting.");
                return result;
            }
            if (selectedParticipants.length == 0){
                result.status = false;
                if (api.context.props.type == this.ALLOWED_PAGE_TYPES["startConference"]){
                    result.errors.push("Atleast one participant should be added to start the meeting.");
                }
                else if (api.context.props.type == this.ALLOWED_PAGE_TYPES["addParticipants"]){
                    result.errors.push("Atleast one participant should be added.");
                }
                else if (api.context.props.type == this.ALLOWED_PAGE_TYPES["sendSms"]) {
                    result.errors.push("Atleast one recipient should be added to send an SMS.");
                }
                return result;
            }
            if (api.context.props.type == this.ALLOWED_PAGE_TYPES["startConference"]){
                if (conferenceTitle.length == 0){
                    result.status = false;
                    result.errors.push("Please provide a title to start the meeting.");
                    return result;
                }
            }
            if (api.context.props.type == this.ALLOWED_PAGE_TYPES["sendSms"]){
                if (conferenceMessage.length == 0){
                    result.status = false;
                    result.errors.push("No text message to send");
                    return result;
                }
            }
            return result;
        };

        static cleanUpSelectedParticipants(participantDataObject){
            let needToRemoveProps = ["avatarProps", "isLoggedIn", "icon"];
            let cleanParticipant = {};
            for (let key in participantDataObject){
                if (!(needToRemoveProps.includes(key))){
                    cleanParticipant[key] = participantDataObject[key];
                }
            }
            //Handle group
            if (cleanParticipant.users){
                for (let index in cleanParticipant.users){
                    let userObj = {};
                    for (let key in cleanParticipant.users[index]){
                        if (!needToRemoveProps.includes(key)){
                            userObj[key] = cleanParticipant.users[index][key];
                        }
                    }
                    //If group the check is on phoneNumber field in notify
                    userObj.phoneNumber = userObj.phoneNumber;
                    cleanParticipant.users[index] = userObj;
                }
            }
            return cleanParticipant;
        };

        static buildParticipantObjectForMutilAhead(participantDataObject, type){
            let obj = {
                data: participantDataObject
            };
            if (type === this.TYPES.user){
                obj.id = participantDataObject.id;
                obj.label = participantDataObject.name;
                if(participantDataObject.avatarProps){
                    obj.avatarProps = {
                        imageSrc: participantDataObject.avatarProps.imageSrc,
                        userName: obj.label,
                    };
                }
            }
            else if (type === this.TYPES.group){
                obj.id = participantDataObject.id;
                obj.label = participantDataObject.name;
                obj.icon = this.GROUP_ICON;
            }
            return obj;
        };

        static buildParticipantObjectForSearchList(participantDataObject){
            const type = participantDataObject.type;
            let obj = {
                data: participantDataObject,
                type: type,
            };
            if (type == this.TYPES.user) {
                obj.id = participantDataObject.sys_id;
                obj.label = participantDataObject.name;
                if (participantDataObject.avatar) {
                    obj.avatarProps = {
                        userName: obj.label,
                        imageSrc: participantDataObject.avatar + ".iix?t=small"
                    };
                } else {
                    obj.avatarProps = {
                        userName: obj.label,
                        imageSrc: ""
                    };
                }
            }
            else if (type == this.TYPES.staticPhone){
                obj.id = participantDataObject.id;
                obj.label = participantDataObject.label;
                obj.phoneNumber = participantDataObject.phoneNumber;
            }
            else if (type == this.TYPES.staticEmail){
                obj.id = participantDataObject.id;
                obj.label = participantDataObject.label;
                obj.email = participantDataObject.email;
            }
            else if (type == this.TYPES.group){
                obj.id = participantDataObject.sys_id;
                obj.label = participantDataObject.name;
                obj.icon = this.GROUP_ICON;
            }
            return obj;
        };


        static buildParticipantObjectForValidation(api, participantDataObject){
            const type = participantDataObject.type;
            let obj = {
                table: api.context.props.table,
                sysId: api.context.props.sysId,
                isSMS: api.context.props.type === 'sendSms',
                confId: api.context.props.conferenceId ? api.context.props.conferenceId : "",
            };
            if (type == this.TYPES.user) {
                obj = {
                    ...obj,
                    userId: participantDataObject.sys_id,
                    email: "",
                    groupId: "",
                    phoneNumber: "",
                };
            } else if (type == this.TYPES.group) {
                obj = {
                    ...obj,
                    userId: "",
                    email: "",
                    groupId: participantDataObject.sys_id,
                    phoneNumber: "",
                };
            }
            else if (type == this.TYPES.staticPhone) {
                obj = {
                    ...obj,
                    userId: "",
                    email: "",
                    groupId: "",
                    phoneNumber: participantDataObject.id,
                };
            }
            else if (type == this.TYPES.staticEmail) {
                obj = {
                    ...obj,
                    userId: "",
                    email: participantDataObject.id,
                    groupId: "",
                    phoneNumber: "",
                };
            }
            return obj;
        };

        static handleDefaultResponse(serviceProvider, responseData, api, helpers, isCalledFromConfModal){
            const isParentRecordAware = api.context.props.isParentRecordAware || false;
            let successMessages = [];
            let alerts = [];


            if (serviceProvider == this.TELEPHONY_PROVIDER){
                if (responseData.status === true){
                    if (responseData.successMessages && responseData.successMessages.length > 0){
                        for (let index in responseData.successMessages){
                            if (!isParentRecordAware) {
                                successMessages.push({
                                    message:responseData.successMessages[index], 
                                    level:"info"
                                });
                            }
                            else {
                                api.emit(this.GFORM_ADD_INFO_MESSAGE, {
                                    message: responseData.successMessages[index]
                                })
                            }
                        }
                    };


                    if (isCalledFromConfModal)
                        helpers.modal.close();
                    if (!isParentRecordAware){
                        this.showMultipleAlerts(api,successMessages, isCalledFromConfModal);
                    }
                }
                else {
                    if (isCalledFromConfModal)
                        api.setState("showLoader", false);
                    if (responseData.errorMessages && responseData.errorMessages.length > 0){
                        for (let index in responseData.errorMessages){
                            alerts.push({
                                message:responseData.errorMessages[index], 
                                level:"critical"
                            });
                        }
                    };

                    if (responseData.warnMessages){
                        for (let index in responseData.warnMessages){
                            alerts.push({
                                message:responseData.warnMessages[index], 
                                level:"warning"
                            });
                        }
                    }
                    this.showMultipleAlerts(api,alerts);
                }
            }
            else {
                //Case for other conf providers
                /**
                 * Adding additional check on errorMessages, this handles the case for MS Teams when
                 * sn_notify_msteams.enable_calling_for_host is false, responseData.status is coming as false
                 */ 
                if (responseData.status === true  || (responseData.errorMessages && responseData.errorMessages.length === 0)){
                    if (responseData.successMessages && responseData.successMessages.length > 0){
                        for (let index in responseData.successMessages){
                            if (!isParentRecordAware) {
                                successMessages.push({
                                    message:responseData.successMessages[index], 
                                    level:"info"
                                });
                            }
                            else {
                                api.emit(this.GFORM_ADD_INFO_MESSAGE, {
                                    message: responseData.successMessages[index]
                                })
                            }
                        }
                    };

                    //In particular case for zoom even when success is true we are getting error messages
                    if (responseData.errorMessages && responseData.errorMessages.length > 0){
                        for (let index in responseData.errorMessages){
                            if (!isParentRecordAware) {
                                successMessages.push({
                                    message:responseData.errorMessages[index], 
                                    level:"critical"
                                });
                            }
                            else {
                                api.emit(this.GFORM_ADD_ERROR_MESSAGE, {
                                    message: responseData.errorMessages[index]
                                })
                            }
                        }
                    };

                    //If join url redirect
                    if (responseData.details && responseData.details.joinUrl){
                        if (!(isCalledFromConfModal && api.context.props.type == this.ALLOWED_PAGE_TYPES.addParticipants)){
                            api.emit("NAV_ITEM_SELECTED", {
                                route: null,
                                fields: null,
                                params: null,
                                redirect: null,
                                passiveNavigation: null,
                                title: null,
                                multiInstField: null,
                                targetRoute: null,
                                external: {
                                    url: responseData.details.joinUrl
                                }
                            });
                        }
                    }
                    if (isCalledFromConfModal)
                        helpers.modal.close();
                    if (!isParentRecordAware){
                        this.showMultipleAlerts(api,successMessages, isCalledFromConfModal);
                    }
                }
                else{
                    if (isCalledFromConfModal)
                        api.setState("showLoader", false);
                    if (responseData.errorMessages && responseData.errorMessages.length > 0){
                        for (let index in responseData.errorMessages){
                            alerts.push({
                                message:responseData.errorMessages[index], 
                                level:"critical"
                            });
                        }
                    };
                    if (responseData.warnMessages){
                        for (let index in responseData.warnMessages){
                            alerts.push({
                                message:responseData.warnMessages[index], 
                                level:"warning"
                            });
                        }
                    }
                    this.showMultipleAlerts(api,alerts);
                }
            }
        };

        static buildPayloadFromUXFMetaPayload(metaData, result){
            let outputResult = {
                payload: null,
                success: false
            };
            if (!metaData){
                return outputResult;
            }
            const event = metaData.event;
            if (!event){
                return outputResult;
            }
            const metaPayload = metaData.payload;
            if (!metaPayload){
                return outputResult;
            }
            if (event == this.UXF_POST_NOTIFY_EVENTS.OPEN_URL_WINDOW){
                if (!metaPayload.url){
                    return outputResult;
                }
                if (!metaPayload.url.address){
                    return outputResult;
                }
                const bindingAddress = metaPayload.url.address.split(this.META_PAYLOAD_DELIMETER);
                let resultBinded = result.details;
                if (!resultBinded){
                    return outputResult;
                }
                for (let index in bindingAddress){
                    resultBinded = resultBinded[bindingAddress[index]];
                    if (!resultBinded){
                        return outputResult;
                    }
                }
                outputResult.payload = {
                    external: {
                        url: resultBinded
                    }
                };
                outputResult.success = true;
            }

            return outputResult;
        };

        static populateUXFPostEventTemplate(uxfPostActionTemplate, notifyPayload){
            const payloadTemplate = uxfPostActionTemplate.payload;
            let payload = {};
            for (let key in payloadTemplate){
                if (key in notifyPayload) {
                    payload[key] = notifyPayload[key];
                }
                else {
                    payload[key] = payloadTemplate[key];
                }
            }
            return payload;
        };

        static handleUXFPostActionsResponse(serviceProvider, uxfPostActions, responseData, api, helpers, isCalledFromConfModal){
            let alerts = [];
            const providerPostUXFActions = uxfPostActions[serviceProvider];
            if (!providerPostUXFActions && isCalledFromConfModal){
                helpers.modal.close();
                return;
            }
            const action = responseData.action;
            if (!action && isCalledFromConfModal){
                helpers.modal.close();
                return;
            }
            const isParentRecordAware = api.context.props.isParentRecordAware || false;
            let messages = [];
            /**
             * Adding additional check on errorMessages, this handles the case for MS Teams when
             * sn_notify_msteams.enable_calling_for_host is false, responseData.status is coming as false
             */ 
            if (responseData.status === true || (responseData.errorMessages && responseData.errorMessages.length === 0)){
                if (responseData.successMessages && responseData.successMessages.length > 0){
                    for (let index in responseData.successMessages){
                        if (!isParentRecordAware) {
                            messages.push({
                                message:responseData.successMessages[index], 
                                level:"info"
                            });
                        }
                        else {
                            api.emit(this.GFORM_ADD_INFO_MESSAGE, {
                                message: responseData.successMessages[index]
                            })
                        }
                    }
                };
                if (responseData.errorMessages && responseData.errorMessages.length > 0){
                    for (let index in responseData.errorMessages){
                        if (!isParentRecordAware) {
                            messages.push({
                                message:responseData.errorMessages[index], 
                                level:"critical"
                            });
                        }
                        else {
                            api.emit(this.GFORM_ADD_ERROR_MESSAGE, {
                                message: responseData.errorMessages[index]
                            })
                        }
                    }
                };
                const onSuccessPostUXFActions = providerPostUXFActions.onSuccess;
                if (!onSuccessPostUXFActions){
                    if (isCalledFromConfModal)
                        helpers.modal.close();
                    if (!isParentRecordAware){
                        this.showMultipleAlerts(api,messages, isCalledFromConfModal);
                    }
                    return;
                }
                const onSuccessActionData = onSuccessPostUXFActions[action];
                if (!onSuccessActionData){
                    if (isCalledFromConfModal)
                        helpers.modal.close();
                    if (!isParentRecordAware){
                        this.showMultipleAlerts(api,messages, isCalledFromConfModal);
                    }
                    return;
                }
                for (let index in onSuccessActionData){
                    const notifyEvent = onSuccessActionData[index].event;
                    const metaPayload = onSuccessActionData[index].payload;
                    let notifyPayload = this.buildPayloadFromUXFMetaPayload(onSuccessActionData[index], responseData);
                    if (notifyPayload.success == false){
                        continue;
                    }
                    const template = this.UXF_POST_EVENT_TEMPLATES[notifyEvent];
                    //Template not defined for this notify action
                    if (!template){
                        continue;
                    }
                    const uxfEvent = template.event;
                    const uxfPayload = this.populateUXFPostEventTemplate(template, notifyPayload.payload);
                    api.emit(uxfEvent, uxfPayload);
                }
                if (isCalledFromConfModal)
                    helpers.modal.close();
                if (!isParentRecordAware){
                    this.showMultipleAlerts(api,messages, isCalledFromConfModal);
                }
            }
            else{
                if (isCalledFromConfModal)
                    api.setState("showLoader", false);
                if (responseData.errorMessages && responseData.errorMessages.length > 0){
                    for (let index in responseData.errorMessages){
                        alerts.push({
                            message:responseData.errorMessages[index], 
                            level:"critical"
                        });
                    }
                };
                if (responseData.warnMessages){
                    for (let index in responseData.warnMessages){
                        alerts.push({
                            message:responseData.warnMessages[index], 
                            level:"warning"
                        });
                    }
                }
                this.showMultipleAlerts(api,alerts);
            }
        };

        static handleConferenceActionResponse(api, helpers, serviceProvider, supportsPostActionsAndValidations, confDriverActions, isCalledFromConfModal, responseResult = null){
            const responseData = responseResult || api.data.notify_conference_do_action.output.result;

            if (!responseData || !serviceProvider || !confDriverActions)
                return;
            
            const uxfPostActions = confDriverActions.actions;

            if (!supportsPostActionsAndValidations){
                this.handleDefaultResponse(serviceProvider, responseData,api, helpers, isCalledFromConfModal);
            }
            else {
                const sericeProviderLevelSupport = uxfPostActions[serviceProvider];
                if (!sericeProviderLevelSupport){
                    this.handleDefaultResponse(serviceProvider, responseData,api, helpers, isCalledFromConfModal);
                }
                else {
                    this.handleUXFPostActionsResponse(serviceProvider, uxfPostActions, responseData,api, helpers, isCalledFromConfModal);
                }
            }
        };

        static debounce(api, helpers, pollingInterval) {
            if (api.state.intervalId)
                helpers.timing.clearInterval(api.state.intervalId);
            const intervalId = helpers.timing.setInterval( () => {
                api.data.fetch_active_participants.refresh();
            }, pollingInterval);
            api.setState("intervalId", intervalId);
        };

        static shuffleCallCard(eventData, callsBucket1, callsBucket2, newCallActiveStatus, isCopyShuffle) {
            // Shuffling the call card from callsBucket1 -> callsBucket2
            const callID = eventData.sys_id;
            const callIndex = callsBucket1.findIndex(function(call) {
                return call.callID === callID;
            });
            const call = callsBucket1[callIndex];
            if (typeof call === "undefined")
                return;
            // Updating necessary conference call properties on shuffle
            call.active = (newCallActiveStatus === "true");
            call.isLoggedInUserActiveParticipant = false;
            call.callDuration = eventData.record.duration.value.split(" ")[1];
            call.startTime = this.formatDateTime(eventData.record.sys_created_on.display_value);
            call.activeParticipants = {
                count: 0,
                participants: [],
                totalActiveParticipants: [],
                displayMessage: "No active participant"
            };
            callsBucket2.splice(0, 0, call);
            if (!isCopyShuffle)
                callsBucket1.splice(callIndex, 1);
        }

        static getDuration(startTimeEpoch) {
            const duration = Date.now() - startTimeEpoch;
            var hours = Math.floor(duration / (60 * 60 * 1000));
            var minutes = Math.floor((duration - (hours * 60 * 60 * 1000)) / (60 * 1000));
            var seconds = Math.floor((duration - ((hours * 60 + minutes) * 60 * 1000)) / 1000);

            hours = (hours > 9 ? '' : '0') + hours.toString();
            minutes = (minutes > 9 ? '' : '0') + minutes.toString();
            seconds = (seconds > 9 ? '' : '0') + seconds.toString();
            return hours + ':' + minutes + ':' + seconds;
        }

        static formatDateTime(dateTime) {
            return new NowDateTime(dateTime).format(this.DATE_TIME_FORMAT_CONFERENCE_CALL_CARD);
        }

        static setCollapseIcon(conferenceCalls) {
            conferenceCalls.collapseIcon = conferenceCalls.expanded ? this.COLLAPSE_ICON.EXPANDED : this.COLLAPSE_ICON.NOT_EXPANDED;
        }

        static processSearchElement(item) {
            return item.toLowerCase().trim();
        }

        static searchCallCards(searchQuery, callsArray, isUpcomingSlotData = false) {
            // Processing input search query
            searchQuery = this.processSearchElement(searchQuery);
            const searchResults = [];
            for (let i = 0; i < callsArray.length; i++) {
                const call = callsArray[i];
                if (isUpcomingSlotData) {
                    const confTitle = this.processSearchElement(call.data.title);
                    if (confTitle.includes(searchQuery)) {
                        searchResults.push(call);
                    }
                }
                else {
                    const confTitle = this.processSearchElement(call.title.original);
                    const conferenceCallNumber = this.processSearchElement(call.conferenceCallNumber.value);
                    let activeParticipants = "";
                    call.activeParticipants.totalActiveParticipants.forEach(function(participant) {
                        activeParticipants += participant + ",";
                    });
                    activeParticipants = this.processSearchElement(activeParticipants);
                    if (confTitle.includes(searchQuery) || conferenceCallNumber.includes(searchQuery) || activeParticipants.includes(searchQuery)) {
                        searchResults.push(call);
                    }
                }
            }
            return searchResults;
        }

        static filterCallCards(api, filterQuery, callsArray) {
            // Processing input filter query
            let filterResults = [];
            if (filterQuery.startsWith("organized")) {
                if (filterQuery === "organized_by_me") {
                    callsArray.forEach(function(call) {
                        if (call.organiser.userName === api.context.session.user.userName) {
                            filterResults.push(call);
                        }
                    });
                } else if (filterQuery === "organized_by_others") {
                    callsArray.forEach(function(call) {
                        if (call.organiser.userName !== api.context.session.user.userName) {
                            filterResults.push(call);
                        }
                    });
                }
            } else if (filterQuery.startsWith("sp")) {
                callsArray.forEach(function(call) {
                    if ("sp_" + call.sp.name.toLowerCase().replaceAll(" ", "_") === filterQuery) {
                        filterResults.push(call);
                    }
                });
            } else {
                filterResults = callsArray;
            }
            return filterResults;
        }

        static async searchAndFilterCallCards(searchQuery, filterQuery, api, helpers) {
            const conferenceCalls = api.state.conferenceCalls;
            if (!conferenceCalls)
                return;
            const callsData = api.data.fetch_conference_calls.output;
            if (!callsData)
                return;
            const ACTIVE_CALL_INDEX = callsData.conferenceCallTypeIndex.ACTIVE;
            const COMPLETED_CALL_INDEX = callsData.conferenceCallTypeIndex.COMPLETED;
            const UPCOMING_CALL_INDEX = callsData.conferenceCallTypeIndex.UPCOMING;
            const allConferenceCalls = callsData.calls;
            const activeConferenceCalls = conferenceCalls[ACTIVE_CALL_INDEX].callRecords;
            const allCompletedConfCalls = allConferenceCalls[COMPLETED_CALL_INDEX].callRecords;
            const allUpcomingConfCalls = conferenceCalls[UPCOMING_CALL_INDEX].callRecords;

            const conferenceCallSearchAndFilterResults = JSON.parse(JSON.stringify(conferenceCalls));
            // Performing AND on search, filter
            conferenceCallSearchAndFilterResults[ACTIVE_CALL_INDEX].callRecords = this.searchCallCards(searchQuery, activeConferenceCalls);
            conferenceCallSearchAndFilterResults[ACTIVE_CALL_INDEX].callRecords = this.filterCallCards(api, filterQuery, conferenceCallSearchAndFilterResults[ACTIVE_CALL_INDEX].callRecords);
            conferenceCallSearchAndFilterResults[COMPLETED_CALL_INDEX].callRecords = this.searchCallCards(searchQuery, allCompletedConfCalls);
            conferenceCallSearchAndFilterResults[COMPLETED_CALL_INDEX].callRecords = this.filterCallCards(api, filterQuery, conferenceCallSearchAndFilterResults[COMPLETED_CALL_INDEX].callRecords);
            if (searchQuery) {
                conferenceCallSearchAndFilterResults[UPCOMING_CALL_INDEX].callRecords = this.searchCallCards(searchQuery, allUpcomingConfCalls, true);
            }
            else {
                //For filter query default Upcoming Section to empty
                conferenceCallSearchAndFilterResults[UPCOMING_CALL_INDEX].callRecords = [];
            }
            const activeConfCallCountSearchAndFilterResults = conferenceCallSearchAndFilterResults[ACTIVE_CALL_INDEX].callRecords.length;
            const completedConfCallCountSearchAndFilterResults = conferenceCallSearchAndFilterResults[COMPLETED_CALL_INDEX].callRecords.length;
            const upcomingConfCallCountSearchAndFilterResults = conferenceCallSearchAndFilterResults[UPCOMING_CALL_INDEX].callRecords.length;
            
            conferenceCallSearchAndFilterResults[ACTIVE_CALL_INDEX].callStatus = await helpers.translate("Active ({0})", activeConfCallCountSearchAndFilterResults);
            conferenceCallSearchAndFilterResults[COMPLETED_CALL_INDEX].callStatus = await helpers.translate("Completed ({0})", completedConfCallCountSearchAndFilterResults);
            conferenceCallSearchAndFilterResults[UPCOMING_CALL_INDEX].callStatus = await helpers.translate("Pending ({0})", upcomingConfCallCountSearchAndFilterResults);

            api.setState("searchAndFilterResults", conferenceCallSearchAndFilterResults);
            api.setState("isSearchingAndFiltering", true);

            if (activeConfCallCountSearchAndFilterResults === 0 && completedConfCallCountSearchAndFilterResults === 0  && upcomingConfCallCountSearchAndFilterResults === 0) {
                api.setState("showSearchAndFilterEmptyState", true);
            } else {
                api.setState("showSearchAndFilterEmptyState", false);
                if (activeConfCallCountSearchAndFilterResults !== 0) {
                    conferenceCallSearchAndFilterResults[ACTIVE_CALL_INDEX].expanded = true;
                    notifyConfUtils.setCollapseIcon(conferenceCallSearchAndFilterResults[ACTIVE_CALL_INDEX]);
                    conferenceCalls[ACTIVE_CALL_INDEX].expanded = true;
                    notifyConfUtils.setCollapseIcon(conferenceCalls[ACTIVE_CALL_INDEX]);
                }
                if (completedConfCallCountSearchAndFilterResults !== 0) {
                    conferenceCallSearchAndFilterResults[COMPLETED_CALL_INDEX].expanded = true;
                    notifyConfUtils.setCollapseIcon(conferenceCallSearchAndFilterResults[COMPLETED_CALL_INDEX]);
                    conferenceCalls[COMPLETED_CALL_INDEX].expanded = true;
                    notifyConfUtils.setCollapseIcon(conferenceCalls[COMPLETED_CALL_INDEX]);
                }
                if (upcomingConfCallCountSearchAndFilterResults !== 0) {
                    conferenceCallSearchAndFilterResults[UPCOMING_CALL_INDEX].expanded = true;
                    notifyConfUtils.setCollapseIcon(conferenceCallSearchAndFilterResults[UPCOMING_CALL_INDEX]);
                    conferenceCalls[UPCOMING_CALL_INDEX].expanded = true;
                    notifyConfUtils.setCollapseIcon(conferenceCalls[UPCOMING_CALL_INDEX]);
                }
            }
            api.setState("searchAndFilterResults", conferenceCallSearchAndFilterResults);
        }
    };

    return NotifyConferenceUxfClientUtilSNC;
}

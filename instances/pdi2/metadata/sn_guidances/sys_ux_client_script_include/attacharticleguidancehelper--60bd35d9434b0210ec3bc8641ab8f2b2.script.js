function include(proxyArg, params) {
  const {
      api,
      event,
      helpers,
      imports
  } = params;
  const SECONDARY_ACTION_CLICKED = "NOW_DROPDOWN#ITEM_CLICKED";
  const PRIMARY_ACTION_CLICKED = "NOW_BUTTON#CLICKED";
  const COPY_LINK = 'copy-link';
  const COPY_LINK_DETAILED_EXPERIENCE = 'copy-link-detailed-experience';
  const GUIDANCE_ADD_NOTIFICATION = "SN_GUIDANCE#ADD_NOTIFICATIONS";
  const SN_SEARCH_RESULT_CONTAINER_DECLARATIVE_ACTION = "SN_SEARCH_RESULTS_CONTAINER#DECLARATIVE_ACTION";
  const RA_EXPANDED_SEARCH_ADD_NOTIFICATION = "RA_EXPANDED_SEARCH#ADD_NOTIFICATION";
  const READ_FULL_ARTICLE = "read-full-article";
  const READ_ARTICLE_FULL_VIEW = "read-article-full-view";
  const ADD_LINK_IN_WORKNOTE = "attach-article-worknotes";
  const ATTACH_ARTICLE_EMAIL = 'attach-article-email';
  const ATTACH_ARTICLE_COMMENT = "attach-article-comment";
  const ADD_LINK_MESSAGE = "add-link-message";
  const ON_DRILL_DOWN_ACTION = "ON_DRILL_DOWN_ACTION";
  const NOW_BUTTON_BARE_CLICKED = "NOW_BUTTON_BARE#CLICKED";
  const SIDE_PANEL = "contextual_side_panel";
  const ON_DRILL_DOWN_ACTION_INITIATE = "ON_DRILL_DOWN_ACTION_INITIATE";
  const GUIDANCE_ACTION_TYPE = "e38f55b9b72120107d472397ee11a9be";//sys_id for "Guidance" action type
  const SN_GUIDANCE_EXPERIENCE_CONNECTED_GUIDANCE_NOTIFICATION_PROPOGATION = "SN_GUIDANCE_EXPERIENCE_CONNECTED#GUIDANCE_NOTIFICATION_PROPOGATION"
  const COPY_LINK_NOTIFICATION_MESSAGE = 'Link copied to clipboard';
  const ATTACH_ARTICLE_TO_COMMENTS_ACTION = "ATTACH_ARTICLE_TO_COMMENTS_ACTION";
const ATTACH_ARTICLE_TO_TASK_ACTION = "ATTACH_ARTICLE_TO_TASK_ACTION";
  const ON_SINGLE_CLICK_ACTION_INITIATE = "ON_SINGLE_CLICK_ACTION_INITIATE";
  const SEARCH_USE_CASE = "search";
  const SINGLE_CLICK_ACTION = "single_click";
  const GUIDANCE_ACTION_CLICKED = "GUIDANCE_ACTION_CLICKED";
  const ATTACH_ARTICLE_TO_COMMENT_GUIDANCE_ACTION = "9af39aaa436f0210f81d92621ab8f2d8";
  const ATTACH_ARTICLE_TO_WORKNOTE_GUIDANCE_ACTION = "f2245eaa436f0210f81d92621ab8f293";
  const ATTACH_GUIDANCE_ACTION = "1e8392aa436f0210f81d92621ab8f291";
  const ATTACH_INTERACTION_GUIDANCE_ACTION = "9df6e8fce544a210f8770ce9c0d302b6";
  const ADD_LINK_MESSAGE_ACTION = '013cd95947c1a61079f4abf9316d437e';
  const SN_NEXT_BEST_ACTION_LIST_CONNECTED_ACTION_TRIGGERED_PROPAGATION = 'SN_NEXT_BEST_ACTION_LIST_CONNECTED#ACTION_TRIGGERED_PROPAGATION';
   const EMAIL_SENT_NOTIFICATION_MESSAGE = 'Email sent';
  const TASK_KB_GUIDANCE = 'e8421a2a436f0210f81d92621ab8f2da';
  const SEND_CHAT = "send-chat";
  const SEND_PRIVATE_CHAT = "send-private-chat";
  const FLAG_ARTICLE = "flag-article";
  const SEND_IN_CHAT_ACTION = "5c0ad28753501210f917ddeeff7b1248";
  const SEND_IN_PRIVATE_CHAT_ACTION = "9ebc5e0b53501210f917ddeeff7b1289";
  const INTERACTION_KB_GUIDANCE = '550918d9439412102280698f38b8f26a';
  const READ_ARTICLE_PROP_ID = "readArticle";
  const MARK_ARTICLE_PROP_ID= "markArticle";
  const FLAG_ARTICLE_PROP_ID = "flagArticle";
  const READ_ARTICLE_FULL_VIEW_PROP_ID = "readArticleInFullView";
  const ATTACH_ARTICLE_COMMENT_PROP_ID = "attachAndAddLinkInComment";
  const ATTACH_ARTICLE_EMAIL_PROP_ID = "attachAndAddLinkInEmail";
  const ATTACH_ARTICLE_TO_WORKNOTE_PROP_ID = "addLinkInWorkNote";
  const COPY_LINK_PROP_ID = "copyLink";
  const SEND_CHAT_PROP_ID = "sendChat";
  const SEND_PRIVATE_CHAT_PROP_ID="sendPrivateChat";
  const LOG_SEARCH_RESULT_EVENT = "LOG_SEARCH_RESULT_EVENT";
  const guidancePreviewAndDetailOnlyActions = {
        [TASK_KB_GUIDANCE]:{
            "detailOnlyActions":{
                [MARK_ARTICLE_PROP_ID] : "true",
                [FLAG_ARTICLE_PROP_ID] : "true",
                [READ_ARTICLE_FULL_VIEW_PROP_ID] : "true"
            },
            "previewOnlyActions":{
                [READ_ARTICLE_PROP_ID] : "true"
            }
        },
        [INTERACTION_KB_GUIDANCE]:{
            "detailOnlyActions":{
                [MARK_ARTICLE_PROP_ID] : "true",
                [FLAG_ARTICLE_PROP_ID] : "true",
                [READ_ARTICLE_FULL_VIEW_PROP_ID] : "true"
            },
            "previewOnlyActions":{
                [READ_ARTICLE_PROP_ID] : "true"
            }
        }
    }

  const guidanceRequiredProperties = {
        [TASK_KB_GUIDANCE] : [ATTACH_ARTICLE_COMMENT_PROP_ID, ATTACH_ARTICLE_EMAIL_PROP_ID, ATTACH_ARTICLE_TO_WORKNOTE_PROP_ID, READ_ARTICLE_PROP_ID, READ_ARTICLE_FULL_VIEW_PROP_ID, COPY_LINK_PROP_ID, MARK_ARTICLE_PROP_ID, FLAG_ARTICLE_PROP_ID],
        [INTERACTION_KB_GUIDANCE] : [READ_ARTICLE_PROP_ID, READ_ARTICLE_FULL_VIEW_PROP_ID, COPY_LINK_PROP_ID, MARK_ARTICLE_PROP_ID, FLAG_ARTICLE_PROP_ID, SEND_CHAT_PROP_ID, SEND_PRIVATE_CHAT_PROP_ID]
    };

  const handleCopyLinkAction = (actionId) => {
      helpers.timing.setTimeout(function() {
          var kbLink = this.location.host + `/kb_view.do?sys_kb_id=${api.state.knowledgeArticleId}`;
          this.navigator.clipboard.writeText(kbLink).then(() => {
              if(actionId === COPY_LINK){
                  api.emit(LOG_SEARCH_RESULT_EVENT, {actionData: {actionName: actionId}});
                  emitNotificationEvent(GUIDANCE_ADD_NOTIFICATION, COPY_LINK_NOTIFICATION_MESSAGE);
                  emitNotificationEvent(SN_SEARCH_RESULT_CONTAINER_DECLARATIVE_ACTION, COPY_LINK_NOTIFICATION_MESSAGE);
              }
              else if(actionId === COPY_LINK_DETAILED_EXPERIENCE){
                  emitNotificationEvent(SN_GUIDANCE_EXPERIENCE_CONNECTED_GUIDANCE_NOTIFICATION_PROPOGATION, COPY_LINK_NOTIFICATION_MESSAGE);
              }
          });

      }, function(err) {
          console.log('Error occurred when trying to copy link to clipboard. ', err);
      });
  }

  const handleReadFullArticleAction = () => {
      api.emit(ON_DRILL_DOWN_ACTION_INITIATE, {
          table: api.context.props.customExpProps.table,
          tableSysId: api.context.props.customExpProps.tableSysId,
          actionType: GUIDANCE_ACTION_TYPE,
          actionInputs: api.context.props.customExpProps.actionInputs,
          actionId: api.context.props.customExpProps.actionId,
          sysId: api.context.props.customExpProps.sysId,
          name: api.context.props.customExpProps.name,
          actionStateValue: api.context.props.customExpProps.actionStateValue,
          actionMetadata: api.context.props.customExpProps.callToActions[0],
          renderer: api.context.props.customExpProps.renderer,
          contextSysId: api.context.props.customExpProps.contextSysId
      });
  }

  const handleReadArticleFullViewAction = () => {
      helpers.navigate.to('kb_view', {
          'table': 'kb_knowledge',
          'sysId': api.state.knowledgeArticleId
      }, {}, false, false, 'current');
  }

    const handleAttachArticleEmailAction = () => {
        api.setState('showModal', true);
        const isPreviewExperience = event.name == PRIMARY_ACTION_CLICKED ? api.state.primaryAction.isPreviewExperience : event.payload.item.isPreviewExperience;
        if (isPreviewExperience == true) {
            const {
                table,
                actionInputs: {
                    task,
                    knowledge
                }
            } = api.state.customExpProps;
            api.emit('MACROPONENT_VIEWPORT_LOAD_REQUESTED', {
                viewportElementId: 'viewport_1',
                route: 'add-article-link-in-email-modal',
                fields: {
                    'taskSysId': task,
                    'kbSysId': knowledge,
                    'taskTable': table,
                    'title': api.data.get_preview_fields.result.short_description.displayValue,
                    'kbNumber': api.data.get_preview_fields.result.number.displayValue,
                },
              params: {
                  'isPreviewExperience': true
              }
            });
        } else{
            const {
                number,
                shortDescription,
            } = api.data.get_knowledge_record_details_1.articleDetails.articleInfo;
            const {
                task,
                knowledge,
            } = api.context.props.guidanceInputs;
            api.emit('MACROPONENT_VIEWPORT_LOAD_REQUESTED', {
                viewportElementId: 'viewport_1',
                route: 'add-article-link-in-email-modal',
                fields: {
                    'taskSysId': task.value,
                    'kbSysId': knowledge.value,
                    'taskTable': api.context.props.tableName,
                    'title': shortDescription,
                    'kbNumber': number,
                }
            });
        }
    }
 
   const handleAttachArticleMessageAction = async () => { 
        api.setState('showModal', true);
        var table, tableSysId, shortDescription, number, message, displayValue, kbLink, messageText, isMsgTypeInteraction;
        const isPreviewExperience = event.name == PRIMARY_ACTION_CLICKED ? api.state.primaryAction.isPreviewExperience : event.payload.item.isPreviewExperience;
   
        messageText =  await helpers.translate("Thanks for contacting support. Here is the knowledge article that can help you with the latest query.");
            
       if(isPreviewExperience == true) {
                    displayValue = api.data.get_preview_fields.result.number.displayValue;
                    table = api.state.customExpProps.table;
                    tableSysId =  api.state.customExpProps.tableSysId;
                    shortDescription = api.data.get_preview_fields.result.short_description.displayValue;
                    number = api.data.get_preview_fields.result.number.displayValue;
                    isMsgTypeInteraction = api.data.check_chat_session_and_user_kb_access.output.interactionType === 'messaging' ? true : false;
       }  else {
                    number = api.data.get_knowledge_record_details_1.articleDetails.articleInfo.number;
                    shortDescription =  api.data.get_knowledge_record_details_1.articleDetails.articleInfo.shortDescription;
          
                    const {interaction} = api.context.props.guidanceInputs;
                    table = interaction.name;
                    tableSysId = interaction.value;
                    isMsgTypeInteraction = api.data.check_chat_session_and_user_kb_access_detail.output.interactionType === 'messaging' ? true : false;
       }

        var translatedShortDescription = await helpers.translate(shortDescription);
        translatedShortDescription+=": ";  

        helpers.timing.setTimeout(function() {
                kbLink = this.location.host + '/kb_view.do?sys_kb_id=' + api.state.knowledgeArticleId;
                message =  messageText +  '\n' +  translatedShortDescription + kbLink;
                api.emit('MACROPONENT_VIEWPORT_LOAD_REQUESTED' , {
                        viewportElementId: 'viewport_1',
                        route: 'add-link-in-message-modal',
                        fields: {
                            'table': table,
                            'sysId': tableSysId,
                        },
                        params: {
                            'isPreviewEnabled': true,
                            'message': message,
                            'title': shortDescription,
                            'kbNumber': number,
                            'kbSysId': api.state.knowledgeArticleId,
                            'hideAddressFields' : isMsgTypeInteraction
                        }
                });
        });
    }


  const handleSecondaryActionsClicked = (guidanceId, actionConfigMetaData) => {
        const {
            payload: {
                item
            }
        } = event;
        handleActionsClicked(item.id, guidanceId, actionConfigMetaData);
    };

  const handlePrimaryActionClicked = (guidanceId, actionConfigMetaData) => {
    const actionId = api.state.primaryAction.id;
    handleActionsClicked(actionId, guidanceId, actionConfigMetaData);
  }

  const handleActionsClicked = (actionId, guidanceId, actionConfigMetaData) => {
    if (actionId === COPY_LINK || actionId === COPY_LINK_DETAILED_EXPERIENCE) {
        handleCopyLinkAction(actionId);
    } else if (actionId == READ_FULL_ARTICLE) {
        handleReadFullArticleAction();
    } else if (actionId == READ_ARTICLE_FULL_VIEW) {
        handleReadArticleFullViewAction();
    }else if (actionId == ADD_LINK_IN_WORKNOTE) {
        if(actionConfigMetaData['eventSupported']){
            const isPreviewExperience = event.name == PRIMARY_ACTION_CLICKED ? api.state.primaryAction.isPreviewExperience : event.payload.item.isPreviewExperience;
            if(isPreviewExperience)
                 api.emit(LOG_SEARCH_RESULT_EVENT, {actionData: {actionName: actionId}});
            emitEventForModelessDialog(guidanceId, actionConfigMetaData, "addLinkInWorkNote");
        } else{
            openAttachArticleModal(true);
        }
    } else if (actionId == ATTACH_ARTICLE_EMAIL) {
        if (actionConfigMetaData['eventSupported']) {
            handleAttachArticleToTaskAction(false);
            emitEventForModelessDialog(guidanceId, actionConfigMetaData, "attachAndAddLinkInEmail");
        } else {
            handleAttachArticleEmailAction();
        }
   } else if (actionId === ATTACH_ARTICLE_COMMENT) {
        if(actionConfigMetaData['eventSupported']){
            handleAttachArticleToTaskAction(false);
            emitEventForModelessDialog(guidanceId, actionConfigMetaData, "attachAndAddLinkInComment");
        } else{
            openAttachArticleModal(false);
        }
    } else if (actionId === SEND_CHAT) {
        handleSendToChatAction(false);
    } else if (actionId === SEND_PRIVATE_CHAT) {
        handleSendToChatAction(true);
    } else if(actionId === ADD_LINK_MESSAGE) {
          handleAttachArticleMessageAction();
    }
  }

    const handleSendToChatAction = (isPrivateChat) => {
        let sendInChatActionId = isPrivateChat ? SEND_IN_PRIVATE_CHAT_ACTION : SEND_IN_CHAT_ACTION;
        let isPreviewExperience = event.name == PRIMARY_ACTION_CLICKED ? api.state.primaryAction.isPreviewExperience : event.payload.item.isPreviewExperience;
        if (isPreviewExperience) {
            let singleClickActionPayload = {};
            const callToActions = api.state.customExpProps.callToActions;
            let actionMetadata = callToActions.find(guidanceAction => guidanceAction.id === sendInChatActionId);
            actionMetadata.actionBehavior = SINGLE_CLICK_ACTION;
            if (api.state.customExpProps.useCase === SEARCH_USE_CASE) {
                const {
                    table,
                    tableSysId,
                    contextSysId,
                    name,
                    actionStateValue,
                    actionTypeSysId,
                    actionInputs,
                    actionId
                } = api.state.customExpProps;
                singleClickActionPayload = {
                    table: table,
                    tableSysId: tableSysId,
                    contextSysId: contextSysId,
                    actionType: actionTypeSysId,
                    actionInputs: actionInputs,
                    actionId: actionId,
                    name: name,
                    actionMetadata: actionMetadata,
                    actionStateValue: actionStateValue
                };
            } else {
                const {
                    sysId,
                    name,
                    actionStateValue
                } = api.state.customExpProps;
                singleClickActionPayload = {
                    sysId: sysId,
                    name: name,
                    actionStateValue: actionStateValue,
                    actionMetadata: actionMetadata,
                };
            }
            api.emit(ON_SINGLE_CLICK_ACTION_INITIATE, singleClickActionPayload);
        } else {
            const {
                guidanceActions
            } = api.context.props;
            const action = guidanceActions.find(guidanceAction => guidanceAction.action_sys_id === sendInChatActionId);
            api.emit(GUIDANCE_ACTION_CLICKED, {
                action
            });
        }
    };
 
  const handleSendToMessageAction = (isPreview) => {

        if (isPreview) {
            let singleClickActionPayload = {};
            const callToActions = api.state.customExpProps.callToActions;
            let actionMetadata = callToActions.find(guidanceAction => guidanceAction.id === ADD_LINK_MESSAGE_ACTION);
            actionMetadata.actionBehavior = SINGLE_CLICK_ACTION;
            if (api.state.customExpProps.useCase === SEARCH_USE_CASE) {
                const {
                    table,
                    tableSysId,
                    contextSysId,
                    name,
                    actionStateValue,
                    actionTypeSysId,
                    actionInputs,
                    actionId
                } = api.state.customExpProps;
                singleClickActionPayload = {
                    table: table,
                    tableSysId: tableSysId,
                    contextSysId: contextSysId,
                    actionType: actionTypeSysId,
                    actionInputs: actionInputs,
                    actionId: actionId,
                    name: name,
                    actionMetadata: actionMetadata,
                    actionStateValue: actionStateValue,
                };
            } else {
                const {
                    sysId,
                    name,
                    actionStateValue
                } = api.state.customExpProps;
                singleClickActionPayload = {
                    sysId: sysId,
                    name: name,
                    actionStateValue: actionStateValue,
                    actionMetadata: actionMetadata,
                };
            }
            api.emit(ON_SINGLE_CLICK_ACTION_INITIATE, singleClickActionPayload);
        } else {
            const {
                guidanceActions
            } = api.context.props;
            const action = guidanceActions.find(guidanceAction => guidanceAction.action_sys_id === ADD_LINK_MESSAGE_ACTION);
             helpers.timing.setTimeout(() => {
                api.emit(GUIDANCE_ACTION_CLICKED, {
                    action
                });
             }, 1500);
        }
   };

  const openAttachArticleModal = (isWorkNoteExperience) => {
      api.setState('showModal', true);
      if(api.state.customExpProps != undefined){
            const {
              task,
              knowledge,
              additional_notes
          } = api.state.customExpProps.actionInputs;

          const {
              number,
              short_description,
          } = api.data.get_preview_fields.result;

          const viewportPayload = {
              viewportElementId: "viewport_1",
              route: "attach-article-in-comment-modal",
              fields: {'taskSysId': task,
                  'kbSysId': knowledge,
                  'title': short_description.displayValue,
                  'kbNumber': number.displayValue,
                },
              params: {
                  'isPreviewExperience': true,
                  "additionalNotes": additional_notes,
                  "isWorkNoteExperience": isWorkNoteExperience
              }
          };
          api.emit('MACROPONENT_VIEWPORT_LOAD_REQUESTED', viewportPayload);

      } else if(api.context.props != undefined){

          const {
            task,
            knowledge,
            guidance_input_form_fields: {
                additional_notes
                },
            } = api.context.props.guidanceInputs;

            const {
              number,
              shortDescription,
          } = api.data.get_knowledge_record_details_1.articleDetails.articleInfo;
          

          const viewportPayload = {
              viewportElementId: "viewport_1",
              route: "attach-article-in-comment-modal",
              fields: {'taskSysId': task.value,
                  'kbSysId': knowledge.value,
                  'title': shortDescription,
                  'kbNumber': number
                },
              params: {
                  "additionalNotes": additional_notes.recordValue ? additional_notes.recordValue.displayValue : '',
                  "isWorkNoteExperience": isWorkNoteExperience
              }
          };
        api.emit('MACROPONENT_VIEWPORT_LOAD_REQUESTED', viewportPayload);
      }

  }

  const emitEventForModelessDialog = (guidanceId, actionConfigMetaData, eventName) => {
        const {actionType, actionName, articleId, articleTitle} = actionConfigMetaData;
        const isPreviewExperience = event.name == PRIMARY_ACTION_CLICKED ? api.state.primaryAction.isPreviewExperience : event.payload.item.isPreviewExperience;
        const articleNumber = isPreviewExperience ? api.data.get_preview_fields.result.number.displayValue : api.data.get_knowledge_record_details_1.articleDetails.articleInfo.number;
        api.emit(SN_NEXT_BEST_ACTION_LIST_CONNECTED_ACTION_TRIGGERED_PROPAGATION,{
            "actionSysId": guidanceId,
            "actionName": actionName,     
            "actionType": actionType,
            "eventName": eventName,
            "payload": {
                "articleSysId": articleId, 
                "articleTitle": articleTitle,
                "articleNumber": articleNumber
            }
        });
    }

  const handleViewDetailsClicked = () => {
      const {
          sysId,
          name,
          actionStateValue,
          attributes,
          renderer
      } = api.state.customExpProps;
      const actionBehavior = (attributes && attributes['actionBehaviour']) ? attributes['actionBehaviour'] : SIDE_PANEL;
      api.emit(ON_DRILL_DOWN_ACTION, {
          sysId: sysId,
          name: name,
          actionStateValue: actionStateValue,
          actionBehavior: actionBehavior,
          selectedActionAttributes: attributes,
          renderer: renderer,
      });
  };


    const handleAttachArticleToTaskAction = (isFixedModal) => {
    let isPreviewExperience;
    if (isFixedModal) {
        isPreviewExperience = event.payload.isPreviewExperience;
    } else {
        isPreviewExperience = event.name == PRIMARY_ACTION_CLICKED ? api.state.primaryAction.isPreviewExperience : event.payload.item.isPreviewExperience;
    }
        if (isPreviewExperience) {
            if (isFixedModal) {
                emitNotificationEvent(GUIDANCE_ADD_NOTIFICATION, EMAIL_SENT_NOTIFICATION_MESSAGE, 'email');
                emitNotificationEvent(SN_SEARCH_RESULT_CONTAINER_DECLARATIVE_ACTION, EMAIL_SENT_NOTIFICATION_MESSAGE, 'email');
            }
            let singleClickActionPayload = {};
            const callToActions = api.state.customExpProps.callToActions;
            let actionMetadata = callToActions.find(guidanceAction => guidanceAction.id === ATTACH_GUIDANCE_ACTION || guidanceAction.id === ATTACH_INTERACTION_GUIDANCE_ACTION);
            actionMetadata.actionBehavior = SINGLE_CLICK_ACTION;
            if (api.state.customExpProps.useCase === SEARCH_USE_CASE) {
                const {
                    table,
                    tableSysId,
                    contextSysId,
                    name,
                    actionStateValue,
                    actionTypeSysId,
                    actionInputs,
                    actionId
                } = api.state.customExpProps;
                singleClickActionPayload = {
                    table: table,
                    tableSysId: tableSysId,
                    contextSysId: contextSysId,
                    actionType: actionTypeSysId,
                    actionInputs: actionInputs,
                    actionId: actionId,
                    name: name,
                    actionMetadata: actionMetadata,
                    actionStateValue: actionStateValue
                };
            } else {
                const {
                    sysId,
                    name,
                    actionStateValue
                } = api.state.customExpProps;
                singleClickActionPayload = {
                    sysId: sysId,
                    name: name,
                    actionStateValue: actionStateValue,
                    actionMetadata: actionMetadata,
                };
            }
            api.emit(ON_SINGLE_CLICK_ACTION_INITIATE, singleClickActionPayload);
        } else {
            const {
                guidanceActions,
                guidanceInputs
            } = api.context.props;
        if (isFixedModal) {
            emitNotificationEvent(SN_GUIDANCE_EXPERIENCE_CONNECTED_GUIDANCE_NOTIFICATION_PROPOGATION, EMAIL_SENT_NOTIFICATION_MESSAGE, 'email');
        }
            const action = guidanceActions.find(guidanceAction => guidanceAction.action_sys_id === ATTACH_GUIDANCE_ACTION || guidanceAction.action_sys_id === ATTACH_INTERACTION_GUIDANCE_ACTION);
            api.emit(GUIDANCE_ACTION_CLICKED, {
                action
            });
        }
    };
  const handleAttachArticleEvents = (guidanceId, actionConfigMetaData) => {
        if (event.name === SECONDARY_ACTION_CLICKED) {
            handleSecondaryActionsClicked(guidanceId, actionConfigMetaData);
        } else if (event.name === NOW_BUTTON_BARE_CLICKED) {
            handleViewDetailsClicked();
        } else if (event.name === ATTACH_ARTICLE_TO_COMMENTS_ACTION) {
            if(event.payload.isWorkNoteExperience){
               handleAttachArticleToCommentOrWorkNoteAction(false);
            }else{
               handleAttachArticleToCommentOrWorkNoteAction(true);
            }
        } else if (event.name === PRIMARY_ACTION_CLICKED) {
            handlePrimaryActionClicked(guidanceId, actionConfigMetaData);
        } else if (event.name === ATTACH_ARTICLE_TO_TASK_ACTION) {
            handleAttachArticleToTaskAction(true);
        }
    }

const emitNotificationEvent = async (eventName, message, type) => {
    let items;
    if (type && type == 'email') {
        items = [{
            id: 'email-sent',
            type: 'success',
            message: await helpers.translate("Email sent"),
        }]
    } else {
        items = [{
            message: await helpers.translate("{0}", message),
            type: "success",
        }];
    }
    if (eventName === SN_SEARCH_RESULT_CONTAINER_DECLARATIVE_ACTION) {
        api.emit(eventName, {
            event: RA_EXPANDED_SEARCH_ADD_NOTIFICATION,
            payload: {
                items
            }
        });
    } else {
        api.emit(eventName, {
            items
        });
    }
};

  const getTrimmedValue = (value) => {
      return (new DOMParser)
          .parseFromString(value, 'text/html')
          .documentElement.textContent.toString()
          .trim();
   }


    const getConfiguredGuidanceActions = (actionConfigurationProperty, guidanceId, isPreview) => {
        if(!isValidActionConfigurationProperty(actionConfigurationProperty, guidanceId)){
            let response = isPreview?api.state.actions:api.state.detailViewActions;
            return response;
        }
        let  actionProperties = actionConfigurationProperty[guidanceId]["configuration"];
        let stateListOfActions = isPreview?[...api.state.actions.listOfActions]:[...api.state.detailViewActions.listOfActions];
        for(let indx=0; indx < stateListOfActions.length; indx++){
            let action = stateListOfActions[indx];
            let actionConfig = actionProperties[action["actionConfigId"]];
            let actionOrder = isPreview?actionConfig?.orderInPreview:actionConfig?.orderInDetail;
            if (typeof actionOrder === 'string') {
                    actionOrder = actionOrder.replace(/\\|"/g, '').trim();
                    actionOrder = Number(actionOrder);
                }
            let isActionAvailable =  actionConfig?.isSupported && (isPreview?actionConfig?.visibleInPreview : actionConfig?.visibleInDetail);
            stateListOfActions[indx]["hideAction"]=!isActionAvailable;
            stateListOfActions[indx]["order"]=actionOrder;
            }
        let response = {"listOfActions":stateListOfActions};
        return response;
    }

    const getPrimaryAction = (actions, isDetailExperience = false, showFlag = false) => {
        if (isDetailExperience && !showFlag) {
            actions = actions.filter(action => action.id != FLAG_ARTICLE);
        }
        let availableActions = []; 
        for (let i = 0; i < actions.length; i++){
            if (!actions[i].hideAction){
                availableActions.push(actions[i]);
            }
        }
        const sortedArray = availableActions.sort((a, b) => a.order - b.order);
        return sortedArray[0];
    }

    const getPrimaryAndSecondaryActions = (actions, isDetailExperience = false, showFlag = false) => {
        if (isDetailExperience && !showFlag) {
            actions = actions.filter(action => action.id != FLAG_ARTICLE);
        }
        let availableActions = []; 
        for (let i = 0; i < actions.length; i++){
            if (!actions[i].hideAction){
                availableActions.push(actions[i]);
            }
        }
        const sortedArray = availableActions.sort((a, b) => a.order - b.order);
        const primaryAction = sortedArray.shift();
        return {
            primaryAction: primaryAction,
            secondaryActions: sortedArray,
        }
    }

    //Check if any ids already present in the array or not
    const containsId = (array, id) => {
        var idExists = array.some(action => action.id === id);
        return idExists;
    }

    // Function to check if the recommendedActionProperty is valid
    const isValidActionConfigurationProperty = (obj, guidanceId) => {
        // Check if main key exists
        if (!obj.hasOwnProperty(guidanceId)) {
            return false;
        }
        const requiredProperties = guidanceRequiredProperties[guidanceId];
        const detailOnlyActions = guidancePreviewAndDetailOnlyActions[guidanceId] ? guidancePreviewAndDetailOnlyActions[guidanceId]["detailOnlyActions"] : {};
        const previewOnlyActions = guidancePreviewAndDetailOnlyActions[guidanceId] ? guidancePreviewAndDetailOnlyActions[guidanceId]["previewOnlyActions"] : {};
        const properties = obj[guidanceId].configuration;
        // Check if each required property exists and has both isSupported and order fields
        for (let prop of requiredProperties) {
            if (!properties.hasOwnProperty(prop)) { 
                return false;
            }
            // Get the order, isSupported, and visibleInDetail values
            let { orderInDetail, orderInPreview, isSupported, visibleInDetail, visibleInPreview } = properties[prop];
            //readArticle only present in preview experience
            if(!previewOnlyActions.hasOwnProperty(prop)){
                if (typeof orderInDetail === 'string') {
                    orderInDetail = orderInDetail.replace(/\\|"/g, '').trim();
                }
                if (orderInDetail === null || typeof orderInDetail === 'undefined' || orderInDetail === "" || isNaN(Number(orderInDetail))) {
                    return false;
                }
                if (visibleInDetail !== null && visibleInDetail !== undefined && typeof visibleInDetail !== 'boolean') {
                    return false;
                }
            }

            //markArticle, readArticleInFullView and flagArticle only present in detail experience.
            if(!detailOnlyActions.hasOwnProperty(prop) ){
                if (typeof orderInPreview === 'string') {
                    orderInPreview = orderInPreview.replace(/\\|"/g, '').trim();
                }
                if (orderInPreview === null || typeof orderInPreview === 'undefined' || orderInPreview === "" || isNaN(Number(orderInPreview))) {
                    return false;
                }
                if (visibleInPreview !== null && visibleInPreview !== undefined && typeof visibleInPreview !== 'boolean') {
                    return false;
                }
            }
            if (isSupported !== null && isSupported !== undefined && typeof isSupported !== 'boolean') {
                return false;
            }
        }
        return true;
    }

    const getOrderValue = (obj) => {
        var key = Object.keys(obj)[0];
        return obj[key].order;
    }

    const getSupportedPropertyValue = (obj) => {
        return Object.values(obj)[0].isSupported;
    }

    const getVisibleInDetailPropertyValue = (obj) => {
        return Object.values(obj)[0].visibleInDetail;
    }

    const getActionConfigMetaData = (actionConfigurations, guidanceId, knowledge, articleTitle) => {
        var actionConfigMetaData = {};
        actionConfigMetaData['articleId'] = knowledge;
        actionConfigMetaData['articleTitle'] = articleTitle;
        if (actionConfigurations.hasOwnProperty(guidanceId)) {
            actionConfigMetaData['actionType'] = actionConfigurations[guidanceId].actionType;
            actionConfigMetaData['actionName'] = actionConfigurations[guidanceId].actionName;
            const config = actionConfigurations[guidanceId].configuration;
            if (config) {
                const eventSupported = config.eventSupported;
                if (eventSupported) {
                    actionConfigMetaData['eventSupported'] = eventSupported;
                } else{
                    actionConfigMetaData['eventSupported'] = false;
                }
            }
        }
        return actionConfigMetaData;
    };
    const handleAttachArticleToCommentOrWorkNoteAction = (isComment) => {
        const { isPreviewExperience, additionalNotes } = event.payload;
        let actionId = isComment == true ? ATTACH_ARTICLE_TO_COMMENT_GUIDANCE_ACTION : ATTACH_ARTICLE_TO_WORKNOTE_GUIDANCE_ACTION;
        if (isPreviewExperience) {
            let singleClickActionPayload = {};
            const callToActions = api.state.customExpProps.callToActions;
            let actionMetadata = callToActions.find(guidanceAction => guidanceAction.id === actionId);
            actionMetadata.actionBehavior = SINGLE_CLICK_ACTION;
            if (api.state.customExpProps.useCase === SEARCH_USE_CASE) {
                const { table, tableSysId, contextSysId, name, actionStateValue, actionTypeSysId, actionInputs, actionId } = api.state.customExpProps;
                singleClickActionPayload = {
                    table: table,
                    tableSysId: tableSysId,
                    contextSysId: contextSysId,
                    actionType: actionTypeSysId,
                    actionInputs: actionInputs,
                    formFieldInputs: { additional_notes: additionalNotes },
                    actionId: actionId,
                    name: name,
                    actionMetadata: actionMetadata,
                    actionStateValue: actionStateValue,
                };
            } else {
                const { sysId, name, actionStateValue } = api.state.customExpProps;
                singleClickActionPayload = {
                    sysId: sysId,
                    name: name,
                    actionStateValue: actionStateValue,
                    actionMetadata: actionMetadata,
                    formFieldInputs: { additional_notes: additionalNotes },
                };
            }
  
            api.emit(ON_SINGLE_CLICK_ACTION_INITIATE, singleClickActionPayload);
        } else {
            const { guidanceActions, guidanceInputs } = api.context.props;
            const action = guidanceActions.find(guidanceAction => guidanceAction.action_sys_id === actionId);
            api.emit(GUIDANCE_ACTION_CLICKED, {
                action,
                model: {
                    fields: [
                        {
                            name: "additional_notes",
                            value: additionalNotes,
                        },
                    ]
                }
            });
        }        
    };

    const filterGuidanceActionsBySessionAndAccess = (guidanceActions, configData) =>  {
        const { isLiveAgentChatActive, userHasKbAccess } = configData;
        let guidanceActionsToHide = {};
        if (!isLiveAgentChatActive) {
            guidanceActionsToHide = { [SEND_CHAT]: true, [SEND_PRIVATE_CHAT]: true };
        } else if (!userHasKbAccess) {
            guidanceActionsToHide = { [SEND_CHAT]: true }
        }
    
        guidanceActions.forEach(guidanceAction => {
            if(guidanceActionsToHide.hasOwnProperty(guidanceAction.id)){
                guidanceAction.hideAction = true;
            }
        });

        return guidanceActions;
    };

    const filterGuidanceActionsByUserKbAccess = (guidanceActions, userHasKbAccess) =>  {
        if (userHasKbAccess) return;

        const guidanceActionsToHide = { [ATTACH_ARTICLE_COMMENT]: true, [ATTACH_ARTICLE_EMAIL]: true };
        guidanceActions.forEach(guidanceAction => {
            if (guidanceActionsToHide.hasOwnProperty(guidanceAction.id)){
                guidanceAction.hideAction = true;
            }
        });
    };

    const updatePrimaryActionByChannel = (guidanceActions, primaryActionByChannel) => {
        if (!primaryActionByChannel) return;

        let primaryAction = guidanceActions.find(action => action.id === primaryActionByChannel);
        if (primaryAction && !primaryAction.hideAction) {
            // Set to the lowest possible order value to ensure this is displayed as the primary action
            primaryAction.order = Number.MIN_SAFE_INTEGER;
        }
    };

    const openViewportModal = () => {
        let route = event.payload.route;
        let options = {};
        if (route == 'add-article-link-in-email-modal') {
            options = {
                bare: true,
                size: "lg",
                resizableConfig: {
                    enableResizable: true,
                    resizableMinHeight: '460',
                    resizableMinWidth: '800'
                }
            };
        } else {
            options = {
                bare: true,
            }
        }
        helpers.modal.open('modal_viewport_1', options);
    };

    const getStatusProps = async (actionStateValue, recommendationHint, completionMessage, icon) => {
        var hintColor = 'low';
        var hintLabel = recommendationHint;
        var hintIcon = icon;

        switch (actionStateValue) {
            case 'new':
            case 'in_progress':
                hintColor = 'teal';
                break;
            case 'completed':
                hintColor = 'positive';
                hintIcon = 'circle-check-outline';
                hintLabel = completionMessage;
                break;
            case 'skipped':
                hintColor = 'pink';
                hintIcon = 'circle-exclamation-outline';
                hintLabel = await helpers.translate("This recommendation was dismissed");
                break;
            case 'error_skipped':
            case 'in_error':
                hintColor = 'critical';
                hintIcon = 'circle-close-fill';
                hintLabel = await helpers.translate("This action couldn't be completed");
                break;
        }
        if (hintLabel == undefined) {
            hintLabel = await helpers.translate("This action has been completed");
        }
        let statusProps = {
            hintColor: hintColor,
            hintLabel: hintLabel,
            hintIcon: hintIcon,
        };
        return statusProps;
    };
  
    return {
       handleSendToMessageAction: handleSendToMessageAction,
        handleSecondaryActionsClicked: handleSecondaryActionsClicked,
        handleAttachArticleEvents: handleAttachArticleEvents,
        emitNotificationEvent: emitNotificationEvent,
        getConfiguredGuidanceActions: getConfiguredGuidanceActions,
        getActionConfigMetaData: getActionConfigMetaData,
        getPrimaryAction: getPrimaryAction,
        getPrimaryAndSecondaryActions: getPrimaryAndSecondaryActions,
        filterGuidanceActionsBySessionAndAccess: filterGuidanceActionsBySessionAndAccess,
        filterGuidanceActionsByUserKbAccess: filterGuidanceActionsByUserKbAccess,
        updatePrimaryActionByChannel: updatePrimaryActionByChannel,
        openViewportModal: openViewportModal,
        getStatusProps: getStatusProps,
        getTrimmedValue
    }
}

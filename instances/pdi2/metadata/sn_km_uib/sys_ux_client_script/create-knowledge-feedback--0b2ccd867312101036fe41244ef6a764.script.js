function handler({
    api,
    helpers,
    event,
    imports
}) {
    const {
        context,
        data,
        state,
        setState,
        emit
    } = api;
    const {
        modal
    } = helpers;
    const insertRecord = function(table, fields, type) {
        setState("currentFeedbackAction", type);
        data.create_record_1.execute({
            table,
            templateFields: fields,
            useSetDisplayValue: ''
        });
    };

    const setPercentHelpfulMessage = function (usefulYesCount, totalUsefulCount) {
        if (usefulYesCount && totalUsefulCount) {
            var helpPercent = Math.round(usefulYesCount/totalUsefulCount * 100) ;
            if (helpPercent>0) {
                helpers.translate('% found this helpful').then((value) => {
                    setState('helpPercentMessage', helpPercent + value);
                });
                setState('isHelpPercentInfoHidden', false);
            }
        }
    };

    var articleSysId = context.props.sysId;
    var templateFields = "article=" + articleSysId + "^";
    var articleData = data.get_article_details_1.articleDetails;
    const feedbackAction = state.currentFeedbackAction;

    if (event.elementId == "kb_star_rating") {
        setState('currentFeedbackAction', "rating");
        templateFields += "rating=" + event.payload.rating;
        if (articleData.enableActionableFeedbackForRating >= event.payload.rating) {
            setState('userRating', event.payload.rating);
            setState('additionalDetails', null);
            setState("selectedReason", ["4"]);
            modal.open("[component-id$='custom_1']");
        } else {
            insertRecord('kb_feedback', templateFields, "rating");
        }
        if(api.context.props.overridePageEvents){
            api.emit("SN_KNOWLEDGE_VIEW#RATING_CLICKED", event.payload);
        }
    }

    if (event.elementId == "boolean_feedback_no") {
        var showModal = (articleData.showFeedbackOptions || articleData.showFeedbackComments) && articleData.enableActionableFeedbackForHelpful;
        setState("currentFeedbackAction", "boolean_feedback");
        if (showModal) {
            setState('additionalDetails', null);
            setState("selectedReason", ["4"]);
            modal.open("[component-id$='custom_1']");
        } else {
            templateFields += "useful=no";
            setState('isHelpfulResponseHidden', false);
            setState("isBooleanFeedbackButtonsHidden", true);
            insertRecord('kb_feedback', templateFields, "boolean_feedback");
            setPercentHelpfulMessage(articleData.usefulYesCount, articleData.totalUsefulCount+1);
            
        }
    }else if (event.elementId == "boolean_feedback_yes") {
        setState("currentFeedbackAction", "boolean_feedback");
        templateFields += "useful=yes";
        setState('isHelpfulResponseHidden', false);
        setState("isBooleanFeedbackButtonsHidden", true);
        insertRecord('kb_feedback', templateFields, "boolean_feedback");
        setPercentHelpfulMessage(articleData.usefulYesCount+1, articleData.totalUsefulCount+1);
        
    } else if (event.elementId == "boolean_feedback_no_ignore") {

        modal.close("[component-id$='custom_1']");
        if (feedbackAction != "rating") {
            setState('isHelpfulResponseHidden', false);
            setState("isBooleanFeedbackButtonsHidden", true);
            templateFields += "reason=4^useful=no";
            setPercentHelpfulMessage(articleData.usefulYesCount, articleData.totalUsefulCount+1);

        }
        if (feedbackAction == "rating") {
            templateFields += "reason=4^rating=" + state.userRating;
        }
        insertRecord('kb_feedback', templateFields,feedbackAction);

    } else if (event.elementId == "boolean_feedback_no_submit") {
        modal.close("[component-id$='custom_1']");
        if ((state.selectedReason)[0] != null)
            templateFields += "reason=" + (state.selectedReason)[0] + "^";
        if (state.additionalDetails != null)
            templateFields += "comments=" + state.additionalDetails.replaceAll("\n", "\\n").replaceAll("^", "&#94;").replaceAll("=", "\\=").replaceAll(`"`,`\\"`) + "^";
        if (feedbackAction != "rating") {
            setState('isHelpfulResponseHidden', false);
            setState("isBooleanFeedbackButtonsHidden", true);
            templateFields += "useful=no";
            setPercentHelpfulMessage(articleData.usefulYesCount, articleData.totalUsefulCount+1);
            
        }
        if (feedbackAction == "rating") {
            templateFields += "rating=" + state.userRating;
        } 
        insertRecord('kb_feedback', templateFields,feedbackAction);
    } else if (event.elementId == "flag_article") {
        modal.close("[component-id$='custom_2']");
        var comments = state.flagArticleContent.replaceAll("\n", "\\n").replaceAll("^", "&#94;").replaceAll("=", "\\=").replaceAll(`"`,`\\"`);
        templateFields += "flagged=true^comments=" + comments;
        setState('flagArticleContent', comments);
        if (articleData.enableActionableFeedbackForFlag)
            templateFields += "^reason=Flagged";
        insertRecord('kb_feedback', templateFields, "flag_article");
    }

    if (event.elementId == "create_record_1") {
        var requestFailed = false;

        if (event.name == "DATA_OP_SUCCEEDED") {
            var output = event.payload.data.output.data.GlideRecord_Mutation.insert_kb_feedback;
            if (output == null) {
                requestFailed = true;
            } else {
                if (state.currentFeedbackAction == "flag_article") {
                    helpers.translate('Article has been flagged').then((value) => {
                        emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                            items: [{
                                id: "flagArticleSuccess",
                                status: "info",
                                icon: "info-circle-outline",
                                content: value,
                                action: {
                                    type: "dismiss"
                                }
                            }]
                        });
                    });
                }
                if (state.currentFeedbackAction == "rating") {
                    helpers.translate('Feedback submitted.').then((value) => {
                        emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                            items: [{
                                id: "ratingArticleSuccess",
                                status: "info",
                                icon: "info-circle-outline",
                                content: value,
                                action: {
                                    type: "dismiss"
                                }
                            }]
                        });
                    });
                }

                if (state.currentFeedbackAction == "boolean_feedback") {
                    helpers.translate('Feedback submitted.').then((value) => {
                        emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                            items: [{
                                id: "booleanFeedbackSuccess",
                                status: "info",
                                icon: "info-circle-outline",
                                content: value,
                                action: {
                                    type: "dismiss"
                                }
                            }]
                        });
                    });
                }
            }
        }

        if (event.name == "DATA_OP_FAILED" || requestFailed) {
            helpers.translate('Feedback submitted.').then((value) => {
                emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                    items: [{
                        id: "flagArticleFailure",
                        status: "critical",
                        icon: "info-circle-outline",
                        content: value,
                        action: {
                            type: "dismiss"
                        }
                    }]
                });
            });
        }

        setState('currentFeedbackAction', "");
    }
}

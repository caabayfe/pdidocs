var RequestNotificationUtilSNC = Class.create();
RequestNotificationUtilSNC.prototype = {
    initialize: function() {},

    /**
     * create notification Request primary button
     * @param template - templatePrinter
     * @param url - string url for the redirection
     * @param message - message of button
     */
    createNotificationPrimayAction: function(template, url, message) {	
        var color = 'color: #4f52bd;';
        var fontSize = 'font-size: 16px;';
        var fontFamily = 'font-family: Lato, Arial, sans-serif;';
        var textDecoration = 'text-decoration: none;';
        var display = 'display: inline-block;';
        var padding = 'padding: 6px 16px;';
        var marginBottom = 'margin-bottom:32px;';
        var borderRadius = 'border-radius: 4px;';
        var border = 'border: 1px solid #4f52bd;';

        template.print('<div><a href="' + url + '"');
        template.print('style="' + borderRadius + border + padding + color + textDecoration + marginBottom + fontSize + fontFamily + display);
        template.print('">');
        template.print(message);
        template.print('</a></div>');
    },

    /**
     * Get RITM details for notification
     * @param sys_id - Request Sys_id
     * @returns request details for notitification
     */
    getRequestDetails: function(sys_id, requestGr, addReqItemVariables) {
        var requestDetails = {
            showRequestedFor: true,
            totalTasks: 0,
            tasks: []
        };
        var gr = new GlideRecord('sc_req_item');
        gr.addQuery('request', sys_id);
        gr.query();
        while (gr.next()) {
            if (requestDetails.totalTasks < 3) {
                var catalogItemJS = new sn_sc.CatItem(gr.cat_item);
                var catItemDetails = catalogItemJS.getItemSummary(true);
                var showItemRequestedFor = false;
                if (gr.requested_for.toString() !== requestGr.requested_for.toString()) {
                    requestDetails.showRequestedFor = false;
                    showItemRequestedFor = true;
                }
                var task = this._generateRequestItemObject(gr, catItemDetails, addReqItemVariables);
                task.showItemRequestedFor = showItemRequestedFor;
                requestDetails.tasks.push(task);
            }

            requestDetails.totalTasks = requestDetails.totalTasks + 1;
        }
        return requestDetails;
    },


    getRequestItemDetails: function(requestItemId, requestedFor, showVariables) {
        var task = {};
        var gr = new GlideRecord('sc_req_item');
        gr.addQuery('sys_id', requestItemId);
        gr.query();
        if (gr.next()) {
            var catalogItemJS = new sn_sc.CatItem(gr.cat_item);
            var catItemDetails = catalogItemJS.getItemSummary(true);
            var showItemRequestedFor = false;
            if (gr.requested_for.toString() !== requestedFor.toString()) {
                showItemRequestedFor = true;
            }
            task = this._generateRequestItemObject(gr, catItemDetails, showVariables);
            task.showItemRequestedFor = showItemRequestedFor;
        }
        return task;
    },

    _generateRequestItemObject: function(requestItemGr, catItemDetails, showVariables) {
        var requestItem = {
            sysId: requestItemGr.getUniqueValue(),
            requestNumber: requestItemGr.number.toString(),
            item: catItemDetails.name.toString(),
            price: requestItemGr.price.toString(),
            quantity: requestItemGr.quantity.toString(),
            recurringPrice: requestItemGr.recurring_price.toString(),
            priceWithCurrency: requestItemGr.price.getDisplayValue(),
            recurringPriceWithCurrency: requestItemGr.recurring_price.getDisplayValue(),
            recurringFrequency: catItemDetails.recurring_frequency,
            omitPrice: !catItemDetails.show_price,
            showQuantity: catItemDetails.show_quantity,
            requestedFor: requestItemGr.requested_for.name.getDisplayValue()
        };
        if (showVariables) {
            requestItem['variables'] = this.getRequestItemVariables(requestItem.sysId);
        }
        return requestItem;
    },

    /**
     * Get REQ recurring price for notification
     * @param sys_id - Request Sys_id
     * @returns request rollup recurring price string concatinated
     */
    gerRecurringPriceRollup: function(sys_id) {
        var recurringPriceText = '';
        var recurringPriceGr = new GlideRecord('sc_recurring_rollup');
        recurringPriceGr.query('request', sys_id);
        recurringPriceGr.query();
        while (recurringPriceGr.next()) {
            recurringPriceText = recurringPriceText + ' + ' + recurringPriceGr.recurring_price.getDisplayValue() + ' ' + recurringPriceGr.recurring_frequency.getDisplayValue();
        }
        return recurringPriceText;
    },

    /**
     * Get REQ comment for state
     * @param requestId - requestId
     * @param state - state of the approval
     * @returns comment based on the state for last approved/rejected
     */
    getRequestComment: function(requestId, state) {
        var approverRecord = new GlideRecord("sysapproval_approver");
        approverRecord.addQuery('state', state);
        approverRecord.addQuery('sysapproval', requestId);
        approverRecord.orderBy('sys_updated_on');
        approverRecord.setLimit(1);
        approverRecord.query();
        while (approverRecord.next()) {
            var commentDesc = approverRecord.comments.getJournalEntry(1).toString();
            if (commentDesc.length > 0) {
                var split = commentDesc.split(/\(comments\)/gi);
                if (split.length > 1) {
                    // returns the first comment.
                    var comment = split[split.length - 1];
                    comment = comment.trim();
                    var colonIndex = comment.indexOf(':');
                    if (colonIndex != -1) {
                        comment = comment.substr(colonIndex + 2, comment.length - 1);
                    }
                    comment = comment.replace(/\n/g, '<br/>');
                    return comment;
                }
            }
        }
    },

    /**
     * Get Request Item Variables
     * @param sys_id - Request Item Sys_id
     * @returns request item variables
     */
    getRequestItemVariables: function(sys_id) {
        var reqItemVariables = [];
        var glideVariableSet = new GlideappVariablePoolQuestionSet();
        glideVariableSet.setRequestID(sys_id);
        glideVariableSet.load();
        var variables = glideVariableSet.getFlatQuestions();
        for (var i = 0; i < variables.size(); i++) {
            if (variables.get(i).getLabel() !== '' && variables.get(i).getDisplayValue() && variables.get(i).getDisplayValue() !== '' && variables.get(i).isVisibleSummary()) {
                var displayVal = variables.get(i).getDisplayValue();
                if (displayVal instanceof String) {
                    displayVal = String(displayVal).valueOf();
                    displayVal = displayVal.replace(/\n/g, '<br/>');
                }
                var reqItemVariable = {
                    'label': variables.get(i).getLabel(),
                    'value': displayVal,
                    'type': variables.get(i).getType()
                };
                if (variables.get(i).getType() == 33) {
                    reqItemVariable['attachmentSysId'] = variables.get(i).getValue();
                }				
                reqItemVariables.push(reqItemVariable);
            }
        }
        return reqItemVariables;
    },

    /**
     * Get Comments from journal records
     * @param elementId, current objectId
     * @param sysClass, classname of the object
     * @param byUserName, filter by username
     * @returns comment object with {val: comment, user: comment_created_by}
     */
    getComments: function(elementId, sysClass, byUserName) {
        var comment = {
            val: '',
            user: byUserName
        };
        var journalRec = new GlideRecord('sys_journal_field');
        journalRec.addQuery('element_id', elementId);
        journalRec.addQuery('element', 'comments');
        journalRec.addQuery('name', sysClass);
        if (byUserName) {
            journalRec.addQuery('sys_created_by', byUserName);
        }
        journalRec.orderByDesc('sys_created_on');
        journalRec.setLimit(1);
        journalRec.query();
        if (journalRec.next()) {
            var notes = journalRec.value.trim();

            // Regex to match code blocks
            var codeBlockRegex = /\[code\]([\s\S]*?)\[\/code\]/g;
            var codeBlocks = [];

            // Extract code blocks and replace them with placeholders
            notes = notes.replace(codeBlockRegex, function(match, p1) {
                codeBlocks.push(p1); // Store the code content without [code] tags
                return "[CODE_BLOCK_" + (codeBlocks.length - 1) + "]"; // Placeholder
            });

            // Replace \n with <br/> only outside code blocks
            notes = notes.replace(/\n/g, '<br/>');

            // Restore code blocks without [code] tags
            notes = notes.replace(/\[CODE_BLOCK_(\d+)\]/g, function(match, p1) {
                return codeBlocks[p1]; // Put back original content without [code] tags
            });

            if (notes.length > 0) {
                comment.val = notes;
            }
            if (!byUserName) {
                if (journalRec.sys_created_by == "system") {
                    comment.user = "System";
                } else {
                    var userRec = new GlideRecord('sys_user');
                    userRec.addQuery('user_name', journalRec.sys_created_by);
                    userRec.setLimit(1);
                    userRec.query();

                    if (userRec.next()) {
                        comment.user = userRec.name;
                    }
                }
            }
        }
        return comment;
    },

    /**
     * create Request item price content
     * @param requestItemDetails - requestItem details which has price information
     * @param template - templatePrinter
     */
    setPricingtoTemplate: function(requestItemDetails, template) {
        var priceDisplay = gs.getProperty('glide.sc.price.display');
        var showPrice = !requestItemDetails.price.nil() && !requestItemDetails.omitPrice;
        var showRecurringPrice = !requestItemDetails.recurringPrice.nil() && !requestItemDetails.omitPrice;
        if (priceDisplay == 'never') {
            showPrice = false;
            showRecurringPrice = false;
        }
        if ((priceDisplay == 'non_zero' && (!(requestItemDetails.price > 0) || !showPrice)) ||
            (priceDisplay == 'always' && !showPrice)) {
            showPrice = false;
        }
        if ((priceDisplay == 'non_zero' && (!(requestItemDetails.recurringPrice > 0) || !showRecurringPrice)) ||
            (priceDisplay == 'always' && !showRecurringPrice) || !requestItemDetails.recurringFrequency) {
            showRecurringPrice = false;
        }
        if (showPrice || showRecurringPrice) {
            var finalPrice = showPrice ? '<b style="font-weight: 600;">' + requestItemDetails.priceWithCurrency + '</b>' : '';
            if (showRecurringPrice) {
                finalPrice = finalPrice + (showPrice ? ' + ' : '');
                finalPrice = finalPrice + '<span style="font-size:14px;font-weight: 600">' + requestItemDetails.recurringPriceWithCurrency + ' ' + requestItemDetails.recurringFrequency + '</span>';
            }
            finalPrice = finalPrice + '<span style="font-size:14px;font-weight: 600"> each</span>';
            template.print('<div style="font-size: 16px; line-height:24px">Price: ' + finalPrice + '</div>');
        }
    },

    /**
     * create Request item variables content
     * @param requestItem - requestItem
     * @param template - templatePrinter
     */
    setRequestItemVariablestoTemplate: function(requestItem, template) {
        var self = this;
        var fontSize = 'font-size: 16px;';
        var lineHeight = 'line-height: 24px;';
        var ATTACHMENT_VARIABLE_TYPE = 33;
        template.print('<div style="' + fontSize + lineHeight + '">' + gs.getMessage("Options:") + '</div>');
        requestItem.variables.forEach(function(variable) {
            if (variable.type === ATTACHMENT_VARIABLE_TYPE) {
                self.addAttachmentLinkToRequestItemTemplate(requestItem.sysId, variable, template);
            } else {
                var variableValue = variable.value;
                if (variableValue == 'true') {
                    variableValue = gs.getMessage("Yes");
                } else if (variableValue == 'false') {
                    variableValue = gs.getMessage("No");
                }
                template.print('<div style="' + fontSize + lineHeight + 'padding-left:24px;">' + variable.label + ': <b style="font-weight: 600;">' + ' ' + variableValue + "</b><br/></div>");
            }
        });
    },

    /**
     * add attachment link to request item variables template
     * @param requestItemSysId - requestItem sys_id
     * @param variable - requestItem attachment variable
     * @param template - templatePrinter
     */
    addAttachmentLinkToRequestItemTemplate: function(requestItemSysId, variable, template) {
        var fontSize = 'font-size: 16px;';
        var lineHeight = 'line-height: 24px;';
        var sysAttachmentGr = new GlideRecord('sys_attachment');
        sysAttachmentGr.addQuery('table_sys_id', requestItemSysId);
        sysAttachmentGr.query();
        if (sysAttachmentGr.next()) {
            var attachmentDownloadLink = '/sys_attachment.do?sys_id=' + sysAttachmentGr.sys_id;
            template.print('<div style="' + fontSize + lineHeight + 'padding-left:24px;">' + variable.label + ': <a href=' + attachmentDownloadLink + ' style="color: #3C59E7;font-weight: 600;">' + ' ' + variable.value + "</a><br/></div>");
        }
    },
    /**
     * generates the greeting message dynamically based on receipients fields
     * @param requestGR - request record
     * @param notificationGR - notification record
     */
    setGreetingsMessage: function(requestGR, notificationGR) {
        var recipients = notificationGR.recipient_fields.split(",");
        var watchListIndex = recipients.indexOf("watch_list");
        if (watchListIndex > -1)
            recipients.splice(watchListIndex, 1);

        if (((recipients.length == 2) && recipients.indexOf("opened_by") !== -1) && (recipients.indexOf("requested_for") !== -1)) {
            if (requestGR.requested_for == requestGR.opened_by)
                return gs.getMessage("Hi {0},", [requestGR.requested_for.first_name]);
            else
                return gs.getMessage("Hi there,");
        } else if (recipients.length == 1) {
            var requestObj = requestGR;
            var fields = recipients[0].split(".");
            fields.forEach(function(item) {
                requestObj = requestObj[item];
            });
            if (requestObj.sys_class_name == 'sys_user')
                return gs.getMessage("Hi {0},", requestObj.first_name);
            else
                return gs.getMessage("Hi there,");
        } else
            return gs.getMessage("Hi there,");
    },

    type: 'RequestNotificationUtilSNC'
};

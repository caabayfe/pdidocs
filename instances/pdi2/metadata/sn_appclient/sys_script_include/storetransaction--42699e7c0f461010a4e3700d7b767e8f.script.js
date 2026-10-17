var StoreTransaction = Class.create();
StoreTransaction.prototype = {
    initialize: function() {
        this.MESSAGES = {
            "on_premise_company": gs.getMessage("On-Premise customers cannot purchase apps on the ServiceNow Store."),
            "federal_company": gs.getMessage("We noticed that you are hosted on FISMA datacenter. Only FedRAMP hosted federal customers can obtain apps from the ServiceNow Store."),
            "action_not_for_same_company": gs.getMessage("Action not for same company"),
            "trial_exists_for_this_version": gs.getMessage("Your trial for this version of the application is already in progress."),
            "unauthorised_instance_to_access": gs.getMessage("The instance you are trying to access from doesn't belong to your company. Please contact Servicenow for more information"),
            "instance_not_found": gs.getMessage("Instance not found. Please contact Servicenow for more information"),
            "try_success": gs.getMessage("This application is now available for install on any of your compatible non-production instances. This trial is only valid for 30 days. You must uninstall the app at the end of your 30 day trial period."),
            "trial_already_approved": gs.getMessage("Your trial request for this version of the application is already in approved."),
            "request_trial_success": gs.getMessage("Thank you. Your trial request has been sent to the seller of this application. Once the request has been reviewed, we will notify you via email."),
            "request_trial_header": gs.getMessage("Request Trial"),
            "application_already_purchased":gs.getMessage("Application already purchased"),
            "purchase_request_already_submitted":gs.getMessage("Your purchase request has already been submitted."),
            "purchase_request_submitted_other_version":gs.getMessage("A purchase request has already been submitted on other version of this app."),
            "purchase_request_already_approved":gs.getMessage("Your purchase request has already been approved."),
            "purchase_request_already_rejected":gs.getMessage("Your purchase request has already been rejected."),
            "application_not_in_appstore":gs.getMessage("Application not in appstore"),
            "success_get": gs.getMessage("Thank you for your purchase. This application is now available for install on any of your compatible instances."),
            "purchase_already_rejected": gs.getMessage("Your purchase request has already been rejected"),
            "purchase_already_approved":gs.getMessage("Your purchase request has already been approved"),
            "request_app_header": gs.getMessage("Request App"),
            "request_app_success": gs.getMessage("Thank you. Your app request has been sent to the seller of this application. Once the request has been reviewed, we will notify you via email."),
            "default_message": gs.getMessage("Something went wrong. Please contact Servicenow for more information"),
            "resend_quote_success": gs.getMessage("The quote resend has been requested."),
            "resend_quote_header": gs.getMessage("Resend Quote"),
            "cancel_quote_success": gs.getMessage("The quote has been cancelled."),
            "cancel_quote_header": gs.getMessage("Cancel Quote"),
            "resend_quote_error": gs.getMessage("An error occurred while resending the quote."),
            "cancel_quote_error": gs.getMessage("An error occurred while cancelling the quote."),
            "tax_error": gs.getMessage("We are currently unable to calculate tax on App Manager. Please go to Store to process the transaction."),
            "quote_request_success": gs.getMessage("We have received your quote request. You will receive an email with the quote after we process your request."),
            "quote_request_error": gs.getMessage("There is an error with quote request please try again."),
            "purchase_with_po_error": gs.getMessage("There is an error with purchase please try again."),
            "purchase_with_po_header": gs.getMessage("PO Submitted"),
            "purchase_with_po_success": gs.getMessage("Thank you for submitting the PO. Your app purchase is pending PO review. Once complete, you will be notified in an email how to obtain your app."),
            "free": gs.getMessage("Free"),
            "paid_per_month": gs.getMessage("Per Month"),
            "paid_per_fulfiller_per_month": gs.getMessage("Per Fulfiller Per Month")
        };
        this.instrumentationPoint = "store_page";
        this.instrumentationEvent = "store_transaction";
        this.appclientGCFUtil = new AppClientGCFUtil();
    },
    requestAppTrial: function(applicationSysId, sourceAppId) {
        var storeTransactionRequest = new ScopedAppRepoRequest("store_transaction", {
            "use_cookies": "true"
        });
        storeTransactionRequest.setParameter("transaction_type", "request_trial");
        storeTransactionRequest.setParameter("application", applicationSysId);
        storeTransactionRequest.setParameter("source_app_id", sourceAppId);
        var response = storeTransactionRequest.post();
        if (storeTransactionRequest.getStatusCode() == 401)
            return {error: true, statusCode: storeTransactionRequest.getStatusCode(), message: gs.getMessage("Please re-initiate the transaction providing Hi username/password to proceed with Request Trial")};
        var responseJSON = JSON.parse(response);
        responseJSON.statusCode = storeTransactionRequest.getStatusCode();
        responseJSON.header = this.getMessageFromKey("request_trial_header");
        if (responseJSON.result == "success")
            responseJSON.message = this.getMessageFromKey("request_trial_success");
        else {
            responseJSON.message = responseJSON.error ? this.getMessageFromKey(responseJSON.error) : this.getMessageFromKey(responseJSON.result);
            responseJSON.error = true;
        }
        return responseJSON;
    },
    tryApp: function(applicationSysId, sourceAppId) {
        var data = {};
        data.app_id = sourceAppId;
        data.transaction_name = "Try";
        this.appclientGCFUtil.recordEvent(this.instrumentationPoint, this.instrumentationEvent, data);

        var storeTransactionRequest = new ScopedAppRepoRequest("store_transaction", {
            "use_cookies": "true"
        });
        storeTransactionRequest.setParameter("transaction_type", "try");
        storeTransactionRequest.setParameter("application", applicationSysId);
        storeTransactionRequest.setParameter("source_app_id", sourceAppId);
        var response = storeTransactionRequest.post();
        if (storeTransactionRequest.getStatusCode() == 401)
            return {error: true, statusCode: storeTransactionRequest.getStatusCode(), message: gs.getMessage("Please re-initiate the transaction providing Hi username/password to proceed with Try") };
        var responseJSON = JSON.parse(response);
        responseJSON.statusCode = storeTransactionRequest.getStatusCode();
        if (responseJSON.error)
            responseJSON.message = this.getMessageFromKey(responseJSON.error);
        else
            responseJSON.message = this.getMessageFromKey("try_success");
        return responseJSON;
    },

    performGetPurchase: function(app_id, version) {
        var data = {};
        data.app_id = app_id;
        data.transaction_name = "Get";
        this.appclientGCFUtil.recordEvent(this.instrumentationPoint, this.instrumentationEvent, data);

        var result = {};
        if(this.isInstanceOffline()) {
            result.error = "client_call_not_allowed";
            return result;
        }
        var appDetail = new ScopedAppRepoRequest("store_transaction" , {"use_cookies":"true"})
            .setParameter("transaction_type", "get")
            .setParameter("app_id", app_id)
            .setParameter("version", version);
        var response = appDetail.post();
        var statusCode = appDetail.getStatusCode();
        if (statusCode == 401)
            return {error: true, statusCode: statusCode, message: gs.getMessage("Please re-initiate the transaction providing Hi username/password to proceed") };

        if(statusCode == 200 || statusCode == 400) {
            result = new global.JSON().decode(response);
            if(result.error)
                result.message = this.getMessageFromKey(result.error);
            else
                result.message = this.getMessageFromKey('success_get');
        }
        result.status = statusCode;
        return result;
    },
    
	performRequestApp: function(app_id, app_sys_id, request_type) {
        var data = {};
        data.app_id = app_id;
        data.transaction_name = "Request App";
        this.appclientGCFUtil.recordEvent(this.instrumentationPoint, this.instrumentationEvent, data);

		var responseObj = {};
		if(this.isInstanceOffline()) {
			responseObj.error = "client_call_not_allowed";
			return responseObj;
		}
		var appDetail = new ScopedAppRepoRequest("store_transaction", {"use_cookies":"true"})
		    .setParameter("app_id", app_id)
		    .setParameter("app_sys_id", app_sys_id)
		    .setParameter("request_type", request_type)
		    .setParameter("transaction_type", "request_app");
		var response = appDetail.get();
		var statusCode = appDetail.getStatusCode();
		if (statusCode == 401)
		    return {error: true, statusCode: statusCode, message: gs.getMessage("Please re-initiate the transaction providing Hi username/password to proceed") };
		if(statusCode == 200 || statusCode == 400) {
			responseObj = new global.JSON().decode(response);
			responseObj.header = this.getMessageFromKey("request_app_header");
			if(responseObj.result == "success") {
				responseObj.message = this.getMessageFromKey('request_app_success');
			} else {
				responseObj.message = responseObj.error ? this.getMessageFromKey(responseObj.error) : this.getMessageFromKey(responseObj.result);
				responseObj.error = true;
			}
		}
		else
			responseObj.error = "No response returned";
		responseObj.statusCode = statusCode;
		return responseObj;
	},
	completeOfflinePurchase: function(completePurchaseArgs) {
		var responseObj = {};
		completePurchaseArgs.use_cookies = "true";
		var result = new ScopedAppRepoRequest("store_transaction", completePurchaseArgs);
		var response = result.post();
		var statusCode = result.getStatusCode();
		if (statusCode == 401)
			return {error: true, statusCode: statusCode, message: gs.getMessage("Please re-initiate the transaction providing Hi username/password to proceed") };
		if(statusCode == 200 || statusCode == 400)
			responseObj = new global.JSON().decode(response);
		responseObj.statusCode = statusCode;
		return responseObj;
	},
    getMessageFromKey: function(key) {
        return this.MESSAGES[key] ? this.MESSAGES[key] : this.MESSAGES['default_message'];
    },

    isInstanceOffline: function() {
        return new AppsData().isInstanceOffline();
    },

    modifyQuote: function(params) {
        var sourceAppId = params.source_app_id;
        var transactionName = params.action == "resend_quote" ? "Resend Quote" : "Cancel Quote";
        var data = {};
        data.app_id = sourceAppId;
        data.transaction_name = transactionName;
        this.appclientGCFUtil.recordEvent(this.instrumentationPoint, this.instrumentationEvent, data);

        var quote_sys_id = params.quote_sys_id;
        var reason = params.reason;
        var transactionType = params.action;
        var responseObj = {};
        var appDetail = new ScopedAppRepoRequest("store_transaction", {"use_cookies":"true"})
            .setParameter("quote_sys_id", quote_sys_id)
            .setParameter("request_type", "store_transaction")
            .setParameter("reason", reason)
            .setParameter("transaction_type", transactionType);
        var response = appDetail.get();
        var statusCode = appDetail.getStatusCode();
        if (statusCode == 401)
            return {error: true, statusCode: statusCode, message: gs.getMessage("Please re-initiate the transaction providing Hi username/password to proceed") };
        if(statusCode == 200 || statusCode == 400) {
            responseObj = new global.JSON().decode(response);
            responseObj.header = this.getMessageFromKey(transactionType + "_header");
            if(responseObj.success) {
                responseObj.message = this.getMessageFromKey(transactionType + '_success');
            } else {
                responseObj.error = true;
                responseObj.message = this.getMessageFromKey(transactionType + '_error');
            }
        } else {
            responseObj.error = true;
            responseObj.message = this.getMessageFromKey("default_message");
        }
        responseObj.statusCode = statusCode;
        return responseObj;
	},

	requestQuote: function(params) {
        var paramsData = JSON.parse(params.data);
        var data = {};
        data.app_id = paramsData.source_app_id;
        data.transaction_name = "Buy";
        this.appclientGCFUtil.recordEvent(this.instrumentationPoint, this.instrumentationEvent, data);

        var responseObj = {};
        var appDetail = new ScopedAppRepoRequest("store_transaction", {"use_cookies":"true"})
            .setParameter("request_type", "store_transaction")
            .setParameter("transaction_type", "request_quote")
            .setParameter("data", params.data);
        var response = appDetail.post();
        var statusCode = appDetail.getStatusCode();
        if (statusCode == 401)
            return {error: true, statusCode: statusCode, message: gs.getMessage("Please re-initiate the transaction providing Hi username/password to proceed") };
        if(statusCode == 200 || statusCode == 400) {
            responseObj = new global.JSON().decode(response);
			if(responseObj.success) {
                responseObj.message = this.getMessageFromKey("quote_request_success");
			} else {
                responseObj.error = true;
                responseObj.message = this.getMessageFromKey("quote_request_error");
            }
        } else {
            responseObj.error = true;
            responseObj.message = this.getMessageFromKey("default_message");
        }
        responseObj.statusCode = statusCode;
        return responseObj;
	},

	getPricingDetails: function(params) {
        var responseObj = {};
        var appDetail = new ScopedAppRepoRequest("store_transaction", {"use_cookies":"true"})
            .setParameter("request_type", "store_transaction")
            .setParameter("transaction_type", "get_pricing_details")
            .setParameter("app_details", params.app_details);
        var response = appDetail.post();
        var statusCode = appDetail.getStatusCode();
        if (statusCode == 401)
            return {error: true, statusCode: statusCode, message: gs.getMessage("Please re-initiate the transaction providing Hi username/password to proceed with Try") };
        if(statusCode == 200 || statusCode == 400) {
            responseObj = new global.JSON().decode(response);
            if(responseObj.error) {
                responseObj.message = this.getMessageFromKey("tax_error");
                responseObj.error = true;
            }
            else if(responseObj.price_type && responseObj.price_type.toString() != "custom" && this.MESSAGES[responseObj.price_type.toString()])
                responseObj.price_type_label = this.MESSAGES[responseObj.price_type.toString()];
        } else {
            responseObj.error = true;
            responseObj.message = this.getMessageFromKey("tax_error");
        }
        responseObj.statusCode = statusCode;
        return responseObj;
	},

    generatePurchaseTransaction: function() {
        var responseObj = {};
        var appDetail = new ScopedAppRepoRequest("store_transaction", {"use_cookies":"true"})
            .setParameter("request_type", "store_transaction")
            .setParameter("transaction_type", "generate_purchase_transaction")
        var response = appDetail.post();
        var statusCode = appDetail.getStatusCode();
        if (statusCode == 401)
            return {error: true, statusCode: statusCode, message: gs.getMessage("Please re-initiate the transaction providing Hi username/password to proceed") };
        if(statusCode == 200 || statusCode == 400) {
            responseObj = new global.JSON().decode(response);
            if(responseObj.error) {
                responseObj.message = this.getMessageFromKey("purchase_with_po_error");
                responseObj.error = true;
            }
        } else {
            responseObj.error = true;
            responseObj.message = this.getMessageFromKey("purchase_with_po_error");
        }
        responseObj.statusCode = statusCode;
        return responseObj;
    },

    updatePOPurchaseTxn: function(params) {
        var poDetaills = JSON.parse(params.po_details);
        var data = {};
        data.app_id = poDetaills.source_app_id;
        data.transaction_name = 'Purchase with PO';
        this.appclientGCFUtil.recordEvent(this.instrumentationPoint, this.instrumentationEvent, data);
        var responseObj = {};
        var appDetail = new ScopedAppRepoRequest("store_transaction", {"use_cookies":"true"})
            .setParameter("request_type", "store_transaction")
            .setParameter("transaction_type", "submit_po")
            .setParameter("po_details", params.po_details);
        var response = appDetail.post();
        var statusCode = appDetail.getStatusCode();
        if (statusCode == 401)
            return {error: true, statusCode: statusCode, message: gs.getMessage("Please re-initiate the transaction providing Hi username/password to proceed with Try") };
        if(statusCode == 200 || statusCode == 400) {
            responseObj = new global.JSON().decode(response);
            responseObj.header = this.getMessageFromKey("purchase_with_po_header");
            if(responseObj.error) {
                responseObj.message = this.getMessageFromKey("purchase_with_po_error");
                responseObj.error = true;
            } else {
                responseObj.message = this.getMessageFromKey("purchase_with_po_success");
            }
        } else {
            responseObj.error = true;
            responseObj.message = this.getMessageFromKey("purchase_with_po_error");
        }
        responseObj.statusCode = statusCode;
        return responseObj;
    },

    uploadAttachment: function(params) {
        var responseJSON ={};
        var parentTracker = GlideExecutionTracker.getLastRunning();
        var tracker = parentTracker.createChildIfAbsent("uploading Attachment");
        tracker.run();
        var attachments = [];
        attachments.push(params.attachmentIds);
        var uploader = new ScopedAppRepoRequest("upload_document", {"use_cookies": "true"});
        try {
            var response = uploader.uploadAttachments(attachments, tracker);
        } catch(e) {
            tracker.fail(e.getMessage());
            responseJSON.error = true;
            responseJSON.message = this.getMessageFromKey("default_message");
            responseJSON.statusCode = statusCode;
            return responseJSON;
        }
        responseJSON = new global.JSON().decode(response);
        responseJSON.header = this.getMessageFromKey("purchase_with_po_header");
        if(uploader.getErrorMessage() || responseJSON.error) {
            tracker.fail(this.getMessageFromKey("default_message"));
            responseJSON.error = true;
            responseJSON.message = this.getMessageFromKey("default_message");
        }
        tracker.success("uploaded successfully");
        var statusCode = uploader.getStatusCode();
        responseJSON.statusCode = statusCode;
        this.deleteLocalAttachments(attachments);
        return responseJSON;
	},

    deleteLocalAttachments: function(attachmentIds) {
        attachmentIds.forEach(function(attachmentSysId) {
            new GlideSysAttachment().deleteAttachment(attachmentSysId);
        });
    },

    type: 'StoreTransaction'
};

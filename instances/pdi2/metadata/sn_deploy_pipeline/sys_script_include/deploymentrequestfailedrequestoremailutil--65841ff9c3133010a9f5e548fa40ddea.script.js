var DeploymentRequestFailedRequestorEmailUtil = Class.create();
DeploymentRequestFailedRequestorEmailUtil.prototype = {
    initialize: function() {},

    getSubject: function(deploymentRequestRecord) {
        return gs.getMessage("Something went wrong during deployment");
    },

    getPublishFailedEmailBodyForRequestor: function(deploymentRequestRecord) {
        var firstName = deploymentRequestRecord.getDisplayValue("requestor_first_name");
        var lastName = deploymentRequestRecord.getDisplayValue("requestor_last_name");
        var requestorName = (firstName + " " + lastName).trim();
        var appName = deploymentRequestRecord.getDisplayValue("app_name");
        var appDevUrl = deploymentRequestRecord.getValue("app_development_url");
        var adminEmail = sn_app_eng_notify.AppEngineAdminGroup.getEmail();

        var appEngineEmailScript = new sn_app_eng_notify.AppEngineEmailScript();

        // heading
        var heading = gs.getMessage("Something went wrong during deployment");
        appEngineEmailScript.addHeading(heading);

        // greeting
        var greeting = gs.getMessage("Hi {0},", requestorName);
        appEngineEmailScript.addText(greeting, false);

        // message
        var message = gs.getMessage("Something went wrong with {0}.", appName);
        appEngineEmailScript.addText(message, false);

        if (adminEmail) {
            message = gs.getMessage("Reach out to your admin, {0} to resolve any issues. Once resolved, you can try submitting your app again.", adminEmail);
        } else {
            message = gs.getMessage("Reach out to your admin to resolve any issues. Once resolved, you can try submitting your app again.");
        }

        appEngineEmailScript.addText(message, true);

        if (appDevUrl) {
            var buttonText = gs.getMessage("Go to app");

            appEngineEmailScript.addButton(buttonText, appDevUrl);
        }

        return appEngineEmailScript.getBody();
    },


    type: 'DeploymentRequestFailedRequestorEmailUtil'
};

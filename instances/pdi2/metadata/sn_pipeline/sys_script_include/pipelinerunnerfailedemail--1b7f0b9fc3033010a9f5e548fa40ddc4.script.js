function getGreeting(recipientGroups) {
    var groupIdList = recipientGroups.split(',');
    var groupName;

    if (groupIdList.length === 1) {
        var groupId = groupIdList[0];
        var grGroup = new GlideRecord('sys_user_group');

        grGroup.get(groupIdList[0]);

        groupName = grGroup.getValue('name');
    }

    return gs.getMessage("Hi {0},", groupName);
}

function getHeading() {
    return gs.getMessage("Unable to complete pipeline execution");
}

function getPipeline(pipelineInstance) {
    var pipelineUtils = new PipelineUtils();

    var pipelineTypeName = pipelineInstance.pipeline_type.getRefRecord().getValue('name');
    var sourceInstanceId = pipelineInstance.getValue('source_instance_id');

    return pipelineUtils.getPipelineforInstanceIdOfType(sourceInstanceId, pipelineTypeName);
}

function getPipelineExecutionContextUrl(pipelineInstance) {
    var pipelineUtils = new PipelineUtils();

    var pipelineExecutionContextId = pipelineInstance.pipeline_context;

    var pipelineInstanceInstanceUrl = pipelineUtils.removeTrailingSlash(gs.getProperty("glide.servlet.uri"));
    var pipelineExecutionContextPath = '/$flow-designer.do#/operations/context/';

    return pipelineExecutionContextId && pipelineInstanceInstanceUrl + pipelineExecutionContextPath + pipelineExecutionContextId;
}

function getReviewButtonText() {
    return gs.getMessage("Review pipeline execution");
}

var PipelineRunnerFailedEmail = Class.create();
PipelineRunnerFailedEmail.prototype = {
    initialize: function() {},

    getSubject: function() {
        return gs.getMessage("Something might be wrong with a pipeline");
    },

    getFailedValidationEmailBody: function(recipientGroups, pipelineInstance) {
        var emailBody = new sn_app_eng_notify.AppEngineEmailScript();

        // heading
        var heading = getHeading();
        emailBody.addHeading(heading);

        // greeting
        var greeting = getGreeting(recipientGroups);
        emailBody.addText(greeting, false);

        // message
        var message = gs.getMessage("We were unable to validate and execute a pipeline connection. Review this execution and try again.");

        emailBody.addText(message, false);

        // review button
        var pipelineExecutionContextUrl = getPipelineExecutionContextUrl(pipelineInstance);

        if (pipelineExecutionContextUrl) {
            emailBody.addButton(getReviewButtonText(), pipelineExecutionContextUrl);
        }

        return emailBody.getBody();
    },

    getFailedGenericEmailBody: function(recipientGroups, pipelineInstance) {
        var emailBody = new sn_app_eng_notify.AppEngineEmailScript();

        // heading
        var heading = getHeading();
        emailBody.addHeading(heading);

        // greeting
        var greeting = getGreeting(recipientGroups);
        emailBody.addText(greeting, false);

        // message
        var pipeline = getPipeline(pipelineInstance);
        var pipelineName = pipeline && pipeline.getValue('name');
        var message = pipeline ?
            gs.getMessage("Something might be wrong with {0}. Review this execution and try again.", pipeline.getValue('name')) : gs.getMessage("Something might be wrong with pipelines. Review this execution and try again.");

        emailBody.addText(message, false);

        // review button
        var pipelineExecutionContextUrl = getPipelineExecutionContextUrl(pipelineInstance);

        if (pipelineExecutionContextUrl) {
            emailBody.addButton(getReviewButtonText(), pipelineExecutionContextUrl);
        }

        return emailBody.getBody();
    },

    type: 'PipelineRunnerFailedEmail'
};

var EmailClientGenAIService = Class.create();
EmailClientGenAIService.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
    initialize: function(){
      global.AbstractAjaxProcessor.prototype.initialize.apply(this, arguments);
	   // default value for one extend capability id for email response
      this.EMAIL_RESPONSE_CAPABILITY_ID =  gs.getProperty('glide.email.ai.capability_id', 'f61f9386fdd26110f8776a4ccac98425');
    },

    isConfiguredOnNowAssist: function(filterParams) {
        var skillConfiguration =  new sn_nowassist_admin.NowAssistSkillConfig().getSkillConfigurationWithBaseTableFallback(this.EMAIL_RESPONSE_CAPABILITY_ID, filterParams);
        if(skillConfiguration != undefined )
          return true;
        return false;
    },

    generateResponseForReply: function() {
        //raising an usage event when user clicked on "Compose With Now Assist"
        this.recordEvent("reply_with_ai_count", {
            "count": 1
        });

        var processStartTime = new GlideDateTime();
        var target_table = this.getParameter("sysparm_target_table");
        var target_sys_id = this.getParameter("sysparm_target_Id");
        var body = this.getParameter("sysparm_body");
        var subject = this.getParameter("sysparm_subject");
        var replyId = this.getParameter("sysparm_replyId");
        var replyType = this.getParameter("sysparm_replyType");
        var attachments = this.getParameter("sysparm_attachments");
      
        var request = {
            executionRequests: [{
                payload: {
                    "table": target_table,
                    "record_sys_id": target_sys_id,
                    "source": "UI16",
                    "additional_info": {
                        "body": body,
                        "subject": subject,
                        "replyId": replyId,
                        "replyType": replyType,
                        "attachments": attachments
                    },
                    "capability_id": this.EMAIL_RESPONSE_CAPABILITY_ID,
                    "isNap": false
                },
                capabilityId: this.EMAIL_RESPONSE_CAPABILITY_ID
            }],
        };

        // Calling the one extend API to execute the request to generate the email response
        var output = sn_one_extend.OneExtendUtil.execute(request);

        var processEndTime = new GlideDateTime();
        var timeTaken = GlideDateTime.subtract(processStartTime, processEndTime).getNumericValue();

        //Record time taken to generate the response
        this.recordEvent("ai_email_response_time_metric", {
            "time": timeTaken
        });

        var answer = this.newItem("answer");
        var status;
        var message;

        // Checking the for the error scenarios and setting the error string , if not sending the generated email response

        if (output.status === 'error' || output.capabilities[this.EMAIL_RESPONSE_CAPABILITY_ID].status === 'error') {

            //Record failure scenario
            this.recordEvent("reply_with_ai_failure_count", {
                "count": 1
            });

            message = gs.getMessage("Unable to generate the response using Now Assist. Please try again after sometime");
            status = "error";
        } else {

            //Record Success scenario
            this.recordEvent("reply_with_ai_success_count", {
                "count": 1
            });

            message = output.capabilities[this.EMAIL_RESPONSE_CAPABILITY_ID].response;
            status = "success";
        }

        answer.setAttribute("message", message);
        answer.setAttribute("status", status);

        return;
    },

    recordEvent: function(instrumentationEvent, data) {
        try {
            var sampleMap = new GCFSampleMap();
            for (var key in data)
                sampleMap.put(key, data[key]);

            GCFCollector.recordUsageEvent("notifications", "ai_email_compose_ui16", instrumentationEvent, sampleMap);
        } catch (e) {
            gs.debug("EmailClientGenAIService: Exception encountered while capturing analytics. Exception Info: " + JSON.stringify(e));
        }
    },

    type: 'EmailClientGenAIService',
});

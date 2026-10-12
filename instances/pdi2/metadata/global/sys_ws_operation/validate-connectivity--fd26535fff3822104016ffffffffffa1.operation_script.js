 (function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

     var stateRanks = {
         "-1": 1, // Error
         None: 2,
         "2": 3, // Queued
         "1": 4, // Running
         "0": 5 // Ready
     };

     var config = {
         sender: {
             activeProperty: 'glide.email.smtp.active',
             jobId: 'd8e37da5c0a80064009ff6d19882218a',
             inactiveMessage: 'Email sending inactive. Turn on the email sending operation from Email Properties.',
             noJobMessage: 'No Sender Jobs are defined. Configure Sender Jobs from Schedule.',
             errorMessage: 'Sender Jobs are in error or blocked state. Verify the configuration from Sender Jobs.',
             linkText: 'SMTP Sender Job',
             stateKey: 'senderConnectivityResult'
         },
         reader: {
             activeProperty: 'glide.email.read.active',
             jobId: '52fb24f70a0005fc008b6be3853ca58c',
             inactiveMessage: 'Email receiving inactive. Turn on the email receiving operation from Email Properties.',
             noJobMessage: 'No Reader Jobs are defined. Configure Reader Jobs from Schedule.',
             errorMessage: 'Reader Jobs are in error or blocked state. Verify the configuration from Reader Jobs.',
             linkText: 'Email Reader Job',
             stateKey: 'readerConnectivityResult'
         }
     };

     function validateConnectivity(typeConfig) {
         var result = {};

         var isActive = GlideProperties.getBoolean(typeConfig.activeProperty, false);
         if (!isActive) {
             result = {
                 isError: true,
                 message: typeConfig.inactiveMessage,
                 link: '/email_properties.do',
                 linkText: 'Email Properties'
             };
         } else {
             var jobInfo = getJobInfo(typeConfig.jobId);
             var jobState = getJobState(jobInfo);

             if (jobState === "No job defined") {
                 result = {
                     isError: true,
                     message: typeConfig.noJobMessage,
                     link: `/sys_trigger_list.do?sysparm_query=job_id%3D${typeConfig.jobId}`,
                     linkText: typeConfig.linkText
                 };
             } else if (jobState === "-1" || jobState === "None") {
                 result = {
                     isError: true,
                     message: typeConfig.errorMessage,
                     link: `/sys_trigger_list.do?sysparm_query=job_id%3D${typeConfig.jobId}`,
                     linkText: typeConfig.linkText
                 };
             } else {
                 result = {
                     isError: false
                 };
             }
         }

         return result;
     }

     function getJobInfo(jobId) {
         var jobs = [];
         var trigger = new GlideRecord("sys_trigger");
         trigger.addQuery("job_id", jobId);
         trigger.query();
         while (trigger.next()) {
             var stateDisplay = trigger.getDisplayValue("state");
             jobs.push({
                 lastRun: new GlideDateTime(trigger.getValue('sys_updated_on')),
                 duration: trigger.getValue('processing_duration'),
                 state: (stateDisplay) ? trigger.getValue('state') : 'None',
                 id: trigger.getUniqueValue()
             });
         }
         return jobs;
     }

     function getJobState(states) {
         if (!states || states.length === 0) {
             return "No job defined";
         }

         var lowestRank = stateRanks[states[0].state];

         for (var i = 1; i < states.length; i++) {
             var state = states[i].state;
             var rank = stateRanks[state];
             if (rank < lowestRank) {
                 lowestRank = rank;
             }
         }

         return getStateString(lowestRank);
     }

     function getStateString(stateRank) {
         for (var key in stateRanks) {
             if (stateRanks[key] === stateRank) {
                 return key;
             }
         }
     }

     var result = {
         senderConnectivityResult: validateConnectivity(config.sender),
         readerConnectivityResult: validateConnectivity(config.reader)
     };

     response.setBody(result);

 })(request, response);

var ProminMLNotificationUtilSNC = Class.create();
ProminMLNotificationUtilSNC.prototype = {
    initialize: function(mlSolution) {
        this.grMLsolution = mlSolution;
        this.capability = this.grMLsolution.getValue("capability");
		this.actionStatus = '';
        this.allowedCapabilities = [{
                "capability": "promin_trainer",
                "displayName": "Full Mine"
            },
            {
                "capability": "promin_interactive_trainer",
                "displayName": "On Demand Mining"
            },
            {
                "capability": "clustering_trainer",
                "displayName": "Clustering"
            },
            {
                "capability": "workflow_trainer",
                "displayName": "Root cause analysis"
            },
        ];

    },
    /*
    isMLsolutionCreatedForPO - checks if ml_solution is associated with process mining actions (full mine, on the fly, clustering, AD)
    */
    isMLsolutionCreatedForPO: function() {
        if (this._getMLNotificationActionName()) {
            return true;
        }
        return false;
    },
    /*
    getEmailSubjectForMLNotification - 
	checks if ml_solution is associated with process mining actions (full mine, on the fly, clustering, AD)
    */
    getEmailSubjectForMLNotification: function(event) {
        var subject = 'Process Mining: ';
        subject += this._getMLNotificationActionName() +" ";
        if (event.name == 'ml_solution.training.successful') {
			this.actionStatus =  'completed successfully';
        } else if (event.name == 'ml_solution.training.failure') {
			this.actionStatus = 'failed';
        } else {
            this.actionStatus += 'completed';
        }
        return subject + this.actionStatus;
    },
    getEmailContentForMLNotification: function(template) {
        try {
            var prominUtil = new global.ProminUtilsAJAX(),
				grVersion = new GlideRecord("promin_model_def_version"),
                responseBody = '', workBenchURL, projectURL = '', actionName = '', createdByUser = '',
				instanceURL = gs.getProperty('glide.servlet.uri');

            if (this.capability == 'promin_trainer' || this.capability == 'promin_interactive_trainer') {
                var solutionProperties = JSON.parse(this.grMLsolution.solution_properties);
                if (!solutionProperties.versionId || !grVersion.get(solutionProperties.versionId)) {
                    throw "Cannot find process mining version from solution properties.";
                }
				if(!solutionProperties.userName){
					throw "Cannot find created by User";
				}
				createdByUser = this._getUserDisplayName(solutionProperties.userName);
				
			}
			else if (this.capability == 'clustering_trainer' || this.capability == 'workflow_trainer') {
				var grScheduledTask = new GlideRecord("promin_scheduled_task");
				grScheduledTask.addQuery("ml_solution_id", this.grMLsolution.getUniqueValue());
				grScheduledTask.query();
				if(!grScheduledTask.next()){
					throw "Cannot find scheduled task for ML solution";
				}
				if(!grVersion.get(grScheduledTask.getValue("model_def_version"))){
					throw "Cannot find process mining version record from scheduled task";
				}
				createdByUser = this._getUserDisplayName(grScheduledTask.sys_created_by);
			}
			if(!grVersion.isValidRecord()) {
				throw "Cannot find model definition version";
			}
			actionName = this._getMLNotificationActionName();
			if(this.capability != 'promin_trainer')
				workBenchURL = instanceURL + prominUtil.getGotoWorkbenchURLforVersion(grVersion.getUniqueValue());

			projectURL = instanceURL + grVersion.project.getRefRecord().getLink(); 

			if(!actionName){
				throw "Cannot find action name for ML capability " + this.capability ;
			}
			if (!workBenchURL && this.capability != 'promin_trainer') {
				throw "Cannot retrive process mining workbench URL.";
			}
			responseBody += '<p>Model Name: <a href="'+ projectURL +'" target="_blank">' + grVersion.getValue("name") +'</a></p>';
			responseBody += '<p>Action Name: '+ actionName +'</p>';
			responseBody += '<p>Requested by: '+ createdByUser +'</p>';
			responseBody += '<p>Status: '+ this.actionStatus.charAt(0).toUpperCase() + this.actionStatus.slice(1); +'</p>';
			if(this.capability != 'promin_trainer'){
                responseBody += '<p><a href="'+ workBenchURL +'" target="_blank">Click here</a> to view process model in a workbench</p>';
            }
        } catch (e) {
            responseBody = '<p style="color:#dc3545">There was an error in preparing email message. Please contact your system administrator. <br/>Error: ' + e + ' </p>';
            gs.error(e);
        }
        return responseBody;
    },
    _getMLNotificationActionName: function() {
        for (var counter = 0; counter < this.allowedCapabilities.length; counter++) {
            if (this.capability == this.allowedCapabilities[counter].capability) {
                return this.allowedCapabilities[counter].displayName;
            }
        }
        return;
    },
	_getUserDisplayName: function(userId){
		var user = gs.getUser().getUserByID(userId);
		if(!user){
			return userId;
		}
		return user.getDisplayName();
	},
    type: 'ProminMLNotificationUtilSNC'
};

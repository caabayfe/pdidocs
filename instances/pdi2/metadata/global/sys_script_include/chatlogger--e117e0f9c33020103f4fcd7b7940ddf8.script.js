var ChatLogger = Class.create();
ChatLogger.prototype = {
    initialize: function(workItemSysId, interactionSysId) {
		this.workItemSysId = workItemSysId;
		this.interactionSysId = interactionSysId;
    },
	
	log : function(message) {
		var log = message;
		if(this.interactionSysId != ""){
			log = 'Interaction ' + this.interactionSysId + ' : ' + log; 
		}
		if(this.workItemSysId != ""){
			log = 'Work Item ' + this.workItemSysId + ' : ' + log;
		}
		gs.print(log);
	},
	
	setInteractionSysId : function(interactionSysId){
		this.interactionSysId = interactionSysId;
	},
	
	setWorkItemSysId : function(workItemSysId){
		this.workItemSysId = workItemSysId;
	},

    type: 'ChatLogger'
};

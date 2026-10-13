var Runner = Packages.com.glide.util.ProcessRunner;
var StringUtil = Packages.com.glide.util.StringUtil;

var EventManagementUtil = Class.create();
EventManagementUtil.prototype = {
    initialize: function() {
    },
	
	runCommand:function(commandToRun){
		var status = '';
		var shellRunner = new Runner(); 
		var output = '';
		var retVal = {};
		try{
			shellRunner.setCloseOutputToStart(true);
			retVal['commandStatus']  = "" +  shellRunner.runCommand(commandToRun);
			output = shellRunner.getOutput();
			var error = shellRunner.getError();
			if (StringUtil.notNil(error))
					retVal['error']  = "" + error;
			retVal['output']  = "" + output;
			retVal['status']  = true;
		}
		catch(err){
			ms.log("ERROR: " + err.message);
			retVal['error'] = err.message;
			retVal['status']  = false;
		}	
		return retVal;
	},

    type: 'EventManagementUtil'
};

EventManagementUtil.get = function(){
	return new EventManagementUtil();
};

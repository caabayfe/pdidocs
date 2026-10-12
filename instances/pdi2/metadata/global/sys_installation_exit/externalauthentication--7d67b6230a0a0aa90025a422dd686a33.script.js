gs.include('PrototypeServer'); 
var ExternalAuthentication = Class.create(); 
ExternalAuthentication.prototype = { 
 	process : function() { 
		 return 'failed_authentication';
	 } 
};

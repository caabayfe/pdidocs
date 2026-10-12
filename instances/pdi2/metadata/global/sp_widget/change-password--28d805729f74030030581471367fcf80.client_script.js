function($scope, $window, $http, spUtil, $rootScope, $timeout, spAriaUtil) {
	var c = this;

	c.action = function(){
		c.resultMessage = '';
		$.ajax({
			url : 'xmlhttp.do',
			method: 'POST',
			data : {
				sysparm_processor : 'PwdAjaxWFRequestProcessor',
				sysparm_name : 'validatePasswordForChange',
				sysparam_process_id : c.data.procId,
				sysparam_new_password : c.new_password
			},
			headers : {
				'X-UserToken' : g_ck
			},
			success : setPassword,
			error: function(){ }
		});			
	};

	c.disableUpdate = function(){
		return !(c.current_password && c.new_password && c.confirm_password) || c.errorMessage();        
	};

	c.errorMessage = function(){
		if((c.current_password && c.new_password) && (c.current_password == c.new_password)){
			c.resultMessage = '';
			sendLiveMessage(c.data.reusedPasswordMsg);
			return c.data.reusedPasswordMsg;
		} else if((c.new_password && c.confirm_password) && (c.new_password != c.confirm_password)){
			c.resultMessage = '';
			sendLiveMessage(c.data.notMatchMsg);
			return c.data.notMatchMsg;
		} else {
			sendLiveMessage('');
			return '';
		}
	};
	
	var currentLiveMessage = '';
	function sendLiveMessage(newMessage) {
		if (newMessage != '' && newMessage != currentLiveMessage)
			spAriaUtil.sendLiveMessage(newMessage);
		currentLiveMessage = newMessage;
	}

	function setPassword(response) {
		var docElement = response.documentElement;
		var xml = docElement.outerHTML || new XMLSerializer().serializeToString(docElement);
		var $xmlDoc = $.parseXML(xml);
		$answerAtrribute = $($xmlDoc).find('xml').attr('answer');
		var result = JSON.parse($answerAtrribute);
		if (result.isPwdValid) {
			c.data.action = 'update';
			c.data.old_password = c.current_password;
			c.data.new_password = c.new_password;			
			c.server.update().then(function() {
				c.error = false;
				if(c.data.result == 'success'){
					c.resultMessage = c.data.successMsg;
					c.changeSuccess = true;
				}
				else {
					c.error = true;
					if (c.data.result == 'incorrect old password')
						c.resultMessage = c.data.wrongPasswordMsg;
					else if (c.data.result == 'weak password') 
						c.resultMessage = c.data.complexityMsg;
					else
						c.resultMessage = c.data.result;        
				}
			});
		}
		else {
			c.error = true;
			c.resultMessage = result.errorMessage;
		}		
		$scope.$apply();
	}
}

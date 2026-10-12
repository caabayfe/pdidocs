var sampleApps = angular.module('sn_sampleApps', []);
	sampleApps.controller('mainCtrl', function($scope){
		$scope.getGitRepos = function(){
			var github_servicenow_url = gel('repo_url').value;
			if(window.XDomainRequest){
				$scope.populateResponseForIE9(github_servicenow_url);
			}else{
				jQuery.get(github_servicenow_url, function(response){
					$scope.populateResponse(response);
				}).fail(function(error){
					$scope.error = true;
				}).always(function(){
					$scope.$apply();
				});
			}
		};
		$scope.populateResponseForIE9 = function(github_servicenow_url) {
			var xdr = new XDomainRequest();
			xdr.open("get", github_servicenow_url);
			xdr.onerror = function () { 
				$scope.error = true;
				$scope.$apply();
			};
			xdr.onload = function() {
				var responseString = xdr.responseText;
				var response = JSON.parse(responseString);
				$scope.populateResponse(response);
				$scope.$apply();
			};
			setTimeout(function () {
				xdr.send();
			}, 0);
		};
		$scope.populateResponse = function(response) {
			if($scope.verifyGHResponse(response)){
				var apps = [];
				var app_prefix = gel('prefix').value;
				for(var i=0; i < response.length; i++){
					var application = response[i];
					// only show apps with specific prefix
					if(application.name.indexOf(app_prefix) == 0)
						apps.push(application);
					
				}
				$scope.repos = apps;
			} else {
				$scope.error =true;
			}
		};
		$scope.verifyGHResponse = function(ghResponse) {
			if(ghResponse && ghResponse[0]){
				if(ghResponse[0].name && ghResponse[0].description){
					return true;
				}
			}
			return false;
		};
	});

document.addEventListener("DOMContentLoaded", function(){
	document.getElementById('top_of_page').focus();
});

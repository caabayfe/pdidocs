angular.module('sn.mergeTags', ['ng', 'ngSanitize', 'sn.common.controls', 'sn.common.util', 'sn.common.glide', 'sn.common.i18n']).controller('mergeTags', function($scope) {
	
	$scope.field = {};
	
	$scope.submitAction = function(type) {
		var glideDialogWindow = GlideDialogWindow.get();
		var func;
		if (type == 'ok')
		   func = glideDialogWindow.getPreference('onPromptComplete');
		else
		   func = glideDialogWindow.getPreference('onPromptCancel');

		if (typeof(func) == 'function') {
			try {
				var targetValue = $scope.field.value;
				if(!targetValue) {
					alert("Please enter a valid tag");
					return false;
				}

				func.call(glideDialogWindow, targetValue);
			} catch(e) {}
		}

		glideDialogWindow.destroy();
		return false;
	}
});

var dialogContainer = g_document.getElement('#merge_tags_input_v3 rendered_body');
angular.injector(['sn.mergeTags']).invoke(function($rootScope, $compile, $document) { $compile(dialogContainer)($rootScope); $rootScope.$digest(); });

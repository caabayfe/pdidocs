function(i18n) {
	return {
		restrict: 'E',
		replace: true,
		template:
			'<div class="col-xs-12 col-sm-12" style="padding: 10px 0 0">' +
				'<div class="col-xs-12 col-sm-6" ng-class="{add_info_no_padding: !hasPadding()}">' +
					'<span style="margin-right: 10px">' +
					'<button class="btn-link btn chevron-icon" ng-click="toggleAddInfo()" aria-expanded="{{showAddInfo}}" aria-label="{{::field.add_info_label + \' for \' + field.aria_label}}" data-toggle="tooltip" data-placement="top" data-original-title="{{chevronAction}}">' +
							'<span class="glyphicon glyphicon-menu-down" ng-if="showAddInfo"></span>' +
							'<span class="glyphicon glyphicon-menu-right" ng-if="!showAddInfo"></span>' +
						'</button>' +
					'</span>' +
						'<span  class="question-label h5" style="display: inline-block">' +
							'{{::field.add_info_label}}' +
						'</span>' +
					'<textarea class="form-control collapse" ng-class="{in: showAddInfo}" rows="4" name="{{::field.add_info_name}}" class="form-control" aria-label="{{::field.add_info_label + \' for \' + field.aria_label}}" ng-model="field.add_info" autocomplete="off">' +
					'</textarea>' +
				'</div>' +
			'</div>',

		scope: {
			'field': '='
		},

		controller: function($scope) {
			$scope.showAddInfo = true;
			$scope.chevronAction = "Collapse";
			$scope.hasPadding = function() {
				return $scope.field.type == "choice" || $scope.field.type == "date" || $scope.field.type == "datetime";
			};
			$scope.toggleAddInfo = function() {
				$scope.showAddInfo = !$scope.showAddInfo;
				$scope.chevronAction = $scope.showAddInfo ? "Collapse" : "Expand";
			};
			if (!$scope.field.add_info)
				$scope.field.add_info = "";
		}
	};
}

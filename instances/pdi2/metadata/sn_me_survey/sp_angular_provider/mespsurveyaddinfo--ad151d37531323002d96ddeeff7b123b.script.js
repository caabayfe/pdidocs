function(i18n) {
	return {
		restrict: 'E',
		replace: true,
		template:
			'<div class="col-xs-12 col-sm-12" style="padding: 10px 0 0">' +
				'<div class="col-xs-12 col-sm-6" ng-class="{add_info_no_padding: !hasPadding()}">' +
					'<span style="margin-right: 10px">' +
						'<a href="javascript:void(0)" role="link">' +
							'<span class="glyphicon glyphicon-menu-down" ng-if="showAddInfo" ng-click="toggleAddInfo()" aria-label="Hide Additional Information" role="button"></span>' +
							'<span class="glyphicon glyphicon-menu-right" ng-if="!showAddInfo" ng-click="toggleAddInfo()" aria-label="Show Additional Information" role="button"></span>' +
						'</a>' +
					'</span>' +
					'<span>' +
						'<h5 id="{{::field.add_info_name}}_label" class="question-label" style="display: inline-block">' +
							'{{::field.add_info_label}}' +
						'</h5>' +
					'</span>' +
					'<textarea class="form-control collapse" ng-class="{in: showAddInfo}" rows="4" name="{{::field.add_info_name}}" class="form-control" aria-labelledby="{{::field.add_info_name}}_label" ng-model="field.add_info" autocomplete="off">' +
					'</textarea>' +
				'</div>' +
			'</div>',

		scope: {
			'field': '='
		},

		controller: function($scope) {
			$scope.showAddInfo = true;
			$scope.hasPadding = function() {
				return $scope.field.type == "choice" || $scope.field.type == "date" || $scope.field.type == "datetime";
			};
			$scope.toggleAddInfo = function() {
				$scope.showAddInfo = !$scope.showAddInfo;
			};
			if (!$scope.field.add_info)
				$scope.field.add_info = "";
		}
	};
}

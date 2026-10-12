function spCategoryListItem() {
	return {
		restrict: 'E',
		scope: {
			category: "=",
			omitBadges: "=",
			level: "=",
			page: "=?"
		},
		replace: true,
		template:   '<div role="listitem" ng-class="{\'indent-category\': indentCategory}">' +
						'<a class="list-group-item text-overflow-ellipsis" title="{{::category.title}}" aria-label="{{::category.title}} ${Number of items in this category} {{::category.count}}" ng-class="{selected: category.selected}" href="?id={{page}}&sys_id={{::category.sys_id}}">' +
							'<span ng-if="!omitBadges" class="label label-as-badge label-primary">{{::category.count}}</span>' +
		'<i tabindex="0" aria-label="{{category.showSubcategories ? \'${Collapse subcategories}\' : \'${Expand subcategories}\'}}" class="fa fa-fw text-muted" ng-class="{\'fa-folder\': !category.showSubcategories, \'fa-folder-open\': category.showSubcategories}" ng-if="category.isParentCategory" ng-click="toggleShowSubcategories($event)"></i>{{::category.title}}' +
		'</a>' +
						'<sp-category-list-item ng-if="category.showSubcategories" ng-repeat="subcategory in category.subcategories" category="subcategory" omit-badges="omitBadges" level="level + 1"></sp-category-list-item>' +
					'</div>',
		controller: function($scope) {
			// We have to eventually stop indenting the categories.
			// So, we're choosing to indent up to 3 times. Otherwise,
			// there won't be enough room to show the category name.
			$scope.indentCategory = ($scope.level > 0 && $scope.level < 4);
			$scope.page = $scope.page || 'sc_category';
			$scope.toggleShowSubcategories = function(e) {
				e.originalEvent.stopPropagation();
				e.originalEvent.preventDefault();
				$scope.$emit("$sp.sc_category.retrieve_subcategories", $scope.category);
				$scope.category.showSubcategories = !$scope.category.showSubcategories;
			}
		}
	}
}

function($rootScope, spUtil, $uibModal, $http) {
	'use strict';

	return {
		restrict: 'E',
		replace: true,
		template:   '<span class="ref-picker-container">' +
						'<div class="add-on" ng-if="field.value != \'\'">' +
							'<button type="button" aria-label="${Preview this record {{field.displayValue}}}" class="btn btn-default bg-white lookup" ng-click="openReference(field)" data-toggle="tooltip" data-placement="top" data-original-title="${Preview this record {{field.displayValue}}}"><span class="fa fa-info-circle"></span></button>' +
						'</div>' +
						'<div ng-class="{\'has-error\': !field.isMandatoryFilled}" class="reference">' +
							'<sp-survey-reference-element c="c" is-mobile="isMobile" field="field" sn-select-width="100%" ref-table="field.refTable" ref-id="field.sys_id" glide-form="getGlideForm()" record-values="getEncodedRecordValues()" sn-disabled="field.isReadonly()"/>' +
						'</div>' +
					'</span>',

		controller: function($scope){
			$scope.openReference = function(field) {
				var data = {table: field.ed.reference, sys_id: field.value};
				if (angular.isDefined(field.reference_key))
					data[field.reference_key] = field.value;
				else
					data.sys_id = field.value;

				showForm(data);
			};


			function showForm(data) {
				var url = spUtil.getWidgetURL("widget-form");

				var req = {
					method : 'POST',
					url : url,
					headers : {
						'Accept' : 'application/json',
						'x-portal' : $rootScope.portal_id
					},
					data : data
				}
				$http(req).then(qs, qe);

				function qs(response) {
					var r = response.data.result;
					showModal(r);
				}
				// error
				function qe(error) {
					console.error("Error " + error.status + " " + error.statusText);
				}
			}


			function showModal(form) {
				var opts = {
					size : 'lg',
					templateUrl : 'sp_form_modal',
					controller : ModalInstanceCtrl,
					resolve : {}
				};

				opts.resolve.item = function() {
					return angular.copy({
						form : form
					});
				};

				var modalInstance = $uibModal.open(opts);
				modalInstance.result.then(function() {}, function() {});

				$scope.$on("$destroy", function() {
					modalInstance.close();
				});

				var unregister = $scope.$on('sp.form.record.updated', function(evt, fields) {
					unregister();
					unregister = null;
					modalInstance.close();

					// Do something here to refresh this record...

					if (evt.stopPropagation)
						evt.stopPropagation();
					evt.preventDefault();
				});
			}

			function ModalInstanceCtrl($scope, $uibModalInstance, item) {
				$scope.item = item;

				$scope.ok = function() {
					$uibModalInstance.close();
				};

				$scope.cancel = function() {
					$uibModalInstance.dismiss('cancel');
				};
			}



		}
	};
}

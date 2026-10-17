function(cabrillo, $rootScope, $timeout) {
	'use strict';

	return {
		restrict: 'E',
		scope: {
			'field': '=',
			'attachmentHandler': '='
		},
		template: function() {
			var inputTemplate;
			if (cabrillo.isNative()) {
				inputTemplate = '<a href="#" elem-id="{{::field.sys_id}}_attachment_add" ng-click="showAttachOptions()" class="panel-button sp-attachment-add"><span class="glyphicon glyphicon-camera" aria-label="Add a new Attachment"></span></a>';
			} else {
				inputTemplate = '<label style="cursor:pointer; font-size:22px; margin-top:-6px; position:relative; bottom:-6px;">' +
									'<input type="file" style="display: none" multiple="true" ng-file-select="attachmentHandler.onFileSelect($files)" class="sp-attachments-input"/>' +
									'<a href="javascript:void(0)" elem-id="{{::field.sys_id}}_attachment_add" aria-label="{{::field.label}} Upload Link" style="color: inherit" ng-click="attachmentHandler.openSelector($event)" class="sp-attachment-add"><span class="glyphicon glyphicon-paperclip"></span></a>' +
								'</label>';
			}
			return [
				'<span class="file-upload-input">',
					inputTemplate,
				'</span>'
			].join('');
		},
		controller: function($element, $scope) {
			$scope.attachmentClassNames = 'btn-default attachment-btn btn-primary icon-paperclip icon-camera list-group-btn';

			$scope.showAttachOptions = function() {
				var handler = $scope.attachmentHandler;

				cabrillo.attachments.addFile(
					handler.tableName,
					handler.tableId,
					null,
					{maxWidth: 1000, maxHeight: 1000}
				).then(function(data) {
					handler.getAttachmentList();
					$rootScope.$broadcast("added_attachment");
				}, function() {
					console.log('Failed to attach new file');
				});
			};

			$scope.$on('attachment_select_files', function(e) {
				$timeout(function() {
					$($element).find('.sp-attachments-input').click();
				});
			});
		}
	};
}

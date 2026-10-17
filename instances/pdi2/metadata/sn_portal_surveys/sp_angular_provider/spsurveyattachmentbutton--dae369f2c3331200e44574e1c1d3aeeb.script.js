function(cabrillo, $rootScope, $timeout, i18n, spAriaUtil) {
	'use strict';
	return {
		restrict: 'E',
		scope: {
			'field': '=',
			'attachmentHandler': '=',
			'c': '='
		},
		template: function() {
			var inputTemplate;
			if (cabrillo.isNative()) {
				inputTemplate = '<a href="#" elem-id="{{::field.sys_id}}_attachment_add" ng-click="showAttachOptions()" class="panel-button sp-attachment-add"><span class="glyphicon glyphicon-camera"></span></a>';
			} else {
				inputTemplate = '<label style="cursor:pointer; font-size:22px; margin-top:-6px; position:relative; bottom:-6px;">' +
									'<input type="file" multiple="true" ng-file-select="attachmentHandler.onFileSelect($files)" class="sp-attachments-input sr-only" tabindex="-1"/>' +
									'<button aria-describedby="details_{{field.sys_id}} notAnswered{{field.sys_id}}" ng-class="{\'has-error\': !field.isMandatoryFilled, \'autofocus-error\':!field.isMandatoryFilled}" elem-id="{{::field.sys_id}}_attachment_add" style="color: inherit" ng-click="attachmentHandler.openSelector($event)" class="sp-attachment-add autofocus-class wrapper-xs btn-link btn chevron-icon" aria-required="{{::field.mandatory}}" data-toggle="tooltip" data-placement="top" data-original-title="${Choose attachments}" aria-label="{{c.getAriaLabel(field)}}">' +
										'<span class="glyphicon glyphicon-paperclip"></span>' +
									'</button>' +
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

			function focusOnAttachmentIcon(questionId) {
				var paperclip = $($element).find("[elem-id='"+ questionId +"_attachment_add']")[0];
				if (paperclip) {
					paperclip.focus();
				}
			}

			$scope.$on('survey.attachment.upload.success', function(evt, args) {
				
				// Update isMandatoryFilled
			   $scope.field.isMandatoryFilled = $scope.c.isMandatoryFilled($scope.field);


				// timeout is required for screen reader to pick up the message once file upload prompt is dismissed
				$timeout(function() {
				    spAriaUtil.sendLiveMessage(i18n.getMessage('Attachment uploaded successfully'));
				}, 2000);
			});

			$scope.$on('survey.attachment.delete.success', function(evt, args) {

				// Update isMandatoryFilled
			   $scope.field.isMandatoryFilled = $scope.c.isMandatoryFilled($scope.field);

				// timeout is required for screen reader to pick up the message once deletion confirmation modal is dismissed
				$timeout(function() {
				    spAriaUtil.sendLiveMessage(i18n.getMessage('Attachment deleted successfully'));
				}, 2000);
			});

			$scope.$on('survey.attachment.list.update', function(evt, args) {
				// Focus should move back to attachment icon
				var targetQuestionId = args.questionSysId;
				if (targetQuestionId === $scope.field.sys_id) {// Make sure it's the same question
					focusOnAttachmentIcon(targetQuestionId);
				}
			});
		}
	};
}

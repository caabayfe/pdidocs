function(getTemplateUrl) {
	'use strict';
	return {
		restrict: 'E',
		replace: true,
		template: '<div ng-repeat="attachment in field.attachments track by $index">' +
								'<div class="sp-attachment-block-single-line file-attachment row" elem-id="att-{{attachment.sys_id}}">' +
							    '<a class="col-md-1 col-sm-1 col-xs-2 view-attachment m-b-none text-center" aria-label="${Download {{attachment.file_name}} ({{attachment.size}})}" style="border: none;"' +
									'data-toggle="tooltip" data-placement="top" data-original-title="${Download}" tabindex="-1"' +
							        'ng-click="field.attachmentHandler.viewAttachment($event, attachment)" href="javascript:void(0)">' +
							        '<img alt="{{attachment.file_name}}" ng-if="attachment.thumbSrc" class="attachment-thumbnail img-responsive" ng-src="{{attachment.thumbSrc}}"/>' +
							        '<span ng-if="!attachment.thumbSrc">' +
							            '<span class="glyphicon glyphicon-file text-2x"/>' +
							        '</span>' +
							    '</a>' +
							    '<div class="col-md-5 col-sm-6 col-xs-8 file-name v-middle" style="white-space:nowrap;text-overflow:ellipsis;">' +
							        '<a class="get-attachment" ng-click="field.attachmentHandler.downloadAttachment(attachment)" href="javascript:void(0)" aria-label="${Download {{attachment.file_name}} ({{attachment.size}})}"' +
										'data-toggle="tooltip" data-placement="top" data-original-title="${Download}">' +
							            '{{attachment.file_name}} ({{attachment.size}})' +
							        '</a>' +
							        '<input ng-keydown="field.attachmentHandler.onKeyDown($event, attachment)" ng-blur="field.attachmentHandler.updateAttachment($event, attachment)" style="display: none;"/>' +
							        '<div><time><sn-time-ago timestamp="attachment.sys_updated_on" /></time></div>' +
							    '</div>' +
                                '<div ng-if="!isMobile" class="col-md-6 col-sm-5 col-xs-2 tools v-middle">' +
                                    '<span ng-if="attachment.canWrite && false" class="glyphicon glyphicon-pencil sp-attachment-edit wrapper-xs" ng-click="field.attachmentHandler.editAttachment($event, attachment)" title="Edit file name"></span>' +
                                    '<span ng-if="attachment.canDelete" class="glyphicon glyphicon-remove sp-attachment-delete wrapper-xs" ng-click="field.attachmentHandler.deleteAttachment(attachment)" tabindex="0" aria-label="${Delete {{attachment.file_name}}}" data-toggle="tooltip" data-placement="top" data-original-title="${Delete}"/>' +
                                '</div>' +
                                '<div ng-if="isMobile" class="col-md-6 col-sm-5 col-xs-2 tools v-middle text-right">' +
                                    '<span ng-if="attachment.canDelete" class="glyphicon glyphicon-remove sp-attachment-delete wrapper-xs" ng-click="field.attachmentHandler.deleteAttachment(attachment)" tabindex="0" aria-label="${Delete {{attachment.file_name}}}" data-toggle="tooltip" data-placement="top" data-original-title="${Delete}"/>' +
                                '</div>' +
								'</div>' +
							'</div>',
		link: function(scope, elem, attrs, $parse) {
			scope.icons = {
				preview: attrs.previewIcon,
				edit: attrs.editIcon,
 				delete: attrs.deleteIcon,
				ok: attrs.okIcon,
				cancel: attrs.cancelIcon
			};
			scope.listClass = "list-group";
			var inline = scope.$eval(attrs.inline);
			if (inline)
				scope.listClass = "list-inline";
		},
		controller: function($element, $scope) {			
			// Monitor attachment list change
			var questionSysId = $scope.field.sys_id;
			$scope.$watch('field.attachments', function(newValue, oldValue, scope) {
				if (!oldValue) {
					// Ignore for the first load
					return;
				}
				// Move focus back to attachment icon
				$scope.$broadcast("survey.attachment.list.update", {questionSysId: questionSysId});
				if (newValue.length > oldValue.length) {
					// Send live message when files get uploaded
					$scope.$broadcast("survey.attachment.upload.success", {questionSysId: questionSysId});
				} else if (newValue.length < oldValue.length) {
					// Send live message when files get deleted
					$scope.$broadcast("survey.attachment.delete.success", {questionSysId: questionSysId});
				}
			}, true);
		}
	};
}

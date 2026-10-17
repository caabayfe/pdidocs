function(getTemplateUrl) {
	'use strict';

	return {
		restrict: 'E',
		replace: true,
		template: '<div ng-repeat="attachment in field.attachments track by $index">' +
								'<div class="sp-attachment-block-single-line file-attachment row" elem-id="att-{{attachment.sys_id}}">' +
							    '<a class="col-md-1 col-sm-1 col-xs-2 view-attachment m-b-none text-center" style="border: none;" ' +
							        'ng-click="field.attachmentHandler.viewAttachment($event, attachment)" href="javascript:void(0)" title="View" >' +
							        '<img alt="{{attachment.file_name}}" ng-if="attachment.thumbSrc" class="attachment-thumbnail img-responsive" ng-src="{{attachment.thumbSrc}}"/>' +
							        '<span ng-if="!attachment.thumbSrc">' +
							            '<span class="glyphicon glyphicon-file text-2x" aria-label="{{attachment.file_name}}"/>' +
							        '</span>' +
							    '</a>' +
							    '<div class="col-md-5 col-sm-6 col-xs-8 file-name v-middle" style="overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">' +
							        '<a class="get-attachment" ng-click="field.attachmentHandler.downloadAttachment(attachment)" ng-attr-title="Download {{attachment.file_name}}" href="javascript:void(0)">' +
							            '{{attachment.file_name}} ({{attachment.size}})' +
							        '</a>' +
							        '<input ng-keydown="field.attachmentHandler.onKeyDown($event, attachment)" ng-blur="field.attachmentHandler.updateAttachment($event, attachment)" style="display: none;"/>' +
							        '<div><time><sn-time-ago timestamp="attachment.sys_updated_on" /></time></div>' +
							    '</div>' +
                                '<div class="col-md-6 col-sm-5 col-xs-2 tools v-middle hidden-xs">' +
                                    '<span ng-if="attachment.canWrite && false" class="glyphicon glyphicon-pencil sp-attachment-edit wrapper-xs" ng-click="field.attachmentHandler.editAttachment($event, attachment)" title="Edit file name" aria-label="Edit file name"/>' +
                                    '<span ng-if="attachment.canDelete" class="glyphicon glyphicon-remove sp-attachment-delete wrapper-xs" ng-click="field.attachmentHandler.deleteAttachment(attachment)" title="Delete" aria-label="Delete Attachment"/>' +
                                '</div>' +
                                '<div class="col-md-6 col-sm-5 col-xs-2 tools v-middle text-right visible-xs">' +
                                    '<span ng-if="attachment.canDelete" class="glyphicon glyphicon-remove sp-attachment-delete wrapper-xs" ng-click="field.attachmentHandler.deleteAttachment(attachment)" title="Delete" aria-label="Delete Attachment"/>' +
                                '</div>' +
								'</div>' +
							'</div>',

		link: function(scope, elem, attrs, $parse) {
			scope.icons = {
				preview: attrs.previewIcon,
				edit: attrs.editIcon,
				ok: attrs.okIcon,
				cancel: attrs.cancelIcon
			};

			scope.listClass = "list-group";
			var inline = scope.$eval(attrs.inline);
			if (inline)
				scope.listClass = "list-inline";
		}
	};
}

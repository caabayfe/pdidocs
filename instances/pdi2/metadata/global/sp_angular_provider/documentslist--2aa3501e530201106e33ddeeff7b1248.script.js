function() {
	'use strict';
	
	return {
		restrict: 'E',
		replace: true,
		template:
			'<div ng-if="attachments.length || errorMessages.length" class="file-list-wrap">' +
			 '<div ng-if="attachments.length">'+
				'<ul class="{{listClass}}" style="margin-bottom: 0">'+
					'<li class="list-group-item attachment-box" ng-repeat="attachment in attachments">'+
              '<div class="sp-attachment-block file-attachment" id="{{attachment.sys_id}}">'+
									 '<div class="file-name">'+
											'<a ng-click="attachmentHandler.downloadAttachment(attachment)">'+
												'{{::attachment.file_name}}'+
											'</a>'+
											'<p>{{::attachment.description}}</p>'+
											'<input tabindex="-1" ng-keydown="attachmentHandler.onKeyDown($event, attachment)"'+
												'ng-blur="attachmentHandler.updateAttachment($event, attachment)"'+
												'aria-label="File name" style="display: none;" />'+
										'</div>'+
										'<div class="tools align-right">'+
											'<div class="btn-group" role="group" ng-if="attachment.canWrite || attachment.canDelete">'+
												'<button ng-if="attachment.canWrite" type="button" class="btn btn-default btn-clear"'+
													'ng-click="attachmentHandler.editAttachment(attachment)"'+
													'aria-label="{{::data.editTooltip}} {{::attachment.file_name}}"'+
													'title="{{::data.editTooltip}} {{::attachment.file_name}}" data-toggle="tooltip"'+
													'data-placement="bottom" data-container="body"><i class="fa fa-pencil" aria-hidden="true"></i>'+
												'</button>'+
												'<button ng-if="attachment.canDelete" type="button" class="btn btn-default btn-clear"'+
													'ng-click="confirmDeleteAttachment(attachment, $event)"'+
													'aria-label="{{::data.deleteTooltip}} {{::attachment.file_name}}"'+
													'title="{{::data.deleteTooltip}} {{::attachment.file_name}}" data-toggle="tooltip"'+
													'data-placement="bottom" data-container="body"><i class="fa fa-times" aria-hidden="true"></i>'+
												'</button>'+
											'</div>'+
											'<div style="text-align: center;">'+
												'<time><sn-time-ago timestamp="::attachment.sys_created_on" /></time>'+
											' </div>'+
										'</div>'+
              '</div>'+
					'</li>'+
				'</ul>'+
			 '</div>'+
			 '<div class="errors-wrap" ng-hide="errorMessages.length == 0">'+
				'<div class="error-msg icon-cross" ng-repeat="error in errorMessages" ng-click="attachmentHandler.dismissMsg($event, $index, errorMessages)">'+
					'<span>{{error.msg}}</span>'+
					'<span class="file-name">{{error.fileName}}</span>'+
				'</div>'+
			 '</div>'+
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

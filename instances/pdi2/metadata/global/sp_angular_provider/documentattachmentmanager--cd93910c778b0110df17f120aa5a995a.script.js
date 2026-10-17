function(i18n) {
	return {
		template: '<div ng-show="attachments.length > 0" class="sp-attachment-manager">' +
								'<h2 style="display: inline" class="h5">{{::translations["Attachments"]}}</h2>' +
								'<button class="btn btn-link m-l" ng-show="!omitEdit" ng-click="toggleEditMode()" aria-label="{{translations[\'Edit Attachments mode\']}}" aria-pressed={{editMode}}>{{getToggleName()}}</button>' +
								'<ul class="unstyled-list" aria-label="{{::translations[\'Attachments\']}}">' +
									'<li class="attached-file" ng-repeat="attachment in attachments"  style="overflow: hidden; text-overflow: ellipsis;width: 100%;">' +
										'<a ng-if="attachment.state === \'available\'" ng-href="{{getAttachmentURL(attachment)}}" target="_blank" aria-label="{{::getAriaLabel(attachment)}}" title="{{::getTitle(attachment)}}"><span class="fa {{getIcon(attachment)}}"></span>' +
										'{{attachment.file_name}}</a>' +
										'<a href="#" ng-if="attachment.state === \'pending\' || attachment.state === \'\' || attachment.state === \'available_conditionally\'" ng-click="scanAttachment(attachment)" aria-label="{{::getAriaLabel(attachment)}}" title="{{::getTitle(attachment)}}"><span class="fa {{getIcon(attachment)}}"></span>' +
										'{{attachment.file_name}}</a>' +
										'<span ng-if="attachment.state === \'not_available\'" aria-label="{{::translations[\'Attachment\']}}: {{attachment.file_name}}" title="{{::getTitle(attachment)}}" class="{{attachment.state}}">' +
										'{{attachment.file_name}} <span class="error">({{::translations[\'File failed security scan\']}})</span></span>' +
										'<button ng-show="editMode && attachment.canDelete" aria-label="{{::translations[\'Delete\']}} {{attachment.file_name}}" title="{{::translations[\'Delete\']}} {{attachment.file_name}}" data-toggle="tooltip" data-placement="top" ng-click="removeAttachment($event, attachment)" class="fa fa-times m-l-xs delete-attachment"></button>' +
									'</li>' +
								'</ul>' +
							'</div>',
		restrict: 'E',
		replace: true,
		scope: {
			table: "=",
			sysId: "=",
			omitEdit: "="
		},
		link: function(scope, elem, attr) {
			i18n.getMessages(['Attachment',
							  'Edit',
							  'Done',
							  'File failed security scan',
							  'Attachments',
							  'Delete',
							  'Attachment deleted successfully',
							  'View attachment',
							  'Download attachment',
							  'Edit Attachments mode'], function(msgArr){
				scope.translations = msgArr;
			});
		},
		controller: function($scope, snAttachmentHandler, spAriaUtil) {
			var cacheMap = {};
			
			$scope.attachments = [];
			$scope.translations = [];
			var attachmentHandler;

			function initializeAttachmentHandler() {
				$scope.editMode = false;
				
				var key = $scope.table + '.' + $scope.sysId;
				var cached = cacheMap[key];
				
				if(cached) {
					attachmentHandler = cached.handler;
					$scope.attachments = cached.attachments;
					return;
				}
				
				attachmentHandler = snAttachmentHandler.create($scope.table, $scope.sysId);
				attachmentHandler.getAttachments().then(function(response) {
					$scope.attachments = response;
					cacheMap[key] = {
						handler: attachmentHandler,
						attachments: $scope.attachments
					};
				});
			}

			$scope.getAriaLabel = function(attachment) {
			    var attachmentMsg = (attachment.viewImage) ? $scope.translations['View attachment'] : $scope.translations['Download attachment'];
			    attachmentMsg += ' ' + attachment.file_name;
			    return attachmentMsg;
			};

			$scope.getTitle = function(attachment) {
				var msg = i18n.getMessage("Attached by {0} {1}").withValues([attachment.sys_created_by_display, attachment.sys_updated_on_display]);
				if (attachment.encryption_context)
					msg += ", " + i18n.getMessage("Encrypted") + ": " + attachment.encryption_context_display;
				return msg;
			};
			
			$scope.editMode = false;
			$scope.toggleEditMode = function() {
				$scope.editMode = !$scope.editMode;
			}

			$scope.getToggleName = function() {
				return ($scope.editMode) ? $scope.translations['Done'] : $scope.translations['Edit'];
			}
			
			$scope.scanAttachment = function(attachment){
				snAttachmentHandler.scanAttachment(attachment);
			}
			
			$scope.$on("sn.attachment.scanned", function(e, recordID) {
				attachmentHandler.getAttachments().then(function(response) {
					$scope.attachments = response;
				});
			})
			
			$scope.getAttachmentURL = function(attachment) {
				var url;
				if (attachment.viewUrl)
					url = attachment.viewUrl + "&view=true";
				else 
					url = '/sys_attachment.do?sys_id='+ attachment.sys_id + '&view=true';
				return url;
			}


			$scope.removeAttachment = function(e, attachment) {
				e.stopPropagation();
				e.preventDefault();

				attachmentHandler.deleteAttachment(attachment).then(function() {
					if ($scope.attachments.length === 0)
						$scope.editMode = false;

					spAriaUtil.sendLiveMessage($scope.translations['Attachment deleted successfully']);
				});
			}

			$scope.$watch("sysId", initializeAttachmentHandler);

			$scope.$on("sp.attachments.update", function(e, recordID) {
				if (recordID !== $scope.sysId)
					return;

				attachmentHandler.getAttachments().then(function(response) {
					$scope.attachments = response;
				});
			})

			var extIconMap = {
				'ppt': 'fa-file-powerpoint-o',
				'pptx': 'fa-file-powerpoint-o',
				'doc': 'fa-file-word-o',
				'docx': 'fa-file-word-o',
				'xls': 'fa-file-excel-o',
				'xlsx': 'fa-file-excel-o'
			};

			var fileIconMap = {
				'image/jpeg': 'fa-file-image-o',
				'image/pjpeg': 'fa-file-image-o',
				'image/tiff': 'fa-file-image-o',
				'image/png': 'fa-file-image-o',
				'image/gif': 'fa-file-image-o',
				'application/zip': 'fa-file-archive-o',
				'application/x-compressed': 'fa-file-archive-o',
				'application/x-zip-compressed': 'fa-file-archive-o',
				'application/pdf': 'fa-file-pdf-o',
				'application/vnd.openxmlformats-officedoc': 'fa-file-word-o',
				'application/msword': 'fa-file-word-o',
				'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'fa-file-word-o',
				'application/vnd.openxmlformats-officedocument.wordprocessingml.template': 'fa-file-word-o',
				'application/excel': 'fa-file-excel-o',
				'application/vnd.ms-excel': 'fa-file-excel-o',
				'application/x-excel': 'fa-file-excel-o',
				'application/x-msexcel': 'fa-file-excel-o',
				'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'fa-file-excel-o',
				'application/vnd.openxmlformats-officedocument.spreadsheetml.template': 'fa-file-excel-o',
				'application/powerpoint': 'fa-file-powerpoint-o',
				'application/vnd.ms-powerpoint': 'fa-file-powerpoint-o',
				'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'fa-file-powerpoint-o',
				'application/vnd.openxmlformats-officedocument.presentationml.template': 'fa-file-powerpoint-o',
				'application/vnd.openxmlformats-officedocument.presentationml.slideshow': 'fa-file-powerpoint-o'
			};

			$scope.getIcon = function(attachment) {
				return attachment.encryption_context ? "fa-lock" : (extIconMap[attachment.ext] || fileIconMap[attachment.content_type] || "fa-file-o");
			}

			initializeAttachmentHandler();
		}
	};
}

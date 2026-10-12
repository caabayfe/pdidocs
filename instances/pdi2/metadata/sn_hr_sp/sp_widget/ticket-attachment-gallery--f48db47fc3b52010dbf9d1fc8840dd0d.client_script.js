api.controller = function($scope, $element, $timeout, snAttachmentHandler, i18n, $log, spUtil) {

	var VIEWPORT_WIDTH = window.innerWidth;

	var MIME_ICONS = {
		text: 'fa-file-text-o',
		pdf: 'fa-file-pdf-o',
		word: 'fa-file-word-o',
		msword: 'fa-file-word-o',
		document: 'fa-file-word-o',
		excel: 'fa-file-excel-o',
		sheet: 'fa-file-excel-o',
		powerpoint: 'fa-file-powerpoint-o',
		presentation: 'fa-file-powerpoint-o',
		photo: 'fa-file-photo-o,',
		picture: 'fa-file-picture-o,',
		image: 'fa-file-image-o',
		archive: 'fa-file-archive-o',
		zip: 'fa-file-archive-o',
		sound: 'fa-file-sound-o,',
		audio: 'fa-file-audio-o',
		movie: 'fa-file-movie-o,',
		video: 'fa-file-video-o',
		code: 'fa-file-code-o',
		generic: 'fa-file-o'
	}
	
	// allows conditional widget options based on client-side metrics like viewport size
	var widgetOptions = Object.assign({profiles:[]}, $scope.widget.options);
	var overrides = widgetOptions.profiles.find(function(profile){
		return VIEWPORT_WIDTH < profile.condition.breakpoint;
	});
	Object.assign(widgetOptions, overrides ? overrides.options : null);

	// must be passed in the widget options as:
	// $sp.getWidget('widget-ticket-attachment-gallery', {ticket_table, ticket_sys_id, ...})
	var attrs = {
		ticketTable: widgetOptions.ticket_table,
		ticketSysId: widgetOptions.ticket_sys_id,
		canWrite: defaultValue(widgetOptions.can_write, false),
		canAttach: defaultValue(widgetOptions.can_attach, widgetOptions.can_write || false),
		canRead: defaultValue(widgetOptions.can_read, true),
		maxFileUploadSize: defaultValue(widgetOptions.max_file_upload_size,  $scope.data.maxAttachmentSize * 1024 * 1024), // in bytes
		maxThumbnails: defaultValue(widgetOptions.max_thumbnails, 3),
		refreshOnUpdate: defaultValue(widgetOptions.refresh_on_update, true),
		emptyListText: defaultValue(widgetOptions.empty_list_text, ''),
		downloadUrl: defaultValue(widgetOptions.download_url, '/sys_attachment.do?sys_id={{sys_id}}')
	};
		
	$scope.maxThumbnails = $scope.limitThumbnails = attrs.maxThumbnails;
	$scope.msgMore = '';
	$scope.current = null;
	$scope.loading = true;
	$scope.uploading = false;
	$scope.attachments = [];
	$scope.touchEnabled = document.body.classList.contains('touch_scroll');
	$scope.emptyListText = attrs.emptyListText;

	$scope.canWrite = attrs.canWrite;
	$scope.canAttach = attrs.canAttach;
	$scope.canRead = attrs.canRead;
	
	var containerEl = $element[0];

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 

	function DynamicMessages(messages) {
		var self = this;
		this.scope = {};
		this._messages = messages;
		Object.keys(this._messages).forEach(function(messageId) {
			self.scope[messageId] = '';		
		});
	}
	DynamicMessages.prototype = {
		bindParam: function(messageId, value) {
			this.scope[messageId] = i18n.format(this._messages[messageId], value);
		}
	}
	
	var dynamicMessages = new DynamicMessages($scope.data.dynamicMessages);
	$scope.dynamicMessages = dynamicMessages.scope;
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 

	$scope.attachmentListCtrl = {

		_attachmentService: snAttachmentHandler.create(attrs.ticketTable, attrs.ticketSysId),
		
		_switchResolution: function(imgUrl, resolution) {
			return (imgUrl||'').replace(/\?t=[^&]+/, '?t=' + resolution)
		},
		
		_getFileTypeIcon: function(mimeType) {
			var mimeTypeFamilies = mimeType.split(/[^a-z]+/i);
			var subType;
			while (mimeTypeFamilies.length) {
				subType = mimeTypeFamilies.pop();
				if (MIME_ICONS[subType])
					return MIME_ICONS[subType];
			}
			return MIME_ICONS.generic;
		},
		
		_parseEntry: function(attachment) {
			var name = attachment.file_name.split('.').slice(0, -1).join('.');
			return Object.assign({}, attachment, {
				name: name,
				thumb_src_small: this._switchResolution(attachment.thumb_src, 'small'),
				thumb_src_medium: this._switchResolution(attachment.thumb_src, 'medium'),
				icon: this._getFileTypeIcon(attachment.content_type),
				downloadUrl: template(attrs.downloadUrl, attachment)
			});

		},
		
		_list: [],

		setLoading: function(state) {
			$scope.loading = state !== false;
		},
		
		load: function() {
			var self = this;
			this.setLoading();
			return this._attachmentService.getAttachments().then(function(attachments) {
				self.setLoading(false);
				self.list = attachments;
				$scope.attachments = attachments.map(self._parseEntry.bind(self));
				dynamicMessages.bindParam('showMore', attachments.length - attrs.maxThumbnails);
			});
		},
		
		refresh: function() {
			if (!attrs.refreshOnUpdate) {
				this.setLoading(false);
				return Promise.resolve();
			}
			return this.load();
		},

		getAttachment: function(attachmentSysId) {
			return $scope.attachments.find(function(attachment) {
				return attachment.sys_id === attachmentSysId;
			}) || null;
		},

		deleteAttachment: function(attachmentSysId) {
			var self = this;
			this.setLoading();
			return snAttachmentHandler.deleteAttachment(attachmentSysId).then(function() {
				return self.refresh();
			});
		},

		renameAttachment: function(attachmentSysId, nextName) {
			var self = this;
			this.setLoading();
			var nextExtension = this.getAttachment(attachmentSysId).file_name.split('.').slice(-1).shift();
			var nextFileName = [nextName, nextExtension].join('.');
			return snAttachmentHandler.renameAttachment(attachmentSysId, nextFileName).then(function() {
				return self.refresh();
			});
		},

		uploadAttachment: function(files) {
			var self = this;
			this.setLoading();
			dynamicMessages.bindParam('maxUploadSize',  "" + attrs.maxFileUploadSize/(1024*1024) + "MB");
			var errorMsg = '';
			var hasInvalidFiles = files.some(function(uplFile) {
				var name = uplFile.name;
				var extension = name.substring(name.lastIndexOf('.') + 1);
				if(uplFile.size > attrs.maxFileUploadSize) {
					errorMsg = dynamicMessages.scope.maxUploadSize;
					return true;
				}
				else if($scope.data.allowedExtensions !== '' && $scope.data.allowedExtensions.split(',').indexOf(extension) === -1) {
					errorMsg = dynamicMessages._messages.allowedExtensions;
					return true;
				}
				return false;
			});
			if (hasInvalidFiles) {
			    $log.error(errorMsg);
				spUtil.addErrorMessage(errorMsg);
				self.setLoading(false);
				return;
			}
			return this._attachmentService.uploadAttachments(files).then(function() {
				return self.refresh();
			});
		},

		toggleLimit: function() {
			var lastThumbnailIndex = $scope.limitThumbnails;
			var wasOpen = lastThumbnailIndex > attrs.maxThumbnails;
			$scope.limitThumbnails = wasOpen ? attrs.maxThumbnails : Infinity;
			// focus on next thumbnail
			$timeout(function() {
				var nextThumbnailIndex = wasOpen ? 1 : lastThumbnailIndex + 1;
				var nextThumbnailEl = containerEl.querySelector('.__attachments li:nth-child(' + nextThumbnailIndex + ') .__caption a');
				if (nextThumbnailEl) nextThumbnailEl.focus();
			}, 0, false);		
		}

	};
	
	$scope.toolbarCtrl = {

		_modalEl: null,
		
		_locateModalElement: function(selector) {			
			// Find the modal dialog that's currently open and cache
			// a reference to the given selector.
			var self = this;
			if (!selector) {
				if (this._modalEl) {
					this._modalEl.removeEventListener('keypress', inputKeyPressHandler);
				}
				this._modalEl = null;
				return;
			}
			waitForElement(document, selector).then(function(modalEl) {
				self._modalEl = modalEl;
				self._modalEl.addEventListener('keypress', inputKeyPressHandler);
			});
		},

		_getClickTargetId: function(targetEl) {
			return targetEl.closest('[data-id]').dataset.id
		},
		
		_sanitizeName: function(name) {
			var escapeMap = {
				"&": "&amp;",
				"<": "&lt;",
				">": "&gt;",
				'"': '&quot;',
				"'": '&#39;',
				"/": '&#x2F;'
			};
			
			name = name || 'no-name';
			
			return name.trim().replace(/[&<>"'\/]/g, function(c){
				return escapeMap[c];
			}).slice(0, 100);
		},

		rename: function(attachmentSysId) {
			var self = this;
			var openEventName = 'dialog.attachment-gallery-confirm-rename.show';
			$scope.current = Object.assign({}, $scope.attachmentListCtrl.getAttachment(attachmentSysId));
			waitForEventWatcherDeployment($scope, $timeout, openEventName).then(function() {
				$scope.$broadcast(openEventName);
				self._locateModalElement('.__thumbnail_name');
			});
		},
		
		remove: function(attachmentSysId) {
			var openEventName = 'dialog.attachment-gallery-confirm-delete.show';
			$scope.current = $scope.attachmentListCtrl.getAttachment(attachmentSysId);
			dynamicMessages.bindParam('confirmDelete', $scope.current.file_name);
			waitForEventWatcherDeployment($scope, $timeout, openEventName).then(function() {
				$scope.$broadcast(openEventName);
			});
		},
		
		renameImmediate: function(attachmentSysId) {
			var nextName = this._sanitizeName(this._modalEl.value);
			$scope.attachmentListCtrl.renameAttachment(attachmentSysId, nextName);
			this.dismissRequest();
		},

		removeImmediate: function(attachmentSysId) {
			$scope.attachmentListCtrl.deleteAttachment(attachmentSysId);
			this.dismissRequest();
		},
		
		upload: function(files) {
			containerEl.querySelector('.__upload input').click();
		},

		uploadImmediate: function(files) {
			$scope.attachmentListCtrl.uploadAttachment(files);
		},

		dismissRequest: function() {
			// flush sn-confirm-modal instance
			$scope.current = null;
			// clear cached instance
			this._locateModalElement();
			// manually remove dialogs orphaned by sn-confirm-modal flushing
			document.querySelectorAll('body > [name^="attachment-gallery-confirm-"]').forEach(function(el){
				el.parentNode.removeChild(el);
			});
		}
		
	};

	// Reload the list after a successful attachment in 'std_ticket_conversations' widget
	$scope.$on('sp.attachments.update', function(event, ticketId) {
		if (ticketId === attrs.ticketSysId)
			$scope.attachmentListCtrl.refresh();
	});

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
	
	$scope.attachmentListCtrl.load();

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 

	function defaultValue(val, defaultVal) {
		return val === undefined ? defaultVal : val;
	}
	
	function inputKeyPressHandler(evt) {
		if (evt.keyCode === 13 && $scope.current) {
			$scope.toolbarCtrl.renameImmediate($scope.current.sys_id);
			$scope.$broadcast('dialog.attachment-gallery-confirm-rename.close');
		}
	}

	function template(templateStr, params) {
		return templateStr.replace(/\{\{([^}]+)\}\}/g, function(match, attr) {
			return params.hasOwnProperty(attr) ? params[attr] : match;
		});
	}

	function waitForElement(containerEl, selector) {
		return waitForCondition(function() {
			return containerEl.querySelector(selector);
		});
	}
	
	function waitForEventWatcherDeployment($scope, $timeout, watcherName) {
		var digestTask = new Promise(
			function(resolve){ $timeout(resolve); }
		);
		var watcherDetectFn = function() {
			return $scope.$$listenerCount[watcherName];
		};
		return digestTask.then(function() {
			return waitForCondition(watcherDetectFn);
		});
	}

	function waitForCondition(conditionFn) {
			return new Promise(function(resolve, reject) {
				var ttl = 100; // wait 100 frames max
				var pollForCondition = function() {
					ttl--;
					if (!ttl) {
						reject(new Error('waitForCondition: timeout'));
						return;
					}
					var result = conditionFn();
					if (result) {
						resolve(result);
						return;						
					}
					requestAnimationFrame(pollForCondition);
				}
				pollForCondition();	
			});
		}
	
};

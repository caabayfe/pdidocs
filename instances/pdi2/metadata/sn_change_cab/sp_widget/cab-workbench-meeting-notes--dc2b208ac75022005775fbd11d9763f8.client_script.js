function ($scope, SNAPI, TIME, runtimeState, $http, $interval, $timeout, $window, $log, $uibModal, modelUtil, spUtil, $element, $q, $uibModalStack, snAttachmentHandler) {
	var c = this;

	var meeting = {
		"runtimeState": null,
		"record": null
	}
	$scope.meeting = meeting;
	
	var modalNotification = {
		"timeout": null,
		"message": null,
		"display": false,
		"notify": function(message) {
			if(modalNotification.timer !== null)
				$timeout.cancel(modalNotification.timer);

			modalNotification.message = message;
			modalNotification.display = true;
			modalNotification.timeout = $timeout(function() {
				modalNotification.display = false;
				modalNotification.timeout = null;
			}, 2000);
		},
	}
	$scope.modalNotification = modalNotification;
	
	var meetingNotes = {
		"workingCopy": null,
		"savedCopy":  null,
		"concurrentUpdate": false,
		
		"autoSave": {
			"enabled": true,
			"timeout": null,
			"inProgress": false,
			"expectAMB": false,
			
			"trigger": function() {
				if (!meetingNotes.autoSave.enabled)
					return;
				
				if (meetingNotes.autoSave.timeout)
					$timeout.cancel(meetingNotes.autoSave.timeout);
				
				meetingNotes.autoSave.timeout = $timeout(function() {
					meetingNotes.autoSave.timeout = null;
					//Recall if triggered during a server request
					if (meetingNotes.autoSave.inProgress) {
						meetingNotes.autoSave.trigger();
						return;
					}
					
					meetingNotes.autoSave.inProgress = true;
					meetingNotes.save()
					.then(function() {
						modalNotification.notify(c.data.i18n.notesSaved);
						meetingNotes.autoSave.inProgress = false;
						meetingNotes.autoSave.expectAMB = true;
					}, function() {
						meetingNotes.autoSave.inProgress = false;
						meetingNotes.autoSave.expectAMB = false;
					});
				}, 2000);
			}
		},
		
		"canEdit": function() {
			return runtimeState.canEditNotes($scope.data.userId);
		},
		
		"canShare": function() {
			return runtimeState.isNotesEditor($scope.data.userId) || runtimeState.isHost($scope.data.userId);
		},

		"isEditor": function() {
			return runtimeState.isNotesEditor($scope.data.userId);
		},
		
		"save" : function() {
			if (meetingNotes.savedCopy === meetingNotes.workingCopy)
				return $q.reject();
			
			var prevSaved = meetingNotes.savedCopy;
			meetingNotes.savedCopy = meetingNotes.workingCopy;
			return $http.patch(SNAPI.SERVICE.TABLE + "cab_meeting/" + $scope.data.meetingId, {
				"meeting_notes": meetingNotes.savedCopy
			})
			.then(null,
			function(r) {
				meetingNotes.savedCopy = prevSaved;
				modelUtil.failNicely(r);
			});
		},
		
		"editor": {
			"instance": null,
			"wasFocused": false,
			"config": {
				"menubar": false,
				"theme": "silver",
				"plugins":[
					'advlist','lists','link','charmap','anchor','powerpaste',
					'searchreplace','visualblocks','code ',
					'insertdatetime'
				],
				"height": 500,
				"cache_suffix": 'sysparm_substitute=false',
				"toolbar": 'styles | bold italic | bullist numlist | alignleft aligncenter alignright alignjustify | link',
				"toolbar_items_size": "small",
				"paste_data_images": true,
				"statusbar": false,
				"setup": function (instance) {
					meetingNotes.editor.instance = instance;
					
					instance.on("focusout", function(event) {
						$uibModalStack.clearFocusListCache();
						meetingNotes.editor.wasFocused = true;
					});
					
					instance.on("keyup", function(event) {
						meetingNotes.autoSave.trigger();
					});
					
					// Trigger on commands such as bold, italic etc.
					instance.on("ExecCommand", function() {
						meetingNotes.autoSave.trigger();
					});
					
					instance.on("postRender", function(event) {
						// Route to the toolbar container for our configuration.
						var toolbar = event.target.editorContainer.children[0].children[0];
						// Keeps 'Esc' to move back to editor without closing modal.
						toolbar.onkeydown = function(event) {
							if (event.keyCode === 27)
								event.preventDefault();
						};
					});
				},
				"auto_focus": "cab-mn-editor-textarea",
				images_upload_handler: function(blobInfo) {
					var blob = blobInfo.blob();
					var fileName = blobInfo.filename();
					blob.name = "Pasted image" + fileName.substr(fileName.lastIndexOf("."));
					if ($scope.data.meetingId) {
						meetingNotes.editor.instance.setProgressState(true);
						return snAttachmentHandler.create('cab_meeting', $scope.data.meetingId).uploadAttachment(blob, null, {}).then(function (response) {
							meetingNotes.editor.instance.setProgressState(false);
							return "/sys_attachment.do?sys_id=" + response.sys_id;
						}, function (error) {
							meetingNotes.editor.instance.setProgressState(false);  
							return $q.reject(error); 
						});
					} else {
						console.warn("cannot find meeting id");
						return $q.reject();
					}
				}
			}
		},
		
		"edit": {
			"available": function() {
				return (runtimeState.isCABManager($scope.data.userId) || runtimeState.isCABManagerDelegate($scope.data.userId))
					&& $scope.state.notes_editor.value !== $scope.data.userId;
			},

			"onClick": function() {
				return runtimeState.setNotesEditor($scope.data.userId);
			}
		},
		
		"share": {
			"hasFocus": false,
			"focus": function() {
				meetingNotes.share.hasFocus = true;
				$timeout(function() {
					meetingNotes.share.hasFocus = false;
				});
			},
			"available": function() {
				return !meetingNotes.share.inProgress && !meetingNotes.concurrentUpdate &&
					meetingNotes.workingCopy && meetingNotes.workingCopy.length > 0;
			},
			"onClick": function() {
				if (!runtimeState.isCABManager($scope.data.userId) && !runtimeState.isNotesEditor($scope.data.userId))
					return;

				if (meetingNotes.share.modal.instance !== null)
					return;
			
				meetingNotes.share.modal.instance = $uibModal.open(meetingNotes.share.modal.config);
				meetingNotes.share.modal.instance.result
				.then(function() {
					meetingNotes.share.inProgress = true;
					return c.server.get({
						"command": c.data.command.SHARE,
						"sys_id": c.data.meetingId
					});
				})
				.then(
					function() {
						$uibModalStack.clearFocusListCache();
						meetingNotes.share.focus();
						modalNotification.notify(c.data.i18n.notesShared);
						meetingNotes.share.inProgress = false;
						meetingNotes.share.modal.instance = null;
					},
					function(r) {
						$uibModalStack.clearFocusListCache();
						meetingNotes.share.focus();
						meetingNotes.share.inProgress = false;
						meetingNotes.share.modal.instance = null;
					}
				);
			},

			"modal": {
				"config": {
					animation: true,
					controller: "confirmSharing",
					templateUrl: "cab-sharenotes-confirmation"
				},
				"instance": null
			},	
			"inProgress": false,
			"focusFix": function($event) {
				if (meetingNotes.editor.wasFocused) {
					meetingNotes.editor.wasFocused = false;
					var share = document.getElementById("cab-mn-share-btn");
					var close = document.getElementById("cab-meeting-notes-modal-close");
					
					if (share.disabled)
						close.focus();
					else
						share.focus();
					
					return;
				}
				meetingNotes.editor.instance.focus();
			}
		}
	};
	$scope.meetingNotes = meetingNotes;

	runtimeState.get(c.data.meetingId).then(function(state) {
		meeting.runtimeState = state;
		meeting.record = state.cab_meeting.record;
		
		$scope.state = state;

		$scope.$on("modalBodyFocused", function(event) {
			meetingNotes.editor.wasFocused = false;
		});
		
		$scope.$watch($scope.meetingNotes.share.available, function() {
			$uibModalStack.clearFocusListCache();
		});
		
		$scope.$watch("state.notes_editor.value", function(newValue, oldValue) {
			if (oldValue === $scope.data.userId)
				meetingNotes.save();
		});
		
		$scope.$watch("meeting.record.meeting_notes.display_value", function(newValue, oldValue) {
			// Initial setup
			if (meetingNotes.savedCopy === null && meetingNotes.workingCopy === null) {
				meetingNotes.workingCopy = meeting.record.meeting_notes.display_value;
				meetingNotes.savedCopy = meeting.record.meeting_notes.display_value;
				return;
			}
			
			// We triggered the update can ignore the AMB update
			if (meetingNotes.autoSave.expectAMB) {
				meetingNotes.autoSave.expectAMB = false;
				return;
			}
			
			if (meetingNotes.autoSave.timeout !== null) {
				//We have an update colission.  Notify and set concurrentupdate true
				modalNotification.notify(c.data.i18n.concurrentUpdate);
				meetingNotes.concurrentUpdate = true;
				return;
			}
			
			meetingNotes.savedCopy = meeting.record.meeting_notes.display_value;
			meetingNotes.workingCopy = meeting.record.meeting_notes.display_value;
			
			if (meetingNotes.canEdit())
				meetingNotes.editor.instance.setContent(meeting.record.meeting_notes.display_value);
		});
		
		// Save on destroy.
		$scope.$on("$destroy", function() {
			if (!meetingNotes.canEdit())
				return;
				
			if (meetingNotes.autoSave.timeout !== null)
				$timeout.cancel(meetingNotes.autoSave.timeout);
			
			meetingNotes.editor.instance.save();  //Saves editor contents to textarea
			meetingNotes.save(); // Saves notes to instance.
		});
	});
}

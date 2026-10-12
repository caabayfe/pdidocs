function spTicketConversation($scope, nowAttachmentHandler, $animate, $rootScope, cabrillo, $timeout, snRecordWatcher, spUtil, spAriaUtil, $http, $window, $sce, snAttachmentHandler, i18n, dynamicTranslation, dateUtils) {
	$scope.showLocationIcon = false;
	$scope.msg = "";
	$scope.isNative = cabrillo.isNative();
	$scope.errorMessages = [];
	var dateFormat = window.NOW.dateFormat;
	var hasTimeZone = g_user_date_time_format.indexOf('z') > -1;
	$scope.showDate = !hasTimeZone && (dateFormat.dateBoth || !dateFormat.timeAgo);
	$scope.showTimeAgo =  hasTimeZone || dateFormat.dateBoth || dateFormat.timeAgo;
	var existingEntries = {};
	var c = this;
	var postLock = false;  //global flag that tells the UI that it is okay to post a new message
	var skipNextRecordWatchUpdate = false;
	$scope.typing = [];
	$scope.embeddedInForm = false;
	$scope.$evalAsync(function() {
		if($('#widget-form').find('.ticket-conversation-title').length){
			$scope.embeddedInForm = true;
		}
		updateTimelineFocus();
	})
	if (!$scope.data.hasReadableJournalField && !$scope.data.isNewRecord)
		console.warn("No readable journal field (comments, work notes, etc.) available in the stream for this record");
	if ($scope.page && $scope.page.g_form)
		hideParentJournalFields();
	if ($scope.data.is_new_order) {
		$timeout(function() {
			spAriaUtil.sendLiveMessage($scope.data.requestSubmitMsg);
		}, 500);
	}
	function hideParentJournalFields() {
		if (!$scope.data.stream)
			return;

		var fields = $scope.data.stream.journal_fields;
		var g_form = $scope.page.g_form;
		for (var f in fields)
			g_form.setDisplay(fields[f].name, false);
	}
	var liveProfiles = {};
	liveProfiles[$scope.user.sys_id] = {
		userID: $scope.user.sys_id,
		name: $scope.user.name,
		initials: $window.NOW.user_initials
	};
	if ($window.NOW.user_avatar) {
		liveProfiles[$scope.user.sys_id].userImage = $window.NOW.user_avatar;
	}

	$scope.getLiveProfileByUserId = function (userId){
		return liveProfiles[userId];
	}

	var pending = {};

	//Little caching implementation to make sure we only get a given user's profile once.
	$scope.hasLiveProfile = function hasLiveProfile(userId){
		if (!userId)
			return false;

		if (liveProfiles[userId])
			return true;
		
		if (pending[userId])
			return false;
		
		pending[userId] = $http.get('/api/now/live/profiles/sys_user.' + userId).then(function (response) {
			liveProfiles[userId] = {
				userID: userId,
				name: response.data.result.name,
				initials: buildInitials(response.data.result.name),
				avatar: response.data.result.avatar
			};
		});
		return false;
	}

	function buildInitials(name) {
		if (!name)
			return "--";
		
		var initialMatchRegex = /^[A-ZÀ-Ÿ]|^[\u3040-\u309f]|^[\u30a0-\u30ff]|^[\uff66-\uff9f]|^[\u4e00-\u9faf]/;
		// Included Hiragana, Katakana, CJK Unified Ideographs and Halfwidth and Fullwidth Forms Blocks
		// Hiragana -> Japanese words, Katakana -> foreign words
		// CJK Unified Ideographs -> modern Chinese, Japanese, Korean and Vietnamese characters
		
		var initials = name.split(" ").map(function(word) {
			return word.toUpperCase();
		}).filter(function(word) {
			return word.match(initialMatchRegex);
		}).map(function(word) {
			return word.substring(0,1);
		}).join("");

		return (initials.length > 3) ? initials.substr(0, 3) : initials;
	}


	function setupAttachmentHandler(){
		$scope.attachmentHandler = new nowAttachmentHandler(attachSuccess, appendError);

		function attachSuccess() {
			$rootScope.$broadcast("sp.attachments.update", $scope.data.sys_id);
		}

		function appendError(error) {
			spUtil.addErrorMessage(error.msg + error.fileName);
			$scope.errorMessages.push(error);
		}

		$timeout(function() {
			$scope.attachmentHandler.setParams($scope.data.table, $scope.data.sys_id, 1024 * 1024 * $scope.data.maxAttachmentSize);
		})
	}
	setupAttachmentHandler();

	var recordWatcherTimer;
	spUtil.recordWatch($scope, $scope.data.table, "sys_id=" + $scope.data.sys_id, function(name) {
		if (name.data.changes.length > 0) {
			$timeout.cancel(recordWatcherTimer);
			recordWatcherTimer = $timeout(function(){
				if (skipNextRecordWatchUpdate)
					skipNextRecordWatchUpdate = false;
				else
					spUtil.update($scope).then(function(r){
						$scope.data.stream = r.stream;
						updateTimelineFocus();
					});
			}, 250);
		}
	});

	$scope.$on('sp.show_location_icon', function(evt) {
		$scope.data.showLocationIcon = true;
	});
	
	$scope.$on('sn.attachment.scanned', function() {
		if ($scope.data.sys_id != -1)
			updateAttachmentState($scope.data.table, $scope.data.sys_id);
	 });

	$scope.$on('attachment.updated', function(evt,options) {
		if ($scope.data.sys_id != -1 && options.sys_id == $scope.data.sys_id)
			updateAttachmentState($scope.data.table, $scope.data.sys_id);
	});

	function updateAttachmentState(table, sys_id) {
			c.server.update().then(function (data) {
					if (!data.stream || !data.stream.entries)
						return;
					var newEntries = data.stream.entries;
					var currEntries = $scope.data.mergedEntries;
					var oldSize = currEntries ? currEntries.length : 0;
					var newSize = newEntries.length;
					for (var i = 0; i < oldSize; i++) {
							if (!currEntries[i].attachment)
									continue;
							for (var j = 0; j < newSize; j++) {
									if (currEntries[i].sys_id == newEntries[j].sys_id && newEntries[j].attachment) {
											currEntries[i].attachment.state = newEntries[j].attachment.state;
											break;
									}
							}
					}
			});
	}
	
	$scope.scanAttachment = function(attachment){
		snAttachmentHandler.scanAttachment(attachment);
	}
	
	var typingUsers = [];
	$rootScope.$on('sp.sessions', function(evt, sessions) {
		$scope.typing = [];
		var liveMessages = [];
		var tempTypingUsers = [];
		Object.keys(sessions).forEach(function (session) {
			var journalFields = scope.data.stream.journal_fields;
			var canUserReadJournalField = false;
			session = sessions[session];
			
			for (var j = 0; j < journalFields.length; j++) {
				if (journalFields[j].name === session.field_type) {
					canUserReadJournalField = journalFields[j].can_read;
					break;
				}
			}
			
			if (session.status === 'typing' && canUserReadJournalField) {
				$scope.typing.push(session);
				tempTypingUsers.push(session.user_display_name);
				
				if (typingUsers.indexOf(session.user_display_name) === -1)
					liveMessages.push({'type': 'typing', 'user': session.user_display_name});
			} else
				return;
	
		});
		announce(liveMessages);
		typingUsers = tempTypingUsers;
	});

	$scope.$on('sp.conversation_title.changed', function(evt, text) {
		$scope.data.ticketTitle = text;
	})

	$scope.$watch("data.canWrite", function() {
		$rootScope.$broadcast("sp.record.can_write", $scope.data.canWrite);
	});

	var streamUpdateTimer;
	$scope.$watch("data.stream", function() {
		$timeout.cancel(streamUpdateTimer);
		streamUpdateTimer = $timeout(function() {
			mergeStreamEntries();
		}, 50);
	});
	
	function hasAnyAttachments() {
		var stream = $scope.data.stream;
		return stream && stream.entries && stream.entries.some(function(entry) {
			return entry.attachment;
		});
	}

	function updateTimelineFocus() {
		if (hasAnyAttachments()) 
			$('ul.timeline').removeAttr('tabindex');
		else 
			$('ul.timeline').attr('tabindex', 0);
	}

	function mergeStreamEntries() {
		$scope.placeholder = $scope.data.placeholderNoEntries;
		if (!$scope.data.stream || !$scope.data.stream.entries)
			return;

		$scope.placeholder = $scope.data.placeholder;
		var entries = $scope.data.stream.entries;
		for (var i = 0; i < entries.length; i++) {
		    if (entries[i].attachment)
				entries[i].attachment = $scope.attachmentHandler.canViewImage([entries[i].attachment])[0];

		}
		if (!$scope.data.mergedEntries) {
			$scope.data.mergedEntries = $scope.data.stream.entries.slice();
			for (var i = 0; i < entries.length; i++) {
				if (entries[i].value)
					entries[i].value = entries[i].value.replace(/\n/g, '<br/>');
				existingEntries[entries[i].sys_id] = true;
			}

			return;
		}

		var mergedEntries = $scope.data.mergedEntries;
		var liveMessages = [];
		for (var i = entries.length-1; i >= 0; i--) {
			var curEntry = entries[i];
			if (isNewEntry(mergedEntries, curEntry)) {
				if (curEntry.value) {
					curEntry.value = curEntry.value.replace(/\n/g, '<br/>');
					liveMessages.push({'type': 'comment', 'user': curEntry.name, 'comment': curEntry.value});
				}
				if(entries[i].attachment)
					liveMessages.push({'type': 'attachment', 'user': curEntry.name});
				mergedEntries.unshift(curEntry);
				existingEntries[curEntry.sys_id] = true;
			}
		}

		announce(liveMessages);
	}
	
	function announce(messages) {
		setTimeout(function() {
			var liveMessages = [];
			for (var i = 0, l = messages.length; i < l; i++) {
				var message = messages[i];
				switch (message.type) {
					case 'attachment':
						liveMessages.push({'message': i18n.format(i18n.getMessage('{0} has added a new attachment'), {'0': message.user})});
						break;
					case 'comment':
						liveMessages.push({'message': i18n.format(i18n.getMessage('{0} has entered an additional comment {1}'), {'0': message.user, '1': message.comment})});
						break;
					case 'typing':
						liveMessages.push({'message': i18n.format(i18n.getMessage('{0} is typing'), {'0': message.user})});
						break;
				}
			}
			if (liveMessages.length)
				spAriaUtil.sendLiveMessage(liveMessages);
			
		}, 50);
	}

	function isNewEntry(mergedEntries, item) {
		for (var i=0; i < mergedEntries.length; i++) {
			if (mergedEntries[i].sys_id === item.sys_id) {
				return false;
			}
		}
		return true;
	}

	$scope.getPlaceholder = function() {
		if ($scope.data.use_dynamic_placeholder && $scope.data.useSecondaryJournalField)
			return $scope.data.secondaryJournalField.label;
		return $scope.placeholder;
	};

	var colorCache;
	$scope.getFieldColor = function(fieldName) {
		var defaultColor = "transparent";
		if (colorCache) {
			if (fieldName in colorCache)
				return colorCache[fieldName];
			else
				return defaultColor;
		}

		colorCache = {};
		var jf = $scope.data.stream.journal_fields;
		for (var i=0; i<jf.length;i++) {
			colorCache[jf[i].name] = jf[i].color || defaultColor;
		}
		return $scope.getFieldColor(fieldName);
	}

	$scope.checkInLocation = function() {
		$rootScope.$broadcast("check_in_location");
		$rootScope.$broadcast("location.sharing.start");
	}

	$scope.$on("location.sharing.end", function() {
		$timeout(function() {$scope.msg = ""}, 500);
	})

	$scope.$on("location.sharing.start", function() {
		$scope.msg = $scope.data.sharingLocMsg;
		spAriaUtil.sendLiveMessage($scope.data.sharingLocMsg);
	})

	$scope.scanBarcode = function() {
		$rootScope.$broadcast("scan_barcode");
	}

	$scope.$on("attachment.upload.start", function() {
		$scope.data.isPosting = true;
		$scope.msg = $scope.data.uploadingAttachmentMsg;
		postLock = true;
		spAriaUtil.sendLiveMessage($scope.data.uploadingAttachmentMsg);
	})

	$scope.$on("attachment.upload.stop", function() {
		$scope.data.isPosting = false;
		$scope.msg = "";
		//update the stream so we get the new attachment
		if (!postLock)
			return;
			
		spUtil.update($scope).then(function(r) {
			$scope.data.stream = r.stream;
		});
	});

	$scope.trustAsHtml = function(text) {
		return $sce.trustAsHtml(text);
	}
	
	$scope.data.isPosting = false;

	$scope.postEntry = function(input) {
		post(input);
	};

	function post(input) {
		postLock = true;
		if ($scope.data.isPosting)
			return;

		if (!input)
			return;

		input = input.trim();
		$scope.data.journalEntry = input;

		if ($scope.data.useSecondaryJournalField)
			$scope.data.journalEntryField = $scope.data.secondaryJournalField.name;
		else
			$scope.data.journalEntryField = $scope.data.primaryJournalField.name;
		$scope.data.isPosting = true;
		if (postLock) {
				spUtil.update($scope).then(function(){
				$scope.data.isPosting = false;
				reset();
				spAriaUtil.sendLiveMessage($scope.data.messagePostedMsg);
				$timeout(function() {
					$scope.setFocus(); // sets focus back on input, defined in "link"
				});
			}, function() {
				spUtil.addErrorMessage($scope.data.messagePostFailedMsg);
				$scope.data.isPosting = false;
			});
		}
		
		postLock = false;
		skipNextRecordWatchUpdate = true;
		$scope.setFocus(); // sets focus back on input, defined in "link"
	}
	
	$scope.sanitizeHtmlContent = function(content) {
		return $sce.trustAsHtml(spUtil.sanitizeHtml(content));
	}

	var reset = function(){
		$scope.userTyping("");
		$scope.data.journalEntry = "";
		$scope.updateFormWithJournalFields();
		$scope.data.useSecondaryJournalField = false;
		$scope.data.journalEntryField = "";
	}

	$scope.keyPress = function(event) {
		if ($scope.data.isPosting) {
			if (event.keyCode === 13 && !event.shiftKey)
				event.preventDefault();
			return;
		}
		
		if ($scope.data.enterKeyAddsNewLine)
			return; // must click Send button to submit
		
		if (event.keyCode === 13 && !event.shiftKey) {
			event.preventDefault();
			$timeout(function() {
				if ($scope.data.journalEntry)
					$scope.postEntry($scope.data.journalEntry);
			}, 250);
		}
	}

	$scope.userTyping = function(input) {
		var status = "viewing";
		if (input.length)
			status = "typing";

		var field = $scope.data.useSecondaryJournalField ? $scope.data.secondaryJournalField.name : $scope.data.primaryJournalField.name;
		$scope.$emit("record.typing", {status: status, value: input, table: $scope.data.table, sys_id: $scope.data.sys_id, field_type: field});
		$scope.updateFormWithJournalFields();
	}
	$scope.updateFormWithJournalFields = function () {
		var fieldName, fieldToClear = "";
		if ($scope.data.useSecondaryJournalField) {
			fieldName = $scope.data.secondaryJournalField.name;
			fieldToClear = $scope.data.primaryJournalField.name;
		} else {
			fieldName = $scope.data.primaryJournalField.name;
			fieldToClear = "";
		}
		$scope.$emit("activity_stream_is_changed", {"fieldName": fieldName, "fieldToClear": fieldToClear, "input": $scope.data.journalEntry});
	}

	$scope.toggleTranslation = function(e) {
	    e.showDetails = !e.showDetails;
		var translationObject = c.data.translation;
	    e.toggleMsg = e.showDetails ? translationObject.hideMsg : translationObject.showMsg;
	};

	$scope.getTranslatedText = function(translations) {
	    if (!(Array.isArray(translations)))
	        return;
	    var translatedText;
	    var translationsLength = translations.length;
	    for (var index = 0; index < translationsLength; index++) {
	        if (translations[index].targetLanguage === g_lang) {
	            translatedText = translations[index].translatedText;
	            break;
	        }
	    }
	    return translatedText;
	};

	$scope.getAdditionalParameters = function(e, isRetry) {
	    return {
	        'event': {
	            'eventName': 'Activity Stream - Portal',
	            'fieldType': e.element,
	            'retry': isRetry
	        },
	        'additionalParameters': [{
	            'parameterName': 'textType',
	            'parameterValue': 'html'
	        }, {
	            'parameterName': 'escapeHtml',
	            'parameterValue': e.contains_code
	        }]
	    };
	}

	$scope.showTranslationInProgress = function(e) {
	    e.showTranslation = true;
	    e.isTranslationInProgress = true;
	    e.isTranslationSuccess = false;
	    e.isTranslationError = false;
	}

	$scope.showTranslationSuccess = function(e, translatedText, credits) {
	    e.translatedText = translatedText;
	    e.credits = credits;
	    e.toggleMsg = c.data.translation.hideMsg;
	    e.isTranslationInProgress = false;
	    e.isTranslationSuccess = true;
	    e.isTranslationError = false;
	    e.showDetails = true;
	}

	$scope.showTranslationError = function(e, errorMessage, tryAgain) {
	    e.isTranslationInProgress = false;
	    e.isTranslationSuccess = false;
	    e.isTranslationError = true;
	    e.translatedText = errorMessage;
	    e.tryAgain = tryAgain;
	}

	$scope.translateText = function(e, isRetry) {
	    $scope.showTranslationInProgress(e);
	    var translationObject = c.data.translation;
	    dynamicTranslation.getTranslation(e.value && e.value.replace(/<br ?\/?>/g, "\n"), $scope.getAdditionalParameters(e, isRetry)).then(
	        function(successResponse) {
	            var detectedLanguage = successResponse.detectedLanguage;
	            if ((detectedLanguage) && (detectedLanguage.code === g_lang)) {
	                $scope.showTranslationError(e, translationObject.sameLanguageErrorMsg, false);
	                return;
	            }
	            var translatedText = $scope.getTranslatedText(successResponse.translations);
	            if (translatedText) {
	                var credits = i18n.format(translationObject.creditsMsg, successResponse.translator);
	                $scope.showTranslationSuccess(e, translatedText, credits);
	            } else {
	                translatedText = translationObject.genericErrorMsg;
	                $scope.showTranslationError(e, translatedText, true);
	            }
	        },
	        function(errorResponse) {
	            var errorCode = errorResponse.code;
	            var errorMessage;
	            var showRetry = false;
	            switch (errorCode) {
	                case '40052':
	                    errorMessage = translationObject.maxLengthErrorMsg;
	                    break;
	                case '40055':
	                    errorMessage = translationObject.credentialsErrorMsg;
	                    break;
	                case '40053':
	                case '40054':
	                case '40056':
	                    errorMessage = translationObject.langNotSupportedErrorMsg;
	                    break;
	                default:
	                    errorMessage = translationObject.genericErrorMsg;
	                    showRetry = true;
	            }
	            $scope.showTranslationError(e, errorMessage, showRetry);
	        }
	    );
	}
	$scope.$on('sp.textOnlyZoom', function() {
		$window.autosize && $window.autosize.update($("#post-input"));
	})
	
	$scope.seeAllText = function(e) {
		$http.get('/api/now/ui/stream_entry/full_entry?sysparm_sys_id=' + e.sys_id).then(function(response) {
			if (response.data && response.data.result)
				e.value = response.data.result;
			e.is_truncated = false; // even if it didn't work, remove the anchor
		});
	}
}

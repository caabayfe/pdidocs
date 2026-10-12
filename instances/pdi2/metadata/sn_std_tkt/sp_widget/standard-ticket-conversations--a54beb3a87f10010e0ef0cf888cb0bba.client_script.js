function spTicketConversation($sce, $scope, nowAttachmentHandler, $animate, $rootScope, cabrillo, $timeout, snRecordWatcher, spUtil, spAriaUtil, $http, $window, snAttachmentHandler, i18n, dynamicTranslation, snAnalytics, $document) {
    $scope.showLocationIcon = false;
    $scope.msg = "";
    $scope.isNative = cabrillo.isNative();
    $scope.errorMessages = [];
    var existingEntries = {};
    var c = this;
    var postLock = false;
    $rootScope.$on("mentionID", function(evt, data) {
        $scope.data.mentionMap = data;
    });
    var skipNextRecordWatchUpdate = false;
    $scope.typing = [];
    if (!$scope.data.hasReadableJournalField && !$scope.data.isNewRecord)
        console.warn("No readable journal field (comments, work notes, etc.) available in the stream for this record");
    if ($scope.page && $scope.page.g_form)
        hideParentJournalFields();

    $scope.trustAsHtml = function(html) {
        return $sce.trustAsHtml(html);
    }

    $scope.sanitizeHtmlContent = function(content) {
        return $sce.trustAsHtml(spUtil.sanitizeHtml(content));
    }

	$scope.showFilterIcon = function() {
		//return c.options.displayFilter == 'true'; //commented as of now; will be taken up in Brazil
		return false;
	}
    c.showFilter = false;
    c.filters = [
		{ key: 'all', label: 'All', active: true },
		{ key: 'comments', label: 'Comments', active: true },
		{ key: 'work_notes', label: 'Work notes', active: true },
		{ key: 'incident_state', label: 'Incident State', active: true },
		{ key: 'impact', label: 'Impact', active: true },
		{ key: 'opened_by', label: 'Opened by', active: true },
		{ key: 'priority', label: 'Priority', active: true },
		{ key: 'attachments', label: 'Attachments', active: true }
  	];
	function changeFilterActiveState(filters, key, active) {
		var index = 0;
		if (key === 'all') {
			for (index = 0; index < filters.length; index++) {
				filters[index].active = active;
			}
		} else {
			if (key === 'only_all')
				key = 'all';
			for (index = 0; index < filters.length; index++) {
				if (filters[index].key === key) {
					 filters[index].active = active;
					 break;
				}
			}
		}
	}
	function getLengthOfActiveFilters(filters) {
		var length = 0;
		var index = 0;
		for (index; index < filters.length; index++) {
			if (filters[index].active === true)
				length++;
		}
		return length;
	}
	function getActiveKeys(filters) {
		var activeKeyList = [];
		var index = 0;
		for (index; index < filters.length; index++) {
			if (filters[index].active === true)
				activeKeyList.push(filters[index].key);
		}
		return activeKeyList;
	}
	function documentClickHandler(event) {
		var filterButton = document.querySelector('.btn-icon');
		var filterList = document.querySelector('.filter-popover');
    	if (filterButton && filterList && !filterButton.contains(event.target) && !filterList.contains(event.target)) {
			$scope.$applyAsync(function() {
				c.showFilter = false;
			});
		}
	}
	c.toggleFilter = function(event) {
		if (event)
			event.stopPropagation();
		c.showFilter = !c.showFilter;
	};
	c.updateFilter = function(changedFilter) {
		if (changedFilter.key == 'all') {
			changeFilterActiveState(c.filters, changedFilter.key, changedFilter.active);
		} else {
			if (changedFilter.active == true) {
				changeFilterActiveState(c.filters, changedFilter.key, changedFilter.active);
				if (c.filters.length-1 == getLengthOfActiveFilters(c.filters))
					changeFilterActiveState(c.filters, 'only_all', true);
				} else {
					changeFilterActiveState(c.filters, changedFilter.key, changedFilter.active);
					changeFilterActiveState(c.filters, 'only_all', false);
				}
			}
			c.applyFilters();
	};
	c.applyFilters = function() {
		var activeKeys = getActiveKeys(c.filters);
		if (activeKeys.length === 0) {
		  c.filteredActivities = [];
		  return;
		}
		var evaluateFieldChangesDataDisplay = function(filterName, a) {
			var i=0;
			if (!activeKeys.includes(filterName)) {
				for (i=0; i < a.change_entries.length; i++) {
					if (a.change_entries[i].element === filterName)
						 a.change_entries[i].show_in_ui = false;
				}
			} else {
				for (i=0; i < a.change_entries.length; i++) {
					if (a.change_entries[i].element === filterName)
						 a.change_entries[i].show_in_ui = true;
				}
			}
		}
		c.filteredActivities = $scope.data.mergedEntries.filter(function(a) {
			if (activeKeys.indexOf('comments') !== -1 && a.element === 'comments') {
					return true;
			}
			if (activeKeys.indexOf('work_notes') !== -1 && a.element === 'work_notes') {
					return true;
			}
			if (a.type === 'changes') {
					evaluateFieldChangesDataDisplay('incident_state', a);
					evaluateFieldChangesDataDisplay('impact', a);
					evaluateFieldChangesDataDisplay('opened_by', a);
					evaluateFieldChangesDataDisplay('priority', a);
			}
			if (
					(activeKeys.indexOf('incident_state') !== -1 ||
					 activeKeys.indexOf('impact') !== -1 ||
					 activeKeys.indexOf('opened_by') !== -1 ||
					 activeKeys.indexOf('priority') !== -1) &&
					 a.type === 'changes'
			) {
					return true;
			}
			if (activeKeys.indexOf('emails') !== -1 && a.type === 'email') {
					return true;
			}
			if (activeKeys.indexOf('attachments') !== -1 && a.element === 'attachment') {
					return true;
			}
			return false;
		});
	};
	c.hasVisibleChangeEntries = function(e) {
		/*if (e.change_entries)
  			return e.change_entries && e.change_entries.some(function(entry) {
    			return entry.show_in_ui !== false;
  		});*/ //commented as of now; will be taken up in Brazil
  		if (e.change_entries)
  		    return c.data.hasSummarizeSkill == 'true';
		else
			return true;
	};
	$document.on('click', documentClickHandler);

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

    $scope.getLiveProfileByUserId = function(userId) {
        return liveProfiles[userId];
    }

    var pending = {};

    //Little caching implementation to make sure we only get a given user's profile once.
    $scope.hasLiveProfile = function hasLiveProfile(userId) {
        if (!userId)
            return false;

        if (liveProfiles[userId])
            return true;

        if (pending[userId])
            return false;

        pending[userId] = $http.get('/api/now/live/profiles/sys_user.' + userId).then(function(response) {
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
            return word.substring(0, 1);
        }).join("");

        return (initials.length > 3) ? initials.substr(0, 3) : initials;
    }

    function setupAttachmentHandler() {
        $scope.attachmentHandler = new nowAttachmentHandler(attachSuccess, appendError);

        function attachSuccess() {
            $rootScope.$broadcast("sp.attachments.update", $scope.data.sys_id);
            spAriaUtil.sendLiveMessage($scope.data.attachAddedMsg);
        }

        function appendError(error) {
            spUtil.addErrorMessage(error.msg + error.fileName);
            $scope.errorMessages.push(error);
            spAriaUtil.sendLiveMessage(error.msg);
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
            recordWatcherTimer = $timeout(function processUpdate() {
                if (skipNextRecordWatchUpdate)
                    skipNextRecordWatchUpdate = false;
                else {
                    if ($scope.data.isPosting) {
                        recordWatcherTimer = $timeout(processUpdate, 250); // Re-schedule if still posting
                        return;
                    }
                    c.server.update().then(function(r) {
                        $scope.data.stream = r.stream;
                        $scope.data.mergedEntries = '';
                    });
                }
            }, 250);
        }
    });

    spUtil.recordWatch($scope, "sys_attachment", "table_sys_id=" + $scope.data.sys_id, function(response) {
        if (response && response.data) {
            if (response.data.changes && response.data.changes.length == 1 && response.data.changes[0] == "state") {
                updateAttachmentState($scope.data.table, $scope.data.sys_id);
            } else if (!$scope.data.isPosting) {
                c.server.update().then(function(r) {
                    $scope.data.stream = r.stream;
                    $scope.data.mergedEntries = '';
                });
            }
        }
    });

    $scope.$on('sp.show_location_icon', function(evt) {
        $scope.data.showLocationIcon = true;
    });

    $scope.$on('attachment.updated', function(evt, options) {
        if ($scope.data.sys_id != -1 && options.sys_id == $scope.data.sys_id)
            updateAttachmentState($scope.data.table, $scope.data.sys_id);
    });


    function updateAttachmentState(table, sys_id) {
        c.server.update().then(function(data) {
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

    $scope.scanAttachment = function(attachment) {
        snAttachmentHandler.scanAttachment(attachment);
    }

    $rootScope.$on('sp.sessions', function(evt, sessions) {
        $scope.typing = [];
        Object.keys(sessions).forEach(function(session) {
            var journalFields = $scope.data.stream.journal_fields;
            var canUserReadJournalField = false;
            session = sessions[session];

            for (var j = 0; j < journalFields.length; j++) {
                if (journalFields[j].name === session.field_type) {
                    canUserReadJournalField = journalFields[j].can_read;
                    break;
                }
            }

            if (session.status === 'typing' && canUserReadJournalField)
                $scope.typing.push(session);
            else
                return;

        })
    })

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

    function mergeStreamEntries() {
        $scope.placeholder = $scope.data.placeholderNoEntries;
        if (!$scope.data.stream || !$scope.data.stream.entries)
            return;
        $scope.placeholder = $scope.data.placeholder;
        $scope.data.rich_text_editor = (c.options.rich_text_editor == 'true');
        $scope.data.at_mentions = (c.options.at_mentions == 'true');
        unblockTheComments();
        var entries = $scope.data.stream.entries;
        if (!$scope.data.mergedEntries) {
            $scope.data.mergedEntries = $scope.data.stream.entries.slice();
            for (var i = 0; i < entries.length; i++) {
                if (entries[i].value)
                    entries[i].value = entries[i].value.replace(/\n/g, '<br/>');
                existingEntries[entries[i].sys_id] = true;
            }
            c.filteredActivities = $scope.data.mergedEntries.slice();
            return;
        }
        var mergedEntries = $scope.data.mergedEntries;
        for (var i = entries.length - 1; i >= 0; i--) {
            var curEntry = entries[i];
            if (isNewEntry(mergedEntries, curEntry)) {
                if (curEntry.value)
                    curEntry.value = curEntry.value.replace(/\n/g, '<br/>');
                mergedEntries.unshift(curEntry);
                existingEntries[curEntry.sys_id] = true;
            }
        }
        c.filteredActivities = mergedEntries.slice();
    }

    function isNewEntry(mergedEntries, item) {
        for (var i = 0; i < mergedEntries.length; i++) {
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

        colorCache = {"$$field_changes$$": "rgba(16,23,26,0.7)"};
        var jf = ($scope.data && $scope.data.stream && $scope.data.stream.journal_fields) || [];
        for (var i = 0; i < jf.length; i++) {
            colorCache[jf[i].name] = jf[i].color || defaultColor;
        }
        return $scope.getFieldColor(fieldName);
    }

    $scope.checkInLocation = function() {
        $rootScope.$broadcast("check_in_location");
        $rootScope.$broadcast("location.sharing.start");
    }

    $scope.$on("location.sharing.end", function() {
        $timeout(function() {
            $scope.msg = ""
        }, 500);
    })

    $scope.$on("location.sharing.start", function() {
        $scope.msg = $scope.data.sharingLocMsg;
        spAriaUtil.sendLiveMessage($scope.msg);
    })

    $scope.scanBarcode = function() {
        $rootScope.$broadcast("scan_barcode");
    }

    $scope.$on("attachment.upload.start", function() {
        $scope.data.isPosting = true;
        $scope.msg = $scope.data.uploadingAttachmentMsg;
        spAriaUtil.sendLiveMessage($scope.msg);
    })

    $scope.$on("attachment.upload.stop", function() {
        $scope.data.isPosting = false;
        $scope.msg = "";

        if (postLock)
            $scope.data.journalEntry = "";
    });

    $scope.data.isPosting = false;

    $scope.postEntry = function(input) {
        post(input);
    };

    function post(input) {
        if ($scope.data.isPosting)
            return;

        if (!input)
            return;

        var data = {};
        data["number"] = ($scope.data.number) ? $scope.data.number.value : '';
        data["isAddedByRequestor"] = ($scope.data.currentUserID === $scope.data.reqFor || $scope.data.currentUserID === $scope.data.openedBy);
        data["portal"] = $scope.data.portal;
        logAnalyticsEvent("SC_RITM_COMMENTS_ADD", data);

        input = input.trim();
        $scope.data.journalEntry = input;

        if ($scope.data.useSecondaryJournalField)
            $scope.data.journalEntryField = $scope.data.secondaryJournalField.name;
        else if ($scope.data.primaryJournalField)
            $scope.data.journalEntryField = $scope.data.primaryJournalField.name;
        $scope.data.isPosting = true;
        postLock = true;
        c.server.update().then(function() {
            $scope.data.isPosting = false;
            reset();
            //c.options always have the initial context of the options
            if (c.options.enter_key_behavior == "New line")
                $scope.data.enterKeyAddsNewLine = true;

            if (c.options.hideAttachmentBtn == 'true')
                $scope.data.hideAttachmentBtn = c.options.hideAttachmentBtn;

            if (c.options.showActivityNotesLabel == 'true')
                $scope.data.showActivityNotesLabel = c.options.showActivityNotesLabel;
            postLock = false;
            spAriaUtil.sendLiveMessage($scope.data.messagePostedMsg);
        });
        $timeout(function() {
            $scope.setFocus(); // sets focus back on input, defined in "link"
        });
        skipNextRecordWatchUpdate = true;
	}

    var reset = function() {
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
        $scope.$emit("record.typing", {
            status: status,
            value: input,
            table: $scope.data.table,
            sys_id: $scope.data.sys_id,
            field_type: field
        });
        $scope.updateFormWithJournalFields();
    }
    $scope.updateFormWithJournalFields = function() {
        var fieldName, fieldToClear = "";
        if ($scope.data.useSecondaryJournalField) {
            fieldName = $scope.data.secondaryJournalField.name;
            fieldToClear = $scope.data.primaryJournalField.name;
        } else {
            fieldName = $scope.data.primaryJournalField.name;
            fieldToClear = "";
        }
        $scope.$emit("activity_stream_is_changed", {
            "fieldName": fieldName,
            "fieldToClear": fieldToClear,
            "input": $scope.data.journalEntry
        });
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

    var unblockTheComments = function() {
        var activity = [];
        for (x in c.data.stream.entries) {
            parser = new DOMParser();
            xmlDoc = parser.parseFromString(c.data.stream.entries[x].value, "text/html");
            var blockCommentsList = xmlDoc.getElementsByClassName("bccmt");
            if (blockCommentsList.length > 0) {
                for (var j = 0; j < blockCommentsList.length; j++) {
                    var blockElementName = blockCommentsList[j].getElementsByClassName("bename");
                    var blockElementCTime = blockCommentsList[j].getElementsByClassName("bectime");
                    var blockElementCmt = blockCommentsList[j].getElementsByClassName("becmt");
                    for (var i = 0; i < blockElementName.length; i++) {
                        var blockStream = {
                            contains_code: "true",
                            element: "comments",
                            field_label: "Additional comments",
                            login_name: blockElementName[i].innerHTML,
                            name: blockElementName[i].innerHTML,
                            initials: buildInitials(blockElementName[i].innerHTML),
                            sys_created_on: blockElementCTime[i].innerHTML,
                            sys_created_on_adjusted: blockElementCTime[i].innerHTML,
                            sys_id: blockElementCmt[i].getAttribute("sysid"),
                            user_sys_id: blockElementName[i].getAttribute("usrid"),
                            value: blockElementCmt[i].innerHTML,
							type: 'journal'
                        };
                        activity.push(blockStream);
                    }
                }
            } else
                activity.push(c.data.stream.entries[x]);
        }
        c.data.stream.entries = timeSort(activity);
    }

    function timeSort(array) {
        array.sort(function(a, b) {
            var keyA = new Date(a.sys_created_on);
            var keyB = new Date(b.sys_created_on);
            if (keyA < keyB)
                return 1;
            else if (keyA > keyB)
                return -1;
            else
                return 0;
        })
        return array;
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

    function logAnalyticsEvent(name, data) {
        var payload = {
            "name": name,
            "data": data
        };
        snAnalytics.addEvent(payload);
    }

    $scope.seeAllText = function(e) {
        $http.get('/api/now/ui/stream_entry/full_entry?sysparm_sys_id=' + e.sys_id).then(function(response) {
            if (response.data && response.data.result)
                e.value = response.data.result;
            e.is_truncated = false;
        });
    }

    $scope.$on('$destroy', function () {
        $document.off('click', documentClickHandler);
    });

}

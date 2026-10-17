angular.module("sn.change_management.cab.agenda")
	.service("meetingAgenda", ['CAB', 'modelUtil', 'initialLoad', '$http', '$q', 'amb', 'filterFilter', '$timeout', '$rootScope', 'cabWatcher', 'runtimeState', function(CAB, modelUtil, initialLoad, $http, $q, amb, filterFilter, $timeout, $rootScope, cabWatcher, runtimeState) {
		
		var meetingAgenda = this;
		
		var mAd = []; // All requested agenda items
		var agendaItemIdx = {}; //agendaItem sysId: agendaItem
		// Structure: {agendaItemSysId: agendaItemObject, ...}
		
		var taskIdx = {};
		// Structure: {taskSysId: {task: taskObj, agendaItems: [agendaItemObj]}, ...}
		
		var nriState = [];  // Status of agenda items which have not been requested
		var nriStateIdx = {}; // index for above
		
		var mId = null; // Meeting Id
		var mIdReq = null; // Requested meeting Id. Prevents double requests if the REST takes a while.
		var defReq = null; // If we have a request in progress
		
		var taskForms = null;
		
		var rwMod = {"cab_agenda_item": {}, "task": {}};
		
		//.filter functions for non-requested item states
		var nriFilters = {
			"all": function(nriElem) {
				return true;
			},
			"pending": function(nriElem) {
				return nriElem.state === CAB.PENDING;
			},
			"complete": function (nriElem) {
				return nriElem.state === CAB.COMPLETE || nriElem.state === CAB.NO_DECISION;
			},
			"mine": function(nriElem) {
				if (nriElem.sysClassName === "change_request") {
					if (nriElem.assignment.requested_by === this.userId ||
						nriElem.assignment.assigned_to === this.userId ||
						nriElem.assignment.cab_delegate === this.userId)
						return true;
				} else if (nriElem.assignment.assigned_to === this.userId ||
							nriElem.assignment.opened_by === this.userId) {
					return true;
				}
			},
			"approved": function(nriElem) {
				var state = nriElem.state;
				var decision = nriElem.decision;
				return (state === CAB.COMPLETE || state === CAB.NO_DECISION) &&
					(decision === CAB.APPROVED || decision === CAB.PREAPPROVED);
			}
		};
		
		//.filter functions for agenda items
		var agendaItemFilters = {
			"all": function(agendaItem) {
				return true;
			},
			"pending": function(agendaItem) {
				return agendaItem.state.value === CAB.PENDING;
			},
			"complete": function(agendaItem) {
				return agendaItem.state.value === CAB.COMPLETE || agendaItem.state.value === CAB.NO_DECISION;
			},
			"mine": function(agendaItem) {
				if (!agendaItem.task || !agendaItem.task.record)
					return false;

				var task = agendaItem.task.record;
				
				if(task.sys_class_name.value === "change_request"){
					if (!task.requested_by && !task.assigned_to && !task.cab_delegate)
						return false;

					if (task.requested_by.value === this.userId ||
						task.assigned_to.value === this.userId ||
						task.cab_delegate.value === this.userId)
						return  true;
				} else {
					if (!task.opened_by && !task.assigned_to)
						return false;

					if (task.opened_by.value === this.userId ||
						task.assigned_to.value === this.userId) 
						return  true;
				}
				
			},
			"approved": function(agendaItem) {
				var state = agendaItem.state.value;
				var decision = agendaItem.decision.value;
				return (state === CAB.COMPLETE || state === CAB.NO_DECISION) &&
					(decision === CAB.APPROVED || decision === CAB.PREAPPROVED);
			},
		};
		
		//.map functions for nri or agenda items.
		var mapFunc = {
			"sysId": function(item) {
				if (typeof item.sysId === "string")
					return item.sysId;
				
				if(item.sys_id.value)
					return item.sys_id.value;
			}
		};
		
		var g_form = null;
		$rootScope.$on('spModel.gForm.initialized', function(e, gFormInstance) {
			g_form = gFormInstance;
		});
		
		function randomIntBetween(min, max) {
			min = Math.ceil(min);
			max = Math.floor(max);
			return Math.floor(Math.random() * (max - min + 1)) + min;
		}
		
		function clearAgenda() {
			mAd.length = 0; // Clears the array
		}
		
		function clearNRIState() {
			nriState.length = 0;
			nriStateIdx = {};
		}
		
		function buildNRIState(nri) {
			var nidx = {};
			
			nri.forEach(function(element, idx) {
				nidx[element.sysId] = {"idx": idx, "state": element};
			});
			nriState = nri;
			nriStateIdx = nidx;
		}
		
		/**
		 * Only remove from the non-requested items state
		 */
		function removeNRIState(agendaItemSysIds) {
			agendaItemSysIds = Array.isArray(agendaItemSysIds) ? agendaItemSysIds : [agendaItemSysIds];
			
			var ns = [];
			nriState.forEach(function(state) {
				if (agendaItemSysIds.indexOf(state.sysId) === -1) {
					ns.push(state);
					return;
				}
			});
			
			buildNRIState(ns);
		}
		
		/**
		 * Keep the underlying tasks fresh.
		 */
		function subscribeTaskWatcher() {
			cabWatcher.watch(mId)
			.subscribe(function (message) {
				// Ignore updates on CAB tables, only interested in tasks
				if ([CAB.AGENDA_ITEM, CAB.DEFINITION, CAB.MEETING, CAB.ATTENDEE,CAB.RUNTIME_STATE, "sysapproval_approver"]
					.indexOf(message.data.table_name) !== -1)
					return;
				
				rwMod.task = message;

				var operation = message.data.operation;
				var idxElem = taskIdx[message.data.sys_id];
					
				if (!idxElem) //Ignore update if we don't have it.
					return;

				// Deleting task records from the agenda items
				if (operation === "delete") {
					$rootScope.$applyAsync(function(scope) {
						idxElem.agendaItems.forEach(function(agendaItem) {
							agendaItem.task = {
								"value": "",
								"display_value": "",
								"record": null,
								"_form": null
							};
						});

						delete taskIdx[message.data.sys_id];
					});

					return;
				}

				// For anything else, update the existing task
				$rootScope.$applyAsync(function(scope) {
					modelUtil.patchObject(idxElem.task.record, message.data.record);
				});
				
				//Use the runtimeState to get the current agenda item being viewed

				// Get the agenda item which is currently being viewed
				var viewAgendaItemId = runtimeState.getViewAgendaItem();
				
				$rootScope.$applyAsync(function(scope) {
					idxElem.agendaItems.forEach(function(agendaItem) {
						if (agendaItem.sys_id.value === viewAgendaItemId)
								refreshFormDetailInView(agendaItem);
						
						// Refresh the form data so we don't lose the cab tabs
						agendaItem.task._form = populateFormData(agendaItem, true);
					});
				});
			});
		}
		
		/**
		 * Rebuilds the task and agenda item indexes
		 */
		function rebuildIndexes() {
			var tx = {};
			var aix = {};
			mAd.forEach(function(agendaItem) {
				aix[agendaItem.sys_id.value] = agendaItem;
				
				if (tx[agendaItem.task.value]) {
					agendaItem.task = tx[agendaItem.task.value].task; //Dedupe the task objects
					tx[agendaItem.task.value].agendaItems.push(agendaItem);
					return;
				}
				
				tx[agendaItem.task.value] = {
					"task": agendaItem.task,
					"agendaItems": [agendaItem]
				};
			});
			agendaItemIdx = aix;
			taskIdx = tx;
		}
		
		function clearIndexes() {
			agendaItemIdx = {};
			taskIdx = {};
		}
		
		/**
		 * Adds an agenda item to the index
		 */
		function indexItem(item) {
			// Already indexed.
			if (agendaItemIdx[item.sys_id.value])
				return;
			
			agendaItemIdx[item.sys_id.value] = item;
			
			var idxElem = taskIdx[item.task.value];
			if (!idxElem) {
				taskIdx[item.task.value] = {
					"task": item.task,
					"agendaItems": [item]
				};
				return;
			}
			
			item.task = idxElem.task;
			idxElem.agendaItems.push(item);
		}
		
		/**
		 * Removes an item from the index
		 */
		function removeIndex(item) {
			delete(agendaItemIdx[item.sys_id.value]);

			var idxElem = taskIdx[item.task.value];
			if (!idxElem)
				return;
			
			idxElem.agendaItems.some(function(agendaItem, idx, agendaItems) {
				if (item.sys_id.value === agendaItem.sys_id.value) {
					agendaItems.splice(idx, 1);
					return true;
				}
			});
			
			// Remove index element if there are no agendaItems left
			if (idxElem.agendaItems.length === 0)
				delete taskIdx[item.task.value];
		}

		/**
		 * Sort the agenda items array by the order value
		 */
		function sortAgendaItems() {
			mAd.sort(function(a,b) {
				return a.order.value - b.order.value;
			});
		}

		function populateFormData(agendaItem, refreshForm) {
			if (!refreshForm && (!agendaItem.task || !agendaItem.task.record || !agendaItem.task.record.sys_class_name || !agendaItem.task.record.sys_class_name.value))
				return;

			var generatedForm = refreshForm ? agendaItem.task._form : JSON.parse(JSON.stringify(taskForms[agendaItem.task.record.sys_class_name.value]));
			for (var fld in agendaItem.task.record) {
				if (generatedForm._fields.hasOwnProperty(fld)) {
					var fldValues = agendaItem.task.record[fld];
					//Check if the field is a dependent field
					if (generatedForm._fields[fld].hasOwnProperty("dependentField")) {
						var dep = generatedForm._fields[fld].dependentField;
						//Validate that the dependent field is valid, in the case that it is a combined field
						//like comments_and_work_notes
						if (agendaItem.task.record[dep]) {
							generatedForm._fields[fld].ed.dependent_value = agendaItem.task.record[dep].value;
							generatedForm._fields[fld].dependentValue = agendaItem.task.record[dep].value;
						}
					}
					generatedForm._fields[fld].displayValue = fldValues.display_value;
					generatedForm._fields[fld].value = (generatedForm._fields[fld].type === "glide_date_time") ? fldValues.display_value : fldValues.value;
				}
			}

			generatedForm.sys_id = agendaItem.task.value;
			generatedForm._attachmentGUID = agendaItem.task.value;
			generatedForm.displayValue = agendaItem.task.display_value;
			generatedForm.title = agendaItem.task.record.short_description.display_value;
			generatedForm.short_description = agendaItem.task.record.short_description.display_value;

			return generatedForm;
		}

		function refreshFormDetailInView(agendaItem) {
			Object.keys(agendaItem.task._form._fields).forEach(function(fieldName) {
				if (!agendaItem.task.record[fieldName])
					return;
				if (agendaItem.task._form._fields[fieldName].type === "glide_date_time")
					g_form.$private.fieldState.applyTemplateValue(fieldName, agendaItem.task.record[fieldName].display_value, agendaItem.task.record[fieldName].display_value);
				else {
					if (agendaItem.task._form._fields[fieldName].type === "choice" && agendaItem.task._form._fields[fieldName].value && agendaItem.task._form._fields[fieldName].choices) {
						var choiceFound = agendaItem.task._form._fields[fieldName].choices.some(function(element) {
							return element.value == agendaItem.task.record[fieldName].value;
						});
						if (!choiceFound) {
							agendaItem.task._form._fields[fieldName].choices.push({
								label: agendaItem.task.record[fieldName].display_value,
								value: agendaItem.task.record[fieldName].value
							});
						}
					}
					g_form.$private.fieldState.applyTemplateValue(fieldName, agendaItem.task.record[fieldName].value, agendaItem.task.record[fieldName].display_value);
				}
			});
			g_form.$private.userState.clearModifiedFields();
			g_form.$private.events.stateChange("unmodified");
		}

		// Adds an agenda item model or array of models to the agenda
		function addAgendaItem(toAdd) {
			if (!toAdd)
				return;

			var agendaItems = Array.isArray(toAdd) ? toAdd : [toAdd];

			var responseItemIds = [];
			agendaItems.forEach(function(agendaItem) {
				responseItemIds.push(agendaItem.sys_id.value);
				// If we already have the agenda item
				if (agendaItemIdx[agendaItem.sys_id.value])
					return;
				
				modelUtil.addValueMSToAll(agendaItem);
				modelUtil.glideListToArray(agendaItem.notification_recipients);
				
				var unknownTask = !taskIdx[agendaItem.task.value];
				if (unknownTask)
					modelUtil.addValueMSToAll(agendaItem.task.record);

				//Populate the _form section with record data
				agendaItem.task._form = populateFormData(agendaItem);

				mAd.push(agendaItem);
				indexItem(agendaItem);
			});
			
			//Remove the response items from the non-requested item state
			removeNRIState(responseItemIds);

			sortAgendaItems();
		}
		
		function subscribeAgendaWatcher() {
			cabWatcher.watch(mId)
			.subscribe(function(message) {
				if (message.data.table_name !== CAB.AGENDA_ITEM)
					return;
				
				rwMod.cab_agenda_item = message;
				
				$rootScope.$applyAsync(function(scope) {
					var operation = message.data.operation;
					var sysId = message.data.sys_id;
				
					if (operation === "delete") {
						if (agendaItemIdx[sysId]) {					
							mAd.some(function(agendaItem, idx) {
								if (agendaItem.sys_id.value === sysId) {
									// Update the indexes.
									var removedItem = mAd.splice(idx, 1)[0];
									removeIndex(removedItem);
									return true;
								}
							});
						} else
							removeNRIState(sysId);
					
						return;
					}
				
					if (operation === "insert") {
						// Push sys_ids onto an array and add a timeout in-case of list updates in the UI.
						$http.get(CAB.SERVICE.AGENDA_ITEM + sysId).then(function(response) {
							addAgendaItem(response.data.result);
						},
						modelUtil.failNicely);
						return;
					}
				
					//Check if we already have the item
					var agendaItem = agendaItemIdx[sysId];
					var changedFields = message.data.changes;
				
					// If we have the item, modify it
					if (agendaItem) {
						var taskChange = changedFields.indexOf("task") !== -1;
						if (taskChange)
							removeIndex(agendaItem);

						modelUtil.patchObject(agendaItem, message.data.record);
						modelUtil.addValueMSToAll(agendaItem);
				
						if (changedFields.indexOf("notification_recipients") != -1)
							modelUtil.glideListToArray(agendaItem.notification_recipients);
					
						if (taskChange)
							indexItem(agendaItem);
					
						// If there was a change to the ordering, sort the agenda	
						if (changedFields.indexOf("order") !== -1)
							sortAgendaItems();
					
						return;
					}
				
					// Update the nriState for items we don't have
					var nriState = nriStateIdx[sysId];
					if (nriState &&
						(changedFields.indexOf("order") !== -1 ||
						 changedFields.indexOf("assigned_to") !== -1 ||
						 changedFields.indexOf("requested_by" !== -1) ||
						 changedFields.indexOf("cab_delegate" !== -1) ||
						 changedFields.indexOf("state") !== -1 ||
						 changedFields.indexOf("decision") !== -1)
					){
						var recDelta = message.data.record;
						if (recDelta.order) {
							nriState.order = parseInt(recDelta.order.value);	
					
							//Sort and rebuild index there is an order change
							nriState.sort(function(a,b) {
								return a.order - b.order;
							});
						
							buildNRIState(nriState);
						}
					
						["state","decision"].forEach(function(fieldName) {
							if (recDelta[fieldName])
								nriState[fieldName] = recDelta[fieldName].value;
						});
					
						["assigned_to", "requested_by", "cab_delegate"].forEach(function(fieldName){
							if (recDelta[fieldName])
								nriState.assignment[fieldName] = recDelta[fieldName].value;
						});

					}
					// In all other cases, ignore the change
				});
			});
		}

		// API
		/**
		 * Common agenda item .map filters
		 */
		meetingAgenda.agendaItemFilters = agendaItemFilters;
		
		/**
		 * Returns the specific agenda item from the current agenda
		 * specified by agendaItemId
		 */
		meetingAgenda.getAgendaItem = function(agendaItemId) {
			if (agendaItemIdx[agendaItemId])
				return $q.resolve(agendaItemIdx[agendaItemId]);
			
			// Return the promise from the http request.
			return $http.get(CAB.SERVICE.AGENDA_ITEM + agendaItemId).then(function(response) {
				addAgendaItem(response.data.result);
				return agendaItemIdx[agendaItemId];
			});
		};

		/**
		 * Checks if there are earlier non-requested items in the agenda
		 * filter: the filter to use
		 * userId: the User's sys_id
		 * limit: The number of items to check for gaps/earlier entries
		 */
		meetingAgenda.hasEarlier = function(filter, userId, limit) {
			limit = !limit || limit < 1 ? mAd.length + nriState.length : limit; 
			filter = CAB.VALID_FILTERS.indexOf(filter) !== -1 ? filter : CAB.ALL;
			
			var nrItemStates = nriState.filter(nriFilters[filter], { "userId": userId });
			if (nrItemStates.length === 0)
				return false;
			
			var reqItems = mAd.filter(agendaItemFilters[filter], { "userId":  userId });
			if (reqItems.length === 0)
				return true;
			
			var hasEarlier = false;
			var nrItemState = nrItemStates[0];
			for (var limitCount = 0; limitCount < limit && limitCount < reqItems.length; limitCount++) {
				var agendaItem = reqItems[limitCount];
				
				var nriOrder = isNaN(nrItemState.order) ? 0 : nrItemState.order;
				if (nriOrder < parseInt(agendaItem.order.value))
					return true;
			}
			
			return false;
		};
		
		/**
		 * Counts the number of agenda items loaded for the given filter
		 */
		meetingAgenda.countLoadedItems = function(filter, userId) {
			filter = CAB.VALID_FILTERS.indexOf(filter) !== -1 ? filter : CAB.ALL;
			var filterEnv = {"userId": userId};
			return mAd.filter(agendaItemFilters[filter], filterEnv).length;
		};
		
		/**
		 * Checks the nriState for unrequested items of the given filter
		 */
		meetingAgenda.hasMoreToRequest = function(filter, userId) {
			filter = CAB.VALID_FILTERS.indexOf(filter) !== -1 ? filter : CAB.ALL;
			var filterEnv = {"userId": userId};
			return nriState.filter(nriFilters[filter], filterEnv).length > 0;
		};

		/**
		 * Requests more of the given filter if there are unrequested items
		 */
		meetingAgenda.requestMore = function(filter, userId) {
			filter = CAB.VALID_FILTERS.indexOf(filter) !== -1 ? filter : CAB.ALL;
			
			// .map makes simple code but probably not that efficient
			var requestItems = nriState
								.filter(nriFilters[filter], {"userId": userId})
								.map(mapFunc.sysId);
			
			if (requestItems.length === 0)
				return $q.reject("No more agenda items for filter: " + filter);
			
			var reqSize = randomIntBetween(CAB.AGENDA.REQUEST_LIMIT - CAB.AGENDA.REQUEST_SKEW, CAB.AGENDA.REQUEST_LIMIT);
			
			// Limit to the skewed request size
			if (requestItems.length > reqSize)
				requestItems = requestItems.splice(0, reqSize);
			
			return $http.post(CAB.SERVICE.AGENDA_ITEM.slice(0, -1),{
				"agendaItemIds": requestItems
			})
			.then(function(response) {
				addAgendaItem(response.data.result);
			});
		};
	
		/**
		 * Checks if there are any more pending agenda items
		 */
		meetingAgenda.hasMorePending = function() {
			var hasMorePending = false;
			mAd.some(function(agendaItem) {
				if (agendaItem.state.value === CAB.PENDING) {
					hasMorePending = true;
					return true;
				}
			});
			
			if (hasMorePending)
				return hasMorePending;

			nriState.some(function(stateItem) {
				if (stateItem.state === CAB.PENDING) {
					hasMorePending = true;
					return true;
				}
			});
			
			return hasMorePending;
		};
		
		/**
		 * Returns the next pending the agenda item if there is one
		 * Returns a promise now as we may have to request the next item is we don't have one.
		 */
		meetingAgenda.getNextPendingAgendaItem = function() {
			function requestAgendaItem(agendaItemId) {
				return $http.get(CAB.SERVICE.AGENDA_ITEM + agendaItemId).then(function(response) {
					addAgendaItem(response.data.result);
					return agendaItemIdx[agendaItemId];
				});
			}

			var raiPend = null;
			mAd.some(function(agendaItem) {
				if (agendaItem.state.value === CAB.PENDING) {
					raiPend = agendaItem;
					return true;
				}
			});
			
			var nraiPend = null;
			nriState.some(function(stateItem) {
				if (stateItem.state === CAB.PENDING) {
					nraiPend = stateItem;
					return true;
				}
			});
			
			if (!raiPend && !nraiPend)
				return $q.reject("No next pending agenda item");
			
			if (raiPend && !nraiPend)
				return $q.resolve(raiPend);
			
			if (!raiPend && nraiPend)
				return requestAgendaItem(nraiPend.sysId);
			
			var raiPendOrder = isNaN(parseInt(raiPend.order.value)) ? 0 : parseInt(raiPend.order.value);
			var nraiPendOrder = isNaN(parseInt(nraiPend.order)) ? 0 : parseInt(nraiPend.order);
			if (raiPendOrder > nraiPendOrder)
				return requestAgendaItem(nraiPend.sysId);

			// default resolve to the agenda item we have
			return $q.resolve(raiPend);
		};
				
		/**
		 * Promote the selected agenda item to top of the pending list
		 */
		meetingAgenda.promoteItem = function(agendaItem) {
			if (!agendaItem)
				return $q.reject("No agenda item provided to promoteItem");

			return $http.post("/api/sn_change_cab/cab/agenda/item/" + agendaItem.sys_id.value + "/promote").then(null, modelUtil.failNicely);
		};

		/**
		 * Move an agenda item to the pending list. This action is valid only for agenda items which state is no_decision
		 */
		meetingAgenda.moveItemToPending = function(agendaItem) {
			if (!agendaItem)
				return $q.reject("No agenda item provided to moveItemToPending");
			
			return $http.post("/api/sn_change_cab/cab/agenda/item/" + agendaItem.sys_id.value + "/pending").then(null, modelUtil.failNicely);
		};

		// LIFECYCLE --------------
		meetingAgenda.cleanup = function() {
			// cleanup code.
			mId = null;
			mIdReq = null;
			defReq = null;
			clearIndexes();
			clearAgenda();
			clearNRIState();
		};

		/**
		 * Initialises the meeting agenda
		 */
		function init(meetingSysId) {
			if (!meetingSysId || !modelUtil.isValidSysID(meetingSysId))
				return $q.reject("Invalid meetingId");

			mIdReq = meetingSysId;
			var deferred = defReq || $q.defer(); //Check for placeholder
			defReq = deferred;
			
			initialLoad.agenda(meetingSysId)
			.then(function(response) {
				mId = mIdReq;
				mIdReq = null;
				defReq = null;
				taskForms = response.data.result.taskForms;
				buildNRIState(response.data.result.nriState);
				addAgendaItem(response.data.result.agenda);
				subscribeAgendaWatcher();
				subscribeTaskWatcher();
				deferred.resolve(mAd);
			}, function(response) {
				modelUtil.failNicely(response);
				mIdReq = null;
				defReq = null;
				deferred.reject(response);
			});

			return deferred.promise;
		}

		/**
		 * Gets the agenda for the meeting meetingSysId
		 */
		meetingAgenda.get = function(meetingSysId) {
			// If there's nothing to go on, wait until there is
			if (!meetingSysId && !mId && !defReq) {
				// Create the placeholder deferred request.
				defReq = $q.defer();
				return defReq.promise;
			}

			// If we don't have a meeting sysId but we're waiting for one
			if (!meetingSysId && !mIdReq && defReq)
				return defReq.promise;
			
			// If meeting info has been requested
			if ((!meetingSysId || meetingSysId === mIdReq) && defReq)
				return defReq.promise;
			
			// If we already have a meeting
			if ((meetingSysId === mId) || (!meetingSysId && mId))
				return $q.resolve(mAd);
			
			// Init if we have a meeting id
			if (meetingSysId)
				return init(meetingSysId);
			
			//Default reject
			return $q.reject();
		};
		
		meetingAgenda.getRWMod = function() {
			return rwMod;
		};
	}]);

function include({ imports }) {

    const { handleRemoveNotifications } = imports['sn_cmdb_ws.CMDBWsDMTaskUtil']();
    const { DM_POLICY_TYPE_IDS } = imports['sn_cmdb_ws.cmdbWSCommonUtil']();
    const DATA_MANAGER_USER_ROLE_ID = 'c627309e53722010af64ddeeff7b1232';
    const {
        ERROR_NOTIFICATION_PROPS,
        SUCCESS_NOTIFICATION_PROPS
    } = imports["sn_cmdb_ws.CMDBWsNotificationUtil"]();
    const SYS_RELATIONSHIP_DEFINITION = {
        ATTESTED: {
            label: "Attested",
            value: "REL:5d70c2937785011023651605bc5a99e0"
        },
        REJECTED: {
            label: "Rejected",
            value: "REL:158106d37785011023651605bc5a99af"
        },
        NOT_YET_REVIEWED: {
            label: "Not Yet Reviewed",
            value: "REL:54dba1937745011023651605bc5a9917",
        }
    };

    const ATTESTATION_ACTION = {
            ATTEST: 'attest',
            UNATTEST: 'unattest',
            REJECT: 'reject',
            DUPLICATE: 'duplicate',
            EXCLUDE: 'exclude'
    }

    const ERROR_MESSAGES = {
		UNAUTHORIZED : {
			error : {
				code: 'UNAUTHORIZED',
				message: 'This task is not assigned to you.'
			}
		},
		INVALID_ACTION : {
			error: {
                code: 'INVALID_ACTION',
                message: 'Invalid attestation action'
            }
		},
		INVALID_INPUT : {
			error: {
                code: 'INVALID_INPUT',
                message: 'At least one CI sysId required.'
            }
		},
		DUPLICATE_MINIMUM: {
			error: {
				code: 'DUPLICATE_NEEDS_TWO_MINIMUM',
				message: 'Cannot create a duplicate task with just 1 CI. Must select at least 2.'
			}
		},
		MULTIPLE_IRE_RULES: {
			error: {
				code: 'MULTIPLE_IRE_RULES',
				message: 'Cannot create a duplicate task for CIs with multiple IRE rules.'
			}
		},
		DUPLICATE_TASK_FAILED : {
			error: {
				code: 'DUPLICATE_TASK_FAILED',
				message: 'Failed to create Remediate Duplicate Task.'
			}
		}
	};

    const TASK_STATE = {
         OPEN : "1",
         WORK_IN_PROGRESS : "2",
         CLOSED_COMPLETE : "3"
   };

    const UI_DEFAULT_LIMIT = {
         ATTEST_RECORDS: 100
   };

    var _getReassignOptions = async function(translate, isAssignedToCurrentUser, isAdmin, assignmentGroupSysId) {
        const reassignTxt = await translate('Reassign');
        let moreOptionsTxt = '';
        let options = [];
        if (isAdmin || !!assignmentGroupSysId) {
            options.push({
                id: 'assign_to_other',
                label: reassignTxt
            });
        }
        if (!isAssignedToCurrentUser) {
            options.push({
                id: 'assign_to_me',
                label: await translate('Assign to me')
            });
        }
       options.push({
            id: 'send_to_admin',
            label: await translate('Request reassignment')
       });
    const primaryOption = options.shift();
    let reassignOptions = {
        primaryLabel: primaryOption.label,
        primaryId: primaryOption.id
    };
    if (!options) {
        reassignOptions = {
             ...reassignOptions,
             ariaConfig: {
                  "aria-label": primaryOption.label
             },
             tooltipLabel: primaryOption.label
        }
    } else {
        moreOptionsTxt = await translate('More reassignment options');
        reassignOptions = {
             ...reassignOptions,
            listItems: options,
            ariaConfig: {
                  action: { "aria-label": primaryOption.label },
                  trigger: { "aria-label": moreOptionsTxt }
             },
            tooltipConfig: {
                  action: primaryOption.label,
                  trigger: moreOptionsTxt
            }
        }
   }

        return reassignOptions;
    }

    var _handleAssignToMe = function(currentAssignee, api, openModal) {
        if (currentAssignee === null) {
            api.data.update_task_assignment.execute({
                sysIds: [api.context.props.sysId],
                assignee: api.context.session.user.sys_id
            });
        } else {
            api.setState('reassignmentData', {
                'assignee': api.context.session.user.sys_id
            });
            openModal('reassign_confirm_modal');
        }
    }

    var _handleAssignToOther = function(viewportId, isAdmin, assignmentGroupSysId, emit, openModal) {
        let viewportConfig = {
            viewportElementId: viewportId,
            route: 'assign-to-other',
            fields: {
                userTable: isAdmin ? 'sys_user_has_role' : 'sys_user_grmember',
                isAdmin: isAdmin,
                assignmentGroupSysId: assignmentGroupSysId || '-1',
                timestamp: Date.now()
            }, 
        }
        setViewportContent(viewportConfig, emit);
        openModal('assign_to_other_modal', { bare: true });
    }

    var _handleSendToAdmin = function(viewportId, emit, openModal) {
        let viewportConfig = {
            viewportElementId: viewportId,
            route: 'send-to-admin',
            fields: {
                timestamp: Date.now()
            }
        }
        setViewportContent(viewportConfig, emit);
        openModal('send_to_admin_modal', { bare: true });
    }

    var _handleAssignmentModalPayload = function(event, isTaskAssigned, api, openModal) {
        let assignmentObj = {
            ...(event.payload.comments !== null && {comments: event.payload.comments})
        };
        if (event.name === 'ASSIGN_TO_OTHER#PRIMARY_ACTION') {
            assignmentObj.assignee = event.payload.assigneeSysId;
            if (event.payload.assignmentGroupSysId) {
                assignmentObj.assignmentGroup = event.payload.assignmentGroupSysId;
            }
        } else if (event.name === 'SEND_TO_ADMIN#PRIMARY_ACTION') {
            assignmentObj.assignee = '';
            assignmentObj.assignmentGroup = '';
        }
        if (!isTaskAssigned) {
            //just do the assignment
            api.data.update_task_assignment.execute({
                sysIds: [api.context.props.sysId],
                ...assignmentObj
            });
        } else {
            //save the data, trigger the confirm modal
            api.setState('reassignmentData', assignmentObj);
            openModal('reassign_confirm_modal');
        }
    }

    var _handleReassignToMeSuccess = async function(emit, translate, helpers, policyTypeId) {
        const notificationId = 'assignToMeSuccess' + new Date().valueOf();
        var messageContent = policyTypeId == DM_POLICY_TYPE_IDS.NON_LIFECYCLE.ATTESTATION ? await translate("CIs ready for attestation.") : await translate("Records ready for review.");
        emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: notificationId,
                status: "positive",
                header: await translate("Task reassigned to you."),
                icon: "info-circle-outline",
                content: messageContent,
                action: {
                    type: "dismiss"
                }
            }]
        });
        handleRemoveNotifications(emit, notificationId, helpers);
    }

    var _handleReassignToOtherSuccess = async function(viewportId, emit, translate, openModal) {
        let viewportConfig = {
            viewportElementId: viewportId,
            route: 'reassign-success',
            fields: {
                header: await translate("Task reassigned"),
                message: await translate("Task is now available for their review")
            }
        }
        setViewportContent(viewportConfig, emit);
        openModal('reassign_success_modal', {
            bare: true
        });
    }

    var _handleSendToAdminSuccess = async function(viewportId, emit, translate, openModal) {
        let viewportConfig = {
            viewportElementId: viewportId,
            route: 'reassign-success',
            fields: {
                header: await translate("Task Sent for Reassignment"),
                message: await translate("Task has been sent to administration team for reassignment.")
            }
        }
        setViewportContent(viewportConfig, emit);
        openModal('reassign_success_modal', {
            bare: true
        });
    }

   var _emitErrorNotification = async function(error,emit,translate,helpers) {
         const notifications = [];
         const notificationId = 'errorId' + new Date().valueOf();
         var errorMessage = error.message;
         if(!errorMessage) {
              errorMessage = "invalid error";
         }
         notifications.push({
             ...ERROR_NOTIFICATION_PROPS,
              "content": await translate("{0}", errorMessage),
              "id": notificationId 
        });
        emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
            items: notifications
        });
       handleRemoveNotifications(emit,notificationId,helpers);
   }

    var _handleSubmitTaskSuccess = async function(viewportId, taskSummaryObj, emit, translate, openModal) {
        let viewportConfig = {
            viewportElementId: viewportId,
            route: 'submit-task-success',
            fields: {
                taskSummaryObj: taskSummaryObj
            }
        }
        setViewportContent(viewportConfig, emit);
        openModal('submit_task_success_modal', {
            bare: true
        });
    }

    function setViewportContent(viewportConfig, emit) {
        emit('MACROPONENT_VIEWPORT_LOAD_REQUESTED', viewportConfig);
    }

    const getRelatedLists = function(data) {
        return data.related && data.related.lists ? data.related.lists: null;
   }

    const getFormFields = function(data) {
         return data.form && data.form.fields ? data.form.fields : null;
    }

    const SR_CONTROLLER_OUTPUT_FIELDS = {
          RELATED_LIST: 'related',
          FORM: 'form'
    }

    var _handleAttestationNotification = async function(response, hasCmdbEditor, hasAdminOrMaint, api, event, helpers) {
        const {
                error,
                action,
                successCount,
                failureCount,
                deDupeTaskNumber,
                deDupeUrl
            } = response.result;

            const notifications = [];

            if (error && error.message) {
                notifications.push({
                    ...ERROR_NOTIFICATION_PROPS,
                    "content": await helpers.translate("Error - {0}", error.message)
                });
            }
            if (successCount > 0) {
                let messageContent = '';
                let txtLinkProp = {};
                if (action === 'attest') {
                    messageContent = successCount > 1 ?
                        await helpers.translate("{0} CIs attested", successCount) :
                        await helpers.translate("{0} CI attested", successCount);
                } else if (action === 'reject') {
                    messageContent = successCount > 1 ?
                        await helpers.translate("{0} CIs rejected", successCount) :
                        await helpers.translate("{0} CI rejected", successCount);
                } else if (action === 'unattest') {
                    messageContent = successCount > 1 ?
                        await helpers.translate("{0} CIs unattested", successCount) :
                        await helpers.translate("{0} CI unattested", successCount);
                } else if (action === 'exclude') {
                    messageContent = successCount > 1 ?
                        await helpers.translate("{0} CIs excluded", successCount) :
                        await helpers.translate("{0} CI excluded", successCount);
                } else if (action === 'duplicate') {
                    var deDupeNumberDisplay = "";
                    if (deDupeTaskNumber && deDupeUrl) {
                        if (hasCmdbEditor(api.context.session.user.roles) || hasAdminOrMaint(api.context.session.user.roles)) {
                            txtLinkProp = {
                                "label": deDupeTaskNumber,
                                "href": deDupeUrl
                            };
                        } else {
                            deDupeNumberDisplay = deDupeTaskNumber;
                        }
                    }
                    messageContent = successCount > 1 ?
                        await helpers.translate("{0} CIs removed from task. De-duplication task created {1}", successCount, deDupeNumberDisplay) :
                        await helpers.translate("{0} CI removed from task. De-duplication task created {1}", successCount, deDupeNumberDisplay);

                    if (deDupeTaskNumber && deDupeUrl) {
                        txtLinkProp = {
                            "label": deDupeTaskNumber,
                            "href": deDupeUrl
                        };
                    }
                }
                const notificationId = 'successId' + new Date().valueOf();
                notifications.push({
                    ...SUCCESS_NOTIFICATION_PROPS,
                    "content": messageContent,
                    "textLinkProps": txtLinkProp,
                    "id": notificationId
                });
            }
            if (failureCount > 0) {
                notifications.push({
                    ...ERROR_NOTIFICATION_PROPS,
                    "content": await helpers.translate("Unable to update {0} CIs", failureCount)
                });
            };
            if (notifications.length > 0) {
                api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                    items: notifications
                });
            }

            if (notifications.length > 0) {
                notifications.forEach(item => {
                    handleRemoveNotifications(api.emit, item.id, helpers);
                });
            }
   }

    var _setDonutProgress = function(api, event, helpers) {
         const taskId = api.context.props.sysId;
         const MAX_NUMBER_OF_GROUPS = 10;
         const NUMBER_OF_GROUPS_BASED_ON = "NO_OF_GROUP_BASED_ON_PER_METRIC";

        const progressDonutConfig = {};
        progressDonutConfig.dataSource = [{
            "allowRealTime": true,
            "label": "Progress",
            "sourceType": "table",
            "tableOrViewName": "sn_cmdb_ws_attestation_task_to_ci",
            "filterQuery": "cmdb_data_management_task=" + taskId,
            "reportSourceSysId": null,
            "id": "sn_cmdb_ws_attestation_task_to_ci_" + taskId
        }];

        progressDonutConfig.metrics = [{
            "dataSource": "sn_cmdb_ws_attestation_task_to_ci_" + taskId,
            "id": "sn_cmdb_ws_attestation_task_to_ci_" + new Date().valueOf(),
            "label": "Items",
            "aggregateFunction": "COUNT",
            "numberFormat": {
                "customFormat": false
            },
            "axisId": "primary"
        }];

        progressDonutConfig.groupBy = [{
            "maxNumberOfGroups": MAX_NUMBER_OF_GROUPS,
            "numberOfGroupsBasedOn": NUMBER_OF_GROUPS_BASED_ON,
            "showOthers": false,
            "groupBy": [{
                "dataSource": "sn_cmdb_ws_attestation_task_to_ci_" + taskId,
                "groupByField": "ci.attestation_status",
                "isPaBucket": false,
                "isRange": false
            }]
        }];

        api.setState('progressDonutConfig', progressDonutConfig);
    }

    return {
        SYS_RELATIONSHIP_DEFINITION,
        ERROR_MESSAGES,
        TASK_STATE,
        UI_DEFAULT_LIMIT,
        ATTESTATION_ACTION,
        getDecimalNumberWithGivenScale: function (number, scale) {
            return (number.indexOf(".") > -1) ? number.slice(0, (number.indexOf(".")) + scale) : number;
        },
        getReassignOptions: _getReassignOptions,
        handleAssignToMe: _handleAssignToMe,
        handleAssignToOther: _handleAssignToOther,
        handleSendToAdmin: _handleSendToAdmin,
        handleAssignmentModalPayload: _handleAssignmentModalPayload,
        handleReassignToMeSuccess: _handleReassignToMeSuccess,
        handleReassignToOtherSuccess: _handleReassignToOtherSuccess,
        handleSendToAdminSuccess: _handleSendToAdminSuccess,
        handleSubmitTaskSuccess: _handleSubmitTaskSuccess,
        emitErrorNotification : _emitErrorNotification,
        handleAttestationNotification: _handleAttestationNotification,
        setDonutProgress: _setDonutProgress,
        getRelatedLists,
        getFormFields,
        SR_CONTROLLER_OUTPUT_FIELDS
    }
}

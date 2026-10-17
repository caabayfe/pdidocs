var SNHelpSetupPlayerController = Class.create();
SNHelpSetupPlayerController.prototype = {
    initialize: function() {
        this.constants = new sn_ads_setup.SNHelpSetupConstantProvider();
        this.setupController = new sn_ads_setup.SNHelpSetupController();
        this.snHelpService = new global.SNHelpService();
        this.dbController = new global.SNHelpDBController('help_user_interaction');
        this.cancelRegex = /^(PENDING_CANCEL|CANCELLED)$/ig;
        this.recordAction = {
            CREATE: 'CREATE',
            UPDATE: 'UPDATE',
            DELETE: 'DELETE',
            NA: 'NA'
        };
        this.responseTypes = {
            'PARENT_RECORD': {
                type: 'PARENT_RECORD',
                status: 200,
                value: '',
                message: '',
                status_updates: {}
            },
            'RECORD_NOT_EXIST': {
                type: 'RECORD_NOT_EXIST',
                status: 500,
                message: ''
            },
            'ERROR_MSG': {
                type: 'ERROR_MSG',
                status: 500
            }
        };
    },

    getLastPlaybook: function(parentRecord) {
        const playbooks = sn_playbook.PlaybookExperience.getPlaybooksForParentRecord(parentRecord);
        return playbooks && playbooks.length && playbooks[playbooks.length - 1];
    },

    getLastPlaybookSysIdAndCheckStatusIsCancelled: function(parentRecord) {
        const playbook = this.getLastPlaybook(parentRecord);
        const playbookStatus = playbook.state.value;
        const isPlaybookCancelled = /^(PENDING_CANCEL|CANCELLED)$/ig.test(playbookStatus);
        return {
            contextSysId: playbook.sys_id,
            isPlaybookCancelled
        };
    },

    getLatestPlaybookContextStatus: function(interactionSysId) {
        const spc = new GlideRecordSecure('sys_pd_context');
        spc.addQuery('input_record', interactionSysId);
        spc.orderByDesc('sys_created_on');
        this.snHelpService.queryNoDomain(spc);
        if (spc.next()) {
            return spc.getValue('state');
        }
        return null;
    },

    cancelGuidedSetup: function(parentRecord) {
        sn_playbook.PlaybookExperience.cancelPlaybooksByParentRecord(parentRecord, 'Republishing the process');
    },

    triggerPlaybook: function(processId, parentRecord) {
        let scopeName = "";
        const gr = new GlideRecordSecure('sys_pd_process_definition');
        if (gr.get(processId)) {
            scopeName = gr.sys_scope.scope + '.' + gr.name;
        } else {
            gs.warn('sys_pd_process_definition record not found for processId: ' + processId);
        }
        var playbookExecution = sn_playbook.PlaybookExperience.triggerPlaybook(scopeName, parentRecord);
        return playbookExecution;

    },

    // It updates parent record to let playbook generate fresh contextId
    resetStatus: function(guidanceId, interactionId) {
        const {
            SINGLE,
            MULTIPLE
        } = this.constants.executionTypes;
        const {
            IN_PROGRESS,
            ABANDONED
        } = this.constants.status;
        const {
            configure_products_list,
            in_progress_setup_view,
            guidance_snapshot_view
        } = this.constants.views;
        const {
            guidance,
            user_interaction
        } = this.constants.tables;
        const {
            DELETE,
            UPDATE,
            NA
        } = this.recordAction;
        const {
            PARENT_RECORD,
            RECORD_NOT_EXIST,
            ERROR_MSG
        } = this.responseTypes;

        let response = {};
        const huiView = new GlideRecordSecure(this.constants.views.configure_products_list);
        huiView.addEncodedQuery('hg_type=global_setup^hg_status=published');
        if (guidanceId) {
            huiView.addQuery('hg_sys_id', guidanceId);
        }
        if (interactionId) {
            huiView.addQuery('hui_sys_id', interactionId);
        }
        this.snHelpService.queryNoDomain(huiView);

        if (huiView.getRowCount()) {
            while (huiView.next()) {

                let snapShotId = '';
                const guidanceSysId = huiView.getValue('hg_sys_id');
                const interactionSysId = huiView.getValue('hui_sys_id');
                const setupName = huiView.getValue('hui_setup_name') || huiView.getValue('hg_product_name');
                const setupDescription = huiView.getValue('hui_description') || huiView.getValue('hg_description');
                const processId = huiView.getValue('hg_process_definition');
                const hgrExecutionType = huiView.getValue('hg_setup_execution_type') || SINGLE;
                const huiExecutionType = huiView.getValue('hui_setup_execution_type') || SINGLE;
                const guidance_snapshot = huiView.getValue('hui_guidance_snapshot') || '';
                const huiStatus = huiView.getValue('hui_status');

                let tempStatus = huiStatus;
                let canCancelPlaybook = false;
                let recordAction = NA;

                let interactionRes = {};
                if (interactionSysId) {

                    const snapShotView = new GlideRecordSecure(guidance_snapshot_view);
                    snapShotView.addQuery('hui_sys_id', interactionSysId);
                    snapShotView.orderByDesc('sps_sys_created_on');
                    this.snHelpService.queryNoDomain(snapShotView);

                    const snapShotCount = snapShotView.getRowCount();

                    if (snapShotCount && snapShotView.next()) {

                        snapShotId = snapShotView.getValue('sps_sys_id');
                        interactionRes = {
                            ...PARENT_RECORD,
                            value: interactionSysId,
                            guidance_snapshot,
                            pdSnapShot: snapShotId,
                            setupName,
                            setupDescription,
                            interactionSysId,
                            guidanceSysId
                        };

                        // When execution_type changed for guided setup.
                        if (huiExecutionType == MULTIPLE && hgrExecutionType == SINGLE && huiStatus != ABANDONED) {
                            // If Setup type changed from multiple to single, mark its executions status as abandoned.
                            tempStatus = ABANDONED;
                            canCancelPlaybook = true;
                        } else if (huiExecutionType == SINGLE && hgrExecutionType == MULTIPLE) {
                            // If setup type change from single to multiple, delete all existing interactions of single execution setup for all its domains.
                            recordAction = DELETE;
                            canCancelPlaybook = true;
                        } else if (
                            (huiExecutionType == MULTIPLE && hgrExecutionType == MULTIPLE && huiStatus == ABANDONED) ||
                            (!guidance_snapshot && snapShotCount > 1) ||
                            (guidance_snapshot !== snapShotId)
                        ) {
                            // For very first time when no snapshot present OR onwards when snapshots present 
                            // Some multi executions are again getting republished back to multiple after once they changed to single earlier.
                            // Mark all their executions as WIP.
                            canCancelPlaybook = true;
                            tempStatus = IN_PROGRESS;
                        }
                    }
                } else {
                    interactionRes = {
                        ...ERROR_MSG,
                        message: gs.getMessage('No parent record for given guidance')
                    };
                }

                if (interactionSysId && canCancelPlaybook) {

                    const interactionGr = new GlideRecord(user_interaction);
                    interactionGr.get('sys_id', interactionSysId);
                    let {
                        contextSysId,
                        isPlaybookCancelled
                    } = this.getLastPlaybookSysIdAndCheckStatusIsCancelled(interactionGr);

                    // Incase of abandoned, updating interaction record before cancelling playbook.
                    if (tempStatus == ABANDONED) {
                        recordAction = UPDATE;
                        interactionGr.status = tempStatus;
                        interactionGr.guidance_snapshot = snapShotId;
                        interactionGr.update();
                    }


                    if (canCancelPlaybook && !isPlaybookCancelled) {
                        try {
                            const contextStatus = this.getLatestPlaybookContextStatus(interactionSysId);
                            if (contextStatus) {
                                this.cancelGuidedSetup(interactionGr);
								this.triggerPlaybook(processId, interactionGr);
                            }
                        } catch (e) {
                            const errorMsg = `sn_ads_setup: Error occured while cancelling interaction ${interactionSysId},  ${setupName}: ${e.getMessage()}`;
                            gs.error(errorMsg);
                            interactionRes = {
                                ...interactionRes,
                                ERROR_MSG,
                                message: gs.getMessage('Error occured while cancelling interaction {0}', interactionSysId)
                            };
                        }
                    } else {
                        canCancelPlaybook = false;
                    }


                    if (recordAction == DELETE) {
                        interactionGr.deleteRecord();
                        interactionRes.deleted = true;
                    } else if (tempStatus != ABANDONED && (huiStatus !== tempStatus || guidance_snapshot !== snapShotId)) {
                        recordAction = UPDATE;
                        interactionGr.status = tempStatus;
                        interactionGr.guidance_snapshot = snapShotId;
                        interactionGr.update();
                    }
                }

                interactionRes = {
                    recordAction,
                    ...interactionRes,
                    huiStatus: tempStatus,
                    cancelPlaybook: canCancelPlaybook,
                };

                response[guidanceSysId] = {
                    ...response[guidanceSysId],
                    [interactionSysId]: interactionRes
                };
            }

            gs.info(`Guided setup interaction status reset response: ${JSON.stringify(response, null, 4)}`);

            return {
                status: 200,
                ...response
            };

        } else if (guidanceId || interactionId) {
            return {
                ...RECORD_NOT_EXIST,
                message: gs.getMessage('No record for given parameters')
            };
        } else {
            return {
                ...RECORD_NOT_EXIST,
                message: gs.getMessage('No guided setups')
            };
        }
    },

    createDomainSpecificRecord: function(guidanceId, domainId = 'global', params) {
        const interactionId = this.dbController.create(params);
        return interactionId;
    },

    throwError: function(msg) {
        const {
            ERROR_MSG
        } = this.responseTypes;
        return {
            ...ERROR_MSG,
            message: msg
        };
    },

    getInteractionDetails: function(guidanceId, interactionId) {

        var err = {
            NO_GUIDANCE_ID_PROVIDED: gs.getMessage('Please provide guidance id.'),
			GUIDANCE_IN_DRAFT: gs.getMessage('Given guided setup is in draft state.'),
            EMPTY_HUI_MULTI: gs.getMessage('Please provide interaction id for multi run guided setup.'),
            NO_HUI_FOR_SINGLE: gs.getMessage('Please remove interaction id from url for single run guided setup.'),
            INCORRECT_DOMAIN_HUI: gs.getMessage('Interaction ID doesn’t belong to the selected domain. Please verify the domain or create a new interaction.'),
            HUI_CREATION_FAILED: gs.getMessage('Failed while creating interaction record for this execution.'),
            // Called when either incorrect execution id passed  OR  interaction id belongs to other domain
            INCORRECT_HUI_MULTI: gs.getMessage('The provided Interaction ID does not exist for the selected Guided Setup.'),
            INCORRECT_GUIDANCE_ID: gs.getMessage('Invalid Guided Setup Id')
        };

        const {
            SINGLE,
            MULTIPLE
        } = this.constants.executionTypes;
        const {
            IN_PROGRESS,
            ABANDONED
        } = this.constants.status;
        const {
            configure_products_list,
            in_progress_setup_view
        } = this.constants.views;
        const {
            user_interaction
        } = this.constants.tables;
        const {
            CREATE,
            UPDATE
        } = this.recordAction;
        const {
            PARENT_RECORD,
            RECORD_NOT_EXIST,
            ERROR_MSG
        } = this.responseTypes;

        if (!guidanceId) {
            return this.throwError(err.NO_GUIDANCE_ID_PROVIDED);
        }

        var response = {};
        var domain = this.snHelpService.fetchDomain();

        var gr = new GlideRecord(in_progress_setup_view);
        gr.addQuery('hg_sys_id', guidanceId);
        if (interactionId) {
            gr.addQuery('hui_sys_id', interactionId);
        }
        gr.addQuery('hui_status', '!=', ABANDONED);
        this.snHelpService.queryNoDomain(gr);

        var recordCount = gr.getRowCount();

        var guidanceSysId, interactionSysId, setupName, setupDescription,
            setupCheckList, setupLayout, processId, huiStatus = IN_PROGRESS,
            hgrExecutionType, huiExecutionType, triggerPlaybook;

        var params = {
            guidance: guidanceId,
            active_setup_type: 'custom',
            status: IN_PROGRESS,
            sys_domain: domain
        };

        if (recordCount > 0) {
            var interactionRes = {};
            var isDone = false;

            while (gr.next()) {

                guidanceSysId = gr.getValue('hg_sys_id');
                setupCheckList = gr.getValue('hg_checklist');
                setupLayout = gr.getValue('hg_setup_layout') || 'focused_view';
                processId = gr.getValue('hg_process_definition');
                hgrExecutionType = gr.getValue('hg_setup_execution_type') || SINGLE;
                huiExecutionType = gr.getValue('hui_setup_execution_type') || SINGLE;
                var isSingleExecutionType = hgrExecutionType === SINGLE;
                //TODO: move setupName and setupDescription to generic function
                setupName = (isSingleExecutionType && gr.getDisplayValue('hg_name')) || gr.getDisplayValue('hui_setup_name');
                setupDescription = (isSingleExecutionType && gr.getDisplayValue('hg_description')) || gr.getDisplayValue('hui_description');
                huiStatus = gr.getValue('hui_status');

                triggerPlaybook = false;

                var domainMatched = domain === gr.getValue('hui_sys_domain');
                var recordSysId = gr.getValue('hui_sys_id');

                if (hgrExecutionType != huiExecutionType) continue;

                if (huiExecutionType == SINGLE) {
                    if (interactionId) {
                        return this.throwError(err.NO_HUI_FOR_SINGLE);
                    }

                    if (domainMatched) {
                        interactionSysId = recordSysId;
                        isDone = true;
                        break;

                    }
                } else if (huiExecutionType === MULTIPLE) {

                    if (!interactionId) {
                        return this.throwError(err.EMPTY_HUI_MULTI);
                    }

                    var recordSysIdMatched = interactionId === recordSysId;

                    if (recordSysIdMatched) {
                        isDone = true;

                        if (domainMatched) {
                            interactionSysId = recordSysId;
                            break;
                        } else {
                            return this.throwError(err.INCORRECT_DOMAIN_HUI);

                        }

                    }
                }
            }

            if (!isDone) {

                if (hgrExecutionType === SINGLE) {
                    params = {
                        ...params,
                        setup_name: setupName,
                        description: setupDescription
                    };
                    interactionSysId = this.createDomainSpecificRecord(guidanceId, domain, params);

                } else if (hgrExecutionType === MULTIPLE) {

                    if (!interactionId) {
                        return this.throwError(err.EMPTY_HUI_MULTI);
                    } else if (interactionId) {
                        return this.throwError(err.INCORRECT_HUI_MULTI);
                    }

                }
            } else if (isDone && interactionSysId) {
                const hui = new GlideRecord(user_interaction);
                hui.get('sys_id', interactionSysId);
                const contextStatus = this.getLatestPlaybookContextStatus(interactionSysId);
                if (contextStatus && this.cancelRegex.test(contextStatus)) {
                    this.triggerPlaybook(processId, hui);
                }
            }


        } else if (recordCount === 0) {
            var hg = new GlideRecord('help_guidance');
            hg.addQuery('sys_id', guidanceId);
            hg.query();

            if (hg.next()) {
				if (hg.status == 'draft') {
					return this.throwError(err.GUIDANCE_IN_DRAFT);
                }
                hgrExecutionType = hg.getValue('setup_execution_type') || SINGLE;
                setupName = hg.getValue('name');
                setupDescription = hg.getValue('description');
            } else {
                return this.throwError(err.INCORRECT_GUIDANCE_ID);
            }

            if (hgrExecutionType === SINGLE) {
                if (interactionId) return this.throwError(err.NO_HUI_FOR_SINGLE);

                params = {
                    ...params,
                    setup_name: setupName,
                    description: setupDescription
                };

                interactionSysId = this.createDomainSpecificRecord(guidanceId, domain, params);

            } else if (hgrExecutionType === MULTIPLE) {
                if (!interactionId) {
                    return this.throwError(err.EMPTY_HUI_MULTI);
                } else {
                    return this.throwError(err.INCORRECT_HUI_MULTI);
                }
            }
        }

        if (!interactionSysId) {
            return this.throwError(err.HUI_CREATION_FAILED);
        }

        interactionRes = {
            ...PARENT_RECORD,
            setupName,
            setupDescription,
            setupCheckList,
            setupLayout,
            interactionSysId,
            guidanceSysId,
            huiStatus
        };
        response = interactionRes;
        return response;
    },

    getInteractionStatus: function(guidanceId) {

        const statusObj = {
            COMPLETE: 'COMPLETE',
            IN_PROGRESS: "IN_PROGRESS",
            NOT_STARTED: 'NOT_STARTED'
        };

        const {
            configure_products_list,
            in_progress_setup_view
        } = this.constants.views;

        const {
            SINGLE,
            MULTIPLE
        } = this.constants.executionTypes;

        const {
            IN_PROGRESS,
            ABANDONED
        } = this.constants.status;

        var domain = this.snHelpService.fetchDomain();
        const huiView = new GlideRecordSecure(in_progress_setup_view);
        huiView.addEncodedQuery('hg_type=global_setup');
        huiView.addQuery('hui_status', '!=', ABANDONED);
        if (guidanceId) {
            huiView.addQuery('hg_sys_id', guidanceId);
        }
        huiView.orderByDesc('hui_sys_updated_on');
        this.snHelpService.queryNoDomain(huiView);

        var curDomainExecutions = 0;
        let status = statusObj.COMPLETE;

        if (huiView.getRowCount()) {

            while (huiView.next()) {

                const interactionSysId = huiView.getValue('hui_sys_id');
                const hgrExecutionType = huiView.getValue('hg_setup_execution_type') || SINGLE;
                const huiExecutionType = huiView.getValue('hui_setup_execution_type') || SINGLE;

                var recordDomain = huiView.getValue('hui_sys_domain');
                var domainMatched = recordDomain === domain;
                if (!domainMatched) continue;

                ++curDomainExecutions;

                if (hgrExecutionType === huiExecutionType) {

                    const spc = new GlideRecordSecure('sys_pd_context');
                    spc.addQuery('input_record', interactionSysId);
                    spc.orderByDesc('sys_created_on');
                    this.snHelpService.queryNoDomain(spc);

                    if (spc.next()) {
                        const contextStatus = spc.getValue('state');
                        if (contextStatus == statusObj.IN_PROGRESS) {
                            return statusObj.IN_PROGRESS;
                        } else if (this.cancelRegex.test(contextStatus)) {
                            status = statusObj.NOT_STARTED;
                        }
                    }
                } else {
                    status = statusObj.NOT_STARTED;
                }

                if (hgrExecutionType == SINGLE) {
                    break;
                }
            }

        }

        if (curDomainExecutions > 0) {
            return status;
        } else {
            // No execution record for given guided setup in current domain');
            return statusObj.NOT_STARTED;
        }
    },

    updateInitialValuesForGuidanceAndInteractions: function() {
        const {
            guidance,
            user_interaction
        } = this.constants.tables;

        const hg = new GlideRecordSecure(guidance);
        hg.addEncodedQuery('type=global_setup^setup_execution_type=');
        this.snHelpService.queryNoDomain(hg);

        while (hg.next()) {

            const hgSysId = hg.getValue('sys_id');
            hg.setup_execution_type = 'single';

            const hui = new GlideRecord(user_interaction);
            hui.addQuery('guidance', hgSysId);
            hui.addNullQuery('setup_execution_type');
            this.snHelpService.queryNoDomain(hui);

            while (hui.next()) {

                const huiSysId = hui.getValue('sys_id');
                const pd = hg.getValue('process_definition');
                hui.setup_name = hg.getValue('product_name');
                hui.description = hg.getValue('description');
                hui.setup_execution_type = 'single';
                hui.sys_domain_path = hui.getValue('sys_domain_path') || '/';

                if (pd) {
                    const sps = new GlideRecordSecure('sys_pd_snapshot');
                    sps.addQuery('source', pd);
                    sps.orderByDesc('sys_created_on');
                    sps.setLimit(1);
                    this.snHelpService.queryNoDomain(sps);

                    if (sps.next()) {
                        hui.guidance_snapshot = sps.getValue('sys_id');
                    }

                }

                this.snHelpService.setWorkflowFromDiffScope(hui, false);
                hui.update();
            }

            this.snHelpService.setWorkflowFromDiffScope(hg, false);
            hg.update();
        }

    },

    updateDefaultValueForSysDomainPathInExistingRecord: function(table, query) {

        const hui = new GlideRecord(table);
        hui.addNullQuery('sys_domain_path');
        hui.addEncodedQuery(query);
        this.snHelpService.queryNoDomain(hui);

        while (hui.next()) {
            hui.sys_domain_path = '/';
            this.snHelpService.setWorkflowFromDiffScope(hui, false);
            hui.update();
        }

    },

    canNextBeVisible: function(current) {
        const isUserHaveAdminRole = gs.hasRole('sn_help_setup_admin');
        const postActionStates = ['COMPLETE', 'SKIPPED', 'ERROR', 'CANCELLED'];
        const currentState = current.getValue('state');
        const currentAssignedTo = current.getValue('assigned_to');
        const loggedInUserId = gs.getUserID();
        if (isUserHaveAdminRole || !currentAssignedTo || currentAssignedTo == loggedInUserId) {
            if (postActionStates.indexOf(currentState) != -1) {
                return true;
            } else {
                return false;
            }
        } else if (currentAssignedTo != loggedInUserId) {
            return true;
        }
    },

    type: 'SNHelpSetupPlayerController'
};

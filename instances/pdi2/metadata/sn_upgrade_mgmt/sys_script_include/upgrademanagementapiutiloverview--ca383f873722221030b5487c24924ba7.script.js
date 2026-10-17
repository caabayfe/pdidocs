var UpgradeManagementApiUtilOverview = Class.create();
UpgradeManagementApiUtilOverview.prototype = {
    initialize: function() {
        this.globalUmUtil = new global.UpgradeManagementApiUtil();
    },
	cancelPlaybook: function(contextId) {
		try {
			if(!contextId) return;
			var process = new GlideRecord('sys_pd_context');
			process.get(contextId);
			var cancelPlaybookReturn = sn_playbook.PlaybookExperience.cancelPlaybook(process, "User ended session");
			var forceCancelPlaybook = sn_playbook.PlaybookExperience.cancelPlaybook(process, "User ended session", undefined, true);
		} catch(error) {
			gs.error("Error in UpgradeManagementApiUtilOverview: cancelPlaybook function " + error);
		}
	},
    cancelUpdateSet: function(updateSetID) {
        try {
            if (updateSetID) {
                this.globalUmUtil.updateRecords("sys_update_set", [{
                    sys_id: updateSetID,
                    state: "ignore"
                }]);
            }
        } catch (e) {
            gs.info("Error in UpgradeManagementApiUtilOverview: cancelUpdateSet function " + e);
        }
    },
    cancelUpgradePreviews: function(upgradePreview, upgradePreviewStore) {
        try {

            if(upgradePreview == upgradePreviewStore){
                upgradePreviewStore = null; 
            }
            var upgradePreviewRecordsToUpdate = [];

            if (upgradePreview) {
                var previewGR = new GlideRecord('upgrade_preview');
                if (previewGR.get(upgradePreview)) {
                        var previewStatus = previewGR.getValue("status");
                        if (previewStatus == "pending" || previewStatus == "in_progress" || previewStatus == "complete"){ 
                            upgradePreviewRecordsToUpdate.push({
                                sys_id: previewGR.getValue("sys_id"),
                                status: "cancelled"
                            });
                        }
                }
            }

            if (upgradePreviewStore) {
                    var previewGRStore = new GlideRecord('upgrade_preview');
                    if (previewGRStore.get(upgradePreviewStore)) {
                            var previewStatusStore = previewGRStore.getValue("status");
                            if (previewStatusStore == "pending" || previewStatusStore == "in_progress" || previewStatusStore == "complete"){ 
                                upgradePreviewRecordsToUpdate.push({
                                    sys_id: previewGRStore.getValue("sys_id"),
                                    status: "cancelled"
                                });
                            }
                    }
            }
			if(upgradePreviewRecordsToUpdate.length > 0){
				this.globalUmUtil.updateRecords("upgrade_preview", upgradePreviewRecordsToUpdate);
			}
        } catch (e) {
            gs.error("Error in UpgradeManagementApiUtilOverview: cancelUpgradePreviews() " + e);
        }
    },
    cancelUpgradePreviewExecutionTrackers: function(upgradePreviewExecutionTracker,upgradePreviewStoreExecutionTracker) {
        try {
            if (upgradePreviewExecutionTracker) {
                try {
                    new sn_instance_scan.ScanInstance().cancelScan(upgradePreviewExecutionTracker, false);
                    var trackerGR = new GlideRecord('sys_execution_tracker');
 
                    if (trackerGR.get(upgradePreviewExecutionTracker)) {
                            var state = trackerGR.getValue('state');
                            if (state == 0 || state == 1) {
                                this.globalUmUtil.updateRecords("sys_execution_tracker", [{
                                    sys_id: upgradePreviewExecutionTracker,
                                    state: 4
                                }]);
                            }
                    }
                } catch (e) {
                    gs.error("Unable to cancel transaction with progress tracker id:" + upgradePreviewExecutionTracker);
                }
            }
			if (upgradePreviewStoreExecutionTracker) {
                try {
                    new sn_instance_scan.ScanInstance().cancelScan(upgradePreviewStoreExecutionTracker, false);
                    var trackerGRStore = new GlideRecord('sys_execution_tracker');
 
                    if (trackerGRStore.get(upgradePreviewStoreExecutionTracker)) {
                            var state = trackerGRStore.getValue('state');
                            if (state == 0 || state == 1) {
                                this.globalUmUtil.updateRecords("sys_execution_tracker", [{
                                    sys_id: upgradePreviewStoreExecutionTracker,
                                    state: 4
                                }]);
                            }
                    }
                } catch (e) {
                    gs.error("Unable to cancel transaction with progress tracker id:" + upgradePreviewStoreExecutionTracker);
                }
            }
        } catch (e) {
            gs.error("Error in UpgradeManagementApiUtilOverview: cancelUpgradePreviewExecutionTracker function " + e);

        }
    },
    cancelUpgradePlan: function(upgradePlan) {
        try {
            if (upgradePlan) {
                this.globalUmUtil.updateRecords("sys_upgrade_plan", [{
                    sys_id: upgradePlan,
                    "active": false
                }]);
            }
        } catch (e) {
            gs.info("Error in UpgradeManagementApiUtilOverview: cancelUpgradePlan function " + e);

        }
    },
    cancelAtfTracker: function(atfTracker, upgradeSessionSysId) {
        try {
            if (atfTracker) {
                var boqGR = new GlideRecord("sn_atf_tg_sn_boq");

                if (boqGR.get(atfTracker)) {
                    var atfProgress = boqGR.getValue("progress");
                    if (atfProgress !== undefined && atfProgress !== null && parseInt(atfProgress, 10) < 100) { //handle 0
                        new sn_upgrade_mgmt.UpgradeManagementATFUtil().cancelTestGenerator(upgradeSessionSysId);
                    }
                }
            }
        } catch (e) {
            gs.info("Error in UpgradeManagementApiUtilOverview: cancelAtfTracker function " + e);
        }
    },

    checkIfATFInstalled: function() {
        try {
            var atfGR = new GlideRecord('sys_store_app');
            atfGR.addQuery('scope', 'sn_atf_tg');
            atfGR.query();
            return atfGR.hasNext();
        } catch (error) {
            gs.info("Error" + error);
        }

    },
    formatAvailableVersionCards: function(upgradeOverviewDetails) {
        try {
            var parsedReleaseNotesUrls = (upgradeOverviewDetails && upgradeOverviewDetails.releaseNotesUrls) ?
                JSON.parse(upgradeOverviewDetails.releaseNotesUrls) : {};

            var parsedAvailableVersions = (upgradeOverviewDetails && upgradeOverviewDetails.availableVersions) ?
                JSON.parse(upgradeOverviewDetails.availableVersions) : [];

            var parsedAvailableFamilyReleases = (upgradeOverviewDetails && upgradeOverviewDetails.availableFamilyReleases) ?
                JSON.parse(upgradeOverviewDetails.availableFamilyReleases) : [];

            var releasedCardsRepeaterData = [];
            var selectedPatch = [];

            function sortVersions(a,b) {
                const regex = /Patch\s*(\d+)?([a-z])?(?:\s*Hot Fix\s*(\d+)?([a-z])?)?/i;

                const parse = (str) => {
                const match = str.match(regex);
                return {
                    patch: match && match[1] ? parseInt(match[1], 10) : 0,
                    patchSuffix: match && match[2] ? match[2] : "",
                    hotfix: match && match[3] ? parseInt(match[3], 10) : 0,
                    hotfixSuffix: match && match[4] ? match[4] : ""
                };
                };

                const pa = parse(a.label);
                const pb = parse(b.label);

                if (pa.patch !== pb.patch) return pa.patch - pb.patch;

                if (pa.patchSuffix !== pb.patchSuffix)
                return pa.patchSuffix.localeCompare(pb.patchSuffix);

                if (pa.hotfix !== pb.hotfix) return pa.hotfix - pb.hotfix;

                if (pa.hotfixSuffix !== pb.hotfixSuffix)
                return pa.hotfixSuffix.localeCompare(pb.hotfixSuffix);

                return a.label.localeCompare(b.label);
            }

            if (parsedAvailableFamilyReleases) {
                parsedAvailableFamilyReleases.sort(function(a, b) {
                    return b.localeCompare(a);
                }).forEach(function(el) {
                    if (!el) return; // Handle null/undefined family release names gracefully

                    var formattedResponse = {};
                    var capitalizeFirstLetter = el.charAt(0).toUpperCase() + el.slice(1);
                    formattedResponse.title = capitalizeFirstLetter;

                    formattedResponse.releaseNotesUrl = parsedReleaseNotesUrls[el] || ''; // Safe access
                    formattedResponse.notes = "The " + (capitalizeFirstLetter || "") + " release at ServiceNow introduces a suite of innovative feature designed to enhance experience.";
                    formattedResponse.image = "upload_upgrade_management_" + (el.toLowerCase()) + "_image.svg";

                    var versions = [];
                    if (parsedAvailableVersions) {
                        parsedAvailableVersions.forEach(function(availableVersion) {
                            if (availableVersion && availableVersion.fLabel && availableVersion.fLabel.toLowerCase().includes(el.toLowerCase()) && (availableVersion.fValue && upgradeOverviewDetails && upgradeOverviewDetails.currentVersionZip && availableVersion.fValue != upgradeOverviewDetails.currentVersionZip.replace(".zip", '.war'))) {
                                versions.push({
                                    id: availableVersion.fValue,
                                    label: availableVersion.fLabel
                                });
                            }
                        });

                        formattedResponse.versions = versions.sort(sortVersions);

                        releasedCardsRepeaterData.push(formattedResponse);
                        if (versions && versions[0] && versions[0].id) selectedPatch.push([versions[0].id]);
                    }
                });
            }
            return {
                releasedCardsRepeaterData: releasedCardsRepeaterData,
                selectedPatch: selectedPatch
            };
        } catch (error) {
            gs.info("Error" + error);
        }
    },
    getUpgradeDetails: function(callUpgradeMonitor) {
        try {
            // Bulk-app-update branch — synthesize response from sys_upgrade_history rows
            // Prefer sessions where install has actually run (non-null tracker)
            var pickedBulkSession = null;
            var withTracker = new GlideRecord('sn_um_upgrade_sessions');
            withTracker.addQuery('session_type', 'bulk_app_update');
            withTracker.addQuery('status', 'in_progress');
            withTracker.addNotNullQuery('batch_app_install_execution_tracker');
            withTracker.orderByDesc('sys_updated_on');
            withTracker.setLimit(1);
            withTracker.query();
            if (withTracker.next()) {
                pickedBulkSession = withTracker;
            } else {
                var anyBulk = new GlideRecord('sn_um_upgrade_sessions');
                anyBulk.addQuery('session_type', 'bulk_app_update');
                anyBulk.addQuery('status', 'in_progress');
                anyBulk.orderByDesc('sys_updated_on');
                anyBulk.setLimit(1);
                anyBulk.query();
                if (anyBulk.next()) {
                    pickedBulkSession = anyBulk;
                }
            }
            if (pickedBulkSession) {
                return this.buildBulkAppUpdateOverviewResponse(pickedBulkSession);
            }

            var umGR = new GlideRecord('sys_store_app');
            umGR.addQuery('scope', 'sn_upgrade_mgmt');
            umGR.query();
            umGR.next();
            if (umGR && umGR.getValue("version") && (umGR.getValue("version").startsWith("1.0.0") || umGR.getValue("version").startsWith("2.0.0") || umGR.getValue("version").startsWith("2.0.1") || umGR.getValue("version").startsWith("2.0.2") || umGR.getValue("version").startsWith("2.0.3") || umGR.getValue("version").startsWith("2.0.4"))) {
                var response = {};
                var upgradeOverviewDetails = new sn_uc.UpgradeMgmtUtil.getUpgradeOverviewDetails();
                response['upgradeOverviewDetails'] = upgradeOverviewDetails;
                var upgradeMonitorStatusProviderDetails = new sn_uc.UpgradeMgmtUtil().getUpgradeMonitorStatus("");
                response['upgradeMonitorStatusProviderDetails'] = JSON.parse(upgradeMonitorStatusProviderDetails);
                response['checkIfATFInstalled'] = this.checkIfATFInstalled();

                return response;
            }
            var response = {};
            response['upgradeMonitorStatusProviderDetails'] = {};

            var upgradeOverviewDetails = new sn_uc.UpgradeMgmtUtil.getUpgradeOverviewDetails();

            if (upgradeOverviewDetails) {
                upgradeOverviewDetails.currentVersionZip = gs.getProperty("glide.war");
                var instanceId = gs.getProperty("instance_id");

                var mifGR = new GlideRecord("sn_mif_instance");

                mifGR.addQuery("instance_id", instanceId);

                mifGR.query();
                if (mifGR.next()) {
                    upgradeOverviewDetails.environment = mifGR.getValue("is_prod") == 1 ? true : false;
                } else if (gs.getProperty("sn_appclient.instance_type")) {
                    upgradeOverviewDetails.environment = gs.getProperty("sn_appclient.instance_type") === "production";
                } else {
                    upgradeOverviewDetails.environment = false;
                }
            }

            response['upgradeOverviewDetails'] = upgradeOverviewDetails;

            response['formattedAvailableVersions'] = this.formatAvailableVersionCards(upgradeOverviewDetails);

            if (callUpgradeMonitor || (response['formattedAvailableVersions'] && Array.isArray(response['formattedAvailableVersions'].releasedCardsRepeaterData) && response['formattedAvailableVersions'].releasedCardsRepeaterData.length <= 0)) {
                var upgradeMonitorStatusProviderDetails = new sn_uc.UpgradeMgmtUtil().getUpgradeMonitorStatus("");

                response['upgradeMonitorStatusProviderDetails'] = JSON.parse(upgradeMonitorStatusProviderDetails);

				try {
					let parsedResult = response['upgradeMonitorStatusProviderDetails'];
					let newUpgradeProgress = null;
					let toVersion = parsedResult.toVersion;
					if(parsedResult.state === "running" || parsedResult.state === "distUpgrade") {
						newUpgradeProgress = 'in_progress';
					} else if (parsedResult.state === "complete") {
						newUpgradeProgress = 'complete';
					}

					if(newUpgradeProgress !== null) {
						var sessionGR = new GlideRecord('sn_um_upgrade_sessions');
						sessionGR.addQuery("status", "in_progress");
						sessionGR.addQuery("target_patch_id", toVersion);
						sessionGR.orderByDesc('sys_updated_on');
						sessionGR.query();

						if (sessionGR.next()) {
							var currentProgress = sessionGR.getValue('upgrade_progress');
							if (currentProgress != newUpgradeProgress) {
								sessionGR.setValue("upgrade_progress", newUpgradeProgress);
								sessionGR.update();
							}
						}
					}

                    
					
				}catch(e) {
					gs.error("Unknown error occurred while updating upgrade session: " + e);
				}
            }

            response['checkIfATFInstalled'] = this.checkIfATFInstalled();

            return response;
        } catch (error) {
            gs.info("Error" + error);
        }
    },

    buildBulkAppUpdateOverviewResponse: function(bulkSession) {
        var trackerId     = bulkSession.getValue('batch_app_install_execution_tracker');
        var targetPatchId = bulkSession.getValue('target_patch_id');
        var sessionStatus = bulkSession.getValue('status');

        // Find the sys_upgrade_history record via tracker join.
        // Read aggregate fields directly from the parent — sys_upgrade_history_log
        // is blocked cross-scope from sn_upgrade_mgmt.
        var primaryHistorySysId = '';
        var changesProcessed = 0, changesSkipped = 0,
            notReviewed = 0, reviewed = 0, resolved = 0,
            skippedWithoutTests = 0;

        if (trackerId) {
            var grHist = new GlideRecord('sys_upgrade_history');
            grHist.addQuery('tracker', trackerId);
            grHist.orderByDesc('sys_created_on');
            grHist.setLimit(1);
            grHist.query();
            if (grHist.next()) {
                primaryHistorySysId = grHist.getUniqueValue();
                changesProcessed   = parseInt(grHist.getValue('changes_processed') || 0, 10);
                changesSkipped     = parseInt(grHist.getValue('changes_skipped')   || 0, 10);
                notReviewed        = parseInt(grHist.getValue('changes_not_reviewed') || 0, 10);
                reviewed           = parseInt(grHist.getValue('changes_reviewed') || 0, 10);

                // Delegate to global helper (canonical skipped filter). Routing through
                // global.UpgradeManagementApiUtil bypasses WebServicePolicyValidator on
                // sys_upgrade_history_log (ws_access=false on the table).
                try {
                    var counts = this.globalUmUtil.countBulkSkippedRecords(primaryHistorySysId);
                    if (counts && counts.total > 0) {
                        changesSkipped = counts.total;
                        notReviewed    = counts.notReviewed;
                        reviewed       = counts.reviewed;
                        resolved       = counts.resolved;
                    }
                    skippedWithoutTests = this.globalUmUtil.countSkippedWithoutTests(primaryHistorySysId);
                } catch (e) {
                    gs.error('Bulk-update count via global helper failed: ' + e);
                }
            }
        }

        return {
            upgradeMonitorStatusProviderDetails: {
                toVersion: targetPatchId,
                state: sessionStatus === 'in_progress' ? 'running' : sessionStatus,
                // Force 'complete' so the loader visibility script hides the spinner
                // (loader script: hidden when summaryStatus is empty OR 'complete')
                summaryStatus: 'complete',
                summaryCompleteLabel: '',
                upgradeHistoryDetails: [{
                    sys_id: primaryHistorySysId,
                    changes_processed: changesProcessed,
                    changes_skipped: changesSkipped,
                    changes_not_reviewed: notReviewed,
                    changes_reviewed: reviewed,
                    changes_skipped_without_tests: skippedWithoutTests
                }],
                upgradePlanHistoryInfo: {
                    skippedRecords: { resolved: resolved, total: changesSkipped }
                }
            },
            upgradeOverviewDetails: { sessionType: 'bulk_app_update' },
            formattedAvailableVersions: { releasedCardsRepeaterData: [] },
            checkIfATFInstalled: this.checkIfATFInstalled()
        };
    },

    cancelUpgradeSession: function() {
        try {
            var upgradeSessionGR = new GlideRecord('sn_um_upgrade_sessions');
            upgradeSessionGR.addQuery('status', 'in_progress');
            upgradeSessionGR.addQuery('session_type', 'sys_upgrade');
            upgradeSessionGR.orderByDesc('sys_updated_on');
            upgradeSessionGR.setLimit(1);
            upgradeSessionGR.query();

            if (upgradeSessionGR.next()) {
                upgradeSessionGR.setValue("status", "cancelled");

                var upgradeSessionSysId = upgradeSessionGR.getValue("sys_id");
                var atfTracker = upgradeSessionGR.getValue("atf_test_suite_generation_tracker");
                var upgradePlan = upgradeSessionGR.getValue("upgrade_plan");
                var upgradePreviewExecutionTracker = upgradeSessionGR.getValue("upgrade_preview_execution_tracker");
                var upgradePreviewStoreExecutionTracker = upgradeSessionGR.getValue("upgrade_preview_execution_tracker_store");
                var upgradePreview = upgradeSessionGR.getValue("upgrade_preview");
                var upgradePreviewStore = upgradeSessionGR.getValue("upgrade_preview_store");
                var updateSetID = upgradeSessionGR.getValue("sys_update_set");
                var currentPatchId = upgradeSessionGR.getValue("current_patch_id");
                var targetPatchId = upgradeSessionGR.getValue("target_patch_id");
                var contextId = upgradeSessionGR.getValue("sys_pd_context_id");
                this.cancelAtfTracker(atfTracker, upgradeSessionSysId);
                this.cancelUpgradePlan(upgradePlan);
                this.cancelUpgradePreviewExecutionTrackers(upgradePreviewExecutionTracker,upgradePreviewStoreExecutionTracker);
                this.cancelUpgradePreviews(upgradePreview,upgradePreviewStore);

                this.cancelUpdateSet(updateSetID);
				this.cancelPlaybook(contextId);

                upgradeSessionGR.update();
            }
            else {
                gs.info('UpgradeManagementApiUtilOverview: No in_progress upgrade sessions found to cancel.');
            }
        } catch (e) {
            gs.error("Error in UpgradeManagementApiUtilOverview: cancelUpgradeSession() " + e);
        }
    },

    checkIfUpgradeInProgress: function() {
        try {
            var upgradeSessionGR = new GlideRecord('sn_um_upgrade_sessions');
            upgradeSessionGR.addQuery('status', 'in_progress');
            upgradeSessionGR.addQuery('session_type', 'sys_upgrade');
            upgradeSessionGR.orderByDesc('sys_updated_on');
            upgradeSessionGR.setLimit(1);
            upgradeSessionGR.query();


            if (upgradeSessionGR.next()) {
                var upgradeSessionGRSysID = upgradeSessionGR.getValue("sys_id");
                var upgradeSessionGRSysIDChanged = false;
                var stateCounts = {};
                var totalCount = 0;
                var playbookContextGR = new GlideRecord('sys_pd_context');
                playbookContextGR.addQuery("input_record", upgradeSessionGRSysID);
                playbookContextGR.setLimit(1);
                playbookContextGR.query();
                var contextId = "";
                if(playbookContextGR.next()) contextId = playbookContextGR.getDisplayValue("label");
                var currentPatchLabel = upgradeSessionGR.getValue("current_patch_label");
                var targetPatchLabel = upgradeSessionGR.getValue("target_patch_label");
                if (contextId) {
					var contextGR = new GlideRecord('sys_pd_activity_context');

					contextGR.addQuery("context=" + upgradeSessionGR.getValue("sys_pd_context_id") + "^activity_type!=NULL");
					contextGR.query();

					var statePriority = {
						'IN_PROGRESS': 1,
						'PENDING': 2,
						'READY': 3,
						'ERROR': 4,
						'COMPLETE': 5,
						'SKIPPED': 6
					};

					// Map to track the highest priority state for each label
					var labelStateMap = {};

					while (contextGR.next()) {
						var label = contextGR.getValue('label');
						var state = contextGR.getValue('state');
						
						if (!label) continue;
						
						// If this label hasn't been seen yet, or if this state has higher priority
						if (!labelStateMap[label] || 
							(statePriority[state] || 999) < (statePriority[labelStateMap[label]] || 999)) {
							labelStateMap[label] = state;
						}
					}

					for (var label in labelStateMap) {
						var state = labelStateMap[label];
						
						if (!stateCounts[state]) {
							stateCounts[state] = 0;
						}
						
						stateCounts[state]++;
						totalCount++;
					}


                    var contextGR2 = new GlideRecord('sys_pd_activity_context');

                    contextGR2.addQuery("context=" + upgradeSessionGR.getValue("sys_pd_context_id") + "^activity_type!=NULL^execution_index!=0");

                    contextGR2.addQuery("state", "IN_PROGRESS");

                    contextGR2.orderBy("execution_index");

                    contextGR2.setLimit(1);

                    contextGR2.query();

                    contextGR2.next();
					
                } else {
                    var tempSysId = upgradeSessionGR.getValue("sys_id");
                    upgradeSessionGRSysID = upgradeSessionGR.insert();
 
                    var upgradeSessionGR2 = new GlideRecord('sn_um_upgrade_sessions');
                    upgradeSessionGR2.get(tempSysId);
 
                    upgradeSessionGR2.setValue("status", "cancelled");
                    upgradeSessionGR2.update();
                    upgradeSessionGRSysIDChanged = true;
                }

				var SCHEDULE_UPGRADE_ACTIVITY_ID = "1bffbd1d7f6b12100c3ed6065c8665c5";

				var shouldCallUpgradeMonitor = contextGR2 ? (contextGR2.getValue("activity_definition") ? contextGR2.getValue("activity_definition") === SCHEDULE_UPGRADE_ACTIVITY_ID : true) : true;

                return {
                    state: "PLAYBOOK_IN_PROGRESS",
                    sys_id: upgradeSessionGRSysID,
                    upgradeSessionGRSysIDChanged: upgradeSessionGRSysIDChanged,
                    upgradeDetails: this.getUpgradeDetails(shouldCallUpgradeMonitor),
                    targetPatch: targetPatchLabel,
                    currentPatch: currentPatchLabel,
                    totalSteps: totalCount,
                    activeStepLabel: contextGR2 ? (contextGR2.getValue("label") ? contextGR2.getValue("label") : "") : "",
                    activeStepCount: stateCounts["COMPLETE"] ? (stateCounts["COMPLETE"] +1 ): 1

                };
            }else{
                return {
                    state: "PLAYBOOK_NOT_STARTED",
                    upgradeDetails: this.getUpgradeDetails(false)
                };
            }
        } catch (error) {
            gs.info("Error" + error);
        }
    },
    addSkippedRuleToUpdateSet: function(fields) {
        try {
            var upgradeSessionGR = new GlideRecord('sn_um_upgrade_sessions');
            upgradeSessionGR.addQuery('status', 'in_progress');
            upgradeSessionGR.addQuery('session_type', 'IN', 'sys_upgrade,bulk_app_update');
            upgradeSessionGR.orderByDesc('sys_updated_on');
            upgradeSessionGR.setLimit(1);
            upgradeSessionGR.query();

            if (!upgradeSessionGR.next()) 
                return true;

            var sessionUpdateSet = upgradeSessionGR.getValue("sys_update_set");
            var currentUpdateSet = this.globalUmUtil.getActiveUpdateSet();
            try {
                if (!fields.name) {
                    gs.error('Name is required for sys_upgrade_skipped_record_rule');
                    return null;
                }

                if (!fields.condition) {
                    gs.error('Condition is required for sys_upgrade_skipped_record_rule');
                    return null;
                }

                if (!fields.action) {
                    gs.error('Action is required for sys_upgrade_skipped_record_rule');
                    return null;
                }

                // Action-specific validation
                if (fields.action == '3' && !fields.user) {
                    gs.error('User is required when action is set to "Assign Skipped Records to User"');
                    return null;
                }

                if (fields.action == '4' && !fields.tags) {
                    gs.error('Tags are required when action is set to "Assign Tags to Skipped Records"');
                    return null;
                }

                if (!(fields.action == '4' || fields.action == '3')) this.globalUmUtil.updateActiveUpdateSet(sessionUpdateSet);
                this.globalUmUtil.insertRecords("sys_upgrade_skipped_record_rule", [fields]);
                if (!(fields.action == '4' || fields.action == '3')) this.globalUmUtil.updateActiveUpdateSet(currentUpdateSet);
            } catch (ex) {
                gs.error('Error creating sys_upgrade_skipped_record_rule: ' + ex.message);
                return null;
            }

        return true;

        } catch (error) {
            gs.error("Error in executing addSkippedRuleToUpdateSet in UpgradeManagementApiUtilOverview: " + error);
            return null;
        }
    },

    /**
     * Updates the status of reviewed and retained skipped records in the upgrade history log based on matching records from the upgrade preview log.
     * This function queries the upgrade_preview_log table for records with specific dispositions (4, 10, or 5) and reviewed and retained(retained) resolution
     * that are associated with the provided upgrade preview. It then updates corresponding records in the sys_upgrade_history_log table
     * to mark them as 'reviewed_retained'.
     * 
     * @param {Object} upgradeParams - Object containing required parameters
     * @param {String} upgradeParams.upgradePreviewSysId - The sys_id of the upgrade preview record
     * @param {String} upgradeParams.upgradeHistorySysId - The sys_id of the upgrade history record to update
     * @returns {Object} Summary of updates performed
     */
    updateRetainedSkippedRecords: function(upgradeParams) {
        try {
            var upgradePreviewSysId = upgradeParams.upgradePreviewSysId;
            var upgradeHistorySysId = upgradeParams.upgradeHistorySysId;

            // Initialize GlideRecord with the target table
            var gr = new GlideRecordSecure('upgrade_preview_log');
            var query = "preview.sys_id=" + upgradePreviewSysId + "^disposition=4^ORdisposition=10^ORdisposition=5^resolution=retained";

            gr.addEncodedQuery(query, true);
            gr.orderBy("file_name");
            gr.query();

            gs.info('UM: Count of reviewed and retained resolutions in predicted skips: ' + gr.getRowCount());
            var results = {};

            while (gr.next()) {
                // Store relevant information from each record
                var record = {
                    sysId: gr.getValue('sys_id'),
                    fileName: gr.getValue('file_name'),
                    comments: gr.getValue('comments'),
                    plugin: gr.getValue('plugin')
                };

                results[record.fileName] = record;
            }

            return this.globalUmUtil.updateUpgradeHistoryLogByFileName(results, upgradeHistorySysId);
        } catch (e) {
            gs.info("Error in UpgradeManagementApiUtilOverview: updateRetainedSkippedRecords function " + e);
        }
    },

    duplicateUpgradeSessionManual: function(sourceSysId) {
        var sourceGR = new GlideRecord('sn_um_upgrade_sessions');
        if (!sourceGR.get(sourceSysId)) {
            gs.error('Source record not found: ' + sourceSysId);
            return null;
        }

        // Define fields to copy
        var fieldsToCopy = [
            'current_patch_id',
            'current_patch_label',
            'target_patch_id',
            'target_patch_label',
            'status',
            'environment',
            'schema_alter_generation_tracker',
            'generate_preview',
            'upgrade_preview',
            'upgrade_preview_execution_tracker',
            'upgrade_plan',
            'created_upgrade_plan',
            'process_upgrade_plan_execution_tracker',
            'store_incoming_apps_exec_tracker',
            'sys_pd_definition_id',
            'atf_test_suite_generation_tracker',
            'sys_update_set',
            'upgrade_plan_table_populated',
            'is_post_lane',
            'upgrade_preview_stage'
        ];

        var targetGR = new GlideRecord('sn_um_upgrade_sessions');
        targetGR.initialize();

        // Copy fields in a loop
        for (var i = 0; i < fieldsToCopy.length; i++) {
            targetGR.setValue(fieldsToCopy[i], sourceGR.getValue(fieldsToCopy[i]));
        }

        // Special cases
        targetGR.setValue('upgrade_preview_store', sourceGR.getValue('upgrade_preview'));
        targetGR.setValue('upgrade_preview_execution_tracker_store', sourceGR.getValue('upgrade_preview_execution_tracker'));
        targetGR.setValue('restart_after_upgrade', true);

        var newRecordSysId = targetGR.insert();

        if (newRecordSysId) {
            gs.info('Duplicate upgrade session created: ' + newRecordSysId);

            // Update source record status - reuse existing GR
            sourceGR.setValue('status', 'cancelled');
            sourceGR.update();

            return newRecordSysId;
        }

        return null;
    },

    updateRelatedTablesSessionId: function(oldSessionSysId, newSessionSysId) {
        var tablesToUpdate = [
            'sn_um_upgrade_app_preferences',
            'sn_um_upgrade_session_config',
            'sn_um_upgrade_test_suites'
        ];

        var results = {};
        var totalUpdated = 0;

        for (var i = 0; i < tablesToUpdate.length; i++) {
            var tableName = tablesToUpdate[i];
            var gr = new GlideRecord(tableName);
            gr.addQuery('upgrade_session_id', oldSessionSysId);
            gr.query();
            gr.setValue('upgrade_session_id', newSessionSysId);

            var count = gr.updateMultiple();
            results[tableName] = count;
            totalUpdated += count;

            gs.info('Updated ' + count + ' records in ' + tableName);
        }

        gs.info('Total records updated across all tables: ' + totalUpdated);
        return results;
    },

    checkIfUpgradeSessionHasContext: function(sysId, pdContextId) {
        var upgradeSessionGR = new GlideRecord('sn_um_upgrade_sessions');

        if (!upgradeSessionGR.get(sysId)) {
            gs.warn('Upgrade session not found: ' + sysId);
            return false;
        }

        // Early return if context already exists
        if (upgradeSessionGR.sys_pd_context_id) {
            return true;
        }

        // Set and update context
        upgradeSessionGR.setValue('sys_pd_context_id', pdContextId);
        return upgradeSessionGR.update();
    },

    completeActivity: function(sys_id, old_sys_id) {
        var MAX_RETRIES = 40;
        var RETRY_DELAY_MS = 500;

        try {
            // Get the context
            var upgradeSessionGR = new GlideRecord('sys_pd_context');
            upgradeSessionGR.addQuery('input_record', sys_id);
            upgradeSessionGR.setLimit(1);
            upgradeSessionGR.query();

            if (!upgradeSessionGR.next()) {
                gs.info('No context found to complete activity for sys_id: ' + sys_id);
                return '';
            }

            var contextSysId = upgradeSessionGR.getValue('sys_id');
            if (!contextSysId) {
                gs.info('No context sys_id found');
                return '';
            }

            var preUpgradeActivities = {};
            var activityGR = new GlideRecord('sys_pd_activity_context');
            activityGR.addQuery('context.input_record', sys_id);
            activityGR.addQuery('activity_type', '!=', 'NULL');
            activityGR.addEncodedQuery('lane.labelSTARTSWITHPre-upgrade');
            activityGR.orderBy('order');
            activityGR.query();

            while (activityGR.next()) {
                preUpgradeActivities[activityGR.getValue('name')] = false;
            }
			preUpgradeActivities["um_schedule_upgrade"] = false;

            // Process each activity
            var activityNames = Object.keys(preUpgradeActivities);
            var toBeSkippedActivities = ["um_import_configuration"];
            for (var i = 0; i < activityNames.length; i++) {
                var activityName = activityNames[i];
                var compltedOrSkipped = this._completeActivityWithRetry(activityName, contextSysId, MAX_RETRIES, RETRY_DELAY_MS, toBeSkippedActivities);
                preUpgradeActivities[activityName] = compltedOrSkipped;

                if (!compltedOrSkipped) {
                    gs.error('Failed to complete or skip activity after ' + MAX_RETRIES + ' attempts: ' + activityName);
                }
            }

            // Update context on the upgrade session
            this.checkIfUpgradeSessionHasContext(sys_id, contextSysId);

            return '';
        } catch (error) {
            gs.error('Error in completeActivity function: ' + error);
            return '';
        }
    },

    _completeActivityWithRetry: function(activityName, contextSysId, maxRetries, retryDelayMs, toBeSkippedActivities) {
        for (var attempt = 1; attempt <= maxRetries; attempt++) {
            var activityContextGR = new GlideRecord('sys_pd_activity_context');
            activityContextGR.addQuery('context', contextSysId);
            activityContextGR.addQuery('name', activityName);
            activityContextGR.query();

            if (!activityContextGR.next()) {
                gs.warn('No activity context found for activity name: ' + activityName + ' (Attempt ' + attempt + '/' + maxRetries + ')');
                if (attempt < maxRetries) {
					var startTime = new Date().getTime();
					while (new Date().getTime() < startTime + retryDelayMs) {}
                    continue;
                }
                return false;
            }

            var associatedRecord = activityContextGR.getValue('associated_record');
            if (!associatedRecord) {
                gs.warn('No associated_record found for activity: ' + activityName + ' (Attempt ' + attempt + '/' + maxRetries + ')');
                if (attempt < maxRetries) {
					var startTime = new Date().getTime();
					while (new Date().getTime() < startTime + retryDelayMs) {}
                    continue;
                }
                return false;
            }

            var flowDataGR = new GlideRecord('sys_flow_data');
            if (!flowDataGR.get(associatedRecord)) {
                gs.warn('Flow data record not found: ' + associatedRecord + ' (Attempt ' + attempt + '/' + maxRetries + ')');
                if (attempt < maxRetries) {
					var startTime = new Date().getTime();
					while (new Date().getTime() < startTime + retryDelayMs) {}
                    continue;
                }
                return false;
            }

            if (toBeSkippedActivities.includes(activityName)) {
                flowDataGR.setValue('state', 'SKIPPED');
            }else{
                flowDataGR.setValue('state', 'COMPLETE');
            }

            if (flowDataGR.update()) {
                gs.info('Successfully updated activity: ' + activityName);
                return true;
            }

            gs.warn('Failed to update activity: ' + activityName + ' (Attempt ' + attempt + '/' + maxRetries + ')');
            if (attempt < maxRetries) {
				var startTime = new Date().getTime();
				while (new Date().getTime() < startTime + retryDelayMs) {}
            }
        }

        return false;
    },
	startNewPlaybookAfterUpgrade: function(activityContextId, sysId) {
		try {
			if(!activityContextId || !sysId) return;
			var gr = new GlideRecordSecure('sys_pd_activity_context');
			gr.get(activityContextId);
			if(gr.getValue("state") === "IN_PROGRESS") {
				if(gr.associated_record.state.toString() === "COMPLETE") {
					var newSessionSysId = this.duplicateUpgradeSessionManual(sysId);

					if (newSessionSysId) {
						this.updateRelatedTablesSessionId(sysId, newSessionSysId);
						this.completeActivity(newSessionSysId, sysId);
						return {
							status: "success",
							code: 201,
							message: "New playbook started successfully"
						}
					}
					
				}


			} else return {
				status: "success",
				code: 200,
				message: "Old playbook working"
			}
		} catch(error) {
			gs.error("Error in startNewPlaybookAfterUpgrade" +error);
			return {
				status: "error",
				code: 500,
				message: "Error in startNewPlaybookAfterUpgrade"
			}
		}
	},
	checkNewPlaybookRequired: function(parent) {
		var maxRetries = (parent && parent.maxRetries) || 1;
		var retryDelayMs = 500;
		try {
			if (!parent) {
				return {
					status: "error",
					code: 400,
					message: "Parent parameter is required"
				};
			}
			var activityContextId = (parent && parent.contextId) || "";
			if (!activityContextId) {
				return {
					status: "error",
					code: 400,
					message: "Activity context ID is missing"
				};
			}
            for (var attempt = 1; attempt <= maxRetries; attempt++) {
				var sysId = (parent && parent.parentRecord) || "";
				var gr = new GlideRecordSecure('sys_pd_activity_context');
				if (!gr.get(activityContextId)) {
					return {
						status: "error",
						code: 404,
						message: "Activity context not found"
					};
				}
				var activityState = gr.getValue("state") || "";
				var associatedRecordState = (gr.associated_record && gr.associated_record.state) ? gr.associated_record.state.toString() : "";
				if(activityState === "COMPLETE") {
					if(associatedRecordState === "COMPLETE") {
						return {
							status: "success",
							code: 200,
							message: "Old playbook working"
						};
					}
				}
				if(attempt === maxRetries) {
					if(activityState === "IN_PROGRESS") {
						if(associatedRecordState === "COMPLETE") {
							return {
								status: "success",
								code: 201,
								message: "New playbook required"
							};
						}
					}
				}
				if (attempt < maxRetries) {
					var startTime = new Date().getTime();
					while (new Date().getTime() < startTime + retryDelayMs) {}
                }
			}
			return {
				status: "error",
				code: 408,
				message: "Timeout: Unable to determine playbook status after " + maxRetries + " attempts"
			};
		} catch(error) {
			gs.error("Error in checkNewPlaybookRequired" +error);
			return {
				status: "error",
				code: 500,
				message: "Error in checkNewPlaybookRequired"
			}
		}
	},



    getBulkAppUpdateCounts: function() {
        try {
            var suiteScopes = {};
            var storeCount = 0;
            var suiteconfigscount = 0;

            // 1. Get all installed suite configs
            var suiteIds = [];
            var grSuite = new GlideRecord("sys_suite_config");
            grSuite.addQuery("installed", true);
            grSuite.query();
            while (grSuite.next()) {
                suiteIds.push(grSuite.getUniqueValue());
            }

            // 2. Get all scopes belonging to those suites (single query via IN)
            if (suiteIds.length) {
                var grM2M = new GlideRecord("sys_suite_config_app_version_m2m");
                grM2M.addQuery("suite_config", "IN", suiteIds.join(","));
                grM2M.query();
                while (grM2M.next()) {
                    suiteScopes[grM2M.getValue("app_scope")] = true;
                }
            }

            // 3. Fetch store apps with updates and classify by suite membership
            // Matches App Manager query: only apps installed from store, out_of_band, or offline
            var grStoreApp = new GlideRecord("sys_store_app");
            grStoreApp.addQuery("update_available", true);
            grStoreApp.addQuery("active", true);
            grStoreApp.addQuery("last_installed_from", "IN", "store,out_of_band,offline");
            grStoreApp.query();
            while (grStoreApp.next()) {
                var scope = grStoreApp.getValue("scope");
                if (suiteScopes[scope]) {
                    suiteconfigscount++;
                } else {
                    storeCount++;
                }
            }

            return {
                totalAppsWithUpdates: suiteconfigscount + storeCount,
                storeAppsCount: storeCount,
                nowAssistAppsCount: suiteconfigscount
            };
        } catch (e) {
            gs.error("Error in UpgradeManagementApiUtilOverview: getBulkAppUpdateCounts() " + e);
            return { totalAppsWithUpdates: 0, storeAppsCount: 0, nowAssistAppsCount: 0 };
        }
    },

    checkIfBulkAppUpdateInProgress: function() {
        try {
            var upgradeSessionGR = new GlideRecord('sn_um_upgrade_sessions');
            upgradeSessionGR.addQuery('status', 'in_progress');
            upgradeSessionGR.addQuery('session_type', 'bulk_app_update');
            upgradeSessionGR.orderByDesc('sys_updated_on');
            upgradeSessionGR.setLimit(1);
            upgradeSessionGR.query();

            if (upgradeSessionGR.next()) {
                var upgradeSessionGRSysID = upgradeSessionGR.getValue("sys_id");
                var stateCounts = {};
                var totalCount = 0;
                var currentPatchLabel = upgradeSessionGR.getValue("current_patch_label");
                var targetPatchLabel = upgradeSessionGR.getValue("target_patch_label");

                var playbookContextGR = new GlideRecord('sys_pd_context');
                playbookContextGR.addQuery("input_record", upgradeSessionGRSysID);
                playbookContextGR.setLimit(1);
                playbookContextGR.query();
                var contextId = "";
                if (playbookContextGR.next()) contextId = playbookContextGR.getDisplayValue("label");

                if (contextId) {
                    var contextGR = new GlideRecord('sys_pd_activity_context');
                    contextGR.addQuery("context", upgradeSessionGR.getValue("sys_pd_context_id"));
                    contextGR.addNotNullQuery("activity_type");
                    contextGR.query();

                    var statePriority = {
                        'IN_PROGRESS': 1,
                        'PENDING': 2,
                        'READY': 3,
                        'ERROR': 4,
                        'COMPLETE': 5,
                        'SKIPPED': 6
                    };

                    var labelStateMap = {};

                    while (contextGR.next()) {
                        var label = contextGR.getValue('label');
                        var state = contextGR.getValue('state');
                        if (!label) continue;
                        if (!labelStateMap[label] ||
                            (statePriority[state] || 999) < (statePriority[labelStateMap[label]] || 999)) {
                            labelStateMap[label] = state;
                        }
                    }

                    for (var lbl in labelStateMap) {
                        var st = labelStateMap[lbl];
                        if (!stateCounts[st]) stateCounts[st] = 0;
                        stateCounts[st]++;
                        totalCount++;
                    }

                    var contextGR2 = new GlideRecord('sys_pd_activity_context');
                    contextGR2.addQuery("context", upgradeSessionGR.getValue("sys_pd_context_id"));
                    contextGR2.addNotNullQuery("activity_type");
                    contextGR2.addQuery("execution_index", "!=", "0");
                    contextGR2.addQuery("state", "IN_PROGRESS");
                    contextGR2.orderBy("execution_index");
                    contextGR2.setLimit(1);
                    contextGR2.query();
                    var activeLabel = "";
                    if (contextGR2.next()) {
                        activeLabel = contextGR2.getValue("label") || "";
                    }

                    return {
                        state: "PLAYBOOK_IN_PROGRESS",
                        sys_id: upgradeSessionGRSysID,
                        upgradeSessionGRSysIDChanged: false,
                        targetPatch: targetPatchLabel,
                        currentPatch: currentPatchLabel,
                        totalSteps: totalCount,
                        activeStepLabel: activeLabel,
                        activeStepCount: stateCounts["COMPLETE"] ? (stateCounts["COMPLETE"] + 1) : 1
                    };
                }

                return {
                    state: "PLAYBOOK_IN_PROGRESS",
                    sys_id: upgradeSessionGRSysID,
                    upgradeSessionGRSysIDChanged: false,
                    targetPatch: targetPatchLabel,
                    currentPatch: currentPatchLabel,
                    totalSteps: 0,
                    activeStepLabel: "",
                    activeStepCount: 1
                };
            } else {
                return {
                    state: "PLAYBOOK_NOT_STARTED"
                };
            }
        } catch (error) {
            gs.error("Error in UpgradeManagementApiUtilOverview: checkIfBulkAppUpdateInProgress() " + error);
            return { state: "PLAYBOOK_NOT_STARTED" };
        }
    },

    cancelBulkAppUpdateSession: function() {
        try {
            var upgradeSessionGR = new GlideRecord('sn_um_upgrade_sessions');
            upgradeSessionGR.addQuery('status', 'in_progress');
            upgradeSessionGR.addQuery('session_type', 'bulk_app_update');
            upgradeSessionGR.orderByDesc('sys_updated_on');
            upgradeSessionGR.setLimit(1);
            upgradeSessionGR.query();

            if (upgradeSessionGR.next()) {
                upgradeSessionGR.setValue("status", "cancelled");

                var upgradeSessionSysId = upgradeSessionGR.getValue("sys_id");
                var upgradePlan = upgradeSessionGR.getValue("upgrade_plan");
                var upgradePreviewExecutionTracker = upgradeSessionGR.getValue("upgrade_preview_execution_tracker");
                var upgradePreview = upgradeSessionGR.getValue("upgrade_preview");
                var contextId = upgradeSessionGR.getValue("sys_pd_context_id");
                var batchInstallSchedule = upgradeSessionGR.getValue("batch_app_install_schedule");

                this.cancelUpgradePlan(upgradePlan);
                this.cancelUpgradePreviewExecutionTrackers(upgradePreviewExecutionTracker, null);
                this.cancelUpgradePreviews(upgradePreview, null);
                this.cancelPlaybook(contextId);

                // Cleanup #1 — Update Applications page path:
                // BulkUpdateAppUtils.scheduleBatchInstallFromUpgradePlan creates ONE
                // sys_installation_schedule and stores its sys_id on the session.
                // Delete that schedule (cascades to its items) so the next BU flow
                // doesn't inherit ready items.
                if (batchInstallSchedule) {
                    try {
                        var bulkUtil = new sn_upgrade_mgmt.BulkUpdateAppUtils();
                        var delResult = bulkUtil.deleteScheduleInstall(upgradeSessionSysId);
                        if (delResult && delResult.success) {
                            upgradeSessionGR.setValue("batch_app_install_schedule", "");
                        } else {
                            gs.warn("cancelBulkAppUpdateSession: failed to delete batch schedule "
                                + batchInstallSchedule + " — " + (delResult && delResult.error));
                        }
                    } catch (cleanupErr) {
                        gs.error("cancelBulkAppUpdateSession: batch schedule cleanup failed - " + cleanupErr);
                    }
                }

                // Cleanup #2 — Review Update Results page path:
                // "Handle Batch Schedule Selected Apps" client script calls REST
                // /api/sn_appclient/v1/appmanager/schedule?action=create_schedule
                // ONCE PER SELECTED APP, creating N sys_installation_schedule rows
                // and never updating session.batch_app_install_schedule. Cleanup #1
                // doesn't catch these. Find ready items linked to this session's
                // plan apps within this session's lifetime, then delete each
                // distinct parent schedule via the privileged platform API.
                try {
                    var sessionStart = upgradeSessionGR.getValue("sys_created_on");
                    if (sessionStart && upgradePlan) {
                        var planAppIds = [];
                        var grPlanItem = new GlideRecord("sys_upgrade_plan_item");
                        grPlanItem.addQuery("upgrade_plan", upgradePlan);
                        grPlanItem.addQuery("active", true);
                        grPlanItem.query();
                        while (grPlanItem.next()) {
                            var pid = grPlanItem.getValue("id");
                            if (pid) planAppIds.push(pid);
                        }

                        if (planAppIds.length > 0) {
                            var orphanScheduleIds = {};
                            var grItem = new GlideRecord("sys_installation_schedule_item");
                            grItem.addQuery("state", "ready");
                            grItem.addQuery("source_app_id", "IN", planAppIds.join(","));
                            grItem.addQuery("sys_created_on", ">=", sessionStart);
                            grItem.query();
                            while (grItem.next()) {
                                var parentSched = grItem.getValue("schedule");
                                if (parentSched) orphanScheduleIds[parentSched] = true;
                            }

                            var perAppApiUtil = new global.UpgradeManagementApiUtil();
                            for (var schedSysId in orphanScheduleIds) {
                                try {
                                    perAppApiUtil.deleteScheduleUpdateForTheApp(schedSysId);
                                } catch (perAppErr) {
                                    gs.warn("cancelBulkAppUpdateSession: per-app schedule cleanup failed for "
                                        + schedSysId + " — " + perAppErr);
                                }
                            }
                        }
                    }
                } catch (perAppPathErr) {
                    gs.error("cancelBulkAppUpdateSession: per-app schedule cleanup error - " + perAppPathErr);
                }

                upgradeSessionGR.update();
            } else {
                gs.info('UpgradeManagementApiUtilOverview: No in_progress bulk app update sessions found to cancel.');
            }
        } catch (e) {
            gs.error("Error in UpgradeManagementApiUtilOverview: cancelBulkAppUpdateSession() " + e);
        }
    },


    logClientError: function(payload) {
        try {
            var data = JSON.parse(payload);
            var source = data.source || 'Unknown';
            var message = data.message || '';
            var level = data.level || 'error';
            var logMessage = '[UpgradeConsole][' + source + '] ' + message;

            if (level === 'error') {
                gs.error(logMessage);
            } else if (level === 'warn') {
                gs.warn(logMessage);
            } else {
                gs.info(logMessage);
            }
            return { success: true };
        } catch (e) {
            gs.error('UpgradeManagementApiUtilOverview: logClientError failed - ' + e.message);
            return { success: false };
        }
    },


    type: 'UpgradeManagementApiUtilOverview'
};

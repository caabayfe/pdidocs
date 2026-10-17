var ProminPlaybookUtilSNC = Class.create();
ProminPlaybookUtilSNC.prototype = {
    initialize: function() {
        this.SN_PO_PLUGIN_SCOPE_ID = '885d9eb1db6710104fcdebca13961927';
    },

    getPlaybooksForProject: function(projectId) {
        try {
            var playbooks = [];
            var gr = new GlideRecordSecure('promin_playbook');
            gr.addQuery('project', projectId);
            gr.query();
            while (gr.next()) {
                playbooks.push({
                    id: gr.getUniqueValue(),
                    playbookId: gr.getValue('playbook_id'),
                    requestId: gr.getValue('request_id'),
                    name: gr.getDisplayValue('name'),
                    createdOn: gr.getValue('sys_created_on'),
                    createdBy: gr.getValue('sys_created_by'),
                    state: {
                        value: gr.getValue('state'),
                        label: gr.getDisplayValue('state')
                    },
                    variants: gr.getValue('variants'),
                    snapshot: this.__getPlaybookAttachmentId(gr.getUniqueValue())
                });
            }
            return {
                success: true,
                playbooks: playbooks,
            };
        } catch (err) {
            gs.error(err);
            return {
                success: false,
                playbooks: [],
            };
        }
    },

    deletePlaybook: function(sysId) {
        try {
            var isDeleted = new global.ProminUtils().deleteProminPlaybook(sysId);
            if (isDeleted) {
                return {
                    success: true,
                    message: gs.getMessage('Playbook deleted successfully.'),
                };
            }
            return {
                success: false,
                message: gs.getMessage('Playbook deletion failed.'),
            };

        } catch (err) {
            gs.error(err);
            return {
                success: false,
                message: gs.getMessage('Playbook deletion failed.'),
            };
        }
    },

    generatePlaybookFromVariants: function(payload) {
        try {
            // Check if a playbook record already exists for given project and variants
            var grPb = new GlideRecordSecure('promin_playbook');
            grPb.addQuery('project', payload.projectId);
            grPb.addQuery('variants', payload.variants);
            grPb.query();
            if (grPb.next()) {
                return {
                    success: true,
                    message: "",
                    sysId: grPb.getUniqueValue(),
                    playbookId: grPb.getValue('playbook_id'),
                    requestId: grPb.getValue('request_id')
                };
            }

            if (!global.PlaybookDesignerAPI) {
                gs.error('PlaybookDesignerAPI is not available');
                return {
                    success: false,
                    message: gs.getMessage('Playbook generation is not available. Contact your Administrator.'),
                    sysId: null,
                    requestId: null,
                    playbookId: null
                };
            }
            // var currentScope = gs.getCurrentApplicationId();
            // We should ideally use current user scope create playbook.
            // But, for now, we'll use global scope since playbook has a scope related issue.
            var generatePlaybookResponse = global.PlaybookDesignerAPI.generatePlaybook({
                prompt: payload.prompt,
                additionalPlaybookInfo: {
                    label: payload.playbookLabel,
                    sysScope: 'global'
                },
                meta: {
                    projectId: payload.projectId,
                    variants: payload.variants,
                    sysDomain: 'global'
                },
                callbackHandler: 'sn_po.ProminPlaybookUtil',
            });
            // Create promin playbook record
            var sysId = this.__createProminPlaybook(generatePlaybookResponse.requestId, payload.projectId, payload.playbookLabel, 'NEW', payload.variants);
            return {
                success: true,
                message: "",
                sysId: sysId,
                requestId: generatePlaybookResponse.requestId,
                playbookId: null,
            };
        } catch (err) {
            gs.error(err);
            return {
                success: false,
                message: err || gs.getMessage('Error while generating playbook.'),
                sysId: null,
                requestId: null,
                playbookId: null
            };
        }
    },
    /**
     * Callback function to be executed when the playbook generation is successful.
     */
    generationUpdated: function(state, requestId, meta, playbookJSON) {
        try {
            switch (state) {
                case 'NEW':
                    // do nothing
                    break;
                case 'IN_PROGRESS':
                case 'COMPLETE':
                    this.__updateProminPlaybookState(requestId, 'IN_PROGRESS');
                    break;
                case 'PERSISTED': {
                    // Playbook has been saved
                    var playbookId = JSON.parse(playbookJSON).process.sysId.value;
                    this.__updateProminPlaybookState(requestId, 'COMPLETED', playbookId);
                    break;
                }
                case 'CANCELLED':
                    this.__updateProminPlaybookState(requestId, 'CANCELLED');
                    break;
            }
        } catch (e) {
            gs.error(e);
        }
    },

    /**
     * Callback function to be executed when the playbook generation is errored.
     */
    generationError: function(message, requestId, meta) {
        var logInfo = {
            message: message,
            requestId: requestId,
            meta: meta
        };
        gs.error("Playbook generation failed with error {0}", message);
    },

    __createProminPlaybook: function(requestId, projectId, label, state, variants) {
        try {
            // Check project permissions
            var grProject = new GlideRecord('promin_project');
            grProject.get(projectId);
            if (!grProject.canWrite()) {
                throw new error("You do not have permission to update current promin project");
            }

            var grPb = new GlideRecord('promin_playbook');
            grPb.initialize();
            grPb.setValue('name', label);
            grPb.setValue('request_id', requestId);
            grPb.setValue('project', projectId);
            grPb.setValue('variants', variants);
            grPb.setValue('state', state);
            var sysId = grPb.insert();
            return sysId;
        } catch (e) {
            gs.error("Error while creating a promin_playbook record {0}", e);
            return null;
        }
    },

    __updateProminPlaybookState: function(requestId, state, playbookId) {
        try {
            var gr = new GlideRecord('promin_playbook');
            gr.addQuery('request_id', requestId);
            gr.query();
            while (gr.next()) {
                if (!gr.project.getRefRecord().canWrite()) {
                    throw new error("You do not have permission to update current promin project");
                }
                gr.setValue('state', state);
                if (playbookId) {
                    gr.setValue('playbook_id', playbookId);
                }
                var id = gr.update(); 
                if (gs.nil(id)) {
                    gs.error("Error while updating promin_playbook record state");
                }   
            }
        } catch (e) {
            gs.error("Error while updating promin_playbook record state {0}", e);
        }
    },

    __getPlaybookAttachmentId: function(requestId) {
        try {
            var grAt = new GlideRecord('sys_attachment');
            grAt.addQuery("table_sys_id", requestId);
            grAt.query();
            if (grAt.next()) {
                return grAt.getUniqueValue();
            }
            return null;
        } catch (e) {
            gs.error("Error while fetching attachment for promin_playbook {0}", e);
            return null;
        }
    },

	getPlaybookExecutionsCount: function(encodedQuery) {
		try {
			var ga = new GlideAggregate("sys_pd_context");
			ga.addUserEncodedQuery(encodedQuery);
			ga.addAggregate('COUNT');
			ga.query();
			if (ga.next()) {
				return {
					count: ga.getAggregate('COUNT')
				};
			}
			return {
				count: 0
			};
		} catch (error) {
			return {
				count: 0
			};
		}
	},

    type: 'ProminPlaybookUtilSNC'
};

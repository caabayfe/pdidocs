/* global sn_ent */
var AssetReclamationUtil = Class.create();
AssetReclamationUtil.prototype = {

	IS_HAMP_ACTIVE: GlidePluginManager.isActive('com.sn_hamp'),
	IS_SAMP_ACTIVE: GlidePluginManager.isActive('com.snc.samp'),
	IS_EAM_ACTIVE: GlidePluginManager.isActive('com.sn_eam'),
	IS_ENT_ACTIVE: GlidePluginManager.isActive('com.sn_ent'),
	HAMP_RECLAIM_LINE_TABLE: 'sn_hamp_asset_reclaim_line',
	EAM_RECLAIM_TASK_TABLE: 'sn_eam_reclaim_task',
	SAMP_RECLAIM_LINE_TABLE: 'samp_asset_reclaim_line',
	EAM_RECLAIM_LINE_TABLE: 'sn_eam_reclaim_line',
	HAMP_RECLAIM_TASK_TABLE: 'sn_hamp_asset_reclaim_task',
	STATE_WORK_IN_PROGRESS: 2,
	STATE_CANCELED: 'canceled',
	STATE_CLOSED_INCOMPLETE: 4,
	STATE_OPEN: 1,

	filterRequestedForUsers: function(role, sysId) {
		if (role.toString() === 'manager') {
			return 'manager=' + sysId;
		}
		return '';
	},

	closeAssetReclamationRequest: function(assetReclamationRequestID) {
		var reclaimLinesClosed = this.checkHAMLinesClosed(assetReclamationRequestID);
		if (reclaimLinesClosed) {
			reclaimLinesClosed = this.checkSAMLinesClosed(assetReclamationRequestID);
		}
		if (reclaimLinesClosed) {
			reclaimLinesClosed = this.checkEAMLinesClosed(assetReclamationRequestID);
		}
		if (reclaimLinesClosed) {
			this.updateAssetReclaimRequestState(assetReclamationRequestID);
		}
	},

	checkHAMLinesClosed: function(assetReclamationRequestID) {
		if (!this.IS_HAMP_ACTIVE) {
			return true;
		}
		var hamLineQuery = new global.GlideQuery('sn_hamp_asset_reclaim_line')
			.where('asset_reclaim_request', assetReclamationRequestID);
		var totalHamLines = hamLineQuery.count();
		var totalHamLinesClosed = hamLineQuery.where('stage', 'IN', ['closed_complete', 'closed_skipped']).count();
		if (totalHamLines === totalHamLinesClosed) {
			return true;
		}
		return false;
	},

	checkSAMLinesClosed: function(assetReclamationRequestID) {
		if (!this.IS_SAMP_ACTIVE) {
			return true;
		}
		var samLineQuery = new global.GlideQuery('samp_asset_reclaim_line')
			.where('asset_reclaim_request', assetReclamationRequestID);
		var totalSAMLines = samLineQuery.count();
		var totalSAMLinesClosed = samLineQuery.where('state', 'IN', ['completed', 'canceled', 'failed']).count();
		if (totalSAMLines === totalSAMLinesClosed) {
			return true;
		}
		return false;
	},

	checkEAMLinesClosed: function(assetReclamationRequestID) {
		if (this.IS_EAM_ACTIVE && sn_eam.EAMUtils.checkEAMReclaimLinesClosed) {
			return sn_eam.EAMUtils.checkEAMReclaimLinesClosed(assetReclamationRequestID);
		}
		return true;
	},

	updateAssetReclaimRequestState: function(assetReclamationRequestID) {
		var assetReclaimRequestState = 3; // completed

		var failedLines = 0;
		// Check the status of HAM lines
		if (this.IS_HAMP_ACTIVE) {
			failedLines = new global.GlideQuery('sn_hamp_asset_reclaim_line')
				.where('asset_reclaim_request', assetReclamationRequestID)
				.where('stage', 'closed_skipped')
				.count();
		}

		// If there are no failed HAM lines
		if (failedLines === 0) {
			// Check the status of SAM lines
			if (this.IS_SAMP_ACTIVE) {
				failedLines = new global.GlideQuery('samp_asset_reclaim_line')
					.where('asset_reclaim_request', assetReclamationRequestID)
					.where('state', 'failed')
					.count();
			}
		}

		// If there are no failed SAM lines
		if (failedLines === 0) {
			// Check the status of EAM lines
			if (this.IS_EAM_ACTIVE && sn_eam.EAMUtils.getFailedReclaimLines) {
				failedLines = sn_eam.EAMUtils.getFailedReclaimLines(assetReclamationRequestID);
			}
		}
		if (failedLines > 0) {
			assetReclaimRequestState = 4; // completed with errors
		}

		new global.GlideQuery('asset_reclamation_request')
			.where('sys_id', assetReclamationRequestID)
			.update({
				state: assetReclaimRequestState,
			});
	},

	closeFlowContexts: function(assetReclamationRequest) {
		this.cancelFlowContextForReclaimLine('com.sn_hamp', assetReclamationRequest.getUniqueValue(), 'sn_hamp_asset_reclaim_line');
		this.cancelFlowContextForReclaimLine('com.snc.samp', assetReclamationRequest.getUniqueValue(), 'samp_asset_reclaim_line');
		this.cancelFlowContextForReclaimLine('com.sn_eam', assetReclamationRequest.getUniqueValue(), 'sn_eam_reclaim_line');
	},

	cancelFlowContextForReclaimLine: function(pluginName, assetReclamationRequestID, table) {
		if (GlidePluginManager.isActive(pluginName)) {
			var gr = new GlideRecord(table);
			gr.addQuery('asset_reclaim_request', assetReclamationRequestID);
			gr.query();
			while (gr.next()) {
				if (gr.getValue('flow_context') != null) {
					sn_fd.FlowAPI.cancel(gr.getValue('flow_context'), 'Canceling flow because trigger record is deleted');
				}
			}
		}
	},
	getAssetsToExclude: function(requestedFor) {
		var list = [];
		if (requestedFor + '' === '') {
			return list;
		}
		var gr = new GlideRecordSecure('asset_reclamation_request');
		gr.addQuery('requested_for', requestedFor);
		// Requests in New/In-Progress state
		gr.addQuery('state', 'IN', '1,2');
		gr.query();
		while (gr.next()) {
			list.push(gr.getValue('assets'));
		}
		list = list.join(',');
		return list;
	},

	getRefQualForAssetManager: function() {
		// if current user does not have asset nor eam manager roles then nothing can be reclaimed
		if (!gs.hasRole('sn_eam.enterprise_asset_manager') && !gs.hasRole('asset') && !gs.hasRole('sn_eam.asset_manager')) {
			return '^sys_id=NULL';
		}

		var refQual = '';

		// User has required roles
		// HAM or SAM is installed
		if (this.IS_HAMP_ACTIVE || this.IS_SAMP_ACTIVE) {
			if (this.IS_ENT_ACTIVE && sn_ent.EnterpriseContentEAMUtils.getEAMModelClasses) {
				if (!this.IS_EAM_ACTIVE || (!gs.hasRole('sn_eam.enterprise_asset_manager') && !gs.hasRole('sn_eam.asset_manager'))) {
					// EAM is not installed or user does not have EAM role then exclude enterprise assets
					refQual += '^model=NULL^ORmodel.sys_class_nameNOT IN' + sn_ent.EnterpriseContentEAMUtils.getEAMModelClasses();
				} else if (!gs.hasRole('asset')) {
					// EAM is installed and user only has enterprise manager roles then only show enterprise assets
					refQual += this.fetchEAMReferenceQualifier();
				} else if (!gs.hasRole('sn_eam.enterprise_asset_manager') && sn_eam.EAMRolesUtils && sn_eam.EAMRolesUtils.excludeAssetClassesForUser) {
					// EAM is installed and user has asset role but not enterprise asset manager role
					// exclude classes based on the role
					refQual += '^model=NULL^ORmodel.sys_class_nameNOT IN' + sn_eam.EAMRolesUtils.excludeAssetClassesForUser();
				}
			}
		} else if (this.IS_ENT_ACTIVE && sn_ent.EnterpriseContentEAMUtils.getEAMModelClasses && this.IS_EAM_ACTIVE && (gs.hasRole('sn_eam.enterprise_asset_manager')
		|| gs.hasRole('sn_eam.asset_manager'))) {
			// EAM is installed then limit to only enterprise assets
			refQual += this.fetchEAMReferenceQualifier();
		} else {
			// Nothing is installed
			return '^sys_id=NULL';
		}
		return refQual;
	},

	getRefQual: function(requestedFor, requestedBy) {
		var refQual = '';

		// 1. Show assets which are not part of other reclamation request.
		if (requestedFor + '' !== '') {
			refQual += 'sys_idNOT IN' + this.getAssetsToExclude(requestedFor);
			refQual += '^assigned_to=' + requestedFor + '^';
		}

		// 2. Assets in in-use(1), in-maintenance(3), consumed(10)
		refQual += 'install_status=1^ORinstall_status=3^ORinstall_status=10';

		// 3. Only simple/parent assets can be reclaimed
		refQual += '^parent=NULL';

		// 4. Exclude software assets
		refQual += '^sys_class_name!=alm_license';

		if (requestedBy + '' === 'asset_manager') {
			refQual += this.getRefQualForAssetManager();
			return refQual;
		}

		// 1. If EAM is not installed then
		// EAM assets cannot be reclaimed
		// 2. If only EAM is installed then
		// Only EAM assets which are either simple or parent can be reclaimed
		// 3. If HAM & EAM are installed then
		// All enterprise & hardware assets which are either simple or parent can be reclaimed

		// HAM or SAM is installed
		if (this.IS_HAMP_ACTIVE || this.IS_SAMP_ACTIVE) {
			if (this.IS_ENT_ACTIVE && sn_ent.EnterpriseContentEAMUtils.getEAMModelClasses) {
				if (!this.IS_EAM_ACTIVE) {
					// EAM is not installed, then exclude enterprise assets
					refQual += '^model=NULL^ORmodel.sys_class_nameNOT IN' + sn_ent.EnterpriseContentEAMUtils.getEAMModelClasses();
					// also, exclude asset classes not covered by the above which may not require models
					refQual += 'sys_class_nameNOT IN' + sn_ent.EnterpriseContentEAMUtils.getEAMUnactionableAssetClasses();
				}
			}
		} else if (this.IS_EAM_ACTIVE) {
			if (this.IS_ENT_ACTIVE && sn_ent.EnterpriseContentEAMUtils.getEAMModelClasses) {
				// HAM and SAM are not installed, but EAM is installed, then limit to only enterprise assets
				refQual += '^model!=NULL^model.sys_class_nameIN' + sn_ent.EnterpriseContentEAMUtils.getEAMModelClasses();
			}
		} else {
			refQual += '';
		}
		return refQual;
	},

	validateAssetReclamationRequest: function(assetReclamationRequest) {
		var mandatoryFields;
		// Asset manager is only available for HAM (asset role) and EAM (asset_manager role)
		if (assetReclamationRequest.requested_by + '' === 'asset_manager') {
			mandatoryFields = ['reclaim_date'];
		} else {
			mandatoryFields = ['requested_for', 'reclaim_date'];
		}
		for (var i = 0; i < mandatoryFields.length; i++) {
			if (gs.nil(current.getValue(mandatoryFields[i]))) {
				return false;
			}
		}
		if (!gs.hasRole('admin')) {
			var requestedBy = assetReclamationRequest.getValue('requested_by');
			if (requestedBy === 'manager' && assetReclamationRequest.requested_for.manager.toString() !== gs.getUserID()) {
				return false;
			} if (requestedBy === 'user') {
				if (assetReclamationRequest.requested_for.toString() !== gs.getUserID()
						|| assetReclamationRequest.getValue('employee_separation') === 'true') {
					return false;
				}
			}
		}

		// validate assets
		if (assetReclamationRequest.getValue('requested_by') === 'asset_manager') {
			return true;
		}
		var assets = assetReclamationRequest.getValue('assets');
		var assetsGR = new GlideRecord('alm_asset');
		assetsGR.addQuery('assigned_to', assetReclamationRequest.getValue('requested_for'));
		assetsGR.addEncodedQuery('sys_id IN ' + assets);
		assetsGR.query();
		var validAssets = assetsGR.getRowCount() === assets.split(',').length;
		if (!validAssets) {
			return false;
		}

		return true;
	},

	cancelReclamationOrder: function(assetReclamationRequestID) {
		if (this.IS_HAMP_ACTIVE) {
			this.cancelLinesAndTasks(this.HAMP_RECLAIM_LINE_TABLE, this.HAMP_RECLAIM_TASK_TABLE,
				assetReclamationRequestID);
		}
		if (this.IS_EAM_ACTIVE) {
			this.cancelLinesAndTasks(this.EAM_RECLAIM_LINE_TABLE, this.EAM_RECLAIM_TASK_TABLE,
				assetReclamationRequestID);
		}
		if (this.IS_SAMP_ACTIVE) {
			var gr = new GlideRecord(this.SAMP_RECLAIM_LINE_TABLE);
			gr.addQuery('asset_reclaim_request', assetReclamationRequestID);
			gr.query();
			while (gr.next()) {
				gr.state = this.STATE_CANCELED;
				gr.update();
			}
		}
	},

	cancelLinesAndTasks: function(reclaimLineTable, reclaimTaskTable, assetReclamationRequestID) {
		var gr = new GlideRecord(reclaimLineTable);
		gr.addQuery('asset_reclaim_request', assetReclamationRequestID);
		gr.query();
		while (gr.next()) {
			var reclaimLineId = String(gr.sys_id);
			gr.stage = 'closed_skipped';
			gr.update();
			new global.GlideQuery(reclaimTaskTable)
				.where('asset_reclaim_line', reclaimLineId)
				.where(new global.GlideQuery().where('state', this.STATE_OPEN).orWhere('state', this.STATE_WORK_IN_PROGRESS))
				.updateMultiple({ state: this.STATE_CLOSED_INCOMPLETE });
		}
	},

	fetchEAMReferenceQualifier: function() {
		var refQual = '^model!=NULL';
		if (gs.hasRole('sn_eam.enterprise_asset_manager')) {
			refQual += '^model.sys_class_nameIN' + sn_ent.EnterpriseContentEAMUtils.getEAMModelClasses();
		} else if (sn_eam.EAMRolesUtils && sn_eam.EAMRolesUtils.getModelClassesForUser) {
			// User has asset_manager role so fetch classes based on the role i.e of user has EAM asset manager role.
			refQual += '^model.sys_class_nameIN' + sn_eam.EAMRolesUtils.getModelClassesForUser();
		}
		return refQual;
	},

	canWriteAssetReclamationWorkNotes: function(reclaimGR) {
		return reclaimGR.getValue('opened_by') === gs.getUserID() || gs.hasRole('inventory_user') || reclaimGR.getValue('requested_for') === gs.getUserID();
	},

	type: 'AssetReclamationUtil',
};

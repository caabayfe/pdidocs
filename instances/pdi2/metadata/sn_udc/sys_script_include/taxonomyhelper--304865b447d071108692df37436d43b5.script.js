class TaxonomyHelper {
	static type = 'TaxonomyHelper';
	static SN_UDC_DEFAULT_TAXONOMY = 'sn_udc_default_taxonomy';
	static SN_UDC_TAXONOMY_MODULE = 'sn_udc_file_taxonomy_type_module';
	static SN_UDC_TAXONOMY = 'sn_udc_file_taxonomy_type';
	static SN_UDC_TAXONOMY_CATEGORY = 'sn_udc_file_taxonomy_category';
	static SN_UDC_DEFAULT_TAXONOMY = {
		sys_hub_flow: 'flow',
		sys_hub_action_type_definition: 'action',
		sys_pd_process_definition: 'process',
		sys_decision: 'decision-table',
		sys_flow_context: 'flow-execution',
		sys_ih_spoke: 'spoke',
	};

	static TAXONOMIES = {
		flow: {
			builderLabel: gs.getMessage('Flow'),
			icon: 'workflow-outline',
			editorUrl: '/$flow-designer.do?sysparm_nostack=true#/flow-designer/{{ASSET-ID}}',
			creatorUrl: '/now/ws-asset/create-asset/flow',
			recordLabelField: 'name',
			recordNameField: 'name',
			tableName: 'sys_hub_flow',
		},
		subflow: {
			builderLabel: gs.getMessage('Subflow'),
			icon: 'workflow-outline',
			editorUrl: '/$flow-designer.do?sysparm_nostack=true#/sub-flow-designer/{{ASSET-ID}}',
			creatorUrl: '/now/ws-asset/create-asset/subflow',
			recordLabelField: 'name',
			recordNameField: 'name',
			tableName: 'sys_hub_flow',
		},
		template: {
			builderLabel: gs.getMessage('Flow template'),
			icon: 'workflow-outline',
			editorUrl:
				'/$flow-designer.do?sysparm_nostack=true#/flow-template-designer/{{ASSET-ID}}',
			creatorUrl: '/now/ws-asset/create-asset/flow-template',
			recordLabelField: 'name',
			recordNameField: 'name',
			tableName: 'sys_app_template',
		},
		action: {
			builderLabel: gs.getMessage('Action'),
			icon: 'workflow-outline',
			editorUrl: '/$flow-designer.do?sysparm_nostack=true#/action-designer/{{ASSET-ID}}',
			creatorUrl: '/now/ws-asset/create-asset/action',
			recordLabelField: 'name',
			recordNameField: 'name',
			tableName: 'sys_hub_action_type_definition',
		},
		process: {
			builderLabel: gs.getMessage('Playbook'),
			icon: 'workflow-outline',
			editorUrl: '/now/process/designer/{{ASSET-ID}}',
			creatorUrl: '/now/ws-asset/create-asset/process',
			recordLabelField: 'label',
			recordNameField: 'name',
			tableName: 'sys_pd_process_definition',
		},
		'decision-table': {
			builderLabel: gs.getMessage('Decision table'),
			icon: 'workflow-outline',
			editorUrl: '/now/decisiondesigner/decisiontable-designer/{{ASSET-ID}}',
			creatorUrl: '/now/ws-asset/create-asset/decision-table',
			recordLabelField: 'label',
			recordNameField: 'name',
			tableName: 'sys_decision',
		},
		datastream: {
			builderLabel: gs.getMessage('Data stream'),
			assetIcon: 'workflow-outline',
			editorUrl: '/$flow-designer.do?sysparm_nostack=true#/action-designer/{{ASSET-ID}}',
			creatorUrl: '/now/ws-asset/create-asset/datastream',
			recordLabelField: 'name',
			recordNameField: 'name',
			tableName: 'sys_hub_action_type_definition',
		},
		'flow-execution': {
			builderLabel: gs.getMessage('Flow execution'),
			assetIcon: 'workflow-outline',
			editorUrl: '/$flow-designer.do?sysparm_nostack=true#/operations/context/{{ASSET-ID}}',
			recordLabelField: 'name',
			recordNameField: 'name',
			tableName: 'sys_flow_context',
		},
		spoke: {
			builderLabel: gs.getMessage('Spoke'),
			assetIcon: 'workflow-outline',
			editorUrl: '/$flow-designer.do?sysparm_nostack=true#/spoke-builder/{{ASSET-ID}}',
			creatorUrl: '/$flow-designer.do?sysparm_nostack=true#/spoke-builder/new',
			recordLabelField: 'name',
			recordNameField: 'name',
			tableName: 'sys_scope',
		},
	};

	static getTaxonomyFileDetails(tableName, sysId, builderId) {
		const errorMessage = gs.getMessage(
			'Check the Sys ID, Builder ID, and Table name for any errors before trying again.'
		);
		const invalidBuilderErrorMsg = gs.getMessage('Builder not found');
		const invalidAssetErrorMsg = gs.getMessage('Asset not found');

		if (!tableName || !sysId || !tableName.trim() || !sysId.trim())
			return new sn_ws_err.BadRequestError(`${invalidBuilderErrorMsg}: ${errorMessage}`);

		const gr = new GlideRecord('sys_db_object');
		if (!gr.get('name', tableName))
			return new sn_ws_err.BadRequestError(`${invalidBuilderErrorMsg}: ${errorMessage}`);

		builderId = builderId || this.SN_UDC_DEFAULT_TAXONOMY[tableName];
		const builderDetails = this.TAXONOMIES[builderId];
		if (!builderDetails)
			return new sn_ws_err.BadRequestError(`${invalidBuilderErrorMsg}: ${errorMessage}`);

		const assetData = this.#getAssetData(
			sysId,
			tableName,
			builderDetails.recordNameField,
			builderDetails.recordLabelField
		);

		if (!assetData)
			return new sn_ws_err.BadRequestError(`${invalidAssetErrorMsg}: ${errorMessage}`);

		const response = {
			url: UDCUtil.isNewAsset(sysId)
				? builderDetails.creatorUrl
				: builderDetails.editorUrl.replace('{{ASSET-ID}}', sysId),
			title: assetData.title,
			name: assetData.name,
			sysId,
			icon: builderDetails.icon,
			builderId,
			builderLabel: builderDetails.builderLabel,
			table: builderDetails.tableName,
			scope: assetData.scope,
		};
		return response;
	}

	static #getAssetData(sysId, tableName, recordNameField, recordLabelField) {
		if (UDCUtil.isNewAsset(sysId)) {
			return {
				name: '',
				title: '',
				scope: {},
			};
		}
		let assetData = null;
		const gr = global.UDCGlobal.getGlideRecordSecureForTable(tableName);
		if (gr.get(sysId)) {
			const name = gr.getValue(recordNameField);
			const label = gr.getValue(recordLabelField);
			assetData = {};
			assetData.name = name;
			assetData.title = label || name;
			assetData.scope = this.#getScopeDetails(gr.getValue('sys_scope'));
		}

		return assetData;
	}

	static #getScopeDetails(scopeId) {
		const scope = {};
		const gr = new GlideRecord('sys_scope');
		if (gr.get(scopeId)) {
			scope.id = scopeId;
			scope.label = gr.getValue('name');
			scope.name = gr.getValue('scope');
		}
		return scope;
	}
}

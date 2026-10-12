var FlowDiagramTranslateModel = Class.create();
FlowDiagramTranslateModel.prototype = {
    initialize: function() {
    },

    type: 'FlowDiagramTranslateModel'
};

FlowDiagramTranslateModel.getNodeModel = function () {
	return {
		key: "",
		node_id: "",
		name: "",
		instance_sys_id: "",
		definition_sys_id: "",
		instanceType: "",
		depth: '',
		data: {}
	};
};

FlowDiagramTranslateModel.getEdgeModel = function () {
	return {
		from: "",
		to: "",
		edge_id: "",
		linkLabel: "",
		labelColor: "",
		addBtnVisibility: "",
		addBtnText: "",
		hideToArrow: false
	};
};

FlowDiagramTranslateModel.getActionInputModel = function () {
	return {
		sys_id: "",
		name: "",
		value: "",
	};
};

FlowDiagramTranslateModel.getActionInstanceModel = function () {
	return {
		key: "",
		sys_id: "",
		order: "",
		action_type_sys_id: "",
		actionInputs: [],
		diagram_action_id: "",
	};
};

FlowDiagramTranslateModel.getNodeDefModel = function () {
	return {
		name: "",
		sys_id: "",
	};
};

FlowDiagramTranslateModel.getVariableModel = function () {
	return {
	};
};

FlowDiagramTranslateModel.getNodeArgumentModel = function () {
	return {
	};
};

FlowDiagramTranslateModel.getDiagramJSONModel = function () {
	return {
		nodes: [],
		edges: [],
		variables: [],
		node_arguments: [],
	};
};

FlowDiagramTranslateModel.getFlowModel = function () {
	return {
		sys_id:"",
		type: "",
		actionInstances: [],
	};
};

FlowDiagramTranslateModel.getUpdateRecordAncestorModel = function () {
	return {
		order: "",
		table_name: "",
		sys_id: "",
		key: "",
	};
};

FlowDiagramTranslateModel.getUpdateRecordModel = function () {
	return {
		ancestors: [],
		order: "",
		table_name: "",
		sys_id: "",
		key: "",
		action: "",
		diagram_action_id: "",
	};
};

FlowDiagramTranslateModel.getSupplementalDataModel = function () {
	return {
		flow: null,
		update_records: [],
		node_defs: [],
	};
};

FlowDiagramTranslateModel.getDataModel = function () {
	return {
		diagramJSON: null,
		supplemental_data: null,
		name: "",
	};
};

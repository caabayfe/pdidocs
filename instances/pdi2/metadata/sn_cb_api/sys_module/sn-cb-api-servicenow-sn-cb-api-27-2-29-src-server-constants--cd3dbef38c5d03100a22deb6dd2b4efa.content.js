export const TABLE_NAME = 'sys_ux_macroponent';

export const FIELD_SYS_ID = 'sys_id';
export const FIELD_EXTENDS = 'extends';
export const FIELD_BUNDLES = 'bundles';
export const FIELD_COMPOSITION = 'composition';
export const FIELD_DATA = 'data';
export const FIELD_LAYOUT = 'layout';
export const FIELD_NAME = 'name';
export const FIELD_DESCRIPTION = 'description';
export const FIELD_PROPS = 'props';
export const FIELD_HANDLED_EVENTS = 'handled_events';
export const FIELD_DISPATCHED_EVENTS = 'dispatched_events';
export const FIELD_INTERNAL_EVENT_MAPPINGS = 'internal_event_mappings';
export const FIELD_ROOT_COMPONENT = 'root_component';
export const FIELD_ROOT_COMPONENT_CONFIG = 'root_component_config';
export const FIELD_ROOT_COMPONENT_DEFINITION = 'root_component_definition';
export const FIELD_ASSOCIATED_TYPES = 'associated_types';
export const FIELD_CATEGORY = 'category';
export const FEILD_STATE_PROPERTIES = 'state_properties';
export const FIELD_REQUIRED_TRANSALTIONS = 'required_translations';
export const FIELD_EXT_CONTROLLER_DEP = 'ext_controller_dep';
export const FIELD_EXTENSION_POINT = 'extension_point';
export const FIELD_SYS_POLICY = 'sys_policy';
export const FIELD_SCOPE = 'scope';
export const FIELD_SYS_PACKAGE = 'sys_package';

export const FIELDS_TO_DUPLICATE = [
	FIELD_EXTENDS,
	FIELD_BUNDLES,
	FIELD_COMPOSITION,
	FIELD_DATA,
	FIELD_LAYOUT,
	FIELD_PROPS,
	FIELD_HANDLED_EVENTS,
	FIELD_DISPATCHED_EVENTS,
	FIELD_INTERNAL_EVENT_MAPPINGS,
	FIELD_ROOT_COMPONENT,
	FIELD_ROOT_COMPONENT_CONFIG,
	FIELD_ROOT_COMPONENT_DEFINITION,
	FIELD_ASSOCIATED_TYPES,
	FIELD_CATEGORY,
	FEILD_STATE_PROPERTIES,
	FIELD_REQUIRED_TRANSALTIONS,
	FIELD_EXT_CONTROLLER_DEP,
	FIELD_EXTENSION_POINT,
	FIELD_SYS_POLICY,
	FIELD_SCOPE,
	FIELD_SYS_PACKAGE,
];

export const FIELDS_TO_EXPOSE = [
	FIELD_SYS_ID,
	FIELD_NAME,
	FIELD_DESCRIPTION,
	FIELD_CATEGORY,
	FIELD_ASSOCIATED_TYPES,
];

export const FIELDS_TO_UPDATE = [
	FIELD_NAME,
	FIELD_DESCRIPTION,
	FIELD_ASSOCIATED_TYPES,
];

export const ASSOCIATED_TYPES_CORE = 'd8899a0473000010f7353c78caf6a750';
export const CATEGORY_PRIMATIVES = 'component';
export const DISPATCHED_EVENTS = [
	'882eed4091382d3a41f1bb3f382ae089',
	'8b82bf18e5276c8e423b6e4e0889b463',
];

export const RESPONSIVE_DEFAULT_CONTAINER_LAYOUT = {
	default: {
		type: 'flex',
		root: null,
		children: null,
		rules: null,
		styles: {
			'flex-direction': 'column',
		},
		items: [],
		templateId: '5832fd4d53c31010e6bcddeeff7b12db',
	},
	version: '3.1.0',
};

export const TABLE_NAME = 'sys_uib_toolbox_component';

export const FIELD_SYS_ID = 'sys_id';
export const FIELD_COMPONENT_CONFIG = 'component_config';
export const FIELD_CONFIG_LAYOUT = 'config_layout';
export const FIELD_DESCRIPTION = 'description';
export const FIELD_EXTERNAL_CONFIGURATION_SOURCES =
	'external_configuration_sources';
export const FIELD_GROUP = 'group';
export const FIELD_GROUP_CATEGORY = 'group_category';
export const FIELD_GROUP_ICON = 'group_icon';
export const FIELD_ICON = 'icon';
export const FIELD_IMAGE_ICON = 'image_icon';
export const FIELD_INTERNAL_COMPONENT = 'internal_component';
export const FIELD_LABEL = 'label';
export const FIELD_MACROPONENT = 'macroponent';
export const FIELD_ORDER = 'order';
export const FIELD_SCRIPTED_CONFIG_POLICY = 'scripted_config_policy';
export const FIELD_SYS_POLICY = 'sys_policy';
export const FIELD_SYS_SCOPE = 'sys_scope';

export const FIELDS_TO_DUPLICATE = [
	FIELD_EXTERNAL_CONFIGURATION_SOURCES,
	FIELD_SCRIPTED_CONFIG_POLICY,
	FIELD_CONFIG_LAYOUT,
	FIELD_GROUP_ICON,
	FIELD_GROUP,
	FIELD_GROUP_CATEGORY,
	FIELD_ORDER,
	FIELD_COMPONENT_CONFIG,
	FIELD_INTERNAL_COMPONENT,
];

export const FIELDS_TO_EXPOSE = [
	FIELD_SYS_ID,
	FIELD_LABEL,
	FIELD_ICON,
	FIELD_DESCRIPTION,
	FIELD_MACROPONENT,
	FIELD_IMAGE_ICON,
	FIELD_SYS_POLICY,
	FIELD_SYS_SCOPE,
	FIELD_EXTERNAL_CONFIGURATION_SOURCES,
	FIELD_SCRIPTED_CONFIG_POLICY,
	FIELD_CONFIG_LAYOUT,
];

export const FIELDS_TO_UPDATE = [
	FIELD_DESCRIPTION,
	FIELD_EXTERNAL_CONFIGURATION_SOURCES,
	FIELD_ICON,
	FIELD_IMAGE_ICON,
	FIELD_LABEL,
	FIELD_SCRIPTED_CONFIG_POLICY,
	FIELD_CONFIG_LAYOUT,
];

export const FIELDS_TRANSFORMER = {
	[FIELD_IMAGE_ICON]: (value) => value?.sys_id || value?.name,
};

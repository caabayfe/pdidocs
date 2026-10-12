import { gs } from "@servicenow/glide";

export const WIRE_SYS_ID = "sysId";
export const WIRE_TAG = "tag";
export const WIRE_NAME = "name";
export const WIRE_VALUE = "value";
export const WIRE_PERSONALIZATION_DISALLOWED = "personalizationDisallowed";
export const WIRE_CONDITION = "condition";
export const WIRE_ORDER = "order";
export const WIRE_PAGE_PATH = "pagePath";
export const WIRE_EXPERIENCE_PATH = "experiencePath";

export const CONFIG_TYPE_ADMIN = "adminConfig";
export const CONFIG_TYPE_USER = "userPersonalization";

export const TABLE_AIX_CONFIGURATION = "sys_aix_configuration";
export const TABLE_USER_PREFERENCES = "sys_user_preference";

export const FIELD_PAGE_PATH = "page_path";
export const FIELD_EXPERIENCE_PATH = "experience_path";
export const FIELD_TAG = "tag";
export const FIELD_CONDITION = "condition";
export const FIELD_PERSONALIZATION_DISALLOWED = "personalization_disallowed";
export const FIELD_VALUE = "value";
export const FIELD_ORDER = "order";
export const FIELD_USER = "user";

export const SYS_ID = "sys_id";
export const NAME = "name";
export const SYS_SCOPE = "sys_scope";

export const CONFIG_VALUE_MAX_BYTES_PROPERTY =
	"glide.aix.configuration.value.policy.max_bytes";
export const CONFIG_VALUE_MAX_BYTES_DEFAULT = 16 * 1024;

export const MSG_INVALID_EXPERIENCE_PATH = gs.getMessage(
	"Invalid experience path.",
);
export const MSG_INVALID_PAGE_PATH = gs.getMessage("Invalid experience path.");
export const MSG_KEYS_MUST_BE_LIST = gs.getMessage(
	"`keys` path parameter must be a non-empty comma-separated list",
);
export const MSG_SYSIDS_MUST_BE_LIST = gs.getMessage(
	"`sys_ids` path parameter must be a non-empty comma-separated list",
);
export const MSG_INVALID_TYPES = gs.getMessage(
	"Types must include at least one of staticConfig, sessionConfig",
);

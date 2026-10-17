/**
 * Constants for CDS Download Client Extension Point
 * Contains all constant values used across the client extension point functionality
 */
var CDSClientConstants = Class.create();

// Table names
CDSClientConstants.TABLE_CLIENT_STAGING = 'sn_experiment_core_experimentation_executor_client_staging';
CDSClientConstants.TABLE_CDS_CLIENT_REGISTRY = 'cds_client_registry';
CDSClientConstants.TABLE_EXPERIMENTS = 'sn_experiment_core_experiment';
CDSClientConstants.TABLE_VARIANT = 'sn_experiment_core_variant';
CDSClientConstants.TABLE_FEATURE_FLAG = 'sn_experiment_core_feature_flag';
CDSClientConstants.TABLE_SEGMENT = 'sn_experiment_core_segment';
CDSClientConstants.TABLE_METRIC_MAPPING = 'sn_experiment_core_metric_mapping';

// System IDs
CDSClientConstants.SN_EXPERIMENT_CORE_EXPERIMENTATION_EXECUTOR_CLIENT_STAGING_SYS_ID = 'e796c246ff403210eba0ffffffffffba';

CDSClientConstants.QUERY_PARAM_RELEASE_VERSION = 'release_version';

// Manual fallback property, used only when glide.buildtag carries no valid release value
// (track builds, or date-only builds with no release family). Expected to use the SAME
// glide build-tag format as glide.buildtag so it is parsed identically.
CDSClientConstants.PROPERTY_RELEASE_VERSION = 'sn_experiment_core.release_version';

// Field names
CDSClientConstants.FIELD_SERVER_FILTER_CRITERIA = 'server_filter_criteria';
CDSClientConstants.FIELD_INSTANCE_TYPE = 'instance_type';
CDSClientConstants.FIELD_NAME = 'name';
CDSClientConstants.CATEGORY_AB_TESTING = 'ab_testing';

// Values
CDSClientConstants.VALUE_PRODUCTION = 'production';

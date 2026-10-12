export const Tables = {
    // Dashboard tables
    PAR_DASHBOARD: 'par_dashboard',
    PA_DASHBOARDS: 'pa_dashboards',
    DASHBOARD_STATS: 'dashboard_stats',
    PAR_DASHBOARD_WIDGET: 'par_dashboard_widget',
    PA_INDICATORS: 'pa_indicators',
    PA_BREAKDOWNS: 'pa_breakdowns',
    PA_JOB_INDICATORS: 'pa_job_indicators',
    PA_TEXT_INDEX_CONFIGURATIONS: 'pa_text_index_configurations',
    PA_CUBES: 'pa_cubes',
    PAR_DASHBOARD_CACHE: 'par_dashboard_cache',
    PAR_DASHBOARD_PERMISSION: 'par_dashboard_permission',
    PA_DASHBOARDS_PERMISSIONS: 'pa_dashboards_permissions',
    // Visualization tables
    PAR_VISUALIZATION: 'par_visualization',
    PAR_VISUALIZATION_METADATA: 'par_visualization_metadata',
    PAR_VISUALIZATION_PERMISSION: 'par_visualization_permission',
    PAR_VISUALIZATION_CONFIGURATION: 'par_visualization_configuration',
    // Glide tables
    SYS_DB_OBJECT: 'sys_db_object',
    SYS_DICTIONARY: 'sys_dictionary',
    USER: 'sys_user',
    USER_HAS_ROLE: 'sys_user_has_role',
    // Analytics Category tables
    ANALYTICS_CATEGORY: 'analytics_category',
    ANALYTICS_CATEGORY_M2M: 'analytics_category_m2m',
    //Core reports tables
    SYS_REPORT: 'sys_report',
    //Indicator tables
    PA_INDICATOR_AGGREGATED_METRICS: 'pa_indicator_aggregated_metrics',
};
export const Columns = {
    // Common columns
    ACTIVE: 'active',
    SYS_ID: 'sys_id',
    CUBE: 'cube',
    UPDATED_ON: 'sys_updated_on',
    NAME: 'name',
    DESCRIPTION: 'description',
    SYS_UPDATED_ON: 'sys_updated_on',
    SYS_UPDATED_BY: 'sys_updated_by',
    USER_NAME: 'user_name',
    // Dashboard columns
    DASHBOARD_SYS_ID: 'dashboard_sys_id',
    LAST_VIEWED_ON: 'last_viewed_on',
    TOTAL_EXECUTIONS_DURATION: 'total_executions_duration',
    DASHBOARD: 'dashboard',
    DASHBOARD_TAB: 'dashboard_tab',
    COMPONENT_PROPS: 'component_props',
    DASHBOARD_TABLE: 'dashboard_table',
    // PA AIA Result columns
    AIA_AGENT: 'aia_agent',
    TABLE_NAME: 'table_name',
    DOCUMENT_ID: 'document_id',
    WORKFLOW_EXEC: 'pa_aia_wf_exec',
    RATIONALE: 'rationale',
    // PA AIA Workflow Exec columns
    AIA_WORKFLOW: 'aia_workflow',
    SUMMARY: 'summary',
    METADATA: 'metadata',
    ARTIFACT_ID: 'artifact_id',
    // PAR Visualization metadata
    PAR_COMPONENT: 'par_component',
    SOURCE_TABLE: 'source_table',
    SOURCE: 'source',
    COMPONENT: 'component',
    USER: 'user',
    OWNER: 'owner',
    CREATED_BY_USER: 'created_by_user',
    COMPONENT_ACTIVE: 'component.active',
    //Indicator source columns
    FACTS_TABLE: 'facts_table',
    FREQUENCY: 'frequency',
    CONDITIONS: 'conditions',
    // PAR Dashboard Permission
    DASHBOARD_ACTIVE: 'dashboard.active',
    GROUP: 'group',
    ROLE: 'role',
    //Indicator columns
    INDICATOR: 'indicator',
    VIEWED: 'viewed',
    TYPE: 'type',
    AGGREGATE: 'aggregate',
    FIELD: 'field',
    SCRIPT: 'script',
};
export const AI_USER = '5707914eff232210a2b1ffffffffff94';
export const AI_CHANNEL = 'b023fcb3537321106167ddeeff7b12a8';
export const SysProperties = {
    LOGGING_ENABLED: 'sn_analytics_tk.logging.enabled',
};
export const NEW_OWNER_TYPES = {
    USER: 'user',
    GROUP: 'group',
};
export const dataVizSourceTypes = {
    TABLE: 'table',
    INDICATOR: 'indicator',
    METRICBASE: 'metricBase',
    HLA_LOOM: 'hlaElasticSearchComponents',
    APPSEE: 'appsee',
};

var Constants = Class.create();

Constants.GLOBAL_DOMAIN_ID = 'global';
Constants.MINLENGTH = 3;
Constants.MAXLENGTH = 255;
Constants.MINVAL = 0;
Constants.MAXVALUE = Constants.MAXLENGTH;
Constants.IMAGE_CATEGORY_VALUE = 'image';
Constants.IMAGE_LOCATION = 'header_logo';
Constants.FILE_EXTENSION_REGEX = /^(.+)\.([a-z]+)$/;
Constants.THEME_BUILDER_PREFIX = 'THEME_BUILDER: ';
Constants.POLARIS_THEME_ID = '31bf91ae07203010e03948f78ad30095';
Constants.USWDS_THEME_ID = '7a2773b45f2311101e21a016617313df';
Constants.UNIFIED_NAV_APP_SHELL_SYS_ID = 'c86a62e2c7022010099a308dc7c26022';
Constants.STYLE_VARIANT_TYPE = 'variant';
Constants.CORAL_THEME_ID = 'fad87d2ca304121029a4d1aed31e610f';
Constants.UNPUBLISH_EVENT_NAME = 'sn_theme_builder.unpublishTheme';
Constants.UPDATE_THEME_ORDER_EVENT = 'sn_theme_builder.updateThemeOrder';
Constants.POLARIS_STYLES_ID = ["a197a38107b03010e03948f78ad30059","883625aa53213010e1f7ddeeff7b1299","fc48238107b03010e03948f78ad30079","eca0305507b03010e03948f78ad3009c","a60c45a507203010e03948f78ad300c0","d9e451f75bc11110848b28582d81c788","e09ef7ae07103010e03948f78ad3002c"];
Constants.CORAL_STYLES_ID = ["f4697560a344121029a4d1aed31e61ce","38bfd6266d859a10f877c11b94ef94d3","72d8f120a344121029a4d1aed31e6144","de1640ff8b721210eb8bcafb912395d1","fad8f120a344121029a4d1aed31e6141","b6d8f120a344121029a4d1aed31e6146","36d87d2ca304121029a4d1aed31e6113"];
Constants.USWDS_STYLES_ID = ["2bb733b45f2311101e21a0166173136e","60f7bbb45f2311101e21a01661731333","8b983fb45f2311101e21a0166173138e"];

Constants.ERROR_LOG_TYPE = 'critical';
Constants.WARN_LOG_TYPE = 'warning';
Constants.INFO_LOG_TYPE = 'info';

Constants.CORE_COMPANY_RECORD = 'core_company';
Constants.CORE_COMPANY_BANNER_IMAGE_LIGHT = 'banner_image_light';
Constants.SYS_UX_STYLE_TABLE_NAME = 'sys_ux_style';
Constants.SYS_UX_THEME_TABLE_NAME = 'sys_ux_theme';
Constants.M2M_THEME_STYLE_TABLE_NAME = 'm2m_theme_style';
Constants.M2M_STYLE_ASSET_TABLE_NAME = 'm2m_style_asset';
Constants.SYS_ATTACHEMENT_TABLE_NAME = 'sys_attachment';
Constants.SYS_UX_THEME_CUSTOMIZATION_TABLE_NAME = 'sys_ux_theme_customization';
Constants.SYS_UX_PAGE_REGISTRY_TABLE_NAME = 'sys_ux_page_registry';
Constants.SYS_UX_APP_CONFIG_TABLE_NAME = 'sys_ux_app_config';
Constants.SYS_UX_THEME_ASSET_TABLE_NAME = 'sys_ux_theme_asset';
Constants.SYS_UX_APP_ROUTE_TABLE_NAME = 'sys_ux_app_route';
Constants.SYS_USER_PREFERENCE_TABLE_NAME = 'sys_user_preference';
Constants.SYS_SG_NATIVE_CLIENT_TABLE_NAME = 'sys_sg_native_client';
Constants.M2M_APP_THEME_TABLE_NAME = 'm2m_app_theme';

Constants.PRIMARY_COLOR_RGB_DEFAULT = '3, 45, 66';
Constants.SECONDARY_COLOR_RGB_DEFAULT = '3, 45, 66';
Constants.NEUTRAL_COLOR_RGB_DEFAULT = '61, 74, 80';
Constants.DARK_VARIANT_NEUTRAL_COLOR_RGB_DEFAULT = '90, 90, 90';

Constants.SYS_ID_QUERY_KEY = 'sys_id=';
Constants.STYLE_QUERY_KEY = 'style=';
Constants.SYS_ID_COLUMN_FIELD = 'sys_id';
Constants.DESCRIPTION_COLUMN_FIELD = 'description';
Constants.SYS_SCOPE_COLUMN_FIELD = 'sys_scope';
Constants.SYS_DOMAIN_COLUMN_FIELD = 'sys_domain';
Constants.SYS_UPDATED_ON_COLUMN_FIELD = 'sys_updated_on';
Constants.STYLE_COLUMN_FIELD = 'style';
Constants.THEME_COLUMN_FIELD = 'theme';
Constants.ORDER_COLUMN_FIELD = 'order';
Constants.TABLE_ID_COLUMN_FIELD = 'table_sys_id';
Constants.FILE_NAME_COLUMN_FIELD = 'file_name';
Constants.CONTENT_TYPE_COLUMN_FIELD = 'content_type';
Constants.TITLE_COLUMN_FIELD = 'title';
Constants.TYPE_COLUMN_FIELD = 'type';
Constants.PATH_COLUMN_FIELD = 'path';
Constants.ADMIN_PANEL_COLUMN_FIELD = 'admin_panel';
Constants.LANDING_PATH_COLUMN_FIELD = 'landing_path';
Constants.CUSTOMIZATION_COLUMN_FIELD = 'customization';
Constants.NAME_COLUMN_FIELD = 'name';
Constants.ASSET_COLUMN_FIELD = 'asset';
Constants.PROPERTIES_COLUMN_FIELD = 'properties';
Constants.TABLE_NAME_COLUMN_FIELD = 'table_name';
Constants.APP_CONFIG_COLUMN_FIELD = 'app_config';
Constants.ROUTE_TYPE_COLUMN_FIELD = 'route_type';
Constants.UX_APP_COLUMN_FIELD = 'ux_app';

Constants.USER_PREFERENCE_SORT_BY = 'theme_builder.sort_by'
Constants.USER_PREFERENCE_SORT_DIRECTION = 'theme_builder.sort_by.direction'

Constants.SYS_DOMAIN_PATH = 'sys_domain_path';
Constants.IN_OPERATOR = 'IN';
Constants.NOW = 'now';
Constants.FORWARD_SLASH = '/';
Constants.STYLE_INTERNAL_TYPE_NAME = '_typeName';


Constants.IMAGERY_STYLE_TYPE = 'Imagery';
Constants.TYPOGRAPHY_STYLE_TYPE = 'Typography';
Constants.COLORS_STYLE_TYPE = 'Colors';
Constants.SHAPE_STYLE_TYPE = 'Shape and Form';
Constants.MOBILE_STYLE_TYPE = 'Mobile Colors';
Constants.DASHBOARD_VISUALIZATION_COMPATIBILITY = 'UI16 Dashboard Visualization Compatibility';
Constants.STYLE_CORE_TYPE = 'core';
Constants.STYLE_KEY_TYPE_MAPPING = {
    [Constants.TYPOGRAPHY_STYLE_TYPE]: "typography",
    [Constants.IMAGERY_STYLE_TYPE]: "imagery",
    [Constants.COLORS_STYLE_TYPE]: "colors",
    [Constants.SHAPE_STYLE_TYPE]: "shape",
    [Constants.MOBILE_STYLE_TYPE]: "mobile",
    [Constants.DASHBOARD_VISUALIZATION_COMPATIBILITY]: "ui16Dashboard"
};
Constants.SYSTEM_TOKEN_VERSION = "v1";

Constants.IMAGERY_STYLE_GRAPHQL_TYPE = 'ImageryStyle';
Constants.ILLUSTRATION_STYLE_GRAPHQL_TYPE = 'IllustrationStyle';
Constants.UPLOAD_RESULT_GRAPHQL_TYPE = 'CustomFont';
Constants.TYPOGRAPHY_STYLE_GRAPHQL_TYPE = 'TypographyStyle';
Constants.COLORS_STYLE_GRAPHQL_TYPE = 'ColorsStyle';
Constants.SHAPE_STYLE_GRAPHQL_TYPE = 'ShapeStyle';
Constants.UNKNOWN_STYLE_GRAPHQL_TYPE = 'UnknownStyle';
Constants.CUSTOMIZATION_GRAPHQL_TYPE = 'Customization';
Constants.THEME_GRAPHQL_TYPE = 'Theme';
Constants.LOGGER_GRAPHQL_TYPE = 'Logger';
Constants.BOOLEAN_GRAPHQL_TYPE = 'BooleanType';
Constants.STRING_GRAPHQL_TYPE = 'StringType';
Constants.COMPONENT_PROPERTY_RESULT = 'ComponentPropertyResult';

Constants.VALUE = 'value';
Constants.DISPLAY_VALUE = 'display_value';
Constants.EMPTY_STR = '';
Constants.COMMA = ',';
Constants.CUSTOMIZED_NAME = 'customized_name';
Constants.IS_SECONDARY_COLOR_UPDATED = 'isSecondaryColorUpdated';
Constants.CONTRAST_RATIO_VIOLATED = 'contrast_ratio_violated';
Constants.SECONDARY_COLOR_UPDATED = 'secondary_color_updated';
Constants.COLOR_HOOK_OVERRIDDEN = 'color_hook_overridden';
Constants.COMPONENT_HOOK_OVERRIDDEN = 'component_hook_overridden';
Constants.COMPONENT_BASE_HOOK_OVERRIDDEN = 'component_base_hook_overridden';
Constants.CUSTOM_FONT_UPLOADED = "custom_font_uploaded";
Constants.FEEDBACK = 'feedback';
Constants.FONT_FAMILY_MAPPING = "font_family_mapping";
Constants.BRAND_PRIMARY_COLOR_HOOK_NAME = '--now-color_brand--primary';
Constants.BRAND_SECONDARY_COLOR_HOOK_NAME = '--now-color_brand--secondary';
Constants.BRAND_NEUTRAL_COLOR_HOOK_NAME = '--now-color_brand--neutral';
Constants.PRIMARY_COLOR_HOOK_NAME = '--now-color--primary';
Constants.SURFACE_BRAND_COLOR_HOOK_NAME = '--now-color_surface--brand';
Constants.SELECTION_PRIMARY_COLOR_HOOK_NAME = '--now-color_selection--primary';
Constants.CHROME_BRAND_COLOR_HOOK_NAME = '--now-color_chrome--brand';
Constants.CHROME_DIVIDER_COLOR_HOOK_NAME = '--now-color_chrome--divider';
Constants.INTERACTIVE_COLOR_HOOK_NAME = '--now-color--interactive';
Constants.SECONDARY_COLOR_HOOK_NAME = '--now-color--secondary';
Constants.SELECTION_SECONDARY_COLOR_HOOK_NAME = '--now-color_selection--secondary';
Constants.NEUTRAL_COLOR_HOOK_NAME = '--now-color--neutral';
Constants.SECONDARY_NAV_BRAND_COLOR_HOOK_NAME = '--now-color_secondary-nav--brand';
Constants.SECONDARY_NAV_DIVIDER_COLOR_HOOK_NAME = '--now-color_secondary-nav--divider';
Constants.NOW_FONT_FAMILY_HOOK_NAME = '--now-font-family';
Constants.ACTIONABLE_BORDER_RADIUS_HOOK_NAME = '--now-actionable--border-radius';
Constants.ADDITIONAL_COLORS_REFERENCE_REGEX = /--now-color-reference-\d+/g;
Constants.ADDITIONAL_COLORS_REFERENCE_PREFIX = '--now-color-reference-';

function getBaseColor(component, type, isGrouped) {
    switch (component) {
        case 'badge': {
            return {
                key: 'now-badge--' + type,
                value: [{
                    baseColor: isGrouped ? '--now-color_grouped--' + type : '--now-color_alert--' + type,
                    hooks: [
                        '--now-badge--primary_' + type + '--background-color',
                        '--now-badge--primary_' + type + '--border-color',
                        '--now-badge--secondary_' + type + '--background-color',
                        '--now-badge--secondary_' + type + '--border-color',
                        '--now-badge--secondary_' + type + '--color'
                    ]
                }]
            };
        }

        case 'text-link': {
            return {
                key: 'now-text-link--' + type,
                value: [{
                    baseColor: '--now-color--' + (type === 'primary' ? 'link' : type),
                    hooks: [
                        '--now-text-link--' + type + '--color',
                        '--now-text-link--' + type + '--color--hover',
                        '--now-text-link--' + type + '--color--active'
                    ]
                }]
            };
        }

        case 'highlighted-value': {
            return {
                key: 'now-highlighted-value--' + type,
                value: [{
                    baseColor: isGrouped ? '--now-color_grouped--' + type : '--now-color_alert--' + type,
                    hooks: [
                        '--now-highlighted-value--primary_' + type + '--background-color',
                        '--now-highlighted-value--primary_' + type + '--border-color',
                        '--now-highlighted-value_icon--primary_' + type + '--color',
                        '--now-highlighted-value--secondary_' + type + '--background-color',
                        '--now-highlighted-value--secondary_' + type + '--border-color',
                        '--now-highlighted-value_icon--secondary_' + type + '--color',
                        '--now-highlighted-value--tertiary_' + type + '--background-color',
                        '--now-highlighted-value--tertiary_' + type + '--border-color',
                        '--now-highlighted-value_icon--tertiary_' + type + '--color'
                    ]
                }]
            };
        }

        case 'button-primary': {
            return {
                key: 'now-button--primary',
                value: [{
                    baseColor: '--now-color--primary',
                    hooks: [
                        '--now-button--primary--background-color',
                        '--now-button--primary--background-color--active',
                        '--now-button--primary--background-color--hover',
                        '--now-button--primary--border-color',
                        '--now-button--primary--border-color--active',
                        '--now-button--primary--border-color--hover'
                    ]
                }]
            };
        }

        case 'button-primary-positive': {
            return {
                key: 'now-button--primary-positive',
                value: [{
                    baseColor: '--now-color_alert--positive',
                    hooks: [
                        '--now-button--primary-positive--background-color',
                        '--now-button--primary-positive--background-color--active',
                        '--now-button--primary-positive--background-color--hover',
                        '--now-button--primary-positive--border-color',
                        '--now-button--primary-positive--border-color--active',
                        '--now-button--primary-positive--border-color--hover'
                    ]
                }]
            };
        }

        case 'button-primary-negative': {
            return {
                key: 'now-button--primary-negative',
                value: [{
                    baseColor: '--now-color_alert--critical',
                    hooks: [
                        '--now-button--primary-negative--background-color',
                        '--now-button--primary-negative--background-color--active',
                        '--now-button--primary-negative--background-color--hover',
                        '--now-button--primary-negative--border-color',
                        '--now-button--primary-negative--border-color--active',
                        '--now-button--primary-negative--border-color--hover'
                    ]
                }]
            };
        }

        case 'button-secondary': {
            return {
                key: 'now-button--secondary',
                value: [{
                    baseColor: '--now-color--secondary',
                    hooks: [
                        '--now-button--secondary--color--active',
                        '--now-button--secondary--color--hover',
                        '--now-button_icon--secondary--color--active',
                        '--now-button_icon--secondary--color--hover'
                    ]
                }]
            };
        }

        case 'button-secondary-positive': {
            return {
                key: 'now-button--secondary-positive',
                value: [{
                    baseColor: '--now-color_alert--positive',
                    hooks: [
                        '--now-button--secondary-positive--background-color',
                        '--now-button--secondary-positive--background-color--active',
                        '--now-button--secondary-positive--background-color--hover',
                        '--now-button--secondary-positive--border-color',
                        '--now-button--secondary-positive--border-color--active',
                        '--now-button--secondary-positive--border-color--hover',
                        '--now-button--secondary-positive--color',
                        '--now-button--secondary-positive--color--hover'
                    ]
                }]
            };
        }

        case 'button-secondary-negative': {
            return {
                key: 'now-button--secondary-negative',
                value: [{
                    baseColor: '--now-color_alert--critical',
                    hooks: [
                        '--now-button--secondary-negative--background-color',
                        '--now-button--secondary-negative--background-color--active',
                        '--now-button--secondary-negative--background-color--hover',
                        '--now-button--secondary-negative--border-color',
                        '--now-button--secondary-negative--border-color--active',
                        '--now-button--secondary-negative--border-color--hover',
                        '--now-button--secondary-negative--color',
                        '--now-button--secondary-negative--color--hover'
                    ]
                }]
            };
        }

        case 'button-tertiary': {
            return {
                key: 'now-button--tertiary',
                value: [{
                    baseColor: '--now-color--secondary',
                    hooks: [
                        '--now-button--tertiary--color--active',
                        '--now-button--tertiary--color--hover',
                        '--now-button_icon--tertiary--color--active',
                        '--now-button_icon--tertiary--color--hover'
                    ]
                }]
            };
        }

        case 'button-circular': {
            return {
                key: 'now-button-circular',
                value: [{
                    baseColor: '--now-color--primary',
                    hooks: [
                        '--now-button-circular--background-color',
                        '--now-button-circular--background-color--active',
                        '--now-button-circular--background-color--hover',
                        '--now-button-circular--border-color',
                        '--now-button-circular--border-color--active',
                        '--now-button-circular--border-color--hover',
                    ]
                }]
            };
        }

        case 'button-iconic-primary': {
            return {
                key: 'now-button-iconic--primary',
                value: [{
                    baseColor: '--now-color--primary',
                    hooks: [
                        '--now-button-iconic--primary--border-color',
                        '--now-button-iconic--primary--border-color--hover',
                        '--now-button-iconic--primary--border-color--active',
                        '--now-button-iconic--primary--background-color',
                        '--now-button-iconic--primary--background-color--hover',
                        '--now-button-iconic--primary--background-color--active'
                    ]
                }]
            };
        }

        case 'button-iconic-secondary': {
            return {
                key: 'now-button-iconic--secondary',
                value: [{
                    baseColor: '--now-color--secondary',
                    hooks: [
                        '--now-button-iconic--secondary--color--hover',
                        '--now-button-iconic--secondary--color--active'
                    ]
                }]
            };
        }

        case 'button-iconic-tertiary': {
            return {
                key: 'now-button-iconic--tertiary',
                value: [{
                    baseColor: '--now-color--secondary',
                    hooks: [
                        '--now-button-iconic--tertiary--color--hover',
                        '--now-button-iconic--tertiary--color--active'
                    ]
                }]
            };
        }

        case 'button-bare-primary': {
            return {
                key: 'now-button-bare--primary',
                value: [{
                    baseColor: '--now-color--primary',
                    hooks: [
                        '--now-button--bare_primary--background-color--active',
                        '--now-button--bare_primary--background-color--hover',
                        '--now-button--bare_primary--border-color--active',
                        '--now-button--bare_primary--border-color--hover',
                        '--now-button--bare_primary--color',
                        '--now-button--bare_primary--color--active',
                        '--now-button--bare_primary--color--hover',
                        '--now-button_icon--bare_primary--color',
                        '--now-button_icon--bare_primary--color--hover',
                        '--now-button_icon--bare_primary--color--active',
                    ]
                }]
            };
        }

        case 'button-bare-secondary': {
            return {
                key: 'now-button-bare--secondary',
                value: [{
                    baseColor: '--now-color--secondary',
                    hooks: [
                        '--now-button--bare_secondary--background-color--active',
                        '--now-button--bare_secondary--background-color--hover',
                        '--now-button--bare_secondary--border-color--active',
                        '--now-button--bare_secondary--border-color--hover',
                        '--now-button--bare_secondary--color',
                        '--now-button--bare_secondary--color--active',
                        '--now-button--bare_secondary--color--hover',
                        '--now-button_icon--bare_secondary--color',
                        '--now-button_icon--bare_secondary--color--hover',
                        '--now-button_icon--bare_secondary--color--active',
                    ]
                }]
            };
        }

        case 'button-bare-tertiary': {
            return {
                key: 'now-button-bare--tertiary',
                value: [{
                    baseColor: '--now-color--secondary',
                    hooks: [
                        '--now-button--bare_tertiary--color--active',
                        '--now-button--bare_tertiary--color--hover',
                        '--now-button_icon--bare_tertiary--color--hover',
                        '--now-button_icon--bare_tertiary--color--active'
                    ]
                }]
            };
        }

        case 'button-iconic-bare-primary': {
            return {
                key: 'now-button-iconic-bare--primary',
                value: [{
                    baseColor: '--now-color--primary',
                    hooks: [
                        '--now-button-iconic--bare_primary--background-color--active',
                        '--now-button-iconic--bare_primary--background-color--hover',
                        '--now-button-iconic--bare_primary--border-color--active',
                        '--now-button-iconic--bare_primary--border-color--hover',
                        '--now-button-iconic--bare_primary--color',
                        '--now-button-iconic--bare_primary--color--hover',
                        '--now-button-iconic--bare_primary--color--active',
                    ]
                }]
            };
        }

        case 'button-iconic-bare-secondary': {
            return {
                key: 'now-button-iconic-bare--secondary',
                value: [{
                    baseColor: '--now-color--secondary',
                    hooks: [
                        '--now-button-iconic--bare_secondary--background-color--active',
                        '--now-button-iconic--bare_secondary--background-color--hover',
                        '--now-button-iconic--bare_secondary--border-color--active',
                        '--now-button-iconic--bare_secondary--border-color--hover',
                        '--now-button-iconic--bare_secondary--color',
                        '--now-button-iconic--bare_secondary--color--active',
                        '--now-button-iconic--bare_secondary--color--hover',
                    ]
                }]
            };
        }

        case 'button-iconic-bare-tertiary': {
            return {
                key: 'now-button-iconic-bare--tertiary',
                value: [{
                    baseColor: '--now-color--secondary',
                    hooks: [
                        '--now-button-iconic--bare_tertiary--color--active',
                        '--now-button-iconic--bare_tertiary--color--hover',
                    ]
                }]
            };
        }

        case 'button-stateful-primary': {
            return {
                key: 'now-button-stateful--primary',
                value: [{
                    baseColor: '--now-color--primary',
                    hooks: [
                        '--now-button-stateful--primary--border-color--hover',
                        '--now-button-stateful--primary--border-color--active',
                        '--now-button-stateful--primary--border-color--selected_hover',
                        '--now-button-stateful--primary--border-color--selected_active',
                        '--now-button-stateful--primary--color',
                        '--now-button-stateful--primary--color--hover',
                        '--now-button-stateful--primary--color--active',
                        '--now-button-stateful--primary--background-color--hover',
                        '--now-button-stateful--primary--background-color--active',
                        '--now-button-stateful--primary--color--selected',
                        '--now-button-stateful--primary--color--selected_hover',
                        '--now-button-stateful--primary--color--selected_active',
                        '--now-button-stateful--primary--background-color--selected_hover',
                        '--now-button-stateful--primary--background-color--selected_active',
                        '--now-button-stateful--primary_highlighted--border-color--selected',
                        '--now-button-stateful--primary_highlighted--color--selected',
                        '--now-button-stateful--primary_highlighted--background-color--selected'
                    ]
                }]
            };
        }

        case 'button-stateful-secondary': {
            return {
                key: 'now-button-stateful--secondary',
                value: [{
                    baseColor: '--now-color--secondary',
                    hooks: [
                        '--now-button-stateful--secondary--border-color--hover',
                        '--now-button-stateful--secondary--border-color--active',
                        '--now-button-stateful--secondary--border-color--selected_hover',
                        '--now-button-stateful--secondary--border-color--selected_active',
                        '--now-button-stateful--secondary--color',
                        '--now-button-stateful--secondary--color--hover',
                        '--now-button-stateful--secondary--color--active',
                        '--now-button-stateful--secondary--background-color--hover',
                        '--now-button-stateful--secondary--background-color--active',
                        '--now-button-stateful--secondary--color--selected',
                        '--now-button-stateful--secondary--color--selected_hover',
                        '--now-button-stateful--secondary--color--selected_active',
                        '--now-button-stateful--secondary--background-color--selected_hover',
                        '--now-button-stateful--secondary--background-color--selected_active',
                        '--now-button-stateful--secondary_highlighted--border-color--selected',
                        '--now-button-stateful--secondary_highlighted--color--selected',
                        '--now-button-stateful--secondary_highlighted--background-color--selected'
                    ]
                }]
            };
        }

        case 'button-stateful-tertiary': {
            return {
                key: 'now-button-stateful--tertiary',
                value: [{
                    baseColor: '--now-color--secondary',
                    hooks: [
                        '--now-button-stateful--tertiary--color--hover',
                        '--now-button-stateful--tertiary--color--active',
                        '--now-button-stateful--tertiary--color--selected',
                        '--now-button-stateful--tertiary--color--selected_active',
                        '--now-button-stateful--tertiary_highlighted--color--selected',
                        '--now-button-stateful--tertiary_highlighted--color--selected_active'
                    ]
                }]
            };
        }

        case 'button-stateful-selection-primary': {
            return {
                key: 'now-button-statefulSelection--primary-selection',
                value: [{
                    baseColor: '--now-color_selection--primary',
                    hooks: [
                        '--now-button-stateful--primary-selection--border-color--hover',
                        '--now-button-stateful--primary-selection--border-color--active',
                        '--now-button-stateful--primary-selection--color',
                        '--now-button-stateful--primary-selection--color--hover',
                        '--now-button-stateful--primary-selection--color--active',
                        '--now-button-stateful--primary-selection--background-color--hover',
                        '--now-button-stateful--primary-selection--background-color--active',
                        '--now-button-stateful--primary-selection--border-color--selected_hover',
                        '--now-button-stateful--primary-selection--border-color--selected_active',
                        '--now-button-stateful--primary-selection--color--selected',
                        '--now-button-stateful--primary-selection--color--selected_hover',
                        '--now-button-stateful--primary-selection--color--selected_active',
                        '--now-button-stateful--primary-selection--background-color--selected_hover',
                        '--now-button-stateful--primary-selection--background-color--selected_active',
                        '--now-button-stateful--primary-selection_highlighted--border-color--selected',
                        '--now-button-stateful--primary-selection_highlighted--color--selected',
                        '--now-button-stateful--primary-selection_highlighted--background-color--selected'
                    ]
                }]
            };
        }

        case 'button-stateful-selection-secondary': {
            return {
                key: 'now-button-statefulSelection--secondary-selection',
                value: [{
                    baseColor: '--now-color_selection--primary',
                    hooks: [
                        '--now-button-stateful--secondary-selection--color',
                        '--now-button-stateful--secondary-selection--color--hover',
                        '--now-button-stateful--secondary-selection--color--active',
                        '--now-button-stateful--secondary-selection--color--selected',
                        '--now-button-stateful--secondary-selection--color--selected_hover',
                        '--now-button-stateful--secondary-selection--color--selected_active',
                        '--now-button-stateful--secondary-selection_highlighted--border-color--selected',
                        '--now-button-stateful--secondary-selection_highlighted--color--selected',
                        '--now-button-stateful--secondary-selection_highlighted--background-color--selected'
                    ]
                }]
            };
        }

        case 'button-stateful-selection-tertiary': {
            return {
                key: 'now-button-statefulSelection--tertiary-selection',
                value: [{
                    baseColor: '--now-color_selection--primary',
                    hooks: [
                        '--now-button-stateful--tertiary-selection--border-color--hover',
                        '--now-button-stateful--tertiary-selection--border-color--active',
                        '--now-button-stateful--tertiary-selection--color--hover',
                        '--now-button-stateful--tertiary-selection--color--active',
                        '--now-button-stateful--tertiary-selection--background-color--hover',
                        '--now-button-stateful--tertiary-selection--background-color--active',
                        '--now-button-stateful--tertiary-selection--border-color--selected_hover',
                        '--now-button-stateful--tertiary-selection--border-color--selected_active',
                        '--now-button-stateful--tertiary-selection--color--selected',
                        '--now-button-stateful--tertiary-selection--color--selected_hover',
                        '--now-button-stateful--tertiary-selection--color--selected_active',
                        '--now-button-stateful--tertiary-selection--background-color--selected_hover',
                        '--now-button-stateful--tertiary-selection--background-color--selected_active',
                        '--now-button-stateful--tertiary-selection_highlighted--border-color--selected',
                        '--now-button-stateful--tertiary-selection_highlighted--color--selected',
                        '--now-button-stateful--tertiary-selection_highlighted--background-color--selected'
                    ]
                }]
            };
        }
        case 'checkbox-valid': {
            return {
                key: 'now-checkbox--valid',
                value: [{
                    baseColor: '--now-color--secondary',

                    hooks: [
                        '--now-checkbox_icon--color--hover',
                        '--now-checkbox--background-color--active',
                        '--now-checkbox--background-color--checked_hover',
                        '--now-checkbox--background-color--hover',
                        '--now-checkbox--border-color--checked_active',
                        '--now-checkbox--border-color--checked_focus',
                        '--now-checkbox--border-color--checked_hover',
                        '--now-checkbox--border-color--focus',
                        '--now-checkbox--border-color--hover',
                        '--now-checkbox--border-color--focus',
                        '--now-checkbox--border-color--checked_focus'
                    ]
                }]
            };
        }
        case 'checkbox-invalid': {
            return {
                key: 'now-checkbox--invalid',
                value: [{
                    baseColor: '--now-color_alert--critical',

                    hooks: [
                        '--now-checkbox--background-color--invalid_focus',
                        '--now-checkbox--background-color--invalid_hover',
                        '--now-checkbox--border-color--invalid',
                        '--now-checkbox--background-color--invalid',
                        '--now-checkbox--background-color--invalid_active',
                        '--now-checkbox--border-color--invalid_active',
                        '--now-checkbox--border-color--invalid_hover',
                        '--now-checkbox_icon--color--invalid',
                        '--now-checkbox_required-indicator--color--invalid'
                    ]
                }]
            };
        }
        case 'radio-buttons-valid': {
            const baseColorHook = `--now-color--secondary`;
            const dependentHooks = [
                '--now-radio-buttons_radio--background-color',
                '--now-radio-buttons_radio--background-color--hover',
                '--now-radio-buttons--background-color',
                '--now-radio-buttons--background-color--hover',
                '--now-radio-buttons--background-color--active',
                '--now-radio-buttons--border-color',
                '--now-radio-buttons--border-color--hover',
                '--now-radio-buttons--border-color--active',
            ];
            return {
                hooks: [{
                    key: baseColorHook,
                    value: dependentHooks
                }],
            };
        }
        case 'radio-buttons-invalid': {
            const baseColorHook = `--now-color_alert--critical`;
            const dependentHooks = [
                '--now-radio-buttons_radio--background-color--invalid',
                '--now-radio-buttons--background-color--invalid',
                '--now-radio-buttons--background-color--invalid_hover',
                '--now-radio-buttons--background-color--invalid_active',
                '--now-radio-buttons--border-color--invalid',
                '--now-radio-buttons--border-color--invalid_hover',
                '--now-radio-buttons--border-color--invalid_active',
            ];
            return {
                hooks: [{
                    key: baseColorHook,
                    value: dependentHooks
                }],
            };
        }
        case 'toggle': {
            return {
                key: 'now-toggle',
                value: [{
                    baseColor: '--now-color--primary',
                    hooks: [
                        `--now-toggle_track--border-color--checked`,
                        `--now-toggle_track--background-color--checked`,
                        `--now-toggle_track--background-color--checked`,
                    ]
                }]
            };
        }
    }
}

Constants.BASE_COLOR_MAPPING = {};
var colors = ['critical', 'high', 'warning', 'moderate', 'info', 'positive', 'low', 'blue', 'brown', 'gray', 'green', 'green-yellow', 'magenta', 'orange', 'pink', 'purple', 'teal', 'yellow'];
var colorsGrouped = [false, false, false, false, false, false, false, true, true, true, true, true, true, true, true, true, true, true];
var i;
for (i = 0; i < colors.length; i++) {
    var result = getBaseColor('badge', colors[i], colorsGrouped[i]);
    Constants.BASE_COLOR_MAPPING[result.key] = result.value;
}

var textLinkColors = ['primary', 'secondary'];
for (i = 0; i < textLinkColors.length; i++) {
    var result = getBaseColor('text-link', textLinkColors[i]);
    Constants.BASE_COLOR_MAPPING[result.key] = result.value;
}

for (i = 0; i < colors.length; i++) {
    var result = getBaseColor('highlighted-value', colors[i], colorsGrouped[i]);
    Constants.BASE_COLOR_MAPPING[result.key] = result.value;
}

var buttonVariants = ['button-primary', 'button-primary-positive', 'button-primary-negative', 'button-secondary', 'button-secondary-positive', 'button-secondary-negative', 'button-tertiary'];
for (i = 0; i < buttonVariants.length; i++) {
    var result = getBaseColor(buttonVariants[i]);
    Constants.BASE_COLOR_MAPPING[result.key] = result.value;
}

var buttonIconicVariants = ['button-iconic-primary', 'button-iconic-secondary', 'button-iconic-tertiary'];
for (i = 0; i < buttonIconicVariants.length; i++) {
    var result = getBaseColor(buttonIconicVariants[i]);
    Constants.BASE_COLOR_MAPPING[result.key] = result.value;
}

var buttonCircularVariants = ['button-circular'];
for (i = 0; i < buttonCircularVariants.length; i++) {
    var result = getBaseColor(buttonCircularVariants[i]);
    Constants.BASE_COLOR_MAPPING[result.key] = result.value;
}

var buttonBareVariants = ['button-bare-primary', 'button-bare-secondary', 'button-bare-tertiary'];
for (i = 0; i < buttonBareVariants.length; i++) {
    var result = getBaseColor(buttonBareVariants[i]);
    Constants.BASE_COLOR_MAPPING[result.key] = result.value;
}

var buttonIconicBareVariants = ['button-iconic-bare-primary', 'button-iconic-bare-secondary', 'button-iconic-bare-tertiary'];
for (i = 0; i < buttonIconicBareVariants.length; i++) {
    var result = getBaseColor(buttonIconicBareVariants[i]);
    Constants.BASE_COLOR_MAPPING[result.key] = result.value;
}

var buttonStatefulVariants = ['button-stateful-primary', 'button-stateful-secondary', 'button-stateful-tertiary'];
for (i = 0; i < buttonStatefulVariants.length; i++) {
    var result = getBaseColor(buttonStatefulVariants[i]);
    Constants.BASE_COLOR_MAPPING[result.key] = result.value;
}

var buttonStatefulSelectionVariants = ['button-stateful-selection-primary', 'button-stateful-selection-secondary', 'button-stateful-selection-tertiary'];
for (i = 0; i < buttonStatefulSelectionVariants.length; i++) {
    var result = getBaseColor(buttonStatefulSelectionVariants[i]);
    Constants.BASE_COLOR_MAPPING[result.key] = result.value;
}

var checkboxVariants = ['checkbox-valid', 'checkbox-invalid'];
for (i = 0; i < checkboxVariants.length; i++) {
    var result = getBaseColor(checkboxVariants[i]);
    Constants.BASE_COLOR_MAPPING[result.key] = result.value;
}

Constants.BASE_COLOR_MAPPING['sn-polaris-menu_menu-item'] = [{
    baseColor: '--now-color_chrome--brand',
    hooks: [
        '--now-unified-nav_menu-item--background-color--hover',
    ],
}];
// Since the color of the history and favorite menu items are the same as the default menu item, we can reuse the same base color
Constants.BASE_COLOR_MAPPING['sn-polaris-menu_menu-item_history'] = Constants.BASE_COLOR_MAPPING['sn-polaris-menu_menu-item'];
Constants.BASE_COLOR_MAPPING['sn-polaris-menu_menu-item_favorite'] = Constants.BASE_COLOR_MAPPING['sn-polaris-menu_menu-item'];

Constants.BASE_COLOR_MAPPING['sn-polaris-header_menu-trigger'] = [{
    baseColor: '--now-color_chrome--brand',
    hooks: [
        '--now-unified-nav_nav-menu-trigger--background-color--hover'
    ]
}];
Constants.BASE_COLOR_MAPPING['sn-polaris-menu_button-iconic'] =
    Constants.BASE_COLOR_MAPPING['sn-polaris-menu_button-iconic-favourites'] =
    Constants.BASE_COLOR_MAPPING['sn-polaris-menu_button-iconic-history'] = [{
        baseColor: '--now-color_chrome--brand',
        hooks: [
            "--now-unified-nav_button--background-color--hover"
        ],
    }];
Constants.BASE_COLOR_MAPPING['sn-polaris-menu_menu-item--hover_favorite'] = [{
    baseColor: '--now-color_chrome--brand',
    hooks: [
        "--now-unified-nav_favorite-icon--background-color--hover"
    ],
}];
Constants.HOOKS_TO_EXCLUDE_FROM_INITIAL_COLOR_RECORD = [
	'--now-color_background--primary',
	'--now-color_background--secondary',
	'--now-color_background--tertiary',
	'--now-color_text--primary',
	'--now-color_text--secondary',
	'--now-color_text--tertiary',
	'--now-color_border--primary',
	'--now-color_border--secondary',
	'--now-color_border--tertiary',
	'--now-color_divider--secondary',
    '--now-color_focus-ring',

];
Constants.BASE_COLOR_MAPPING['sn-polaris-menu_menu-item--hover_icon'] = Constants.BASE_COLOR_MAPPING['sn-polaris-menu_menu-item--hover_favorite']
Constants.BASE_COLOR_MAPPING['sn-polaris-menu_menu-item_favorite--hover_close'] = Constants.BASE_COLOR_MAPPING['sn-polaris-menu_menu-item--hover_favorite']
Constants.THEME_BUILDER_INITIAL_THEME = ThemeBuilderInitialTheme.THEME;
Constants.THEME_BUILDER_INITIAL_THEME.colors.colorGenerationVersion = 'V1';
Constants.THEME_BUILDER_INITIAL_THEME.colors.base = Object.assign({}, Constants.THEME_BUILDER_INITIAL_THEME.colors.base, {
    '--now-color_focus-ring': '36,138,19',
    '--now-color_focus-ring_shadow': '255,255,255',
    '--now-color_secondary-nav--brand': '204, 204, 204',
    '--now-color_secondary-nav--divider': '204, 204, 204',
    '--now-color_background--primary': '255,255,255',
    '--now-color_background--secondary': '242, 243, 242',
    '--now-color_background--tertiary': '217, 218, 217',
    '--now-color_surface--neutral': '0,117,74',
    '--now-color_divider--primary': '193,197,204',
    '--now-color_divider--secondary': '211,214,219',
    '--now-color_divider--tertiary': '227,229,233',
    '--now-color_surface--divider': '76,88,90',
    '--now-color_text--primary': '22,25,31',
    '--now-color_text--secondary': '70,77,90',
    '--now-color_text--tertiary': '111,117,130',
    '--now-color_border--primary': '144,149,160',
    '--now-color_border--secondary': '177,181,190',
    '--now-color_border--tertiary': '211,214,219',
    '--now-color_alert--positive': '51,131,11',
    '--now-color_alert--critical': '228,35,56',
    '--now-color_alert--high': '253,151,0',
    '--now-color_alert--warning': '240,224,0',
    '--now-color_alert--moderate': '123,92,240',
    '--now-color_alert--info': '0,121,204',
    '--now-color_alert--low': '117,117,129',
    '--now-color_grouped--blue': '66,140,254',
    '--now-color_grouped--brown': '211,166,117',
    '--now-color_grouped--gray': '163,171,172',
    '--now-color_grouped--green': '81,185,98',
    '--now-color_grouped--green-yellow': '200,218,110',
    '--now-color_grouped--magenta': '232,105,191',
    '--now-color_grouped--orange': '255,140,114',
    '--now-color_grouped--pink': '224,128,160',
    '--now-color_grouped--purple': '189,122,234',
    '--now-color_grouped--teal': '81,194,194',
    '--now-color_grouped--yellow': '255,198,81'
})
Constants.THEME_BUILDER_INITIAL_THEME.colors.properties = Object.assign({}, Constants.THEME_BUILDER_INITIAL_THEME.colors.properties, {
    '--now-color_brand--secondary': '3, 45, 66',
    '--now-button_icon--bare_primary--color': '--now-color--primary-1',
    '--now-button_icon--bare_primary--color--hover': '--now-color--primary-2',
    '--now-button_icon--bare_primary--color--active': '--now-color--primary-3',
    '--now-button_icon--bare_secondary--color': '--now-color--secondary-1',
    '--now-button_icon--bare_secondary--color--hover': '--now-color--secondary-2',
    '--now-button_icon--bare_secondary--color--active': '--now-color--secondary-3',
    '--now-button_icon--bare_tertiary--color': '--now-color_text--primary',
    '--now-button_icon--bare_tertiary--color--hover': '--now-color--secondary-2',
    '--now-button_icon--bare_tertiary--color--active': '--now-color--secondary-3',
    '--empty-state--main-object--outline': '--now-color--interactive-3',
    '--empty-state--main-object--fill': '--now-color--interactive-1',
    '--now-unified-nav_header--background-color': '--now-color_chrome--brand-9',
    '--now-unified-nav_menu--background-color': '--now-color_chrome--brand-9',
    '--now-unified-nav_favorite-icon--background-color--hover': '--now-color--neutral-0',
    '--now-unified-nav_menu-item-icon--color': '--now-color--neutral-0',
    '--banner--main-object--fill': '--now-color--interactive-1',
    '--banner--primary-object--accent-detail': '--banner--main-object--fill',
    '--card--background--fill': '--now-color--interactive-0',
    '--card--tertiary-object--primary-fill': '--card--background--fill',
    '--card--background--lines': '--now-color--interactive-1',
    '--card--main-object--shadow': '--card--background--lines',
    '--card--tertiary-object--shadow': '--card--background--lines',
    '--card--background--tertiary-lines': '--card--background--lines',
    '--card--background--object-outline': '--card--background--lines',
    '--card--main-object--tertiary-fill': '--card--background--lines',
    '--card--main-object--main-detail': '--now-color--interactive-2',
    '--card--tertiary-object--outline': '--card--main-object--main-detail',
    '--card--main-object--detail': '--now-color--primary-1',
    '--modal--background--fill': '--now-color--interactive-0',
    '--modal--background--lines': '--now-color--interactive-1',
    '--modal--main-object--tertiary-fill': '--now-color_selection--primary-0',
    '--modal--main-object--light-detail': '--modal--main-object--tertiary-fill',
    '--modal--main-object--detail': '--now-color_selection--primary-1',
    '--modal--main-object--primary-fill': '--modal--main-object--detail',
    '--modal--main-object--main-detail': '--now-color_selection--primary-2',
    '--modal--main-object--outline': '--modal--main-object--main-detail',
    '--modal--main-object--tertiary-text': '--modal--main-object--main-detail',
    '--modal--main-object--interactive-fill': '--now-color_selection--primary-3',
    '--modal--main-object--interactive-outline': '--modal--main-object--interactive-fill',
    '--modal--main-object--primary-text': '--now-color_selection--primary-4',
    '--icon--main-object--fill': '--now-color--interactive-0',
    '--icon--main-object--outline': '--now-color--interactive-2',
    '--icon--main-object--detail': '--now-color--interactive-3',
    '--icon--tertiary-object--primary-fill': '--now-color_selection--primary-0',
    '--icon--tertiary-object--outline': '--now-color_selection--primary-2',
    '--icon--tertiary-object--main-detail': '--now-color_selection--primary-3',
    '--now-button_icon--secondary-negative--color--active':
        '--now-color--neutral-0',
    '--now-button--secondary-positive--border-color--active':
        '--now-color_alert--positive-2',
    '--now-button--secondary-positive--border-color--hover':
        '--now-color_alert--positive-2',
    '--now-button_icon--secondary-positive--color--active':
        '--now-color--neutral-0',
    '--now-button_icon--tertiary--color':
        '--now-color_text--primary',
    '--now-button_icon--tertiary--color--active':
        '--now-color--secondary-3',
    '--now-button_icon--tertiary--color--hover':
        '--now-color--secondary-2',
    '--now-button--tertiary-selection--color--selected_active':
        '--now-color_selection--primary-4',
    '--now-button--tertiary-selection--color--selected_hover':
        '--now-color_selection--primary-3',
    '--now-button-stateful--primary--border-color--active':
        '--now-color--primary-3',
    '--now-button-stateful--primary--color--active':
        '--now-color--primary-3',
    '--now-button-stateful--primary--border-color--selected_active':
        '--now-color--primary-3',
    '--now-button-stateful--primary--color--selected_active':
        '--now-color--primary-3',
    '--now-button-stateful--primary_highlighted--background-color--selected_active':
        '--now-button--primary--background-color--active',
    '--now-button-stateful--primary-selection--border-color--selected_active':
        '--now-color_selection--primary-3',
    '--now-button-stateful--primary-selection--color--selected':
        '--now-color_selection--primary-2',
    '--now-button-stateful--primary-selection--color--selected_hover':
        '--now-color_selection--primary-3',
    '--now-button-stateful--primary-selection--color--selected_active':
        '--now-color_selection--primary-4',
    '--now-button-stateful--secondary--border-color--hover':
        '--now-color--secondary-2',
    '--now-button-stateful--secondary--border-color--active':
        '--now-color--secondary-3',
    '--now-button-stateful--secondary--background-color--hover':
        '--now-color--secondary-2',
    '--now-button-stateful--secondary--background-color--active':
        '--now-color--secondary-2',
    '--now-button-stateful--secondary--border-color--selected_hover':
        '--now-color--secondary-2',
    '--now-button-stateful--secondary--border-color--selected_active':
        '--now-color--secondary-3',
    '--now-button-stateful--secondary--background-color--selected_hover':
        '--now-color--secondary-2',
    '--now-button-stateful--secondary--background-color--selected_active':
        '--now-color--secondary-2',
    '--now-button-stateful--secondary_highlighted--background-color--selected_hover':
        '--now-color--secondary-1',
    '--now-button-stateful--secondary_highlighted--background-color--selected_active':
        '--now-color--secondary-1',
    '--now-button-stateful--secondary-selection--border-color--selected_hover':
        '--now-color--neutral-12',
    '--now-button-stateful--secondary-selection--border-color--selected_active':
        '--now-color--neutral-12',
    '--now-button-stateful--secondary-selection--background-color--selected_hover':
        '--now-color--neutral-12',
    '--now-button-stateful--secondary-selection--background-color--selected_active':
        '--now-color--neutral-12',
    '--now-button-stateful--secondary-selection_high-contrast--color--active':
        '--now-color_selection--primary-4',
    '--now-button-stateful--tertiary--color':
        '--now-color_text--primary',
    '--now-button-stateful--tertiary--color--hover':
        '--now-color--secondary-2',
    '--now-button-stateful--tertiary--color--active':
        '--now-color--secondary-3',
    '--now-button-stateful--tertiary_highlighted--color--selected':
        '--now-color--secondary-1',
    '--now-button-iconic--secondary--background-color':
        '--now-color_background--tertiary',
    '--now-button-iconic--tertiary--background-color':
        '--now-color_background--primary',
    '--now-button-iconic--bare_primary--border-color--active':
        '--now-color--primary-3',
    '--now-button-iconic--bare_secondary--border-color--hover':
        '--now-color--secondary-2',
    '--now-button-iconic--bare_secondary--border-color--active':
        '--now-color--secondary-3',
    '--now-button-iconic--bare_secondary--background-color--hover':
        '--now-color--secondary-2',
    '--now-button-iconic--bare_secondary--background-color--active':
        '--now-color--secondary-2',
    '--now-button-iconic--secondary--color--hover':
        '--now-color--secondary-2',
    '--now-button-iconic--secondary--color--active':
        '--now-color--secondary-3',
    '--now-button-iconic--tertiary--color':
        '--now-color_text--primary',
    '--now-button-iconic--tertiary--color--hover':
        '--now-color--secondary-2',
    '--now-button-iconic--tertiary--color--active':
        '--now-color--secondary-3',
    '--now-button-iconic--bare_secondary--color':
        '--now-color--secondary-1',
    '--now-button-iconic--bare_secondary--color--hover':
        '--now-color--secondary-2',
    '--now-button-iconic--bare_secondary--color--active':
        '--now-color--secondary-3',
    '--now-button-iconic--bare_tertiary--color':
        '--now-color_text--primary',
    '--now-button-iconic--bare_tertiary--color--hover':
        '--now-color--secondary-2',
    '--now-button-iconic--bare_tertiary--color--active':
        '--now-color--secondary-3',
    '--now-button-circular--background-color--disabled':
        '--now-color--neutral-3',
    '--now-button-circular--color--disabled':
        '--now-color--neutral-0',
    '--now-button--primary_high-contrast--color':
        '--now-color--primary-2',
    '--now-button--primary_high-contrast--color--active':
        '--now-color_text--primary',
    '--now-button--primary_high-contrast--color--hover':
        '--now-color--primary-3',
    '--now-button--primary-selection_high-contrast--color':
        '--now-color_selection--primary-4',
    '--now-button--primary-selection_high-contrast--color--active':
        '--now-color_text--primary',
    '--now-button--primary-selection_high-contrast--color--hover':
        '--now-color_text--primary',
    '--now-button--secondary_high-contrast--color':
        '--now-color--secondary-2',
    '--now-button--secondary_high-contrast--color--active':
        '--now-color_text--primary',
    '--now-button--secondary_high-contrast--color--hover':
        '--now-color--secondary-3',
    '--now-button--secondary-selection_high-contrast--color':
        '--now-color_selection--primary-4',
    '--now-button--secondary-selection_high-contrast--color--active':
        '--now-color_text--primary',
    '--now-button--secondary-selection_high-contrast--color--hover':
        '--now-color--neutral-18',
    '--now-button--tertiary_high-contrast--color':
        '--now-button--tertiary--color',
    '--now-button--tertiary_high-contrast--color--active':
        '--now-color_text--primary',
    '--now-button--tertiary_high-contrast--color--hover':
        '--now-color--secondary-3',
    '--now-button--tertiary-selection_high-contrast--color':
        '--now-color--neutral-15',
    '--now-button--tertiary-selection_high-contrast--color--active':
        '--now-color_text--primary',
    '--now-button--tertiary-selection_high-contrast--color--hover':
        '--now-color_selection--primary-4',
    '--now-button--tertiary-selection_high-contrast--color--selected':
        '--now-color_selection--primary-3',
    '--now-button--tertiary-selection_high-contrast--color--selected_active':
        '--now-button--tertiary-selection_high-contrast--color--active',
    '--now-button--tertiary-selection_high-contrast--color--selected_hover':
        '--now-button--tertiary-selection_high-contrast--color--hover',
});
Constants.HOOKS_TO_EXCLUDE_FROM_INITIAL_COLOR_RECORD.forEach(key => {
    delete Constants.THEME_BUILDER_INITIAL_THEME.colors.properties[key]
});

Constants.THEME_BUILDER_INITIAL_THEME.shape.properties = Object.assign({}, Constants.THEME_BUILDER_INITIAL_THEME.shape.properties, {
    '--now-actionable--border-radius': '0px',
    '--now-button--border-start-start-radius': '--now-button--border-radius',
    '--now-button--border-start-end-radius': '--now-button--border-radius',
    '--now-button--border-end-start-radius': '--now-button--border-radius',
    '--now-button--border-end-end-radius': '--now-button--border-radius',
    '--now-button--primary--border-start-start-radius': '--now-button--primary--border-radius',
    '--now-button--primary--border-start-end-radius': '--now-button--primary--border-radius',
    '--now-button--primary--border-end-start-radius': '--now-button--primary--border-radius',
    '--now-button--primary--border-end-end-radius': '--now-button--primary--border-radius',
    '--now-button--primary-negative--border-start-start-radius': '--now-button--primary-negative--border-radius',
    '--now-button--primary-negative--border-start-end-radius': '--now-button--primary-negative--border-radius',
    '--now-button--primary-negative--border-end-start-radius': '--now-button--primary-negative--border-radius',
    '--now-button--primary-negative--border-end-end-radius': '--now-button--primary-negative--border-radius',
    '--now-button--primary-positive--border-start-start-radius': '--now-button--primary-positive--border-radius',
    '--now-button--primary-positive--border-start-end-radius': '--now-button--primary-positive--border-radius',
    '--now-button--primary-positive--border-end-start-radius': '--now-button--primary-positive--border-radius',
    '--now-button--primary-positive--border-end-end-radius': '--now-button--primary-positive--border-radius',
    '--now-button--secondary--border-start-start-radius': '--now-button--secondary--border-radius',
    '--now-button--secondary--border-start-end-radius': '--now-button--secondary--border-radius',
    '--now-button--secondary--border-end-start-radius': '--now-button--secondary--border-radius',
    '--now-button--secondary--border-end-end-radius': '--now-button--secondary--border-radius',
    '--now-button--secondary-negative--border-start-start-radius': '--now-button--secondary-negative--border-radius',
    '--now-button--secondary-negative--border-start-end-radius': '--now-button--secondary-negative--border-radius',
    '--now-button--secondary-negative--border-end-start-radius': '--now-button--secondary-negative--border-radius',
    '--now-button--secondary-negative--border-end-end-radius': '--now-button--secondary-negative--border-radius',
    '--now-button--secondary-positive--border-start-start-radius': '--now-button--secondary-positive--border-radius',
    '--now-button--secondary-positive--border-start-end-radius': '--now-button--secondary-positive--border-radius',
    '--now-button--secondary-positive--border-end-start-radius': '--now-button--secondary-positive--border-radius',
    '--now-button--secondary-positive--border-end-end-radius': '--now-button--secondary-positive--border-radius',
    '--now-button--tertiary--border-start-start-radius': '--now-button--tertiary--border-radius',
    '--now-button--tertiary--border-start-end-radius': '--now-button--tertiary--border-radius',
    '--now-button--tertiary--border-end-start-radius': '--now-button--tertiary--border-radius',
    '--now-button--tertiary--border-end-end-radius': '--now-button--tertiary--border-radius'
})
Constants.THEME_BUILDER_INITIAL_THEME.typography.properties = Object.assign({}, Constants.THEME_BUILDER_INITIAL_THEME.typography.properties, {
    '--now-text-link--font-family': '--now-display-type--primary--font-family',
    '--now-button--text-wrap': 'nowrap',
    '--now-badge--secondary--font-family': '--now-badge--primary--font-family',
    '--now-badge--secondary--font-style': '--now-badge--primary--font-style',
    '--now-badge--secondary--font-weight': '--now-badge--primary--font-weight',
    '--now-badge--secondary--text-transform': '--now-badge--primary--text-transform',
    '--now-highlighted-value--secondary--font-family': '--now-highlighted-value--primary--font-family',
    '--now-highlighted-value--secondary--font-style': '--now-highlighted-value--primary--font-style',
    '--now-highlighted-value--secondary--font-weight': '--now-highlighted-value--primary--font-weight',
    '--now-highlighted-value--secondary--text-transform': '--now-highlighted-value--primary--text-transform',
    '--now-highlighted-value--tertiary--font-family': '--now-highlighted-value--primary--font-family',
    '--now-highlighted-value--tertiary--font-style': '--now-highlighted-value--primary--font-style',
    '--now-highlighted-value--tertiary--font-weight': '--now-highlighted-value--primary--font-weight',
    '--now-highlighted-value--tertiary--text-transform': '--now-highlighted-value--primary--text-transform',
    '--now-display-type--header-primary--font-family': '--now-font-family',
    '--now-display-type--header-secondary--font-family': '--now-font-family',
    '--now-display-type--header-tertiary--font-family': '--now-font-family',
});
Constants.OLD_HOOKS_TO_NEW_HOOKS_MAPPING = {
    'colors': {
        'properties': {
            '--now-form-field--background-color': '--now-form-control-input--primary--background-color',
            '--now-form-field--border-color': '--now-form-control-input--primary--border-color',
            '--now-form-field_inset--color': '--now-form-control-input_inner-shadow--primary--color',
            '--now-form-field--color': '--now-form-control_value--primary--color',
            '--now-form-field_placeholder--color': '--now-form-control_value--placeholder--color',
            '--now-form-field--background-color--hover': '--now-form-control-input--primary--background-color--hover',
            '--now-form-field--border-color--hover': '--now-form-control-input--primary--border-color--hover',
            '--now-form-field_inset--color--hover': '--now-form-control-input_inner-shadow--primary--color--hover',
            '--now-form-field_placeholder--color--hover': '--now-form-control_value--placeholder--color--hover',
            '--now-form-field--background-color--readonly': '--now-form-control-input--primary--background-color--readonly',
            '--now-form-field--background-color--invalid': '--now-form-control-input--primary--background-color--invalid',
            '--now-form-field--border-color--invalid': '--now-form-control-input--primary--border-color--invalid',
            '--now-form-field_inset--color--invalid': '--now-form-control-input_inner-shadow--primary--color--invalid',
            '--now-form-field--color--invalid': '--now-form-control_value--color--invalid',
            '--now-form-field--background-color--invalid_hover': '--now-form-control-input--primary--background-color--invalid_hover',
            '--now-form-field--border-color--invalid_hover': '--now-form-control-input--primary--border-color--invalid_hover',
            '--now-form-field_inset--color--invalid_hover': '--now-form-control-input_inner-shadow--primary--color--invalid_hover',
        },
    },
    'shape': {
        'properties': {
            '--now-form-field--border-radius': '--now-form-control-input--primary--border-radius',
            '--now-form-field--border-width': '--now-form-control-input--primary--border-width',
            '--now-form-field--background-color-alpha': '--now-form-control-input--background-color-alpha',
            '--now-form-field--background-color-alpha--hover': '--now-form-control-input--background-color-alpha',
            '--now-form-field--background-color-alpha--readonly': '--now-form-control-input--background-color-alpha',
            '--now-form-field--background-color-alpha--invalid': '--now-form-control-input--background-color-alpha',
            '--now-form-field--background-color-alpha--invalid_hover': '--now-form-control-input--background-color-alpha',
            '--now-form-field_inset--color-alpha--hover': '--now-form-control-input_inner-shadow--color-alpha',
            '--now-form-field_inset--color-alpha--invalid': '--now-form-control-input_inner-shadow--color-alpha',
            '--now-form-field_inset--color-alpha--invalid_hover': '--now-form-control-input_inner-shadow--color-alpha',
            '--now-form-field--opacity--disabled': '--now-form-control-input--opacity--disabled',
        }
    }
};
Constants.HOOKS_TO_DELETE = {
    'colors': {
        'base': {
            '--now-color_alert--positive-0': '202, 223, 192',
            '--now-color_alert--positive-1': '126, 177, 101',
        },
        'properties': {}
    }
}

Constants.ADDITION_TO_HOOKS = {
    'colors': {
        'base': {},
        'properties': {}
    }
}

Constants.DARK_VARIANT = {
    colors: {
        isDark: 'true',
        base: {
            '--now-color--focus': '128,147,255',
            '--now-color--interactive': '74,109,250',
            '--now-color--link': '128,147,255',
            '--now-color--neutral': '99,103,106',
            '--now-color--primary': '74,109,250',
            '--now-color--secondary': '117,117,117',
            '--now-color_text--primary': '206,213,219',
            '--now-color_text--secondary': '147,159,171',
            '--now-color_text--tertiary': '95,109,122',
            '--now-color_border--primary': '52,63,74',
            '--now-color_border--secondary': '42,51,61',
            '--now-color_border--tertiary': '32,40,48',
            '--now-color_background--primary': '32,40,48',
            '--now-color_background--secondary': '23,29,36',
            '--now-color_background--tertiary': '16,21,26',
            '--now-color_alert--critical': '255,51,75',
            '--now-color_alert--high': '253,151,0',
            '--now-color_alert--warning': '240,224,0',
            '--now-color_alert--moderate': '139,107,255',
            '--now-color_alert--info': '56,170,244',
            '--now-color_alert--positive': '81,174,0',
            '--now-color_alert--low': '150,152,164',
            '--now-color_chrome--brand': '42,53,87',
            '--now-color_chrome--divider': '34,45,79',
            '--now-color_divider--primary': '112,116,119',
            '--now-color_divider--secondary': '83,87,91',
            '--now-color_divider--tertiary': '56,60,64',
            '--now-color_focus-ring': '74,109,250',
            '--now-color_focus-ring_shadow': '255,255,255',
            '--now-color_grouped--blue': '103,210,230',
            '--now-color_grouped--brown': '211,166,117',
            '--now-color_grouped--gray': '163,171,172',
            '--now-color_grouped--green': '81,185,98',
            '--now-color_grouped--green-yellow': '200,218,110',
            '--now-color_grouped--magenta': '232,105,191',
            '--now-color_grouped--orange': '255,140,114',
            '--now-color_grouped--pink': '224,128,160',
            '--now-color_grouped--purple': '189,122,234',
            '--now-color_grouped--teal': '81,194,194',
            '--now-color_grouped--yellow': '255,198,81',
            '--now-color_secondary-nav--brand': '42,53,87',
            '--now-color_secondary-nav--divider': '34,45,79',
            '--now-color_selection--primary': '37,55,125',
            '--now-color_selection--secondary': '27,31,35',
            '--now-color_surface--brand': '53,76,175'
        },
        properties: {
            '--now-uib-appbar_background': '--now-color_background--primary',
            '--now-color--focus-1': '122,122,122',
            '--now-color--focus-2': '176,176,176',
            '--now-color--focus-3': '223,223,223',
            '--now-color--interactive-0': '61,61,61',
            '--now-color--interactive-1': '128,128,128',
            '--now-color--interactive-2': '193,193,193',
            '--now-color--interactive-3': '217,217,217',
            '--now-color--interactive-4': '241,241,241',
            '--now-color--link-1': '17,116,136',
            '--now-color--link-2': '77,160,176',
            '--now-color--link-3': '122,193,207',
            '--now-color--link-4': '174,222,232',
            '--now-color--neutral-0': '255,255,255',
            '--now-color--neutral-1': '247,247,247',
            '--now-color--neutral-2': '231,231,231',
            '--now-color--neutral-3': '215,215,215',
            '--now-color--neutral-4': '199,199,199',
            '--now-color--neutral-5': '183,183,183',
            '--now-color--neutral-6': '168,168,168',
            '--now-color--neutral-7': '152,152,152',
            '--now-color--neutral-8': '136,136,136',
            '--now-color--neutral-9': '120,120,120',
            '--now-color--neutral-10': '105,105,105',
            '--now-color--neutral-11': '90,90,90',
            '--now-color--neutral-12': '80,80,80',
            '--now-color--neutral-13': '71,71,71',
            '--now-color--neutral-14': '63,63,63',
            '--now-color--neutral-15': '53,53,53',
            '--now-color--neutral-16': '45,45,45',
            '--now-color--neutral-17': '36,36,36',
            '--now-color--neutral-18': '26,26,26',
            '--now-color--neutral-19': '18,18,18',
            '--now-color--neutral-20': '9,9,9',
            '--now-color--neutral-21': '0,0,0',
            '--now-color_text--primary-actionable': '--now-color--neutral-20',
            '--now-color_text--secondary-actionable': '--now-color--neutral-18',
            '--now-color_text--tertiary-actionable': '--now-color--neutral-16',
            '--now-color_text--primary': '--now-color--neutral-0',
            '--now-color_text--secondary': '--now-color--neutral-4',
            '--now-color_text--tertiary': '--now-color--neutral-7',
            '--now-color_border--primary-actionable': '--now-color--neutral-0',
            '--now-color_border--secondary-actionable': '--now-color--neutral-4',
            '--now-color_border--tertiary-actionable': '--now-color--neutral-7',
            '--now-color_border--primary': '--now-color--neutral-8',
            '--now-color_border--secondary': '--now-color--neutral-10',
            '--now-color_border--tertiary': '--now-color--neutral-12',
            '--now-color_background--primary-actionable': '--now-color--neutral-0',
            '--now-color_background--secondary-actionable': '--now-color--neutral-4',
            '--now-color_background--tertiary-actionable': '--now-color--neutral-7',
            '--now-color_background--primary': '--now-color--neutral-20',
            '--now-color_background--secondary': '--now-color--neutral-18',
            '--now-color_background--tertiary': '--now-color--neutral-16',
            '--now-color--primary-0': '58,58,58',
            '--now-color--primary-1': '193,193,193',
            '--now-color--primary-2': '212,212,212',
            '--now-color--primary-3': '230,230,230',
            '--now-color--secondary-0': '58,58,58',
            '--now-color--secondary-1': '193,193,193',
            '--now-color--secondary-2': '212,212,212',
            '--now-color--secondary-3': '230,230,230',
            '--now-color_alert--critical-0': '123,30,40',
            '--now-color_alert--critical-1': '171,41,56',
            '--now-color_alert--critical-2': '219,53,72',
            '--now-color_alert--critical-3': '228,104,118',
            '--now-color_alert--critical-4': '237,154,164',
            '--now-color_alert--critical-5': '246,205,209',
            '--now-color_alert--high-0': '107,47,0',
            '--now-color_alert--high-1': '150,67,0',
            '--now-color_alert--high-2': '194,86,0',
            '--now-color_alert--high-3': '209,128,64',
            '--now-color_alert--high-4': '225,171,128',
            '--now-color_alert--high-5': '240,213,191',
            '--now-color_alert--info-0': '0,68,107',
            '--now-color_alert--info-1': '0,95,150',
            '--now-color_alert--info-2': '0,123,194',
            '--now-color_alert--info-3': '63,156,209',
            '--now-color_alert--info-4': '126,188,224',
            '--now-color_alert--info-5': '189,221,239',
            '--now-color_alert--low-0': '57,59,65',
            '--now-color_alert--low-1': '85,89,97',
            '--now-color_alert--low-2': '113,118,129',
            '--now-color_alert--low-3': '147,150,159',
            '--now-color_alert--low-4': '180,183,189',
            '--now-color_alert--low-5': '214,215,218',
            '--now-color_alert--moderate-0': '74,52,153',
            '--now-color_alert--moderate-1': '98,69,204',
            '--now-color_alert--moderate-2': '123,86,255',
            '--now-color_alert--moderate-3': '156,128,255',
            '--now-color_alert--moderate-4': '188,169,255',
            '--now-color_alert--moderate-5': '221,211,255',
            '--now-color_alert--positive-0': '33,70,21',
            '--now-color_alert--positive-1': '48,102,30',
            '--now-color_alert--positive-2': '63,133,39',
            '--now-color_alert--positive-3': '108,162,90',
            '--now-color_alert--positive-4': '154,191,141',
            '--now-color_alert--positive-5': '199,220,192',
            '--now-color_alert--warning-0': '65,59,0',
            '--now-color_alert--warning-1': '97,89,0',
            '--now-color_alert--warning-2': '129,118,0',
            '--now-color_alert--warning-3': '161,152,64',
            '--now-color_alert--warning-4': '192,187,128',
            '--now-color_alert--warning-5': '224,221,191',
            '--now-color_brand--neutral': '--now-color--neutral-11',
            '--now-color_brand--primary': '--now-color--interactive-2',
            '--now-color_brand--secondary': '--now-color--neutral-19',
            '--now-color_chrome--brand-0': '--now-color--neutral-0',
            '--now-color_chrome--brand-1': '--now-color--neutral-2',
            '--now-color_chrome--brand-2': '--now-color--neutral-4',
            '--now-color_chrome--brand-3': '--now-color--neutral-6',
            '--now-color_chrome--brand-4': '--now-color--neutral-8',
            '--now-color_chrome--brand-5': '--now-color--neutral-10',
            '--now-color_chrome--brand-6': '--now-color--neutral-12',
            '--now-color_chrome--brand-7': '--now-color--neutral-14',
            '--now-color_chrome--brand-8': '--now-color--neutral-16',
            '--now-color_chrome--brand-9': '--now-color--neutral-18',
            '--now-color_chrome--brand-10': '--now-color--neutral-20',
            '--now-color_chrome--divider-0': '--now-color--neutral-1',
            '--now-color_chrome--divider-1': '--now-color--neutral-3',
            '--now-color_chrome--divider-2': '--now-color--neutral-5',
            '--now-color_chrome--divider-3': '--now-color--neutral-7',
            '--now-color_chrome--divider-4': '--now-color--neutral-9',
            '--now-color_chrome--divider-5': '--now-color--neutral-11',
            '--now-color_chrome--divider-6': '--now-color--neutral-13',
            '--now-color_chrome--divider-7': '--now-color--neutral-15',
            '--now-color_chrome--divider-8': '--now-color--neutral-17',
            '--now-color_chrome--divider-9': '--now-color--neutral-19',
            '--now-color_chrome--divider-10': '--now-color--neutral-21',
            '--now-color_divider--primary': '--now-color--neutral-10',
            '--now-color_divider--secondary': '--now-color--neutral-12',
            '--now-color_divider--tertiary': '--now-color--neutral-14',
            '--now-color_focus-ring': '--now-color--focus-2',
            '--now-color_focus-ring_shadow': '--now-color_text--primary',
            '--now-color_grouped--blue-0': '0,70,82',
            '--now-color_grouped--blue-1': '0,100,116',
            '--now-color_grouped--blue-2': '0,130,151',
            '--now-color_grouped--blue-3': '64,161,177',
            '--now-color_grouped--blue-4': '128,193,203',
            '--now-color_grouped--blue-5': '191,224,229',
            '--now-color_grouped--brown-0': '90,56,11',
            '--now-color_grouped--brown-1': '129,80,16',
            '--now-color_grouped--brown-2': '167,104,21',
            '--now-color_grouped--brown-3': '189,142,80',
            '--now-color_grouped--brown-4': '211,180,138',
            '--now-color_grouped--brown-5': '233,217,197',
            '--now-color_grouped--gray-0': '54,61,61',
            '--now-color_grouped--gray-1': '81,91,91',
            '--now-color_grouped--gray-2': '108,121,121',
            '--now-color_grouped--gray-3': '145,155,155',
            '--now-color_grouped--gray-4': '182,188,188',
            '--now-color_grouped--gray-5': '218,222,222',
            '--now-color_grouped--green-0': '30,74,37',
            '--now-color_grouped--green-1': '43,104,53',
            '--now-color_grouped--green-2': '55,134,68',
            '--now-color_grouped--green-3': '105,164,115',
            '--now-color_grouped--green-4': '155,195,162',
            '--now-color_grouped--green-5': '205,225,208',
            '--now-color_grouped--green-yellow-0': '56,63,0',
            '--now-color_grouped--green-yellow-1': '83,95,0',
            '--now-color_grouped--green-yellow-2': '111,126,0',
            '--now-color_grouped--green-yellow-3': '147,158,64',
            '--now-color_grouped--green-yellow-4': '183,191,128',
            '--now-color_grouped--green-yellow-5': '219,223,191',
            '--now-color_grouped--magenta-0': '111,38,87',
            '--now-color_grouped--magenta-1': '153,53,120',
            '--now-color_grouped--magenta-2': '195,67,153',
            '--now-color_grouped--magenta-3': '210,114,179',
            '--now-color_grouped--magenta-4': '225,161,204',
            '--now-color_grouped--magenta-5': '240,208,230',
            '--now-color_grouped--orange-0': '115,44,30',
            '--now-color_grouped--orange-1': '159,60,41',
            '--now-color_grouped--orange-2': '202,77,52',
            '--now-color_grouped--orange-3': '215,122,103',
            '--now-color_grouped--orange-4': '229,166,154',
            '--now-color_grouped--orange-5': '242,211,204',
            '--now-color_grouped--pink-0': '113,45,65',
            '--now-color_grouped--pink-1': '154,61,88',
            '--now-color_grouped--pink-2': '195,77,112',
            '--now-color_grouped--pink-3': '210,122,148',
            '--now-color_grouped--pink-4': '225,166,184',
            '--now-color_grouped--pink-5': '240,211,219',
            '--now-color_grouped--purple-0': '97,46,133',
            '--now-color_grouped--purple-1': '130,62,177',
            '--now-color_grouped--purple-2': '162,77,221',
            '--now-color_grouped--purple-3': '185,122,230',
            '--now-color_grouped--purple-4': '209,166,238',
            '--now-color_grouped--purple-5': '232,211,247',
            '--now-color_grouped--teal-0': '0,67,67',
            '--now-color_grouped--teal-1': '0,99,99',
            '--now-color_grouped--teal-2': '0,131,131',
            '--now-color_grouped--teal-3': '64,162,162',
            '--now-color_grouped--teal-4': '128,193,193',
            '--now-color_grouped--teal-5': '191,224,224',
            '--now-color_grouped--yellow-0': '74,60,0',
            '--now-color_grouped--yellow-1': '109,88,0',
            '--now-color_grouped--yellow-2': '143,116,0',
            '--now-color_grouped--yellow-3': '171,151,64',
            '--now-color_grouped--yellow-4': '199,186,128',
            '--now-color_grouped--yellow-5': '227,220,191',
            '--now-color_presence--available': '78,168,0',
            '--now-color_presence--away': '226,121,24',
            '--now-color_presence--busy': '255,51,75',
            '--now-color_presence--offline': '146,148,160',
            '--now-color_secondary-nav--brand-0': '253,253,253',
            '--now-color_secondary-nav--brand-1': '229,229,229',
            '--now-color_secondary-nav--brand-2': '204,204,204',
            '--now-color_secondary-nav--brand-3': '178,178,178',
            '--now-color_secondary-nav--brand-4': '154,154,154',
            '--now-color_secondary-nav--brand-5': '128,128,128',
            '--now-color_secondary-nav--brand-6': '104,104,104',
            '--now-color_secondary-nav--brand-7': '83,83,83',
            '--now-color_secondary-nav--brand-8': '62,62,62',
            '--now-color_secondary-nav--brand-9': '41,41,41',
            '--now-color_secondary-nav--brand-10': '20,20,20',
            '--now-color_secondary-nav--divider-0': '243,243,243',
            '--now-color_secondary-nav--divider-1': '221,221,221',
            '--now-color_secondary-nav--divider-2': '197,197,197',
            '--now-color_secondary-nav--divider-3': '174,174,174',
            '--now-color_secondary-nav--divider-4': '152,152,152',
            '--now-color_secondary-nav--divider-5': '128,128,128',
            '--now-color_secondary-nav--divider-6': '105,105,105',
            '--now-color_secondary-nav--divider-7': '83,83,83',
            '--now-color_secondary-nav--divider-8': '60,60,60',
            '--now-color_secondary-nav--divider-9': '38,38,38',
            '--now-color_secondary-nav--divider-10': '15,15,15',
            '--now-color_selection--primary-0': '--now-color--interactive-0',
            '--now-color_selection--primary-1': '--now-color--interactive-1',
            '--now-color_selection--primary-2': '--now-color--interactive-2',
            '--now-color_selection--primary-3': '--now-color--interactive-3',
            '--now-color_selection--primary-4': '--now-color--interactive-4',
            '--now-color_selection--secondary-0': '--now-color--neutral-16',
            '--now-color_selection--secondary-1': '--now-color--neutral-12',
            '--now-color_selection--secondary-2': '--now-color--neutral-8',
            '--now-color_selection--secondary-3': '--now-color--neutral-4',
            '--now-color_selection--secondary-4': '--now-color--neutral-0',
            '--now-color_surface--brand-1': '--now-color_alert--info-0',
            '--now-color_surface--brand-2': '--now-color_alert--info-1',
            '--now-color_surface--brand-3': '--now-color_alert--info-2',
            '--now-color_surface--brand-4': '--now-color_alert--info-3',
            '--now-color_surface--brand-5': '--now-color_alert--info-4',
            '--now-color_surface--brand-6': '--now-color_alert--info-5',
            '--now-color_surface--divider-1': '--now-color--neutral-19',
            '--now-color_surface--divider-2': '--now-color--neutral-17',
            '--now-color_surface--divider-3': '--now-color--neutral-15',
            '--now-color_surface--divider-4': '--now-color--neutral-13',
            '--now-color_surface--divider-5': '--now-color--neutral-11',
            '--now-color_surface--divider-6': '--now-color--neutral-9',
            '--now-color_surface--neutral-1': '--now-color--neutral-20',
            '--now-color_surface--neutral-2': '--now-color--neutral-18',
            '--now-color_surface--neutral-3': '--now-color--neutral-16',
            '--now-color_surface--neutral-4': '--now-color--neutral-14',
            '--now-color_surface--neutral-5': '--now-color--neutral-12',
            '--now-color_surface--neutral-6': '--now-color--neutral-10',
            '--now-accordion_caption--primary--color': '--now-color_text--primary',
            '--now-accordion_caption--secondary--color': '--now-color_text--secondary',
            '--now-accordion_divider--color': '--now-color_divider--tertiary',
            '--now-accordion_heading--primary--color': '--now-color_text--primary',
            '--now-accordion_heading--secondary--color': '--now-color_text--secondary',
            '--now-accordion_icon--color': '--now-color_text--secondary',
            '--now-accordion--color': '--now-color_text--secondary',
            '--now-accordion--color--disabled': '--now-button--color--disabled',
            '--now-alert-list_controller--background-color': '--now-color_alert--low-0',
            '--now-alert-list_controller--background-color--active': '--now-alert-list_controller--background-color',
            '--now-alert-list_controller--background-color--hover': '--now-alert-list_controller--background-color',
            '--now-alert-list_controller--border-color': '--now-color_alert--low-1',
            '--now-alert-list_controller--border-color--active': '--now-alert-list_controller--border-color',
            '--now-alert-list_controller--border-color--hover': '--now-alert-list_controller--border-color',
            '--now-alert-list_controller--color': '--now-alert--color',
            '--now-alert-list_controller--color--active': '--now-alert-list_controller--color',
            '--now-alert-list_controller--color--hover': '--now-alert-list_controller--color',
            '--now-alert-list_controller-dismiss--background-color': '--now-alert_button--background-color',
            '--now-alert-list_controller-dismiss--background-color--active': '--now-alert_button--background-color--active',
            '--now-alert-list_controller-dismiss--background-color--hover': '--now-alert_button--background-color--hover',
            '--now-alert-list_controller-dismiss--border-color': '--now-alert_button--border-color',
            '--now-alert-list_controller-dismiss--color': '--now-alert-list_controller--color',
            '--now-alert-list_controller-dismiss--color--active': '--now-alert-list_controller--color',
            '--now-alert-list_controller-dismiss--color--hover': '--now-alert-list_controller--color',
            '--now-alert_button--background-color': '--now-color_background--primary',
            '--now-alert_button--background-color--active': '--now-alert_button--background-color',
            '--now-alert_button--background-color--hover': '--now-alert_button--background-color',
            '--now-alert_button--border-color': '--now-color_text--primary',
            '--now-alert_button--border-color--active': '--now-alert_button--border-color',
            '--now-alert_button--border-color--hover': '--now-alert_button--border-color',
            '--now-alert_button--color': '--now-color_text--primary',
            '--now-alert_button--color--active': '--now-alert_button--color',
            '--now-alert_button--color--hover': '--now-alert_button--color',
            '--now-alert--color': '--now-color_text--primary',
            '--now-alert--critical--background-color': '--now-color_alert--critical-0',
            '--now-alert--critical--border-color': '--now-color_alert--critical-1',
            '--now-alert--critical--color': '--now-color_alert--critical-3',
            '--now-alert--critical--color--active': '--now-color_alert--critical-5',
            '--now-alert--critical--color--hover': '--now-color_alert--critical-4',
            '--now-alert--high--background-color': '--now-color_alert--high-0',
            '--now-alert--high--border-color': '--now-color_alert--high-1',
            '--now-alert--high--color': '--now-color_alert--high-3',
            '--now-alert--high--color--active': '--now-color_alert--high-5',
            '--now-alert--high--color--hover': '--now-color_alert--high-4',
            '--now-alert--info--background-color': '--now-color_alert--info-0',
            '--now-alert--info--border-color': '--now-color_alert--info-1',
            '--now-alert--info--color': '--now-color_alert--info-3',
            '--now-alert--info--color--active': '--now-color_alert--info-5',
            '--now-alert--info--color--hover': '--now-color_alert--info-4',
            '--now-alert--low--background-color': '--now-color_alert--low-0',
            '--now-alert--low--border-color': '--now-color_alert--low-1',
            '--now-alert--low--color': '--now-color_alert--low-3',
            '--now-alert--low--color--active': '--now-color_alert--low-5',
            '--now-alert--low--color--hover': '--now-color_alert--low-4',
            '--now-alert--moderate--background-color': '--now-color_alert--moderate-0',
            '--now-alert--moderate--border-color': '--now-color_alert--moderate-1',
            '--now-alert--moderate--color': '--now-color_alert--moderate-3',
            '--now-alert--moderate--color--active': '--now-color_alert--moderate-5',
            '--now-alert--moderate--color--hover': '--now-color_alert--moderate-4',
            '--now-alert--positive--background-color': '--now-color_alert--positive-0',
            '--now-alert--positive--border-color': '--now-color_alert--positive-1',
            '--now-alert--positive--color': '--now-color_alert--positive-3',
            '--now-alert--positive--color--active': '--now-color_alert--positive-5',
            '--now-alert--positive--color--hover': '--now-color_alert--positive-4',
            '--now-alert--warning--background-color': '--now-color_alert--warning-0',
            '--now-alert--warning--border-color': '--now-color_alert--warning-1',
            '--now-alert--warning--color': '--now-color_alert--warning-4',
            '--now-alert--warning--color--active': '--now-color_text--primary',
            '--now-alert--warning--color--hover': '--now-color_alert--warning-5',
            '--now-avatar--background-color': '--now-color_background--secondary',
            '--now-avatar--border-color': '--now-color_border--tertiary',
            '--now-avatar--color': '--now-color_text--secondary',
            '--now-badge--primary--color': '--now-color_text--primary',
            '--now-badge--primary_critical--background-color': '--now-color_alert--critical-2',
            '--now-badge--primary_critical--border-color': '--now-color_alert--critical-3',
            '--now-badge--primary_critical--color': '--now-color--neutral-0',
            '--now-badge--primary_high--background-color': '--now-color_alert--high-2',
            '--now-badge--primary_high--border-color': '--now-color_alert--high-3',
            '--now-badge--primary_high--color': '--now-badge--primary--color',
            '--now-badge--primary_info--background-color': '--now-color_alert--info-2',
            '--now-badge--primary_info--border-color': '--now-color_alert--info-3',
            '--now-badge--primary_info--color': '--now-color--neutral-0',
            '--now-badge--primary_low--background-color': '--now-color_alert--low-2',
            '--now-badge--primary_low--border-color': '--now-color_alert--low-3',
            '--now-badge--primary_low--color': '--now-color--neutral-0',
            '--now-badge--primary_moderate--background-color': '--now-color_alert--moderate-2',
            '--now-badge--primary_moderate--border-color': '--now-color_alert--moderate-3',
            '--now-badge--primary_moderate--color': '--now-color--neutral-0',
            '--now-badge--primary_positive--background-color': '--now-color_alert--positive-2',
            '--now-badge--primary_positive--border-color': '--now-color_alert--positive-3',
            '--now-badge--primary_positive--color': '--now-color--neutral-0',
            '--now-badge--primary_warning--background-color': '--now-color_alert--warning-2',
            '--now-badge--primary_warning--border-color': '--now-color_alert--warning-3',
            '--now-badge--primary_warning--color': '--now-badge--primary--color',
            '--now-badge--primary_yellow--color': '--now-badge--primary--color',
            '--now-badge--primary_yellow--background-color': '--now-color_grouped--yellow-2',
            '--now-badge--primary_yellow--border-color': '--now-color_grouped--yellow-3',
            '--now-badge--primary_orange--color': '--now-badge--primary--color',
            '--now-badge--primary_orange--background-color': '--now-color_grouped--orange-2',
            '--now-badge--primary_orange--border-color': '--now-color_grouped--orange-3',
            '--now-badge--primary_magenta--color': '--now-badge--primary--color',
            '--now-badge--primary_magenta--background-color': '--now-color_grouped--magenta-2',
            '--now-badge--primary_magenta--border-color': '--now-color_grouped--magenta-3',
            '--now-badge--primary_purple--color': '--now-badge--primary--color',
            '--now-badge--primary_purple--background-color': '--now-color_grouped--purple-2',
            '--now-badge--primary_purple--border-color': '--now-color_grouped--purple-3',
            '--now-badge--primary_blue--color': '--now-badge--primary--color',
            '--now-badge--primary_blue--background-color': '--now-color_grouped--blue-2',
            '--now-badge--primary_blue--border-color': '--now-color_grouped--blue-3',
            '--now-badge--primary_green-yellow--color': '--now-badge--primary--color',
            '--now-badge--primary_green-yellow--background-color': '--now-color_grouped--green-yellow-2',
            '--now-badge--primary_green-yellow--border-color': '--now-color_grouped--green-yellow-3',
            '--now-badge--primary_pink--color': '--now-badge--primary--color',
            '--now-badge--primary_pink--background-color': '--now-color_grouped--pink-2',
            '--now-badge--primary_pink--border-color': '--now-color_grouped--pink-3',
            '--now-badge--primary_brown--color': '--now-badge--primary--color',
            '--now-badge--primary_brown--background-color': '--now-color_grouped--brown-2',
            '--now-badge--primary_brown--border-color': '--now-color_grouped--brown-3',
            '--now-badge--primary_green--color': '--now-badge--primary--color',
            '--now-badge--primary_green--background-color': '--now-color_grouped--green-2',
            '--now-badge--primary_green--border-color': '--now-color_grouped--green-3',
            '--now-badge--primary_teal--color': '--now-badge--primary--color',
            '--now-badge--primary_teal--background-color': '--now-color_grouped--teal-2',
            '--now-badge--primary_teal--border-color': '--now-color_grouped--teal-3',
            '--now-badge--primary_gray--color': '--now-badge--primary--color',
            '--now-badge--primary_gray--background-color': '--now-color_grouped--gray-2',
            '--now-badge--primary_gray--border-color': '--now-color_grouped--gray-3',
            '--now-badge--secondary--color': '--now-color_text--secondary',
            '--now-badge--secondary_critical--background-color': '--now-color_alert--critical-0',
            '--now-badge--secondary_critical--border-color': '--now-color_alert--critical-1',
            '--now-badge--secondary_critical--color': '--now-color_alert--critical-5',
            '--now-badge--secondary_high--background-color': '--now-color_alert--high-0',
            '--now-badge--secondary_high--border-color': '--now-color_alert--high-1',
            '--now-badge--secondary_high--color': '--now-color_alert--high-5',
            '--now-badge--secondary_info--background-color': '--now-color_alert--info-0',
            '--now-badge--secondary_info--border-color': '--now-color_alert--info-1',
            '--now-badge--secondary_info--color': '--now-color_alert--info-5',
            '--now-badge--secondary_low--background-color': '--now-color_alert--low-0',
            '--now-badge--secondary_low--border-color': '--now-color_alert--low-1',
            '--now-badge--secondary_low--color': '--now-color_alert--low-5',
            '--now-badge--secondary_moderate--background-color': '--now-color_alert--moderate-0',
            '--now-badge--secondary_moderate--border-color': '--now-color_alert--moderate-1',
            '--now-badge--secondary_moderate--color': '--now-color_alert--moderate-5',
            '--now-badge--secondary_positive--background-color': '--now-color_alert--positive-0',
            '--now-badge--secondary_positive--border-color': '--now-color_alert--positive-1',
            '--now-badge--secondary_positive--color': '--now-color_alert--positive-5',
            '--now-badge--secondary_warning--background-color': '--now-color_alert--warning-0',
            '--now-badge--secondary_warning--border-color': '--now-color_alert--warning-1',
            '--now-badge--secondary_warning--color': '--now-color_alert--warning-5',
            '--now-badge--secondary_yellow--color': '--now-color_text--tertiary',
            '--now-badge--secondary_yellow--background-color': '--now-color_grouped--yellow-0',
            '--now-badge--secondary_yellow--border-color': '--now-color_grouped--yellow-1',
            '--now-badge--secondary_orange--color': '--now-color_grouped--orange-5',
            '--now-badge--secondary_orange--background-color': '--now-color_grouped--orange-0',
            '--now-badge--secondary_orange--border-color': '--now-color_grouped--orange-1',
            '--now-badge--secondary_magenta--color': '--now-color_grouped--magenta-5',
            '--now-badge--secondary_magenta--background-color': '--now-color_grouped--magenta-0',
            '--now-badge--secondary_magenta--border-color': '--now-color_grouped--magenta-1',
            '--now-badge--secondary_purple--color': '--now-color_grouped--purple-5',
            '--now-badge--secondary_purple--background-color': '--now-color_grouped--purple-0',
            '--now-badge--secondary_purple--border-color': '--now-color_grouped--purple-1',
            '--now-badge--secondary_blue--color': '--now-color_grouped--blue-5',
            '--now-badge--secondary_blue--background-color': '--now-color_grouped--blue-0',
            '--now-badge--secondary_blue--border-color': '--now-color_grouped--blue-1',
            '--now-badge--secondary_green-yellow--color': '--now-color_grouped--green-yellow-5',
            '--now-badge--secondary_green-yellow--background-color': '--now-color_grouped--green-yellow-0',
            '--now-badge--secondary_green-yellow--border-color': '--now-color_grouped--green-yellow-1',
            '--now-badge--secondary_pink--color': '--now-color_grouped--pink-5',
            '--now-badge--secondary_pink--background-color': '--now-color_grouped--pink-0',
            '--now-badge--secondary_pink--border-color': '--now-color_grouped--pink-1',
            '--now-badge--secondary_brown--color': '--now-color_grouped--brown-5',
            '--now-badge--secondary_brown--background-color': '--now-color_grouped--brown-0',
            '--now-badge--secondary_brown--border-color': '--now-color_grouped--brown-1',
            '--now-badge--secondary_green--color': '--now-color_grouped--green-5',
            '--now-badge--secondary_green--background-color': '--now-color_grouped--green-0',
            '--now-badge--secondary_green--border-color': '--now-color_grouped--green-1',
            '--now-badge--secondary_teal--color': '--now-color_grouped--teal-5',
            '--now-badge--secondary_teal--background-color': '--now-color_grouped--teal-0',
            '--now-badge--secondary_teal--border-color': '--now-color_grouped--teal-1',
            '--now-badge--secondary_gray--color': '--now-color_grouped--gray-5',
            '--now-badge--secondary_gray--background-color': '--now-color_grouped--gray-0',
            '--now-badge--secondary_gray--border-color': '--now-color_grouped--gray-1',
            '--now-breadcrumbs_dropdown--background-color--active': '--now-color--secondary-3',
            '--now-breadcrumbs_dropdown--background-color--hover': '--now-color--secondary-2',
            '--now-breadcrumbs_dropdown--color': '--now-color_text--secondary',
            '--now-breadcrumbs_dropdown--color--active': '--now-breadcrumbs--color--hover',
            '--now-breadcrumbs_dropdown--color--hover': '--now-breadcrumbs--color--hover',
            '--now-breadcrumbs--background-color': '--now-color_background--primary',
            '--now-breadcrumbs--background-color--current': '--now-breadcrumbs--background-color',
            '--now-breadcrumbs--background-color--hover': '--now-breadcrumbs--background-color',
            '--now-breadcrumbs--color': '--now-color_text--secondary',
            '--now-breadcrumbs--color--current': '--now-color_text--primary',
            '--now-breadcrumbs--color--hover': '--now-color_text--primary',
            '--now-button-circular--background-color': '--now-button--primary--background-color',
            '--now-button-circular--background-color--active': '--now-button--primary--background-color--active',
            '--now-button-circular--background-color--disabled': '--now-color_background--tertiary',
            '--now-button-circular--background-color--hover': '--now-button--primary--background-color--hover',
            '--now-button-circular--border-color': '--now-button--primary--border-color',
            '--now-button-circular--border-color--active': '--now-button--primary--border-color--active',
            '--now-button-circular--border-color--hover': '--now-button--primary--border-color--hover',
            '--now-button-circular--color': '--now-button--primary--color',
            '--now-button-circular--color--active': '--now-button--primary--color--active',
            '--now-button-circular--color--disabled': '--now-color_text--tertiary',
            '--now-button-circular--color--hover': '--now-button--primary--color--hover',
            '--now-button--bare_primary--background-color--active': '--now-color--primary-2',
            '--now-button--bare_primary--background-color--hover': '--now-color--primary-2',
            '--now-button--bare_primary--background-color--selected_active': '--now-button--bare_primary--background-color--active',
            '--now-button--bare_primary--background-color--selected_hover': '--now-button--bare_primary--background-color--hover',
            '--now-button--bare_primary--color': '--now-color--primary-1',
            '--now-button--bare_primary--color--active': '--now-color--primary-3',
            '--now-button--bare_primary--color--hover': '--now-color--primary-2',
            '--now-button--bare_primary--color--selected': '--now-button--bare_primary--color',
            '--now-button--bare_primary--color--selected_active': '--now-button--bare_primary--color--active',
            '--now-button--bare_primary--color--selected_hover': '--now-button--bare_primary--color--hover',
            '--now-button--bare_secondary--background-color--active': '--now-color--secondary-2',
            '--now-button--bare_secondary--background-color--hover': '--now-color--secondary-2',
            '--now-button--bare_secondary--background-color--selected_active': '--now-button--bare_secondary--background-color--active',
            '--now-button--bare_secondary--background-color--selected_hover': '--now-button--bare_secondary--background-color--hover',
            '--now-button--bare_secondary--color': '--now-color--secondary-1',
            '--now-button--bare_secondary--color--active': '--now-color--secondary-3',
            '--now-button--bare_secondary--color--hover': '--now-color--secondary-2',
            '--now-button--bare_secondary--color--selected': '--now-button--bare_secondary--color',
            '--now-button--bare_secondary--color--selected_active': '--now-button--bare_secondary--color--active',
            '--now-button--bare_secondary--color--selected_hover': '--now-button--bare_secondary--color--hover',
            '--now-button--bare_tertiary--background-color--active': '--now-color_border--secondary',
            '--now-button--bare_tertiary--background-color--hover': '--now-color_border--secondary',
            '--now-button--bare_tertiary--background-color--selected_active': '--now-button--bare_tertiary--background-color--active',
            '--now-button--bare_tertiary--background-color--selected_hover': '--now-button--bare_tertiary--background-color--hover',
            '--now-button--bare_tertiary--color': '--now-color_text--primary',
            '--now-button--bare_tertiary--color--active': '--now-color--secondary-3',
            '--now-button--bare_tertiary--color--hover': '--now-color--secondary-2',
            '--now-button--bare_tertiary--color--selected': '--now-color--secondary-1',
            '--now-button--bare_tertiary--color--selected_active': '--now-button--bare_tertiary--color--active',
            '--now-button--bare_tertiary--color--selected_hover': '--now-button--bare_tertiary--color--hover',
            '--now-button--color--disabled': '--now-color_text--tertiary',
            '--now-button--primary_high-contrast--color': '--now-color--primary-2',
            '--now-button--primary_high-contrast--color--active': '--now-color_text--primary',
            '--now-button--primary_high-contrast--color--hover': '--now-color--primary-3',
            '--now-button--primary--background-color': '--now-color--interactive-2',
            '--now-button--primary--background-color--active': '--now-color--interactive-3',
            '--now-button--primary--background-color--hover': '--now-color--interactive-4',
            '--now-button--primary--border-color': '--now-color--primary-3',
            '--now-button--primary--border-color--active': '--now-button--primary--border-color',
            '--now-button--primary--border-color--hover': '--now-button--primary--border-color',
            '--now-button--primary--color': '--now-color_text--primary-actionable',
            '--now-button--primary--color--active': '--now-button--primary--color',
            '--now-button--primary--color--hover': '--now-button--primary--color',
            '--now-button--primary_highlighted--background-color--selected': '--now-color--primary-2',
            '--now-button--primary_highlighted--background-color--selected_active': '--now-button--primary_highlighted--background-color--selected',
            '--now-button--primary_highlighted--background-color--selected_hover': '--now-button--primary_highlighted--background-color--selected',
            '--now-button--primary-negative--background-color': '228,104,118',
            '--now-button--primary-negative--background-color--active': '246,205,209',
            '--now-button--primary-negative--background-color--hover': '237,154,164',
            '--now-button--primary-negative--border-color': '7,8,11',
            '--now-button--primary-negative--border-color--active': '7,8,11',
            '--now-button--primary-negative--border-color--hover': '7,8,11',
            '--now-button--primary-negative--color': '7,8,11',
            '--now-button--primary-negative--color--active': '7,8,11',
            '--now-button--primary-negative--color--hover': '7,8,11',
            '--now-button--primary-positive--background-color': '108,162,90',
            '--now-button--primary-positive--background-color--active': '199,220,192',
            '--now-button--primary-positive--background-color--hover': '154,191,141',
            '--now-button--primary-positive--border-color': '7,8,11',
            '--now-button--primary-positive--border-color--active': '7,8,11',
            '--now-button--primary-positive--border-color--hover': '7,8,11',
            '--now-button--primary-positive--color': '7,8,11',
            '--now-button--primary-positive--color--active': '7,8,11',
            '--now-button--primary-positive--color--hover': '7,8,11',
            '--now-button--primary-selection--color': '--now-color_selection--primary-2',
            '--now-button--primary-selection--color--active': '--now-color_selection--primary-4',
            '--now-button--primary-selection--color--hover': '--now-color_selection--primary-3',
            '--now-button--primary-selection--background-color--active': '--now-color_selection--primary-3',
            '--now-button--primary-selection--background-color--hover': '--now-color_selection--primary-3',
            '--now-button--primary-selection_high-contrast--color': '--now-color_selection--primary-4',
            '--now-button--primary-selection_high-contrast--color--active': '--now-color_text--primary',
            '--now-button--primary-selection_high-contrast--color--hover': '--now-color_text--primary',
            '--now-button--primary-selection_highlighted--background-color--selected': '--now-color_selection--primary-2',
            '--now-button--primary-selection_highlighted--background-color--selected_active': '--now-button--primary-selection_highlighted--background-color--selected',
            '--now-button--primary-selection_highlighted--background-color--selected_hover': '--now-button--primary-selection_highlighted--background-color--selected',
            '--now-button-iconic--secondary--background-color': '--now-color_surface--neutral-6',
            '--now-button-iconic--secondary--background-color--hover': '--now-color_surface--divider-5',
            '--now-button-iconic--secondary--background-color--active': '--now-color_surface--divider-6',
            '--now-button-iconic--secondary--color': '--now-color_text--primary',
            '--now-button-iconic--secondary--color--hover': '--now-color_text--primary',
            '--now-button-iconic--secondary--color--active': '--now-color_text--primary',
            '--now-button-iconic_icon--secondary--color': '--now-color_text--primary',
            '--now-button-iconic_icon--secondary--color--hover': '--now-color_text--primary',
            '--now-button-iconic_icon--secondary--color--active': '--now-color_text--primary',
            '--now-button--secondary--background-color': '--now-color_surface--neutral-6',
            '--now-button--secondary--background-color--active': '--now-color_surface--divider-6',
            '--now-button--secondary--background-color--hover': '--now-color_surface--divider-5',
            '--now-button--secondary--border-color': '--now-color_surface--neutral-6',
            '--now-button--secondary--border-color--active': '--now-color_surface--divider-6',
            '--now-button--secondary--border-color--hover': '255,255,255',
            '--now-button--secondary--color': '--now-color_text--primary',
            '--now-button--secondary--color--active': '0,0,0',
            '--now-button--secondary--color--hover': '--now-color_text--primary',
            '--now-button_icon--secondary--color': '--now-color_text--primary',
            '--now-button_icon--secondary--color--hover': '--now-color_text--primary',
            '--now-button_icon--secondary--color--active': '0,0,0',
            '--now-button--secondary_high-contrast--color': '--now-color_text--tertiary',
            '--now-button--secondary_high-contrast--color--active': '--now-color_text--primary',
            '--now-button--secondary_high-contrast--color--hover': '--now-color_text--secondary',
            '--now-button--secondary_highlighted--background-color--selected': '--now-color--primary-2',
            '--now-button--secondary_highlighted--background-color--selected_active': '--now-button--secondary_highlighted--background-color--selected',
            '--now-button--secondary_highlighted--background-color--selected_hover': '--now-button--secondary_highlighted--background-color--selected',
            '--now-button--secondary-negative--background-color': '--now-color_alert--critical-0',
            '--now-button--secondary-negative--background-color--active': '--now-color_alert--critical-2',
            '--now-button--secondary-negative--background-color--hover': '--now-color_alert--critical-1',
            '--now-button--secondary-negative--border-color': '--now-color_alert--critical-2',
            '--now-button--secondary-negative--border-color--active': '--now-button--secondary-negative--border-color',
            '--now-button--secondary-negative--border-color--hover': '--now-button--secondary-negative--border-color',
            '--now-button--secondary-negative--color': '--now-color_alert--critical-4',
            '--now-button--secondary-negative--color--active': '--now-color_text--primary',
            '--now-button--secondary-negative--color--hover': '--now-color_alert--critical-5',
            '--now-button--secondary-positive--background-color': '--now-color_alert--positive-0',
            '--now-button--secondary-positive--background-color--active': '--now-color_alert--positive-2',
            '--now-button--secondary-positive--background-color--hover': '--now-color_alert--positive-1',
            '--now-button--secondary-positive--border-color': '--now-color_alert--positive-2',
            '--now-button--secondary-positive--border-color--active': '--now-button--secondary-positive--border-color',
            '--now-button--secondary-positive--border-color--hover': '--now-button--secondary-positive--border-color',
            '--now-button--secondary-positive--color': '--now-color_alert--positive-4',
            '--now-button--secondary-positive--color--active': '--now-color_text--primary',
            '--now-button--secondary-positive--color--hover': '--now-color_alert--positive-5',
            '--now-button--secondary-selection--color': '--now-color_selection--primary-2',
            '--now-button--secondary-selection--color--active': '--now-color_selection--primary-4',
            '--now-button--secondary-selection--color--hover': '--now-color_selection--primary-3',
            '--now-button--secondary-selection--background-color--active': '--now-color_border--secondary',
            '--now-button--secondary-selection--background-color--hover': '--now-color_border--secondary',
            '--now-button--secondary-selection_high-contrast--color': '--now-color_selection--primary-4',
            '--now-button--secondary-selection_high-contrast--color--active': '--now-color_text--primary',
            '--now-button--secondary-selection_high-contrast--color--hover': '--now-color_text--secondary',
            '--now-button--secondary-selection_highlighted--background-color--selected': '--now-color_selection--primary-2',
            '--now-button--secondary-selection_highlighted--background-color--selected_active': '--now-button--secondary-selection_highlighted--background-color--selected',
            '--now-button--secondary-selection_highlighted--background-color--selected_hover': '--now-button--secondary-selection_highlighted--background-color--selected',
            '--now-button--tertiary_high-contrast--color': '--now-button--tertiary--color',
            '--now-button--tertiary_high-contrast--color--active': '--now-color_text--primary',
            '--now-button--tertiary_high-contrast--color--hover': '--now-color--secondary-3',
            '--now-button-iconic--tertiary--color': '--now-color_text--tertiary',
            '--now-button-iconic--tertiary--color--hover': '--now-color_text--tertiary',
            '--now-button-iconic--tertiary--color--active': '--now-color_text--tertiary',
            '--now-button-iconic_icon--tertiary--color': '--now-color_text--tertiary',
            '--now-button-iconic_icon--tertiary--color--hover': '--now-color_text--tertiary',
            '--now-button-iconic_icon--tertiary--color--active': '--now-color_text--tertiary',
            '--now-button-iconic--tertiary--background-color': '--now-color_background--primary',
            '--now-button-iconic--tertiary--background-color--hover': '--now-color_background--secondary',
            '--now-button-iconic--tertiary--background-color--active': '--now-color_background--secondary',
            '--now-button-iconic--tertiary--border-color': '--now-color_border--secondary',
            '--now-button-iconic--tertiary--border-color--hover': '--now-color_border--secondary',
            '--now-button-iconic--tertiary--border-color--active': '--now-color_border--secondary',
            '--now-button--tertiary--background-color': '--now-color_background--primary',
            '--now-button--tertiary--background-color--active': '--now-color_background--secondary',
            '--now-button--tertiary--background-color--hover': '--now-color_background--secondary',
            '--now-button--tertiary--border-color': '--now-color_border--secondary',
            '--now-button--tertiary--border-color--active': '--now-color_border--secondary',
            '--now-button--tertiary--border-color--hover': '--now-color_border--secondary',
            '--now-button--tertiary--color': '--now-color_text--tertiary',
            '--now-button--tertiary--color--active': '--now-color_text--tertiary',
            '--now-button--tertiary--color--hover': '--now-color_text--tertiary',
            '--now-button_icon--tertiary--color': '--now-color_text--tertiary',
            '--now-button_icon--tertiary--color--active': '--now-color_text--tertiary',
            '--now-button_icon--tertiary--color--hover': '--now-color_text--tertiary',
            '--now-button--tertiary_highlighted--background-color--selected': '--now-color_border--secondary',
            '--now-button--tertiary_highlighted--background-color--selected_hover': '--now-button--tertiary_highlighted--background-color--selected',
            '--now-button--tertiary_highlighted--background-color--selected_active': '--now-button--tertiary_highlighted--background-color--selected',
            '--now-button--tertiary-selection--color': '--now-color_text--primary',
            '--now-button--tertiary-selection--color--active': '--now-color_selection--primary-4',
            '--now-button--tertiary-selection--color--hover': '--now-color_selection--primary-3',
            '--now-button--tertiary-selection--color--selected': '--now-color_selection--primary-2',
            '--now-button--tertiary-selection--color--selected_active': '--now-button--tertiary-selection--color--active',
            '--now-button--tertiary-selection--color--selected_hover': '--now-button--tertiary-selection--color--hover',
            '--now-button--tertiary-selection--background-color--active': '--now-color_border--secondary',
            '--now-button--tertiary-selection--background-color--hover': '--now-color_border--secondary',
            '--now-button--tertiary-selection_high-contrast--color': '--now-color_background--secondary-actionable',
            '--now-button--tertiary-selection_high-contrast--color--active': '--now-color_text--primary',
            '--now-button--tertiary-selection_high-contrast--color--hover': '--now-color_selection--primary-4',
            '--now-button--tertiary-selection_high-contrast--color--selected': '--now-color_selection--primary-3',
            '--now-button--tertiary-selection_high-contrast--color--selected_active': '--now-button--tertiary-selection_high-contrast--color--active',
            '--now-button--tertiary-selection_high-contrast--color--selected_hover': '--now-button--tertiary-selection_high-contrast--color--hover',
            '--now-button--tertiary-selection_highlighted--background-color--selected': '--now-color_selection--primary-2',
            '--now-button--tertiary-selection_highlighted--background-color--selected_active': '--now-button--tertiary-selection_highlighted--background-color--selected',
            '--now-button--tertiary-selection_highlighted--background-color--selected_hover': '--now-button--tertiary-selection_highlighted--background-color--selected',
            '--now-canvas-toolbar-button--background-color--hover': '--now-color_secondary-nav--brand-4',
            '--now-canvas-toolbar-button--background-color--active': '--now-color_secondary-nav--brand-4',
            '--now-canvas-toolbar-button--border-color--active': '--now-color_secondary-nav--divider-7',
            '--now-canvas-toolbar-button--color': '--now-color_text--primary-actionable',
            '--now-canvas-toolbar-button--color--focus': '--now-canvas-toolbar-button--color',
            '--now-canvas-toolbar-button--opacity--hover': '0.6',
            '--now-card-divider--color': '--now-color_divider--tertiary',
            '--now-card-footer--color': '--now-color_text--secondary',
            '--now-card-header_caption--color': '--now-color_text--tertiary',
            '--now-card-header_heading--primary--color': '--now-color_text--primary',
            '--now-card-header_heading--secondary--color': '--now-color_text--secondary',
            '--now-card-header_heading--tertiary--color': '--now-color_text--tertiary',
            '--now-card-header_tagline--secondary--color': '--now-color_text--secondary',
            '--now-card-header_tagline--tertiary--color': '--now-color_text--tertiary',
            '--now-card_sidebar--primary_critical--background-color': '--now-color_alert--critical-2',
            '--now-card_sidebar--primary_high--background-color': '--now-color_alert--high-4',
            '--now-card_sidebar--primary_info--background-color': '--now-color_alert--info-2',
            '--now-card_sidebar--primary_low--background-color': '--now-color_alert--low-2',
            '--now-card_sidebar--primary_moderate--background-color': '--now-color_alert--moderate-2',
            '--now-card_sidebar--primary_positive--background-color': '--now-color_alert--positive-2',
            '--now-card_sidebar--primary_warning--background-color': '--now-color_alert--warning-4',
            '--now-card_sidebar--secondary_critical--background-color': '--now-color_alert--critical-1',
            '--now-card_sidebar--secondary_high--background-color': '--now-color_alert--high-1',
            '--now-card_sidebar--secondary_info--background-color': '--now-color_alert--info-1',
            '--now-card_sidebar--secondary_low--background-color': '--now-color_alert--low-1',
            '--now-card_sidebar--secondary_moderate--background-color': '--now-color_alert--moderate-1',
            '--now-card_sidebar--secondary_positive--background-color': '--now-color_alert--positive-1',
            '--now-card_sidebar--secondary_warning--background-color': '--now-color_alert--warning-1',
            '--now-card_sidebar--tertiary_critical--background-color': '--now-color_alert--critical-0',
            '--now-card_sidebar--tertiary_high--background-color': '--now-color_alert--high-0',
            '--now-card_sidebar--tertiary_info--background-color': '--now-color_alert--info-0',
            '--now-card_sidebar--tertiary_low--background-color': '--now-color_alert--low-0',
            '--now-card_sidebar--tertiary_moderate--background-color': '--now-color_alert--moderate-0',
            '--now-card_sidebar--tertiary_positive--background-color': '--now-color_alert--positive-0',
            '--now-card_sidebar--tertiary_warning--background-color': '--now-color_alert--warning-0',
            '--now-card--background-color': '--now-color_background--primary',
            '--now-card--background-color--active': '--now-card--background-color',
            '--now-card--background-color--hover': '--now-card--background-color',
            '--now-card--background-color--selected': '--now-card--background-color',
            '--now-card--border-color': '--now-color_border--tertiary',
            '--now-card--border-color--active': '--now-color--primary-3',
            '--now-card--border-color--hover': '--now-color_border--secondary',
            '--now-card--border-color--selected': '--now-color--primary-1',
            '--now-checkbox_focus-ring--border-color--focus': '--now-checkbox--background-color',
            '--now-checkbox_focus-ring--border-color--invalid_focus': '--now-checkbox--background-color',
            '--now-checkbox_icon--color': '--now-color_text--secondary',
            '--now-checkbox_icon--color--hover': '--now-color--secondary-1',
            '--now-checkbox_icon--color--invalid': '--now-color_alert--critical-5',
            '--now-checkbox_icon--color--readonly': '--now-color_text--secondary',
            '--now-checkbox_label--color': '--now-color_text--primary',
            '--now-checkbox_required-indicator--color': '--now-color_text--tertiary',
            '--now-checkbox_required-indicator--color--invalid': '--now-color_alert--critical-2',
            '--now-checkbox--background-color': '--now-color_background--primary',
            '--now-checkbox--background-color--active': '--now-color--secondary-0',
            '--now-checkbox--background-color--checked': '--now-checkbox--background-color',
            '--now-checkbox--background-color--checked_active': '--now-checkbox--background-color',
            '--now-checkbox--background-color--checked_hover': '--now-color--secondary-0',
            '--now-checkbox--background-color--checked_invalid': '--now-checkbox--background-color',
            '--now-checkbox--background-color--checked_invalid_active': '--now-checkbox--background-color',
            '--now-checkbox--background-color--checked_invalid_focus': '--now-checkbox--background-color',
            '--now-checkbox--background-color--checked_invalid_hover': '--now-checkbox--background-color--invalid',
            '--now-checkbox--background-color--checked_readonly': '--now-checkbox--background-color--readonly',
            '--now-checkbox--background-color--hover': '--now-color--secondary-0',
            '--now-checkbox--background-color--invalid': '--now-color_alert--critical-0',
            '--now-checkbox--background-color--invalid_active': '--now-checkbox--background-color--invalid',
            '--now-checkbox--background-color--invalid_focus': '--now-checkbox--background-color--invalid',
            '--now-checkbox--background-color--invalid_hover': '--now-checkbox--background-color--invalid',
            '--now-checkbox--background-color--readonly': '--now-color_text--secondary',
            '--now-checkbox--border-color': '--now-color_border--primary',
            '--now-checkbox--border-color--checked': '--now-color_border--primary',
            '--now-checkbox--border-color--checked_active': '--now-color--secondary-1',
            '--now-checkbox--border-color--checked_focus': '--now-color--secondary-1',
            '--now-checkbox--border-color--checked_hover': '--now-checkbox--border-color--hover',
            '--now-checkbox--border-color--checked_invalid': '--now-checkbox--border-color--invalid',
            '--now-checkbox--border-color--checked_invalid_active': '--now-checkbox--border-color--invalid',
            '--now-checkbox--border-color--checked_invalid_focus': '--now-checkbox--border-color--invalid',
            '--now-checkbox--border-color--checked_invalid_hover': '--now-checkbox--border-color--invalid',
            '--now-checkbox--border-color--checked_readonly': '--now-color_border--secondary',
            '--now-checkbox--border-color--focus': '--now-color--secondary-1',
            '--now-checkbox--border-color--hover': '--now-color--secondary-1',
            '--now-checkbox--border-color--invalid': '--now-color_alert--critical-2',
            '--now-checkbox--border-color--invalid_active': '--now-checkbox--border-color--invalid',
            '--now-checkbox--border-color--invalid_hover': '--now-checkbox--border-color--invalid',
            '--now-checkbox--border-color--readonly': '--now-checkbox--border-color',
            '--now-container--border-color': '--now-color_border--tertiary',
            '--now-container--color': '--now-color_background--primary',
            '--now-content-tree_divider--color': '--now-color_divider--tertiary',
            '--now-content-tree_dragdrop--background-color': '--now-color_background--primary',
            '--now-content-tree_dragdrop--color': '--now-color_alert--info-2',
            '--now-content-tree_drop-target-parent--border-color': '--now-color_alert--info-2',
            '--now-content-tree_icon--color--error': '--now-color_alert--critical-2',
            '--now-content-tree_icon-identifier--actionable--color': '--now-color--secondary-1',
            '--now-content-tree_icon-identifier--color': '--now-color_border--primary-actionable',
            '--now-content-tree_label--color--error': '--now-color_text--tertiary',
            '--now-content-tree_label--color--loading': '--now-color--primary-1',
            '--now-content-tree_placeholder--color': '--now-color_text--tertiary',
            '--now-content-tree_placeholder--color--active': '--now-color--secondary-3',
            '--now-content-tree_placeholder--color--hover': '--now-color--secondary-1',
            '--now-content-tree_sidebar--background-color--selected': '--now-color--primary-1',
            '--now-content-tree_trigger--background-color--active': '--now-color--secondary-2',
            '--now-content-tree_trigger--background-color--hover': '--now-color--secondary-2',
            '--now-content-tree_trigger--color': '--now-color_text--tertiary',
            '--now-content-tree_trigger--color--active': '--now-content-tree_trigger--color',
            '--now-content-tree_trigger--color--hover': '--now-color--secondary-1',
            '--now-content-tree--background-color': '--now-color_background--primary',
            '--now-content-tree--background-color--hover': '--now-color--primary-0',
            '--now-content-tree--background-color--selected': '--now-color--primary-0',
            '--now-content-tree--background-color--selected-child': '--now-color_border--primary-actionable',
            '--now-content-tree--color': '--now-color_text--secondary',
            '--now-datavis_color_chart_fill': '--now-color_alert--info-1',
            '--now-datavis_color_chart--primary': '--now-color_text--secondary-actionable',
            '--now-datavis_color_chart--secondary': '--now-color_selection--secondary-3',
            '--now-datavis_color_chart--tertiary': '--now-color_chrome--divider-3',
            '--now-datavis_color_label--primary': '--now-color_text--primary',
            '--now-datavis_color_label--secondary': '--now-color_text--secondary',
            '--now-datavis_color_label--tertiary': '--now-color_text--tertiary',
            '--now-datavis_color_layer_band--primary': '--now-color_alert--high-1',
            '--now-datavis_color_layer_band--secondary': '--now-color_alert--high-2',
            '--now-datavis_color_layer--primary': '--now-color_border--primary',
            '--now-datavis_color_layer--secondary': '--now-color_text--tertiary',
            '--now-datavis_color_layer--tertiary': '--now-color_text--secondary',
            '--now-datavis_color_layer--quad': '--now-color_text--primary',
            '--now-datavis_color_series_default': '--now-datavis_color--qualitative-0',
            '--now-datavis_color--accessibility-0': '--now-color_background--primary',
            '--now-datavis_color--accessibility-2': '--now-color_border--tertiary',
            '--now-datavis_color--accessibility-10': '--now-color_text--primary',
            '--now-datavis_color--blue-0': '210,229,244',
            '--now-datavis_color--blue-1': '182,212,237',
            '--now-datavis_color--blue-2': '158,197,230',
            '--now-datavis_color--blue-3': '129,181,223',
            '--now-datavis_color--blue-4': '105,166,216',
            '--now-datavis_color--blue-5': '77,149,209',
            '--now-datavis_color--blue-6': '66,131,184',
            '--now-datavis_color--blue-7': '58,115,161',
            '--now-datavis_color--blue-8': '50,95,134',
            '--now-datavis_color--blue-9': '40,77,108',
            '--now-datavis_color--blue-10': '30,59,82',
            '--now-datavis_color--brown-0': '236,219,213',
            '--now-datavis_color--brown-1': '223,195,185',
            '--now-datavis_color--brown-2': '212,174,161',
            '--now-datavis_color--brown-3': '198,151,134',
            '--now-datavis_color--brown-4': '186,130,109',
            '--now-datavis_color--brown-5': '176,108,84',
            '--now-datavis_color--brown-6': '156,95,73',
            '--now-datavis_color--brown-7': '132,81,62',
            '--now-datavis_color--brown-8': '111,68,52',
            '--now-datavis_color--brown-9': '90,55,42',
            '--now-datavis_color--brown-10': '69,42,33',
            '--now-datavis_color--green-0': '208,231,211',
            '--now-datavis_color--green-1': '181,217,184',
            '--now-datavis_color--green-2': '154,203,159',
            '--now-datavis_color--green-3': '127,189,133',
            '--now-datavis_color--green-4': '100,175,108',
            '--now-datavis_color--green-5': '73,162,82',
            '--now-datavis_color--green-6': '62,142,70',
            '--now-datavis_color--green-7': '55,123,62',
            '--now-datavis_color--green-8': '46,102,51',
            '--now-datavis_color--green-9': '37,85,42',
            '--now-datavis_color--green-10': '28,63,31',
            '--now-datavis_color--olive-0': '226,231,208',
            '--now-datavis_color--olive-1': '210,217,181',
            '--now-datavis_color--olive-2': '193,203,154',
            '--now-datavis_color--olive-3': '176,189,127',
            '--now-datavis_color--olive-4': '159,175,100',
            '--now-datavis_color--olive-5': '143,162,73',
            '--now-datavis_color--olive-6': '125,142,62',
            '--now-datavis_color--olive-7': '108,123,55',
            '--now-datavis_color--olive-8': '90,102,46',
            '--now-datavis_color--olive-9': '75,85,37',
            '--now-datavis_color--olive-10': '56,63,28',
            '--now-datavis_color--orange-0': '250,226,209',
            '--now-datavis_color--orange-1': '247,209,182',
            '--now-datavis_color--orange-2': '244,190,153',
            '--now-datavis_color--orange-3': '241,172,126',
            '--now-datavis_color--orange-4': '238,154,99',
            '--now-datavis_color--orange-5': '235,137,71',
            '--now-datavis_color--orange-6': '207,123,63',
            '--now-datavis_color--orange-7': '177,104,53',
            '--now-datavis_color--orange-8': '149,88,45',
            '--now-datavis_color--orange-9': '122,71,36',
            '--now-datavis_color--orange-10': '94,56,28',
            '--now-datavis_color--pink-0': '246,213,246',
            '--now-datavis_color--pink-1': '240,188,240',
            '--now-datavis_color--pink-2': '235,162,235',
            '--now-datavis_color--pink-3': '228,134,228',
            '--now-datavis_color--pink-4': '224,108,224',
            '--now-datavis_color--pink-5': '217,84,217',
            '--now-datavis_color--pink-6': '191,74,191',
            '--now-datavis_color--pink-7': '165,64,165',
            '--now-datavis_color--pink-8': '140,54,140',
            '--now-datavis_color--pink-9': '114,44,114',
            '--now-datavis_color--pink-10': '88,34,88',
            '--now-datavis_color--negative': '--now-color_alert--critical-3',
            '--now-datavis_color--positive': '--now-color_alert--positive-3',
            '--now-datavis_color--primary': '--now-color_text--primary',
            '--now-datavis_color--purple-0': '216,216,238',
            '--now-datavis_color--purple-1': '190,190,228',
            '--now-datavis_color--purple-2': '166,165,217',
            '--now-datavis_color--purple-3': '145,144,208',
            '--now-datavis_color--purple-4': '120,118,198',
            '--now-datavis_color--purple-5': '95,93,187',
            '--now-datavis_color--purple-6': '85,84,166',
            '--now-datavis_color--purple-7': '73,72,142',
            '--now-datavis_color--purple-8': '60,60,119',
            '--now-datavis_color--purple-9': '50,50,98',
            '--now-datavis_color--purple-10': '38,38,75',
            '--now-datavis_color--red-0': '246,213,214',
            '--now-datavis_color--red-1': '240,188,188',
            '--now-datavis_color--red-2': '235,162,164',
            '--now-datavis_color--red-3': '228,134,135',
            '--now-datavis_color--red-4': '224,108,110',
            '--now-datavis_color--red-5': '217,84,84',
            '--now-datavis_color--red-6': '191,74,76',
            '--now-datavis_color--red-7': '165,64,66',
            '--now-datavis_color--red-8': '140,54,54',
            '--now-datavis_color--red-9': '114,44,44',
            '--now-datavis_color--red-10': '88,34,34',
            '--now-datavis_color--teal-0': '210,244,236',
            '--now-datavis_color--teal-1': '182,237,225',
            '--now-datavis_color--teal-2': '158,230,214',
            '--now-datavis_color--teal-3': '129,223,202',
            '--now-datavis_color--teal-4': '105,216,192',
            '--now-datavis_color--teal-5': '77,209,180',
            '--now-datavis_color--teal-6': '66,184,158',
            '--now-datavis_color--teal-7': '58,161,139',
            '--now-datavis_color--teal-8': '50,134,116',
            '--now-datavis_color--teal-9': '40,108,93',
            '--now-datavis_color--teal-10': '30,82,71',
            '--now-datavis_color--violet-0': '232,216,238',
            '--now-datavis_color--violet-1': '218,190,228',
            '--now-datavis_color--violet-2': '203,165,217',
            '--now-datavis_color--violet-3': '191,144,208',
            '--now-datavis_color--violet-4': '177,118,198',
            '--now-datavis_color--violet-5': '162,93,187',
            '--now-datavis_color--violet-6': '144,84,166',
            '--now-datavis_color--violet-7': '124,72,142',
            '--now-datavis_color--violet-8': '103,60,119',
            '--now-datavis_color--violet-9': '85,50,98',
            '--now-datavis_color--violet-10': '65,38,75',
            '--now-datavis_color--yellow-0': '255,238,204',
            '--now-datavis_color--yellow-1': '255,225,163',
            '--now-datavis_color--yellow-2': '255,212,122',
            '--now-datavis_color--yellow-3': '255,199,82',
            '--now-datavis_color--yellow-4': '255,185,41',
            '--now-datavis_color--yellow-5': '255,172,0',
            '--now-datavis_color--yellow-6': '224,151,0',
            '--now-datavis_color--yellow-7': '194,131,0',
            '--now-datavis_color--yellow-8': '163,110,0',
            '--now-datavis_color--yellow-9': '133,89,0',
            '--now-datavis_color--yellow-10': '102,69,0',
            '--now-datavis_color--yellow-green-0': '238,245,204',
            '--now-datavis_color--yellow-green-1': '227,238,170',
            '--now-datavis_color--yellow-green-2': '214,231,136',
            '--now-datavis_color--yellow-green-3': '206,226,105',
            '--now-datavis_color--yellow-green-4': '194,219,72',
            '--now-datavis_color--yellow-green-5': '185,214,41',
            '--now-datavis_color--yellow-green-6': '163,188,36',
            '--now-datavis_color--yellow-green-7': '139,163,31',
            '--now-datavis_color--yellow-green-8': '119,137,26',
            '--now-datavis_color--yellow-green-9': '95,111,21',
            '--now-datavis_color--yellow-green-10': '74,86,16',
            '--now-datavis_color--qualitative-0': '--now-datavis_color--blue-5',
            '--now-datavis_color--qualitative-1': '--now-datavis_color--orange-3',
            '--now-datavis_color--qualitative-2': '--now-datavis_color--green-5',
            '--now-datavis_color--qualitative-3': '--now-datavis_color--pink-3',
            '--now-datavis_color--qualitative-4': '--now-datavis_color--brown-5',
            '--now-datavis_color--qualitative-5': '--now-datavis_color--violet-3',
            '--now-datavis_color--qualitative-6': '--now-datavis_color--yellow-green-5',
            '--now-datavis_color--qualitative-7': '--now-datavis_color--red-3',
            '--now-datavis_color--qualitative-8': '--now-datavis_color--purple-5',
            '--now-datavis_color--qualitative-9': '--now-datavis_color--olive-3',
            '--now-datavis_color--qualitative-10': '--now-datavis_color--teal-5',
            '--now-datavis_color--qualitative-11': '--now-datavis_color--blue-4',
            '--now-datavis_color--qualitative-12': '--now-datavis_color--orange-2',
            '--now-datavis_color--qualitative-13': '--now-datavis_color--green-4',
            '--now-datavis_color--qualitative-14': '--now-datavis_color--pink-2',
            '--now-datavis_color--qualitative-15': '--now-datavis_color--brown-4',
            '--now-datavis_color--qualitative-16': '--now-datavis_color--violet-2',
            '--now-datavis_color--qualitative-17': '--now-datavis_color--yellow-green-4',
            '--now-datavis_color--qualitative-18': '--now-datavis_color--red-2',
            '--now-datavis_color--qualitative-19': '--now-datavis_color--purple-4',
            '--now-datavis_color--qualitative-20': '--now-datavis_color--olive-2',
            '--now-datavis_color--qualitative-21': '--now-datavis_color--teal-4',
            '--now-datavis_color--qualitative-22': '--now-datavis_color--blue-8',
            '--now-datavis_color--qualitative-23': '--now-datavis_color--orange-6',
            '--now-datavis_color--qualitative-24': '--now-datavis_color--green-8',
            '--now-datavis_color--qualitative-25': '--now-datavis_color--pink-6',
            '--now-datavis_color--qualitative-26': '--now-datavis_color--brown-8',
            '--now-datavis_color--qualitative-27': '--now-datavis_color--violet-6',
            '--now-datavis_color--qualitative-28': '--now-datavis_color--yellow-green-8',
            '--now-datavis_color--qualitative-29': '--now-datavis_color--red-6',
            '--now-datavis_color--qualitative-30': '--now-datavis_color--purple-8',
            '--now-datavis_color--qualitative-31': '--now-datavis_color--olive-6',
            '--now-datavis_color--qualitative-32': '--now-datavis_color--teal-8',
            '--now-datavis_series_target-global--color': '--now-color_border--primary',
            '--now-datavis_series_target-personal--color': '--now-color_chrome--divider-3',
            '--now-datavis_series_threshold-global--color': '--now-color_border--primary',
            '--now-datavis_series_threshold-personal--color': '--now-color_chrome--divider-3',
            '--now-display-type_label--color': '--now-color_text--secondary',
            '--now-display-type_value--color': '--now-display-type--color',
            '--now-display-type--color': '--now-color_text--primary',
            '--now-display-type--primary--color': '--now-color_text--primary',
            '--now-display-type--secondary--color': '--now-color_text--secondary',
            '--now-display-type--tertiary--color': '--now-color_text--tertiary',
            '--now-dragdrop_badge--background-color': '--now-color_alert--info-2',
            '--now-dragdrop_badge--border-color': '--now-color_text--primary',
            '--now-dragdrop_badge--color': '--now-color_text--primary',
            '--now-dragdrop_ghost--background-color': '--now-color_text--primary',
            '--now-dropdown-list_checkmark--color': '--now-color--primary-2',
            '--now-dropdown-list_divider--color': '--now-menu_divider--color',
            '--now-dropdown-list_heading--background-color': '--now-color_background--secondary',
            '--now-dropdown-list_heading--color': '--now-color_text--tertiary',
            '--now-dropdown-list_search--background-color': '--now-menu--background-color',
            '--now-dropdown-list_search--background-color--hover': '--now-color_background--secondary',
            '--now-dropdown-list_search--border-color': '--now-menu--border-color',
            '--now-dropdown-list_search--color': '--now-color_text--primary',
            '--now-dropdown-list_search--color--placeholder': '--now-color_text--tertiary',
            '--now-dropdown-list_sublabel--color': '--now-color_text--tertiary',
            '--now-dropdown-list--background-color': '--now-menu--background-color',
            '--now-dropdown-list--background-color--focus': '--now-color--secondary-0',
            '--now-dropdown-list--background-color--highlighted': '--now-color_alert--warning-0',
            '--now-dropdown-list--border-color': '--now-menu--border-color',
            '--now-dropdown-list--color': '--now-color_text--secondary',
            '--now-dropdown-list--color--disabled': '--now-color_text--primary',
            '--now-dropdown-list--color--focus': '--now-color_text--primary',
            '--now-dropdown-list--color--highlighted': '--now-dropdown-list--color',
            '--now-dropdown--primary-selection--background-color': '--now-color_selection--primary-2',
            '--now-dropdown--primary-selection--background-color--active': '--now-color_selection--primary-4',
            '--now-dropdown--primary-selection--background-color--hover': '--now-color_selection--primary-3',
            '--now-dropdown--primary-selection--border-color': '--now-color_selection--primary-4',
            '--now-dropdown--primary-selection--border-color--active': '--now-dropdown--primary-selection--border-color',
            '--now-dropdown--primary-selection--border-color--hover': '--now-dropdown--primary-selection--border-color',
            '--now-dropdown--primary-selection--color': '--now-button--primary--color',
            '--now-dropdown--primary-selection--color--active': '--now-dropdown--primary-selection--color',
            '--now-dropdown--primary-selection--color--hover': '--now-dropdown--primary-selection--color',
            '--now-dropdown--secondary-selection--background-color': '--now-button--secondary--background-color',
            '--now-dropdown--secondary-selection--background-color--active': '--now-button--secondary--background-color--active',
            '--now-dropdown--secondary-selection--background-color--hover': '--now-button--secondary--background-color--hover',
            '--now-dropdown--secondary-selection--border-color': '--now-button--secondary--border-color',
            '--now-dropdown--secondary-selection--border-color--active': '--now-button--secondary--border-color--active',
            '--now-dropdown--secondary-selection--border-color--hover': '--now-button--secondary--border-color--hover',
            '--now-dropdown--secondary-selection--color': '--now-color--primary-3',
            '--now-dropdown--secondary-selection--color--active': '--now-color_selection--primary-4',
            '--now-dropdown--secondary-selection--color--hover': '--now-color_selection--primary-4',
            '--now-dropdown--secondary--background-color': '--now-color_surface--neutral-6',
            '--now-dropdown--secondary--background-color--hover': '--now-color_surface--divider-5',
            '--now-dropdown--secondary--background-color--active': '--now-color_surface--divider-6',
            '--now-dropdown_icon--secondary--color': '--now-color_text--primary',
            '--now-dropdown_icon--secondary--color--hover': '--now-color_text--primary',
            '--now-dropdown_icon--secondary--color--active': '--now-color_text--primary',
            '--now-dropdown--secondary--color': '--now-color_text--primary',
            '--now-dropdown--secondary--color--hover': '--now-color_text--primary',
            '--now-dropdown--secondary--color--active': '--now-color_text--primary',
            '--now-dropdown--tertiary--background-color': '--now-color_background--primary',
            '--now-dropdown--tertiary--background-color--hover': '--now-color_background--secondary',
            '--now-dropdown--tertiary--background-color--active': '--now-color_background--secondary',
            '--now-dropdown--tertiary--border-color': '--now-color_border--secondary',
            '--now-dropdown--tertiary--border-color--active': '--now-color_border--secondary',
            '--now-dropdown--tertiary--border-color--hover': '--now-color_border--secondary',
            '--now-dropdown_icon--tertiary--color': '--now-color_text--tertiary',
            '--now-dropdown_icon--tertiary--color--hover': '--now-color_text--tertiary',
            '--now-dropdown_icon--tertiary--color--active': '--now-color_text--tertiary',
            '--now-dropdown--tertiary--color': '--now-color_text--tertiary',
            '--now-dropdown--tertiary--color--hover': '--now-color_text--tertiary',
            '--now-dropdown--tertiary--color--active': '--now-color_text--tertiary',
            '--now-dropdown--tertiary-selection--background-color': '--now-button--tertiary--background-color',
            '--now-dropdown--tertiary-selection--background-color--active': '--now-button--tertiary--background-color--active',
            '--now-dropdown--tertiary-selection--background-color--hover': '--now-button--tertiary--background-color--hover',
            '--now-dropdown--tertiary-selection--border-color': '--now-button--tertiary--border-color',
            '--now-dropdown--tertiary-selection--border-color--active': '--now-button--tertiary--border-color--active',
            '--now-dropdown--tertiary-selection--border-color--hover': '--now-button--tertiary--border-color--hover',
            '--now-dropdown--tertiary-selection--color': '--now-color_selection--primary-3',
            '--now-dropdown--tertiary-selection--color--active': '--now-color_selection--primary-4',
            '--now-dropdown--tertiary-selection--color--hover': '--now-color_selection--primary-4',
            '--now-form-field_character-counter--color--error': '--now-color_alert--critical-2',
            '--now-form-field_character-counter--color--warning': '--now-color_alert--high-3',
            '--now-form-field_label--color': '--now-color_text--secondary',
            '--now-form-field_label--color--invalid': '214,109,104',
            '--now-form-field_label--color--valid': '--now-color_alert--positive-2',
            '--now-form-field_message--critical--background-color': '--now-color_alert--critical-0',
            '--now-form-field_message--critical--color': '--now-color_text--primary',
            '--now-form-field_message--info--background-color': '--now-color_alert--info-0',
            '--now-form-field_message--info--color': '--now-color_text--primary',
            '--now-form-field_message--positive--background-color': '--now-color_alert--positive-0',
            '--now-form-field_message--positive--color': '--now-color_text--primary',
            '--now-form-field_message--suggestion--background-color': '--now-color_background--primary',
            '--now-form-field_message--suggestion--color': '--now-color_text--tertiary',
            '--now-form-field_message--warning--background-color': '--now-color_alert--warning-0',
            '--now-form-field_message--warning--color': '--now-color_text--primary',
            '--now-form-field_placeholder--color': '--now-color_text--tertiary',
            '--now-form-field_placeholder--color--hover': '--now-color_text--secondary',
            '--now-form-field--background-color': '--now-color_background--primary',
            '--now-form-field--background-color--focus': '--now-form-field--background-color',
            '--now-form-field--background-color--hover': '--now-color_background--tertiary',
            '--now-form-field--background-color--invalid': '--now-form-field--background-color',
            '--now-form-field--background-color--invalid_focus': '--now-form-field--background-color--invalid',
            '--now-form-field--background-color--invalid_hover': '--now-color_alert--critical-0',
            '--now-form-field--background-color--opened': '--now-color--secondary-0',
            '--now-form-field--background-color--readonly': '104,104,104',
            '--now-form-field--border-color': '--now-color_border--primary',
            '--now-form-field--border-color--focus': '--now-color--secondary-1',
            '--now-form-field--border-color--hover': '--now-form-field--border-color',
            '--now-form-field--border-color--invalid': '--now-color_alert--critical-2',
            '--now-form-field--border-color--invalid_focus': '--now-form-field--border-color--invalid',
            '--now-form-field--border-color--invalid_hover': '--now-form-field--border-color--invalid',
            '--now-form-field--border-color--opened': '--now-color--secondary-1',
            '--now-form-field--border-color--readonly': '--now-form-field--border-color',
            '--now-form-field_inset--color': '--now-color_text--secondary',
            '--now-form-field_inset--color--hover': '--now-color--primary-3',
            '--now-form-field_inset--color--invalid_hover': '--now-color_alert--critical-5',
            '--now-form-field--color': '--now-color_text--primary',
            '--now-form-field--color--invalid': '--now-form-field--color',
            '--now-form-field--color--readonly': '--now-form-field--color',
            '--now-heading--header-primary--color': '--now-color_text--primary',
            '--now-heading--header-secondary--color': '--now-color_text--secondary',
            '--now-heading--header-tertiary--color': '--now-color_text--tertiary',
            '--now-heading--title-primary--color': '--now-color_text--primary',
            '--now-heading--title-secondary--color': '--now-color_text--secondary',
            '--now-heading--title-tertiary--color': '--now-color_text--tertiary',
            '--now-highlighted-value--primary--color': '--now-color_text--primary',
            '--now-highlighted-value--secondary--color': '--now-color_text--primary',
            '--now-highlighted-value--tertiary--color': '--now-color_text--secondary',
            '--now-highlighted-value--primary_critical--background-color': '--now-color_alert--critical-2',
            '--now-highlighted-value--primary_high--background-color': '--now-color_alert--high-2',
            '--now-highlighted-value--primary_info--background-color': '--now-color_alert--info-2',
            '--now-highlighted-value--primary_low--background-color': '--now-color_alert--low-2',
            '--now-highlighted-value--primary_moderate--background-color': '--now-color_alert--moderate-2',
            '--now-highlighted-value--primary_positive--background-color': '--now-color_alert--positive-2',
            '--now-highlighted-value--primary_warning--background-color': '--now-color_alert--warning-2',
            '--now-highlighted-value--primary_magenta--background-color': '--now-color_grouped--magenta-2',
            '--now-highlighted-value--primary_pink--background-color': '--now-color_grouped--pink-2',
            '--now-highlighted-value--primary_orange--background-color': '--now-color_grouped--orange-2',
            '--now-highlighted-value--primary_yellow--background-color': '--now-color_grouped--yellow-2',
            '--now-highlighted-value--primary_brown--background-color': '--now-color_grouped--brown-2',
            '--now-highlighted-value--primary_green--background-color': '--now-color_grouped--green-2',
            '--now-highlighted-value--primary_green-yellow--background-color': '--now-color_grouped--green-yellow-2',
            '--now-highlighted-value--primary_blue--background-color': '--now-color_grouped--blue-2',
            '--now-highlighted-value--primary_gray--background-color': '--now-color_grouped--gray-2',
            '--now-highlighted-value--primary_teal--background-color': '--now-color_grouped--teal-2',
            '--now-highlighted-value--primary_purple--background-color': '--now-color_grouped--purple-2',
            '--now-highlighted-value--primary_critical--color': '--now-highlighted-value--primary--color',
            '--now-highlighted-value--primary_high--color': '--now-highlighted-value--primary--color',
            '--now-highlighted-value--primary_info--color': '--now-highlighted-value--primary--color',
            '--now-highlighted-value--primary_low--color': '--now-highlighted-value--primary--color',
            '--now-highlighted-value--primary_moderate--color': '--now-highlighted-value--primary--color',
            '--now-highlighted-value--primary_positive--color': '--now-highlighted-value--primary--color',
            '--now-highlighted-value--primary_warning--color': '--now-highlighted-value--primary--color',
            '--now-highlighted-value--primary_magenta--color': '--now-highlighted-value--primary--color',
            '--now-highlighted-value--primary_pink--color': '--now-highlighted-value--primary--color',
            '--now-highlighted-value--primary_orange--color': '--now-highlighted-value--primary--color',
            '--now-highlighted-value--primary_yellow--color': '--now-highlighted-value--primary--color',
            '--now-highlighted-value--primary_brown--color': '--now-highlighted-value--primary--color',
            '--now-highlighted-value--primary_green--color': '--now-highlighted-value--primary--color',
            '--now-highlighted-value--primary_green-yellow--color': '--now-highlighted-value--primary--color',
            '--now-highlighted-value--primary_blue--color': '--now-highlighted-value--primary--color',
            '--now-highlighted-value--primary_gray--color': '--now-highlighted-value--primary--color',
            '--now-highlighted-value--primary_teal--color': '--now-highlighted-value--primary--color',
            '--now-highlighted-value--primary_purple--color': '--now-highlighted-value--primary--color',
            '--now-highlighted-value--primary_critical--border-color': '--now-color_alert--critical-3',
            '--now-highlighted-value--primary_high--border-color': '--now-color_alert--high-5',
            '--now-highlighted-value--primary_warning--border-color': '--now-color_alert--warning-5',
            '--now-highlighted-value--primary_moderate--border-color': '--now-color_alert--moderate-3',
            '--now-highlighted-value--primary_positive--border-color': '--now-color_alert--positive-3',
            '--now-highlighted-value--primary_info--border-color': '--now-color_alert--info-3',
            '--now-highlighted-value--primary_low--border-color': '--now-color_alert--low-3',
            '--now-highlighted-value--primary_yellow--border-color': '--now-color_grouped--yellow-5',
            '--now-highlighted-value--primary_orange--border-color': '--now-color_grouped--orange-5',
            '--now-highlighted-value--primary_magenta--border-color': '--now-color_grouped--magenta-5',
            '--now-highlighted-value--primary_pink--border-color': '--now-color_grouped--pink-5',
            '--now-highlighted-value--primary_brown--border-color': '--now-color_grouped--brown-5',
            '--now-highlighted-value--primary_green--border-color': '--now-color_grouped--green-5',
            '--now-highlighted-value--primary_green-yellow--border-color': '--now-color_grouped--green-yellow-5',
            '--now-highlighted-value--primary_blue--border-color': '--now-color_grouped--blue-5',
            '--now-highlighted-value--primary_gray--border-color': '--now-color_grouped--gray-5',
            '--now-highlighted-value--primary_teal--border-color': '--now-color_grouped--teal-5',
            '--now-highlighted-value--primary_purple--border-color': '--now-color_grouped--purple-5',
            '--now-highlighted-value--secondary_critical--background-color': '--now-color_alert--critical-1',
            '--now-highlighted-value--secondary_high--background-color': '--now-color_alert--high-1',
            '--now-highlighted-value--secondary_info--background-color': '--now-color_alert--info-1',
            '--now-highlighted-value--secondary_low--background-color': '--now-color_alert--low-1',
            '--now-highlighted-value--secondary_moderate--background-color': '--now-color_alert--moderate-1',
            '--now-highlighted-value--secondary_positive--background-color': '--now-color_alert--positive-1',
            '--now-highlighted-value--secondary_warning--background-color': '--now-color_alert--warning-1',
            '--now-highlighted-value--secondary_yellow--background-color': '--now-color_grouped--yellow-1',
            '--now-highlighted-value--secondary_magenta--background-color': '--now-color_grouped--magenta-1',
            '--now-highlighted-value--secondary_pink--background-color': '--now-color_grouped--pink-1',
            '--now-highlighted-value--secondary_orange--background-color': '--now-color_grouped--orange-1',
            '--now-highlighted-value--secondary_brown--background-color': '--now-color_grouped--brown-1',
            '--now-highlighted-value--secondary_green--background-color': '--now-color_grouped--green-1',
            '--now-highlighted-value--secondary_green-yellow--background-color': '--now-color_grouped--green-yellow-1',
            '--now-highlighted-value--secondary_blue--background-color': '--now-color_grouped--blue-1',
            '--now-highlighted-value--secondary_gray--background-color': '--now-color_grouped--gray-1',
            '--now-highlighted-value--secondary_teal--background-color': '--now-color_grouped--teal-1',
            '--now-highlighted-value--secondary_purple--background-color': '--now-color_grouped--purple-1',
            '--now-highlighted-value--secondary_critical--color': '--now-highlighted-value--secondary--color',
            '--now-highlighted-value--secondary_high--color': '--now-highlighted-value--secondary--color',
            '--now-highlighted-value--secondary_info--color': '--now-highlighted-value--secondary--color',
            '--now-highlighted-value--secondary_low--color': '--now-highlighted-value--secondary--color',
            '--now-highlighted-value--secondary_moderate--color': '--now-highlighted-value--secondary--color',
            '--now-highlighted-value--secondary_positive--color': '--now-highlighted-value--secondary--color',
            '--now-highlighted-value--secondary_warning--color': '--now-highlighted-value--secondary--color',
            '--now-highlighted-value--secondary_magenta--color': '--now-highlighted-value--secondary--color',
            '--now-highlighted-value--secondary_pink--color': '--now-highlighted-value--secondary--color',
            '--now-highlighted-value--secondary_orange--color': '--now-highlighted-value--secondary--color',
            '--now-highlighted-value--secondary_yellow--color': '--now-highlighted-value--secondary--color',
            '--now-highlighted-value--secondary_brown--color': '--now-highlighted-value--secondary--color',
            '--now-highlighted-value--secondary_green--color': '--now-highlighted-value--secondary--color',
            '--now-highlighted-value--secondary_green-yellow--color': '--now-highlighted-value--secondary--color',
            '--now-highlighted-value--secondary_blue--color': '--now-highlighted-value--secondary--color',
            '--now-highlighted-value--secondary_gray--color': '--now-highlighted-value--secondary--color',
            '--now-highlighted-value--secondary_teal--color': '--now-highlighted-value--secondary--color',
            '--now-highlighted-value--secondary_purple--color': '--now-highlighted-value--secondary--color',
            '--now-highlighted-value--secondary_critical--border-color': '--now-color_alert--critical-2',
            '--now-highlighted-value--secondary_high--border-color': '--now-color_alert--high-2',
            '--now-highlighted-value--secondary_info--border-color': '--now-color_alert--info-2',
            '--now-highlighted-value--secondary_low--border-color': '--now-color_alert--low-2',
            '--now-highlighted-value--secondary_moderate--border-color': '--now-color_alert--moderate-2',
            '--now-highlighted-value--secondary_positive--border-color': '--now-color_alert--positive-2',
            '--now-highlighted-value--secondary_warning--border-color': '--now-color_alert--warning-2',
            '--now-highlighted-value--secondary_magenta--border-color': '--now-color_grouped--magenta-2',
            '--now-highlighted-value--secondary_pink--border-color': '--now-color_grouped--pink-2',
            '--now-highlighted-value--secondary_orange--border-color': '--now-color_grouped--orange-2',
            '--now-highlighted-value--secondary_yellow--border-color': '--now-color_grouped--yellow-2',
            '--now-highlighted-value--secondary_brown--border-color': '--now-color_grouped--brown-2',
            '--now-highlighted-value--secondary_green--border-color': '--now-color_grouped--green-2',
            '--now-highlighted-value--secondary_green-yellow--border-color': '--now-color_grouped--green-yellow-2',
            '--now-highlighted-value--secondary_blue--border-color': '--now-color_grouped--blue-2',
            '--now-highlighted-value--secondary_gray--border-color': '--now-color_grouped--gray-2',
            '--now-highlighted-value--secondary_teal--border-color': '--now-color_grouped--teal-2',
            '--now-highlighted-value--secondary_purple--border-color': '--now-color_grouped--purple-2',
            '--now-highlighted-value--tertiary_critical--background-color': '--now-color_alert--critical-0',
            '--now-highlighted-value--tertiary_high--background-color': '--now-color_alert--high-0',
            '--now-highlighted-value--tertiary_info--background-color': '--now-color_alert--info-0',
            '--now-highlighted-value--tertiary_low--background-color': '--now-color_alert--low-0',
            '--now-highlighted-value--tertiary_moderate--background-color': '--now-color_alert--moderate-0',
            '--now-highlighted-value--tertiary_positive--background-color': '--now-color_alert--positive-0',
            '--now-highlighted-value--tertiary_warning--background-color': '--now-color_alert--warning-0',
            '--now-highlighted-value--tertiary_magenta--background-color': '--now-color_grouped--magenta-0',
            '--now-highlighted-value--tertiary_pink--background-color': '--now-color_grouped--pink-0',
            '--now-highlighted-value--tertiary_orange--background-color': '--now-color_grouped--orange-0',
            '--now-highlighted-value--tertiary_yellow--background-color': '--now-color_grouped--yellow-0',
            '--now-highlighted-value--tertiary_brown--background-color': '--now-color_grouped--brown-0',
            '--now-highlighted-value--tertiary_green--background-color': '--now-color_grouped--green-0',
            '--now-highlighted-value--tertiary_green-yellow--background-color': '--now-color_grouped--green-yellow-0',
            '--now-highlighted-value--tertiary_blue--background-color': '--now-color_grouped--blue-0',
            '--now-highlighted-value--tertiary_gray--background-color': '--now-color_grouped--gray-0',
            '--now-highlighted-value--tertiary_teal--background-color': '--now-color_grouped--teal-0',
            '--now-highlighted-value--tertiary_purple--background-color': '--now-color_grouped--purple-0',
            '--now-highlighted-value--tertiary_critical--color': '--now-highlighted-value--tertiary--color',
            '--now-highlighted-value--tertiary_high--color': '--now-highlighted-value--tertiary--color',
            '--now-highlighted-value--tertiary_info--color': '--now-highlighted-value--tertiary--color',
            '--now-highlighted-value--tertiary_low--color': '--now-highlighted-value--tertiary--color',
            '--now-highlighted-value--tertiary_moderate--color': '--now-highlighted-value--tertiary--color',
            '--now-highlighted-value--tertiary_positive--color': '--now-highlighted-value--tertiary--color',
            '--now-highlighted-value--tertiary_warning--color': '--now-highlighted-value--tertiary--color',
            '--now-highlighted-value--tertiary_magenta--color': '--now-highlighted-value--tertiary--color',
            '--now-highlighted-value--tertiary_pink--color': '--now-highlighted-value--tertiary--color',
            '--now-highlighted-value--tertiary_orange--color': '--now-highlighted-value--tertiary--color',
            '--now-highlighted-value--tertiary_yellow--color': '--now-highlighted-value--tertiary--color',
            '--now-highlighted-value--tertiary_brown--color': '--now-highlighted-value--tertiary--color',
            '--now-highlighted-value--tertiary_green--color': '--now-highlighted-value--tertiary--color',
            '--now-highlighted-value--tertiary_green-yellow--color': '--now-highlighted-value--tertiary--color',
            '--now-highlighted-value--tertiary_blue--color': '--now-highlighted-value--tertiary--color',
            '--now-highlighted-value--tertiary_gray--color': '--now-highlighted-value--tertiary--color',
            '--now-highlighted-value--tertiary_teal--color': '--now-highlighted-value--tertiary--color',
            '--now-highlighted-value--tertiary_purple--color': '--now-highlighted-value--tertiary--color',
            '--now-highlighted-value--tertiary_critical--border-color': '--now-color_alert--critical-1',
            '--now-highlighted-value--tertiary_high--border-color': '--now-color_alert--high-1',
            '--now-highlighted-value--tertiary_info--border-color': '--now-color_alert--info-1',
            '--now-highlighted-value--tertiary_low--border-color': '--now-color_alert--low-1',
            '--now-highlighted-value--tertiary_moderate--border-color': '--now-color_alert--moderate-1',
            '--now-highlighted-value--tertiary_positive--border-color': '--now-color_alert--positive-1',
            '--now-highlighted-value--tertiary_warning--border-color': '--now-color_alert--warning-1',
            '--now-highlighted-value--tertiary_magenta--border-color': '--now-color_grouped--magenta-1',
            '--now-highlighted-value--tertiary_pink--border-color': '--now-color_grouped--pink-1',
            '--now-highlighted-value--tertiary_orange--border-color': '--now-color_grouped--orange-1',
            '--now-highlighted-value--tertiary_yellow--border-color': '--now-color_grouped--yellow-1',
            '--now-highlighted-value--tertiary_brown--border-color': '--now-color_grouped--brown-1',
            '--now-highlighted-value--tertiary_green--border-color': '--now-color_grouped--green-1',
            '--now-highlighted-value--tertiary_green-yellow--border-color': '--now-color_grouped--green-yellow-1',
            '--now-highlighted-value--tertiary_blue--border-color': '--now-color_grouped--blue-1',
            '--now-highlighted-value--tertiary_gray--border-color': '--now-color_grouped--gray-1',
            '--now-highlighted-value--tertiary_teal--border-color': '--now-color_grouped--teal-1',
            '--now-highlighted-value--tertiary_purple--border-color': '--now-color_grouped--purple-1',
            '--now-highlighted-value_icon--primary_critical--color': '255,255,255',
            '--now-highlighted-value_icon--primary_high--color': '255,255,255',
            '--now-highlighted-value_icon--primary_info--color': '255,255,255',
            '--now-highlighted-value_icon--primary_low--color': '255,255,255',
            '--now-highlighted-value_icon--primary_moderate--color': '255,255,255',
            '--now-highlighted-value_icon--primary_positive--color': '255,255,255',
            '--now-highlighted-value_icon--primary_warning--color': '255,255,255',
            '--now-highlighted-value_icon--primary_magenta--color': '255,255,255',
            '--now-highlighted-value_icon--primary_pink--color': '255,255,255',
            '--now-highlighted-value_icon--primary_orange--color': '255,255,255',
            '--now-highlighted-value_icon--primary_yellow--color': '255,255,255',
            '--now-highlighted-value_icon--primary_brown--color': '255,255,255',
            '--now-highlighted-value_icon--primary_green--color': '255,255,255',
            '--now-highlighted-value_icon--primary_green-yellow--color': '255,255,255',
            '--now-highlighted-value_icon--primary_blue--color': '255,255,255',
            '--now-highlighted-value_icon--primary_gray--color': '255,255,255',
            '--now-highlighted-value_icon--primary_teal--color': '255,255,255',
            '--now-highlighted-value_icon--primary_purple--color': '255,255,255',
            '--now-highlighted-value_icon--secondary_critical--color': '--now-color_alert--critical-4',
            '--now-highlighted-value_icon--secondary_high--color': '--now-color_alert--high-4',
            '--now-highlighted-value_icon--secondary_info--color': '--now-color_alert--info-4',
            '--now-highlighted-value_icon--secondary_low--color': '--now-color_alert--low-4',
            '--now-highlighted-value_icon--secondary_moderate--color': '--now-color_alert--moderate-4',
            '--now-highlighted-value_icon--secondary_positive--color': '--now-color_alert--positive-4',
            '--now-highlighted-value_icon--secondary_warning--color': '--now-color_alert--warning-4',
            '--now-highlighted-value_icon--secondary_magenta--color': '--now-color_grouped--magenta-5',
            '--now-highlighted-value_icon--secondary_pink--color': '--now-color_grouped--pink-5',
            '--now-highlighted-value_icon--secondary_orange--color': '--now-color_grouped--orange-5',
            '--now-highlighted-value_icon--secondary_yellow--color': '--now-color_grouped--yellow-5',
            '--now-highlighted-value_icon--secondary_brown--color': '--now-color_grouped--brown-5',
            '--now-highlighted-value_icon--secondary_green--color': '--now-color_grouped--green-5',
            '--now-highlighted-value_icon--secondary_green-yellow--color': '--now-color_grouped--green-yellow-5',
            '--now-highlighted-value_icon--secondary_blue--color': '--now-color_grouped--blue-5',
            '--now-highlighted-value_icon--secondary_gray--color': '--now-color_grouped--gray-5',
            '--now-highlighted-value_icon--secondary_teal--color': '--now-color_grouped--teal-5',
            '--now-highlighted-value_icon--secondary_purple--color': '--now-color_grouped--purple-5',
            '--now-highlighted-value_icon--tertiary_critical--color': '--now-color_alert--critical-4',
            '--now-highlighted-value_icon--tertiary_high--color': '--now-color_alert--high-4',
            '--now-highlighted-value_icon--tertiary_info--color': '--now-color_alert--info-4',
            '--now-highlighted-value_icon--tertiary_low--color': '--now-color_alert--low-4',
            '--now-highlighted-value_icon--tertiary_moderate--color': '--now-color_alert--moderate-4',
            '--now-highlighted-value_icon--tertiary_positive--color': '--now-color_alert--positive-4',
            '--now-highlighted-value_icon--tertiary_warning--color': '--now-color_alert--warning-4',
            '--now-highlighted-value_icon--tertiary_magenta--color': '--now-color_grouped--magenta-4',
            '--now-highlighted-value_icon--tertiary_pink--color': '--now-color_grouped--pink-4',
            '--now-highlighted-value_icon--tertiary_orange--color': '--now-color_grouped--orange-4',
            '--now-highlighted-value_icon--tertiary_yellow--color': '--now-color_grouped--yellow-4',
            '--now-highlighted-value_icon--tertiary_brown--color': '--now-color_grouped--brown-4',
            '--now-highlighted-value_icon--tertiary_green--color': '--now-color_grouped--green-4',
            '--now-highlighted-value_icon--tertiary_green-yellow--color': '--now-color_grouped--green-yellow-4',
            '--now-highlighted-value_icon--tertiary_blue--color': '--now-color_grouped--blue-4',
            '--now-highlighted-value_icon--tertiary_gray--color': '--now-color_grouped--gray-4',
            '--now-highlighted-value_icon--tertiary_teal--color': '--now-color_grouped--teal-4',
            '--now-highlighted-value_icon--tertiary_purple--color': '--now-color_grouped--purple-4',
            '--now-label-value-inline--color': '--now-display-type_label--color',
            '--now-label-value_label--color': '--now-display-type_label--color',
            '--now-label-value_previous--color': '--now-color_text--tertiary',
            '--now-label-value_value--color': '--now-display-type_value--color',
            '--now-loader_icon--color': '--now-color--primary-1',
            '--now-loader_label--color': '--now-color_text--secondary',
            '--now-loading--initial--background-color': '--now-color--primary-1',
            '--now-loading--initial--border-color': '--now-color--primary-2',
            '--now-menu_divider--color': '--now-color_divider--tertiary',
            '--now-menu--background-color': '--now-color_background--primary',
            '--now-menu--border-color': '--now-color_border--tertiary',
            '--now-messaging--background-color': '--now-color_background--primary',
            '--now-messaging--border-color': '--now-color_border--secondary',
            '--now-modal_heading--color': '--now-display-type--primary--color',
            '--now-modal_overlay--background-color': '--now-color--neutral-21',
            '--now-modal--background-color': '--now-window--background-color',
            '--now-modal--border-color': '--now-window--border-color',
            '--now-modeless-dialog--background-color': '--now-window--background-color',
            '--now-modeless-dialog--border-color': '--now-window--border-color',
            '--now-opacity--least': '0.25',
            '--now-opacity--less': '0.45',
            '--now-pagination-control--background-color': '--now-color_background--primary',
            '--now-pagination-control--background-color--active': '--now-color--secondary-2',
            '--now-pagination-control--background-color--focus': '--now-color_background--tertiary',
            '--now-pagination-control--background-color--hover': '--now-color--secondary-2',
            '--now-pagination-control--background-color--selected': '--now-color_background--tertiary',
            '--now-pagination-control--color': '--now-color_text--primary',
            '--now-pagination-control--color--active': '--now-color--secondary-3',
            '--now-pagination-control--color--hover': '--now-color--secondary-2',
            '--now-pill_identifier--background-color': '--now-pill--background-color',
            '--now-pill_identifier--background-color--active': '--now-pill--background-color--active',
            '--now-pill_identifier--background-color--hover': '--now-pill--background-color--hover',
            '--now-pill_identifier--background-color--selected': '--now-color--primary-0',
            '--now-pill_identifier--background-color--selected_active': '--now-pill_identifier--background-color--selected',
            '--now-pill_identifier--background-color--selected_hover': '--now-pill_identifier--background-color--selected',
            '--now-pill_identifier--border-color': '--now-pill--border-color',
            '--now-pill_identifier--border-color--active': '--now-pill--border-color--active',
            '--now-pill_identifier--border-color--hover': '--now-pill--border-color--hover',
            '--now-pill_identifier--border-color--selected': '--now-pill--border-color--selected',
            '--now-pill_identifier--border-color--selected_active': '--now-pill--border-color--selected_active',
            '--now-pill_identifier--border-color--selected_hover': '--now-pill--border-color--selected_hover',
            '--now-pill_identifier--color': '--now-pill--color',
            '--now-pill_identifier--color--active': '--now-pill--color--active',
            '--now-pill_identifier--color--hover': '--now-pill--color--hover',
            '--now-pill_identifier--color--selected': '--now-color--primary-3',
            '--now-pill_identifier--color--selected_active': '--now-pill_identifier--color--selected',
            '--now-pill_identifier--color--selected_hover': '--now-pill_identifier--color--selected',
            '--now-pill--background-color': '--now-color_background--primary',
            '--now-pill--background-color--active': '--now-color--primary-0',
            '--now-pill--background-color--hover': '--now-color_background--secondary',
            '--now-pill--background-color--selected': '--now-color--primary-1',
            '--now-pill--background-color--selected_active': '--now-color--primary-3',
            '--now-pill--background-color--selected_hover': '--now-color--primary-2',
            '--now-pill--border-color': '--now-color_border--secondary',
            '--now-pill--border-color--active': '--now-color--primary-1',
            '--now-pill--border-color--hover': '--now-pill--border-color',
            '--now-pill--border-color--selected': '--now-color--primary-1',
            '--now-pill--border-color--selected_active': '--now-color--primary-3',
            '--now-pill--border-color--selected_hover': '--now-color--primary-2',
            '--now-pill--color': '--now-color_text--primary',
            '--now-pill--color--active': '--now-color--primary-2',
            '--now-pill--color--hover': '--now-color--primary-1',
            '--now-pill--color--selected': '--now-color--neutral-0',
            '--now-pill--color--selected_active': '--now-pill--color--selected',
            '--now-pill--color--selected_hover': '--now-pill--color--selected',
            '--now-popover--background-color': '--now-menu--background-color',
            '--now-popover--border-color': '--now-menu--border-color',
            '--now-progress-bar_path--alert--background-color': '--now-color_alert--high-3',
            '--now-progress-bar_path--error--background-color': '--now-color_alert--critical-2',
            '--now-progress-bar_path--inactive--background-color': '--now-color_border--primary-actionable',
            '--now-progress-bar_path--initial--background-color': '--now-loading--initial--background-color',
            '--now-progress-bar_path--positive--background-color': '--now-color_alert--positive-3',
            '--now-progress-bar--background-color': '--now-color_background--tertiary',
            '--now-progress-bar--border-color': '--now-color_border--secondary',
            '--now-radio-buttons_label--color': '--now-color_text--primary',
            '--now-radio-buttons_radio--background-color': '--now-color_text--secondary',
            '--now-radio-buttons_radio--background-color--hover': '--now-color--secondary-3',
            '--now-radio-buttons_radio--background-color--invalid': '--now-radio-buttons_radio--background-color',
            '--now-radio-buttons--background-color': '--now-color_background--primary',
            '--now-radio-buttons--background-color--disabled': '--now-color_text--disabled',
            '--now-radio-buttons--background-color--readonly': '--now-color_text--secondary',
            '--now-radio-buttons--background-color--focus': '--now-color_background--secondary',
            '--now-radio-buttons--background-color--hover': '--now-color--secondary-0',
            '--now-radio-buttons--background-color--active': '--now-color_background--primary',
            '--now-radio-buttons--background-color--invalid_hover': '--now-color_alert--critical-1',
            '--now-radio-buttons--background-color--invalid_focus': '--now-color_background--primary',
            '--now-radio-buttons--background-color--invalid_active': '--now-color_background--primary',
            '--now-radio-buttons--border-color': '--now-color_border--primary',
            '--now-radio-buttons--border-color--disabled': '--now-color_border--primary',
            '--now-radio-buttons--border-color--readonly': '--now-color_border--primary',
            '--now-radio-buttons--border-color--focus': '--now-color--secondary-1',
            '--now-radio-buttons--border-color--hover': '--now-color--secondary-1',
            '--now-radio-buttons--border-color--invalid': '--now-color_alert--critical-2',
            '--now-score_heading--color': '--now-color_text--primary',
            '--now-score_label--primary--color': '--now-color_text--primary',
            '--now-score_label--secondary--color': '--now-color_text--tertiary',
            '--now-score_timestamp--color': '--now-color_text--tertiary',
            '--now-score_value--color': '--now-color_text--primary',
            '--now-score--interactive--background-color--active': '--now-color--secondary-1',
            '--now-score--interactive--background-color--hover': '--now-color_background--tertiary',
            '--now-stepper_completed-count--color': '--now-color_text--tertiary',
            '--now-stepper_connector--border-color': '--now-color_divider--tertiary',
            '--now-stepper_label--color--selected': '--now-color--secondary-2',
            '--now-stepper_label--color--selected_hover': '--now-color--secondary-3',
            '--now-stepper_label--color--selected_active': '--now-color_text--primary',
            '--now-stepper_label--done--color': '--now-color--secondary-1',
            '--now-stepper_label--done--color--hover': '--now-color--secondary-2',
            '--now-stepper_label--done--color--active': '--now-color--secondary-3',
            '--now-stepper_label--none--color': '--now-color_text--tertiary',
            '--now-stepper_label--none--color--hover': '--now-color--secondary-1',
            '--now-stepper_label--none--color--active': '--now-color--secondary-3',
            '--now-stepper_label--partial--color': '--now-color--secondary-1',
            '--now-stepper_label--partial--color--hover': '--now-color--secondary-2',
            '--now-stepper_label--partial--color--active': '--now-color--secondary-3',
            '--now-stepper_step--background-color--selected': '--now-color--secondary-0',
            '--now-stepper_step--background-color--selected_active': '--now-stepper_step--background-color--selected',
            '--now-stepper_step--background-color--selected_hover': '--now-stepper_step--background-color--selected',
            '--now-stepper_step--border-color--selected': '--now-color--secondary-2',
            '--now-stepper_step--border-color--selected_active': '--now-color_text--primary',
            '--now-stepper_step--border-color--selected_hover': '--now-color--secondary-3',
            '--now-stepper_step--color--selected': '--now-color--secondary-2',
            '--now-stepper_step--color--selected_active': '--now-color_text--primary',
            '--now-stepper_step--color--selected_hover': '--now-color--secondary-3',
            '--now-stepper_step--done--color': '--now-color--secondary-1',
            '--now-stepper_step--done--color--active': '--now-color--secondary-3',
            '--now-stepper_step--done--color--hover': '--now-color--secondary-2',
            '--now-stepper_step--none--border-color': '--now-color_text--tertiary',
            '--now-stepper_step--none--border-color--active': '--now-color--secondary-3',
            '--now-stepper_step--none--border-color--hover': '--now-color--secondary-1',
            '--now-stepper_step--none--color': '--now-color_text--tertiary',
            '--now-stepper_step--none--color--active': '--now-color--secondary-3',
            '--now-stepper_step--none--color--hover': '--now-color--secondary-1',
            '--now-stepper_step--partial--border-color': '--now-color--secondary-1',
            '--now-stepper_step--partial--border-color--active': '--now-color--secondary-3',
            '--now-stepper_step--partial--border-color--hover': '--now-color--secondary-2',
            '--now-stepper_step--partial--color': '--now-color--secondary-1',
            '--now-stepper_step--partial--color--active': '--now-color--secondary-3',
            '--now-stepper_step--partial--color--hover': '--now-color--secondary-2',
            '--now-stepper_sublabel--color--selected': '--now-color--secondary-2',
            '--now-stepper_sublabel--color--selected_active': '--now-color_text--primary',
            '--now-stepper_sublabel--color--selected_hover': '--now-color--secondary-3',
            '--now-stepper_sublabel--done--color': '--now-color--secondary-1',
            '--now-stepper_sublabel--done--color--hover': '--now-color--secondary-2',
            '--now-stepper_sublabel--done--color--active': '--now-color--secondary-3',
            '--now-stepper_sublabel--none--color': '--now-color_text--tertiary',
            '--now-stepper_sublabel--none--color--hover': '--now-color--secondary-1',
            '--now-stepper_sublabel--none--color--active': '--now-color--secondary-3',
            '--now-stepper_sublabel--partial--color': '--now-color--secondary-1',
            '--now-stepper_sublabel--partial--color--hover': '--now-color--secondary-2',
            '--now-stepper_sublabel--partial--color--active': '--now-color--secondary-3',
            '--now-tabs_container--background-color': '--now-tabs--background-color',
            '--now-tabs_divider--color': '--now-color_divider--secondary',
            '--now-tabs-vertical--background-color': '--now-tabs--background-color',
            '--now-tabs-vertical--background-color--hover': '--now-tabs-vertical--background-color',
            '--now-tabs-vertical--background-color--active': '--now-tabs-vertical--background-color',
            '--now-tabs-vertical--background-color--selected': '--now-tabs-vertical--background-color',
            '--now-tabs-vertical--border-color--active': '--now-tabs--border-color--active',
            '--now-tabs-vertical--border-color--hover': '--now-tabs--border-color--hover',
            '--now-tabs-vertical--border-color--selected': '--now-tabs--border-color--selected',
            '--now-tabs-vertical--color': '--now-tabs--color',
            '--now-tabs-vertical--color--active': '--now-tabs--color--active',
            '--now-tabs-vertical--color--hover': '--now-tabs--color--hover',
            '--now-tabs-vertical--color--selected': '--now-tabs--color--selected',
            '--now-tabs-vertical_divider--color': '--now-color_divider--secondary',
            '--now-tabs-vertical_container--background-color': '--now-tabs--background-color',
            '--now-tabs--background-color': '--now-color_background--primary',
            '--now-tabs--background-color--active': '--now-tabs--background-color',
            '--now-tabs--background-color--hover': '--now-tabs--background-color',
            '--now-tabs--background-color--selected': '--now-tabs--background-color',
            '--now-tabs--border-color--active': '--now-color_selection--primary-4',
            '--now-tabs--border-color--hover': '--now-color_divider--secondary',
            '--now-tabs--border-color--selected': '--now-color_selection--primary-3',
            '--now-tabs--color': '--now-color_text--primary',
            '--now-tabs--color--active': '--now-color_selection--primary-4',
            '--now-tabs--color--hover': '--now-color_selection--primary-3',
            '--now-tabs--color--selected': '--now-color_selection--primary-3',
            '--now-template-card-omnichannel--color': '--now-color_text--tertiary',
            '--now-template-message-empty-state_content--color': '--now-display-type--tertiary--color',
            '--now-template-message-empty-state_heading--color': '--now-display-type--primary--color',
            '--now-text-link--primary--color': '--now-color--link-2',
            '--now-text-link--primary--color--active': '--now-color--link-4',
            '--now-text-link--primary--color--hover': '--now-color--link-3',
            '--now-text-link--secondary--color': '--now-color--secondary-1',
            '--now-text-link--secondary--color--active': '--now-color--secondary-3',
            '--now-text-link--secondary--color--hover': '--now-color--secondary-2',
            '--now-toggle_handle--background-color': '--now-color_text--secondary',
            '--now-toggle_handle--background-color--hover': '--now-color_text--primary',
            '--now-toggle_handle--border-color': '--now-color_border--primary',
            '--now-toggle_track--background-color': '--now-color_background--tertiary',
            '--now-toggle_track--background-color--checked': '--now-color--primary-1',
            '--now-toggle_track--border-color': '--now-color_border--primary',
            '--now-toggle_track--border-color--checked': '--now-color--primary-2',
            '--now-toolbar-nav--background-color-start': '--now-color_secondary-nav--brand-2',
            '--now-toolbar-nav--background-color-middle': '--now-color--neutral-15',
            '--now-toolbar-nav--background-color-end': '--now-color--neutral-15',
            '--now-tooltip--background-color': '--now-color_text--primary',
            '--now-tooltip--border-color': '--now-color_border--tertiary',
            '--now-tooltip--color': '--now-color_background--primary',
            '--now-unified-nav_button--background-color': '--now-color_background--secondary-actionable',
            '--now-unified-nav_button--background-color--active': '--now-unified-nav_button--background-color',
            '--now-unified-nav_button--background-color--hover': '--now-color--interactive-0',
            '--now-unified-nav_button--color': '--now-color_text--secondary',
            '--now-unified-nav_button--color--active': '--now-color_text--primary',
            '--now-unified-nav_button--color--hover': '--now-color_text--primary',
            '--now-unified-nav_contextual-app-pill--background-color': '--now-color_background--tertiary-actionable',
            '--now-unified-nav_contextual-app-pill--border-color': '--now-color_border--tertiary',
            '--now-unified-nav_contextual-app-pill--color': '--now-color_text--secondary',
            '--now-unified-nav_favorite-icon--color': '--now-color_grouped--yellow-5',
            '--now-unified-nav_focus-ring--color': '--now-color--interactive-2',
            '--now-unified-nav_focus-ring-inner--color': '--now-color_text--primary',
            '--now-unified-nav_header--background-color': '--now-color_brand--primary',
            '--now-unified-nav_header--color': '--now-color_text--secondary',
            '--now-unified-nav_menu-button-iconic--color': '--now-color_text--secondary',
            '--now-unified-nav_menu-button-iconic--color--hover': '--now-color_text--primary',
            '--now-unified-nav_menu--background-color': '--now-color_background--primary',
            '--now-unified-nav_menu-item--color': '--now-color_text--secondary',
            '--now-unified-nav_menu-item--color--active': '--now-color_text--primary',
            '--now-unified-nav_menu-section-header--color': '--now-color_text--secondary',
            '--now-unified-nav_menu-section-header--background-color': '--now-color_background--primary',
            '--now-unified-nav_menu-item--background-color--hover': '--now-color--interactive-0',
            '--now-unified-nav_menu-item--color--hover': '--now-color_text--primary',
            '--now-unified-nav_menu-filter-result--color': '--now-color_text--secondary',
            '--now-unified-nav_menu-filter-result--color--hover': '--now-color_text--primary',
            '--now-unified-nav_menu-item--border-color--hover': '--now-color--interactive-2',
            '--now-unified-nav_menu-button-iconic--background-color': '--now-color_text--primary',
            '--now-unified-nav_menu-button-iconic--background-color--active': '--now-color--interactive-0',
            '--now-unified-nav_menu-button-iconic--background-color--hover': '--now-color_chrome--brand-6',
            '--now-unified-nav_menu-filter-result-mark--color': '--now-color_text--primary',
            '--now-unified-nav_menu-filter-result-mark--color--hover': '--now-color_text--primary',
            '--now-unified-nav_favorite-icon--background-color--hover': '--now-color_text--primary',
            '--now-unified-nav_favorite-icon--color--hover': '--now-color_grouped--yellow-4',
            '--now-unified-nav_menu-button-iconic--color--active': '--now-color_text--primary',
            '--now-unified-nav_menu-filter--background-color': '--now-color_background--secondary',
            '--now-unified-nav_menu-filter--background-color--hover': '--now-color_background--tertiary',
            '--now-unified-nav_menu-filter--background-color--opened': '--now-color_background--primary',
            '--now-unified-nav_menu-filter--border-color': '--now-color_border--tertiary',
            '--now-unified-nav_menu-filter--border-color--opened': '--now-color_border--primary',
            '--now-unified-nav_menu-filter--color': '--now-color_text--primary',
            '--now-unified-nav_menu-filter--color--hover': '--now-color_text--primary',
            '--now-unified-nav_menu-filter--color--opened': '--now-color_text--secondary',
            '--now-unified-nav_menu-filter--color--placeholder': '--now-color_text--tertiary',
            '--now-unified-nav_menu-filter--color--placeholder--focus': '--now-color_text--secondary',
            '--now-unified-nav_menu-divider-horizontal--color': '--now-color_border--tertiary',
            '--now-unified-nav_menu-divider-vertical--color': '--now-color_border--tertiary',
            '--now-unified-nav_menu-item--background-color--active': '--now-color--interactive-0',
            '--now-unified-nav_menu-item--border-size': '1px',
            '--now-unified-nav_menu-scrollbar--color': '--now-color_border--primary-actionable',
            '--now-unified-nav_menu-sublabel--color': '--now-color_text--secondary',
            '--now-unified-nav_menu-sublabel--color--hover': '--now-color_text--primary',
            '--now-unified-nav_menu-subitem--border-color--hover': '--now-color--interactive-2',
            '--now-unified-nav_menu-subitem--border-radius': '4px',
            '--now-unified-nav_menu-subitem--border-size': '1px',
            '--now-unified-nav_menu-subitem--color': '--now-unified-nav_button--color',
            '--now-unified-nav_menu-subitem--color--hover': '--now-unified-nav_button--color',
            '--now-unified-nav_menu--border-color': '--now-color_border--tertiary',
            '--now-unified-nav_nav-menu-trigger--background-color': '--now-unified-nav_header--background-color',
            '--now-unified-nav_nav-menu-trigger--background-color--active': '--now-color--interactive-0',
            '--now-unified-nav_nav-menu-trigger--background-color--hover': '--now-color--interactive-0',
            '--now-unified-nav_nav-menu-trigger--border-color--active': '--now-color_border--tertiary',
            '--now-unified-nav_nav-menu-trigger--border-color--hover': '--now-color_border--tertiary-actionable',
            '--now-unified-nav_nav-menu-trigger--border-size--hover': '1px',
            '--now-unified-nav_nav-menu-trigger--border-size--active': '2px',
            '--now-unified-nav_nav-menu-trigger--color': '--now-unified-nav_header--color',
            '--now-unified-nav_nav-menu-trigger--color--hover': '--now-color_text--primary',
            '--now-unified-nav_nav-menu-trigger--color--active': '--now-color_text--primary',
            '--now-unified-nav_utility-menu-trigger--background-color': '--now-unified-nav_header--background-color',
            '--now-unified-nav_utility-menu-trigger--background-color--hover': '--now-unified-nav_nav-menu-trigger--background-color--hover',
            '--now-unified-nav_utility-menu-trigger--background-color--active': '--now-unified-nav_utility-menu-trigger--background-color--hover',
            '--now-unified-nav_utility-menu-trigger--color': '--now-color_text--secondary',
            '--now-unified-nav_utility-menu-trigger--color--active': '--now-color_text--primary',
            '--now-unified-nav_utility-menu-trigger--color--hover': '--now-color_text--primary',
            '--now-unified-nav_utility-panel-header--color': '--now-color_text--secondary',
            '--now-unified-nav_utility-panel-tabs--border-color--active': '--now-color--interactive-4',
            '--now-unified-nav_utility-panel-tabs--border-color--selected': '--now-color--interactive-2',
            '--now-unified-nav_utility-panel-tabs--color': '--now-color_text--secondary',
            '--now-unified-nav_utility-panel-tabs--color--hover': '--now-color--interactive-3',
            '--now-unified-nav_utility-panel-tabs--color--active': '--now-color--interactive-4',
            '--now-unified-nav_utility-panel-tabs--color--selected': '--now-color--interactive-2',
            '--now-window--background-color': '--now-color_background--primary',
            '--now-window--border-color': '--now-color_border--tertiary',
            '--unified_nav-input--background-color': '--now-color_background--tertiary-actionable',
            '--unified_nav-input--background-color--hover': '--now-color_background--secondary-actionable',
            '--unified_nav-input--border-color': '--now-color_border--tertiary',
            '--unified_nav-input--color': '--now-color_text--secondary',
            '--unified_nav-input--color--opened': '--now-color_text--primary',
            '--unified_nav-input--color--placeholder': '--now-color_text--tertiary',
            '--now-button-iconic--primary--border-color': '--now-color--primary-3',
            '--now-button-iconic--primary--border-color--hover': '--now-color--primary-3',
            '--now-button-iconic--primary--border-color--active': '--now-color--primary-3',
            '--now-button-iconic--primary--background-color': '--now-color--primary-1',
            '--now-button-iconic--primary--background-color--hover': '--now-color--primary-2',
            '--now-button-iconic--primary--background-color--active': '--now-color--primary-3',
            '--now-button-iconic--primary--color': '7,8,11',
            '--now-button-iconic--primary--color--hover': '7,8,11',
            '--now-button-iconic--primary--color--active': '7,8,11',
            '--now-button-iconic--secondary--border-color': '--now-color--neutral-7',
            '--now-button-iconic--secondary--border-color--hover': '--now-color--neutral-7',
            '--now-button-iconic--secondary--border-color--active': '--now-color--neutral-7',
            '--now-button_icon--bare_tertiary--color': '--now-color_text--primary',
            '--now-button_icon--bare_tertiary--color--hover': '--now-color--secondary-2',
            '--now-button_icon--bare_tertiary--color--active': '--now-color--secondary-3',
            '--now-button--bare_tertiary--border-color--active': '--now-color--neutral-12',
            '--now-button--bare_tertiary--border-color--hover': '--now-color--neutral-12',
            '--now-button--bare_secondary--border-color--active': '--now-color--secondary-3',
            '--now-button--bare_secondary--border-color--hover': '--now-color--secondary-2',
            '--now-button--bare_primary--border-color--active': '--now-color--primary-3',
            '--now-button--bare_primary--border-color--hover': '--now-color--primary-2',
            '--now-button_icon--bare_primary--color': '--now-color--primary-1',
            '--now-button_icon--bare_primary--color--hover': '--now-color--primary-2',
            '--now-button_icon--bare_primary--color--active': '--now-color--primary-3',
            '--now-button-iconic--bare_primary--color': '--now-color--primary-1',
            '--now-button-iconic--bare_primary--color--hover': '--now-color--primary-2',
            '--now-button-iconic--bare_primary--color--active': '--now-color--primary-3',
            '--now-button-iconic--bare_primary--border-color--hover': '--now-color--primary-2',
            '--now-button-iconic--bare_primary--border-color--active': '--now-color--primary-3',
            '--now-button-iconic--bare_primary--background-color--hover': '--now-color--primary-2',
            '--now-button-iconic--bare_primary--background-color--active': '--now-color--primary-2',
            '--now-button-iconic--bare_secondary--color': '--now-color--secondary-1',
            '--now-button-iconic--bare_secondary--color--hover': '--now-color--secondary-2',
            '--now-button-iconic--bare_secondary--color--active': '--now-color--secondary-3',
            '--now-button-iconic--bare_secondary--border-color--hover': '--now-color--secondary-2',
            '--now-button-iconic--bare_secondary--border-color--active': '--now-color--secondary-3',
            '--now-button-iconic--bare_secondary--background-color--hover': '--now-color--secondary-2',
            '--now-button-iconic--bare_secondary--background-color--active': '--now-color--secondary-2',
            '--now-button-iconic--bare_tertiary--color': '--now-color_text--primary',
            '--now-button-iconic--bare_tertiary--color--hover': '--now-color--secondary-2',
            '--now-button-iconic--bare_tertiary--color--active': '--now-color--secondary-3',
            '--now-button-iconic--bare_tertiary--border-color--hover': '--now-color--neutral-12',
            '--now-button-iconic--bare_tertiary--border-color--active': '--now-color--neutral-12',
            '--now-button-iconic--bare_tertiary--background-color--hover': '--now-color--neutral-12',
            '--now-button-iconic--bare_tertiary--background-color--active': '--now-color--neutral-12',
            '--now-button_icon--bare_secondary--color': '--now-color--secondary-1',
            '--now-button_icon--bare_secondary--color--hover': '--now-color--secondary-2',
            '--now-button_icon--bare_secondary--color--active': '--now-color--secondary-3',
            '--now-button_icon--primary--color': '7,8,11',
            '--now-button_icon--primary--color--active': '7,8,11',
            '--now-button_icon--primary--color--hover': '7,8,11',
            '--now-button_icon--primary-positive--color': '7,8,11',
            '--now-button_icon--primary-positive--color--active': '7,8,11',
            '--now-button_icon--primary-positive--color--hover': '7,8,11',
            '--now-button_icon--primary-negative--color': '7,8,11',
            '--now-button_icon--primary-negative--color--active': '7,8,11',
            '--now-button_icon--primary-negative--color--hover': '7,8,11',
            '--now-button_icon--secondary-negative--color': '--now-color_alert--critical-4',
            '--now-button_icon--secondary-negative--color--active': '--now-color--neutral-0',
            '--now-button_icon--secondary-negative--color--hover': '--now-color_alert--critical-5',
            '--now-button_icon--secondary-positive--color': '--now-color_alert--positive-4',
            '--now-button_icon--secondary-positive--color--active': '--now-color--neutral-0',
            '--now-button_icon--secondary-positive--color--hover': '--now-color_alert--positive-5',
            '--now-button-stateful--primary--border-color--hover': '--now-color--primary-2',
            '--now-button-stateful--primary--border-color--active': '--now-color--primary-3',
            '--now-button-stateful--primary--color': '--now-color--primary-1',
            '--now-button-stateful--primary--color--hover': '--now-color--primary-2',
            '--now-button-stateful--primary--color--active': '--now-color--primary-3',
            '--now-button-stateful--primary--background-color--hover': '--now-color--primary-2',
            '--now-button-stateful--primary--background-color--active': '--now-color--primary-2',
            '--now-button-stateful--primary--color--selected': '--now-color--primary-1',
            '--now-button-stateful--primary--color--selected_hover': '--now-color--primary-2',
            '--now-button-stateful--primary--color--selected_active': '--now-color--primary-3',
            '--now-button-stateful--primary--background-color--selected_hover': '--now-color--primary-2',
            '--now-button-stateful--primary--background-color--selected_active': '--now-color--primary-2',
            '--now-button-stateful--primary--border-color--selected_hover': '--now-color--primary-2',
            '--now-button-stateful--primary--border-color--selected_active': '--now-color--primary-3',
            '--now-button-stateful--primary_highlighted--border-color--selected': '--now-color--primary-1',
            '--now-button-stateful--primary_highlighted--border-color--selected_hover': '--now-button-stateful--primary--border-color--hover',
            '--now-button-stateful--primary_highlighted--border-color--selected_active': '--now-button-stateful--primary--border-color--active',
            '--now-button-stateful--primary_highlighted--color--selected': '--now-color--primary-1',
            '--now-button-stateful--primary_highlighted--color--selected_hover': '--now-button-stateful--primary--color--selected_hover',
            '--now-button-stateful--primary_highlighted--color--selected_active': '--now-button-stateful--primary--color--selected_active',
            '--now-button-stateful--primary_highlighted--background-color--selected': '--now-color--primary-2',
            '--now-button-stateful--primary_highlighted--background-color--selected_hover': '--now-button--primary--background-color--hover',
            '--now-button-stateful--primary_highlighted--background-color--selected_active': '--now-button--primary--background-color--active',
            '--now-button-stateful--primary_high-contrast--color': '--now-button--bare_primary_high-contrast--color',
            '--now-button-stateful--primary_high-contrast--color--hover': '--now-button--bare_primary_high-contrast--color--hover',
            '--now-button-stateful--primary_high-contrast--color--active': '--now-button--bare_primary_high-contrast--color--active',
            '--now-button-stateful--primary-selection--border-color--hover': '--now-color_selection--primary-3',
            '--now-button-stateful--primary-selection--border-color--active': '--now-color_selection--primary-3',
            '--now-button-stateful--primary-selection--color': '--now-color_selection--primary-2',
            '--now-button-stateful--primary-selection--color--hover': '--now-color_selection--primary-3',
            '--now-button-stateful--primary-selection--color--active': '--now-color_selection--primary-4',
            '--now-button-stateful--primary-selection--background-color--hover': '--now-color_selection--primary-2',
            '--now-button-stateful--primary-selection--background-color--active': '--now-color_selection--primary-2',
            '--now-button-stateful--primary-selection--border-color--selected_hover': '--now-color_selection--primary-3',
            '--now-button-stateful--primary-selection--border-color--selected_active': '--now-color_selection--primary-3',
            '--now-button-stateful--primary-selection--color--selected': '--now-color_selection--primary-2',
            '--now-button-stateful--primary-selection--color--selected_hover': '--now-color_selection--primary-3',
            '--now-button-stateful--primary-selection--color--selected_active': '--now-color_selection--primary-4',
            '--now-button-stateful--primary-selection--background-color--selected_hover': '--now-color_selection--primary-2',
            '--now-button-stateful--primary-selection--background-color--selected_active': '--now-color_selection--primary-2',
            '--now-button-stateful--primary-selection_high-contrast--color': '--now-color_selection--primary-4',
            '--now-button-stateful--primary-selection_high-contrast--color--hover': '--now-color_text--primary',
            '--now-button-stateful--primary-selection_high-contrast--color--active': '--now-color_text--primary',
            '--now-button-stateful--primary-selection_highlighted--border-color--selected': '--now-color_selection--primary-3',
            '--now-button-stateful--primary-selection_highlighted--border-color--selected_hover': '--now-button-stateful--primary-selection_highlighted--border-color--selected',
            '--now-button-stateful--primary-selection_highlighted--border-color--selected_active': '--now-button-stateful--primary-selection_highlighted--border-color--selected',
            '--now-button-stateful--primary-selection_highlighted--color--selected': '--now-color_selection--primary-2',
            '--now-button-stateful--primary-selection_highlighted--color--selected_hover': '--now-button-stateful--primary-selection--color--selected_hover',
            '--now-button-stateful--primary-selection_highlighted--color--selected_active': '--now-button-stateful--primary-selection--color--selected_active',
            '--now-button-stateful--primary-selection_highlighted--background-color--selected': '--now-color_selection--primary-2',
            '--now-button-stateful--primary-selection_highlighted--background-color--selected_hover': '--now-button-stateful--primary-selection_highlighted--background-color--selected',
            '--now-button-stateful--primary-selection_highlighted--background-color--selected_active': '--now-button-stateful--primary-selection_highlighted--background-color--selected',
            '--now-button-stateful--secondary--border-color--hover': '--now-color--secondary-2',
            '--now-button-stateful--secondary--border-color--active': '--now-color--secondary-3',
            '--now-button-stateful--secondary--color': '--now-color--secondary-1',
            '--now-button-stateful--secondary--color--hover': '--now-color--secondary-2',
            '--now-button-stateful--secondary--color--active': '--now-color--secondary-3',
            '--now-button-stateful--secondary--background-color--hover': '--now-color--secondary-2',
            '--now-button-stateful--secondary--background-color--active': '--now-color--secondary-2',
            '--now-button-stateful--secondary--color--selected': '--now-color--secondary-1',
            '--now-button-stateful--secondary--color--selected_hover': '--now-color--secondary-2',
            '--now-button-stateful--secondary--color--selected_active': '--now-color--secondary-3',
            '--now-button-stateful--secondary--background-color--selected_hover': '--now-color--secondary-2',
            '--now-button-stateful--secondary--background-color--selected_active': '--now-color--secondary-2',
            '--now-button-stateful--secondary--border-color--selected_hover': '--now-color--secondary-2',
            '--now-button-stateful--secondary--border-color--selected_active': '--now-color--secondary-3',
            '--now-button-stateful--secondary_highlighted--border-color--selected': '--now-color--secondary-1',
            '--now-button-stateful--secondary_highlighted--border-color--selected_hover': '--now-color--secondary-2',
            '--now-button-stateful--secondary_highlighted--border-color--selected_active': '--now-color--secondary-3',
            '--now-button-stateful--secondary_highlighted--color--selected': '--now-color--secondary-1',
            '--now-button-stateful--secondary_highlighted--color--selected_hover': '--now-button-stateful--secondary--color--selected_hover',
            '--now-button-stateful--secondary_highlighted--color--selected_active': '--now-button-stateful--secondary--color--selected_active',
            '--now-button-stateful--secondary_highlighted--background-color--selected': '--now-color--secondary-1',
            '--now-button-stateful--secondary_highlighted--background-color--selected_hover': '--now-color--secondary-1',
            '--now-button-stateful--secondary_highlighted--background-color--selected_active': '--now-color--secondary-1',
            '--now-button-stateful--secondary_high-contrast--color': '--now-button--bare_secondary_high-contrast--color',
            '--now-button-stateful--secondary_high-contrast--color--hover': '--now-button--bare_secondary_high-contrast--color--hover',
            '--now-button-stateful--secondary_high-contrast--color--active': '--now-button--bare_secondary_high-contrast--color--active',
            '--now-button-stateful--secondary-selection--border-color--hover': '--now-color--neutral-12',
            '--now-button-stateful--secondary-selection--border-color--active': '--now-color--neutral-12',
            '--now-button-stateful--secondary-selection--color': '--now-color_selection--primary-2',
            '--now-button-stateful--secondary-selection--color--hover': '--now-color_selection--primary-3',
            '--now-button-stateful--secondary-selection--color--active': '--now-color_selection--primary-4',
            '--now-button-stateful--secondary-selection--background-color--hover': '--now-color--neutral-12',
            '--now-button-stateful--secondary-selection--background-color--active': '--now-color--neutral-12',
            '--now-button-stateful--secondary-selection--border-color--selected_hover': '--now-color--neutral-12',
            '--now-button-stateful--secondary-selection--border-color--selected_active': '--now-color--neutral-12',
            '--now-button-stateful--secondary-selection--color--selected': '--now-color_selection--primary-2',
            '--now-button-stateful--secondary-selection--color--selected_hover': '--now-color_selection--primary-2',
            '--now-button-stateful--secondary-selection--color--selected_active': '--now-color_selection--primary-4',
            '--now-button-stateful--secondary-selection--background-color--selected_hover': '--now-color--neutral-12',
            '--now-button-stateful--secondary-selection--background-color--selected_active': '--now-color--neutral-12',
            '--now-button-stateful--secondary-selection_highlighted--border-color--selected': '--now-color_selection--primary-3',
            '--now-button-stateful--secondary-selection_highlighted--border-color--selected_hover': '--now-button-stateful--secondary-selection_highlighted--border-color--selected',
            '--now-button-stateful--secondary-selection_highlighted--border-color--selected_active': '--now-button-stateful--secondary-selection_highlighted--border-color--selected',
            '--now-button-stateful--secondary-selection_highlighted--color--selected': '--now-color_selection--primary-2',
            '--now-button-stateful--secondary-selection_highlighted--color--selected_hover': '--now-button-stateful--secondary-selection--color--selected_hover',
            '--now-button-stateful--secondary-selection_highlighted--color--selected_active': '--now-button-stateful--secondary-selection--color--selected_active',
            '--now-button-stateful--secondary-selection_highlighted--background-color--selected': '--now-color_selection--primary-2',
            '--now-button-stateful--secondary-selection_highlighted--background-color--selected_hover': '--now-button-stateful--secondary-selection_highlighted--background-color--selected',
            '--now-button-stateful--secondary-selection_highlighted--background-color--selected_active': '--now-button-stateful--secondary-selection_highlighted--background-color--selected',
            '--now-button-stateful--secondary-selection_high-contrast--color': '--now-color_selection--primary-4',
            '--now-button-stateful--secondary-selection_high-contrast--color--hover': '--now-color_selection--primary-4',
            '--now-button-stateful--secondary-selection_high-contrast--color--active': '--now-color_selection--primary-4',
            '--now-button-stateful--tertiary--border-color--hover': '--now-color--neutral-12',
            '--now-button-stateful--tertiary--border-color--active': '--now-color--neutral-12',
            '--now-button-stateful--tertiary--color': '--now-color_text--primary',
            '--now-button-stateful--tertiary--color--hover': '--now-color--secondary-2',
            '--now-button-stateful--tertiary--color--active': '--now-color--secondary-3',
            '--now-button-stateful--tertiary--background-color--hover': '--now-color--neutral-12',
            '--now-button-stateful--tertiary--background-color--active': '--now-color--neutral-12',
            '--now-button-stateful--tertiary--border-color--selected_hover': '--now-color--neutral-12',
            '--now-button-stateful--tertiary--border-color--selected_active': '--now-color--neutral-12',
            '--now-button-stateful--tertiary--color--selected': '--now-color--secondary-1',
            '--now-button-stateful--tertiary--color--selected_hover': '255,255,255',
            '--now-button-stateful--tertiary--color--selected_active': '--now-color--secondary-3',
            '--now-button-stateful--tertiary--background-color--selected_hover': '--now-color--neutral-12',
            '--now-button-stateful--tertiary--background-color--selected_active': '--now-color--neutral-12',
            '--now-button-stateful--tertiary_highlighted--border-color--selected': '--now-color--neutral-12',
            '--now-button-stateful--tertiary_highlighted--border-color--selected_hover': '--now-color--neutral-12',
            '--now-button-stateful--tertiary_highlighted--border-color--selected_active': '--now-color--neutral-12',
            '--now-button-stateful--tertiary_highlighted--color--selected': '--now-color--secondary-1',
            '--now-button-stateful--tertiary_highlighted--color--selected_hover': '--now-button-stateful--tertiary--color--selected_hover',
            '--now-button-stateful--tertiary_highlighted--color--selected_active': '--now-button-stateful--tertiary--color--selected_active',
            '--now-button-stateful--tertiary_highlighted--background-color--selected': '--now-color--neutral-12',
            '--now-button-stateful--tertiary_highlighted--background-color--selected_hover': '--now-button-stateful--tertiary_highlighted--background-color--selected',
            '--now-button-stateful--tertiary_highlighted--background-color--selected_active': '--now-button-stateful--tertiary_highlighted--background-color--selected',
            '--now-button-stateful--tertiary_high-contrast--color': '--now-button--bare_tertiary_high-contrast--color',
            '--now-button-stateful--tertiary_high-contrast--color--hover': '--now-button--bare_tertiary_high-contrast--color--hover',
            '--now-button-stateful--tertiary_high-contrast--color--active': '--now-button--bare_tertiary_high-contrast--color--active',
            '--now-button-stateful--tertiary-selection--border-color--hover': '--now-color_selection--primary-3',
            '--now-button-stateful--tertiary-selection--border-color--active': '--now-color_selection--primary-3',
            '--now-button-stateful--tertiary-selection--color': '--now-color_text--primary',
            '--now-button-stateful--tertiary-selection--color--hover': '--now-color_selection--primary-3',
            '--now-button-stateful--tertiary-selection--color--active': '--now-color_selection--primary-4',
            '--now-button-stateful--tertiary-selection--background-color--hover': '--now-color_selection--primary-2',
            '--now-button-stateful--tertiary-selection--background-color--active': '--now-color_selection--primary-2',
            '--now-button-stateful--tertiary-selection--border-color--selected_hover': '--now-color_selection--primary-3',
            '--now-button-stateful--tertiary-selection--border-color--selected_active': '--now-color_selection--primary-3',
            '--now-button-stateful--tertiary-selection--color--selected': '--now-color_selection--primary-2',
            '--now-button-stateful--tertiary-selection--color--selected_hover': '--now-color_selection--primary-3',
            '--now-button-stateful--tertiary-selection--color--selected_active': '--now-color_selection--primary-4',
            '--now-button-stateful--tertiary-selection--background-color--selected_hover': '--now-color_selection--primary-2',
            '--now-button-stateful--tertiary-selection--background-color--selected_active': '--now-color_selection--primary-2',
            '--now-button-stateful--tertiary-selection_highlighted--border-color--selected': '--now-color_selection--primary-3',
            '--now-button-stateful--tertiary-selection_highlighted--border-color--selected_hover': '--now-button-stateful--tertiary-selection_highlighted--border-color--selected',
            '--now-button-stateful--tertiary-selection_highlighted--border-color--selected_active': '--now-button-stateful--tertiary-selection_highlighted--border-color--selected',
            '--now-button-stateful--tertiary-selection_highlighted--color--selected': '--now-color_selection--primary-2',
            '--now-button-stateful--tertiary-selection_highlighted--color--selected_hover': '--now-button-stateful--tertiary-selection--color--selected_hover',
            '--now-button-stateful--tertiary-selection_highlighted--color--selected_active': '--now-button-stateful--tertiary-selection--color--selected_active',
            '--now-button-stateful--tertiary-selection_highlighted--background-color--selected': '--now-color_selection--primary-2',
            '--now-button-stateful--tertiary-selection_highlighted--background-color--selected_hover': '--now-button-stateful--tertiary-selection_highlighted--background-color--selected',
            '--now-button-stateful--tertiary-selection_highlighted--background-color--selected_active': '--now-button-stateful--tertiary-selection_highlighted--background-color--selected',
            '--now-button-stateful--tertiary-selection_high-contrast--color': '--now-color--neutral-15',
            '--now-button-stateful--tertiary-selection_high-contrast--color--hover': '--now-color_selection--primary-4',
            '--now-button-stateful--tertiary-selection_high-contrast--color--active': '--now-color_text--primary',
            '--now-button-stateful--tertiary-selection_high-contrast--color--selected': '--now-color_selection--primary-3',
            '--now-button-stateful--tertiary-selection_high-contrast--color--selected_hover': '--now-button-stateful--tertiary-selection_high-contrast--color--hover',
            '--now-button-stateful--tertiary-selection_high-contrast--color--selected_active': '--now-button-stateful--tertiary-selection_high-contrast--color--active',
            '--now-form-field_inset--color--invalid': '--now-color--neutral-18'
        }
    }
}

Constants.UPLOAD_FONTS = [{
        name: 'Lato',
        asset: 'c79c3863771220104fdc5ed999106188',
        properties: JSON.stringify({
                'font-style': 'normal',
                'font-weight': '600',
            },
            null,
            2
        ),
    },
    {
        name: 'Lato',
        asset: 'fcba856b771220104fdc5ed9991061af',
        properties: JSON.stringify({
                'font-style': 'normal',
                'font-weight': 'bold',
            },
            null,
            2
        ),
    },
    {
        name: 'Lato',
        asset: 'bf5ac16b771220104fdc5ed999106179',
        properties: JSON.stringify({
                'font-style': 'normal',
                'font-weight': '300',
            },
            null,
            2
        ),
    },
    {
        name: 'Lato',
        asset: '79aa856b771220104fdc5ed9991061a5',
        properties: JSON.stringify({
                'font-style': 'normal',
                'font-weight': 'normal',
            },
            null,
            2
        ),
    },
    {
        name: 'Lato',
        asset: 'f19a856b771220104fdc5ed9991061aa',
        properties: JSON.stringify({
                'font-style': 'italic',
                'font-weight': '600',
            },
            null,
            2
        ),
    },
    {
        name: 'Lato',
        asset: 'a8ca096b771220104fdc5ed99910612b',
        properties: JSON.stringify({
                'font-style': 'italic',
                'font-weight': 'normal',
            },
            null,
            2
        ),
    },
    {
        name: 'Cabin',
        asset: '51962c066f133010d2a2f6f2335b36b8',
        properties: JSON.stringify({
                'font-style': 'normal',
                'font-weight': '400 700',
            },
            null,
            2
        ),
    },
    {
        name: 'Cabin',
        asset: '2aef8f226f137010d2a2f6f2335b360f',
        properties: JSON.stringify({
                'font-style': 'italic',
                'font-weight': '400 700',
            },
            null,
            2
        ),
    },
    {
        name: 'Source sans pro',
        asset: 'b4932c71c7102010d447c17cf4c26086',
        properties: JSON.stringify({
                'font-style': 'italic',
                'font-weight': '700',
            },
            null,
            2
        ),
    },
    {
        name: 'Source sans pro',
        asset: 'b0c2a871c7102010d447c17cf4c260a3',
        properties: JSON.stringify({
                'font-style': 'normal',
                'font-weight': '700',
            },
            null,
            2
        ),
    },
    {
        name: 'Source sans pro',
        asset: '7382e471c7102010d447c17cf4c260b2',
        properties: JSON.stringify({
                'font-style': 'italic',
                'font-weight': '600',
            },
            null,
            2
        ),
    },
    {
        name: 'Source sans pro',
        asset: 'eab360b1c7102010d447c17cf4c2603f',
        properties: JSON.stringify({
                'font-style': 'italic',
                'font-weight': '400',
            },
            null,
            2
        ),
    },
    {
        name: 'Source sans pro',
        asset: 'f434a4b1c7102010d447c17cf4c26030',
        properties: JSON.stringify({
                'font-style': 'normal',
                'font-weight': '400',
            },
            null,
            2
        ),
    },
    {
        name: 'Source sans pro',
        asset: '5872a471c7102010d447c17cf4c2604b',
        properties: JSON.stringify({
                'font-style': 'normal',
                'font-weight': '600',
            },
            null,
            2
        ),
    },
    {
        name: 'Open Sans',
        asset: '68f8ed5853546010b846ddeeff7b127c',
        properties: JSON.stringify({
                'font-style': 'normal',
                'font-weight': '400',
            },
            null,
            2
        ),
    },
    {
        name: 'Open Sans',
        asset: 'c69aa99853546010b846ddeeff7b1256',
        properties: JSON.stringify({
                'font-style': 'normal',
                'font-weight': '700',
            },
            null,
            2
        ),
    },
    {
        name: 'Open Sans',
        asset: 'f93a299853546010b846ddeeff7b12b5',
        properties: JSON.stringify({
                'font-style': 'normal',
                'font-weight': '600',
            },
            null,
            2
        ),
    },
];

Constants.INITIAL_VALUES_FOR_REF_ERROR_HOOKS = {
    "--now-form-control-input--primary--background-color": "--now-color_background--primary",
    "--now-form-control-input--primary--border-color": "--now-color_border--primary",
    "--now-form-control-input_inner-shadow--primary--color": "--now-color--neutral-18",
    "--now-form-control_value--primary--color": "--now-color_text--primary",
    "--now-form-control_value--placeholder--color": "--now-color_text--tertiary",
    "--now-form-control-input--primary--background-color--hover": "--now-color--primary-0",
    "--now-form-control-input--primary--border-color--hover": "--now-color--primary-1",
    "--now-form-control-input_inner-shadow--primary--color--hover": "--now-color--primary-3",
    "--now-form-control_value--placeholder--color--hover": "--now-form-control_value--placeholder--color",
    "--now-form-control-input--primary--background-color--readonly": "--now-color_background--tertiary",
    "--now-form-control-input--primary--background-color--invalid": "--now-form-control-input--primary--background-color",
    "--now-form-control-input--primary--border-color--invalid": "--now-color_alert--critical-2",
    "--now-form-control-input_inner-shadow--primary--color--invalid": "--now-form-control-input_inner-shadow--primary--color",
    "--now-form-control_value--color--invalid": "--now-color_text--primary",
    "--now-form-control-input--primary--background-color--invalid_hover": "--now-color_alert--critical-0",
    "--now-form-control-input--primary--border-color--invalid_hover": "--now-form-control-input--primary--border-color--invalid",
    "--now-form-control-input_inner-shadow--primary--color--invalid_hover": "--now-color_alert--critical-5",
    "--now-form-control-input--primary--border-radius": "4px",
    "--now-form-control-input--primary--border-width": "1px",
    "--now-form-control-input--background-color-alpha": "1",
    "--now-form-control-input_inner-shadow--color-alpha": "0.1",
    "--now-form-control-input--opacity--disabled": "--now-form-control--opacity--disabled"
}

Constants.prototype = {
    type: 'Constants'
};

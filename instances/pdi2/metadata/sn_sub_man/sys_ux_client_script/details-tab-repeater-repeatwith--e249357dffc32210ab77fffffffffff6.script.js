/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api
}) {
    /*
    This script will decide which tabs will be shown. If a tab should be shown it will
    be added to the dataArray which is uesd in the repeater. The order of the script
    relects the order of the 
    */
    
    const {
        productTypeValue,
        unconfirmed_user_flow_enabled,
        per_user_allocation_process_enabled,
        hasBundledItemsRecords,
        isMeterTypeCreator,
        hasCustomTablesRecords,
        hasSubscriptionLineItems,
        hasAssociatedRolesRecords,
        hasEntitlementsRecords,
        hasIHSpokeRecords,
        hasIHSpokeCallerSpokeRecords,
        hasIHProtocolRecords,
        hasSubscriptionUnitRatioRecords,
        hasWdfMeterRatioRecords,
        subscriptionIdForSubscribedGroupsAndUsers,
        ee_cpe_data_display_user_and_roles,
        ee_cpe_data_display_status
    } = api.state;

    const dataArray = [];
    const defaultOptions = {
        fixedFilter: "subscription=" + subscriptionIdForSubscribedGroupsAndUsers,
        usePlainTextReference: false,
        hideOptionToPersonalizeColumns: false,
        disallowSelectingRecords: false,
        hideOptionToSelectAll: false,
        hideSelectionIfUnavailable: true,
        hideQuickEdit: true,
        hideLastRefresh: true,
        hideListActions: true,
        hideOptionToRefresh: true,
        hideOptionToSaveAs: false,
        hideOptionToCopyURL: true,
        hideMenuButton: true,
        collapseListMenuIcon: true,
        hideInlineEditing: false,
        hideDragAndDrop: true,
        includeInLandmarkKeyboardShortcut: true
    };


    if (productTypeValue === '0' && per_user_allocation_process_enabled) {
        const domainSeparated = api.data.subscribed_user_columns_domain_separated_check_1.output;

        dataArray.push({ ...defaultOptions,
            label: "Subscribed groups",
            table: "sn_sub_man_st_subscribed_groups",
            columns: "group,description,user_count,active_users_count,type,manager",
            usePlainTextReference: true,
            hideListActions: false,
            hideInlineEditing: true

        }, {
            ...defaultOptions,
            label: "Subscribed users",
            table: "user_has_subscription",
            columns: domainSeparated === true ?
                "user,user.user_name,user.sys_domain,user.cost_center,sys_updated_on,sys_updated_by,user.last_login_time" :
                "user,user.user_name,user.cost_center,sys_updated_on,sys_updated_by,user.last_login_time",
            fixedFilter: defaultOptions.fixedFilter + "^active=true^user.active=true^user.web_service_access_only=false^user.last_login_timeRELATIVEGT@dayofweek@ago@366^user.user_nameISNOTEMPTY",
            usePlainTextReference: true
        });
    }

    if ((productTypeValue === '0' && unconfirmed_user_flow_enabled)) {
        dataArray.push({
            ...defaultOptions,
            label: "Unconfirmed groups",
            table: "sn_sub_man_st_unconfirmed_user_group",
            columns: "group,user_count,active_users_count,manager",
            fixedFilter: defaultOptions.fixedFilter + "^ui_visible=true",
            usePlainTextReference: true,
            hideSelectionIfUnavailable: false,
            hideListActions: false
            
        }, {
            ...defaultOptions,
            label: "Unconfirmed users",
            table: "unconfirmed_user_role",
            columns: "user,user_name,unsubscribed_roles,user.last_login_time",
            fixedFilter: defaultOptions.fixedFilter + "^user.active=true^user.web_service_access_only=false^user.last_login_timeRELATIVEGT@dayofweek@ago@366^user.user_nameISNOTEMPTY",
            usePlainTextReference: true,
            hideOptionToSelectAll: true,
            hideOptionToSaveAs: true
        });
    }

    if (hasBundledItemsRecords) {
        const parentEntitlementId = api.data.sub_ent_record.result.entitlement_id.value;
        dataArray.push({
            ...defaultOptions,
            label: "Bundled items",
            table: "subscription_detail",
            columns: "subscription,subscription.meter_type,subscription.purchased_count,allocated_count,status",
            fixedFilter:"is_latest=true^subscription.parent_entitlement_id=" + parentEntitlementId + "^subscription.entitlement_type=1^subscription.meter_type!=assist^ORsubscription.meter_typeISEMPTY",
            usePlainTextReference: true,
        });
    }

    const customTablesData = {
        ...defaultOptions,
        label: "Custom tables",
        table: "ua_custom_table_inventory",
        columns: "table_name,table_ref.sys_scope,app_scope",
        fixedFilter: "subscription_entitlement=" + api.context.props.sysId,
        hideOptionToPersonalizeColumns: true,
        disallowSelectingRecords: true
    };

    if (productTypeValue === '0' || productTypeValue === '2') {
        // Show for Per-User or Unrestricted User
        dataArray.push(customTablesData);
    } else if (productTypeValue !== '5' && !isMeterTypeCreator && hasCustomTablesRecords) {
        // Show for all other product types when there are custom table records
        dataArray.push(customTablesData);
    }

    if (hasSubscriptionLineItems) {
        dataArray.push({
            ...defaultOptions,
            label: "Subscription line items",
            table: "subscription_entitlement_item",
            columns: "name,product_code,start_date,end_date,purchased_count",
            fixedFilter: "subscription_entitlement=" + api.context.props.sysId,
            hideLastRefresh: false,
            hideInlineEditing: true
        });
    }

    const columnSubscriptionFamily = 'subscription_family';
    const columnEntitledRoleTypes = 'entitled_role_types';
    const columnUnrestrictedRoleTypes = 'unrestricted_role_types';
    const columnInstallationStatus = 'installation_status';
    const columnActiveUsers = 'active_users';

    let subscriptionApplicationColumns = columnSubscriptionFamily;

    if (ee_cpe_data_display_user_and_roles)
        subscriptionApplicationColumns += ',' + columnActiveUsers + ',' + columnEntitledRoleTypes + ',' + columnUnrestrictedRoleTypes;

    if (ee_cpe_data_display_status)
        subscriptionApplicationColumns += ',' + columnInstallationStatus;

    dataArray.push({
        ...defaultOptions,
        label: "Subscription applications",
        table: "sn_entitlement_st_subscription_application_family",
        columns: subscriptionApplicationColumns,
        usePlainTextReference: !ee_cpe_data_display_user_and_roles && ee_cpe_data_display_status,
        hideLastRefresh: false
    });

    if (productTypeValue === '0' || (productTypeValue !== '5' && hasAssociatedRolesRecords)) {
        dataArray.push({
            ...defaultOptions,
            label: "Associated roles",
            table: "sn_sub_man_license_application_roles",
            columns: "sr_name,sr_application,sr_license_role_type,sr_category",
            fixedFilter: "saf_subscription.sys_id=" + api.context.props.sysId
        });
    }

    dataArray.push({
        ...defaultOptions,
        label: "Purchase history",
        table: "subscription_entitlement_audit_log",
        columns: "subscription.product_code,new_start_date,new_end_date,new_purchased_count"
    });

    if (productTypeValue !== '5' && hasEntitlementsRecords) {
        dataArray.push({
            ...defaultOptions,
            label: "Entitlements",
            table: "subscription_entitlement",
            columns: "fge_ids",
            fixedFilter: "fge_idsISNOTEMPTY^sys_id=" + api.context.props.sysId,
            hideLastRefresh: false
        });
    }

    const defaultSkuMetadataOptions = {
        table: "sku_metadata",
        columns: "subscription.name,schema.column_names,column_values",
        fixedFilter: "subscription.sys_id=" + api.context.props.sysId,
        hideLastRefresh: false,
        hideMenuButton: false
    };

    if (hasIHSpokeRecords) {
        dataArray.push({
            ...defaultOptions,
            ...defaultSkuMetadataOptions,
            label: "IH spoke",
            fixedFilter: defaultSkuMetadataOptions.fixedFilter + "^schema.type=ih_spoke"
        });
    }
    if (hasIHSpokeCallerSpokeRecords) {
        dataArray.push({
            ...defaultOptions,
            ...defaultSkuMetadataOptions,
            label: "IH spoke caller scope",
            fixedFilter: defaultSkuMetadataOptions.fixedFilter + "^schema.type=ih_spoke_caller_scope"
        });
    }
    if (hasIHProtocolRecords) {
        dataArray.push({
            ...defaultOptions,
            ...defaultSkuMetadataOptions,
            label: "IH protocol",
            fixedFilter: defaultSkuMetadataOptions.fixedFilter + "^schema.type=ih_protocol"
        });
    }
    if (hasSubscriptionUnitRatioRecords) {
        dataArray.push({
            ...defaultOptions,
            ...defaultSkuMetadataOptions,
            label: "Subcription unit ratio",
            fixedFilter: defaultSkuMetadataOptions.fixedFilter + "^schema.type=su_ratio"
        });
    }
    if (hasWdfMeterRatioRecords) {
        dataArray.push({
            ...defaultOptions,
            ...defaultSkuMetadataOptions,
            label: "Token ratio",
            fixedFilter: defaultSkuMetadataOptions.fixedFilter + "^schema.type=wdf_meter_ratio"
        });
    }

    return dataArray;
}

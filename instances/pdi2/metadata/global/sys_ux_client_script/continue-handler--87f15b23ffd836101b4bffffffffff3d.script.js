/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event}) {
    const selectedCard = event.payload.selectedCard;
    if (!selectedCard?.value) return;

    const typeCompat = String(event.payload.typeCompat).toLowerCase() === 'true';
    const {
        targetTableName,
        sys_class_name: cardClassName,
        versionId,
        qry,
        sysId,
        sc_catalogs: catalogs,
        sessionToken,
        isTwoStep
    } = selectedCard.value;
    const table = targetTableName || 'change_request';

    const referrer = api.context.props.referrer;
    const isRefList = api.context.props.isRefList;

    const queryMap = {
        std_change_record_producer: typeCompat
            ? `type=standard^std_change_producer_version=${versionId}`
            : `chg_model=e55d0bfec343101035ae3f52c1d3ae49^std_change_producer_version=${versionId}`,
        sn_sow_interceptor_record_type_selector: qry,
        chg_template: qry
    };

    const query = 
        queryMap[cardClassName] ||
        (sysId ? `chg_model=${sysId}` : '');

    let url = `${table}.do?sys_id=-1${query ? '&sysparm_query=' + query : ''}${referrer ? '&' + referrer : ''}`;
    if (cardClassName === 'std_change_record_producer' && isTwoStep === false)
        url = `std_change_processor.do?sysparm_action=execute_producer&sysparm_catalog=${catalogs}&sysparm_id=${sysId}&sysparm_ck=${sessionToken}${referrer ? '&' + referrer : ''}`;

    if (isRefList)
        api.emit('NAV_ITEM_SELECTED_RELAY_ace15ae7ff9436101b4bffffffffffea', {
            external: {
                target: '_self',
                url
            },
            fields: null,
            multiInstField: null,
            navigationOptions: null,
            params: null,
            passiveNavigation: null,
            redirect: true,
            route: null,
            targetRoute: null,
            title: null
        });
    else 
        api.emit('GLOBAL_NAVIGATION_REQUESTED', {
            fallbackRoute: {
                context: {
                    experienceName: 'Unified Navigation App',
                    path: 'now/nav/ui'
                },
                route: 'classic',
                params: {
                    target: url
                }
            }
        });
}

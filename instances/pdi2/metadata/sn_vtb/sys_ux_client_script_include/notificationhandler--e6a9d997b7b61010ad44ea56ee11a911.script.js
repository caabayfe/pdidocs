function include({imports}) {
      const {
        'sn_vtb.constants': constantsInclude
    } = imports;
    const {
        ACTIONS: {
            NOW_UXF_PAGE_SET_LOADING_STATE,
            NOW_UXF_PAGE_ADD_NOTIFICATIONS,
            NOW_UXF_PAGE_REMOVE_NOTIFICATIONS
        },
        STATUS: {
            INFO
        },
        ICONS: {
            CIRCLE_INFO_OUTLINE
        },
        LOADING_LABEL,
        LOADING_ID
    } = constantsInclude();

    const showAlert = ({
        emit: dispatch
    }, payload) => {
        const {
            idPrefix = "alert",
                action = {
                    "type": "dismiss"
                },
                content,
                expanded = false,
                header = "",
                icon = CIRCLE_INFO_OUTLINE,
                manageExpanded = false,
                status = INFO,
                textLinkProps
        } = payload;

        const id = idPrefix + Math.random();
        dispatch(NOW_UXF_PAGE_ADD_NOTIFICATIONS, {
            items: [{
                id,
                status,
                icon,
                header,
                content,
                textLinkProps,
                expanded,
                action
            }]
        });

        return id;
    };

    const dismissAlert = ({
        emit: dispatch
    }, id) => {
        dispatch(NOW_UXF_PAGE_REMOVE_NOTIFICATIONS, {
            items: [{
                id
            }]
        });
    };

    const showAlertAndInitiateDismiss = (api, payload, helpers) => {
        const {
            duration = 8000
        } = payload;
        const id = showAlert(api, payload);
        helpers.timing.setTimeout(() => {
            dismissAlert(api, id);
        }, duration);
    };

    const showLoader = ({
        emit: dispatch
    }) => {
        dispatch(NOW_UXF_PAGE_SET_LOADING_STATE, {
            id: LOADING_ID,
            loading: true,
            label: LOADING_LABEL
        });
    };

    const dismissLoader = ({
        emit: dispatch
    }) => {
        dispatch(NOW_UXF_PAGE_SET_LOADING_STATE, {
            id: LOADING_ID,
            loading: false
        });
    };

    return {
        showLoader,
        dismissLoader,
        showAlert,
        dismissAlert,
        showAlertAndInitiateDismiss
    };
}

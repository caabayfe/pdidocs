function handler({
    api,
    event,
    helpers,
    imports
}) {
    const toastMessage = () => {
        api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
            items: [{
                id: "alert5",
                status: "high",
                icon: "info-circle-outline",
                content: "You are not authorized to edit this template",
                action: {
                    type: "dismiss"
                }
            }]
        });
    }; 

    const setState = (api, templateId, templateNotSelectedValue, wizardIdValue) => {
        api.setState('selectedTemplateId', templateId);
        api.setState('templateNotSelected', templateNotSelectedValue);
        api.setState('wizardId', wizardIdValue);
    };

    const {
        snHttp,
        modal,
        screen
    } = helpers;
    const templateId = event.payload.row.sys_id.value;
    const mode = 'template';
    const checkEdit = true;
    const checkEditAccess = (wizardId, templateId) => {
        snHttp(`/api/sn_sc/v1/servicecatalog/record_id/${templateId}/wizard/${wizardId}?mode=${mode}&check_edit=${checkEdit}`, {
            method: 'GET',
            batch: true,
        }).then(({
            response
        }) => {
            if (response.result === true) {
                setState(api, templateId, false, wizardId);
                return;
            } else {
                toastMessage();
                setState(api, '', true, '');
            }
        }).catch(({
            error
        }) => {
            toastMessage();
            setState(api, '', true, '');
            return;
        });
    };

    snHttp(`/api/now/table/sc_template?sys_id=${templateId}&sysparm_fields=cat_item`, {
            method: 'GET',
            batch: true
        })
        .then(({
            response
        }) => {
            var wizardId = '';
            const crp = response.result[0].cat_item.value;
            if (crp == '91edb87273221010c84e2bb43cf6a7ae')
                wizardId = '38f351fe73221010c84e2bb43cf6a7ad';
            else if (crp == '3558cf50c7321010159ca1e603c2605b')
                wizardId = '89bf83d4c7321010159ca1e603c260cd';
            else {
                setState(api, templateId, true, '');
                return;
            }
            checkEditAccess(wizardId, templateId);
        })
        .catch(({
            error
        }) => {
            setState(api, templateId, true, '');
        });
}

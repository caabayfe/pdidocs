/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
    const teamEmail = api.item.value.email.value;
    return [{
        label: helpers.translateSync("Email"),
        value: {
            type: "text-link",
            value: teamEmail,
            label: teamEmail,
            showIcon: false,
            href: "mailto:" + teamEmail,
            underlined: false,
            opensWindow: false
        }
    }];
}

function handler({api, event, helpers, imports}) {
    var { modal } = helpers;
    api.setState('templateModalSelectedValue', 'STANDARD');
    modal.open("[component-id$='template_modal']");
}

function handler({api, event, helpers, imports}) {
    var { modal } = helpers;
    modal.close("[component-id$='checkout_modal']");
}

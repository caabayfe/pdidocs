(function runMailScript(current, template, email, email_action, event) {

    template.print(sn_i18n.Message.getMessage("global",
        "{html0}{incidentNumber} {html1}{html2}was recently assigned to you.{html3}", {
            incidentNumber: current.number,
            html0: '<div style="font-size: 16px;" ><span style="font-weight: 700; color: #181A1F;">',
            html1: '</span>',
            html2: '<span style="font-weight: 400;">',
            html3: '</span></div>'
        }));

})(current, template, email, email_action, event);

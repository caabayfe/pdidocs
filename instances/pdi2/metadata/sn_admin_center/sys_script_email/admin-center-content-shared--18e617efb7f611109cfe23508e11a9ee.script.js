(function runMailScript( /* GlideRecord */ current, /* TemplatePrinter */ template,
    /* Optional EmailOutbound */
    email, /* Optional GlideRecord */ email_action,
    /* Optional GlideRecord */
    event) {

    // emailBodyData = {userName, senderName, senderEmailAddress, sharedContent, optionalMessage}
    var emailBodyData = JSON.parse(event.parm2);
    if (emailBodyData.senderEmailAddress) {
      email.setFrom(emailBodyData.senderEmailAddress);
    }

    template.print('<style>#snc_notification_preference,#snc_notification_unsubscribe {font-family: var(--now-font-family, \'Source Sans Pro\');font-style:normal;font-size: var(--now-global-font-size--md, 16px);line-height: 20px;text-decoration-line: underline;color: rgb(var(--now-color--link-2, 60, 89, 231));      }      </style>');

    template.print('<div style="font-family: var(--now-font-family, \'Lato\');font-style: normal;font-size: var(--now-global-font-size--md, 16px);line-height: 19px;color: rgb(var(--now-color--neutral-21, 0, 0, 0));">');

    // Salutation
    template.print('<p>');
    template.print(gs.getMessage('Hey {0},', emailBodyData.userName));
    template.print('</p>');

    // Intro line
    template.print('<p style="font-style: normal;font-size: var(--now-global-font-size--lg, 20px);line-height: 27px;margin-bottom:0;">');
    template.print(gs.getMessage('<b>{0}</b> wants to share the following admin center content with you', emailBodyData.senderName));
    template.print('</p>');

    // Link shared
    template.print('<p style="margin-top: var(--now-global-space--sm, 0.5rem);">');
    template.print('<a style="font-family: var(--now-font-family, \'Source Sans Pro\');font-style: normal;font-size: var(--now-global-font-size--md, 16px);line-height: 20px;text-decoration-line: underline;color: rgb(var(--now-color--link-2, 60, 89, 231));" href=' + emailBodyData.sharedContent + '>' + emailBodyData.sharedContent + '</a>');
    template.print('</p>');

    // Custom message
    if (emailBodyData.optionalMessage) {
        template.print('<p style="font-style: normal;font-size: var(--now-global-font-size--md, 16px);line-height: 22px;">');
        template.print(gs.getMessage('<b>{0}</b> says, "{1}"', [emailBodyData.senderName, emailBodyData.optionalMessage]));
        template.print('</p>');
    }

    // Open button
    template.print('<p style="margin-top: var(--now-global-space--xxl, 2rem);">');
    template.print(gs.getMessage('<a style="padding: calc(6/16 * var(--now-global-space--lg, 1rem)) var(--now-global-space--lg, 16px) calc(7/16 * var(--now-global-space--lg, 1rem)); background: rgb(var(--now-color--primary-1, 79, 82, 189));border-radius: var(--now-global--border-radius--md, 4px);color: rgb(var(--now-color_background--primary, 255, 255, 255));text-decoration: none;" href={0}>Open</a>', emailBodyData.sharedContent));
    template.print('</p>');

    template.print('</div>');

})(current, template, email, email_action, event);

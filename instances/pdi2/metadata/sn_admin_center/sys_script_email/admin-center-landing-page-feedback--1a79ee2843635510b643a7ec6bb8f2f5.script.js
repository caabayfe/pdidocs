(function runMailScript( /* GlideRecord */ current, /* TemplatePrinter */ template,
    /* Optional EmailOutbound */
    email, /* Optional GlideRecord */ email_action,
    /* Optional GlideRecord */
    event) {

    var emailBodyData = JSON.parse(event.parm2);
    if (emailBodyData.senderEmailAddress)
        email.setFrom(emailBodyData.senderEmailAddress);

    template.print('<style>#snc_notification_preference,#snc_notification_unsubscribe {font-family: \'Source Sans Pro\';font-style:normal;font-weight: 400;font-size: 16px;line-height: 20px;text-decoration-line: underline;color: rgb(var(--now-color--primary-1, #4F52BD));      }      </style>');
    template.print('<div style="font-family: \'Lato\';font-style: normal;font-weight: 400;font-size: 16px;line-height: 19px;color: rgb(var(--now-color--neutral-21, 0, 0, 0));">');

    // Salutation
    template.print(gs.getMessage('<p>Hello {0}!</p>', emailBodyData.userName));

    // Star rating
    template.print('<p style="margin-top: 0.5rem;font-family: \'Source Sans Pro\';font-style: normal;font-weight: 400;font-size: 16px;line-height: 20px;"><b>Star ratings: </b>' + emailBodyData.sharedContent + '</p>');

    // Custom message
    template.print(gs.getMessage('<p style="font-style: normal;font-size: 16px;line-height: 22px;"><b>Tell us more: </b>{0}</p>', emailBodyData.optionalMessage));

    // Can contact customer for follow-up (legal requirement)
    template.print(gs.getMessage('<p style="font-style: normal;font-size: 16px;line-height: 22px;"><b>Can contact customer for follow-up?: </b>{0}</p>', emailBodyData.contactPermission));

})(current, template, email, email_action, event);

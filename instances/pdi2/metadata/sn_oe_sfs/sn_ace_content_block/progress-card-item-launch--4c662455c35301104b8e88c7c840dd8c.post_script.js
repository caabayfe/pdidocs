(function(context) {
    var status = new sn_oe_sfs.CIUtil().getChecklistCardItemStatus(context.children);
    if (status && status.badge_color && status.badge_label) {
        context.badgeLabel = status.badge_label;
        context.badgeColor = status.badge_color;
    }
    var propsFromContext = new sn_oe_sfs.CIUtil().getContentBlockContext(context.block_id);
    context.props_details.status = propsFromContext.status || 'start';
    context.children = new sn_oe_sfs.CIUtil().sortChecklistCardItems(context.children);
})(context);

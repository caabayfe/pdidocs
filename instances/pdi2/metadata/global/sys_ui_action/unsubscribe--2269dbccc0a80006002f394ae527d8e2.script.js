action.setRedirectURL(current);
new SubscriptionUtil().unsubscribe(current);
gs.addInfoMessage(gs.getMessage('No longer subscribed to notifications on {0}', [GlideStringUtil.escapeHTML(current.name)]));

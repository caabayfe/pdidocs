function script({
    api,
    event: {
        payload: {
            sysId,
            replyType,
            replyId
        }
    },
    helpers
}) {
    helpers.navigate.setRouteParams({'params': {'draftId':  sysId, 'replyType': replyType,
            'replyId': replyId
}}); 
}

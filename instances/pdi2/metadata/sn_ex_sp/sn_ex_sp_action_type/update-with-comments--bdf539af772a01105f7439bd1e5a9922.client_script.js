var comment = "";
var title = "${reject_request_heading}";
var message = "${Provide a reason for rejecting this request}";
var primaryButtonLabel = "${Reject}";
if (action === 'approve') {
    title = "${Approve request}";
    message = "${Provide a reason for approving this request}";
    primaryButtonLabel = "${Approve}";
}
var answer = spModal.open({
    title: title,
    label: title,
    message: message,
    input: true,
    value: comment,
    buttons: [{
            label: "${Cancel}",
            cancel: true
        },
        {
            label: primaryButtonLabel,
            primary: true
        }
    ]
});

answer.then(function(confirm) {
    if (!confirm.cancel) {
        if (isEsignatureEnabled == "false") {
            $rootScope.$broadcast(broadcastEventName, null);
            var payload = {};
            payload.name = "SC_APPROVER_ACTION";
            payload.data = {};
            payload.data["isEscPortal"] = $scope.data.portalSysId === '70cd9f3b734b13001fdae9c54cf6a72f';
            payload.data["portalSuffix"] = $scope.data.portalSuffix;
            payload.data["Number"] = number;
            payload.data["Action"] = action;
            snAnalytics.addEvent(payload);
        }
    }
});

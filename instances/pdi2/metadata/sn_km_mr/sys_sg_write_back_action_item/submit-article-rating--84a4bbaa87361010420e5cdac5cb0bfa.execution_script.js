(function WriteBackAction(input) {
    var kbViewModel = new global.KBViewModel();
    var result = kbViewModel.createOrUpdateLastFeedback('rating', input.rating, input.sys_id);

    if (result.noAction)
        return;

    if (result.success)
        gs.addInfoMessage(result.message);
    else
        gs.addErrorMessage(result.message);
})(input);

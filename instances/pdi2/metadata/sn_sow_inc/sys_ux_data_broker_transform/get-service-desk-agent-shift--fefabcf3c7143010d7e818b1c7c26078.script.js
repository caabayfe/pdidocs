function transform(input) {
    var userId = gs.nil(input.user_id) ? gs.getUserID() : input.user_id;
    var serviceDeskAgentShift = new SOWServiceDeskAgentShift();
    var outputFormat = gs.nil(input.output_format) ? serviceDeskAgentShift.FORMAT.SERVICE_DESK_HEADER : input.output_format;
    return serviceDeskAgentShift.getUpcomingShift(userId, outputFormat, input.wfo_shift, input.on_call_shift);
}

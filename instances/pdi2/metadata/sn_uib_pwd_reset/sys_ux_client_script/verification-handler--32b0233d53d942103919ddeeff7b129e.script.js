/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const currRequestDetail = event.payload.requestDetail ? event.payload.requestDetail : {};
    api.setState("currVerificationErrorMessagePrefix", event.payload.errorMessagePrefix);
    let allRequestDetails = {...api.state.allRequestDetails, ...currRequestDetail};
    api.setState("allRequestDetails", allRequestDetails);
    /* Here currVerificationIndex is tightly coupled with verificationDetails array length.
    Since we will trigger this script from verification pages and the verification page route will be dependent upon the currVerification Index only, hence verification detail 
    array always has some item at currIndex.*/
    const currVerificationDetail = api.state.verificationDetails[api.state.currVerificationIndex];
    api.data.pwd_reset_verify_user_input.execute({
        reqDetail: currRequestDetail,
        token: api.state.token,
        verificationId: currVerificationDetail.verificationId
    });
}

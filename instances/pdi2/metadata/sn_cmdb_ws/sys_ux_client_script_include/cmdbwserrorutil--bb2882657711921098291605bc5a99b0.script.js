function include({imports}) {
   const parseErrorString = async (errStr, eventContext) => {
        const {
            helpers
        } = eventContext;
        const erroObjRegEx = /{(?:[^{}]|{[^{}]*})*}/;
        const errObj = errStr.match(erroObjRegEx)?.[0];
        if (errObj) {
            try {
                return JSON.parse(errObj);
            } catch (e) {
                return {
                    CODE: 'JSON_PARSE_EXCEPTION',
                    MSG: await helpers.translate("Something went wrong. Please try again later."),
                    DETAIL: e.message
                }
            }
        } else {
                return {
                    CODE: 'UNKNOWN_EXCEPTION',
                    MSG: await helpers.translate("Something went wrong. Please try again later."),
                    DETAIL: errStr
                }
       }
    }

    const parseErrorFromEvent = (eventContext) => {
        const {
            event
        } = eventContext;
        const errorStr = event.payload.errors?.[0] || "";
        return parseErrorString(errorStr, eventContext);
    }

    const dispatchAndLogError = async (errorStr, context) => {
        const {
            helpers, 
            api
        } = context;
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                status: 'critical',
                icon: 'triangle-exclamation-outline',
                header: await helpers.translate('Error'),
                content: errorStr.MSG,
                action: {
                    type: 'dismiss'
                }
            }]
        });
        console.error("Code: " + errorStr.CODE + " Source if defined: " + errorStr.SOURCE + " Details: " + errorStr.DETAILS);
    }

   return {
        parseErrorString,
        parseErrorFromEvent,
        dispatchAndLogError
    }
}

var PwdAjaxVerifyIdentity = Class.create();

PwdAjaxVerifyIdentity.prototype = Object.extendsObject(PwdAjaxRequestProcessor, {

    identifyBL: new PwdIdentifyStageBL(),
    pwdIdentifyHandler: new global.PwdIdentifyStageHandler(),

    isPublic: function() {
        return true;
    },

    /************
     * Server side Ajax processor for checking the identity of a user.
     *
     * Required Request Parameters:
     *  @sysparm_process_id - the password reset process-ID.
     *  @sysparm_captcha    - the captcha that the user entered or whatever ReCaptcha gives us.
     *
     * Return value:
     * "200"  - If user exists & is enrolled for the process.
     * "500"  - If, for any reason, does not exist or enrolled for the process.
     * "bad captcha" - The user submitted captcha was invalid.
     ***********/
    /* eslint-disable consistent-return */
    verifyIdentity: function() {
        // check the security before anything else. If any violation is found, then just return.
        if (!this._validateSecurity()) {
            return;
        }

        // Retrieve input params from form fields:
        /* eslint-disable no-undef */
        var sysparm_process_id = request.getParameter("sysparm_process_id");
        var sysparm_captcha = request.getParameter("sysparm_captcha");

        //Only self-service pwd request process will call this ajax req, and all self-service pwd reset process have public access
        //if the public access is false for the sys param process id, looks as a attempt to get other's password.
        var proc = new GlideRecord('pwd_process');
        proc.get(sysparm_process_id);
        if ('false' == proc.getDisplayValue('public_access'))
            return '500';


        var idenObjs = [];

        // Adding the below for PRWA backward compatibility
        if (!gs.nil(request.getParameter('sysparm_user_id'))) {

            var idenUserId = request.getParameter('sysparm_user_id').trim();
            var idenProcessorId = "default";

            // Get the processor Id
            var procGr = new GlideRecord('pwd_process');
            procGr.get(sysparm_process_id);
            var idenSysIds = procGr.getValue('identification_type');

            var idenGr = new GlideRecord('pwd_identification_type');
            idenGr.addQuery('sys_id', 'IN', idenSysIds);
            idenGr.query();
            if (idenGr.getRowCount() > 0) {
                idenGr.next();
                idenProcessorId = idenGr.getValue('identification_processor');
            }

            idenObjs.push({
                user_input: idenUserId,
                processor_id: idenProcessorId
            });
        } else {
            var idenLen = parseInt(request.getParameter("sysparm_identification_number"));
            for (var i = 0; i < idenLen; i++) {
                idenObjs.push({
                    user_input: request.getParameter('sysparm_user_id_' + i).trim(),
                    processor_id: request.getParameter('sysparm_processor_id_' + i)
                });
            }
        }
        var pwdResetRespUtilityObj = this.pwdIdentifyHandler.verifyIdentityForSelfService(sysparm_process_id, idenObjs, sysparm_captcha, this.request);
        return pwdResetRespUtilityObj.getStatusCode();
    },

    type: 'PwdAjaxVerifyIdentity'
});

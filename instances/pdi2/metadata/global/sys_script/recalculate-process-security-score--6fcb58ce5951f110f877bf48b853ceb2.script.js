(function executeRule(current, previous /*null when async*/ ) {
        var processStrength = new global.PwdProcessStrengthCalculatorUtil().getProcessStrength(current.process);

        var gr = new GlideRecord("pwd_process");
        gr.get(current.process);

        if (processStrength)
            gr.setValue("security_score", JSON.parse(processStrength).securityScore);
        else
            gr.setValue("security_score", '');

        gr.update();
    })(current, previous);

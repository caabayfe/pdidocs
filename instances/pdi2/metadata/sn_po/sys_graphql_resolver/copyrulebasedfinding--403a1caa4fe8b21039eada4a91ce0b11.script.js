
      
            (function process( /*ResolverEnvironment*/ env) {

                var sysId = env.getArguments()['sysId'];

                return new sn_po.ProminFindingsDefUtil().copyRuleBasedFinding(sysId);

            })(env);

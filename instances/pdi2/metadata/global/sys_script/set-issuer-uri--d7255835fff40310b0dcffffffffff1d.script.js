 (function executeRule(current, previous /*null when async*/) {

      // Validation is handled by UI actions on the UI16 form and by Data Broker for the new Inbound Integrations UI.
      // Sets issuer_uri, using cached OIDC metadata when the lifespan is still valid to avoid a network call.

      var oidcUrl = current.getValue('oidc_url');
      var lifeSpan = parseInt(current.getValue('oidc_config_cache_life_span'), 10) || 120;
      var tester = new SNC.OIDCProviderTester();
      tester.setGenerateErrorInSession(false);
      var issuer = tester.getIssuer(oidcUrl, lifeSpan, false);
      if (issuer)
          current.setValue('issuer_uri', issuer);
  })(current, previous);

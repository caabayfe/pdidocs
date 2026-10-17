
        var ClothoAliasBinder = Class.create();
        ClothoAliasBinder.prototype = {
            initialize: function () {
            },

            METRICBASE_SERVICE_SYS_ID: "21785bc1c3231010d6b5cc8f5e40dd50",
            CLOTHO_ALIAS: "metricbase_clotho_credentials",
            RAPTOR_ALIAS: "metricbase_raptor_credentials",
            RAPTOR_BASIC_AUTH: "metricbase.raptor.basic_auth",

            // Ensure sys_alias exists and return it
            _ensureAlias: function (aliasName) {
                var alias = new GlideRecord("sys_alias");
                var qc = alias.addQuery("name", aliasName);
                qc.addOrCondition("id", aliasName);
                alias.addQuery("type", "credential");
                alias.setLimit(1);
                alias.query();

                if (alias.next()) {
                    return alias;
                }

                alias.initialize();
                alias.setValue("name", aliasName);
                alias.setValue("id", aliasName);
                alias.setValue("type", "credential");
                alias.insert();
                gs.info(
                        "ClothoAliasBinder: created sys_alias " +
                        aliasName +
                        " (sys_id=" +
                        alias.getUniqueValue() +
                        ")",
                );
                return alias;
            },

            // Upsert a basic_auth_credentials record tagged to alias.sys_id (encrypted transplant)
            _upsertBasicCredForClothoAlias: function (username, encrypted) {
                var alias = this._ensureAlias(this.CLOTHO_ALIAS);
                var aliasId = alias.getUniqueValue();
                var cred = new GlideRecord("basic_auth_credentials");
                cred.addQuery("tag", aliasId);
                cred.setLimit(1);
                cred.query();
                if (cred.next()) {
                    cred.setValue("user_name", username);
                    cred.setValue("password", encrypted);
                    cred.setValue("type", "basic_auth");
                    cred.setValue("active", "true");
                    cred.update();
                    gs.info(
                            "ClothoAliasBinder: updated basic_auth_credentials for alias " +
                            this.CLOTHO_ALIAS,
                    );
                    return cred;
                }
                cred.initialize();
                cred.setValue("name", alias.getName() + " (auto)");
                cred.setValue("user_name", username);
                cred.setValue("password", encrypted);
                cred.setValue("tag", aliasId);
                cred.setValue("type", "basic_auth");
                cred.setValue("active", "true");
                cred.insert();
                gs.info(
                        "ClothoAliasBinder: created basic_auth_credentials for alias " +
                        alias.getName(),
                );
                return cred;
            },

            // Upsert a basic_auth_credentials record tagged to alias.sys_id (encrypted transplant)
            _upsertBasicCredForRaptorAlias: function () {
                var alias = this._ensureAlias(this.RAPTOR_ALIAS);
                var aliasId = alias.getUniqueValue();
                var cred = new GlideRecord("basic_auth_credentials");
                cred.addQuery("tag", aliasId);
                cred.setLimit(1);
                cred.query();

                if (cred.next()) {
                    // Verify that the alias is mapped to the Raptor basic auth credential.
                    var authName = cred.getValue("name");
                    if (authName !== this.RAPTOR_BASIC_AUTH) {
                        throw new Error(
                                "ClothoAliasBinder: basic_auth_credentials for alias " +
                                this.RAPTOR_ALIAS +
                                " is mapped to unexpected basic auth credential " +
                                authName +
                                ", expected " +
                                this.RAPTOR_BASIC_AUTH,
                        );
                    }
                    return cred;
                }

                // Else, create a new basic auth credential tagged to the alias.
                cred = new GlideRecord("basic_auth_credentials");
                cred.addQuery("name", this.RAPTOR_BASIC_AUTH);
                cred.setLimit(1);
                cred.query();

                if (!cred.next()) {
                    // We need a Raptor basic_auth_credential for the Fenix job.
                    throw new Error(
                            "ClothoAliasBinder: missing basic_auth_credentials for credential " +
                            this.RAPTOR_BASIC_AUTH,
                    );
                }
                cred.setValue("tag", aliasId);
                cred.update("basic_auth_credentials for alias " + this.RAPTOR_ALIAS + " updated");
                return cred;
            },

            // Resolve the encrypted auth secret for writing into a password2 field.
            // Transplant encrypted bytes only; do not attempt decryption.
            _resolveEncryptedSecret: function (authGR) {
                function _len(v) {
                    return v === null || v === undefined ? "null" : String(v).length;
                }

                var encrypted = authGR.getValue("secret");
                gs.info(
                        "ClothoAliasBinder.secret: transplanting encrypted secret; length=" +
                        _len(encrypted),
                );
                if (encrypted === null || encrypted === undefined) {
                    throw new Error(
                            "ClothoAliasBinder: missing encrypted secret on sys_service_authentication " +
                            authGR.getUniqueValue(),
                    );
                }
                return encrypted;
            },

            // Sync from a specific endpoint record (sys_service_endpoint GR)
            syncByEndpoint: function (endpointGR) {
                var active = endpointGR.getValue("active");
                if (!(active == "1" || active == "true")) {
                    return false;
                }

                var authSysId = endpointGR.getValue("authentication");
                if (!authSysId) {
                    gs.warn(
                            "ClothoAliasBinder: endpoint has no authentication; endpoint=" +
                            endpointGR.getUniqueValue(),
                    );
                    return false;
                }

                var auth = new GlideRecord("sys_service_authentication");
                if (!auth.get(authSysId)) {
                    gs.warn(
                            "ClothoAliasBinder: could not load sys_service_authentication=" +
                            authSysId,
                    );
                    return false;
                }

                var username = auth.getValue("key") || "";
                var encrypted = this._resolveEncryptedSecret(auth);
                if (!username) {
                    throw new Error(
                            "ClothoAliasBinder: empty username for auth " + authSysId,
                    );
                }

                // Sync credentials for the Clotho alias.
                this._upsertBasicCredForClothoAlias(username, encrypted);
                return true;
            },

            // Seed/repair from current data (install/upgrade or manual repair)
            syncAll: function () {
                // Setup Raptor credentials.
                this._upsertBasicCredForRaptorAlias();

                var ep = new GlideRecord("sys_service_endpoint");
                ep.addQuery("service", this.METRICBASE_SERVICE_SYS_ID);
                ep.addQuery("active", true);
                ep.orderByDesc("sys_updated_on");
                ep.orderByDesc("sys_created_on");
                ep.query();

                var any = false;
                while (ep.next()) {
                    if (this.syncByEndpoint(ep)) {
                        any = true;
                        break;
                    }
                }
                if (!any) {
                    // Ensure alias exists even if no endpoints yet, so credentials can be bound later
                    this._ensureAlias(this.CLOTHO_ALIAS);
                    gs.warn(
                            "ClothoAliasBinder: no active MetricBase endpoints with credentials found; alias ensured",
                    );
                }
            },

            type: "ClothoAliasBinder",
        };
        

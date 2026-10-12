var TriggerCertificateExpiryNotification = Class.create();
TriggerCertificateExpiryNotification.prototype = {
    initialize: function(gr) {
        if (gr != null && gr.getTableName() == "sys_certificate") {
			this.gr = gr;
		} else {
			throw new Error("Invalid GlideRecord Table");
        }
    },

    calculateCertificateNotificationFrequency: function() {
		// Only run if expiration notification is enabled.
		if (this.gr.expiration_notification != true) {
			gs.log("Skipping notification, expiration_notification is false for cert: " + this.gr.sys_id);
			return;
		}

		var daysToWarn = this.gr.warn_in_days_to_expire;

		if (gs.nil(daysToWarn)) {
			gs.log("Skipping notification, warn_in_days_to_expire is null for cert: " + this.gr.sys_id);
            return;
		}

		// This should have been calculated by the previous business rule.
		if (gs.nil(this.gr.expires_in_days)) {
			gs.warn("Skipping notification due to required fields missing on cert: " + this.gr.sys_id);
			return;
		}

        var expiresInDays;
        var notAfter;

        //Calculating expire in days for SAML Certs
        if (this.gr.type == "key_store" || this.gr.type == "pkcs12_key_store" || this.gr.type == "bcfks_key_store") {

            notAfter = SNC.SSOUtils.getSAMLKeyStoreCertificatesExpireDate(this.gr.sys_id);
			if (gs.nil(notAfter)) {
				gs.warn("Failed to obtain notAfter for keystore cert: " + this.gr.sys_id);
				return;
			}

            var now = new GlideDateTime();
            expiresInDays = GlideDateTime.subtract(now, new GlideDateTime(notAfter)).getRoundedDayPart();
        } else {
            // Set expire in days from the expire in days field from the certifcate record for non SAML certs
            expiresInDays = this.gr.expires_in_days;
        }

		if (expiresInDays <= 0) {
			gs.eventQueue("certificate.expired", this.gr, expiresInDays, daysToWarn);
			gs.log('TriggerCertificateExpiryNotification - certificate.expired event queued for: ' + this.gr.sys_id);
		}
        //If the expire date is within the warning window set
        else if (expiresInDays <= daysToWarn) {
            //if frequency is one-time, we trigger a notification once as we enter the warning window
            if (this.gr.frequency == "one-time" && expiresInDays == daysToWarn) {
                gs.eventQueue("certificate.expiring", this.gr, expiresInDays, daysToWarn);
            }
            //if frequency is monthly, we set notification to trigger every 30 days
            else if (this.gr.frequency == "monthly" && expiresInDays % 30 == 0) {
                gs.eventQueue("certificate.expiring", this.gr, expiresInDays, daysToWarn);
            }
            //if frequency is weekly, we set notification to trigger every 7 days
            else if (this.gr.frequency == "weekly" && expiresInDays % 7 == 0) {
                gs.eventQueue("certificate.expiring", this.gr, expiresInDays, daysToWarn);
            }
            //if frequency is daily or none(default), we set notification to trigger every day until expiry
            else if (this.gr.frequency == "daily" || this.gr.frequency == null) {
                gs.eventQueue("certificate.expiring", this.gr, expiresInDays, daysToWarn);
            }

			gs.log('TriggerCertificateExpiryNotification - certificate.expiring event queued for: ' + this.gr.sys_id);
        }
    },
    type: 'TriggerCertificateExpiryNotification'
};

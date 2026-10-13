// return false if source incident is inactive
answer = !(current && current.incident_alert && current.incident_alert.source_incident && !current.incident_alert.source_incident.active);

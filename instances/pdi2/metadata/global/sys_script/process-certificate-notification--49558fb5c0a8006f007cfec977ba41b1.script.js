if (current != null && current.getRecordClassName() == "sys_certificate") {
    new TriggerCertificateExpiryNotification(current).calculateCertificateNotificationFrequency();
}

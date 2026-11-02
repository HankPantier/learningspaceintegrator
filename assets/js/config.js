/*
 * HubSpot connection settings — the only file to edit for forms and tracking.
 * Account 47886190. While a formGuid is empty, that form runs in PREVIEW MODE:
 * it validates and continues without sending data anywhere.
 * Each form sends only the fields present in its HTML; they must exist on the
 * HubSpot form (see README).
 */
window.LSI_CONFIG = {
  hubspot: {
    portalId: "47886190",                                     // HubSpot account ID
    toolkitFormGuid: "d10faa3f-1a0f-47f1-82fa-f6ccc3bfb7e4",  // toolkit download form
    contactFormGuid: "",                                      // "Find an LSI" contact form (not created yet)
    subscriptionTypeId: null,                                 // optional consent subscription type ID
    loadTracking: true                                        // inject the HubSpot tracking code on every page
  },
  // Where visitors go after requesting the toolkit
  toolkitThankYouPage: "toolkit-downloads.html"
};

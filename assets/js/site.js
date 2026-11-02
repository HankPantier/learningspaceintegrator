(function () {
  "use strict";
  var CFG = window.LSI_CONFIG || { hubspot: {} };
  var ACCESS_KEY = "lsi_toolkit_access";

  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  // HubSpot tracking code (loaded only when an account ID is configured)
  if (CFG.hubspot && CFG.hubspot.portalId && CFG.hubspot.loadTracking !== false && !document.getElementById("hs-script-loader")) {
    var hs = document.createElement("script");
    hs.id = "hs-script-loader"; hs.async = true; hs.defer = true;
    hs.src = "https://js.hs-scripts.com/" + CFG.hubspot.portalId + ".js";
    document.head.appendChild(hs);
  }

  // Mobile menu
  var btn = document.querySelector(".menu-btn"), nav = document.getElementById("site-nav");
  if (btn && nav) {
    btn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // Footer year
  var yr = document.querySelector("[data-year]");
  if (yr) yr.textContent = new Date().getFullYear();

  // ---------- Forms ----------
  function cookie(name) {
    var m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
    return m ? decodeURIComponent(m[1]) : undefined;
  }

  function validate(form) {
    var ok = true, first = null;
    form.querySelectorAll("[required]").forEach(function (el) {
      var field = el.closest(".field") || el.closest(".check");
      var valid = el.type === "checkbox" ? el.checked : el.value.trim() !== "" && (el.type !== "email" || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(el.value.trim()));
      if (field) field.classList.toggle("invalid", !valid);
      el.setAttribute("aria-invalid", valid ? "false" : "true");
      if (!valid) { ok = false; if (!first) first = el; }
    });
    if (first) first.focus();
    return ok;
  }

  function submitToHubSpot(form, guid) {
    var portal = CFG.hubspot && CFG.hubspot.portalId;
    if (!guid || !portal) {
      console.info("[LSI] Preview mode: form not connected to HubSpot yet (see assets/js/config.js).");
      return Promise.resolve({ preview: true });
    }
    var fields = [];
    new FormData(form).forEach(function (value, name) {
      if (name.indexOf("_") === 0 || name === "website") return; // internal / honeypot
      if (typeof value === "string" && value.trim() !== "") fields.push({ objectTypeId: "0-1", name: name, value: value.trim() });
    });
    var consent = form.querySelector("[name=_consent]");
    var body = {
      fields: fields,
      context: { hutk: cookie("hubspotutk"), pageUri: location.href, pageName: document.title },
    };
    if (consent) {
      body.legalConsentOptions = { consent: { consentToProcess: true, text: "I agree to allow learningspaceintegrator.com to store and process my personal data.",
        communications: [{ value: !!consent.checked, subscriptionTypeId: 999, text: consent.parentNode.textContent.trim() }] } };
      // subscriptionTypeId must match a HubSpot subscription type ID — see README. Remove legalConsentOptions if not using GDPR settings.
      if (!CFG.hubspot.subscriptionTypeId) delete body.legalConsentOptions;
      else body.legalConsentOptions.consent.communications[0].subscriptionTypeId = CFG.hubspot.subscriptionTypeId;
    }
    return fetch("https://api.hsforms.com/submissions/v3/integration/submit/" + portal + "/" + guid, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body)
    }).then(function (r) {
      if (!r.ok) return r.json().catch(function () { return {}; }).then(function (j) { throw new Error((j && j.message) || "HTTP " + r.status); });
      return r.json();
    });
  }

  function wire(form, guid, onSuccess) {
    var status = form.querySelector(".form-status"), submit = form.querySelector("[type=submit]");
    form.addEventListener("input", function (e) {
      var f = e.target.closest(".field"); if (f && f.classList.contains("invalid")) validate(form);
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form.website && form.website.value) return; // bot
      if (!validate(form)) { if (status) { status.className = "form-status error"; status.textContent = "Please complete the highlighted fields."; } return; }
      submit.disabled = true; var label = submit.textContent; submit.textContent = "Sending…";
      if (status) { status.className = "form-status"; status.textContent = ""; }
      submitToHubSpot(form, guid).then(function () {
        onSuccess(form);
      }).catch(function (err) {
        console.error("[LSI] Form error", err);
        if (status) { status.className = "form-status error"; status.textContent = "We couldn't submit the form. Check your connection and try again."; }
      }).finally(function () { submit.disabled = false; submit.textContent = label; });
    });
  }

  var toolkitForm = document.getElementById("toolkit-form");
  if (toolkitForm) {
    wire(toolkitForm, CFG.hubspot.toolkitFormGuid, function (form) {
      store(ACCESS_KEY, "1");
      try { sessionStorage.setItem("lsi_name", form.firstname.value.trim()); } catch (e) {}
      location.href = CFG.toolkitThankYouPage || "toolkit-downloads.html";
    });
  }

  var contactForm = document.getElementById("contact-form");
  if (contactForm) {
    wire(contactForm, CFG.hubspot.contactFormGuid, function (form) {
      var done = document.getElementById("contact-done");
      form.hidden = true; if (done) { done.hidden = false; done.focus(); }
    });
  }

  // ---------- Downloads page (soft gate) ----------
  var gate = document.getElementById("dl-gate");
  if (gate) {
    var params = new URLSearchParams(location.search);
    if (params.get("access") === "email") store(ACCESS_KEY, "1");
    var granted = store(ACCESS_KEY) === "1";
    var storageWorks = (function () { try { localStorage.setItem("_t", "1"); localStorage.removeItem("_t"); return true; } catch (e) { return false; } })();
    if (!granted && storageWorks) {
      gate.hidden = false;
      document.getElementById("dl-content").hidden = true;
    }
    var nm = null; try { nm = sessionStorage.getItem("lsi_name"); } catch (e) {}
    var hello = document.getElementById("dl-hello");
    if (nm && hello) hello.textContent = "Thanks, " + nm + ". Your toolkit is ready.";
  }
})();

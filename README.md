# learningspaceintegrator.com

Static site for Learning Space Integrator. Plain HTML, one stylesheet, two small scripts, self-hosted fonts. No build step.

## Run it locally

```bash
npm run dev        # serves on http://localhost:4321
```

Any static server works (`python3 -m http.server`). Opening the HTML files directly also works, except for the 404 page, which uses root-absolute paths.

## Structure

```
index.html                 Home
what-is-an-lsi.html        Definition + FAQ (FAQPage schema)
why-it-matters.html
how-to-hire-an-lsi.html
toolkit.html               Toolkit landing + download form (HubSpot)
toolkit-downloads.html     Thank-you / downloads page (noindex)
find-an-lsi.html           Contact form (HubSpot)
privacy.html
404.html
assets/css/site.css        All styles; design tokens at the top (:root), light + dark
assets/js/config.js        HubSpot IDs (the only file to edit for forms)
assets/js/site.js          Mobile menu, form validation + HubSpot submit, toolkit gate
assets/fonts/              Fraunces, Public Sans, IBM Plex Mono (woff2, latin subset)
assets/img/toolkit/        Cover thumbnails rendered from page 1 of each toolkit PDF
downloads/lsi-toolkit/     Toolkit files
robots.txt, sitemap.xml, llms.txt, vercel.json
```

## Deploy (Vercel)

Import the repo in Vercel, framework preset **Other**, no build command, output directory `.` (root). `vercel.json` sets long caching on fonts, noindex on `/downloads/` and the thank-you page, and basic security headers. Point the `learningspaceintegrator.com` domain at the project.

## HubSpot

Account **47886190**. Settings live in `assets/js/config.js`.

- **Tracking code** loads on every page from `site.js` whenever `portalId` is set (`loadTracking: false` turns it off). Both forms carry `data-hs-do-not-collect="true"` so HubSpot's collected-forms script doesn't record each submission a second time.
- **Toolkit form** → HubSpot form `d10faa3f-1a0f-47f1-82fa-f6ccc3bfb7e4`. The site form sends exactly the fields on that HubSpot form: `firstname`, `lastname`, `email`, `phone`, `state`, `role`. Role option values must match the HubSpot `role` property values exactly (including `Superintendent/Duputy Superintendent`, as spelled in HubSpot).
  To collect more (organization, project timeline, budget), add the property to the HubSpot form first, then add the matching input to `toolkit.html`.
- **Contact form** ("Find an LSI") is still in preview mode. Create a HubSpot form with `firstname`, `lastname`, `email`, `company`, `state`, `message` and paste its GUID into `contactFormGuid`.
- **Consent (optional).** To record a marketing opt-in, add a checkbox named `_consent` back to the form and set `subscriptionTypeId`.

## Before launch

- [ ] **Word/Excel files.** The toolkit ZIP (v2) contains the four PDFs only. Several pages still promise editable Word and Excel versions (home, toolkit, how-to-hire, FAQ). Either add the files to `downloads/lsi-toolkit/` and re-link them on `toolkit-downloads.html`, or remove that copy.
- [ ] Do a real test submission of the toolkit form and confirm the contact appears in HubSpot
- [ ] Contact form GUID (above)
- [ ] Review the privacy policy with the client (it names HubSpot as the processor)
- [ ] Submit `sitemap.xml` in Google Search Console and Bing Webmaster Tools
- [ ] Bump `<lastmod>` in `sitemap.xml` when pages change

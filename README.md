# Pro Solar — Clean Energy For All

Static marketing website for **Pro Solar**, a solar energy and energy storage company serving
residential, commercial and industrial customers in Pakistan.

Live site: <https://prosolar.pk>

## Purpose

The site publishes Pro Solar's solar and energy storage offering, converts visitors into leads through a
free Solar Load Calculator and a free assessment form, and routes enquiries to the right contact channel
(phone, WhatsApp, email) or to the ProCare after-sales helpline.

## Tech Stack

The site is intentionally plain static HTML so it can be deployed to GitHub Pages or any static host with
no build step and no server-side runtime.

* Pages: HTML5
* Styling: Bootstrap 5 (vendored) plus a custom brand stylesheet
* Behaviour: jQuery, Bootstrap bundle, WOW.js, CounterUp, Owl Carousel, Isotope, Lightbox (all vendored)
* Custom JavaScript: `js/calculator.js`, `js/enquiry-form.js`, `js/main.js`

## Getting Started

No install or build is required. Serve the folder over HTTP so that the scripts and assets load:

```sh
cd artificia
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Project Structure

```text
.
├── index.html              Home
├── about.html              About Pro Solar
├── solutions.html          On-Grid, Hybrid, Off-Grid, Energy Storage (BESS)
├── industries.html         Residential, Commercial, Industrial
├── services.html           Services / EPC, maintenance, warranty
├── projects.html           Projects / portfolio
├── why-pro-solar.html      Why Choose Pro Solar
├── reviews.html            Reviews / testimonials + Google Reviews
├── calculator.html         Solar Load Calculator (lead generation)
├── contact.html            Contact details and assessment form
├── privacy-policy.html     Privacy policy
├── terms.html              Terms and conditions
├── 404.html                Not found page
├── css/
│   ├── bootstrap.min.css   Bootstrap 5
│   └── style.css           Pro Solar brand stylesheet
├── js/
│   ├── main.js             Nav, animations, counters, form prefill
│   ├── calculator.js       Solar Load Calculator engine
│   └── enquiry-form.js     Turns form submissions into WhatsApp / email messages
├── img/                    Logo, favicon and site imagery
├── lib/                    Vendored third-party libraries
├── scss/                   Bootstrap SCSS source (vendored)
├── CNAME                   Custom domain for GitHub Pages
├── robots.txt
└── sitemap.xml
```

## Brand

| Role | Colour | Value |
| --- | --- | --- |
| Primary (dominant) | Deep Navy | `#071B3A` |
| Secondary | Navy | `#0D2A52` |
| Brand accent | Solar Yellow | `#F5C400` |
| Background | Light Grey | `#F5F7FA` |
| Text | Text | `#172033` |
| Light accent | Light Accent | `#EAF0F7` |

Deep Navy dominates the layout. Solar Yellow is used only for calls to action, statistics, icon accents and
other highlight elements. The palette is defined once at the top of `css/style.css` as CSS custom
properties, so a brand change only requires editing that block.

The original Pro Solar logo is used unmodified as `img/logo.png` and must not be recoloured, redrawn or
stretched. `img/logo-192.png`, `img/logo-512.png` and `img/favicon.ico` are straight scaled crops of that
same logo for icon use.

Two identities are kept visually distinct:

* **Pro Solar** — the solar energy and energy storage brand.
* **ProCare** — the customer care and after-sales support service, shown with the yellow `procare-badge`
  treatment and its own helpline block.

## Contact Details Used Across The Site

| Channel | Value |
| --- | --- |
| General email | hello@prosolar.pk |
| Support email | support@prosolar.pk |
| Official number | 0340 6004288 |
| ProCare helpline | 0340 6004288 |
| WhatsApp | +92 340 6004288 |
| Google Review | <https://g.page/r/CaVTTchqi4fREAE/review> |
| Facebook | <https://www.facebook.com/prosolar.pk/> |
| Instagram | <https://www.instagram.com/pro_solar.pk/> |
| TikTok | <https://www.tiktok.com/@pro_solar.pk/> |

To change any of these, update the topbar, navbar, footer and contact page together — all pages share the
same header and footer markup.

## Solar Load Calculator

`js/calculator.js` runs entirely in the browser; nothing is sent to a server.

Inputs per appliance: power rating in watts, quantity and hours of use per day. A preset library covers fans,
tube lights, LED bulbs, LED TVs, refrigerators, washing machines, irons, split and inverter ACs, water pumps,
microwaves, computers, laptops and more, plus a **Custom Appliance / Equipment** option for anything else.

Outputs:

* Total connected load in watts and kilowatts
* Estimated daily, monthly and annual energy consumption in kWh
* Estimated solar system size in kWp, and the number of panels needed at the chosen module rating
* Optional battery storage capacity in kWh and power in kW, based on the selected backup window
* A single-phase or three-phase supply recommendation based on connected load

Peak sun hours, module wattage, battery inclusion, backup days and backup hours are all user-selectable so
the estimate can be adjusted to the site.

**Disclaimer shown on the page:** results are automated estimates for guidance, not a final engineering
design. Final sizing, protection, cable selection and battery specification must be confirmed by Pro Solar
after a technical and site assessment.

### Lead generation flow

1. The calculator writes its full summary to `sessionStorage` on every change.
2. Submitting the lead form validates name and mobile, rebuilds the summary including the visitor's details,
   and reveals WhatsApp and email actions.
3. Following WhatsApp or email hands the visitor off to `https://wa.me/923406004288` or a `mailto:` link with
   the whole summary pre-written.
4. On `index.html` and `contact.html`, if a summary exists in `sessionStorage` it is pre-filled into a
   read-only field on the assessment form, so nothing is lost when the visitor continues to the enquiry page.

## Forms

There is no backend. `js/enquiry-form.js` validates the form and composes the enquiry into a ready-made
WhatsApp message or email draft for the visitor to send. Each form declares its targets with data
attributes:

```html
<form data-enquiry-form
      data-success-target="#contact-success"
      data-whatsapp-target="#contact-whatsapp"
      data-email-target="#contact-email-link">
```

To switch to a real form endpoint, point the form's `action` at the service and remove the
`data-enquiry-form` attribute.

## SEO

Every page has a unique title, meta description, keywords, canonical URL and Open Graph tags. `CNAME` holds
the custom domain for GitHub Pages, and `robots.txt` plus `sitemap.xml` are included. The Google site
verification tag is present on every page.

## Local Development Notes

* There is no linter, bundler or package manager configured for this static site.
* `js/` files can be syntax-checked with `node --check js/<file>.js`.
* After editing `css/style.css`, confirm the brand block at the top still matches the palette table above.
* If the header or footer is changed on one page, mirror it on the rest so navigation stays consistent.

## Content Items Requiring Confirmation

The following were not confirmed by the company and are written as high-quality generic copy. Replace them
with approved content before the site is treated as final:

* Company founding date and exact office address (currently described only as Islamabad and Rawalpindi)
* Working hours (currently "Monday to Saturday — call for current availability")
* Named management or team members, designations and photographs (no team page is published)
* Awards and certifications (deliberately omitted, per the brief)
* Customer testimonial quotes (illustrative and attributed only by sector; verified feedback is routed to
  the Google Reviews link)
* Real project case studies with location, capacity and measured performance
* Warranty and after-sales terms (described in general terms; component warranty follows manufacturer terms
  stated in each written proposal)
* Final legal review of `privacy-policy.html` and `terms.html`

Confirmed and displayed figures are limited to the approved statistics: 350+ happy customers, 500+
projects delivered and 15+ expert workers.

## Licence

Based on the HTML Codex "Solartec" renewable energy template. See `LICENSE.txt` and `READ-ME.txt`. The
footer credit comment required by that template licence is preserved in the footer of every page.
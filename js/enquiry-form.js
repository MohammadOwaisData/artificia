/**
 * Pro Solar - enquiry form handler
 *
 * Static site with no backend, so submitted enquiries are converted into a
 * ready-made WhatsApp message or email. Each form declares where the result
 * should be shown through data attributes.
 */

var ProSolarEnquiry = (function () {
    "use strict";

    var WHATSAPP_NUMBER = "923406004288";
    var GENERAL_EMAIL = "hello@prosolar.pk";

    function fieldLabel(field) {
        var label = field.closest(".col-12, .col-sm-6, .col-md-6, .col-lg-6");
        var text = "";

        if (label) {
            var labelElement = label.querySelector("label");
            if (labelElement) {
                text = labelElement.textContent.replace("*", "").trim();
            }
        }

        return text || field.name || "Details";
    }

    function buildMessage(form) {
        var lines = ["PRO SOLAR - WEBSITE ENQUIRY", "---------------------------"];
        var fields = form.querySelectorAll("input, select, textarea");
        var i;

        for (i = 0; i < fields.length; i++) {
            var field = fields[i];
            var value = (field.value || "").trim();

            if (field.type === "checkbox" || field.type === "radio" || value === "") {
                continue;
            }

            lines.push(fieldLabel(field) + ": " + value);
        }

        lines.push("");
        lines.push("Page: " + window.location.href);

        return lines.join("\n");
    }

    function initForm(form) {
        var success = document.querySelector(form.getAttribute("data-success-target"));
        var whatsappLink = document.querySelector(form.getAttribute("data-whatsapp-target"));
        var emailLink = document.querySelector(form.getAttribute("data-email-target"));
        var emailAddress = form.getAttribute("data-email") || GENERAL_EMAIL;

        form.addEventListener("submit", function (event) {
            event.preventDefault();

            if (!form.checkValidity()) {
                form.classList.add("was-validated");
                form.reportValidity();
                return;
            }

            var message = buildMessage(form);

            if (whatsappLink) {
                whatsappLink.href = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message);
            }

            if (emailLink) {
                emailLink.href = "mailto:" + emailAddress +
                    "?subject=" + encodeURIComponent("Website Enquiry - Pro Solar") +
                    "&body=" + encodeURIComponent(message);
            }

            if (success) {
                success.classList.remove("d-none");
                success.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        });
    }

    function init() {
        var forms = document.querySelectorAll("[data-enquiry-form]");
        Array.prototype.forEach.call(forms, initForm);
    }

    return { init: init };
})();

document.addEventListener("DOMContentLoaded", function () {
    ProSolarEnquiry.init();
});
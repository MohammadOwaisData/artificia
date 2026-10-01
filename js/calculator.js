/**
 * Pro Solar - Solar Load Calculator
 *
 * Estimates connected load, daily/monthly energy consumption, recommended
 * solar system capacity and optional battery storage from a list of
 * appliances. Results are indicative estimates only and are not a substitute
 * for a professional engineering design.
 */

var SolarLoadCalculator = (function () {
    "use strict";

    var PRO_SOLAR = {
        phoneDisplay: "0340 6004288",
        whatsapp: "923406004288",
        generalEmail: "hello@prosolar.pk",
        supportEmail: "support@prosolar.pk"
    };

    var CUSTOM = "custom";

    // Typical Pakistani household / commercial appliance ratings.
    var CATALOGUE = [
        { id: "ceiling-fan", label: "Ceiling Fan", watts: 75, hours: 8 },
        { id: "table-fan", label: "Table / Pedestal Fan", watts: 65, hours: 6 },
        { id: "tube-light", label: "Tube Light (Halogen / CFL)", watts: 40, hours: 5 },
        { id: "led-bulb", label: "LED Bulb", watts: 12, hours: 6 },
        { id: "led-tv", label: "LED TV", watts: 120, hours: 5 },
        { id: "refrigerator", label: "Refrigerator", watts: 250, hours: 10 },
        { id: "deep-freezer", label: "Deep Freezer", watts: 350, hours: 9 },
        { id: "washing-machine", label: "Washing Machine", watts: 500, hours: 1 },
        { id: "iron", label: "Iron", watts: 1000, hours: .5 },
        { id: "split-ac", label: "Split AC (1 Ton, Non-Inverter)", watts: 1200, hours: 6 },
        { id: "inverter-ac", label: "Inverter AC (1.5 Ton)", watts: 900, hours: 6 },
        { id: "window-ac", label: "Window AC (1.5 Ton)", watts: 1500, hours: 5 },
        { id: "water-pump", label: "Water Pump (1 HP)", watts: 746, hours: 2 },
        { id: "deep-well-pump", label: "Borewell / Deep Well Pump", watts: 1500, hours: 3 },
        { id: "microwave", label: "Microwave Oven", watts: 800, hours: .5 },
        { id: "computer", label: "Desktop Computer", watts: 200, hours: 6 },
        { id: "laptop", label: "Laptop", watts: 65, hours: 6 },
        { id: "router-modem", label: "Router / Modem / Set-Top Box", watts: 25, hours: 24 },
        { id: "wifi-tv-setup", label: "Home Theatre / Audio System", watts: 150, hours: 3 },
        { id: "grooming-trimmer", label: "Grooming Trimmer / Hair Dryer", watts: 400, hours: .3 },
        { id: "sewing-machine", label: "Sewing Machine", watts: 120, hours: 2 },
        { id: "water-dispenser", label: "Water Dispenser (Instant Geyser)", watts: 2000, hours: 1 },
        { id: "ev-charger", label: "EV Charger (Home Wall Box)", watts: 3200, hours: 2 },
        { id: "commercial-lights", label: "Commercial Lighting Load (per fitting)", watts: 40, hours: 10 },
        { id: "refrigeration-unit", label: "Commercial Refrigeration Unit", watts: 900, hours: 12 },
        { id: "three-phase-motor", label: "Three-Phase Motor (per HP)", watts: 746, hours: 8 }
    ];

    var PRESETS = {
        household: [
            ["ceiling-fan", 4, 10],
            ["led-bulb", 10, 6],
            ["led-tv", 1, 5],
            ["refrigerator", 1, 10],
            ["split-ac", 2, 6],
            ["water-pump", 1, 2],
            ["laptop", 1, 4],
            ["router-modem", 1, 24]
        ],
        office: [
            ["led-bulb", 16, 9],
            ["computer", 8, 8],
            ["laptop", 4, 8],
            ["router-modem", 1, 24],
            ["inverter-ac", 3, 7],
            ["microwave", 1, .5],
            ["wifi-tv-setup", 1, 2]
        ]
    };

    var SYSTEM = {
        performanceRatio: 0.80,
        batteryDoD: 0.90,
        inverterEfficiency: 0.95,
        daysInMonth: 30.4,
        singlePhaseLimitKW: 10
    };

    var state = {
        rows: [],
        sequence: 0
    };

    var dom = {};

    function byId(id) {
        return document.getElementById(id);
    }

    function findAppliance(id) {
        for (var i = 0; i < CATALOGUE.length; i++) {
            if (CATALOGUE[i].id === id) {
                return CATALOGUE[i];
            }
        }
        return null;
    }

    function toNumber(value) {
        var parsed = parseFloat(value);
        return isFinite(parsed) && parsed >= 0 ? parsed : 0;
    }

    function toPositiveInt(value) {
        var parsed = parseInt(value, 10);
        return isFinite(parsed) && parsed > 0 ? parsed : 1;
    }

    function formatNumber(value, decimals) {
        var places = typeof decimals === "number" ? decimals : 0;
        return Number(value).toLocaleString("en-PK", {
            minimumFractionDigits: places,
            maximumFractionDigits: places
        });
    }

    function buildApplianceOptions() {
        var html = "";
        var i;
        for (i = 0; i < CATALOGUE.length; i++) {
            html += '<option value="' + CATALOGUE[i].id + '" data-watts="' + CATALOGUE[i].watts +
                '" data-hours="' + CATALOGUE[i].hours + '">' + CATALOGUE[i].label +
                ' (' + CATALOGUE[i].watts + 'W)</option>';
        }
        html += '<option value="' + CUSTOM + '" data-watts="" data-hours="">Custom Appliance / Equipment</option>';
        return html;
    }

    function addRow(applianceId, quantity, hours) {
        var preset = applianceId ? findAppliance(applianceId) : null;
        state.sequence += 1;

        state.rows.push({
            key: "row-" + state.sequence,
            applianceId: applianceId || CATALOGUE[0].id,
            watts: preset ? preset.watts : CATALOGUE[0].watts,
            hours: typeof hours === "number" ? hours : (preset ? preset.hours : 4),
            quantity: quantity || 1
        });
    }

    function renderRows() {
        var options = buildApplianceOptions();
        var html = "";
        var i;

        for (i = 0; i < state.rows.length; i++) {
            var row = state.rows[i];
            var optionList = options.replace(
                '<option value="' + row.applianceId + '"',
                '<option value="' + row.applianceId + '" selected'
            );

            html += '<tr data-row="' + row.key + '">' +
                '<td data-label="Appliance / Equipment"><select class="form-select calc-appliance" aria-label="Appliance">' + optionList + '</select></td>' +
                '<td data-label="Power Rating (W)"><input type="number" class="form-control calc-watts" min="1" step="1" value="' + row.watts +
                '" aria-label="Power rating in watts"></td>' +
                '<td data-label="Quantity"><input type="number" class="form-control calc-qty" min="1" step="1" value="' + row.quantity +
                '" aria-label="Quantity"></td>' +
                '<td data-label="Hours Per Day"><input type="number" class="form-control calc-hours" min="0" step="0.5" value="' + row.hours +
                '" aria-label="Hours per day"></td>' +
                '<td data-label="Energy Per Day" class="calc-row-kwh">0.0 kWh</td>' +
                '<td class="calc-remove-cell"><button type="button" class="calc-remove" aria-label="Remove appliance">' +
                '<i class="fas fa-trash-alt"></i></button></td>' +
                "</tr>";
        }

        if (state.rows.length === 0) {
            html = '<tr><td colspan="6" class="text-center text-muted-2 py-4">' +
                "No appliances added yet. Use the form above to add your first appliance.</td></tr>";
        }

        dom.rows.innerHTML = html;
        calculate();
    }

    function readRowsFromDom() {
        Array.prototype.forEach.call(dom.rows.querySelectorAll("tr[data-row]"), function (tr) {
            var key = tr.getAttribute("data-row");
            var select = tr.querySelector("select.calc-appliance");
            for (var i = 0; i < state.rows.length; i++) {
                if (state.rows[i].key !== key) {
                    continue;
                }
                state.rows[i].applianceId = select.value;
                state.rows[i].watts = toNumber(tr.querySelector(".calc-watts").value);
                state.rows[i].quantity = toPositiveInt(tr.querySelector(".calc-qty").value);
                state.rows[i].hours = toNumber(tr.querySelector(".calc-hours").value);
            }
        });
    }

    function calculate() {
        readRowsFromDom();

        var settings = getSettings();
        var totalWatts = 0;
        var dailyKwh = 0;
        var i;

        for (i = 0; i < state.rows.length; i++) {
            var row = state.rows[i];
            var rowWatts = row.watts * row.quantity;
            totalWatts += rowWatts;
            dailyKwh += (rowWatts * row.hours) / 1000;
        }

        var monthlyKwh = dailyKwh * SYSTEM.daysInMonth;
        var systemKW = settings.peakSunHours > 0
            ? dailyKwh / (settings.peakSunHours * SYSTEM.performanceRatio)
            : 0;
        var panelWatts = settings.panelWatts > 0 ? settings.panelWatts : 1;
        var panelCount = Math.ceil((systemKW * 1000) / panelWatts);

        var batteryKwh = 0;
        var batteryKW = 0;
        if (settings.batteryEnabled) {
            batteryKwh = (dailyKwh * settings.backupDays) / SYSTEM.batteryDoD;
            batteryKW = settings.backupHours > 0
                ? (dailyKwh * settings.backupFactor) / (settings.backupHours * SYSTEM.inverterEfficiency)
                : 0;
        }

        var result = {
            totalWatts: totalWatts,
            totalKW: totalWatts / 1000,
            dailyKwh: dailyKwh,
            monthlyKwh: monthlyKwh,
            annualKwh: monthlyKwh * 12,
            systemKW: systemKW,
            panelCount: panelCount,
            panelWatts: settings.panelWatts,
            batteryEnabled: settings.batteryEnabled,
            batteryKwh: batteryKwh,
            batteryKW: batteryKW,
            backupDays: settings.backupDays,
            backupHours: settings.backupHours,
            peakSunHours: settings.peakSunHours,
            phase: totalWatts / 1000 <= SYSTEM.singlePhaseLimitKW ? "Single-phase" : "Three-phase",
            hasData: state.rows.length > 0 && totalWatts > 0
        };

        render(result);
        return result;
    }

    function getSettings() {
        return {
            peakSunHours: toNumber(dom.peakSunHours.value) || 4.5,
            panelWatts: toNumber(dom.panelWatts.value) || 550,
            batteryEnabled: dom.batteryEnabled.checked,
            backupFactor: 1.25,
            backupDays: toNumber(dom.backupDays.value) || 1,
            backupHours: toNumber(dom.backupHours.value) || 4
        };
    }

    function render(result) {
        dom.placeholder.style.display = result.hasData ? "none" : "block";

        dom.totalWatts.textContent = formatNumber(result.totalWatts);
        dom.totalKW.textContent = formatNumber(result.totalKW, 2);
        dom.dailyKwh.textContent = formatNumber(result.dailyKwh, 2);
        dom.monthlyKwh.textContent = formatNumber(result.monthlyKwh, 1);
        dom.annualKwh.textContent = formatNumber(result.annualKwh, 0);
        dom.systemKW.textContent = formatNumber(result.systemKW, 2);
        dom.panelCount.textContent = formatNumber(result.panelCount);
        dom.panelWattsOut.textContent = result.panelWatts + " W";
        dom.phase.textContent = result.phase;

        if (result.batteryEnabled) {
            dom.batteryBlock.style.display = "block";
            dom.batteryKwh.textContent = formatNumber(result.batteryKwh, 1);
            dom.batteryKW.textContent = formatNumber(result.batteryKW, 2);
            dom.batteryDetail.textContent = "For about " +
                formatNumber(result.backupHours, 0) + " hours of backup on a typical day (" +
                formatNumber(result.backupDays, 2) + " day autonomy)";
        } else {
            dom.batteryBlock.style.display = "none";
        }

        var rowKwhCells = dom.rows.querySelectorAll(".calc-row-kwh");
        for (var i = 0; i < state.rows.length && i < rowKwhCells.length; i++) {
            var row = state.rows[i];
            rowKwhCells[i].textContent = formatNumber((row.watts * row.quantity * row.hours) / 1000, 2) + " kWh";
        }

        dom.cta.classList.toggle("d-none", !result.hasData);
        dom.loadOptions.style.display = result.hasData ? "block" : "none";

        if (result.hasData) {
            buildSummary(result);
        } else {
            dom.summary.textContent = "";
            dom.whatsappLink.href = "#";
            dom.emailLink.href = "#";
        }

        return result;
    }

    function buildSummary(result) {
        var lines = [];
        var i;

        lines.push("PRO SOLAR - SOLAR LOAD CALCULATOR SUMMARY");
        lines.push("--------------------------------------");
        lines.push("Total connected load: " + formatNumber(result.totalWatts) + " W (" + formatNumber(result.totalKW, 2) + " kW)");
        lines.push("Estimated daily use: " + formatNumber(result.dailyKwh, 2) + " kWh/day");
        lines.push("Estimated monthly use: " + formatNumber(result.monthlyKwh, 1) + " kWh/month");
        lines.push("Estimated system size: " + formatNumber(result.systemKW, 2) + " kWp (" + result.panelCount + " x " + result.panelWatts + " W panels)");
        if (result.batteryEnabled) {
            lines.push("Suggested storage: " + formatNumber(result.batteryKwh, 1) + " kWh (" + formatNumber(result.batteryKW, 2) + " kW)");
        }
        lines.push("Recommended supply: " + result.phase);
        lines.push("");
        lines.push("Appliances added:");
        for (i = 0; i < state.rows.length; i++) {
            var row = state.rows[i];
            var appliance = findAppliance(row.applianceId);
            var label = appliance ? appliance.label : "Custom Appliance / Equipment";
            lines.push("- " + label + ": " + row.quantity + " x " + formatNumber(row.watts) + " W x " +
                formatNumber(row.hours, 1) + " h/day");
        }
        lines.push("");
        lines.push("These are automated estimates, not a final engineering design.");

        var text = lines.join("\n");
        dom.summary.textContent = text;

        var lead = readLeadDetails();
        var fullText = text + "\n\n---\n" + lead;

        dom.whatsappLink.href = "https://wa.me/" + PRO_SOLAR.whatsapp + "?text=" + encodeURIComponent(fullText);
        dom.emailLink.href = "mailto:" + PRO_SOLAR.generalEmail +
            "?subject=" + encodeURIComponent("Solar Load Calculator Enquiry - " + formatNumber(result.systemKW, 2) + " kWp") +
            "&body=" + encodeURIComponent(fullText);

        try {
            window.sessionStorage.setItem("prosolarCalculatorSummary", text);
        } catch (error) {
            // Storage is unavailable in some browsers; the links still work.
        }

        return text;
    }

    function readLeadDetails() {
        var lines = ["Name: " + (dom.leadName.value.trim() || "-")];
        lines.push("Mobile: " + (dom.leadPhone.value.trim() || "-"));
        lines.push("City / Area: " + (dom.leadCity.value.trim() || "-"));
        lines.push("Preferred solution: " + dom.leadSolution.value);
        lines.push("Notes: " + (dom.leadNotes.value.trim() || "-"));
        return "MY DETAILS\n" + lines.join("\n");
    }

    function leadIsComplete() {
        return dom.leadName.value.trim() !== "" && dom.leadPhone.value.trim() !== "";
    }

    function validateLead() {
        var valid = true;

        [dom.leadName, dom.leadPhone].forEach(function (field) {
            if (field.value.trim() === "") {
                field.classList.add("is-invalid");
                valid = false;
            } else {
                field.classList.remove("is-invalid");
            }
        });

        var digits = dom.leadPhone.value.replace(/[^\d]/g, "");
        if (digits.length < 10) {
            dom.leadPhone.classList.add("is-invalid");
            valid = false;
        }

        return valid;
    }

    function applyPreset(name) {
        var preset = PRESETS[name] || [];

        state.rows = [];
        for (var i = 0; i < preset.length; i++) {
            addRow(preset[i][0], preset[i][1], preset[i][2]);
        }
        renderRows();
    }

    function reset() {
        state.rows = [];
        addRow();
        renderRows();
    }

    function bindEvents() {
        dom.addRow.addEventListener("click", function () {
            addRow();
            renderRows();
        });

        dom.reset.addEventListener("click", function () {
            reset();
        });

        dom.rows.addEventListener("input", function (event) {
            var target = event.target;
            if (target.classList.contains("calc-appliance") && target.value !== CUSTOM) {
                var watts = target.options[target.selectedIndex].getAttribute("data-watts");
                var hours = target.options[target.selectedIndex].getAttribute("data-hours");
                var row = target.closest("tr");
                if (watts) {
                    row.querySelector(".calc-watts").value = watts;
                }
                if (hours) {
                    row.querySelector(".calc-hours").value = hours;
                }
            }
            calculate();
        });

        dom.rows.addEventListener("change", function () {
            calculate();
        });

        dom.rows.addEventListener("click", function (event) {
            if (!event.target.closest(".calc-remove")) {
                return;
            }
            var key = event.target.closest("tr").getAttribute("data-row");
            state.rows = state.rows.filter(function (row) {
                return row.key !== key;
            });
            renderRows();
        });

        Array.prototype.forEach.call(document.querySelectorAll("[data-preset]"), function (button) {
            button.addEventListener("click", function () {
                applyPreset(button.getAttribute("data-preset"));
            });
        });

        Array.prototype.forEach.call(document.querySelectorAll("[data-calc-setting]"), function (field) {
            field.addEventListener("change", function () {
                calculate();
            });
            field.addEventListener("input", function () {
                calculate();
            });
        });

        dom.batteryEnabled.addEventListener("change", function () {
            dom.batteryOptions.classList.toggle("d-none", !dom.batteryEnabled.checked);
            calculate();
        });

        dom.leadForm.addEventListener("submit", function (event) {
            event.preventDefault();
            if (!validateLead()) {
                return;
            }
            var result = calculate();
            buildSummary(result);
            dom.leadResult.classList.remove("d-none");
            dom.leadResult.scrollIntoView({ behavior: "smooth", block: "center" });
        });

        dom.copyButton.addEventListener("click", function () {
            var text = dom.summary.textContent;
            if (!text) {
                return;
            }
            if (navigator.clipboard) {
                navigator.clipboard.writeText(text).then(function () {
                    dom.copyButton.innerHTML = '<i class="fas fa-check me-2"></i>Copied';
                    window.setTimeout(function () {
                        dom.copyButton.innerHTML = '<i class="fas fa-copy me-2"></i>Copy Summary';
                    }, 2500);
                });
            }
        });
    }

    function init() {
        dom.rows = byId("calc-rows");
        if (!dom.rows) {
            return;
        }

        dom.addRow = byId("calc-add-row");
        dom.reset = byId("calc-reset");
        dom.placeholder = byId("calc-placeholder");
        dom.totalWatts = byId("res-total-watts");
        dom.totalKW = byId("res-total-kw");
        dom.dailyKwh = byId("res-daily-kwh");
        dom.monthlyKwh = byId("res-monthly-kwh");
        dom.annualKwh = byId("res-annual-kwh");
        dom.systemKW = byId("res-system-kw");
        dom.panelCount = byId("res-panel-count");
        dom.panelWattsOut = byId("res-panel-watts");
        dom.phase = byId("res-phase");
        dom.batteryBlock = byId("res-battery-block");
        dom.batteryKwh = byId("res-battery-kwh");
        dom.batteryKW = byId("res-battery-kw");
        dom.batteryDetail = byId("res-battery-detail");
        dom.batteryEnabled = byId("calc-battery-enabled");
        dom.batteryOptions = byId("calc-battery-options");
        dom.peakSunHours = byId("calc-peak-sun-hours");
        dom.panelWatts = byId("calc-panel-watts");
        dom.backupDays = byId("calc-backup-days");
        dom.backupHours = byId("calc-backup-hours");
        dom.cta = byId("calc-cta");
        dom.loadOptions = byId("calc-load-options");
        dom.summary = byId("calc-summary");
        dom.whatsappLink = byId("calc-whatsapp");
        dom.emailLink = byId("calc-email");
        dom.leadForm = byId("calc-lead-form");
        dom.leadName = byId("lead-name");
        dom.leadPhone = byId("lead-phone");
        dom.leadCity = byId("lead-city");
        dom.leadSolution = byId("lead-solution");
        dom.leadNotes = byId("lead-notes");
        dom.leadResult = byId("calc-lead-result");
        dom.copyButton = byId("calc-copy");

        dom.rows.innerHTML = "";
        dom.batteryOptions.classList.toggle("d-none", !dom.batteryEnabled.checked);
        addRow();
        renderRows();
        bindEvents();
    }

    return {
        init: init,
        addRow: addRow,
        calculate: calculate,
        applyPreset: applyPreset,
        reset: reset,
        buildSummary: buildSummary
    };
})();

document.addEventListener("DOMContentLoaded", function () {
    SolarLoadCalculator.init();
});
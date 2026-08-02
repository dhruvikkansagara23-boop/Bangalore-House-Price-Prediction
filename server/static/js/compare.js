/* ---------------------------------------------------------
   compare.js — Compare up to 3 property configurations
--------------------------------------------------------- */

const MAX_ROWS = 3;
const MIN_ROWS = 2;
const AREA_MIN = 300;
const AREA_MAX = 10000;

var locationOptionsHtml = "";
var rowCount = 0;

// ── Helpers ─────────────────────────────────────────────────
function formatPrice(priceInLakhs) {
    if (priceInLakhs >= 100) {
        return "₹\u00A0" + (priceInLakhs / 100).toFixed(2) + " Crore";
    }
    return "₹\u00A0" + priceInLakhs.toFixed(2) + " Lakhs";
}

function showRowError(rowEl, message) {
    var el = rowEl.querySelector(".row-error");
    el.textContent = message;
    el.style.display = "block";
}

function hideRowError(rowEl) {
    var el = rowEl.querySelector(".row-error");
    el.style.display = "none";
    el.textContent = "";
}

function showCompareError(message) {
    var el = document.getElementById("compareError");
    el.textContent = message;
    el.style.display = "block";
}

function hideCompareError() {
    var el = document.getElementById("compareError");
    el.style.display = "none";
    el.textContent = "";
}

// ── Row management ────────────────────────────────────────
function addRow() {
    var rowsContainer = document.getElementById("compareRows");
    var existingRows   = rowsContainer.querySelectorAll(".compare-row");

    if (existingRows.length >= MAX_ROWS) return;

    rowCount += 1;

    var template = document.getElementById("compareRowTemplate");
    var clone = template.content.cloneNode(true);

    var rowEl = clone.querySelector(".compare-row");
    rowEl.dataset.rowId = rowCount;

    clone.querySelector(".compare-row-title").textContent = "Property " + (existingRows.length + 1);

    var locationSelect = clone.querySelector(".cmp-location");
    locationSelect.innerHTML = '<option value="" disabled selected>Choose Location</option>' + locationOptionsHtml;

    var removeBtn = clone.querySelector(".remove-row-btn");
    removeBtn.addEventListener("click", function () {
        removeRow(rowEl.dataset.rowId ? rowEl : removeBtn.closest(".compare-row"));
    });

    rowsContainer.appendChild(clone);

    refreshRowState();
}

function removeRow(rowEl) {
    var rowsContainer = document.getElementById("compareRows");
    var existingRows   = rowsContainer.querySelectorAll(".compare-row");

    if (existingRows.length <= MIN_ROWS) return;

    rowEl.remove();
    renumberRows();
    refreshRowState();
}

function renumberRows() {
    var rows = document.querySelectorAll("#compareRows .compare-row");
    rows.forEach(function (row, index) {
        row.querySelector(".compare-row-title").textContent = "Property " + (index + 1);
    });
}

function refreshRowState() {
    var rows = document.querySelectorAll("#compareRows .compare-row");
    var addBtn = document.getElementById("addRowBtn");

    addBtn.disabled = rows.length >= MAX_ROWS;

    // Show remove buttons only when above the minimum
    rows.forEach(function (row) {
        var removeBtn = row.querySelector(".remove-row-btn");
        removeBtn.style.visibility = rows.length > MIN_ROWS ? "visible" : "hidden";
    });
}

// ── Validation ──────────────────────────────────────────────
function validateRow(rowEl) {
    var area     = parseFloat(rowEl.querySelector(".cmp-area").value);
    var location = rowEl.querySelector(".cmp-location").value;

    hideRowError(rowEl);

    if (isNaN(area) || area < AREA_MIN || area > AREA_MAX) {
        showRowError(rowEl, "❌ Area must be between " + AREA_MIN + " and " + AREA_MAX + " sqft.");
        return false;
    }

    if (!location) {
        showRowError(rowEl, "❌ Please choose a location.");
        return false;
    }

    return true;
}

// ── Compare handler ───────────────────────────────────────
function onCompareNow() {
    hideCompareError();
    document.getElementById("compareResultCard").style.display = "none";

    var rows = Array.from(document.querySelectorAll("#compareRows .compare-row"));
    var allValid = true;

    rows.forEach(function (row) {
        if (!validateRow(row)) allValid = false;
    });

    if (!allValid) {
        showCompareError("⚠ Please fix the highlighted properties before comparing.");
        return;
    }

    var compareBtn      = document.getElementById("compareBtn");
    var compareBtnText  = document.getElementById("compareBtnText");
    var compareBtnSpinner = document.getElementById("compareBtnSpinner");

    compareBtn.disabled = true;
    compareBtnText.textContent = "Comparing…";
    compareBtnSpinner.style.display = "inline-block";

    var configs = rows.map(function (row, index) {
        return {
            label:    "Property " + (index + 1),
            area:     parseFloat(row.querySelector(".cmp-area").value),
            location: row.querySelector(".cmp-location").value,
            bhk:      parseInt(row.querySelector(".cmp-bhk").value),
            bath:     parseInt(row.querySelector(".cmp-bath").value)
        };
    });

    var requests = configs.map(function (cfg) {
        var formData = new URLSearchParams();
        formData.append("sqft",     cfg.area);
        formData.append("bhk",      cfg.bhk);
        formData.append("bath",     cfg.bath);
        formData.append("location", cfg.location);

        return fetch("/predict_home_price", { method: "POST", body: formData })
            .then(function (response) {
                if (!response.ok) throw new Error("Server error");
                return response.json();
            })
            .then(function (data) {
                if (!data || typeof data.estimated_price === "undefined" || data.estimated_price === null) {
                    throw new Error("No price returned");
                }
                return Object.assign({}, cfg, { price: Number(data.estimated_price) });
            });
    });

    Promise.all(requests)
        .then(function (results) {
            resetCompareButton();
            renderComparison(results);
        })
        .catch(function () {
            resetCompareButton();
            showCompareError("🌐 One or more predictions failed. Check your connection and try again.");
        });
}

function resetCompareButton() {
    var compareBtn = document.getElementById("compareBtn");
    var compareBtnText = document.getElementById("compareBtnText");
    var compareBtnSpinner = document.getElementById("compareBtnSpinner");

    compareBtn.disabled = false;
    compareBtnText.textContent = "Compare Now";
    compareBtnSpinner.style.display = "none";
}

// ── Render comparison results ────────────────────────────────
function renderComparison(results) {
    var maxPrice = Math.max.apply(null, results.map(function (r) { return r.price; }));
    var minPrice = Math.min.apply(null, results.map(function (r) { return r.price; }));

    // Bars
    var barsContainer = document.getElementById("compareBars");
    barsContainer.innerHTML = "";

    results.forEach(function (r) {
        var row = document.createElement("div");
        row.className = "compare-bar-row";

        var label = document.createElement("div");
        label.className = "compare-bar-label";
        label.innerHTML = "<span>" + r.label + "</span><span>" + formatPrice(r.price) + "</span>";

        var track = document.createElement("div");
        track.className = "compare-bar-track";

        var fill = document.createElement("div");
        fill.className = "compare-bar-fill";

        row.appendChild(label);
        track.appendChild(fill);
        row.appendChild(track);
        barsContainer.appendChild(row);

        var pct = maxPrice > 0 ? (r.price / maxPrice) * 100 : 0;
        requestAnimationFrame(function () { fill.style.width = pct + "%"; });
    });

    // Table
    var tbody = document.getElementById("compareTableBody");
    tbody.innerHTML = "";

    results.forEach(function (r) {
        var tr = document.createElement("tr");

        var isLowest  = r.price === minPrice;
        var isHighest = r.price === maxPrice && minPrice !== maxPrice;

        if (isLowest)  tr.classList.add("lowest-price");
        if (isHighest) tr.classList.add("highest-price");

        var flag = "";
        if (isLowest)  flag = '<span class="price-flag lowest">Lowest</span>';
        if (isHighest) flag = '<span class="price-flag highest">Highest</span>';

        tr.innerHTML =
            "<td>" + r.label + "</td>" +
            "<td>" + r.area + " sqft</td>" +
            "<td>" + r.bhk + " BHK / " + r.bath + " Bath</td>" +
            "<td>" + r.location + "</td>" +
            "<td>" + formatPrice(r.price) + flag + "</td>";

        tbody.appendChild(tr);
    });

    var resultCard = document.getElementById("compareResultCard");
    resultCard.style.display = "block";
    resultCard.scrollIntoView({ behavior: "smooth", block: "center" });
}

// ── Page load ───────────────────────────────────────────────
function onComparePageLoad() {
    fetch("/get_location_names")
        .then(function (r) { if (!r.ok) throw new Error("Server error"); return r.json(); })
        .then(function (data) {
            if (data && data.locations && data.locations.length) {
                locationOptionsHtml = data.locations.map(function (loc) {
                    return '<option value="' + loc + '">' + loc + '</option>';
                }).join("");
            }

            // Populate any location dropdowns already on the page
            document.querySelectorAll(".cmp-location").forEach(function (select) {
                select.innerHTML = '<option value="" disabled selected>Choose Location</option>' + locationOptionsHtml;
            });
        })
        .catch(function () {
            showCompareError("🌐 Could not load locations. Please refresh the page.");
        });

    // Start with 2 rows
    addRow();
    addRow();

    document.getElementById("addRowBtn").addEventListener("click", addRow);
    document.getElementById("compareBtn").addEventListener("click", onCompareNow);
}

document.addEventListener("DOMContentLoaded", onComparePageLoad);

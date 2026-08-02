/* ---------------------------------------------------------
   predict.js — Bangalore House Price Predictor (predict page)

   BUG FIX — BHK vs. area validation
   ----------------------------------
   BEFORE: the old validation used a single flat "sqft per bedroom"
   minimum (275 sqft/BHK) applied uniformly to every BHK count, i.e.
   maxBhkForArea just did  area / 275  and floored it. That let
   unrealistic combos like 1600-1800 sqft for a 6 BHK pass, because
   6 * 275 = 1650 and 6 * 325 = 1950 — both at or under those areas.
   Large BHK counts were treated as if they only needed *more
   bedrooms*, when in reality they also need more shared/common
   space (bigger living areas, extra corridors, more bathrooms) per
   additional bedroom.

   FIX: the per-bedroom minimum now increases once BHK > 3:
     minAreaPerBhk(bhk) = 275                      for bhk <= 3
     minAreaPerBhk(bhk) = 275 + (bhk - 3) * 90      for bhk  > 3
   and the TOTAL area required for a BHK count is bhk * minAreaPerBhk(bhk)
   (not a flat multiply against a single constant). maxBhkForArea()
   and the error/suggestion messages both use this total.

   Verified against the two target cases:
     - 1600 sqft / 6 BHK  -> minTotalAreaForBhk(6) = 6 * (275+3*90) = 3270
                              1600 < 3270  -> BLOCKED ✔
     - 2600 sqft / 5 BHK  -> minTotalAreaForBhk(5) = 5 * (275+2*90) = 2275
                              2600 >= 2275 -> PASSES ✔
--------------------------------------------------------- */

// ── Constants ──────────────────────────────────────────────
const MIN_AREA_PER_BHK      = 275;   // base rate: hard block, real market minimum for 1-3 BHK
const IDEAL_AREA_PER_BHK    = 500;   // sweet spot: 1000 sqft -> ideal 2 BHK
const AREA_MIN               = 300;
const AREA_MAX               = 10000;
const LUXURY_AREA_THRESHOLD  = 3000;
const HISTORY_KEY            = "bhp_recent_estimates";
const HISTORY_LIMIT          = 5;

// ── BHK helpers ────────────────────────────────────────────
function idealBhkForArea(area) {
    return Math.max(1, Math.min(7, Math.round(area / IDEAL_AREA_PER_BHK)));
}

// Per-bedroom minimum grows once you're past 3 BHK — each extra
// bedroom beyond 3 pulls in proportionally more shared/common
// space (bigger living areas, more corridors, more bathrooms).
function minAreaPerBhk(bhk) {
    if (bhk <= 3) return MIN_AREA_PER_BHK;
    return MIN_AREA_PER_BHK + (bhk - 3) * 90;
}

// TOTAL area required for a given BHK count (not a per-bedroom rate).
function minTotalAreaForBhk(bhk) {
    return bhk * minAreaPerBhk(bhk);
}

function maxBhkForArea(area) {
    for (var b = 7; b >= 1; b--) {
        if (area >= minTotalAreaForBhk(b)) return b;
    }
    return 1;
}

// Bath range — BHK parity rule (Indian market standard)
//   minBath = BHK           -> 1BHK=1, 2BHK=2, 3BHK=3 ...
//   maxBath = min(7, BHK+2) -> 1BHK=3, 2BHK=4, 5BHK=7 ...
//   No area-based math — compact 2BHK flats (550-700 sqft) with 2 baths are normal.
function bathRange(bhk) {
    return {
        min: bhk,
        max: Math.min(7, bhk + 2)
    };
}

// ── Radio getters ──────────────────────────────────────────
function getBathValue() {
    var radios = document.getElementsByName("uiBathrooms");
    for (var i = 0; i < radios.length; i++) {
        if (radios[i].checked) return parseInt(radios[i].value);
    }
    return -1;
}

function getBHKValue() {
    var radios = document.getElementsByName("uiBHK");
    for (var i = 0; i < radios.length; i++) {
        if (radios[i].checked) return parseInt(radios[i].value);
    }
    return -1;
}

// ── Message helpers ─────────────────────────────────────────
function showMessage(id, text) {
    var el = document.getElementById(id);
    if (!el) return;
    el.style.display = "block";
    el.innerHTML = text;
}

function hideMessage(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.style.display = "none";
    el.innerHTML = "";
}

// ── Bathroom options ───────────────────────────────────────
function updateBathOptions() {
    var bhk         = getBHKValue();
    var bathRadios  = document.getElementsByName("uiBathrooms");
    var currentBath = getBathValue();

    var range = bathRange(bhk);

    var needsReset = currentBath < range.min || currentBath > range.max;

    for (var i = 0; i < bathRadios.length; i++) {
        var bath    = parseInt(bathRadios[i].value);
        var allowed = bath >= range.min && bath <= range.max;
        bathRadios[i].disabled = !allowed;
    }

    if (needsReset) {
        // Reset to the minimum valid bath for this combo (most conservative choice)
        for (var j = 0; j < bathRadios.length; j++) {
            if (parseInt(bathRadios[j].value) === range.min) {
                bathRadios[j].checked = true;
                break;
            }
        }
    }

    validateBathSelection();
    validateAreaAndBHK();
}

// ── Validation ─────────────────────────────────────────────
function validateBathSelection() {
    var bhk   = getBHKValue();
    var bath  = getBathValue();
    var range = bathRange(bhk);

    if (bath > range.max) {
        showMessage("bathError",
            "❌ " + bhk + " BHK cannot have " + bath +
            " bathrooms. Maximum allowed: " + range.max + ".");
        return false;
    }
    if (bath < range.min) {
        showMessage("bathError",
            "❌ " + bhk + " BHK requires at least " + range.min +
            " bathroom" + (range.min > 1 ? "s" : "") + ".");
        return false;
    }
    hideMessage("bathError");
    return true;
}

function validateAreaAndBHK() {
    var sqftInput = document.getElementById("uiSqft");
    var area      = parseFloat(sqftInput.value);
    var bhk       = getBHKValue();

    hideMessage("areaError");
    hideMessage("areaWarning");
    hideMessage("bhkError");
    hideMessage("bhkSuggestion");

    if (isNaN(area) || sqftInput.value === "") {
        showMessage("areaError", "⚠ Please enter the property area.");
        return false;
    }
    if (area < AREA_MIN) {
        showMessage("areaError",
            "❌ Area cannot be less than " + AREA_MIN + " sqft.");
        return false;
    }
    if (area > AREA_MAX) {
        showMessage("areaError",
            "❌ Area exceeds the supported limit. Enter between " +
            AREA_MIN + " and " + AREA_MAX + " sqft.");
        return false;
    }
    if (area > LUXURY_AREA_THRESHOLD) {
        showMessage("areaWarning",
            "⚠ Large property detected. Prediction accuracy may be slightly lower for very large homes.");
    }

    var maxBhk   = maxBhkForArea(area);   // already accounts for TOTAL area needed
    var idealBhk = idealBhkForArea(area);

    // Hard block: too cramped
    if (bhk > maxBhk) {
        var neededArea = minTotalAreaForBhk(bhk);
        showMessage("bhkError",
            "❌ " + area + " sqft is too small for " + bhk +
            " BHK. Choose ≤ " + maxBhk + " BHK or increase area to at least " +
            neededArea + " sqft.");
        return false;
    }

    // Soft suggestion: selected BHK is below ideal — space is being under-used
    if (bhk < idealBhk) {
        showMessage("bhkSuggestion",
            "💡 " + area + " sqft is ideal for " + idealBhk + " BHK " +
            "(~" + IDEAL_AREA_PER_BHK + " sqft/bedroom). " +
            "Consider selecting " + idealBhk + " BHK to make better use of the space.");
    }

    return true;
}

function validateLocation() {
    var location = document.getElementById("uiLocations");
    if (!location.value) {
        showMessage("locationError", "⚠ Please select a location before predicting.");
        return false;
    }
    hideMessage("locationError");
    return true;
}

// ── Result helpers ──────────────────────────────────────────
function priceCategory(priceInLakhs) {
    if (priceInLakhs < 30)  return { label: "🏠 Budget Property",    stars: 2 };
    if (priceInLakhs < 70)  return { label: "🏡 Mid-Range Property", stars: 3 };
    if (priceInLakhs < 150) return { label: "🌟 Premium Property",   stars: 4 };
    return                         { label: "💎 Luxury Property",    stars: 5 };
}

function formatPrice(priceInLakhs) {
    if (priceInLakhs >= 100) {
        return "₹\u00A0" + (priceInLakhs / 100).toFixed(2) + " Crore";
    }
    return "₹\u00A0" + priceInLakhs.toFixed(2) + " Lakhs";
}

// Range varies by segment: budget ±10%, mid ±8%, premium ±6%, luxury ±5%
function rangePercent(priceInLakhs) {
    if (priceInLakhs < 30)  return 0.10;
    if (priceInLakhs < 70)  return 0.08;
    if (priceInLakhs < 150) return 0.06;
    return 0.05;
}

// Confidence: how close the selected BHK is to ideal for this area
function estimateConfidence(area, bhk, bath) {
    var ideal        = idealBhkForArea(area);
    var bhkDiff      = Math.abs(bhk - ideal);             // 0 = perfect
    var bathBalanced = (bath >= bhk - 1 && bath <= bhk + 1);

    var confidence = 95;
    confidence -= bhkDiff * 8;              // -8% per BHK away from ideal
    if (!bathBalanced) confidence -= 5;
    if (area > LUXURY_AREA_THRESHOLD) confidence -= 4;

    return Math.max(68, Math.min(95, Math.round(confidence)));
}

// ── Smart Advisor ───────────────────────────────────────────
function renderAdvisor(area, bhk, bath, priceInLakhs) {
    var tips = [];
    var idealBhk = idealBhkForArea(area);

    // Family size
    if (bhk === 1) {
        tips.push("✔ Ideal for a single professional or couple.");
    } else if (bhk >= 4) {
        tips.push("✔ Ideal for a family of " + (bhk + 1) + "–" + (bhk + 2) + " members.");
    } else {
        tips.push("✔ Suitable for a family of " + bhk + "–" + (bhk + 1) + " members.");
    }

    // Ideal BHK hint (only when their choice is off by >= 2)
    if (Math.abs(bhk - idealBhk) >= 2) {
        tips.push("💡 For " + area + " sqft, " + idealBhk +
            " BHK is typically the most balanced choice (~" +
            IDEAL_AREA_PER_BHK + " sqft/bedroom).");
    }

    // Parking
    tips.push("✔ Recommended parking: " + (bhk >= 3 ? "1–2 cars" : "1 car") + ".");

    // Segment advice
    if (priceInLakhs < 70) {
        tips.push("✔ Falls in an affordable price segment — good for first-time buyers.");
    } else if (priceInLakhs < 150) {
        tips.push("✔ Mid-to-premium segment with solid resale value.");
    } else {
        tips.push("✔ High-value property with strong long-term investment potential.");
    }

    // Area-per-bedroom quality
    var apb = area / bhk;
    if (apb >= IDEAL_AREA_PER_BHK) {
        tips.push("✔ Spacious bedroom-to-area ratio — comfortable living space.");
    } else {
        tips.push("✔ Efficient use of space — compact but functional layout.");
    }

    // Bathroom note
    tips.push("✔ Bathroom count (" + bath + ") is well balanced for this configuration.");

    var list = document.getElementById("advisorList");
    list.innerHTML = "";
    tips.forEach(function (t) {
        var li = document.createElement("li");
        li.textContent = t;
        list.appendChild(li);
    });
}

function animateBar(id, percent) {
    var el = document.getElementById(id);
    if (!el) return;
    requestAnimationFrame(function () { el.style.width = percent + "%"; });
}

// ── Loading state ───────────────────────────────────────────
function setLoading(isLoading) {
    var btn     = document.getElementById("estimateBtn");
    var btnText = document.getElementById("btnText");
    var spinner = document.getElementById("btnSpinner");

    btn.disabled          = isLoading;
    btnText.textContent   = isLoading ? "Predicting…" : "Estimate Price";
    spinner.style.display = isLoading ? "inline-block" : "none";
}

// ── Recent Estimates history (localStorage) ──────────────────
function loadHistory() {
    try {
        var raw = localStorage.getItem(HISTORY_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        return [];
    }
}

function saveHistoryEntry(entry) {
    var history = loadHistory();
    history.unshift(entry);
    history = history.slice(0, HISTORY_LIMIT);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    renderHistory();
}

function clearHistory() {
    localStorage.removeItem(HISTORY_KEY);
    renderHistory();
}

function renderHistory() {
    var card = document.getElementById("historyCard");
    var list = document.getElementById("historyList");
    var history = loadHistory();

    if (!history.length) {
        card.style.display = "none";
        list.innerHTML = "";
        return;
    }

    card.style.display = "block";
    list.innerHTML = "";

    history.forEach(function (entry) {
        var li = document.createElement("li");

        var meta = document.createElement("span");
        meta.className = "history-meta";
        meta.textContent = entry.area + " sqft · " + entry.bhk + " BHK · " +
            entry.bath + " Bath · " + entry.location;

        var price = document.createElement("span");
        price.className = "history-price";
        price.textContent = entry.priceLabel;

        li.appendChild(meta);
        li.appendChild(price);
        list.appendChild(li);
    });
}

// ── Main prediction handler ─────────────────────────────────
function onClickedEstimatePrice() {
    document.getElementById("resultCard").style.display          = "none";
    document.getElementById("summaryCard").style.display         = "none";
    document.getElementById("predictionErrorCard").style.display = "none";

    var sqftInput = document.getElementById("uiSqft");
    var area      = parseFloat(sqftInput.value);
    var bhk       = getBHKValue();
    var bathrooms = getBathValue();
    var location  = document.getElementById("uiLocations");

    var areaOk     = validateAreaAndBHK();
    var bathOk     = validateBathSelection();
    var locationOk = validateLocation();

    if (!areaOk || !bathOk || !locationOk) return;

    // Summary card
    document.getElementById("sumArea").textContent       = area + " sqft";
    document.getElementById("sumBhk").textContent         = bhk;
    document.getElementById("sumBath").textContent        = bathrooms;
    document.getElementById("sumLocation").textContent    = location.value;
    document.getElementById("summaryCard").style.display  = "block";

    setLoading(true);

    var formData = new URLSearchParams();
    formData.append("sqft",     area);
    formData.append("bhk",      bhk);
    formData.append("bath",     bathrooms);
    formData.append("location", location.value);

    fetch("/predict_home_price", { method: "POST", body: formData })
        .then(function (response) {
            if (!response.ok) throw new Error("Server error");
            return response.json();
        })
        .then(function (data) {
            setLoading(false);

            if (!data || typeof data.estimated_price === "undefined" || data.estimated_price === null) {
                showPredictionError("❌ Prediction failed. Please try again later.");
                return;
            }

            var price = Number(data.estimated_price);

            // ── Price display ──────────────────────────────────
            var priceLabel = formatPrice(price);
            document.getElementById("uiEstimatedPrice").innerHTML = priceLabel;

            var pct  = rangePercent(price);
            var low  = price * (1 - pct);
            var high = price * (1 + pct);
            document.getElementById("priceRange").textContent =
                "Possible Range: " + formatPrice(low) + " – " + formatPrice(high);

            // Price per sqft (sanity check line)
            var pricePerSqft = Math.round((price * 100000) / area);
            var ppsEl = document.getElementById("pricePerSqft");
            if (ppsEl) {
                ppsEl.textContent = "₹ " + pricePerSqft.toLocaleString("en-IN") + " / sqft";
            }

            // Category & stars
            var cat = priceCategory(price);
            document.getElementById("priceCategory").textContent = cat.label;
            document.getElementById("ratingStars").textContent =
                "★".repeat(cat.stars) + "☆".repeat(5 - cat.stars);

            // Confidence
            var confidence = estimateConfidence(area, bhk, bathrooms);
            document.getElementById("confidenceValue").textContent = confidence + "%";
            animateBar("confidenceFill", confidence);

            // Mini bars
            animateBar("barArea", Math.min(100, (area / AREA_MAX) * 100));
            animateBar("barBhk",  Math.min(100, (bhk       / 7)   * 100));
            animateBar("barBath", Math.min(100, (bathrooms  / 7)   * 100));

            // Ideal BHK hint in result card
            var idealBhk = idealBhkForArea(area);
            var idealEl  = document.getElementById("idealBhkHint");
            if (idealEl) {
                if (idealBhk !== bhk) {
                    idealEl.style.display = "block";
                    idealEl.textContent =
                        "💡 Ideal BHK for " + area + " sqft is " + idealBhk +
                        " (~" + IDEAL_AREA_PER_BHK + " sqft/bedroom). " +
                        "Your " + bhk + " BHK selection " +
                        (bhk < idealBhk ? "under-utilises" : "over-packs") +
                        " the space.";
                } else {
                    idealEl.style.display = "none";
                }
            }

            renderAdvisor(area, bhk, bathrooms, price);

            document.getElementById("resultCard").style.display = "block";
            document.getElementById("resultCard").scrollIntoView({ behavior: "smooth", block: "center" });

            // Save to Recent Estimates
            saveHistoryEntry({
                area: area,
                bhk: bhk,
                bath: bathrooms,
                location: location.value,
                priceLabel: priceLabel
            });
        })
        .catch(function () {
            setLoading(false);
            showPredictionError("🌐 Cannot connect to the server. Check your connection and try again.");
        });
}

function showPredictionError(message) {
    var el = document.getElementById("predictionErrorCard");
    el.style.display = "block";
    el.textContent   = message;
}

// ── Page load ───────────────────────────────────────────────
function onPredictPageLoad() {
    var locationSelect = document.getElementById("uiLocations");
    var estimateBtn    = document.getElementById("estimateBtn");
    var btnText        = document.getElementById("btnText");

    locationSelect.innerHTML = "";
    locationSelect.appendChild(new Option("Loading locations…", ""));
    locationSelect.disabled  = true;
    estimateBtn.disabled     = true;
    btnText.textContent      = "Loading…";

    fetch("/get_location_names")
        .then(function (r) { if (!r.ok) throw new Error("Server error"); return r.json(); })
        .then(function (data) {
            locationSelect.innerHTML = "";
            if (data && data.locations && data.locations.length) {
                locationSelect.appendChild(new Option("Choose Location", ""));
                data.locations.forEach(function (loc) {
                    locationSelect.appendChild(new Option(loc, loc));
                });
                locationSelect.disabled = false;
            } else {
                locationSelect.appendChild(new Option("No locations — refresh page", ""));
            }
            estimateBtn.disabled = false;
            btnText.textContent  = "Estimate Price";
        })
        .catch(function () {
            locationSelect.innerHTML = "";
            locationSelect.appendChild(new Option("Failed to load — refresh page", ""));
            estimateBtn.disabled = false;
            btnText.textContent  = "Estimate Price";
        });

    // BHK change -> update bath options + re-validate
    var bhkRadios = document.getElementsByName("uiBHK");
    for (var i = 0; i < bhkRadios.length; i++) {
        bhkRadios[i].addEventListener("change", updateBathOptions);
    }

    // Bath change -> re-validate
    var bathRadios = document.getElementsByName("uiBathrooms");
    for (var k = 0; k < bathRadios.length; k++) {
        bathRadios[k].addEventListener("change", validateBathSelection);
    }

    // Area change -> re-validate BHK AND update bath radio availability
    document.getElementById("uiSqft").addEventListener("input", function () {
        updateBathOptions();   // re-checks both BHK and area constraints on bath
        validateAreaAndBHK();  // updates BHK error / suggestion messages
    });
    document.getElementById("uiLocations").addEventListener("change", validateLocation);

    document.getElementById("clearHistoryBtn").addEventListener("click", clearHistory);

    updateBathOptions();
    renderHistory();
}

document.addEventListener("DOMContentLoaded", onPredictPageLoad);

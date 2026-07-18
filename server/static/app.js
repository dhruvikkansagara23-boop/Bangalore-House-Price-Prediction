

/* ---------------------------------------------------------
   Bangalore House Price Predictor - app.js
   Smart validation, prediction UI, and result presentation
--------------------------------------------------------- */

// BHK range allowed per area bracket: [minBHK, maxBHK]
const BHK_RULES = [
    { max: 600,   range: [1, 2] },
    { max: 900,   range: [1, 3] },
    { max: 1300,  range: [2, 4] },
    { max: 1800,  range: [3, 5] },
    { max: 2500,  range: [4, 6] },
    { max: Infinity, range: [5, 7] }
];

const AREA_MIN = 300;
const AREA_MAX = 10000;
const LUXURY_AREA_THRESHOLD = 3000;

function getBathValue() {
    var uiBathrooms = document.getElementsByName("uiBathrooms");
    for (var i = 0; i < uiBathrooms.length; i++) {
        if (uiBathrooms[i].checked) return parseInt(uiBathrooms[i].value);
    }
    return -1;
}

function getBHKValue() {
    var uiBHK = document.getElementsByName("uiBHK");
    for (var i = 0; i < uiBHK.length; i++) {
        if (uiBHK[i].checked) return parseInt(uiBHK[i].value);
    }
    return -1;
}

function bhkRangeForArea(area) {
    for (var i = 0; i < BHK_RULES.length; i++) {
        if (area <= BHK_RULES[i].max) return BHK_RULES[i].range;
    }
    return [1, 7];
}

function showMessage(id, text) {
    var el = document.getElementById(id);
    el.style.display = "block";
    el.innerHTML = text;
}

function hideMessage(id) {
    var el = document.getElementById(id);
    el.style.display = "none";
    el.innerHTML = "";
}

/* ---------------- Bathroom option enabling ---------------- */

function updateBathOptions() {
    var bhk = getBHKValue();
    var bathRadios = document.getElementsByName("uiBathrooms");
    var minBath = Math.max(1, bhk - 1);
    var maxBath = Math.min(7, bhk + 2);

    for (var i = 0; i < bathRadios.length; i++) {
        var bath = parseInt(bathRadios[i].value);
        var allowed = bath >= minBath && bath <= maxBath;
        bathRadios[i].disabled = !allowed;
        if (!allowed && bathRadios[i].checked) {
            bathRadios[0].disabled = false;
            bathRadios[0].checked = true;
        }
    }
    validateBathSelection();
    validateAreaAndBHK();
}

/* ---------------- Validation functions ---------------- */

function validateBathSelection() {
    var bhk = getBHKValue();
    var bath = getBathValue();

    if (bath > bhk + 2) {
        showMessage("bathError",
            "❌ " + bhk + " BHK cannot have " + bath + " bathrooms. Maximum allowed is " + (bhk + 2) + ".");
        return false;
    }
    if (bath < bhk - 1) {
        showMessage("bathError",
            "❌ Too few bathrooms for a " + bhk + " BHK. Minimum recommended is " + Math.max(1, bhk - 1) + ".");
        return false;
    }
    hideMessage("bathError");
    return true;
}

function validateAreaAndBHK() {
    var sqftInput = document.getElementById("uiSqft");
    var area = parseFloat(sqftInput.value);
    var bhk = getBHKValue();

    hideMessage("areaError");
    hideMessage("areaWarning");
    hideMessage("bhkError");
    hideMessage("bhkSuggestion");

    if (isNaN(area) || sqftInput.value === "") {
        showMessage("areaError", "⚠ Please enter the property area.");
        return false;
    }

    if (area < AREA_MIN) {
        showMessage("areaError", "❌ Area cannot be less than " + AREA_MIN + " sqft.");
        return false;
    }

    if (area > AREA_MAX) {
        showMessage("areaError", "❌ Area exceeds the supported limit. Please enter a value between " + AREA_MIN + " and " + AREA_MAX + " sqft.");
        return false;
    }

    if (area > LUXURY_AREA_THRESHOLD) {
        showMessage("areaWarning", "⚠ Large property detected. Prediction accuracy may be slightly lower for very large homes.");
    }

    var range = bhkRangeForArea(area);
    if (bhk < range[0] || bhk > range[1]) {
        var suggestion = range[0] === range[1] ? (range[0] + " BHK") : (range[0] + "–" + range[1] + " BHK");
        showMessage("bhkError",
            "❌ " + area + " sqft is not realistic for " + bhk + " BHK. Suggested: " + suggestion + ".");
        return false;
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

/* ---------------- Result presentation helpers ---------------- */

function priceCategory(priceInLakhs) {
    if (priceInLakhs < 30) return { label: "🏠 Budget Property", stars: 2 };
    if (priceInLakhs < 70) return { label: "🏡 Mid-Range Property", stars: 3 };
    if (priceInLakhs < 150) return { label: "🌟 Premium Property", stars: 4 };
    return { label: "💎 Luxury Property", stars: 5 };
}

function formatPrice(priceInLakhs) {
    if (priceInLakhs >= 100) {
        return "₹ " + (priceInLakhs / 100).toFixed(2) + " Crore";
    }
    return "₹ " + priceInLakhs.toFixed(2) + " Lakhs";
}

function estimateConfidence(area, bhk, bath) {
    var range = bhkRangeForArea(area);
    var mid = (range[0] + range[1]) / 2;
    var bhkDistance = Math.abs(bhk - mid) / Math.max(1, (range[1] - range[0]));
    var bathBalanced = (bath >= bhk - 1 && bath <= bhk + 1);

    var confidence = 96;
    confidence -= bhkDistance * 12;
    if (!bathBalanced) confidence -= 6;
    if (area > LUXURY_AREA_THRESHOLD) confidence -= 5;

    confidence = Math.max(70, Math.min(97, Math.round(confidence)));
    return confidence;
}

function renderAdvisor(area, bhk, bath, priceInLakhs) {
    var tips = [];

    if (bhk >= 4) {
        tips.push("✔ Ideal for a family of " + (bhk + 1) + "–" + (bhk + 2) + " members.");
    } else {
        tips.push("✔ Suitable for a family of " + Math.max(2, bhk) + "–" + (bhk + 1) + " members.");
    }

    tips.push("✔ Recommended parking: " + (bhk >= 3 ? "1–2 cars" : "1 car") + ".");

    if (priceInLakhs < 70) {
        tips.push("✔ Falls in an affordable price segment, good for first-time buyers.");
    } else if (priceInLakhs < 150) {
        tips.push("✔ Price falls in the mid-to-premium range segment.");
    } else {
        tips.push("✔ High-value property with strong long-term investment potential.");
    }

    var areaPerBedroom = area / bhk;
    if (areaPerBedroom >= 350) {
        tips.push("✔ Spacious bedroom-to-area ratio — comfortable living space.");
    } else {
        tips.push("✔ Compact but functional bedroom-to-area ratio.");
    }

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
    requestAnimationFrame(function () {
        el.style.width = percent + "%";
    });
}

/* ---------------- Main estimate handler ---------------- */

function setLoading(isLoading) {
    var btn = document.getElementById("estimateBtn");
    var btnText = document.getElementById("btnText");
    var spinner = document.getElementById("btnSpinner");

    btn.disabled = isLoading;
    btnText.textContent = isLoading ? "Predicting..." : "Estimate Price";
    spinner.style.display = isLoading ? "inline-block" : "none";
}

function onClickedEstimatePrice() {
    document.getElementById("resultCard").style.display = "none";
    document.getElementById("summaryCard").style.display = "none";
    document.getElementById("predictionErrorCard").style.display = "none";

    var sqftInput = document.getElementById("uiSqft");
    var area = parseFloat(sqftInput.value);
    var bhk = getBHKValue();
    var bathrooms = getBathValue();
    var location = document.getElementById("uiLocations");

    var areaOk = validateAreaAndBHK();
    var bathOk = validateBathSelection();
    var locationOk = validateLocation();

    if (!areaOk || !bathOk || !locationOk) {
        return;
    }

    // Show property summary while predicting
    document.getElementById("sumArea").textContent = area + " sqft";
    document.getElementById("sumBhk").textContent = bhk;
    document.getElementById("sumBath").textContent = bathrooms;
    document.getElementById("sumLocation").textContent = location.value;
    document.getElementById("summaryCard").style.display = "block";

    setLoading(true);

    var url = "/predict_home_price";

    $.post(url, {
        sqft: area,
        bhk: bhk,
        bath: bathrooms,
        location: location.value
    })
    .done(function (data) {
        setLoading(false);

        if (!data || typeof data.estimated_price === "undefined" || data.estimated_price === null) {
            showPredictionError("❌ Prediction failed. Please try again later.");
            return;
        }

        var price = Number(data.estimated_price);

        document.getElementById("uiEstimatedPrice").innerHTML = formatPrice(price);

        var low = (price * 0.93).toFixed(2);
        var high = (price * 1.07).toFixed(2);
        document.getElementById("priceRange").textContent =
            "Possible Range: " + formatPrice(parseFloat(low)) + " – " + formatPrice(parseFloat(high));

        var cat = priceCategory(price);
        document.getElementById("priceCategory").textContent = cat.label;
        document.getElementById("ratingStars").textContent = "★".repeat(cat.stars) + "☆".repeat(5 - cat.stars);

        var confidence = estimateConfidence(area, bhk, bathrooms);
        document.getElementById("confidenceValue").textContent = confidence + "%";
        animateBar("confidenceFill", confidence);

        var range = bhkRangeForArea(area);
        var areaPercent = Math.min(100, (area / AREA_MAX) * 100);
        var bhkPercent = Math.min(100, (bhk / 7) * 100);
        var bathPercent = Math.min(100, (bathrooms / 7) * 100);
        animateBar("barArea", areaPercent);
        animateBar("barBhk", bhkPercent);
        animateBar("barBath", bathPercent);

        renderAdvisor(area, bhk, bathrooms, price);

        document.getElementById("resultCard").style.display = "block";
        document.getElementById("resultCard").scrollIntoView({ behavior: "smooth", block: "center" });
    })
    .fail(function () {
        setLoading(false);
        showPredictionError("🌐 Unable to connect to the server. Check your internet connection and try again.");
    });
}

function showPredictionError(message) {
    var el = document.getElementById("predictionErrorCard");
    el.style.display = "block";
    el.textContent = message;
}

/* ---------------- Dark mode ---------------- */

function initTheme() {
    var toggle = document.getElementById("themeToggle");
    var saved = localStorage.getItem("theme");

    if (saved === "dark") {
        document.documentElement.setAttribute("data-theme", "dark");
        toggle.textContent = "☀️";
    }

    toggle.addEventListener("click", function () {
        var isDark = document.documentElement.getAttribute("data-theme") === "dark";
        if (isDark) {
            document.documentElement.removeAttribute("data-theme");
            toggle.textContent = "🌙";
            localStorage.setItem("theme", "light");
        } else {
            document.documentElement.setAttribute("data-theme", "dark");
            toggle.textContent = "☀️";
            localStorage.setItem("theme", "dark");
        }
    });
}

/* ---------------- Page load ---------------- */

function onPageLoad() {
    var url = "/get_location_names";

    $.get(url, function (data) {
        if (data) {
            var locations = data.locations;
            $("#uiLocations").empty();
            $("#uiLocations").append(new Option("Choose Location", ""));
            for (var i = 0; i < locations.length; i++) {
                $("#uiLocations").append(new Option(locations[i], locations[i]));
            }
        }
    });

    var bhkRadios = document.getElementsByName("uiBHK");
    for (var i = 0; i < bhkRadios.length; i++) {
        bhkRadios[i].addEventListener("change", updateBathOptions);
    }

    document.getElementById("uiSqft").addEventListener("input", validateAreaAndBHK);
    document.getElementById("uiLocations").addEventListener("change", validateLocation);

    updateBathOptions();
    initTheme();
}

window.onload = onPageLoad;






































// // function getBathValue() {
// //   var uiBathrooms = document.getElementsByName("uiBathrooms");
// //   for(var i in uiBathrooms) {
// //     if(uiBathrooms[i].checked) {
// //         return parseInt(i)+1;
// //     }
// //   }
// //   return -1; // Invalid Value
// // }

// function getBathValue() {
//     var uiBathrooms = document.getElementsByName("uiBathrooms");

//     for (var i = 0; i < uiBathrooms.length; i++) {
//         if (uiBathrooms[i].checked) {
//             return parseInt(uiBathrooms[i].value);
//         }
//     }

//     return -1;
// }


// // function getBHKValue() {
// //   var uiBHK = document.getElementsByName("uiBHK");
// //   for(var i in uiBHK) {
// //     if(uiBHK[i].checked) {
// //         return parseInt(i)+1;
// //     }
// //   }
// //   return -1; // Invalid Value
// // }


// function getBHKValue() {
//     var uiBHK = document.getElementsByName("uiBHK");

//     for (var i = 0; i < uiBHK.length; i++) {
//         if (uiBHK[i].checked) {
//             return parseInt(uiBHK[i].value);
//         }
//     }

//     return -1;
// }




// function updateBathOptions() {

//     var bhk = getBHKValue();

//     var bathRadios = document.getElementsByName("uiBathrooms");

//     var maxBath = Math.min(7, bhk + 2);

//     for (var i = 0; i < bathRadios.length; i++) {

//         var bath = parseInt(bathRadios[i].value);

//         if (bath <= maxBath) {

//             bathRadios[i].disabled = false;

//         } else {

//             bathRadios[i].disabled = true;

//             if (bathRadios[i].checked) {

//                 bathRadios[0].checked = true;

//             }

//         }

//     }

// }










// function validateBathSelection() {

//     var bhk = getBHKValue();

//     var bath = getBathValue();

//     var error = document.getElementById("bathError");

//     if (bath > bhk + 2) {

//         error.style.display = "block";

//         error.innerHTML =
//         "❌ You cannot select more than " +
//         (bhk + 2) +
//         " bathrooms for " +
//         bhk +
//         " BHK.";

//         return false;

//     }

//     error.style.display = "none";

//     error.innerHTML = "";

//     return true;

// }








// function onClickedEstimatePrice() {
//   console.log("Estimate price button clicked");

//   var sqft = document.getElementById("uiSqft");
//   var bhk = getBHKValue();
//   var bathrooms = getBathValue();


//   var location = document.getElementById("uiLocations");

//   if (!validateBathSelection()) {

//     return;

// }

// if (sqft.value <= 0) {

//     alert("Please enter a valid area.");

//     return;

// }

// if (location.value == "") {

//     alert("Please select a location.");

//     return;

// }



//   var estPrice = document.getElementById("uiEstimatedPrice");

// //   var url = "http://127.0.0.1:5000/predict_home_price";
// var url = "/predict_home_price";
//   $.post(url, {
//       sqft: parseFloat(sqft.value),
//       bhk: bhk,
//       bath: bathrooms,
//       location: location.value
//   }, function(data, status) {
//       // estPrice.innerHTML = "<h2>₹ " + data.estimated_price + " Lakhs</h2>";
//       // estPrice.innerHTML ="<h2>₹ " + Number(data.estimated_price).toFixed(2) + " Lakhs</h2>";
//       if(data.estimated_price){

//     estPrice.innerHTML =
//     "<h2>₹ "+Number(data.estimated_price).toFixed(2)+" Lakhs</h2>";
//   }else{

//     estPrice.innerHTML =
//     "<h2>Prediction Failed</h2>";
//   } 

//   });
// }















// function onPageLoad() {

//     console.log("document loaded");

//     var url = "/get_location_names";

//     $.get(url, function(data, status){

//         if(data){

//             var locations = data.locations;

//             $("#uiLocations").empty();

//             $("#uiLocations").append(
//                 new Option("Choose Location","")
//             );

//             for(var i=0;i<locations.length;i++){

//                 $("#uiLocations").append(
//                     new Option(locations[i], locations[i])
//                 );

//             }

//         }

//     });

//     var bhkRadios=document.getElementsByName("uiBHK");

//     for(var i=0;i<bhkRadios.length;i++){

//         bhkRadios[i].addEventListener("change",updateBathOptions);

//     }

//     updateBathOptions();

// }


// window.onload = onPageLoad;
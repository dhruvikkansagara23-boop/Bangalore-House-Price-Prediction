// function getBathValue() {
//   var uiBathrooms = document.getElementsByName("uiBathrooms");
//   for(var i in uiBathrooms) {
//     if(uiBathrooms[i].checked) {
//         return parseInt(i)+1;
//     }
//   }
//   return -1; // Invalid Value
// }

function getBathValue() {
    var uiBathrooms = document.getElementsByName("uiBathrooms");

    for (var i = 0; i < uiBathrooms.length; i++) {
        if (uiBathrooms[i].checked) {
            return parseInt(uiBathrooms[i].value);
        }
    }

    return -1;
}


// function getBHKValue() {
//   var uiBHK = document.getElementsByName("uiBHK");
//   for(var i in uiBHK) {
//     if(uiBHK[i].checked) {
//         return parseInt(i)+1;
//     }
//   }
//   return -1; // Invalid Value
// }


function getBHKValue() {
    var uiBHK = document.getElementsByName("uiBHK");

    for (var i = 0; i < uiBHK.length; i++) {
        if (uiBHK[i].checked) {
            return parseInt(uiBHK[i].value);
        }
    }

    return -1;
}




function updateBathOptions() {

    var bhk = getBHKValue();

    var bathRadios = document.getElementsByName("uiBathrooms");

    var maxBath = Math.min(7, bhk + 2);

    for (var i = 0; i < bathRadios.length; i++) {

        var bath = parseInt(bathRadios[i].value);

        if (bath <= maxBath) {

            bathRadios[i].disabled = false;

        } else {

            bathRadios[i].disabled = true;

            if (bathRadios[i].checked) {

                bathRadios[0].checked = true;

            }

        }

    }

}










function validateBathSelection() {

    var bhk = getBHKValue();

    var bath = getBathValue();

    var error = document.getElementById("bathError");

    if (bath > bhk + 2) {

        error.style.display = "block";

        error.innerHTML =
        "❌ You cannot select more than " +
        (bhk + 2) +
        " bathrooms for " +
        bhk +
        " BHK.";

        return false;

    }

    error.style.display = "none";

    error.innerHTML = "";

    return true;

}








function onClickedEstimatePrice() {
  console.log("Estimate price button clicked");

  var sqft = document.getElementById("uiSqft");
  var bhk = getBHKValue();
  var bathrooms = getBathValue();


  var location = document.getElementById("uiLocations");

  if (!validateBathSelection()) {

    return;

}

if (sqft.value <= 0) {

    alert("Please enter a valid area.");

    return;

}

if (location.value == "") {

    alert("Please select a location.");

    return;

}



  var estPrice = document.getElementById("uiEstimatedPrice");

  var url = "http://127.0.0.1:5000/predict_home_price";

  $.post(url, {
      sqft: parseFloat(sqft.value),
      bhk: bhk,
      bath: bathrooms,
      location: location.value
  }, function(data, status) {
      // estPrice.innerHTML = "<h2>₹ " + data.estimated_price + " Lakhs</h2>";
      // estPrice.innerHTML ="<h2>₹ " + Number(data.estimated_price).toFixed(2) + " Lakhs</h2>";
      if(data.estimated_price){

    estPrice.innerHTML =
    "<h2>₹ "+Number(data.estimated_price).toFixed(2)+" Lakhs</h2>";
  }else{

    estPrice.innerHTML =
    "<h2>Prediction Failed</h2>";
  } 

  });
}















function onPageLoad() {
  console.log("document loaded");

  var url = "http://127.0.0.1:5000/get_location_names";

  $.get(url, function(data, status) {
      if (data) {
          var locations = data.locations;
          var uiLocations = document.getElementById("uiLocations");
          // $('#uiLocations').empty();
          $('#uiLocations').empty();

          $('#uiLocations').append(
            new Option("Choose Location","")
           );
           document.getElementById("uiLocations").selectedIndex=0;

          for (var i = 0; i < locations.length; i++) {
              var opt = new Option(locations[i]);
              $('#uiLocations').append(opt);
          }
      }
  });






  var bhkRadios = document.getElementsByName("uiBHK");

for (var i = 0; i < bhkRadios.length; i++) {

    bhkRadios[i].addEventListener("change", updateBathOptions);

}

updateBathOptions();
}

window.onload = onPageLoad;


// window.onload = onPageLoad;
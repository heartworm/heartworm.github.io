function output(text) {
    var para = document.createElement("p");
    para.textContent = text;
    document.getElementById("map").appendChild(para);
}

function getStreet(coords) {
    var xhr = new XMLHttpRequest();
    var url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.latitude},${coords.longitude}&key=AIzaSyA-K51pIu7DeSZnkvRYU75MmlaU8sjwYjM`;
    xhr.onload = (event) => {
        if (xhr.status == 200) {
            var responseObj = JSON.parse(xhr.response);
            console.log(responseObj);
            if (responseObj.status == "OK") {
                var mostAccurate = responseObj.results[0];
                var locationTypes = mostAccurate.types;
                if (locationTypes.includes("street_address") || locationTypes.includes("route")) {
                    //the geocoding is accurate enough to be useful
                    var isBuilding = false;
                    var addrTemplate = "";
                    for (comp of mostAccurate.address_components) {
                        if (isBuilding || comp.types.includes("route")) {
                            isBuilding = true;
                            addrTemplate += " " + comp.long_name;
                        }
                    }
                    output ("Found address stub: <streetnum>" + addrTemplate);
                } else {
                    output ("Found location isn't accurate enough :(");
                }
            } else {
                output("Couldn't find an address for the coordinate. Reverse Geocoding failed.");
            }
        } else {
            output ("XHR Failed: " + xhr.status);
            console.log(xhr);
        }
    };
    xhr.open("GET", url);
    xhr.send();
}

function getLocation() {
    if (navigator.geolocation) {
        var positionOptions = {
            enableHighAccuracy : true,
            timeout: Infinity,
            maximumAge: 1000 //ms
        }; 
        var geo = navigator.geolocation;
        geo.getCurrentPosition((pos) => {
            output(`Lat ${pos.coords.latitude}, Long ${pos.coords.longitude}, Time ${pos.timestamp}`);
            getStreet(pos.coords);
        }, (posErr) => {
            output(`Couldn't get location, reason: ${posErr.message}`);
        }, positionOptions);
    }
}
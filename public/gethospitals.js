async function fetchData() {
  try {
    //const url = "https://api.data.gov.in/resource/98fa254e-c5f8-4910-a19b-4828939b477d?api-key=579b464db66ec23bdd000001d605f7f3ebbb4bbb71508ac4ac7f88ae&format=json&limit=30274";
    const url="data/data.json";
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    // console.log(data);
    // console.log(data[0]);

    return data;
  } catch (err) {
    console.error(err);
    return []; // Return an empty array in case of an error
  }
}

async function getHospitals(pincode) {
  try {
    const hospitals1 = await fetchData();
    pincode = parseInt(pincode, 10);

    const selectElement = document.getElementById('hospital-list');
    selectElement.innerHTML = '';

    hospital_data = hospitals1.filter(
      (h) => parseInt((Math.ceil(h.Pincode / 100.0)) * 10) === parseInt((Math.ceil(pincode / 100.0)) * 10)
    );

    const pincodeInput = document.getElementById('pincode');
    const addressInput = document.getElementById('hospaddr');

    // Add an event listener to the select element
    selectElement.addEventListener('change', function () {
      const selectedHospital = hospital_data.find((h) => h.Hospital_Name === selectElement.value);
      if (selectedHospital) {
        pincodeInput.value = selectedHospital.Pincode;
        addressInput.value = selectedHospital.Address_Original_First_Line;
      } else {
        // Clear the input fields if no hospital is selected
        pincodeInput.value = '';
        addressInput.value = '';
      }
    });

    const hospitalInput = document.getElementById('hospital');
    hospitalInput.addEventListener('input', function () {
      const inputHospitalName = hospitalInput.value.trim();
      
      const matchedHospital = hospital_data.find((h) => h.Hospital_Name === inputHospitalName);
      if (matchedHospital) {
        pincodeInput.value = matchedHospital.Pincode;
        addressInput.value = matchedHospital.Address_Original_First_Line;
      } else {
        // Clear the input fields if no matching hospital is found
        pincodeInput.value = '';
        addressInput.value = '';
      }
    });

    hospital_data.forEach(function (h) {
      const option = document.createElement('option');
      option.value = h.Hospital_Name;
      option.textContent = h.Hospital_Name + ', ' + h.Location;
      selectElement.appendChild(option);
    });
  } catch (err) {
    console.error(err);
  }
}




const pincodeInput = document.getElementById('pincode');
pincodeInput.addEventListener('input', (event) => {
  const pincode = event.target.value.trim();
  getHospitals(pincode);
});
 
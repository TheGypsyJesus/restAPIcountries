//Initialize
var mymap = L.map('leaflet-map').locate({setView: true, maxZoom: 6});//Set current location

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(mymap);//establish Tile style selection

//Array ini
let selectOptions = [];
let selectValues = [];
const selectOpt = document.getElementById('countrySelection');
let restApiData;
let latForW = 0;
let lngForW = 0;



//REST Countries data
$(document).ready(function() {
	//Fetch Data for select initialization
	$.ajax({
		url: 'php/restcountries.php',
		type: 'GET',
		dataType: 'json',
    success: function(result) {
			restApiData = result;

			for (var i = 0; i < result['data'].length; i++) {
				selectOptions.push(result['data'][i]['name']);
				selectValues.push(result['data'][i]['alpha3Code']);
			}
			for (var i = 0; i < selectOptions.length; i++) {
				let opt = document.createElement('option');
				opt.value = selectValues[i];
				opt.innerHTML = selectOptions[i];
				selectOpt.appendChild(opt);
			}

    },
    error: function(jqXHR, textStatus, errorThrown) {}
  });

});

	//Events to fire when a new option is selected
$('.country-selection').change(function() {
	let x = $('#countrySelection').val();
	console.log(`You have selected ${x}!`);


	$.ajax({
		url: 'php/selectcountrydata.php',
		type: 'POST',
		dataType: 'json',
		data: {
			alpha3: $('#countrySelection').val()
		},
    success: function(result) {
			console.log(result);
      if (result.status.name === 'ok') {
				let name = result['data']['name'];
				let cap = result['data']['capital'];
				let pop = result['data']['population'];
				let currency = result['data']['currencies'][0]['code'];
				let weatherLng = result['data']['latlng'][1];
				let weatherLat = result['data']['latlng'][0];
				let area = result['data']['area'];

				let flag = document.getElementById('country-flag');
				flag.src = result['data']['flag'];
				flag.alt = result['data']['demonym'];
				document.querySelector('.modal-body').appendChild(flag);

      	$('.name-cap').html(`<h2>${name}</h2><br><h5>Capital: <h6>${cap}</h6></h5>`);
				$('.popu').html(`<h5>Population: <h6>${pop}</h6></h5>`);
				$('.currency-pot').html(`${currency}`);
				$('.weather-lat').html(`${weatherLat}`);
				$('.weather-lng').html(`${weatherLng}`);
				$('.count-name').html(`${cap}`);
				latForW = weatherLat;
				lngForW = weatherLng;

				let zoomLevel = 6;
				if(area > 0 && area <= 500){
					zoomLevel = 11;
				}else if (area > 200000 && area <= 300000) {
					zoomLevel = 6;
				} else if (area > 300000 && area <= 7000000) {
					zoomLevel = 5;
				} else if (area > 7000000 && area <= 9000000) {
					zoomLevel = 4;
				} else if (area > 9000000) {
					zoomLevel = 3;
				}

				mymap.setView([weatherLat, weatherLng], zoomLevel);


      }

    },
    error: function(jqXHR, textStatus, errorThrown) {}
  });


	setTimeout(function(){
		$.ajax({
			url: 'php/exchangerates.php',
			type: 'GET',
			dataType: 'json',
			success: function(result) {
				let value = $('.currency-pot').html();
				if (value === 'GBP') {
					$('.curr-exch').html(`<h5>Currency: <h6>${value}</h6></h5><h5>Exchange Rate: <h6>1</h6></h5>`);
				} else {
					let gbpExch = 1.38699910261 * result['data']['rates'][`${value}`];
					$('.curr-exch').html(`<h5>Currency: <h6>${value}</h6></h5><h5>Exchange Rate: <h6>${gbpExch}</h6></h5>`);
				}

			},
			error: function(jqXHR, textStatus, errorThrown) {}
		});

		$.ajax({
			url: 'php/latlngweather.php',
			type: 'POST',
			dataType: 'json',
			data: {
				latitude: latForW,
				longitude: lngForW
			},
			success: function(result) {
				console.log(result);
			},
			error: function(jqXHR, textStatus, errorThrown) {}
		});

		$.ajax({
			url: 'php/wikilinks.php',
			type: 'POST',
			dataType: 'json',
			data: {
				lat: latForW,
				lng: lngForW
			},
			success: function(result) {
				console.log(result);
			},
			error: function(jqXHR, textStatus, errorThrown) {}
		});
	},1000);
});


setTimeout(function(){console.log(restApiData);},5000);






//Scroll Anchor :)

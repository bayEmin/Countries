// GET data çekmek için, POST ise bilgi göndermek için kullanılır.
// open ile bir istek başlatırız.
// send ile bu isteği servise göndeririz.

const searchButton = document.querySelector('#btnSearch');
const searchInput = document.querySelector('#textSearch');
const countryDetails = document.querySelector('#country-details');
const neighborsDetails = document.querySelector('#neighbors');
const showNeighbors = document.querySelector('#neighbors-div');
const errors = document.querySelector('#errors');
const currentLocation = document.querySelector('#btnLocation');
const loading = document.querySelector('#loading');

searchButton.addEventListener('click', () => {
    let search = searchInput.value;
    loading.classList.remove('visible');
    getCountry(search);
    // getCities();
});

currentLocation.addEventListener('click', () => {
    console.log(navigator.geolocation);
    if(navigator.geolocation) {
    loading.classList.add('visible');
    navigator.geolocation.getCurrentPosition(onSuccess, onError);
    }
});

async function onSuccess(position){
    let latitude = position.coords.latitude;
    let longitude = position.coords.longitude;

    // API, OpenCageData

    const api_key = '95cce72c72d54b3ea4a3135fdbc8b8ee ';
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${api_key}`;

    const response = await fetch(url);
    const current = await response.json();
    
    const currentCountry = await current.results[0].components.country;
    searchInput.value = currentCountry;
    searchButton.click();
}

function onError(error) {
    loading.classList.add('visible');
}

async function getCountry(country) {
    try{
        const response = await fetch('https://restcountries.com/v3.1/name/' + country);
        if(!response.ok){ 
            throw new Error('Country not found.')
        }
        const data = await response.json();
        renderCountry(data[0]);
        const countries = data[0].borders;
        if(!countries) {
            throw new Error('Neighbor Countries not found.');
        }
        else {
            const neighborResponse = await fetch('https://restcountries.com/v3.1/alpha?codes=' + countries);
            const borderData = await neighborResponse.json();
            const hasNeighbor = data.length > 0 ? showNeighbors.classList = 'card mt-3' : showNeighbors.classList = 'card mt-3 visible' ;
            if(!hasNeighbor)
                throw new Error('Border Countries not found.');
            renderNeighbors(borderData);
        }
    }
    catch(error){
        renderError(error);
    }
}

function renderCountry(data) {
    loading.classList.add('visible');
    countryDetails.innerHTML = '';
    errors.innerHTML = '';
    let html = `
        <div class="card-header">
            <h3 class="card-title">Search Results</h3>
        </div>
        <div class="card-body">
            <div class="row">
                <div class="col-4">
                    <img src="${data.flags.png}" alt="" class="bg img-fluid">
                </div>
                <div class="col-8">
                    <h3 class="card-title">${data.name.common}</h3>
                    <hr>
                    <div class="row">
                        <div class="col-4">Population : </div>
                        <div class="col-8">${(data.population / 1000000).toFixed(1)} Million</div>
                    </div>
                    <div class="row">
                        <div class="col-4">Languages : </div>
                        <div class="col-8">${Object.values(data.languages)}</div>
                    </div>
                    <div class="row">
                        <div class="col-4">Capital City : </div>
                        <div class="col-8">${data.capital[0]}</div>
                    </div>
                    <div class="row">
                        <div class="col-4">Region : </div>
                        <div class="col-8">${data.region}</div>
                    </div>
                    <div class="row">
                        <div class="col-4">Currencies : </div>
                        <div class="col-8">${Object.values(data.currencies)[0].name} (${Object.values(data.currencies)[0].symbol})</div>
                    </div>
                </div>
            </div>
        </div>`;

        countryDetails.insertAdjacentHTML('beforeend', html);
}

function renderNeighbors(data) {
    neighborsDetails.innerHTML = '';
    for(let country of data) {
        let html = `
            <div class="col-2 mt-2">
                <div class="card" id="${country.name.common}">
                    <img src="${country.flags.png}" class="card-img-top">
                    <div class="card-body">
                        <h6 class="card-title">${country.name.common}</h6>
                    </div>
                </div>
            </div>
        `;
        neighborsDetails.insertAdjacentHTML('beforeend', html);
    }
}

function renderError(err) {
    loading.classList.add('visible');
    errors.innerHTML = '';
    const html = `
    <div class="alert alert-danger text-center">
        <h4>${err.message}</h4>
    </div>
    `;
    if(countryDetails.innerHTML === '') {
        errors.insertAdjacentHTML('beforeend', html);
    }
    else {
        neighborsDetails.innerHTML = '';
        showNeighbors.classList = 'card mt-3 visible' ;
        errors.insertAdjacentHTML('beforeend', html);
    }
}
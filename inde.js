// Define the URL for fetching Pokémon types
const pokeTypeURL = 'https://pokeapi.co/api/v2/type/';

// Extract query parameters from the URL
const pokeQueryParams = new URLSearchParams(window.location.search);

// Extract the 'type' parameter from the query parameters
const typeParams = new URLSearchParams(window.location.search);
const typeSearch = typeParams.get('type');

// Select elements from the DOM
const pokedex = document.getElementById('pokedex');
const pokemonSearchForm = document.querySelector('#pokemon-search-form');
const pokemonTypeFilter = document.querySelector('.type-filter');

// Define arrays and sets to store Pokémon data
let pokemonArray = [];
let uniqueTypes = new Set();

// Function to fetch Pokémon data from the API
const fetchPokemon = async () => {
    try {
        // Array to store fetch promises
        const promises = [];
        // Loop to fetch data for the first 151 Pokémon
        for (let i = 1; i <= 151; i++) {
            const pokemonURL = `https://pokeapi.co/api/v2/pokemon/${i}`;
            promises.push(fetch(pokemonURL).then(response => response.json()));
        }
        // Resolve all promises concurrently
        const allPokemon = await Promise.all(promises);
        // Process fetched Pokémon data
        const firstGenPokemon = allPokemon.map(pokemon => ({
            frontImage: pokemon.sprites['front_default'],
            pokemon_id: pokemon.id,
            name: pokemon.name,
            type: pokemon.types[0].type.name,
            abilities: pokemon.abilities.map(ability => ability.ability.name).join(', '),
            description: pokemon.species.url
        }));
        pokemonArray = firstGenPokemon;
        createPokemonCards(firstGenPokemon);
    } catch (error) {
        console.error('Error fetching Pokémon data:', error);
    }
};

// Call the fetchPokemon function to initiate data fetching
fetchPokemon();

// Event listener for input changes in the search form
pokemonSearchForm.addEventListener('input', (event) => {
    const filterPokemon = pokemonArray.filter(pokemon => pokemon.name.includes(event.target.value.toLowerCase()));
    clearPokedex();
    createPokemonCards(filterPokemon);
});

// Function to clear the Pokémon list
function clearPokedex() {
    pokedex.innerHTML = '';
}

// Function to create Pokémon cards
function createPokemonCards(pokemons) {
    let currentPokemon = pokemons;
    if (typeSearch) {
        currentPokemon = pokemons.filter(pokemon => pokemon.type.includes(typeSearch.toLowerCase()));
    }
    currentPokemon.forEach(pokemon => {
        createPokemonCard(pokemon);
    });
}

// Function to create individual Pokémon card elements
function createPokemonCard(pokemon) {
    // Create a flip card element
    const flipCard = document.createElement('div');
    flipCard.classList.add('flip-card');
    flipCard.id = `${pokemon.name}`;
    pokedex.append(flipCard);

    // Create front and back card containers
    const flipCardInner = document.createElement('div');
    flipCardInner.classList.add('flip-card-inner');
    flipCardInner.id = `${pokemon.type}`;
    flipCard.append(flipCardInner);

    // Create front card elements
    const frontCard = document.createElement('div');
    frontCard.classList.add('front-pokemon-card');

    const frontImage = document.createElement('img');
    frontImage.src = `${pokemon.frontImage}`;
    frontImage.classList.add('front-pokemon-image');

    const frontPokeName = document.createElement('h2');
    frontPokeName.innerHTML = `<a href="/pokemon.html?pokemon_id=${pokemon.pokemon_id}">${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</a>`;

    const frontPokeID = document.createElement('p');
    frontPokeID.textContent = `#${pokemon.pokemon_id}`;
    frontPokeID.classList.add('front-poke-id');

    frontCard.append(frontImage, frontPokeID, frontPokeName);
    
    // Create back card elements
    const backCard = document.createElement('div');
    backCard.classList.add('back-pokemon-card');

    const backPokeAbilities = document.createElement('p');
    backPokeAbilities.innerHTML = `<p>Abilities:<br>${pokemon.abilities}<p>`;
    backPokeAbilities.classList.add('back-pokemon-abilities');

    backCard.append(backPokeAbilities);
    flipCardInner.append(frontCard, backCard);

    // Add the Pokémon type to the set of unique types
    uniqueTypes.add(pokemon.type);
}

// Function to generate options for Pokémon types
function generateTypes() {
    uniqueTypes.forEach(type => {
        const typeOption = document.createElement('option');
        typeOption.textContent = type.charAt(0).toUpperCase() + type.slice(1);
        typeOption.value = type;
        pokemonTypeFilter.append(typeOption);
    });
}

// Call the generateTypes function to populate the type filter dropdown
generateTypes();

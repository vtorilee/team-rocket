const BASE_URL = "https://pokeapi.co/api/v2";

// get list of Pokémon
export const getPokemonList = async (limit = 20, offset = 0) => {
  try {
    const res = await fetch(
      `${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`
    );
    const data = await res.json();
    return data;
  } catch (error) {
    console.log("error fetching:", error);
    return null;
  }
};

// get single Pokémon
export const getPokemon = async (nameOrId) => {
  try {
    const res = await fetch(`${BASE_URL}/pokemon/${nameOrId}`);
    const data = await res.json();
    return data;
  } catch (error) {
    console.log("error fetchin:", error);
    return null;
  }
};
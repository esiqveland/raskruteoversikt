import { Module } from 'storeon'
import ReactGA from "react-ga";
import { Rute } from "../api/types";

// State structure
export interface SearchState {
    hasSearched: boolean;
    isFetching: boolean;
    error?: string;
    result?: SearchResponse;
    searchTerm: string;
}

export interface SearchStateRoot {
    search: SearchState
}

// Events declaration: map of event names to type of event data
export interface SearchEvents {
    'search/search': string;
    'search/setSearch': Array<Rute> | undefined;
    'search/setState': Partial<SearchState>;
    'search/api/search': string;
}

export const searchModule: Module<SearchStateRoot, SearchEvents> = store => {
    store.on('@init', () => ({ search: { hasSearched: false, isFetching: false, searchTerm: '' }}));
    store.on('search/search', (state, text) => ({ search: { ...state.search, searchTerm: text }}));
    store.on('search/setState', (state, next) => ({ search: { ...state.search, ...next }}));
    store.on('search/setSearch', (state, next) => ({ search: { ...state.search, result: next }}));

    store.on('search/api/search', async (state, term) => {
        store.dispatch('search/setState', { isFetching: true, hasSearched: true })

        try {
            ReactGA.event({
                category: 'Search',
                action: 'Search route',
                label: 'Search',
            });

            const result = await searchApi(term)
            store.dispatch('search/setState', {
                hasSearched: true,
                isFetching: false,
                result: result,
                error: undefined,
            });
        } catch(err) {
            console.log('Error fetching data: ', err);

            store.dispatch('search/setState', {
                hasSearched: true,
                isFetching: false,
                error: 'Vi beklager så mye, men noe gikk galt :(',
            });
        }
    });
}

type SearchResponse = Array<Rute>
async function searchApi(text: string): Promise<SearchResponse> {
    return fetch(`/api/v2/search/${text}`)
        .then(response => response.json())
        .then((response: SearchResponse) => response.filter(result => result.PlaceType === 'Stop'))
}

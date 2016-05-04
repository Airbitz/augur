import { MARKETS, ACCOUNT, MAKE, POSITIONS, TRANSACTIONS, M } from '../../app/constants/pages';
import { REGISTER, LOGIN } from '../../auth/constants/auth-types';

export const PATHS_PAGES = {
    '/': MARKETS,
    '/account': ACCOUNT,
    '/make': MAKE,
    '/positions': POSITIONS,
    '/transactions': TRANSACTIONS,
    '/register': REGISTER,
    '/login': LOGIN,
    '/m': M
};
export const PAGES_PATHS = Object.keys(PATHS_PAGES).reduce((finalObj, key) => { finalObj[PATHS_PAGES[key]] = key; return finalObj }, {});

export const PATHS_AUTH = {
    '/register': REGISTER,
    '/login': LOGIN
};
export const AUTH_PATHS = Object.keys(PATHS_AUTH).reduce((finalObj, key) => { finalObj[PATHS_AUTH[key]] = key; return finalObj }, {});
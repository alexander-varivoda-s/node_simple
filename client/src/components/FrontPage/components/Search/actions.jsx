import { createAction } from 'redux-actions';

// eslint-disable-next-line import/prefer-default-export
export const search = createAction('SEARCH', phrase => ({ phrase }));

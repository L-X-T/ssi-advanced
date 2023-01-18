import { ActionReducer, ActionReducerMap, MetaReducer } from '@ngrx/store';
import { routerReducer } from '@ngrx/router-store';
import { environment } from '../../environments/environment';
import { localStorageSync } from 'ngrx-store-localstorage';
import { flightBookingFeatureKey } from '../flight-booking/+state/flight-booking.reducer';

export interface State {}

export const reducers: ActionReducerMap<State> = {
  router: routerReducer
};

export function localStorageSyncReducer(reducer: ActionReducer<any>): ActionReducer<any> {
  return localStorageSync({ keys: [flightBookingFeatureKey], rehydrate: true })(reducer);
}

export const metaReducers: Array<MetaReducer<any, any>> = [localStorageSyncReducer];

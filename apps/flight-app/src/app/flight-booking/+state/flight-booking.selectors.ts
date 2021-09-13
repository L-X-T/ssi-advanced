import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromFlightBooking from './flight-booking.reducer';
import { FlightBookingAppState, flightBookingFeatureKey } from './flight-booking.reducer';

/*export const selectFlightBookingState = createFeatureSelector<fromFlightBooking.State>(
  fromFlightBooking.flightBookingFeatureKey
);*/

export const selectFlights = (appState: FlightBookingAppState) => appState[flightBookingFeatureKey].flights;
export const negativeList = (appState: FlightBookingAppState) => appState[flightBookingFeatureKey].negativeList;

export const selectFilteredFlights = createSelector(selectFlights, negativeList, (flights, negativeList) =>
  flights.filter((f) => !negativeList.includes(f.id))
);

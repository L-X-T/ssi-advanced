import { createReducer, on } from '@ngrx/store';
import * as FlightBookingActions from './flight-booking.actions';
import { Flight } from '@flight-workspace/flight-lib';

export const flightBookingFeatureKey = 'flightBooking';

export interface FlightBookingAppState {
  [flightBookingFeatureKey]: State;
}

export interface State {
  formValue: {
    from: string;
    to: string;
    urgent: boolean;
  };
  flights: Flight[];
  negativeList: number[];
  isLoadingFlights: boolean;
  loadingFlightsError: string;
}

export const initialState: State = {
  formValue: {
    from: 'Hamburg',
    to: 'Graz',
    urgent: false
  },
  flights: [],
  negativeList: [3],
  isLoadingFlights: false,
  loadingFlightsError: ''
};

export const reducer = createReducer(
  initialState,

  on(FlightBookingActions.loadFlights, (state, action) => {
    return {
      ...state,
      flights: [],
      isLoadingFlights: true,
      loadingFlightsError: '',
      formValue: {
        from: action.from,
        to: action.to,
        urgent: action.urgent
      }
    };
  }),

  on(FlightBookingActions.loadFlightsError, (state, action) => {
    return { ...state, isLoadingFlights: false, loadingFlightsError: action.err.message };
  }),

  on(FlightBookingActions.loadFlightsSuccessfully, (state, action) => {
    const flights = action.flights;
    const isLoadingFlights = false;
    const loadingFlightsError = '';
    return { ...state, flights, isLoadingFlights, loadingFlightsError };
  }),

  on(FlightBookingActions.updateFlight, (state, action) => {
    const flight = action.flight;
    const flights = state.flights.map((f) => (f.id === flight.id ? flight : f));
    return { ...state, flights };
  })
);

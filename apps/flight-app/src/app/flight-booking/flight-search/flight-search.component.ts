/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @angular-eslint/no-empty-lifecycle-method */
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { FlightBookingAppState, flightBookingFeatureKey } from '../+state/flight-booking.reducer';
import { loadFlights, updateFlight } from '../+state/flight-booking.actions';
import { take } from 'rxjs/operators';
import {
  selectFlightsWithProps,
  selectFormValue,
  selectIsLoadingFlights,
  selectLoadingFlightsError
} from '../+state/flight-booking.selectors';

@Component({
  selector: 'flight-search',
  templateUrl: './flight-search.component.html',
  styleUrls: ['./flight-search.component.css']
})
export class FlightSearchComponent implements OnInit {
  from = ''; // in Germany
  to = ''; // in Austria
  urgent = false;
  // "shopping basket" with selected flights
  basket: { [id: number]: boolean } = {
    3: true,
    5: true
  };

  formValue$ = this.store.select(selectFormValue);
  flights$ = this.store.select(selectFlightsWithProps({ blackList: [3] }));
  isLoadingFlight$ = this.store.select(selectIsLoadingFlights);
  loadingFlightsError$ = this.store.select(selectLoadingFlightsError);

  constructor(private store: Store<FlightBookingAppState>) {}

  ngOnInit(): void {
    this.formValue$.pipe(take(1)).subscribe((formValue) => {
      this.from = formValue.from;
      this.to = formValue.to;
      this.urgent = formValue.urgent;
    });
  }

  search(): void {
    if (!this.from || !this.to) return;

    // this.flightService.load(this.from, this.to, this.urgent);

    /*this.flightService.find(this.from, this.to, this.urgent).subscribe({
      next: (flights) => {
        this.store.dispatch(flightsLoaded({ flights }));
      },
      error: (error) => {
        console.error('error', error);
      }
    });*/

    this.store.dispatch(
      loadFlights({
        from: this.from,
        to: this.to,
        urgent: this.urgent
      })
    );
  }

  delay(): void {
    // this.flightService.delay();

    this.flights$.pipe(take(1)).subscribe((flights) => {
      const flight = flights[0];

      const oldDate = new Date(flight.date);
      const newDate = new Date(oldDate.getTime() + 15 * 60 * 1000);
      const newFlight = { ...flight, date: newDate.toISOString() };

      this.store.dispatch(updateFlight({ flight: newFlight }));
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Flight } from '@flight-workspace/flight-lib';
import { combineLatest, interval, Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { debounceTime, distinctUntilChanged, filter, map, pairwise, startWith, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'flight-workspace-flight-lookahead',
  templateUrl: './flight-lookahead.component.html',
  styleUrls: ['./flight-lookahead.component.css']
})
export class FlightLookaheadComponent implements OnInit {
  fromControl = new FormControl('', { nonNullable: true });
  toControl = new FormControl('', { nonNullable: true });

  flights$: Observable<Flight[]> | undefined;
  diff$: Observable<number> | undefined;
  isLoading = false;

  isOnline = false;
  online$: Observable<boolean> | undefined;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    /*this.control = new FormControl();
    const input$ = this.control.valueChanges.pipe(debounceTime(300));*/

    const fromInput$ = this.fromControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      // filter((input) => input.length > 2),
      distinctUntilChanged()
    );

    const toInput$ = this.toControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      // filter((input) => input.length > 2),
      distinctUntilChanged()
    );

    /*this.flights$ = this.control.valueChanges.pipe(
      debounceTime(300),
      filter((input) => input.length > 2),
      distinctUntilChanged(),
      tap((i) => (this.isLoading = true)),
      switchMap((input) => this.load(input)),
      tap((v) => (this.isLoading = false))
    );*/

    this.online$ = interval(2000).pipe(
      startWith(0),
      map((_) => Math.random() < 0.5),
      distinctUntilChanged(),
      tap((value) => (this.isOnline = value))
    );

    this.flights$ = combineLatest([fromInput$, toInput$, this.online$]).pipe(
      filter(([f, t, online]: [string, string, boolean]) => !!(f || t) && online),
      distinctUntilChanged(
        (x: [from: string, to: string, _: boolean], y: [from: string, to: string, _: boolean]) => x[0] === y[0] && x[1] === y[1]
      ),
      tap(([f, t, _]) => (this.isLoading = true)),
      switchMap(([from, to, _]) => this.load(from, to)),
      tap((a) => (this.isLoading = false))
    );

    this.diff$ = this.flights$.pipe(
      pairwise(),
      map(([a, b]) => b.length - a.length)
    );
  }

  load(from: string, to: string = ''): Observable<Flight[]> {
    const url = 'http://www.angular.at/api/flight';
    const params = new HttpParams().set('from', from).set('to', to);
    const headers = new HttpHeaders().set('Accept', 'application/json');

    return this.http.get<Flight[]>(url, { params, headers });
  }
}

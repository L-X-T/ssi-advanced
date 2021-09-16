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
  control = new FormControl('', { nonNullable: true });
  flights$: Observable<Flight[]> | undefined;
  diff$: Observable<number> | undefined;
  isLoading = false;

  isOnline = false;
  online$: Observable<boolean> | undefined;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const input$ = this.control.valueChanges.pipe(debounceTime(300));

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

    this.flights$ = combineLatest([input$, this.online$]).pipe(
      filter(([, online]) => online),
      map(([input]) => input),
      distinctUntilChanged(),
      tap((i) => (this.isLoading = true)),
      switchMap((input: string) => this.load(input)),
      tap((v) => (this.isLoading = false))
    );

    this.diff$ = this.flights$.pipe(
      pairwise(),
      map(([a, b]) => b.length - a.length)
    );
  }

  load(from: string): Observable<Flight[]> {
    const url = 'http://www.angular.at/api/flight';
    const params = new HttpParams().set('from', from);
    const headers = new HttpHeaders().set('Accept', 'application/json');

    return this.http.get<Flight[]>(url, { params, headers });
  }
}

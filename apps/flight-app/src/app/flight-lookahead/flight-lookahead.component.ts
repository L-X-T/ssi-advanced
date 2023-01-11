import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Flight } from '@flight-workspace/flight-lib';
import { combineLatest, from, interval, merge, Observable, of, Subject } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  pairwise,
  retry,
  share,
  startWith,
  switchMap,
  tap
} from 'rxjs/operators';

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

  online$: Observable<boolean> | undefined;

  private refreshClickSubject = new Subject<void>();
  readonly refreshClick$ = this.refreshClickSubject.asObservable();

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
      distinctUntilChanged()
    );

    const combined$ = combineLatest([fromInput$, toInput$, this.online$]).pipe(
      distinctUntilChanged(
        (x: [from: string, to: string, online: boolean], y: [from: string, to: string, online: boolean]) =>
          x[0] === y[0] && x[1] === y[1] && x[2] === y[2]
      )
    );

    const combinedRefresh$: Observable<[string, string, boolean]> = this.refreshClick$.pipe(
      map((_) => [this.fromControl.value, this.toControl.value, true])
    );

    this.flights$ = merge(combined$, combinedRefresh$).pipe(
      filter(([f, t, online]: [string, string, boolean]) => !!(f || t) && online),
      map(([f, t, _]) => [f, t]),
      tap(([f, t]) => (this.isLoading = true)),
      switchMap(([from, to]) =>
        this.load(from, to).pipe(
          retry(3), // you retry 3 times
          catchError((err) => {
            console.log('Error caught:');
            console.log(err);
            return of([]);
          }) // if all fail catch error
        )
      ),
      tap((a) => (this.isLoading = false)),
      share()
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

  refresh(): void {
    this.refreshClickSubject.next(void 0);
  }
}

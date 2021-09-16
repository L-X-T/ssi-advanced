import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Flight } from '@flight-workspace/flight-lib';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { debounceTime, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'flight-workspace-flight-lookahead',
  templateUrl: './flight-lookahead.component.html',
  styleUrls: ['./flight-lookahead.component.css']
})
export class FlightLookaheadComponent implements OnInit {
  control = new FormControl('', { nonNullable: true });
  flights$: Observable<Flight[]> | undefined;
  isLoading = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.flights$ = this.control.valueChanges.pipe(
      debounceTime(300),
      tap((i) => (this.isLoading = true)),
      switchMap((input) => this.load(input)),
      tap((v) => (this.isLoading = false))
    );
  }

  load(from: string): Observable<Flight[]> {
    const url = 'http://www.angular.at/api/flight';
    const params = new HttpParams().set('from', from);
    const headers = new HttpHeaders().set('Accept', 'application/json');

    return this.http.get<Flight[]>(url, { params, headers });
  }
}

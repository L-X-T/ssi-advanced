import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { FlightSearchComponent } from './flight-search.component';

import { Flight, FlightService } from '@flight-workspace/flight-lib';
import { Observable, of } from 'rxjs';
import { Component, Directive, EventEmitter, Input, Output, Pipe, PipeTransform } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

describe('Unit test: flight-search.component', () => {
  let component: FlightSearchComponent;
  let fixture: ComponentFixture<FlightSearchComponent>;

  const resultMock = [
    { id: 17, from: 'Graz', to: 'Hamburg', date: 'now', delayed: true },
    { id: 18, from: 'Vienna', to: 'Barcelona', date: 'now', delayed: true },
    { id: 19, from: 'Frankfurt', to: 'Salzburg', date: 'now', delayed: true }
  ];

  const flightServiceMock = {
    find(from: string, to: string): Observable<Flight[]> {
      return of(resultMock);
    },
    // Implement the following members only if this code is used in your Component
    flights: [] as Flight[],
    load(from: string, to: string): void {
      this.find(from, to).subscribe((f) => {
        this.flights = f;
      });
    }
  };

  @Component({ selector: 'flight-card', template: '' })
  class FlightCardComponent {
    @Input() item: Flight | undefined;
    @Input() selected = false;
    @Output() selectedChange = new EventEmitter<boolean>();
  }

  // eslint-disable-next-line @angular-eslint/directive-selector
  @Directive({ selector: 'input[city]' })
  class CityValidatorDirective {
    @Input() city: string[] = [];
    validate = (_: any) => null;
  }

  @Pipe({ name: 'city' })
  class CityPipe implements PipeTransform {
    transform = (v: string) => v;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [FlightSearchComponent, FlightCardComponent, CityPipe, CityValidatorDirective]
    }).overrideComponent(FlightSearchComponent, {
      set: {
        providers: [
          {
            provide: FlightService,
            useValue: flightServiceMock
          }
        ]
      }
    });

    fixture = TestBed.createComponent(FlightSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should not have any flights loaded initially', () => {
    expect(component.flights.length).toBe(0);
  });

  /*it('should load flights when user entered from and to', () => {
    component.from = 'Graz';
    component.to = 'Hamburg';
    component.search();

    const httpTestingController: HttpTestingController = TestBed.inject(HttpTestingController);
    const req = httpTestingController.expectOne('http://www.angular.at/api/flight?from=Graz&to=Hamburg');
    // req.request.method === 'GET'

    req.flush([
      {
        id: 22,
        from: 'Graz',
        to: 'Hamburg',
        date: ''
      }
    ]);

    expect(component.flights.length).toBe(1);
  });*/

  it('should not load flights w/o from and to', () => {
    component.from = '';
    component.to = '';
    component.search();

    expect(component.flights.length).toBe(0);
  });

  it('should load flights w/ from and to', () => {
    component.from = 'Hamburg';
    component.to = 'Graz';
    component.search();

    expect(component.flights.length).toBeGreaterThan(0);
  });

  it('should have a disabled search button w/o params', fakeAsync(() => {
    tick();

    // Get input field for from
    const from = fixture.debugElement.query(By.css('input[name=from]')).nativeElement;

    from.value = '';
    from.dispatchEvent(new Event('input'));

    // Get input field for to
    const to = fixture.debugElement.query(By.css('input[name=to]')).nativeElement;

    to.value = '';
    to.dispatchEvent(new Event('input'));

    fixture.detectChanges();
    tick();

    // Get disabled
    const disabled = fixture.debugElement.query(By.css('button')).properties['disabled'];

    expect(disabled).toBeTruthy();
  }));
});

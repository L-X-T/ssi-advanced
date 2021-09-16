# Advanced Routing

- [Advanced Routing](#advanced-routing)
  - [Hierarchical Routing](#hierarchical-routing)
  - [Bonus: Aux-Routes *](#bonus-aux-routes-)
  - [CanActivateGuard](#canactivateguard)
  - [CanDeactivateGuard](#candeactivateguard)
  <!-- - [Bonus: Login **](#bonus-login-) -->
  - [Bonus: Resolver *](#bonus-resolver-)
  - [Bonus: Loading Indicator *](#bonus-loading-indicator-)
  - [Lazy Loading](#lazy-loading)
    - [Lazy Loading Configuration](#lazy-loading-Configuration)
    - [Preloading](#preloading)
    - [Fix Shared Services](#fix-shared-services)
    - [Bonus: Custom Preloading Strategy **](#bonus-custom-preloading-strategy-)

## Hierarchical Routing

In this exercise, you will introduce another layer of navigation using a new component ``FlightBookingComponent`` and hierarchical routing:

```
AppComponent
     +------------ HomeComponent
     +------------ FlightBookingComponent     
                      +--------------------- FlightSearchComponent
                      +--------------------- FlightEditComponent
                      +--------------------- PassengerSearchComponent
```

You can refer to the following guide for this:

1. Look at the ``FlightBookingComponent`` in the ``src/app/flight-booking`` folder.

2. Define a route for the new component in the ``flight-booking.routes.ts`` file. All previous routes should become their child routes.

  <details>
  <summary></summary>
  <p>

   ```TypeScript
   export const FLIGHT_BOOKING_ROUTES: Routes = [
     {
       path: 'flight-booking',
       component: FlightBookingComponent,
       children: [
         {
           path: 'flight-search',
           component: FlightSearchComponent
         },
         {
           path: 'passenger-search',
           component: PassengerSearchComponent
         },
         {
           path: 'flight-edit/:id',
           component: FlightEditComponent
         }
       ]
     }
   ];
   ```

  </p>
  </details>

3. Switch to the file ``sidebar.component.html`` and define a main menu item for the route ``flight-booking/flight-search`` there. You can remove the route for ``passenger-search``.

  <details>
  <summary>Show code</summary>
  <p>
  
  ```HTML
  <ul class="nav">
    <li>
      <a routerLink="home">
        <i class="ti-home"></i>
        <p>Home</p>
      </a>
    </li>

  <!-- New -->
    <li>
      <a routerLink="flight-booking/flight-search">
        <i class="ti-arrow-top-right"></i>
        <p>Flight Booking</p>
      </a>
    </li>

  <!-- Old -->
    <!--
    <li>
      <a routerLink="flight-search">
        <i class="ti-arrow-top-right"></i>
        <p>Flight Search</p>
      </a>
    </li>

    <li>
      <a routerLink="passenger-search">
        <i class="ti-user"></i>
        <p>Passengers</p>
      </a>
    </li>
    -->
  ```
  
  </p>
  </details>

4. Go to the file ``flight-card.component.html`` and update the link on ``flight-edit`` to ``../flight-edit``.

  <details>
  <summary>Show code</summary>
  <p>
  
  ```HTML
  <!-- New -->
  <a class="btn btn-default" [routerLink]="['../flight-edit', item.id, {showDetails: true}]">
    Edit
  </a>

  <!-- Old -->
  <a class="btn btn-default" [routerLink]="['flight-edit', item.id, {showDetails: true}]">
    Edit
  </a>
  ```
  
  </p>
  </details>

5. Test your solution.

## Bonus: Aux Routing *

In this exercise, you will create a new BasketComponent and fade it in via an aux route. With the power of CSS, you can render them as popovers.

1. Look at the ``BasketComponent`` in the ``src/app`` folder.
   
2. Open the file ``app.component.html`` and add another ``router-outlet``. Assign the name ``aux``.

  <details>
  <summary>Show code</summary>
  <p>
  
  ```HTML
  <div class="content">
  
    <!-- Existing outlet -->
    <router-outlet></router-outlet>

    <!-- New additional outlet -->  
    <router-outlet name="aux"></router-outlet>
  
  </div>
  ```
  
  </p>
  </details>

3. Open the ``app.routes.ts`` file and add a route ``basket`` that points to the new ``BasketComponent`` and is dedicated to the new outlet ``aux``.

  <details>
  <summary>Show code</summary>
  <p>

  ```TypeScript
  [...]
    {
      path: 'basket',
      component: BasketComponent,
      outlet: 'aux'
    },
  [...]
  ```

  </p>
  </details>

4. Open the file ``sidebar.component.html`` and add a menu item that displays the ``BasketComponent``.

  <details>
  <summary>Show code</summary>
  <p>
  
  ```HTML
  <li routerLinkActive="active">
    <a [routerLink]="[{outlets: {aux: 'basket' }}]">
      <i class="ti-shopping-cart"></i>
      <p>Basket</p>
    </a>
  </li>
  ```
  
  </p>
  </details>

5. Test your solution.

## CanActivateGuard

In this exercise, you will create an _AuthService_ that users can use to log in. This _AuthService_ remembers the current user name or whether the user is logged in. The possibilities of the service should be offered to the user in the ``HomeComponent``.

Additionally, create a ``CanActivate`` guard called ``AuthGuard`` that will only allow a route switch if the current user is logged in. To do this, it relies on the ``AuthService``:

```
  [HomeComponent] -------> [AuthService]
                                 ^
                                 |
                            [AuthGuard]
```

You can use the following process as a guide:

1. Create an ``auth`` folder inside the ``shared`` folder.

2. In the new folder ``auth``, create an ``AuthService``:

  ```TypeScript
  @Injectable()
  export class AuthService {
    userName: string;
  
    constructor() {}
      
    login(): void {
      this.userName = 'Max';
    }
  
    logout(): void {
      this.userName = null;
    }
  }
  ``` 

3. In the same folder, create a file ``auth.guard.ts`` with a ``CanActivate`` guard that relies on the ``AuthService``.

  <details>
  <summary>Show code</summary>
  <p>
  
  ```TypeScript
  @Injectable()
  export class AuthGuard implements CanActivate {
    constructor(private router: Router, private authService: AuthService) {}
  
    canActivate() {
      if (this.authService.userName) {
        return true;
      }
      
      this.router.navigate(['/home', { needsLogin: true }])
      return true;
    }
  }
  ```
  
  </p>
  </details>

4. Register the ``AuthGuard`` and the ``AuthService`` in the ``shared.module.ts` file.

  <details>
  <summary>Show code</summary>
  <p>
  
  ```TypeScript
  @NgModule({
    [...]
    providers: [
      AuthService,
      AuthGuard
    ], 
    [...]
  })
  export class SharedModule { }
  ```
  
  </p>
  </details>

5. Make sure the ``AppModule`` (``app.module.ts``) imports the ``SharedModule``.

  <details>
  <summary>Show code</summary>
  <p>
  
  ```TypeScript
  @NgModule({
    imports: [
      [...]
      SharedModule
    ],
    [...]
  })
  export class AppModule { }
  ```
  
  </p>
  </details>

6. Open the file ``home.component.ts`` and inject the ``AuthService`` there. Wrap its functionality with methods or getters.

  <details>
  <summary>Show code</summary>
  <p>
  
  ```TypeScript
  export class HomeComponent {
    constructor(private authService: AuthService) {}
  
    get userName(): string {
      return this.authService.userName;
    }
  
    login(): void {
      this.authService.login();
    }
  
    logout(): void {
      this.authService.logout();
    }
  }
  ```
  
  </p>
  </details>

7. Open the file ``home.component.html``. Enter the current user name there and offer buttons for login or logout.

  <details>
  <summary>Show code</summary>
  <p>
  
  ```HTML
  <h1 *ngIf="userName">Welcome, {{userName}}</h1>
  <h1 *ngIf="!userName">Welcome!</h1>
  
  <div class="card">
    <div class="content">
      <button class="btn btn-default" (click)="login()">Login</button>
      <button class="btn btn-default" (click)="logout()">Logout</button>
    </div>
  </div>
  ```
  
  </p>
  </details>

8. Register the ``AuthGuard`` in the route configuration in ``flight-booking.routes.ts`` to protect one of the configured routes.

  <details>
  <summary>Show code</summary>
  <p>

  ```TypeScript
  export const FLIGHT_BOOKING_ROUTES: Routes = [
    {
      path: '...',
      component: [...],
      canActivate:[AuthGuard],
      [...]
    }
    [...]
  ];
  ```

  </p>
  </details>

9. Test your solution.

## CanDeactivateGuard

In this exercise, you will develop a ``CanDeactivate`` guard to warn the user before deviating from a route.

1. In the ``shared`` folder, create a ``deactivation`` folder.

2. In the new folder ``deactivation`` create a file ``can-deactivate.guard``:

  ```TypeScript
  export interface CanDeactivateComponent {
    canDeactivate(): Observable<boolean>;
  }
  
  @Injectable()
  export class CanDeactivateGuard implements CanDeactivate<CanDeactivateComponent> {
    canDeactivate(
      component: CanDeactivateComponent,
      currentRoute: ActivatedRouteSnapshot,
      currentState: RouterStateSnapshot,
      nextState?: RouterStateSnapshot): Observable<boolean> {
  
      return component.canDeactivate();
    }
  }
  ```

  The ``CanDeactivateComponent`` interface is used here as an abstraction for the components that are to be used with the guard.

3. Open the ``flight-edit.component.ts`` file and implement the ``CanDeactivateComponent`` interface there so that when exiting, a flag is set on the one hand and an ``Observable<boolean> `` on the other is returned. The flag will cause a warning message to be displayed. As soon as the user has announced whether we really want to leave the route, the observable should send ``true`` or ``false`` to the router. After that it must be closed. In addition, the flag should then be reset again.

  <details>
  <summary>Show code</summary>
  <p>
  
  ```TypeScript
  export class FlightEditComponent implements OnInit, CanDeactivateComponent {
    
    [...]
  
    sender: Observer<boolean> | undefined;
    showWarning = false;
  
    decide(decision: boolean): void {
      this.showWarning = false;
      if (this.sender) {
        this.sender.next(decision);
        this.sender.complete();
      }
    }
  
    canDeactivate(): Observable<boolean> {
      return new Observable((sender: Observer<boolean>) => {
        this.sender = sender;
        this.showWarning = true;
      });
    }
  
    [...]
  }
  ```
  
  </p>
  </details>

4. In the ``flight-edit.component.html`` file, add the two-choice warning to the user mentioned previously.

  ```html
  <div *ngIf="showWarning" class="alert alert-warning" style="z-index: 99999;">
    <p>
      Data not saved. Do you really want to leave me?
    </p>
    <p>
      <button class="btn btn-default" (click)="decide(true)">Yes</button>
      <button class="btn btn-default" (click)="decide(false)">No</button>
    </p>
  </div>
  ```

5. Register the guard in the ``shared.module.ts`` file.

  <details>
  <summary>Show code</summary>
  <p>
  
  ```TypeScript
  @NgModule({
    [...]
    providers: [
      [...],
      CanDeactivateGuard
    ],
    [...]
  })
  export class SharedModule { }
  ```
  
  </p>
  </details>

6. Also register the guard in the ``flight-booking.routes.ts`` file:

  <details>
  <summary>Show code</summary>
  <p>
  
  ```TypeScript
  [...]
  {
    path: 'flight-edit/:id',
    component: FlightEditComponent,
    canDeactivate: [CanDeactivateGuard]
  },
  [...]
  ``` 
  
  </p>
  </details>

7. Test your solution.

<!--
## Bonus: Login **

Erweitern Sie den ``AuthService``, sodass er unter Verwendung hartcodierter Daten prüft, ob eine bestimmte Benutzername/Passwort-Kombination existiert. Nutzen Sie diesen Service in der Methode ``login`` des ``AuthService``. Erweitern Sie die Login-Maske, sodass der Benutzer hier Benutzername und Passwort erfassen kann. Falls Sie ``ngModel`` verwenden, stellen Sie sicher, dass das ``FormsModule`` ins ``AppModule`` importiert wird.
-->

## Bonus: Resolver *

In this exercise, you will write a resolver that loads a flight using the id in the url for the ``FlightEditComponent``. You will also add a ``findById`` method to the FlightService.

You can use the following process as a guide:

1. Extend the ``FlightService`` (``flight.service.ts``) with a method ``findById`` that returns a flight as ``Observable<Flight>`` based on a passed Id.

  <details>
  <summary>Show code</summary>
  <p>
  
  ```TypeScript
  findById(id: string): Observable<Flight> {
    const url = 'http://www.angular.at/api/flight';
    const params = new HttpParams().set('id', id);
    const headers = new HttpHeaders().set('Accept', 'application/json');

    return this.http.get<Flight>(url, {params, headers});
  }
  ```
  
  </p>
  </details>

2. In the folder ``src/app/flight-booking/flight-search`` create a file ``flight.resolver.ts``, which takes the id from the url and the desired one with the ``FlightService`` flight loads.

  <details>
  <summary>Show code</summary>
  <p>
  
  ```TypeScript
  @Injectable()
  export class FlightResolver implements Resolve<Flight> {
    constructor(private flightService: FlightService) {}
  
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Flight>  {
      const id = route.params['id'];
      return this.flightService.findById(id); 
    }
  }
  ```
  
  </p>
  </details>

3. Register the ``FlightResolver`` in the ``flight-booking.module.ts`` file.

  <details>
  <summary>Show code</summary>
  <p>
  
  ```TypeScript
  @NgModule({
    [...]
    providers: [
      FlightResolver,
      [...]
    ],
    [...]  
  })
  export class FlightBookingModule { }
  ```
  
  </p>
  </details>

4. Store the ``FlightResolver`` in the file ``flight-booking.routes.ts`` for the route ``flight-edit``.

  <details>
  <summary>Show code</summary>
  <p>

  ```TypeScript
  [...]
  {
    path: 'flight-edit/:id',
    component: FlightEditComponent,
    canDeactivate: [CanDeactivateGuard],
    resolve: {
      flight: FlightResolver
    }
  }
  [...]
  ```

  </p>
  </details>

5. Modify the ``flight-edit.component.ts`` file to accept the flight loaded by the resolver.

  <details>
  <summary>Show code</summary>
  <p>
  
  ```TypeScript
  export class FlightEditComponent implements OnInit, CanDeactivateComponent {
  
    [...]
 
    flight: Flight;
  
    constructor(private route: ActivatedRoute) {}
  
    ngOnInit(): void {
      this.route.params.subscribe(p => {
        this.id = p['id'];
        this.showDetails = p['showDetails'];
      });
  
      this.route.data.subscribe(data => {
        this.flight = data['flight'];
      });
    }

    [...]
  }
  ```
  
  </p>
  </details>

6. In the ``FlightEditComponent`` (``flight-edit.component.ts``) template, specify the ``flight`` property:

  ```HTML
  <pre>{{flight | json}}</pre>
  ```

7. Test your solution. 

## Bonus: Loading Indicator *

This exercise assumes that you implemented a ``FlightResolver`` in the previous exercise.

1. Inject the ``Router`` into the ``app.component.ts`` file and use its events to determine whether to display a loading indicator:

  ```TypeScript
  export class AppComponent  {
    showLoadingIndicator = false;
  
    constructor(private router: Router) {
      router.events.pipe(filter((e) => e instanceof NavigationStart || e instanceof GuardsCheckEnd)).subscribe((event) => {
        this.showLoadingIndicator = true;
      });

      router.events
        .pipe(
          filter(
            (e) =>
              e instanceof NavigationEnd || e instanceof NavigationError || e instanceof NavigationCancel || e instanceof GuardsCheckStart
          )
        )
        .subscribe((event) => {
          this.showLoadingIndicator = false;
        });
    }
  }
  
  ```

2. Add a loading indicator at the end of ``app.component.html``:

  ```HTML
  <div *ngIf="showLoadingIndicator" class="loading-indicator" style="z-index: 50">
    <div class="spinner">
      <div class="double-bounce1"></div>
      <div class="double-bounce2"></div>
    </div>
  </div>
  ```

  The project already contains styles for these classes, so that the loading indicator is animated.

3. To test the loading indicator, add a dalay to the ``flight.resolver.ts`` file:

  ```TypeScript
  @Injectable()
  export class FlightResolver implements Resolve<Flight> {
    constructor(private flightService: FlightService) {}
  
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Flight>  {
      let id = route.params['id'];
      return this.flightService.findById(id).pipe(delay(3000)); // <-- delay!
    }
  }
  ```

4. Test your solution and note that when you fetch the ``FlightEditComponent`` the Loading Indicator appears.

5. Remove the ``Delay`` from the ``flight.resolver.ts`` file again.

## Lazy Loading

### Lazy Loading Configuration

In this part of the exercise, you will lazy load the ``FlightBookingModule``.

1. Add another route to the ``app.routes.ts`` file, which loads the ``FlightBookingModule`` via lazy loading.

  <details>
  <summary>Show code</summary>
  <p>
  
  ```TypeScript
  export const APP_ROUTES: Routes = [
    {
      path: '',
      redirectTo: 'home',
      pathMatch: 'full'
    },
    {
      path: 'home',
      component: HomeComponent
    },
    {
      path: 'flight-booking',
      loadChildren: () => import('./flight-booking/flight-booking.module')
                                .then(esm => esm.FlightBookingModule),
      data: {
        preload: true
      }
    },
    [...],
    {
      path: '**', // <-- Catch-All-Route muss die letzte Route sein!
        [...]
      }
  ]
  ```
  
  </p>
  </details>

2. Open the file ``flight-booking.routes.ts`` and set the path for the ``FlightBookingComponent`` to an empty string. Also remove all references to ``AuthGuards``. These cause problems for the time being. The solution to this is described below in a separate exercise.

  <details>
  <summary>Show code</summary>
  <p>
  
  ```TypeScript
  export const FLIGHT_BOOKING_ROUTES: Routes = [
    {
      // path: 'flight-booking', // <-- Before
      path: '', // <-- Now
        component: FlightBookingComponent,
        // canActivate:[AuthGuard], // <-- Remove all AuthGuards (for now)
      [...]
    }
    [...]
  }
  ```
  
  </p>
  </details>

3. Open the ``app.module.ts`` file and make sure that the ``FlightBookingModule`` is no longer imported here.

  <details>
  <summary>Show code</summary>
  <p>
  
  ```TypeScript
  @NgModule({
      imports: [
        BrowserModule,
        HttpClientModule,
        // FlightBookingModule,  // <-- This would prevent lazy loading
        RouterModule.forRoot(APP_ROUTES),
      [...]
      ],
    [...]
  })
  export class AppModule { }
  ```
  
  </p>
  </details>

  A reference to the ``FlightBookingModule`` would cause it to end up in the main bundle and that would prevent lazy loading.

4. Look at the output of the Angular CLI and notice that it has now generated a bundle ``flight-booking.module.chunk.js``.

5. Test your solution in the browser. Go to the ``Network`` tab in Dev Tools (F12) and make sure that the module is only loaded when needed.

### Preloading

1. Open the file ``app.module.ts`` and specify the preloading strategy ``PreloadAllModules`` when calling ``RouterModule.forRoot``.

  <details>
  <summary>Show code</summary>
  <p>
  
  ```TypeScript
  @NgModule({
    imports: [
    [...]    
    RouterModule.forRoot(
        APP_ROUTES, 
        {
          preloadingStrategy: PreloadAllModules
        }),
      [...]
    ],
    [...]
  })
  export class AppModule { }
  ```
  
  </p>
  </details>

2. In the browser, go to the ``Network`` tab of the Developer Tools and make sure that the ``FlightBookingModule`` is lazy-loaded immediately after the application starts.

### Fix Shared Services

In this exercise, you will expose your ``SharedModule`` via a static method ``forRoot`` with services and a static method ``forChild`` without services. By using forRoot **only** on the ``AppModule``, you ensure that there is only a single global AuthService. This allows you to access the current username in the lazy-loaded module and re-enable the ``AuthGuard`` described above.

1. In the ``PassengerSearchComponent``, enter the current username:

  ```TypeScript
  export class PassengerSearchComponent implements OnInit {
    constructor(private authService: AuthService) { }
  
    ngOnInit(): void {
      console.debug('userName', this.authService.userName);
    }
  }
  ```

2. Start the application and log in. Notice that after logging in, the username is printed.

3. Switch to the passenger search and notice that the JavaScript console now only returns ``undefined`` instead of the username.

4. Open the ``shared.module.ts`` file. Introduce a static method ``forRoot`` and a static method ``forChild`` and make sure that only ``forRoot`` returns the providers.

  <details>
  <summary>Show code</summary>
  <p>
  
  ```TypeScript
  @NgModule({
    imports: [
      [...]
    ],
    declarations: [
      [...]
    ],
    providers: [ /* No providers here, see forRoot */ ],
    exports: [
      [...]
    ]
  })
  export class SharedModule {
  
    static forChild(): ModuleWithProviders<SharedModule> {
      return {
        ngModule: SharedModule,
        providers: [ /* No providers here, see forRoot */ ]
      }
    }
  
    static forRoot(): ModuleWithProviders<SharedModule> {
      return {
        ngModule: SharedModule,
        providers: [
          AuthService,
          [...] // Any other services here
        ]
      }
    }
  }
  ```

  </p>
  </details>

5. Make sure that in the ``app.module.ts`` the ``SharedModule`` is imported using ``forRoot``.

  <details>
  <summary>Show code</summary>
  <p>
  
  ```TypeScript
  @NgModule({
      imports: [
      [...]    
      SharedModule.forRoot()
      ],
    [...]
  })
  export class AppModule { }
  ```
  
  </p>
  </details>

6. Also make sure that in the ``flight.booking.module.ts`` file the ``SharedModule`` is imported using ``forChild``.

  <details>
  <summary>Show code</summary>
  <p>
  
  ```TypeScript
  @NgModule({
      imports: [
      [...]    
      SharedModule.forChild()
      ],
    [...]
  })
  export class FlightBookingModule { }
  ```
  
  </p>
  </details>

7. Test the application and make sure that the ``PassengerSearchComponent`` is now writing the correct username to the JavaScript console.

8. If you wrote an ``AuthGuard`` earlier, you can now (re)activate it in the ``flight-booking.routes.ts`` file.

  <details>
  <summary>Show code</summary>
  <p>
  
  ```TypeScript
  export const FLIGHT_BOOKING_ROUTES: Routes = [
    {
      path: '', // <-- Now
        component: FlightBookingComponent,
        canActivate:[AuthGuard], // <-- Add AuthGuard
      [...]
    }
    [...]
  }
  ```
  
  </p>
  </details>

### Bonus: Custom Preloading Strategy **

In this part of the exercise, you will implement your own ``PreloadingStrategy`` that only preloads certain routes marked with the ``data`` attribute. To do this, you will mark those routes that need to be preloaded with a boolean in the route configuration.

1. In the ``shared`` folder, create a ``preloadig`` folder.

2. In the new ``preloading`` folder, create a ``custom-preloading-strategy.ts`` file that implements the above task.

  <details>
  <summary>Show code</summary>
  <p>
  
  ```TypeScript
  @Injectable()
  export class CustomPreloadingStrategy implements PreloadingStrategy {
  
    preload(route: Route, fn: () => Observable<any>): Observable<any> {
  
      if (route.data && route.data.preload) {
        return fn();
      }
  
      return of(null);
    }
  }
  ```
  
  </p>
  </details>

3. Register the ``CustomPreloadingStrategy`` as part of a provider in the ``shared.module.ts`` file.

  <details>
  <summary>Show code</summary>
  <p>
  
  ```TypeScript
  @NgModule({
    [...]
    providers: [ 
      [...]
      CustomPreloadingStrategy
      [...]
      ],
      [...]
  })
  export class SharedModule {  
  }
  ```
  
  </p>
  </details>

4. In the ``app.routes.ts`` file for the ``flight-booking`` route, specify in the ``data`` property that the route should be preloaded.

  <details>
  <summary>Show code</summary>
  <p>
  
  ```TypeScript
  {
    path: 'flight-booking',
      loadChildren: () => import('./flight-booking/flight-booking.module')
                                .then(esm => esm.FlightBookingModule),
    data: {
      preload: true
    }
  },
  [...]
  {
    path: '**',      // This route must be the last!
    redirectTo: 'home'
  }
  ``` 
  
  </p>
  </details>
  
  Note: You can store any additional information for a route using the ``data`` property.

5. Open the ``app.module.ts`` file and pass the new ``CustomPreloadingStrategy`` to ``forRoot``:

  <details>
  <summary>Show code</summary>
  <p>
  
  ```TypeScript
  @NgModule({
    imports: [
    [...]    
    RouterModule.forRoot(
        APP_ROUTES, 
        {
          preloadingStrategy: CustomPreloadingStrategy
        }),
      [...]
    ],
    [...]
  })
  export class AppModule { }
  ```
  
  </p>
  </details>

6. Test your solution and verify that preloading is occurring using the ``Network`` tab in Dev Tools.

7. In the ``app.routes.ts`` file, modify and specify in the data attribute that ``flight-booking`` should no longer be preloaded.
 
  <details>
  <summary>Show code</summary>
  <p>
  
  ```TypeScript
  {
    path: 'flight-booking',
      loadChildren: () => import('./flight-booking/flight-booking.module')
                                .then(esm => esm.FlightBookingModule),
    data: {
      preload: false
    }
  },
  ```   
  
  </p>
  </details>

8. Test your solution again and note that preloading no longer occurs.

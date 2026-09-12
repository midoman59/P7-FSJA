import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainDashboardComponent } from './main-dashboard.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from "@angular/router/testing";
import { PersonService, Person } from '../person.service';
import { OrganizationService, Organization } from '../organization.service';


describe('MainDashboardComponent', () => {
  let component: MainDashboardComponent;
  let fixture: ComponentFixture<MainDashboardComponent>;
  let personService: PersonService;
  let organizationService: OrganizationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainDashboardComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [PersonService, OrganizationService]
    })
      .compileComponents();

    fixture = TestBed.createComponent(MainDashboardComponent);
    component = fixture.componentInstance;
    personService = TestBed.inject(PersonService);
    organizationService = TestBed.inject(OrganizationService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load persons on init', (done) => {
    const mockPersons: Person[] = [
      { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com', phone: '123', bio: 'test', createdAt: new Date(), organizations: [] }
    ];
    spyOn(personService, 'fetchAll').and.returnValue(Promise.resolve(mockPersons));
    spyOn(organizationService, 'fetchAll').and.returnValue(Promise.resolve([]));

    component.ngOnInit();

    setTimeout(() => {
      expect(component.persons).toEqual(mockPersons);
      done();
    }, 100);
  });

  it('should load organizations on init', (done) => {
    const mockOrgs: Organization[] = [
      { id: 1, name: 'Acme Corp', createdAt: new Date(), persons: [] }
    ];
    spyOn(personService, 'fetchAll').and.returnValue(Promise.resolve([]));
    spyOn(organizationService, 'fetchAll').and.returnValue(Promise.resolve(mockOrgs));

    component.ngOnInit();

    setTimeout(() => {
      expect(component.organizations).toEqual(mockOrgs);
      done();
    }, 100);
  });

  it('should display empty lists when services return empty', (done) => {
    spyOn(personService, 'fetchAll').and.returnValue(Promise.resolve([]));
    spyOn(organizationService, 'fetchAll').and.returnValue(Promise.resolve([]));

    component.ngOnInit();

    setTimeout(() => {
      expect(component.persons).toEqual([]);
      expect(component.organizations).toEqual([]);
      done();
    }, 100);
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonDetailsComponent } from './person-details.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from "@angular/router/testing";
import { PersonService, Person } from '../person.service';
import { OrganizationService, Organization } from '../organization.service';


describe('PersonDetailsComponent', () => {
  let component: PersonDetailsComponent;
  let fixture: ComponentFixture<PersonDetailsComponent>;
  let personService: PersonService;
  let organizationService: OrganizationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonDetailsComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [PersonService, OrganizationService]
    })
      .compileComponents();

    fixture = TestBed.createComponent(PersonDetailsComponent);
    component = fixture.componentInstance;
    personService = TestBed.inject(PersonService);
    organizationService = TestBed.inject(OrganizationService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty person', () => {
    expect(component.person).toBeDefined();
    expect(component.person.firstName).toBe('');
  });

  it('should have isNew false initially', () => {
    expect(component.isNew).toBe(false);
  });

  it('should have empty organizations array initially', () => {
    expect(component.organizations).toBeDefined();
  });

  it('should not delete person if id is undefined', () => {
    component.person.id = undefined;
    spyOn(personService, 'deleteById');

    component.deletePerson();

    expect(personService.deleteById).not.toHaveBeenCalled();
  });
});

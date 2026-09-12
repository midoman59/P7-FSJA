import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonDetailsComponent } from './person-details.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from "@angular/router/testing";
import { PersonService, Person } from '../person.service';
import { OrganizationService, Organization } from '../organization.service';
import { ActivatedRoute, Router } from '@angular/router';


describe('PersonDetailsComponent', () => {
  let component: PersonDetailsComponent;
  let fixture: ComponentFixture<PersonDetailsComponent>;
  let personService: PersonService;
  let organizationService: OrganizationService;
  let router: Router;

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
    router = TestBed.inject(Router);
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

  it('should set isNew to true when navigating to /new', () => {
    spyOn(organizationService, 'fetchAll').and.returnValue(Promise.resolve([]));
    const route = TestBed.inject(ActivatedRoute);
    spyOn(route.snapshot.paramMap, 'get').and.returnValue('new');

    component.ngOnInit();

    expect(component.isNew).toBe(true);
  });

  it('should fetch person data when navigating to existing person', (done) => {
    const mockPerson: Person = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '123',
      bio: 'test',
      createdAt: new Date(),
      updatedAt: new Date(),
      organizations: []
    };

    spyOn(organizationService, 'fetchAll').and.returnValue(Promise.resolve([]));
    spyOn(personService, 'fetchById').and.returnValue(Promise.resolve(mockPerson));
    const route = TestBed.inject(ActivatedRoute);
    spyOn(route.snapshot.paramMap, 'get').and.returnValue('1');

    component.ngOnInit();

    setTimeout(() => {
      expect(personService.fetchById).toHaveBeenCalledWith(1);
      expect(component.person).toEqual(mockPerson);
      expect(component.isNew).toBe(false);
      done();
    }, 100);
  });

  it('should save person and navigate when isNew is true', (done) => {
    const savedPerson: Person = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '123',
      bio: 'test',
      createdAt: new Date(),
      updatedAt: new Date(),
      organizations: []
    };

    spyOn(personService, 'save').and.returnValue(Promise.resolve(savedPerson));
    spyOn(router, 'navigate');

    component.person = { ...savedPerson, id: undefined };
    component.isNew = true;
    component.savePerson();

    setTimeout(() => {
      expect(personService.save).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['persons', 1]);
      done();
    }, 100);
  });

  it('should save person without navigation when isNew is false', (done) => {
    const updatedPerson: Person = {
      id: 1,
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      phone: '456',
      bio: 'updated',
      createdAt: new Date(),
      updatedAt: new Date(),
      organizations: []
    };

    spyOn(personService, 'save').and.returnValue(Promise.resolve(updatedPerson));
    spyOn(router, 'navigate');

    component.person = updatedPerson;
    component.isNew = false;
    component.savePerson();

    setTimeout(() => {
      expect(personService.save).toHaveBeenCalled();
      expect(router.navigate).not.toHaveBeenCalled();
      done();
    }, 100);
  });

  it('should delete person and navigate home', (done) => {
    const personToDelete: Person = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '123',
      bio: 'test',
      createdAt: new Date(),
      updatedAt: new Date(),
      organizations: []
    };

    spyOn(personService, 'deleteById').and.returnValue(Promise.resolve(void 0));
    spyOn(router, 'navigate');

    component.person = personToDelete;
    component.deletePerson();

    setTimeout(() => {
      expect(personService.deleteById).toHaveBeenCalledWith(1);
      expect(router.navigate).toHaveBeenCalledWith(['']);
      done();
    }, 100);
  });

  it('should not add organization if selectedOrganization id is undefined', () => {
    component.person.id = 1;
    component.selectedOrganization = { id: undefined, name: 'Org', createdAt: new Date(), persons: [] };
    spyOn(organizationService, 'addPerson');

    component.addSelectedOrganization();

    expect(organizationService.addPerson).not.toHaveBeenCalled();
  });

  it('should add organization and refresh', (done) => {
    const mockOrg: Organization = { id: 1, name: 'Acme', createdAt: new Date(), persons: [] };
    const mockPerson: Person = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '123',
      bio: 'test',
      createdAt: new Date(),
      updatedAt: new Date(),
      organizations: [mockOrg]
    };

    component.person.id = 1;
    component.selectedOrganization = mockOrg;
    spyOn(organizationService, 'addPerson').and.returnValue(Promise.resolve(void 0));
    spyOn(personService, 'fetchById').and.returnValue(Promise.resolve(mockPerson));

    component.addSelectedOrganization();

    setTimeout(() => {
      expect(organizationService.addPerson).toHaveBeenCalledWith(1, 1);
      expect(personService.fetchById).toHaveBeenCalledWith(1);
      expect(component.person.organizations.length).toBe(1);
      done();
    }, 100);
  });

  it('should remove organization and refresh', (done) => {
    const mockOrg: Organization = { id: 1, name: 'Acme', createdAt: new Date(), persons: [] };
    const mockPerson: Person = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '123',
      bio: 'test',
      createdAt: new Date(),
      updatedAt: new Date(),
      organizations: []
    };

    component.person.id = 1;
    spyOn(organizationService, 'removePerson').and.returnValue(Promise.resolve(void 0));
    spyOn(personService, 'fetchById').and.returnValue(Promise.resolve(mockPerson));

    component.removeOrganization(mockOrg);

    setTimeout(() => {
      expect(organizationService.removePerson).toHaveBeenCalledWith(1, 1);
      expect(personService.fetchById).toHaveBeenCalledWith(1);
      done();
    }, 100);
  });

  it('should not refresh if person id is undefined', () => {
    component.person.id = undefined;
    spyOn(personService, 'fetchById');

    component.refresh();

    expect(personService.fetchById).not.toHaveBeenCalled();
  });

  it('should refresh person data', (done) => {
    const refreshedPerson: Person = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '123',
      bio: 'test',
      createdAt: new Date(),
      updatedAt: new Date(),
      organizations: []
    };

    component.person.id = 1;
    spyOn(personService, 'fetchById').and.returnValue(Promise.resolve(refreshedPerson));

    component.refresh();

    setTimeout(() => {
      expect(personService.fetchById).toHaveBeenCalledWith(1);
      expect(component.person).toEqual(refreshedPerson);
      expect(component.isNew).toBe(false);
      done();
    }, 100);
  });
});

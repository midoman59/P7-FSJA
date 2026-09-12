import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationDetailsComponent } from './organization-details.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from "@angular/router/testing";
import { OrganizationService, Organization } from '../organization.service';
import { PersonService, Person } from '../person.service';
import { ActivatedRoute, Router } from '@angular/router';


describe('OrganizationDetailsComponent', () => {
  let component: OrganizationDetailsComponent;
  let fixture: ComponentFixture<OrganizationDetailsComponent>;
  let organizationService: OrganizationService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganizationDetailsComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [OrganizationService, PersonService]
    })
      .compileComponents();

    fixture = TestBed.createComponent(OrganizationDetailsComponent);
    component = fixture.componentInstance;
    organizationService = TestBed.inject(OrganizationService);
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty organization', () => {
    expect(component.org).toBeDefined();
    expect(component.org.name).toBe('');
  });

  it('should have isNew false initially', () => {
    expect(component.isNew).toBe(false);
  });

  it('should have empty persons array in org initially', () => {
    expect(component.org.persons).toBeDefined();
    expect(component.org.persons.length).toBe(0);
  });

  it('should set isNew to true when navigating to /new', () => {
    const route = TestBed.inject(ActivatedRoute);
    spyOn(route.snapshot.paramMap, 'get').and.returnValue('new');

    component.ngOnInit();

    expect(component.isNew).toBe(true);
  });

  it('should fetch organization data when navigating to existing org', (done) => {
    const mockOrg: Organization = {
      id: 1,
      name: 'Acme Corp',
      createdAt: new Date(),
      updatedAt: new Date(),
      persons: []
    };

    spyOn(organizationService, 'fetchById').and.returnValue(Promise.resolve(mockOrg));
    const route = TestBed.inject(ActivatedRoute);
    spyOn(route.snapshot.paramMap, 'get').and.returnValue('1');

    component.ngOnInit();

    setTimeout(() => {
      expect(organizationService.fetchById).toHaveBeenCalledWith(1);
      expect(component.org).toEqual(mockOrg);
      expect(component.isNew).toBe(false);
      done();
    }, 100);
  });

  it('should save organization and navigate when isNew is true', (done) => {
    const savedOrg: Organization = {
      id: 1,
      name: 'Acme Corp',
      createdAt: new Date(),
      updatedAt: new Date(),
      persons: []
    };

    spyOn(organizationService, 'save').and.returnValue(Promise.resolve(savedOrg));
    spyOn(router, 'navigate');

    component.org = { ...savedOrg, id: undefined };
    component.isNew = true;
    component.saveOrg();

    setTimeout(() => {
      expect(organizationService.save).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['organizations', 1]);
      done();
    }, 100);
  });

  it('should save organization without navigation when isNew is false', (done) => {
    const updatedOrg: Organization = {
      id: 1,
      name: 'Updated Corp',
      createdAt: new Date(),
      updatedAt: new Date(),
      persons: []
    };

    spyOn(organizationService, 'save').and.returnValue(Promise.resolve(updatedOrg));
    spyOn(router, 'navigate');

    component.org = updatedOrg;
    component.isNew = false;
    component.saveOrg();

    setTimeout(() => {
      expect(organizationService.save).toHaveBeenCalled();
      expect(router.navigate).not.toHaveBeenCalled();
      done();
    }, 100);
  });

  it('should delete organization and navigate home', (done) => {
    const orgToDelete: Organization = {
      id: 1,
      name: 'Acme Corp',
      createdAt: new Date(),
      updatedAt: new Date(),
      persons: []
    };

    spyOn(organizationService, 'deleteById').and.returnValue(Promise.resolve(void 0));
    spyOn(router, 'navigate');

    component.org = orgToDelete;
    component.deleteOrg();

    setTimeout(() => {
      expect(organizationService.deleteById).toHaveBeenCalledWith(1);
      expect(router.navigate).toHaveBeenCalledWith(['']);
      done();
    }, 100);
  });

  it('should not delete organization if id is undefined', () => {
    component.org.id = undefined;
    spyOn(organizationService, 'deleteById');

    component.deleteOrg();

    expect(organizationService.deleteById).not.toHaveBeenCalled();
  });
});

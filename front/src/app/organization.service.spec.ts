import { TestBed, fakeAsync, flush } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { OrganizationService, Organization } from './organization.service';
import { Person } from './person.service';
import { API_BASE_URL } from './config';

describe('OrganizationService', () => {
  let service: OrganizationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [OrganizationService]
    });
    service = TestBed.inject(OrganizationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch all organizations', fakeAsync(() => {
    const mockOrgs = [
      { id: 1, name: 'Acme', createdAt: new Date(), persons: [] },
      { id: 2, name: 'TechCorp', createdAt: new Date(), persons: [] }
    ];

    let result: Organization[] | null = null;
    service.fetchAll().then((orgs) => result = orgs);
    flush();

    httpMock.expectOne(`${API_BASE_URL}/organizations`).flush({ _embedded: { organizations: mockOrgs } });
    flush();

    expect(result).toBeTruthy();
    expect(result!.length).toBe(2);
  }));

  it('should fetch organization by id with persons', fakeAsync(() => {
    const mockOrg: Organization = { id: 1, name: 'Acme', createdAt: new Date(), persons: [] };
    const mockPersons: Person[] = [{
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '123',
      bio: 'test',
      createdAt: new Date(),
      organizations: []
    }];

    let result: Organization | null = null;
    service.fetchById(1).then((org) => result = org);
    flush();

    httpMock.expectOne(`${API_BASE_URL}/organizations/1`).flush(mockOrg);
    flush();

    httpMock.expectOne(`${API_BASE_URL}/organizations/1/persons`).flush({ _embedded: { persons: mockPersons } });
    flush();

    expect(result).toBeTruthy();
    expect(result!.persons.length).toBe(1);
  }));

  it('should fetch organization persons', fakeAsync(() => {
    const mockPersons: Person[] = [{
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '123',
      bio: 'test',
      createdAt: new Date(),
      organizations: []
    }];

    let result: Person[] | null = null;
    service.fetchOrganizationPersons(1).then((persons) => result = persons);
    flush();

    httpMock.expectOne(`${API_BASE_URL}/organizations/1/persons`).flush({ _embedded: { persons: mockPersons } });
    flush();

    expect(result).toBeTruthy();
    expect(result!.length).toBe(1);
  }));

  it('should delete organization', fakeAsync(() => {
    let deleted = false;
    service.deleteById(1).then(() => deleted = true);
    flush();

    httpMock.expectOne(`${API_BASE_URL}/organizations/1`).flush({});
    flush();

    expect(deleted).toBe(true);
  }));

  it('should save new organization (POST)', fakeAsync(() => {
    const newOrg: Organization = { id: undefined, name: 'NewCorp', createdAt: new Date(), persons: [] };
    const savedOrg: Organization = { ...newOrg, id: 3, createdAt: new Date() };

    let result: Organization | null = null;
    service.save(newOrg).then((org) => result = org);
    flush();

    const postReq = httpMock.expectOne(`${API_BASE_URL}/organizations`);
    expect(postReq.request.method).toBe('POST');
    expect(postReq.request.body).toEqual({ name: 'NewCorp' });
    postReq.flush(savedOrg);
    flush();

    httpMock.expectOne(`${API_BASE_URL}/organizations/3/persons`).flush({ _embedded: { persons: [] } });
    flush();

    expect(result!.id).toBe(3);
  }));

  it('should update existing organization (PUT)', fakeAsync(() => {
    const existingOrg: Organization = { id: 1, name: 'Updated Acme', createdAt: new Date(), persons: [] };

    let result: Organization | null = null;
    service.save(existingOrg).then((org) => result = org);
    flush();

    const putReq = httpMock.expectOne(`${API_BASE_URL}/organizations/1`);
    expect(putReq.request.method).toBe('PUT');
    expect(putReq.request.body).toEqual({ name: 'Updated Acme' });
    putReq.flush(existingOrg);
    flush();

    httpMock.expectOne(`${API_BASE_URL}/organizations/1/persons`).flush({ _embedded: { persons: [] } });
    flush();

    expect(result!.name).toBe('Updated Acme');
  }));

  it('should add person to organization', fakeAsync(() => {
    let added = false;
    service.addPerson(1, 2).then(() => added = true);
    flush();

    const req = httpMock.expectOne(`${API_BASE_URL}/organizations/1/persons`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toBe(`${API_BASE_URL}/persons/2`);
    req.flush({});
    flush();

    expect(added).toBe(true);
  }));

  it('should remove person from organization', fakeAsync(() => {
    let removed = false;
    service.removePerson(1, 2).then(() => removed = true);
    flush();

    const req = httpMock.expectOne(`${API_BASE_URL}/persons/2/organizations/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
    flush();

    expect(removed).toBe(true);
  }));

  it('should handle multiple persons', fakeAsync(() => {
    const mockOrg: Organization = { id: 1, name: 'Acme', createdAt: new Date(), persons: [] };
    const mockPersons: Person[] = [
      { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com', phone: '123', bio: 'test', createdAt: new Date(), organizations: [] },
      { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', phone: '456', bio: 'test2', createdAt: new Date(), organizations: [] }
    ];

    let result: Organization | null = null;
    service.fetchById(1).then((org) => result = org);
    flush();

    httpMock.expectOne(`${API_BASE_URL}/organizations/1`).flush(mockOrg);
    flush();

    httpMock.expectOne(`${API_BASE_URL}/organizations/1/persons`).flush({ _embedded: { persons: mockPersons } });
    flush();

    expect(result!.persons.length).toBe(2);
  }));
});

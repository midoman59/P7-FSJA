import { TestBed, fakeAsync, flush } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PersonService, Person } from './person.service';
import { Organization } from './organization.service';
import { API_BASE_URL } from './config';

describe('PersonService', () => {
  let service: PersonService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PersonService]
    });
    service = TestBed.inject(PersonService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch all persons', fakeAsync(() => {
    const mockPersons = [{
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
    service.fetchAll().then((persons) => result = persons);
    flush();

    httpMock.expectOne(`${API_BASE_URL}/persons`).flush({ _embedded: { persons: mockPersons } });
    flush();

    expect(result).toBeTruthy();
    expect(result![0].firstName).toBe('John');
  }));

  it('should fetch person by id with organizations', fakeAsync(() => {
    const mockPerson: Person = { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com', phone: '123', bio: 'test', createdAt: new Date(), organizations: [] };
    const mockOrgs: Organization[] = [{ id: 1, name: 'Acme', createdAt: new Date(), persons: [] }];

    let result: Person | null = null;
    service.fetchById(1).then((p) => result = p);
    flush();

    httpMock.expectOne(`${API_BASE_URL}/persons/1`).flush(mockPerson);
    flush();

    httpMock.expectOne(`${API_BASE_URL}/persons/1/organizations`).flush({ _embedded: { organizations: mockOrgs } });
    flush();

    expect(result).toBeTruthy();
    expect(result!.organizations.length).toBe(1);
  }));

  it('should fetch person organizations', fakeAsync(() => {
    const mockOrgs = [{ id: 1, name: 'Acme', createdAt: new Date(), persons: [] }];

    let result: Organization[] | null = null;
    service.fetchPersonOrganizations(1).then((orgs) => result = orgs);
    flush();

    httpMock.expectOne(`${API_BASE_URL}/persons/1/organizations`).flush({ _embedded: { organizations: mockOrgs } });
    flush();

    expect(result).toBeTruthy();
    expect(result!.length).toBe(1);
  }));

  it('should delete person', fakeAsync(() => {
    let deleted = false;
    service.deleteById(1).then(() => deleted = true);
    flush();

    httpMock.expectOne(`${API_BASE_URL}/persons/1`).flush({});
    flush();

    expect(deleted).toBe(true);
  }));

  it('should save new person (POST)', fakeAsync(() => {
    const newPerson: Person = { id: undefined, firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', phone: '456', bio: 'new', createdAt: new Date(), organizations: [] };
    const savedPerson: Person = { ...newPerson, id: 2, createdAt: new Date() };

    let result: Person | null = null;
    service.save(newPerson).then((p) => result = p);
    flush();

    const postReq = httpMock.expectOne(`${API_BASE_URL}/persons`);
    expect(postReq.request.method).toBe('POST');
    postReq.flush(savedPerson);
    flush();

    httpMock.expectOne(`${API_BASE_URL}/persons/2/organizations`).flush({ _embedded: { organizations: [] } });
    flush();

    expect(result!.id).toBe(2);
  }));

  it('should update existing person (PUT)', fakeAsync(() => {
    const existingPerson: Person = { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com', phone: '123', bio: 'updated', createdAt: new Date(), organizations: [] };

    let result: Person | null = null;
    service.save(existingPerson).then((p) => result = p);
    flush();

    const putReq = httpMock.expectOne(`${API_BASE_URL}/persons/1`);
    expect(putReq.request.method).toBe('PUT');
    putReq.flush(existingPerson);
    flush();

    httpMock.expectOne(`${API_BASE_URL}/persons/1/organizations`).flush({ _embedded: { organizations: [] } });
    flush();

    expect(result!.bio).toBe('updated');
  }));

  it('should handle multiple organizations', fakeAsync(() => {
    const mockPerson: Person = { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com', phone: '123', bio: 'test', createdAt: new Date(), organizations: [] };
    const mockOrgs: Organization[] = [
      { id: 1, name: 'Acme', createdAt: new Date(), persons: [] },
      { id: 2, name: 'Tech', createdAt: new Date(), persons: [] }
    ];

    let result: Person | null = null;
    service.fetchById(1).then((p) => result = p);
    flush();

    httpMock.expectOne(`${API_BASE_URL}/persons/1`).flush(mockPerson);
    flush();

    httpMock.expectOne(`${API_BASE_URL}/persons/1/organizations`).flush({ _embedded: { organizations: mockOrgs } });
    flush();

    expect(result!.organizations.length).toBe(2);
  }));
});

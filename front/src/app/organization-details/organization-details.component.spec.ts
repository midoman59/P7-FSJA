import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationDetailsComponent } from './organization-details.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from "@angular/router/testing";
import { OrganizationService } from '../organization.service';


describe('OrganizationDetailsComponent', () => {
  let component: OrganizationDetailsComponent;
  let fixture: ComponentFixture<OrganizationDetailsComponent>;
  let organizationService: OrganizationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganizationDetailsComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [OrganizationService]
    })
      .compileComponents();

    fixture = TestBed.createComponent(OrganizationDetailsComponent);
    component = fixture.componentInstance;
    organizationService = TestBed.inject(OrganizationService);
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
});

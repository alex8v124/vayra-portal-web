import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StorecheckProcessor } from './storecheck-processor';

describe('StorecheckProcessor', () => {
  let component: StorecheckProcessor;
  let fixture: ComponentFixture<StorecheckProcessor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StorecheckProcessor],
    }).compileComponents();

    fixture = TestBed.createComponent(StorecheckProcessor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

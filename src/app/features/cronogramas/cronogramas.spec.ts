import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cronogramas } from './cronogramas';

describe('Cronogramas', () => {
  let component: Cronogramas;
  let fixture: ComponentFixture<Cronogramas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cronogramas],
    }).compileComponents();

    fixture = TestBed.createComponent(Cronogramas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

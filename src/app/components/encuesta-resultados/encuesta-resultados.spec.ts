import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EncuestaResultados } from './encuesta-resultados';

describe('EncuestaResultados', () => {
  let component: EncuestaResultados;
  let fixture: ComponentFixture<EncuestaResultados>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EncuestaResultados],
    }).compileComponents();

    fixture = TestBed.createComponent(EncuestaResultados);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

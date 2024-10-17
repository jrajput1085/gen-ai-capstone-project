import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BalancesComponent } from './balances.component';

describe('BalancesComponent', () => {
  let component: BalancesComponent;
  let fixture: ComponentFixture<BalancesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BalancesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BalancesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

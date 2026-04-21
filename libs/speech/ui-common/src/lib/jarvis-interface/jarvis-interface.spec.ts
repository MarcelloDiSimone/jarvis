import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiJarvisInterfaceComponent } from './jarvis-interface';

describe('UiJarvisInterfaceComponent', () => {
  let component: UiJarvisInterfaceComponent;
  let fixture: ComponentFixture<UiJarvisInterfaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiJarvisInterfaceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UiJarvisInterfaceComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

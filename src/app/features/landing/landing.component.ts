import { Component } from '@angular/core';
import { NavComponent } from './components/nav/nav.component';
import { HeroSectionComponent } from './components/hero-section/hero-section.component';
import { FeaturesSectionComponent } from './components/features-section/features-section.component';
import { HowItWorksSectionComponent } from './components/how-it-works-section/how-it-works-section.component';
import { ReputationSectionComponent } from './components/reputation-section/reputation-section.component';
import { CtaSectionComponent } from './components/cta-section/cta-section.component';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    NavComponent,
    HeroSectionComponent,
    FeaturesSectionComponent,
    HowItWorksSectionComponent,
    ReputationSectionComponent,
    CtaSectionComponent,
    FooterComponent,
  ],
  template: `
    <app-nav />
    <app-hero-section />
    <div class="divider"></div>
    <app-features-section />
    <div class="divider"></div>
    <app-how-it-works-section />
    <div class="divider"></div>
    <app-reputation-section />
    <div class="divider"></div>
    <app-cta-section />
    <app-footer />
  `,
  styles: [`
    .divider {
      height: 1px; margin: 0 6vw;
      background: linear-gradient(to right, transparent, rgba(240,192,64,.25), transparent);
    }
  `],
})
export class LandingComponent {}

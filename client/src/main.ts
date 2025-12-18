import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app'; // <--- MATCH THIS NAME with the one above!

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
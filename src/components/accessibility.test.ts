// @vitest-environment jsdom

import { describe, it, expect } from 'vitest';
import { axe } from 'vitest-axe';

describe('Portal Accessibility Checks', () => {
  it('should have no accessibility violations on the main tab navigation template', async () => {
    const htmlTemplate = `
      <main>
        <div class="bg-slate-900/40 border border-slate-850 p-2 rounded-2xl">
          <nav role="tablist" aria-label="Portal sections">
            <button id="tab-weather" role="tab" aria-selected="true" aria-controls="panel-weather">
              Alerts & Weather
            </button>
            <button id="tab-planner" role="tab" aria-selected="false" aria-controls="panel-planner">
              GenAI Planner
            </button>
          </nav>
          <div>
            <div id="panel-weather" role="tabpanel" aria-labelledby="tab-weather">
              Weather details content here
            </div>
          </div>
        </div>
      </main>
    `;

    const results = await axe(htmlTemplate);
    expect(results.violations).toEqual([]);
  });

  it('should verify that search inputs have associated label tags', async () => {
    const htmlTemplate = `
      <main>
        <form>
          <label for="weather-search-input">Search location name</label>
          <input id="weather-search-input" type="text" name="city" value="Mumbai" />
          <button type="submit">Search</button>
        </form>
      </main>
    `;

    const results = await axe(htmlTemplate);
    expect(results.violations).toEqual([]);
  });
});

const { Tool } = require('@langchain/core/tools');
const { getEnvironmentVariable } = require('@langchain/core/utils/env');

class OpenWeatherMap extends Tool {
  static lc_name() {
    return 'openweathermap';
  }

  constructor(fields = {}) {
    super(fields);

    this.name = 'openweathermap';
    this.description = 'Get the current weather for a location.';
    let appIdKey = 'OPENWEATHERMAP_APP_ID';
    this.appId = fields[appIdKey] ?? getEnvironmentVariable(appIdKey);
    if (!this.appId) {
      throw new Error('OPENWEATHERMAP_APP_ID is not set');
    }
  }

  async geocode(location) {
    const params = new URLSearchParams({
      q: location,
      appid: this.appId,
    });

    const geoRes = await fetch(`http://api.openweathermap.org/geo/1.0/direct?${params}&limit=1`);
    const data = await geoRes.json();
    if (data.length === 0) {
      throw new Error(`Could not find location: ${location}`);
    }
    return [data[0].lat, data[0].lon];
  }

  async fetchWeather(lat, lon) {
    const params = new URLSearchParams({
      lat,
      lon,
      appid: this.appId,
      units: 'metric',
    });

    const weatherRes = await fetch(`https://api.openweathermap.org/data/3.0/onecall?${params}`);
    const data = await weatherRes.json();
    console.log({ data });
    return data || {};
  }

  async _call(location) {
    let [lat, lon] = await this.geocode(location);
    let weatherData = await this.fetchWeather(lat, lon);
    return JSON.stringify(weatherData);
  }
}

module.exports = OpenWeatherMap;

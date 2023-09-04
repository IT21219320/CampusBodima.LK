const geoCoding = (lat,lng) => {
  return new Promise((resolve, reject) => {
    fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.status === 'OK') {
          const addressComponents = data.results[0].address_components;
          const cityComponent = addressComponents.find((component) =>
            component.types.includes('locality')
          );

          if (cityComponent) {
            const cityName = cityComponent.long_name;
            resolve(cityName);
          } else {
            reject('City not found in response.');
          }
        } else {
          reject(`Error fetching location details: ${data.status}`);
        }
      })
      .catch((error) => {
        reject(`Error fetching location details: ${error}`);
      });
  });
};

export { geoCoding };

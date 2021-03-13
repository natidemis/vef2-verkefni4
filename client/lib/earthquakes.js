export async function fetchEarthquakes(type, period) {
  // TODO sækja gögn frá proxy þjónustu
  if (!type || !period) {
    return { data: {} };
  }
  const url = `/proxy?period=${period}&type=${type}`;
  let result;
  try {
    result = await fetch(url);
  } catch (e) {
    console.error('Villa við að sækja', e);
    return null;
  }

  if (!result.ok) {
    console.error('Ekki 200 svar', await result.text());
    return null;
  }

  const data = await result.json();
  console.log(data);
  return data;
}

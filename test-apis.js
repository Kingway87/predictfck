
async function testApis() {
  console.log('Testing Polymarket API...');
  try {
    const polyUrl = 'https://gamma-api.polymarket.com/markets?limit=5&closed=false&active=true';
    const polyRes = await fetch(polyUrl);
    console.log('Polymarket Status:', polyRes.status);
    if (polyRes.ok) {
      const data = await polyRes.json();
      console.log('Polymarket Data Sample:', Array.isArray(data) ? data.length : data);
    } else {
      console.log('Polymarket Error:', await polyRes.text());
    }
  } catch (e) {
    console.error('Polymarket Fetch Error:', e);
  }

  console.log('\nTesting Kalshi API...');
  try {
    const kalshiUrl = 'https://api.elections.kalshi.com/trade-api/v2/markets?status=open&limit=5';
    const kalshiRes = await fetch(kalshiUrl);
    console.log('Kalshi Status:', kalshiRes.status);
    if (kalshiRes.ok) {
      const data = await kalshiRes.json();
      console.log('Kalshi Data Sample:', data.markets ? data.markets.length : data);
    } else {
      console.log('Kalshi Error:', await kalshiRes.text());
    }
  } catch (e) {
    console.error('Kalshi Fetch Error:', e);
  }
}

testApis();

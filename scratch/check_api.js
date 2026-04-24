import axios from 'axios';

async function checkApi() {
  try {
    const ownerRes = await axios.get('http://localhost:8080/api/owners/current');
    console.log('Owner Data:', JSON.stringify(ownerRes.data, null, 2));

    const analyticsRes = await axios.get('http://localhost:8080/api/analytics/current');
    console.log('Analytics Data:', JSON.stringify(analyticsRes.data, null, 2));
  } catch (error) {
    console.error('API Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

checkApi();

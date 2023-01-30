import axios from 'axios'

const API_URL = '/api/'

// Get districts' polygon coordinates
const getPolygons = async () => {
  const response = await axios.get(API_URL + 'geometry/polygons')
  return response.data
}

// Get districts' flood data
const getFloodData = async (date) => {
  const response = await axios.get(API_URL + 'flood-data')

  // console.log(response)
  return response.data
}

const apiDataService = {
  getPolygons,
  getFloodData,
}

export default apiDataService

import React, { useState, useEffect, useRef } from 'react'

import { Provider, useSelector, useDispatch } from 'react-redux'

import { store } from '../app/store'

import { createRoot } from 'react-dom/client'
import GoogleMapReact from 'google-map-react'
// import { InfoWindow } from 'google-map-react'
import ee from '@google/earthengine'
import { selectDistrict } from '../features/apiData/apiDataSlice'
import {
  setMap,
  clearOverlay,
  setIsInfoWindowOpen,
  setOverlay,
  setShowOverlay,
} from '../features/map/mapSlice'
// import { setShowOverlay } from '../features/map/mapSlice'
// import { setOverlay } from '../features/map/mapSlice'
// import { clearOverlay } from '../features/map/mapSlice'
import axios from 'axios'
import mapStyles from '../MapModification/mapStyles'
import RoadMarker from './RoadMarker'
import MapSpinner from './MapSpinner'
import newCoordsPak from '../MapModification/newCoordsPak'
import CustomControl from './CustomControl'
import MapZoom from './MapZoom'
import MapFullScreen from './MapFullScreen'
import MapDistrictsLegend from './MapDistrictsLegend'
import MapMarkersLegend from './MapMarkersLegend'

const Map = ({ center, zoom, backendData }) => {
  const dispatch = useDispatch()

  const { selectedFloodData, geoFormattedPolygons, globalSelectedDistrict } =
    useSelector((state) => state.apiData)
  const { showRoads, overlay, isInfoWindowOpen, mapTheme } = useSelector(
    (state) => state.map
  )

  const [apiDataArray, setApiDataArray] = useState([])
  const [apiPolygonArray, setApiPolygonArray] = useState([])
  const [apiFloodDataArray, setApiFloodDataArray] = useState([])
  const [apiRoadCoords, setApiRoadCoords] = useState([])
  const [nativeMap, setNativeMap] = useState(null)
  const [nativeMaps, setNativeMaps] = useState(null)
  const [polygonArray, setPolygonArray] = useState([])
  const [showRoadsFor, setShowRoadsFor] = useState(null)
  const [customZoom, setCustomZoom] = useState(null)
  const [customCenter, setCustomCenter] = useState({})
  const [selectedDistrict, setSelectedDistrict] = useState(null)
  const [maxFlood, setMaxFlood] = useState(selectedFloodData.results.maxFlood)
  const [selectedPeriodDates, setSelectedPeriodDates] = useState([
    selectedFloodData.after_START,
    selectedFloodData.after_END,
  ])

  let mapDistrictsLegendElRef = useRef()
  let mapMarkersLegendElRef = useRef()

  const MapControls = () => {
    return (
      <>
        <div ref={mapDistrictsLegendElRef} />
        <div ref={mapMarkersLegendElRef} />
      </>
    )
  }

  const getFloodPixels = async (afterStart, afterEnd) => {
    console.log(afterStart + '-' + afterEnd)
    await axios
      .post(
        // `http://127.0.0.1:5000/api/district`,
        `https://flood-tracker-app-api.onrender.com/api/api/flood-data/district`,
        {
          afterStart,
          afterEnd,
          district: globalSelectedDistrict.name,
        },
        {
          // cancelToken: source.token,
        }
      )
      .then((response) => {
        console.log(`${globalSelectedDistrict.name} data recieved`)
        const mapid = response.data
        const tileSource = new ee.layers.EarthEngineTileSource({
          mapid,
        })
        const overlay = new ee.layers.ImageOverlay(tileSource)
        dispatch(setShowOverlay(true))
        dispatch(setOverlay(overlay))
        nativeMap.overlayMapTypes.push(overlay)
        setSelectedDistrict(null)
      })
      .catch((error) => {
        if (axios.isCancel(error)) {
          console.log('Request cancelled.')
        } else {
          console.log(error)
        }
      })
  }

  useEffect(() => {
    // console.log(isInfoWindowOpen)
    nativeApiHandler(nativeMap, nativeMaps)
  }, [isInfoWindowOpen])

  useEffect(() => {
    if (!globalSelectedDistrict && nativeMap) {
      polygonArray.forEach((district) => {
        district.setOptions({
          visible: true,
        })
      })
      setShowRoadsFor(null)
      nativeMap.overlayMapTypes.clear()
      nativeMap.setZoom(6)
      setCustomZoom(6)
      setCustomCenter({})
      dispatch(setOverlay(null))
    }
  }, [globalSelectedDistrict])

  // useEffect(() => {
  //   setApiPolygonArray(geoFormattedPolygons)
  //   setApiFloodDataArray(floodData)
  // }, [geoFormattedPolygons, floodData])

  useEffect(() => {
    setApiPolygonArray(geoFormattedPolygons)
  }, [geoFormattedPolygons])

  useEffect(() => {
    setApiFloodDataArray(selectedFloodData.results.resultsArray)
    setMaxFlood(selectedFloodData.results.maxFlood)
    setSelectedPeriodDates([
      selectedFloodData.after_START,
      selectedFloodData.after_END,
    ])
    polygonArray.map((polygon) => {
      const floodDataObject = selectedFloodData.results.resultsArray.find(
        (floodObj) => floodObj.name === polygon.name
      )
      return polygon.setOptions({
        fillOpacity:
          floodDataObject.results.after.floodWater /
          selectedFloodData.results.maxFlood,
      })
    })
    // dispatch(selectDistrict(null))
    nativeMap?.overlayMapTypes?.clear()

    if (globalSelectedDistrict) {
      getFloodPixels(selectedFloodData.after_START, selectedFloodData.after_END)
    }
  }, [selectedFloodData])

  useEffect(() => {
    if (nativeMap && nativeMaps) {
      nativeApiHandler(nativeMap, nativeMaps)
    }
  }, [nativeMap, nativeMaps])

  useEffect(() => {
    if (apiFloodDataArray?.length && showRoadsFor) {
      const districtObject = apiFloodDataArray.find(
        (district) => district.name === showRoadsFor
      )
      if (districtObject) {
        setApiRoadCoords(districtObject.results.roads)
      }
    }
  }, [apiFloodDataArray, showRoadsFor])

  const nativeApiHandler = (map, maps) => {
    let source
    polygonArray.map((polygon) => {
      polygon.setMap(map)
      polygon.addListener('click', async () => {
        dispatch(selectDistrict(polygon.name))
        const districtFloodObject = apiFloodDataArray.find(
          (floodObj) => floodObj.name === polygon.name
        )
        setSelectedDistrict(districtFloodObject)
        map.overlayMapTypes.clear()
        dispatch(clearOverlay())
        // map.setZoom(8)
        setCustomZoom(8)
        map.setZoom(8)
        // console.log(customZoom)
        setShowRoadsFor(polygon.name)
        setCustomCenter(polygon.center)

        if (source) {
          source.cancel()
        }
        source = axios.CancelToken.source()

        polygonArray.forEach((district) => {
          district.setOptions({
            visible: true,
          })
        })
        polygon.setOptions({
          visible: false,
        })

        await axios
          .post(
            // `http://127.0.0.1:5000/api/district`,
            `https://flood-tracker-app-api.onrender.com/api/flood-data/district`,
            {
              afterStart: selectedPeriodDates[0],
              afterEnd: selectedPeriodDates[1],
              district: polygon.name,
            },
            {
              cancelToken: source.token,
            }
          )
          .then((response) => {
            console.log(`${polygon.name} data recieved`)
            const mapid = response.data
            const tileSource = new ee.layers.EarthEngineTileSource({
              mapid,
            })
            const overlay = new ee.layers.ImageOverlay(tileSource)
            dispatch(setShowOverlay(true))
            dispatch(setOverlay(overlay))
            map.overlayMapTypes.push(overlay)
            setSelectedDistrict(null)
          })
          .catch((error) => {
            if (axios.isCancel(error)) {
              console.log('Request cancelled.')
            } else {
              console.log(error)
            }
          })
      })
      // polygon.addListener('mouseover', () => {
      //   console.log(polygon.name)
      //   someIndex++
      // })
    })
  }

  const handleApiLoaded = (map, maps) => {
    console.log('the map handle api has been called')

    const newCoordsPakArrayReducedArray = [].concat(...newCoordsPak)

    const holePolygonCoords = newCoordsPakArrayReducedArray.map(
      (innerArrays) => {
        return innerArrays.map((coords) => {
          return { lat: coords[1], lng: coords[0] }
        })
      }
    )

    const coverPolygonCoords = [
      //anti-clockwise
      { lat: -89, lng: 0 },
      { lat: -89, lng: 179 },
      { lat: 89, lng: 179 },
      { lat: 89, lng: 0 },
      { lat: -89, lng: 0 },
    ]

    holePolygonCoords.unshift(coverPolygonCoords)

    map.data.add({
      geometry: new maps.Data.Polygon(holePolygonCoords),
    })

    map.data.setStyle({
      fillColor: '#020416',
      // fillColor: '#0e1824',
      // fillColor: 'red',
      strokeWeight: 1,
      fillOpacity: 1,
    })

    map.data.addListener('click', () => {
      dispatch(selectDistrict(null))
    })

    const districtPolygons = apiPolygonArray.map((geometryObject, index) => {
      const floodDataObject = apiFloodDataArray.find(
        (floodObj) => floodObj.name === geometryObject.name
      )
      return new maps.Polygon({
        paths: geometryObject.coordinates,
        strokeColor: 'black',
        strokeOpacity: 1,
        strokeWeight: 0.4,
        // fillColor: '#00FFFF88',
        fillColor: '#33aaff',
        fillOpacity: floodDataObject.results.after.floodWater / maxFlood,
        name: geometryObject.name,
        center: geometryObject.center,
        uncovered: false,
      })
    })

    createRoot(mapDistrictsLegendElRef.current).render(
      <Provider store={store}>
        <MapDistrictsLegend />
      </Provider>
    )
    map.controls[maps.ControlPosition.LEFT_BOTTOM].push(
      mapDistrictsLegendElRef.current
    )

    createRoot(mapMarkersLegendElRef.current).render(
      <MapMarkersLegend maxValue={maxFlood} />
    )
    map.controls[maps.ControlPosition.TOP_LEFT].push(
      mapMarkersLegendElRef.current
    )

    setPolygonArray(districtPolygons)
    setNativeMap(map)
    setNativeMaps(maps)

    dispatch(setMap(map))
  }

  return (
    <>
      <MapControls />
      <div className="map h-full">
        <GoogleMapReact
          bootstrapURLKeys={{
            key: 'AIzaSyCJ6LFFCDXC1QFms7h8BcO3KiJZwS20HDg', //env variable
          }}
          options={{
            // disableDefaultUI: true,
            // disableDoubleClickZoom: true,
            styles: mapTheme === 'dark' ? mapStyles.labelDarkTheme : [],
            restriction: {
              latLngBounds: {
                north: 40,
                south: 20,
                west: 55,
                east: 82,
              },
              strictBounds: true,
            },
          }}
          defaultCenter={{ lat: 30.3753, lng: 69.3451 }}
          center={Object.keys(customCenter).length ? customCenter : center}
          defaultZoom={zoom}
          zoom={customZoom ? customZoom : zoom}
          yesIWantToUseGoogleMapApiInternals
          onGoogleApiLoaded={({ map, maps, MapOptions }) =>
            handleApiLoaded(map, maps, MapOptions)
          }
        >
          {selectedDistrict && customCenter && (
            <MapSpinner
              lat={customCenter.lat}
              lng={customCenter.lng}
            />
          )}
          {!selectedDistrict &&
            showRoads &&
            showRoadsFor &&
            apiRoadCoords.map((coordinates, i) => (
              <RoadMarker
                key={i}
                lat={coordinates.lat}
                lng={coordinates.lng}
                size="11px"
              />
            ))}
          {/* <InfoWindow visible={true} /> */}
          {/* <JunkMarker
            lat={30.3753}
            lng={69.3451}
          /> */}
        </GoogleMapReact>
      </div>
    </>
  )
}

Map.defaultProps = {
  zoom: 6,
  center: { lat: 30.3753, lng: 69.3451 },
  isbDisplayPolygon: true,
  chitralDisplayPolygon: true,
}

export default Map

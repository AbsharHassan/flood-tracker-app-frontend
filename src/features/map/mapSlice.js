import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  map: null,
  maps: null,
  overlay: null,
  showOverlay: true,
  showRoads: true,
  mapTheme: 'dark',
  isInfoWindowOpen: true,
  showInfoWindow: false,
  selectedMarkerCoords: {},
}

const setOverlayDisplay = () => {}

export const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    toggleOverlayDisplay: (state) => {
      state.showOverlay = !state.showOverlay
      if (state.showOverlay) {
        if (state.overlay) {
          state.map.overlayMapTypes.push(state.overlay)
        }
      } else {
        state.map.overlayMapTypes.clear()
      }
      console.log(state.showOverlay)
    },
    setShowOverlay: (state, value) => {
      state.showOverlay = value.payload
    },
    setMap: (state, map) => {
      state.map = map.payload
    },
    setOverlay: (state, overlay) => {
      state.overlay = overlay.payload
      // console.log(state.overlay)
    },
    clearOverlay: (state) => {
      state.map.overlayMapTypes.clear()
      state.overlay = null
    },
    setIsInfoWindowOpen: (state, value) => {
      state.isInfoWindowOpen = value.payload
    },
    setShowInfoWindow: (state, value) => {
      state.showInfoWindow = value.payload
    },
    setSelectedMarkerCoords: (state, coords) => {
      state.selectedMarkerCoords = coords.payload
    },
    setMapTheme: (state, value) => {
      state.mapTheme = value.payload
    },
    setShowRoads: (state, { payload }) => {
      state.showRoads = payload
    },
    toggleShowRoads: (state) => {
      state.showRoads = !state.showRoads
      console.log(state.showRoads)
    },
    setFloodPixelOpacity: (state, { payload }) => {
      console.log(state.map.overlayMapTypes)
    },
  },
})

export const {
  toggleOverlayDisplay,
  setShowOverlay,
  setMap,
  setOverlay,
  clearOverlay,
  setIsInfoWindowOpen,
  setShowInfoWindow,
  setSelectedMarkerCoords,
  setMapTheme,
  setShowRoads,
  toggleShowRoads,
  setFloodPixelOpacity,
} = mapSlice.actions

export default mapSlice.reducer

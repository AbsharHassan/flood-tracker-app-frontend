import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { toggleSidebar } from '../features/sidebar/sidebarSlice'
import { selectDistrict } from '../features/apiData/apiDataSlice'
import {
  toggleOverlayDisplay,
  setMapTheme,
  setShowRoads,
  toggleShowRoads,
  setFloodPixelOpacity,
} from '../features/map/mapSlice'
import { CSSTransition } from 'react-transition-group'

import { TextField } from '@mui/material'
import Box from '@mui/material/Box'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import ToggleButton from '@mui/material/ToggleButton'
import Switch from '@mui/material/Switch'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import Slider from '@mui/material/Slider'

import { BsArrowBarLeft, BsMapFill } from 'react-icons/bs'
import { HiX, HiSearch } from 'react-icons/hi'
import { RiDashboardFill, RiPaletteFill, RiMap2Fill } from 'react-icons/ri'
import { AiFillControl, AiFillInfoCircle } from 'react-icons/ai'
import { GoCalendar } from 'react-icons/go'
import { TbMapPins } from 'react-icons/tb'
import { IoWater } from 'react-icons/io5'
import { RxReset } from 'react-icons/rx'
import { GrPowerReset } from 'react-icons/gr'
import { IoRefreshOutline } from 'react-icons/io5'
import { TiRefresh } from 'react-icons/ti'

import DateSelector from './DateSelector'

import dayjs from 'dayjs'

const Sidebar = () => {
  const { sidebarIsOpen } = useSelector((state) => state.sidebar)
  const { map, showOverlay, mapTheme, showRoads, overlay } = useSelector(
    (state) => state.map
  )
  const { user } = useSelector((state) => state.auth)

  const dispatch = useDispatch()

  const [isSearchOpen, setIsSearchOpen] = useState(true)
  const [dateValue, setDateValue] = useState(dayjs(new Date()))
  const [startDate, setStartDate] = useState('2022/01/01')
  const [isDateDialogOpen, setIsDateDialogOpen] = useState(false)
  const [isColorSelectorOpen, setIsColorSelectorOpen] = useState(false)
  // const [endDate, setStartDate] = useState('2022/01/01')
  // const [mapTheme, setMapTheme] = useState('dark')
  const [roadSwitch, setRoadSwitch] = useState(showRoads)
  const [pixelsSwitch, setPixelsSwitch] = useState(true)
  const [disableRoadSwitch, setDisableRoadSwitch] = useState(true)
  const [floodColor, setFloodColor] = useState('blue')
  const [floodPixelOpacity, setFloodPixelOpacity] = useState(50)
  const [innerWidth, setInnerWidth] = useState(window.innerWidth)
  const [isScreenLg, setIsScreenLg] = useState(innerWidth > 1024 ? true : false)
  const [searchIsFocused, setSearchIsFocused] = useState(false)
  const [menuLinks, setMenuLinks] = useState([
    {
      title: 'Dashboard',
      icon: <RiDashboardFill />,
      path: '/',
    },
    {
      title: 'Control Panel',
      icon: <AiFillControl />,
      path: user ? '/control-panel' : '/login',
    },
    {
      title: 'About',
      icon: <AiFillInfoCircle />,
      path: '/about',
    },
  ])

  const handleMapThemeChange = (e, newTheme) => {
    // if (mapTheme == 'dark') {
    //   setMapTheme('light')
    // } else {
    //   setMapTheme('dark')
    // }
    console.log(newTheme)
    if (newTheme !== null) {
      setMapTheme(newTheme)
    }
  }

  const handleResetRequest = () => {
    dispatch(selectDistrict(null))
    if (sidebarIsOpen) {
      resetIconRefOpen.current.classList.add('reset-spinner')
      setTimeout(() => {
        resetIconRefOpen.current.classList.remove('reset-spinner')
      }, 1500)
    } else {
      resetIconRefClosed.current.classList.add('reset-spinner')
      setTimeout(() => {
        resetIconRefClosed.current.classList.remove('reset-spinner')
      }, 1500)
    }
  }

  const handleColorChange = (e) => {
    setFloodColor(e.target.value)
  }

  const handleDateDialogState = (value) => {
    setIsDateDialogOpen(value)
  }

  const handleFloodPixelOpacityChange = (e, newValue) => {
    setFloodPixelOpacity(newValue)
    // map.overlayMapTypes.Vc[0]?.setOpacity(newValue / 100)
    overlay?.setOpacity(newValue / 100)
  }

  let searchInputRef = useRef()
  let searchInputRefClosed = useRef()
  let mobileSidebarRef = useRef()
  let desktopSidebarRef = useRef()
  let resetIconRefOpen = useRef()
  let resetIconRefClosed = useRef()

  useEffect(() => {
    const handleResize = () => {
      setInnerWidth(window.innerWidth)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  useEffect(() => {
    let closeHandler = (e) => {
      if (
        sidebarIsOpen &&
        innerWidth < 1024 &&
        !isDateDialogOpen &&
        !isColorSelectorOpen
      ) {
        if (!desktopSidebarRef.current.contains(e.target)) {
          dispatch(toggleSidebar())
        }
      }
    }

    document.addEventListener('mousedown', closeHandler)

    return () => {
      document.removeEventListener('mousedown', closeHandler)
    }
  }, [
    sidebarIsOpen,
    innerWidth,
    dispatch,
    isDateDialogOpen,
    isColorSelectorOpen,
  ])

  useEffect(() => {
    if (innerWidth > 1024) {
      setIsScreenLg(true)
    } else {
      setIsScreenLg(false)
    }
  }, [innerWidth])

  useEffect(() => {
    setRoadSwitch(showRoads)
  }, [showRoads])

  useEffect(() => {
    // dispatch(setFloodPixelOpacity(floodPixelOpacity))
  }, [floodPixelOpacity])

  useEffect(() => {
    setFloodPixelOpacity(100)
  }, [overlay])

  return (
    <>
      <aside
        key="desktop-sidemenu"
        ref={desktopSidebarRef}
        // style={{ backgroundColor: 'rgb(25 120 200 / 0.2)' }}
        className={`${
          isScreenLg
            ? `hidden lg:block duration-500 border-r border-blue-600/20 bg-clip-padding backdrop-blur-md fixed left-0 top-12 h-full  ${
                sidebarIsOpen ? 'w-48' : 'w-10'
              }`
            : `lg:hidden fixed top-0 right-0 duration-1000 z-50 h-[100vh] text-white bg-black/60 ${
                sidebarIsOpen ? 'w-full sm:w-72 px-2 ' : 'w-0 '
              }  backdrop-blur-sm `
        }`}
      >
        <div className={`${isScreenLg ? 'sidebar-links-div ' : ''}`}>
          <div
            className={`${
              isScreenLg
                ? 'pr-2.5 pt-2 flex items-center justify-end'
                : 'w-full h-[50px] text-white flex items-center pl-2 text-xl '
            } `}
          >
            <span
              onClick={() => {
                dispatch(toggleSidebar())
                setSearchIsFocused(false)
              }}
            >
              {isScreenLg ? (
                <BsArrowBarLeft
                  className={` text-xl duration-500 cursor-pointer text-slate-500 hover:text-slate-300 ${
                    !sidebarIsOpen && 'rotate-180'
                  }`}
                />
              ) : (
                <HiX className="cursor-pointer" />
              )}
            </span>
          </div>

          <div
            className={` ${
              sidebarIsOpen ? 'px-1 mt-[18px]' : 'px-0 mt-4'
            } duration-200`}
          >
            <CSSTransition
              in={searchIsFocused}
              timeout={500}
              classNames="search-border"
              key="desktop"
            >
              <div
                id="searchinput"
                className={`flex items-center py-0.5 bg-slate-600/50 border-transparent transition-all duration-200 ${
                  isScreenLg ? `justify-between` : `overflow-hidden`
                } ${
                  sidebarIsOpen
                    ? 'px-1.5 border-[2px] rounded-md'
                    : 'pl-[9px] w-full rounded-sm'
                }`}
              >
                <div className="py-1 text-lg transition-colors duration-500 md:text-xl text-slate-400 hover:text-slate-200">
                  <HiSearch
                    className="hover:cursor-pointer"
                    onClick={() => {
                      // setIsSearchOpen((v) => !v)
                      if (!sidebarIsOpen) {
                        dispatch(toggleSidebar())
                        searchInputRef.current.focus()
                        setSearchIsFocused(true)
                      }
                    }}
                  />
                </div>
                <form className="flex items-center">
                  <input
                    ref={searchInputRef}
                    onFocus={() => {
                      setSearchIsFocused(true)
                    }}
                    onBlur={() => {
                      setSearchIsFocused(false)
                    }}
                    className={`text-xs text-slate-300 focus:outline-none bg-transparent border-l-2 border-slate-600 ${
                      isScreenLg ? `` : `w-52`
                    } ${
                      sidebarIsOpen
                        ? 'pl-1.5 ml-1 opacity-100'
                        : 'pl-1.5 ml-1 opacity-0'
                    } transition-opacity duration-500 `}
                    placeholder="Search for a District..."
                  />
                </form>
              </div>
            </CSSTransition>
          </div>

          <ul
            className={`${
              sidebarIsOpen ? 'px-1 pt-3' : 'px-0 pt-4'
            } duration-200`}
          >
            {menuLinks.map((item) => (
              <Link
                to={item.path}
                key={item.title}
              >
                <li
                  className={`text-slate-400 text-xs flex items-center gap-x-3 cursor-pointer   hover:bg-sky-900/50 mb-3 hover:text-slate-300 duration-200 py-2 overflow-hidden whitespace-nowrap ${
                    sidebarIsOpen
                      ? 'gap-x-3 px-2 rounded-md'
                      : 'gap-x-0 pl-[9px] rounded-sm'
                  } duration-200`}
                >
                  <span
                    className={`${
                      sidebarIsOpen ? 'text-lg' : 'text-xl'
                    } duration-200`}
                  >
                    {item.icon}
                  </span>
                  <span
                    className={`text-sm  ${
                      sidebarIsOpen ? '' : 'scale-0'
                    } duration-200`}
                  >
                    {item.title}
                  </span>
                </li>
              </Link>
            ))}
          </ul>

          <hr
            className={` mx-4 ${
              sidebarIsOpen ? '' : 'scale-0'
            }   bg-sky-800/50 h-[1px] border-none`}
          />
        </div>

        <div
          // className={`mt-5 ${sidebarIsOpen ? 'space-y-7' : 'space-y-4'} duration-200`}
          className={`pt-2 pb-4 flex flex-col justify-evenly ${
            sidebarIsOpen ? 'sidebar-tools-div' : 'space-y-4 h-96'
          } duration-200`}
        >
          <div
            className={` text-slate-500 px-3 font-bold text-xs whitespace-nowrap overflow-hidden ${
              sidebarIsOpen ? 'scale-x-100' : 'scale-x-0'
            } duration-200`}
          >
            Map & Data Options
          </div>

          <div
            className={`text-slate-400 text-[10px] font-bold flex items-center justify-between cursor-pointer ${
              sidebarIsOpen
                ? 'mt-2 pl-3 pr-1 rounded-md hover:hover:bg-sky-900/50 '
                : 'mt-6 px-0 ml-[1px]'
            } duration-200`}
            onClick={() => {
              if (sidebarIsOpen) {
                handleResetRequest()
              }
            }}
          >
            <div className="whitespace-nowrap ">
              <div
                className={`${
                  sidebarIsOpen
                    ? 'text-slate-400'
                    : 'text-transparent w-0 scale-0 h-0'
                } transition-all duration-200`}
              >
                RESET SELECTIONS
              </div>

              <div
                ref={resetIconRefClosed}
                onClick={() => {
                  if (!sidebarIsOpen) {
                    handleResetRequest()
                  }
                }}
                className={`${
                  sidebarIsOpen
                    ? 'text-transparent w-0 scale-0 h-0'
                    : 'text-slate-400 text-2xl hover:cursor-pointer hover:text-sky-500/60'
                } transition-all duration-200 text-4xl`}
              >
                <TiRefresh />
              </div>
            </div>
            <div
              ref={resetIconRefOpen}
              className={`${
                sidebarIsOpen
                  ? 'scale-100 pr-1 pb-0.5'
                  : 'scale-0 -translate-x-40'
              } duration-300 text-4xl text-[#1976d2]`}
            >
              <TiRefresh />
            </div>
          </div>

          <div
            className={` ${
              sidebarIsOpen ? 'mt-4 px-2 pb-0' : 'mt-6 px-0'
            } duration-200`}
            onClick={() => {
              if (!sidebarIsOpen) dispatch(toggleSidebar())
            }}
          >
            {/* {isScreenLg ? (
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Select Date"
                  disableFuture={true}
                  minDate={'2022/01/01'}
                  views={['day', 'month']}
                  // openTo="month"
                  showDaysOutsideCurrentMonth={true}
                  value={dateValue}
                  onChange={(newDateValue) => {
                    setDateValue(newDateValue)
                  }}
                  components={{
                    OpenPickerIcon: GoCalendar,
                  }}
                  PopperProps={{
                    sx: {
                      '& .MuiPaper-root': {
                        // maxHeight: '200px',
                        // marginLeft: '75px',
                        marginTop: '5px',
                        backgroundColor: 'rgb(25 120 200 / 0.2)',
                        boxShadow: '0px 0px 10px 3px rgba(34, 76, 143, 0.5)',
                        color: 'rgb(148 163 184)',
                        backdropFilter: 'blur(7px)',
                        overflow: 'hidden',
                        borderRadius: '12px',
                        border: '2px solid rgb(0 130 255 / 0.3)',
                      },
                      '& .MuiButtonBase-root': {
                        transition: 'color 0.2s',
                        color: 'rgb(148 163 184)',
                        ':hover': {
                          color: 'rgb(203 213 225)',
                        },
                        // '&.MuiPickersCalendarHeader-switchViewButton': {
                        //   color: 'red',
                        // },
                      },
                      '& .MuiDayPicker-header': {
                        '& .MuiTypography-root': {
                          color: 'rgb(148 163 184)',
                        },
                      },
                      '& .MuiDayPicker-monthContainer': {
                        backgroundColor: '',
                        '& .MuiButtonBase-root': {
                          backgroundColor: 'black',
                          color: 'rgb(148 163 184)',
                          ':hover': {
                            backgroundColor: 'rgb(33 33 33)',
                          },
                        },
                        '& .Mui-selected': {
                          backgroundColor: 'rgb(0 130 200)',
                          color: 'black',
                          fontWeight: '900',
                          ':hover': {
                            backgroundColor: 'rgb(0 130 255)',
                          },
                        },
                        '& .MuiPickersDay-dayOutsideMonth': {
                          color: 'rgb(71 85 105)',
                        },
                      },
                      '& .MuiMonthPicker-root': {
                        color: 'rgb(148 163 184)',
                        '& .Mui-selected': {
                          backgroundColor: 'rgb(25 118 210 / 0.7)',
                          color: 'black',
                          fontWeight: '900',
                        },
                      },
                      '& .MuiPickersArrowSwitcher-root': {
                        '& .Mui-disabled': {
                          color: 'rgb(71 85 105)',
                        },
                      },
                    },
                    hidden: innerWidth < 1024 ? true : false,
                  }}
                  InputProps={{
                    hidden: true,
                    sx: {
                      '&.MuiInputBase-root': {
                        padding: `${sidebarIsOpen ? '' : '0px'}`,
                        marginLeft: `${sidebarIsOpen ? '' : '-1px'}`,
                        transition: 'all 0.3s',
                        cursor: `${sidebarIsOpen ? 'text' : 'pointer'}`,
                      },
                      '& .MuiInputBase-input': {
                        width: `${sidebarIsOpen ? '100%' : '0'}`,
                        color: `${
                          sidebarIsOpen
                            ? 'rgb(148 163 184)'
                            : 'rgb(148 163 184 / 0)'
                        }`,
                        fontSize: '15px',
                        padding: `${sidebarIsOpen ? '8px 14px' : '0px'}`,
                        transition: 'all 0.3s',
                      },
                      '& .MuiButtonBase-root': {
                        transition: 'all ease-in 0.3s',
                        color: `${
                          sidebarIsOpen
                            ? 'rgb(148 163 184)'
                            : 'rgb(203 213 225)'
                        }`,
                        fontSize: `${sidebarIsOpen ? '19px' : '21px'}`,
                        padding: `${sidebarIsOpen ? '' : '0px'}`,
                        marginRight: `${sidebarIsOpen ? '0px' : '0px'}`,
                        ':hover': {
                          color: 'rgb(2 132 199 / 0.8)',
                        },
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        width: `${sidebarIsOpen ? '100%' : '0'}`,
                        border: `${
                          sidebarIsOpen
                            ? '2px solid rgb(148 163 184 / 0.3)'
                            : '0px'
                        }`,
                        transition: 'all ease-in 0.3s',
                        borderRadius: '12px',
                      },
                      '& .MuiOutlinedInput-notchedOutline:hover': {},
                      '&.MuiOutlinedInput-root:hover': {
                        '&:hover fieldset': {
                          borderColor: `${
                            sidebarIsOpen ? 'rgb(2 132 199 / 0.5)' : ''
                          }`,
                        },
                      },
                    },
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      sx={{
                        '&.MuiFormControl-root': {},
                        '& .MuiInputLabel-root': {
                          width: `${sidebarIsOpen ? '100%' : '0px'}`,
                          display: `${sidebarIsOpen ? 'block' : 'none'}`,
                          color: 'rgb(100 116 139)',
                          fontSize: '13px',
                          fontWeight: '1000',
                          transition: 'all 0.3s',
                          left: '8px',
                          top: '-2px',
                          '&.Mui-focused': {
                            color: '#1976d2',
                            fontSize: '13px',
                            fontWeight: '1000',

                            left: '9px',
                            top: '-2px',
                            backgroundColor: 'transparent',
                          },
                          marginTop: '3.75px',
                        },
                        '& .MuiFormLabel-root': {},
                      }}
                    />
                  )}
                />
              </LocalizationProvider>
            ) : (
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <MobileDatePicker
                  onOpen={() => setIsDateDialogOpen(true)}
                  onClose={() => setIsDateDialogOpen(false)}
                  label="Select Date"
                  disableFuture={true}
                  minDate={'2022/01/01'}
                  views={['day', 'month']}
                  showDaysOutsideCurrentMonth={true}
                  value={dateValue}
                  onChange={(newDateValue) => {
                    setDateValue(newDateValue)
                  }}
                  components={{
                    OpenPickerIcon: GoCalendar,
                  }}
                  className=" w-full"
                  DialogProps={{
                    sx: {
                      '& .MuiDialogContent-root': {
                        overflowX: 'hidden',
                      },
                      '& .MuiPaper-root': {
                        // maxHeight: '200px',
                        // marginLeft: '75px',
                        // marginTop: '5px',

                        backgroundColor: 'rgb(25 120 200 / 0.2)',
                        boxShadow: '0px 0px 10px 3px rgba(34, 76, 143, 0.5)',
                        color: 'rgb(148 163 184)',
                        backdropFilter: 'blur(7px)',
                        overflow: 'hidden',
                        borderRadius: '12px',
                        border: '2px solid rgb(0 130 255 / 0.3)',

                        '& .MuiTypography-root': {
                          color: 'inherit',
                        },
                      },
                      '& .MuiButtonBase-root': {
                        transition: 'color 0.2s',
                        color: 'rgb(148 163 184)',
                        ':hover': {
                          color: 'rgb(203 213 225)',
                        },
                        // '&.MuiPickersCalendarHeader-switchViewButton': {
                        //   color: 'red',
                        // },
                      },
                      '& .MuiDayPicker-header': {
                        '& .MuiTypography-root': {
                          color: 'rgb(148 163 184)',
                        },
                      },
                      '& .MuiDayPicker-monthContainer': {
                        backgroundColor: '',
                        '& .MuiButtonBase-root': {
                          backgroundColor: 'black',
                          color: 'rgb(148 163 184)',
                          ':hover': {
                            backgroundColor: 'rgb(33 33 33)',
                          },
                        },
                        '& .Mui-selected': {
                          backgroundColor: 'rgb(0 130 200)',
                          color: 'black',
                          fontWeight: '900',
                          ':hover': {
                            backgroundColor: 'rgb(0 130 255)',
                          },
                        },
                        '& .MuiPickersDay-dayOutsideMonth': {
                          color: 'rgb(81 95 115)',
                        },
                      },
                      '& .MuiMonthPicker-root': {
                        color: 'rgb(148 163 184)',
                        '& .Mui-selected': {
                          backgroundColor: 'rgb(25 118 210 / 0.7)',
                          color: 'black',
                          fontWeight: '900',
                        },
                      },
                      '& .MuiPickersArrowSwitcher-root': {
                        '& .Mui-disabled': {
                          color: 'rgb(71 85 105)',
                        },
                      },
                    },
                    // hidden: true,
                  }}
                  InputProps={{
                    hidden: true,
                    sx: {
                      '&.MuiInputBase-root': {
                        padding: `${sidebarIsOpen ? '' : '0px'}`,
                        marginLeft: `${sidebarIsOpen ? '' : '-1px'}`,
                        transition: 'all 0.3s',
                        cursor: `${sidebarIsOpen ? 'text' : 'pointer'}`,
                      },
                      '& .MuiInputBase-input': {
                        width: `${sidebarIsOpen ? '100%' : '0'}`,
                        color: `${
                          sidebarIsOpen
                            ? 'rgb(148 163 184)'
                            : 'rgb(203 213 225)'
                        }`,
                        padding: `${sidebarIsOpen ? '8px 14px' : '0px'}`,
                        transition: 'all 0.3s',
                      },
                      '& .MuiButtonBase-root': {
                        transition: 'all ease-in 0.3s',
                        color: `${
                          sidebarIsOpen
                            ? 'rgb(148 163 184)'
                            : 'rgb(203 213 225)'
                        }`,
                        fontSize: `${sidebarIsOpen ? '19px' : '21px'}`,
                        padding: `${sidebarIsOpen ? '' : '0px'}`,
                        marginRight: `${sidebarIsOpen ? '0px' : '0px'}`,
                        ':hover': {
                          color: 'rgb(2 132 199 / 0.8)',
                        },
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        width: `${sidebarIsOpen ? '100%' : '0'}`,
                        border: `${
                          sidebarIsOpen
                            ? '2px solid rgb(148 163 184 / 0.3)'
                            : '0px'
                        }`,
                        transition: 'all ease-in 0.3s',
                        borderRadius: '12px',
                      },
                      '& .MuiOutlinedInput-notchedOutline:hover': {},
                      '&.MuiOutlinedInput-root:hover': {
                        '&:hover fieldset': {
                          borderColor: `${
                            sidebarIsOpen ? 'rgb(2 132 199 / 0.5)' : ''
                          }`,
                        },
                      },
                    },
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      sx={{
                        '&.MuiFormControl-root': {},
                        '& .MuiInputLabel-root': {
                          // width: `${sidebarIsOpen ? '100%' : '0px'}`,
                          minWidth: '100%',
                          display: `${sidebarIsOpen ? 'block' : 'none'}`,
                          color: 'rgb(148 163 184)',
                          fontSize: '11px',
                          transition: 'all 0.3s',
                          left: '9px',
                          top: '-1px',
                          '&.Mui-focused': {
                            color: '#1976d2',
                            fontSize: '12px',
                            fontWeight: '600',
                            left: '9px',
                            top: '-1px',
                            backgroundColor: 'transparent',
                          },
                          marginTop: '3.75px',
                        },
                        '& .MuiFormLabel-root': {},
                      }}
                    />
                  )}
                />
              </LocalizationProvider>
            )} */}

            <DateSelector
              isScreenLg={isScreenLg}
              sidebarIsOpen={sidebarIsOpen}
              innerWidth={innerWidth}
              handleDateDialogState={handleDateDialogState}
            />
          </div>

          <div
            className={` text-slate-400 text-[10px] font-bold flex items-center justify-between ${
              sidebarIsOpen ? 'mt-7 pl-3 pr-1' : 'mt-6 px-2 ml-[1px]'
            } duration-200`}
          >
            <div className="whitespace-nowrap ">
              <div
                className={`${
                  sidebarIsOpen
                    ? 'text-slate-400'
                    : 'text-transparent w-0 scale-0 h-0'
                } transition-all duration-200`}
              >
                MAP THEME
              </div>
              <div
                onClick={() => {
                  if (!sidebarIsOpen) dispatch(toggleSidebar())
                }}
                className={`${
                  sidebarIsOpen
                    ? 'text-transparent w-0 scale-0 h-0'
                    : 'text-slate-400 text-xl hover:cursor-pointer hover:text-sky-500/60'
                } transition-all duration-200`}
              >
                <RiMap2Fill />
              </div>
            </div>
            <div
              className={`${
                sidebarIsOpen ? 'scale-100' : 'scale-0 -translate-x-40'
              } duration-300`}
            >
              <ToggleButtonGroup
                color="primary"
                value={mapTheme}
                exclusive
                // onChange={handleMapThemeChange}
                onChange={(e, newTheme) => {
                  if (newTheme !== null) {
                    // setMapTheme(newTheme)
                    console.log(newTheme)
                    dispatch(setMapTheme(newTheme))
                  }
                }}
                aria-label="Platform"
                sx={{
                  '&.MuiToggleButtonGroup-root': {
                    '& .MuiButtonBase-root': {
                      color: 'rgb(148 163 184)',
                      fontSize: '10px',
                      padding: '5px',
                      borderColor: 'transparent',
                      fontWeight: '500',
                      backgroundColor: 'rgb(33 33 33)',
                      ':hover': {
                        backgroundColor: 'rgb(20 20 20)',
                        color: 'rgb(168 183 204)',
                      },
                      '&.Mui-selected': {
                        color: '#1976d2',
                        backgroundColor: '#225ad355',
                      },
                    },
                  },
                }}
              >
                <ToggleButton
                  value="dark"
                  disableRipple
                >
                  Dark
                </ToggleButton>
                <ToggleButton
                  value="light"
                  disableRipple
                >
                  Light
                </ToggleButton>
              </ToggleButtonGroup>
            </div>
          </div>

          <div
            className={` text-slate-400 text-[10px] font-bold flex items-center justify-between ${
              sidebarIsOpen ? 'mt-5 pl-3 pr-1' : 'mt-5 px-1.5'
            } duration-200`}
          >
            <div className="whitespace-nowrap">
              <div
                className={`${
                  sidebarIsOpen
                    ? 'text-slate-400'
                    : 'text-transparent w-0 scale-0 h-0'
                } transition-all duration-200`}
              >
                ROADS AFFECTED
              </div>
              <div
                className={`${
                  sidebarIsOpen
                    ? 'text-transparent w-0 scale-0 h-0'
                    : 'text-slate-400 text-2xl hover:cursor-pointer hover:text-sky-500/60'
                } transition-all duration-200`}
                onClick={() => {
                  dispatch(toggleShowRoads())
                  dispatch(toggleSidebar())
                }}
              >
                <TbMapPins />
              </div>
            </div>

            <div
              className={`${
                sidebarIsOpen ? 'scale-100' : 'scale-0 -translate-x-40'
              } duration-300 `}
            >
              <Switch
                onChange={() => dispatch(toggleShowRoads())}
                value={roadSwitch}
                checked={roadSwitch}
                disableRipple
                sx={{
                  '&.MuiSwitch-root': {
                    // width: '100px',
                  },
                  '& .MuiSwitch-track': {
                    transition: 'all 0.1s',
                    backgroundColor: sidebarIsOpen
                      ? 'rgb(55 65 81)'
                      : 'rgb(55 65 81 / 0)',
                    opacity: '1',
                  },
                  '& .MuiButtonBase-root': {
                    '&.Mui-checked': {
                      transition: 'all 0.1s',
                      color: sidebarIsOpen ? '#1976d2' : '#1976d200',
                    },
                    transition: 'all 0.1s',
                    color: sidebarIsOpen
                      ? 'rgb(107 114 128)'
                      : 'rgb(107 114 128 / 0)',
                  },

                  // '& .Mui-disabled': {
                  //   '& .MuiSwitch-track': {
                  //     backgroundColor: 'red',
                  //     opacity: '1',
                  //   },
                  // },
                }}
              />
            </div>
          </div>

          <div
            className={` text-slate-400 text-[10px] font-bold flex items-center justify-between ${
              sidebarIsOpen ? 'mt-4 pl-3 pr-1' : 'mt-4 px-1.5'
            } duration-200 `}
          >
            <div className="whitespace-nowrap ">
              <div
                className={`${
                  sidebarIsOpen
                    ? 'text-slate-400'
                    : 'text-transparent w-0 scale-0 h-0'
                } transition-all duration-200`}
              >
                FLOOD PIXELS
              </div>
              <div
                className={`${
                  sidebarIsOpen
                    ? 'text-transparent w-0 scale-0 h-0'
                    : 'text-slate-400 text-2xl hover:cursor-pointer hover:text-sky-500/60'
                } transition-all duration-200`}
                onClick={() => {
                  // setPixelsSwitch((v) => !v)
                  dispatch(toggleSidebar())
                }}
              >
                <IoWater />
              </div>
            </div>
            <div
              className={`${
                sidebarIsOpen ? 'scale-100' : 'scale-0 -translate-x-40'
              } duration-300 `}
            >
              <Switch
                // onChange={() => setPixelsSwitch((v) => !v)}
                onChange={() => dispatch(toggleOverlayDisplay())}
                // value={pixelsSwitch}
                // checked={pixelsSwitch}
                value={showOverlay}
                checked={showOverlay}
                disableRipple
                sx={{
                  '&.MuiSwitch-root': {
                    // width: '100px',
                  },
                  '& .MuiSwitch-track': {
                    transition: 'all 0.1s',
                    backgroundColor: sidebarIsOpen
                      ? 'rgb(55 65 81)'
                      : 'rgb(55 65 81 / 0)',
                    opacity: '1',
                  },
                  '& .MuiButtonBase-root': {
                    '&.Mui-checked': {
                      transition: 'all 0.1s',
                      color: sidebarIsOpen ? '#1976d2' : '#1976d200',
                    },
                    transition: 'all 0.1s',
                    color: sidebarIsOpen
                      ? 'rgb(107 114 128)'
                      : 'rgb(107 114 128 / 0)',
                  },

                  // '& .Mui-disabled': {
                  //   '& .MuiSwitch-track': {
                  //     backgroundColor: 'red',
                  //     opacity: '1',
                  //   },
                  // },
                }}
              />
            </div>
          </div>

          <div
            className={` text-slate-400 text-[10px] font-bold flex items-center justify-between ${
              sidebarIsOpen ? 'mt-3 pl-3 pr-1' : 'mt-4 px-1.5'
            } duration-200 `}
          >
            <div className="whitespace-nowrap ">
              <div
                className={`${
                  sidebarIsOpen
                    ? 'text-slate-400'
                    : 'text-transparent w-0 scale-0 h-0'
                } transition-all duration-200`}
              >
                FLOOD PIXELS OPACITY
              </div>
              <div
                className={`${
                  sidebarIsOpen
                    ? 'text-transparent w-0 scale-0 h-0'
                    : 'text-slate-400 text-2xl hover:cursor-pointer hover:text-sky-500/60'
                } transition-all duration-200`}
                onClick={() => {
                  dispatch(toggleSidebar())
                }}
              >
                <RiPaletteFill />
              </div>
            </div>
            <div
              className={`${
                sidebarIsOpen ? 'scale-100' : 'scale-0 -translate-x-40'
              } duration-300 `}
            >
              <Box
                width={50}
                className="pl-1 pr-4 pt-1 "
              >
                <Slider
                  disabled={overlay && showOverlay ? false : true}
                  value={floodPixelOpacity}
                  // onChange={(e) => {
                  //   console.log(e)
                  //   setFloodPixelOpacity(e.target.value)
                  // }}
                  onChange={handleFloodPixelOpacityChange}
                  // onChange={(e, newValue) => {}}
                  size="small"
                  defaultValue={floodPixelOpacity}
                  // aria-label="Small"
                  // valueLabelDisplay="auto"
                  className="text-red-500"
                  sx={{
                    '& .MuiSlider-thumb': {
                      boxShadow: 'none !important',
                    },
                    '&.Mui-disabled': {
                      color: 'rgb(107 114 128)',
                    },
                  }}
                />
              </Box>
              {/* <FormControl
                variant="standard"
                sx={{
                  width: '50px',
                  transform: 'translateY(0px)',
                  marginRight: '8px',
                  '& .MuiInputBase-root': {
                    ':hover': {
                      ':before': {
                        borderColor: 'rgb(27 109 153)',
                        // border: '0px',
                      },
                    },
                    ':before': {
                      borderColor: 'rgb(7 89 133)',
                      // border: '0px',
                    },
                    ':after': {
                      // border: '0px',
                    },
                  },
                  '& .MuiSvgIcon-root': {
                    color: 'rgb(7 89 133)',
                    fontSize: '20px',
                  },
                  '& .MuiSelect-select': {
                    fontSize: '12px',
                    overflow: 'visible',
                    padding: '0',
                    color: 'rgb(148 163 184)',
                    textOverflow: 'initial',
                  },
                  '& .MuiInput-input': {
                    overflow: 'visible',
                  },
                }}
              >
                <Select
                  labelId="demo-simple-select-standard-label"
                  id="demo-simple-select-standard"
                  value={floodColor}
                  onChange={handleColorChange}
                  onOpen={() => setIsColorSelectorOpen(true)}
                  onClose={() => setIsColorSelectorOpen(false)}
                  inputProps={{ 'aria-label': 'Without label' }}
                  MenuProps={{
                    sx: {
                      '& .MuiPaper-root': {
                        marginTop: '5px',
                        backgroundColor: 'rgb(25 120 200 / 0.2)',
                        boxShadow: '0px 0px 10px 3px rgba(34, 76, 143, 0.5)',
                        color: 'rgb(148 163 184)',
                        backdropFilter: 'blur(7px)',
                        overflow: 'hidden',
                        borderRadius: '12px',
                        border: '2px solid rgb(0 130 255 / 0.3)',
                        // paddingX: '30px',
                      },
                    },
                  }}
                >
                  <MenuItem value={'red'}>Red</MenuItem>
                  <MenuItem value={'blue'}>Blue</MenuItem>
                </Select>
              </FormControl> */}
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar

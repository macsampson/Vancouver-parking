import React, { useState, useEffect, useRef } from 'react'
import Box from '@mui/material/Box'
import MeterInfo from './MeterInfo'
import fetchParkingMeters from '../utils/FetchParkingMeters'
import getDirections from '../utils/GetDirections'

export default function Sidebar(props) {
  //   const [meterType, setMeterType] = useState('Any')
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [markers, setMarkers] = useState({})
  const [rawMeterInfo, setRawMeterInfo] = useState({})
  const [currentMeterId, setCurrentMeterId] = useState(null)
  const [currentMeters, setCurrentMeters] = useState(null)
  // const [isLoading, setIsLoading] = useState(true)
  // reference to meter info to scroll to
  const meterInfoRef = useRef(null)

  // function to handle meter click
  const handleMeterClick = (meter) => {
    // console.log("meter clicked", meter);
    props.clickedMeter(meter[0])
    setCurrentMeterId(meter[0])
  }

  useEffect(() => {
    if (rawMeterInfo) {
      // console.log(rawMeterInfo)
      const newMarkers = {}
      const newMeters = []
      for (const key in rawMeterInfo) {
        const meter = rawMeterInfo[key]
        console.log(meter.count)
        newMarkers[meter.meterid] = {
          lng: meter.location.lng,
          lat: meter.location.lat,
        }

        newMeters.push(
          <MeterInfo
            meter={meter}
            expanded={
              // check if meter.id exists in currentmeterid array
              currentMeterId && currentMeterId === meter.meterid
            }
            key={meter.meterid}
            meterClicked={handleMeterClick}
          />
        )
      }
      setMarkers(newMarkers)
      setCurrentMeters(newMeters)
    }
  }, [rawMeterInfo])

  // use effect to set selected place from props
  useEffect(() => {
    setSelectedPlace(props.selectedPlace)
  }, [props.selectedPlace])

  useEffect(() => {
    if (markers) {
      //   console.log('markers leaving sidebar', markers)
      props.onMarkersChange(markers)
    }
  }, [markers])

  // call the fetchParkingMeters function when place prop changes
  useEffect(() => {
    // console.log('selected place changed', selectedPlace)
    if (selectedPlace) {
      const fetchMeterInfo = async () => {
        setRawMeterInfo(null)
        try {
          const meterData = await fetchParkingMeters(selectedPlace)
          // console.log(data[0])
          const durations = await getDirections(meterData, selectedPlace)

          // iterate through meter data and add duration to each meter
          const dataWithDirections = {}
          for (const key in meterData) {
            const meter = meterData[key]
            meter.duration =
              durations[meter.location.lng + ',' + meter.location.lat].duration
            dataWithDirections[meter.location.lng + ',' + meter.location.lat] =
              meter
          }

          setRawMeterInfo(dataWithDirections)
          //   console.log(rawMeterInfo.data)
        } catch (error) {
          console.error(error)
        } finally {
          // setIsLoading(false)
          console.log('finally returned')
        }
      }
      fetchMeterInfo()
    }
  }, [selectedPlace])

  // call findmeterinfo when marker is clicked
  useEffect(() => {
    // console.log('clicked')
    if (props.clickedMarker) {
      //   console.log('clicked', props.clickedMarker)
      setCurrentMeterId(props.clickedMarker.key)
      // expandMeterInfo(props.clickedMarker.key)
    }
  }, [props.clickedMarker])

  // useffect to update currentmeters when rawmeterinfo changes
  useEffect(() => {
    // console.log(rawMeterInfo);

    if (currentMeterId) {
      //   console.log('current meter id', currentMeterId)
      meterInfoRef.current = document.getElementById(currentMeterId)
      setTimeout(() => {
        meterInfoRef.current.scrollIntoView({ behavior: 'smooth' })
      }, 50)
    }
  }, [currentMeterId])

  // useffect to scroll to meter when meterinfo ref changes
  // useEffect(() => {
  // 	if (meterInfoRef.current) {
  // 		setTimeout(() => {
  // 			meterInfoRef.current.scrollIntoView({ behavior: 'smooth' })
  // 		}, 50)
  // 		// expand the meter info when it is scrolled to
  // 		console.log(meterInfoRef.current)
  // 	}
  // }, [meterInfoRef.current])

  const styles = {
    container: {
      height: '100vh',
      flex: '0 0 auto',
      minWidth: '400px',
      maxWidth: '400px',
      background: '#e6e6e6',
    },
    search: {
      // flex: '0 0 auto',
      padding: '10px',
      zIndex: 1,
      position: 'absolute',
      right: '0px',
      width: '25%',
      // width: '100%',
    },
  }

  return (
    <div className='sidebar-container' style={styles.container}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          //   paddingBottom: "10px",
        }}
      >
        <Box
          style={{
            flex: '0 0 100%',
            overflow: 'scroll',
            padding: '10px',
          }}
        >
          {currentMeters}
        </Box>
      </div>
    </div>
  )
}

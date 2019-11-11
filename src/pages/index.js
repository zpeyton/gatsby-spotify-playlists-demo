import React, { Component } from "react"
import axios from "axios"
import { Row, Col } from "react-bootstrap"
import Header from "../components/header"
import SEO from "../components/seo"
import "../components/layout.scss"

class SpotifyDemo extends Component {
  
  constructor(props){
    super(props)
    this.setAccessToken()
  }

  apiRoot = 'https://api.spotify.com/v1'

  state = {
    loggedIn: false,
    loading: false,
    error: false,
    activeIndex: 0,
    tracks: [],
    playlists: { items: []}
  }

  setAccessToken () {
    //alert(window.location.href)
    
    if(typeof window == 'undefined'){
      return
    }

    let localAccesstoken = window.localStorage.getItem('spotifyAccessToken')
    
    if(localAccesstoken){
      this.loggedIn = true
      return this.accessToken = localAccesstoken
    }

    var urlParts = window.location.href.split('#')
    
    if(urlParts.length === 2){
      
      var hash = urlParts[1]
      var queryParts = hash.split('&')
      
      queryParts.map(paramPair => {
        
        let paramPairParts = paramPair.split('=')
        
        if(paramPairParts[0] === 'access_token'){
          this.accessToken = paramPairParts[1] 
          window.localStorage.setItem('spotifyAccessToken',this.accessToken)
          this.loggedIn = true
        }

        return true
      })

      window.location.href = urlParts[0] +'#'
    }
  }
  
  loadTracks(playlistId) {
    
    // we should check cache here for faster loads

    const tracksUrl = [
      this.apiRoot,
      'playlists',
      playlistId,
      'tracks'
    ].join('/')

    //console.log(tracksUrl)

    let config = {
      headers: {
        'Authorization': 'Bearer ' + this.accessToken
      }
    }

    axios.get(tracksUrl,config).then(tracksJSON => {
      
      this.trackIds = []
      
      this.unmergedTrackInfo = {}

      tracksJSON.data.items.map(item => {
        this.trackIds.push(item.track.id)
        this.unmergedTrackInfo[item.track.id] = {
          id: item.track.id,
          name: item.track.name, // album etc
          artist: item.track.artists[0].name,
          album: item.track.album.name,
          length: item.track.duration_ms
        }
        return true
      })

      // call audio features endpoint with track IDs

      let audioFeaturesUrl = [
        this.apiRoot,
        'audio-features'
      ].join('/')

      audioFeaturesUrl += '?ids='+this.trackIds.join(',')

      if(!this.trackIds.length){
        return this.setState({
          tracks: []
        })
      }
      axios.get(audioFeaturesUrl, config).then(audioDetailsJSON => {

        this.mergeAudioFeatures(this.unmergedTrackInfo,audioDetailsJSON)
      })
    })
  }

  mergeAudioFeatures(trackInfo,audioDetails){

    // add audio fields to core info
    audioDetails.data.audio_features.map(item => {
        trackInfo[item.id].key = item.key
        trackInfo[item.id].minmaj = item.mode
        trackInfo[item.id].bpm = Math.round(item.tempo)
        trackInfo[item.id].energy = (item.energy * 10).toFixed(1)
        trackInfo[item.id].danceability = (item.danceability * 10).toFixed(1)
        trackInfo[item.id].positivity = Math.round(item.valence * 10)
        trackInfo[item.id].instrumentalness = item.instrumentalness
        return true
      }
    )
    
    // reformat track info object as array
    var tracks = []

    for(let i in trackInfo){
      tracks.push(trackInfo[i])
    }
    
    // and finally setState with state.tracks having all info

    this.setState({
      tracks: tracks
    })
    return true
  }

  auth () {
    
    if(typeof window == 'undefined'){
      return
    }
    let url = [
      'https://accounts.spotify.com/en/authorize?response_type=token&redirect_uri=',
      window.location.href.replace(/#.*/,''), // dynamic for dev / prod
      '&client_id=7463ab731c454ab4a428559038135f23&scope=user-read-email%20playlist-read-private'
    ].join('')
    window.location.href = url
  }

  changePlaylist(event) {
    
    let playlists = this.state.playlists
    let activeIndex = event.target.getAttribute('data-key-id')
    console.log("changePlaylist " + activeIndex)

    // turn off the one that is on
    playlists.items[this.state.activeIndex].active = 0
    // turn on the one that was just clicked
    playlists.items[activeIndex].active = 1

    this.setState({
      activeIndex,
      playlists
    })

    this.activePlaylistId = playlists.items[activeIndex].id

    // loadTracks will also setState after fetching track data
    this.loadTracks(this.activePlaylistId)
    
  }

  numericKeyToAlpha(key, mode) {
    
    let alphas = [ "C","Db","D",'Eb','E','F','F#','G','Ab','A',"Bb","B"]
    let modalities = ["m", ""]
    let alphaKey = ''

    if(key < 0){
      return "No Key"
    }
    
    if(mode < 0){
      return "No Key"
    }
    
    alphaKey = alphas[key] + modalities[mode];

    return alphaKey;
  }
  
  alphaKeyToCamelot(key, mode) {
    let alphas = [ "C","Db","D",'Eb','E','F','F#','G','Ab','A',"Bb","B"]
    let modalities = ["m", ""]
    let alphaKeys = ["Abm","Ebm","Bbm","Fm","Cm","Gm","Dm","Am","Em","Bm","F#m","Dbm","B","Gbm","Db","Ab","Eb","Bb","F","C","G","D","A","E"]
    let camelots = ["1A","2A","3A","4A","5A","6A","7A","8A","9A","10A","11A","12A","1B","2B","3B","4B","5B","6B","7B","8B","9B","10B","11B","12B"]
    
    let alphaKey = alphas[key] + modalities[mode]
    var index = alphaKeys.indexOf(alphaKey)
    
    if (index < 0){
      return "No Key"
    }

    return camelots[index];    
  }
  
  msToMinutes(length) {
    var minutes, seconds;
    seconds = Math.ceil(length / 1000);
    minutes = Math.floor(seconds / 60) % 60;
    seconds = seconds % 60;
    seconds = (seconds < 10) ? "0" + seconds : seconds;
    
    return minutes + ":" + seconds;
}

instrumentalnessToVocals(instrumentalness) {
    
  return instrumentalness > 0.5 ? "No" : "Yes";
}

  componentDidMount() {
    
    const playlistsUrl = [
      this.apiRoot,
      'me',
      'playlists',
    ].join('/')

    let config = {
      headers: {
        'Authorization': 'Bearer ' + this.accessToken
      }
    }

    if(!this.loggedIn){
      return false
    }

    axios.get(playlistsUrl,config).then(playlistsJSON => {
      playlistsJSON.data.items[0].active = 1
      this.setState({
        playlists: playlistsJSON.data
      })
      this.loadTracks(playlistsJSON.data.items[0].id)
    }).catch(error => {
      //console.log(error.response)
      let response = error.response.data
      if(response.error.message === 'Invalid access token' ||
      response.error.message === 'The access token expired'
      ){
        console.log('Invalid access token')
        if(typeof window == 'undefined'){
          return
        }
        window.localStorage.removeItem('spotifyAccessToken')
        window.location.href = '/spotify-playlists'
      }
    })

  }

  alternateRowClass(index){
    return index % 2 ? "even" : "odd"
  }

  render () {
    
    let playlists = this.state.playlists.items.map((item,index) =>
      <tr><td onClick={this.changePlaylist.bind(this)} className={item.active ? "playlist bg-success" : "playlist"} key={item.id} data-key-id={index}>{item.name}</td></tr>
    )
    
    let tracks = this.state.tracks.map((item,index) => {
      return (
        <tr key={index}> 
          <td>{item.name}</td>
          <td>{item.artist}</td>
          <td className="text-right">{this.msToMinutes(item.length)}</td>
          <td className="text-nowrap text-right">{item.bpm} BPM</td>
          <td className="text-center">{this.numericKeyToAlpha(item.key, item.minmaj)}</td> 
          <td className="text-center">{this.alphaKeyToCamelot(item.key, item.minmaj)}</td> 
          <td className="text-center">{item.energy}</td>
          <td className="text-center">{item.danceability}</td>
          <td className="text-center">{item.positivity}</td>
          <td className="text-center">{this.instrumentalnessToVocals(item.instrumentalness)}</td>
        </tr>
      )
    })

    return (
      <>
      <SEO title="DJ Playlist Preview" description="Analyze tracks from your Spotify playlists. Get BPM, Key, Energy, and more." />
      <Header></Header>
      <div className="container-fluid">
      {this.loggedIn ? (
      <>
        <h5 className="mt-3 mb-4">Select from your Spotify playlists to view detailed track information</h5>
        <Row>
          <Col sm={3}>
          <div id="playlists" className="table-responsive">
          <table className="table table-dark table-hover table-borderless">
          <thead>
          <tr>
            <th>Playlists</th>
          </tr>
          </thead>
          <tbody>
            { playlists }
          </tbody>
          </table>
          </div>
          </Col>
          <Col sm={9}>
          <div id="tracks" className="table-responsive">
            <table className="table table-dark table-striped">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Artist</th>
                  <th className="text-right">Length</th>
                  <th className="text-right">BPM</th>
                  <th colspan="2" className="text-center">Key</th>
                  <th className="text-center">Energy</th>
                  <th className="text-center">Danceability</th>
                  <th className="text-center">Positivity</th>
                  <th className="text-nowrap text-center">Vocal-heavy</th>
                </tr>
              </thead>
              <tbody>
                { tracks }
              </tbody>
            </table>
          </div>
          </Col>
        </Row>
        
        
      </>
      ) : (
      <>

        <p className="login mt-4">View additional information about your tracks in Spotify, including <strong>BPM</strong>, <strong>Key</strong>, <strong>Energy</strong>, and  <strong>Danceability</strong>.</p>
        <button onClick={this.auth} type="button" className="btn btn-success btn-lg mt-3">Login to Spotify</button>
      </>
      )}
  <footer>
  Created by <a href="https://github.com/zpeyton/">Zach Peyton</a> and <a href="https://twitter.com/leonbarnard">Leon Barnard</a>
  </footer>
      </div>
      </>
    )
  }
}

export default SpotifyDemo
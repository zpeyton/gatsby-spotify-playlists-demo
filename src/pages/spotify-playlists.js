import React, { Component } from "react"
import axios from "axios"
import Header from "../components/header"
import "../components/layout.css"

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
          name: item.track.name // album etc
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

  numericKeyToAlpha(key) {
    
    let alphas = [ "C","C#/Db","D","E",'E#/Fb','F','F#/Gb','G','G#/Ab','A',"A#/Bb","B"]

    if(key < 0){
      return "No Key"
    }
    
    return alphas[key]
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
      <div onClick={this.changePlaylist.bind(this)} className={item.active ? "playlist active" : "playlist"} key={item.id} data-key-id={index}>{item.name}</div>
    )

    let tracks = this.state.tracks.map((item,index) => {
      return (
        <tr className={ this.alternateRowClass(index) } key={index}> 
          <td>{item.name}</td>
          <td>{this.numericKeyToAlpha(item.key)}</td> 
        </tr>
      )
    })

    return (
      <>
      <Header></Header>
      <div className="container">
      {this.loggedIn ? (
      <>
        <h1>Welcome</h1>
        <div className="clear"></div>
        <div id="playlists">
          <h3>Playlists</h3>
          { playlists }
        </div>
        <div id="tracks">
          <table className="tracks">
            <thead>
              <tr>
                <th>Name</th>
                <th>Key</th>
              </tr>
            </thead>
            <tbody>
              { tracks }
            </tbody>
          </table>
        </div>
      </>
      ) : (
      <>
        <h1>Login</h1>
        <p>Please log into your Spotify account to access your playlists.</p>
        <button onClick={this.auth}>Login to spotify</button>
      </>
      )}
        
      </div>
      </>
    )
  }
}

export default SpotifyDemo
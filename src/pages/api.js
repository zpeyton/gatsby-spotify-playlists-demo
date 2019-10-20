import React, { Component } from "react"
import Helmet from "react-helmet"
import axios from "axios"

class Policies extends Component {

  state = {
    error: false,
    policies: [],
    vehicles: [],
    accountId: false
  }

  componentDidMount() {

    const component = this
    const trellisClientId = 'CHALLENGE'

    // links handleTrellisSuccess to the policies component
    const handleTrellisSuccess = (accountId) => {
      component.loadApiData(accountId);
    }
    
    // TrellisConnect object needs to load from their cdn
    setTimeout( () => {
      component.trellisHandler = window.TrellisConnect.configure({
        client_id: trellisClientId,
        onSuccess: handleTrellisSuccess,
        onFailure: () => {},
        onClose: () => {},
        track: () => {},
        page: () => {},
        webhook: 'https://api.myserver.com/trellisUpdate',
        features: 'nostickystate'
      });
      
      document.getElementById('openTrellisButton').onclick = () => {
          component.trellisHandler.open();
      }
    },2000)
  }

  render() {

    const policies = this.state.policies

    let vehicles = []
    for(let i in policies){
      for (let j in policies[i].vehicles){
        vehicles.push(policies[i].vehicles[j])
      } 
    }

    return (
      <div className="container">
        <h2>Look up Vin</h2>
        <div>
          {this.state.policies.length === 0 ? (
            <button className="btn btn-primary" id="openTrellisButton">Look up Vin</button>
          ) : vehicles ? (
            <>
              <h2>{`${vehicles.length} Vehicles Found`}</h2>
              { vehicles.map( (vehicle, index) => (
                <ul key={index}>
                  <li>{vehicle.make}</li>
                  <li>{vehicle.model}</li>
                  <li>{vehicle.year}</li>
                  <li>{vehicle.vin}</li>
                </ul>
              )) }
            </>
          ) : (
              <p>Error fetching data: {this.state.error}</p>
          )}
        </div>
        <Helmet>
          <script src="https://cdn.trellisconnect.com/sdk/v1.1/trellis-connect.js"></script>
          <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"></link>
        </Helmet>
      </div>
    )
  }

  loadApiData = async (accountId) => {
    let url = [
      'http://localhost:3000',
      'account',
      accountId,
      'policies'
    ].join('/')
    let data = await axios.get(url)
    let policies = []
    let error = false
    if (typeof data.data == 'string'){
      error = data.data
      // use fake data for now
      policies = [
        {
          vehicles: [
            {
              make: 'Tesla',
              model: 'Model 3',
              year: '2019',
              vin: 'TSLA29SK3929',
            }
          ]
        }
      ]
    } else if (data.data.policies) {
        policies = data.data.policies
    } else {
        // ? what else could there be with axios
    }
    // console.log(policies)
    this.setState({
      policies,
      error
    })
  }
}

export default Policies
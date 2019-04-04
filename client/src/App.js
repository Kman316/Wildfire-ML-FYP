import React, { Component } from 'react';
import './App.css';
import ReactMapboxGL, {Layer, Feature, ScaleControl, ZoomControl, RotationControl} from "react-mapbox-gl";
import mapboxgl, {GeolocateControl}from "mapbox-gl";


    const Map = ReactMapboxGL({
    accessToken: "pk.eyJ1IjoiY2F0aGFsLWtlbm5lYWxseSIsImEiOiJjanJ4bnE5MDgwa2o3NDRvY2E3aHJ5ZmQ2In0.D4WhDCGxN15O4UNat9M8lQ"
    });


class App extends Component {
    state = {
        data: null
    };

    componentDidMount() {
        // Call our fetch function below once the component mounts
        this.callBackendAPI()
            .then(res => this.setState({ data: res.express }))
            .catch(err => console.log(err));
    }

    // Fetches our GET route from the Express server.
    // (Note the route we are fetching matches the GET route from server.js
    callBackendAPI = async () => {
        const response = await fetch('/express_backend');
        const body = await response.json();

        if (response.status !== 200) {
            throw Error(body.message)
        }
        return body;
    };

    render() {
    return (
      <div className="App">
          <Map className="mapboxgl-canvas"
              center={[-8.9226765, 52.1772531]}
               zoom={[10]}
              style="mapbox://styles/mapbox/streets-v11"
              containerStyle={{
                  height: "100vh",
                  width: "100vw",
                  left: 0
              }}>
              <ScaleControl />
              <ZoomControl />
              <RotationControl style={{ top: 80 }} />
              <Layer
                  type="symbol"
                  id="marker"
                  layout={{ "icon-image": "marker-15" }}>
                  <Feature coordinates={[-8.9226765, 52.1772531]}/>
              </Layer>
              <GeolocateControl/>
          </Map>
          <p className="App-intro">{this.state.data}</p>
      </div>
    );
  }
}

export default App;

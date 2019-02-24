import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import ReactMapboxGL, {Layer, Feature, ScaleControl, ZoomControl, RotationControl} from "react-mapbox-gl";

    const Map = ReactMapboxGL({
    accessToken: "pk.eyJ1IjoiY2F0aGFsLWtlbm5lYWxseSIsImEiOiJjanJ4bnE5MDgwa2o3NDRvY2E3aHJ5ZmQ2In0.D4WhDCGxN15O4UNat9M8lQ"
});
class App extends Component {

    render() {
    return (
      <div className="App">
          <Map className="mapboxgl-canvas"
              center={[-8.9226765, 52.1772531]}
               zoom={[11]}
              style="mapbox://styles/mapbox/streets-v9"
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
          </Map>
      </div>
    );
  }
}

export default App;

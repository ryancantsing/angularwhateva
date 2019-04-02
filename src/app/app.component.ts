import { Component, OnInit } from '@angular/core';
import { HttpServiceService } from './http-service.service'
import theStates from './fifty-states.json'
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'angularWhatever';
  locations = {address: "", city: "", fax: "", state: "", zip: ""}
  hours = {
           monOpenTime: "",
           monCloseTime: "",
           tueOpenTime: "",
           tueCloseTime: "",
           wedOpenTime: "",
           wedCloseTime: "",
           thuOpenTime: "",
           thuCloseTime: "",
           friOpenTime: "",
           friCloseTime: "",
           satOpenTime: "",
           satCloseTime: "",
           sunOpenTime: "",
           sunCloseTime: ""
          }
  states = {}
  defaultState = "";
  default = {
    setAction: false,
    favoriteState: ""
  }
  constructor(private _httpService: HttpServiceService){ }
  ngOnInit(){
    this.states = theStates
    if(localStorage.getItem('favorite')){
      this.default = JSON.parse(localStorage.getItem('favorite'))
    }
    if(this.default.setAction == true){
      this.initialLocations(this.default.favoriteState)
      this.defaultState = this.default.favoriteState
    } else {
      this.defaultState = ""
      this.getThatLocationBabyy();
    }
  }
  getThatLocationBabyy(){
    console.log("It begins!");
    if(window.navigator && window.navigator.geolocation){
      window.navigator.geolocation.getCurrentPosition(
        position => {
          console.log(position);
          let lat = position.coords.latitude;
          let lon = position.coords.longitude;
          let key = "AIzaSyCK6kVHc-fqJe6QMyJbsXzL89cMVspTzhk"
          let obs = this._httpService.getLocation(lat, lon, key);
          obs.subscribe(data => {
            console.log("The data came back", data['results'][0]['address_components'][4]['short_name']);
            let state = data['results'][0]['address_components'][4]['short_name'];
            this.defaultState = state 
            this.initialLocations(state);
          });
        }
      )
    }
  }
  initialLocations(state){
    console.log("now getting state locations");
    let stateObs = this._httpService.getLocations(state);
    stateObs.subscribe(data => {
      console.log("Setting up state locations observable");
      this.locations = data['locations'];
      this.defaultState = state;
      this.hours = this.locations[0]
    })
  };
  newAddress(address){
    for(let location in this.locations){
      if(this.locations[location]['address'] === address){
        this.hours = this.locations[parseInt(location)]
      }
    }
    }
  favState(state){
    if(this.default.setAction){
      localStorage.removeItem('favorite')
    }
    if(this.default.favoriteState === state){
      localStorage.removeItem('favorite')
      return
    }
    this.default.setAction = true;
    this.default.favoriteState = state;
    this.defaultState = state;
    localStorage.setItem('favorite', JSON.stringify(this.default))
    console.log(this.default)
  }
  
}



import { Component, OnInit } from '@angular/core';
import { HttpServiceService } from './http-service.service'
import theStates from './fifty-states.json'
const moment = require('moment')
const tz = require('moment-timezone')

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'angularWhatever';
  locations = {timestamp: "", address: "", city: "", fax: "", state: "", zip: "", longitude: "", latitude: ""}
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
  open = "";

  constructor(private _httpService: HttpServiceService){ }
  ngOnInit(){
    // Get states, check local storage for favorite
    this.states = theStates
    if(localStorage.getItem('favorite')){
      this.default = JSON.parse(localStorage.getItem('favorite'))
    }
    if(this.default.setAction == true){
      this.initialLocations(this.default.favoriteState)
      this.defaultState = this.default.favoriteState
    } else {
      // If none in local storage go by location
      this.defaultState = ""
      this.getThatLocationBabyy();
    }
  }
  getThatLocationBabyy(){
    // Checks your location data
    if(window.navigator && window.navigator.geolocation){
      window.navigator.geolocation.getCurrentPosition(
        position => {
          let lat = position.coords.latitude;
          let lon = position.coords.longitude;
          let key = "AIzaSyCK6kVHc-fqJe6QMyJbsXzL89cMVspTzhk"
          let obs = this._httpService.getLocation(lat, lon, key);
          obs.subscribe(data => {
            let state = data['results'][0]['address_components'][4]['short_name'];
            this.defaultState = state
            // Once the location is found, grab the first location on the list 
            this.initialLocations(state);
          });
        }
      )
    }
  }
  initialLocations(state){
    // Grabs the first location on the locations list from the provided state abbreviation
    let stateObs = this._httpService.getLocations(state);
    stateObs.subscribe(data => {
      this.locations = data['locations'];
      this.defaultState = state;
      this.hours = this.locations[0]
      let zone = this.getTimeZone(this.locations[0].latitude, this.locations[0].longitude)
      let the_time = this.calculateTime(zone)
      this.checkIfOpen(this.hours, the_time)

    })
  };
  newAddress(address){
    // Whenever a new location is selected, it grabs the new hours and checks if open
    for(let location in this.locations){
      if(this.locations[location]['address'] === address){
        this.hours = this.locations[parseInt(location)]
        let zone = this.getTimeZone(this.locations[parseInt(location)].latitude, this.locations[parseInt(location)].longitude)
        let the_time = this.calculateTime(zone)
        this.checkIfOpen(this.hours, the_time)
      }
    }
    }
  favState(state){
    // Setting your favorite state in localstorage
    // Removes it if you do the same state twice
    // Removes and re adds if you choose a new one
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
  }
  getTimeZone(lat, lon){
    // Getting the time zone. It took me way too long to get this information together
    // Thanks goes out to the tz-lookup library (it's great!)
    var tzlookup = require('tz-lookup');
    let find_city = tzlookup(lat, lon)
    return find_city;

  }

  calculateTime(timezone){
    // Get your time zone and get the time within it
    const time = moment(Date.now())
    const city_time = time.tz(timezone).format('hh:mma ddd')
    return city_time
  }

  checkIfOpen(location, time){
    // Checking with the location's hours if the place is open
    // This is fairly large and likely can be pared down. What matters now is it works
    let open = time.substr(8, 3).toLowerCase() + "OpenTime"
    let close = time.substr(8, 3).toLowerCase() + "CloseTime"
    var open_time;
    var close_time;
    for (let hours of Object.entries(location)){
      if(hours[0] == open){
        open_time = hours[1]
      };
      if(hours[0] == close){
        close_time = hours[1]
      }
    }
    if (open_time === "" || close_time === ""){
      this.open = "No Hours!"
    }
    else if(time.substr(5, 2) === 'pm'){
      if(close_time.substr(0, 2).toLowerCase() === "cl"){
        this.open = "I'm Sorry, we're closed today!"
      }
      else if(parseInt(time.substr(0, 2)) > parseInt(close_time.substr(0,2)) && parseInt(time.substr(0, 2)) !== 12){
        this.open = "I'm Sorry, we're closed!"
      }
      else if(time.substr(0, 2) === close_time.substr(0, 2)){
        if(parseInt(time.substr(3, 2)) < parseInt(close_time.substr(3, 2))){
          this.open = "Come on in, we're open!"
        }
        else {
          this.open = "I'm Sorry, we're closed!"
        }
      }
      else if(time.substr(0, 2) === "12"){
        this.open = "Come on in, we're open!"
      }
      else {
        this.open = "Come on in, we're open!"
      }
    }
    else if(time.substr(5, 2) === 'am'){
      if(open_time.substr(0, 2).toLowerCase() === "cl"){
        this.open = "I'm Sorry, we're closed today!"
      }
      else if(parseInt(time.substr(0, 2)) < parseInt(open_time.substr(0, 2)) || time.substr(0, 2) === "12"){
        this.open = "I'm Sorry, we're closed, but we'll be open today at " + open_time.substr(0, 8)
      }
      else if(time.substr(0, 2) === open_time.substr(0, 2)){
        if(parseInt(time.substr(3, 2)) >= parseInt(close_time.substr(3, 2))){
          this.open = "Come on in, we're open!"
        }
        else {
          this.open = "I'm Sorry, we're closed, but we'll be open today at " + open_time.substr(0, 8)
        }
      }
      else {
        this.open = "Come on in, we're open!"
      }
  }  
}
}












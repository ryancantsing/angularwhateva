import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams} from '@angular/common/http'
@Injectable({
  providedIn: 'root'
})
export class HttpServiceService {

  constructor(private _http: HttpClient) {

  }
  getLocation(lat, lon, key){
    return this._http.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${key}`)
  }

  getLocations(state){
    let url = `http://files.baldwinf.com/branches/`
    let body = new HttpParams()
      .set('WEBSITE', "MI")
      .set('LOC_SEARCH_TYPE', '1')
      .set('CORP_CODE', '1')
      .set('SELECT_1', state);
    return this._http.post(url, body.toString(), {headers: new HttpHeaders()
        .set('content-type', 'application/x-www-form-urlencoded')
  })
}
}

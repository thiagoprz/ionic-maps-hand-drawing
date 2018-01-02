import {Component, ElementRef, NgZone} from '@angular/core';
import {IonicPage, NavController, NavParams, Platform} from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';

declare var google: any;

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage {

  /**
   * Map object
   */
  map: any;

  /**
   * Free hand drawing control
   * @type {boolean}
   */
  free_hand:boolean = false;

  /**
   * Polygon object
   */
  polygon: any;

  /**
   * Page constructor
   * @param navCtrl
   * @param platform
   * @param elementRef
   * @param zone
   * @param geolocation
   * @param navParams
   */
  constructor(public navCtrl: NavController,
              private platform: Platform,
              private elementRef: ElementRef,
              private zone: NgZone,
              private geolocation: Geolocation,
              public navParams: NavParams) {
  }

  /**
   * Page load
   */
  ionViewDidLoad() {
    this.platform.ready()
      .then(() => {
        this.geolocation.getCurrentPosition().then((resp) => {
          this.loadMap(resp.coords.latitude, resp.coords.longitude);
        }).catch((error) => {
          this.loadMap();
        });
      })
  }

  /**
   * Loading the map
   * @param latitude
   * @param longitude
   */
  loadMap(latitude:number = 0, longitude:number = 0) {
    this.map = new google.maps.Map(document.getElementById('map'), {
      zoom: 15,
      center: {lat: latitude, lng: longitude},
      disableDefaultUI: true
    });
    google.maps.event.addDomListener(document.getElementById('map'), 'mousedown', (e) => {
      if (!this.free_hand) {
        return;
      }
      this.map.setOptions({draggable: false});
      this.polygon = new google.maps.Polyline({map: this.map, clickable: false});

      let move = google.maps.event.addListener(this.map, 'mousemove', (e) => {
        this.polygon.getPath().push(e.latLng);
      });
      google.maps.event.addListenerOnce(this.map, 'mouseup', (e) => {
        google.maps.event.removeListener(move);
        let path = this.polygon.getPath();
        this.polygon.setMap(null);
        this.polygon = new google.maps.Polygon({map: this.map, path: path});
        this.map.setOptions({draggable: true});
        this.free_hand = false;
      });
    });
  }

  /**
   * Toggles the free hand tool
   */
  toggleFreeHand() {
    this.free_hand = !this.free_hand;
  }

  /**
   * Removes de polygon that has been drawn
   */
  removePolyline() {
    this.polygon.setMap(null);
    this.polygon = null;
  }

}

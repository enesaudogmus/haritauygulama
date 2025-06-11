import { Component, OnInit } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Draw from 'ol/interaction/Draw';
import { Feature } from 'ol';
import { Geometry, Point, LineString, Polygon, Circle as CircleGeom } from 'ol/geom';
import { fromLonLat } from 'ol/proj';
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Text from 'ol/style/Text';
import { HttpClient } from '@angular/common/http';
import { fromCircle } from 'ol/geom/Polygon';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [],   // modül yok, standalone component
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent implements OnInit {
  map!: Map;
  vectorSource = new VectorSource();

  vectorLayer = new VectorLayer({
    source: this.vectorSource,
    style: (feature) => {
      const name = feature.get('name') || '';
      return new Style({
        stroke: new Stroke({
          color: 'blue',
          width: 2
        }),
        fill: new Fill({
          color: 'rgba(0, 0, 255, 0.1)'
        }),
        text: new Text({
          text: name,
          font: '14px Calibri,sans-serif',
          fill: new Fill({ color: '#000' }),
          stroke: new Stroke({ color: '#fff', width: 3 }),
          overflow: true
        })
      });
    }
  });

  selectedDrawType: 'Point' | 'LineString' | 'Polygon' | 'Circle' = 'Polygon';
  drawInteraction!: Draw;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.map = new Map({
      target: 'map',
      layers: [
        new TileLayer({ source: new OSM() }),
        this.vectorLayer
      ],
      view: new View({
        center: fromLonLat([32.8597, 39.9334]),
        zoom: 6
      })
    });

    this.addDrawInteraction();
  }

  addDrawInteraction() {
    if (this.drawInteraction) {
      this.map.removeInteraction(this.drawInteraction);
    }

    this.drawInteraction = new Draw({
      source: this.vectorSource,
      type: this.selectedDrawType
    });

    this.drawInteraction.on('drawend', (event: any) => {
      const feature: Feature<Geometry> = event.feature;
      const name = prompt('Lütfen bu çizime bir isim verin:');
      if (name) {
        feature.set('name', name);

        const geometry = feature.getGeometry();
        if (!geometry) return;

        let geojson = null;

        if (geometry instanceof Point) {
          geojson = {
            type: 'Point',
            coordinates: geometry.getCoordinates()
          };
        } else if (geometry instanceof LineString) {
          geojson = {
            type: 'LineString',
            coordinates: geometry.getCoordinates()
          };
        } else if (geometry instanceof Polygon) {
          geojson = {
            type: 'Polygon',
            coordinates: geometry.getCoordinates()
          };
        } else if (geometry instanceof CircleGeom) {
          const polygon = fromCircle(geometry, 64);
          geojson = {
            type: 'Polygon',
            coordinates: polygon.getCoordinates()
          };
        }

        if (geojson) {
          const shapeData = {
            name: name,
            geometry: JSON.stringify(geojson)
          };

          this.http.post('http://127.0.0.1:5299/api/shape', shapeData).subscribe({

            next: (res) => console.log('Kayıt başarılı:', res),
            error: (err) => console.error('Kayıt hatası:', err)
          });

          console.log('Çizim Adı:', name);
          console.log('Koordinatlar:', geojson);
        }

        this.vectorSource.changed();
      }
    });

    this.map.addInteraction(this.drawInteraction);
  }

  changeDrawType(type: 'Point' | 'LineString' | 'Polygon' | 'Circle') {
    this.selectedDrawType = type;
    this.addDrawInteraction();
  }
}

let mapbox;
const angles = [];
let mouseAngle = 0,
  pieDelta = 0,
  hover = 0;

function preload() {
  loadJSON(url, loadJSONCallback);

  mapboxgl.accessToken =
    "pk.eyJ1IjoiaWduYWNpb2lnbGVzaWFzNDMiLCJhIjoiY2twN3h3dDdkMDQ0NjJ1bXV0OHNreWp1NyJ9.C1ii-nMNWdA8AIuwJ_1OZA";
  mapbox = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v11",
    zoom: 4, // starting zoom
    center: [-102.552784, 23.634501],
  });
  mapbox.addControl(new mapboxgl.NavigationControl());
}

function loadJSONCallback(covid) {
  const states = covid.State;
  const total =
    covid.deceased + covid.infected + covid.suspected + covid.negative;
  Object.entries(ALERTS).forEach((alert) => {
    const a = new Alert(
      `${alert[1].text}: ${covid[alert[0]].toLocaleString()}`,
      alert[1].color
    );
    a.renderAlert();
  });
  loadJSON("src/js/helpers/polygons.json", (data) =>
    loadPolygonsCallback(data, states)
  );

  angles.push({
    name: "Fallecidos",
    percentage: (covid.deceased / total) * 360,
    color: "#FFC234",
    value: covid.deceased.toLocaleString(),
  });
  angles.push({
    name: "Sospechosos",
    percentage: (covid.suspected / total) * 360,
    color: "#FF6384",
    value: covid.suspected.toLocaleString(),
  });
  angles.push({
    name: "Negativos",
    percentage: (covid.negative / total) * 360,
    color: "#36A2EB",
    value: covid.negative.toLocaleString(),
  });
  angles.push({
    name: "Infectados",
    percentage: (covid.infected / total) * 360,
    color: "#9C7AEB",
    value: covid.infected.toLocaleString(),
  });
}

function loadPolygonsCallback(data, covidData) {
  const mapTooltip = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
  });

  mapbox.on("load", function () {
    mapbox.addSource("mapPoints", {
      type: "geojson",
      data,
    });
    mapbox.addLayer({
      id: "urban-areas-fill",
      type: "fill",
      source: "mapPoints",
      layout: {},
      paint: {
        "fill-color": "#0E6EFD",
        "fill-opacity": 0.4,
      },
    });
    mapbox.on("mousemove", function (e) {
      const features = mapbox.queryRenderedFeatures(e?.point);
      features.forEach((f) => {
        if (f.properties.entidad_nombre) {
          mapbox.getCanvas().style.cursor = "pointer";
          const txt = `
          <p>
            <strong>
            ${f.properties.entidad_nombre}:
            </strong>
          </p>
          <p>
            Infectados: ${covidData[
              f.properties.entidad_nombre
            ]?.infected?.toLocaleString()}
          </p>
          <p>
          Fallecidos: ${covidData[
            f.properties.entidad_nombre
          ]?.deceased?.toLocaleString()}
          </p>
          `;
          mapTooltip.setLngLat(e.lngLat).setHTML(txt).addTo(mapbox);
        }
      });
    });
    mapbox.on("mouseout", function () {
      mapTooltip.remove();
    });
  });
}

function setup() {
  const canvasParent = document.getElementById("chart");

  const canvas = createCanvas(canvasParent.offsetWidth, 400);
  canvas.parent("chart");

  noStroke();
}

function draw() {
  clear();
  pieChart(300);
}

function pieChart(diameter) {
  let lastAngle = 0;
  let y = 20;
  angles.forEach((angle) => {
    let dx = 0;
    let dy = 0;
    fill(angle.color);
    const angleStart = lastAngle;
    const angleEnd = lastAngle + radians(angle.percentage);
    if (mouseAngle >= angleStart && mouseAngle < angleEnd) {
      dx = Math.cos((angleStart + angleEnd) / 2) * 10;
      dy = Math.sin((angleStart + angleEnd) / 2) * 10;
      text(angle.value, width / 2 - 20, height - 20);
    }
    arc(
      width / 2 + dx,
      height / 2 + dy,
      diameter,
      diameter,
      angleStart,
      angleEnd,
      PIE
    );
    rect(30, y, 20, 20);
    push();
    fill(0);
    text(angle.name, 60, y + 15);
    pop();
    lastAngle += radians(angle.percentage);

    y += 40;
  });
}

function mouseMoved() {
  mouseAngle =
    Math.PI / 2 - Math.atan((width / 2 - mouseX) / (height / 2 - mouseY));
  if (mouseY < height / 2) mouseAngle = mouseAngle + Math.PI;
}

class Alert {
  constructor(text, color) {
    this.text = text;
    this.color = color;
    this.parentDiv = document.getElementById("alerts");
  }

  renderAlert() {
    const alert = `
    <div class="alert alert-${this.color}" role="alert">
        ${this.text}
    </div>`;

    this.parentDiv.innerHTML += alert;
  }
}

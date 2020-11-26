class Fruta {
  getModel(position) {
    this.position = [Math.random() * 10, Math.random() * 10, 0];
    this.model = mat4.translate([], mat4.create(), this.position);
    return new Float32Array(this.model);
  }
  constructor(position) {
    this.position = position;
    this.model = mat4.translate([], mat4.create(), this.position);
    this.parent = parent;
  }
}

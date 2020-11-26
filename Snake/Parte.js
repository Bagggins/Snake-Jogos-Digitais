class Parte {
  getModel(position) {
    this.position = [position[0], position[1], 0];
    this.model = mat4.translate([], mat4.create(), this.position);
    return new Float32Array(this.model);
  }
  constructor(position, parent) {
    this.position = position;
    this.model = mat4.translate([], mat4.create(), this.position);
    this.parent = parent;
  }
}
